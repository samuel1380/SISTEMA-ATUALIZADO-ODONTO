import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Veiculo } from '../domain/veiculo.entity';
import { Abastecimento } from '../domain/abastecimento.entity';
import { ConfiguracaoKm } from '../domain/configuracao-km.entity';
import { PagamentoKm } from '../domain/pagamento-km.entity';
import { FinanceiroService } from './financeiro.service';
import { TipoLancamento } from '../domain/tipo-lancamento.enum';
import { MeioPagamento } from '../domain/parcela.entity';

export interface CreateVeiculoDto {
  nome: string;
}

export interface CreateAbastecimentoDto {
  idVeiculo: number;
  dataAbastecimento: string;
  litros: number;
  valorLitro: number;
  quilometragem?: number;
  local?: string;
  observacoes?: string;
}

export interface CreatePagamentoKmDto {
  nomePessoa: string;
  quantidadeKm: number;
  dataPagamento: string;
  observacoes?: string;
  idCategoria?: number;
  idConta?: number;
  meioPagamento?: string;
}

export interface UpdateConfiguracaoKmDto {
  valorPorKm: number;
}

@Injectable()
export class CombustivelService {
  constructor(
    @InjectRepository(Veiculo)
    private readonly veiculoRepository: Repository<Veiculo>,
    @InjectRepository(Abastecimento)
    private readonly abastecimentoRepository: Repository<Abastecimento>,
    @InjectRepository(ConfiguracaoKm)
    private readonly configuracaoKmRepository: Repository<ConfiguracaoKm>,
    @InjectRepository(PagamentoKm)
    private readonly pagamentoKmRepository: Repository<PagamentoKm>,
    private readonly financeiroService: FinanceiroService,
  ) {}

  // =================================================================
  // GESTÃO DE VEÍCULOS
  // =================================================================

  async criarVeiculo(dto: CreateVeiculoDto): Promise<Veiculo> {
    const veiculo = this.veiculoRepository.create(dto);
    return this.veiculoRepository.save(veiculo);
  }

  async listarVeiculos(): Promise<Veiculo[]> {
    const where: any = { ativo: true };
    return this.veiculoRepository.find({ where, order: { nome: 'ASC' } });
  }

  async buscarVeiculoPorId(idVeiculo: number): Promise<Veiculo> {
    const veiculo = await this.veiculoRepository.findOneBy({ idVeiculo });
    if (!veiculo) {
      throw new NotFoundException(`Veículo com ID ${idVeiculo} não encontrado.`);
    }
    return veiculo;
  }

  async atualizarVeiculo(idVeiculo: number, dto: Partial<CreateVeiculoDto>): Promise<Veiculo> {
    const veiculo = await this.buscarVeiculoPorId(idVeiculo);
    Object.assign(veiculo, dto);
    return this.veiculoRepository.save(veiculo);
  }

  async excluirVeiculo(idVeiculo: number): Promise<void> {
    const veiculo = await this.buscarVeiculoPorId(idVeiculo);
    veiculo.ativo = false;
    await this.veiculoRepository.save(veiculo);
  }

  // =================================================================
  // GESTÃO DE ABASTECIMENTOS
  // =================================================================

  async registrarAbastecimento(dto: CreateAbastecimentoDto): Promise<Abastecimento> {
    const veiculo = await this.buscarVeiculoPorId(dto.idVeiculo);

    const valorTotal = dto.litros * dto.valorLitro;

    // Criar registro de abastecimento sem lançar no financeiro
    const abastecimento = this.abastecimentoRepository.create({
      idVeiculo: dto.idVeiculo,
      idLancamento: null, // Removido lançamento financeiro a pedido do usuário
      dataAbastecimento: new Date(dto.dataAbastecimento),
      litros: dto.litros,
      valorLitro: dto.valorLitro,
      valorTotal,
      quilometragem: dto.quilometragem,
      local: dto.local,
      observacoes: dto.observacoes,
    });

    return this.abastecimentoRepository.save(abastecimento);
  }

  async listarAbastecimentos(idVeiculo?: number, dataInicio?: string, dataFim?: string): Promise<Abastecimento[]> {
    const queryBuilder = this.abastecimentoRepository
      .createQueryBuilder('abastecimento')
      .leftJoinAndSelect('abastecimento.veiculo', 'veiculo')
      .orderBy('abastecimento.dataAbastecimento', 'DESC');

    if (idVeiculo) {
      queryBuilder.where('abastecimento.idVeiculo = :idVeiculo', { idVeiculo });
    }

    if (dataInicio) {
      queryBuilder.andWhere('abastecimento.dataAbastecimento >= :dataInicio', { dataInicio });
    }

    if (dataFim) {
      queryBuilder.andWhere('abastecimento.dataAbastecimento <= :dataFim', { dataFim });
    }

    return queryBuilder.getMany();
  }

  async calcularConsumo(idVeiculo: number, dataInicio?: string, dataFim?: string): Promise<{
    consumoMedio: number;
    totalLitros: number;
    totalGasto: number;
    totalKm?: number;
  }> {
    const abastecimentos = await this.listarAbastecimentos(idVeiculo, dataInicio, dataFim);

    if (abastecimentos.length < 2) {
      return {
        consumoMedio: 0,
        totalLitros: 0,
        totalGasto: 0,
      };
    }

    const totalLitros = abastecimentos.reduce((acc, a) => acc + Number(a.litros), 0);
    const totalGasto = abastecimentos.reduce((acc, a) => acc + Number(a.valorTotal), 0);

    // Calcular consumo médio baseado na quilometragem
    const abastecimentosComKm = abastecimentos.filter((a) => a.quilometragem);
    if (abastecimentosComKm.length >= 2) {
      const kmInicial = abastecimentosComKm[abastecimentosComKm.length - 1].quilometragem || 0;
      const kmFinal = abastecimentosComKm[0].quilometragem || 0;
      const totalKm = kmFinal - kmInicial;
      const consumoMedio = totalKm > 0 ? totalKm / totalLitros : 0;

      return {
        consumoMedio: Math.round(consumoMedio * 100) / 100,
        totalLitros,
        totalGasto,
        totalKm,
      };
    }

    return {
      consumoMedio: 0,
      totalLitros,
      totalGasto,
    };
  }

  // =================================================================
  // GESTÃO DE CONFIGURAÇÃO DE KM
  // =================================================================

  async obterConfiguracaoKm(): Promise<ConfiguracaoKm | null> {
    const configs = await this.configuracaoKmRepository.find({
      order: { dataAlteracao: 'DESC' },
      take: 1,
    });
    return configs.length > 0 ? configs[0] : null;
  }

  async atualizarConfiguracaoKm(dto: UpdateConfiguracaoKmDto): Promise<ConfiguracaoKm> {
    let config = await this.obterConfiguracaoKm();
    
    if (!config) {
      config = this.configuracaoKmRepository.create({
        valorPorKm: dto.valorPorKm,
      });
    } else {
      config.valorPorKm = dto.valorPorKm;
    }

    return this.configuracaoKmRepository.save(config);
  }

  // =================================================================
  // GESTÃO DE PAGAMENTOS DE KM
  // =================================================================

  async registrarPagamentoKm(dto: CreatePagamentoKmDto): Promise<PagamentoKm> {
    // Obter valor por KM da configuração
    const config = await this.obterConfiguracaoKm();
    if (!config) {
      throw new BadRequestException('Configuração de valor por KM não encontrada. Configure o valor por KM antes de registrar pagamentos.');
    }

    const valorPorKm = Number(config.valorPorKm);
    const quantidadeKm = Number(dto.quantidadeKm);
    const valorTotal = valorPorKm * quantidadeKm;

    // Criar lançamento financeiro (DESPESA)
    const dataCompetencia = new Date(dto.dataPagamento);
    const dataVencimento = new Date(dto.dataPagamento);

    const lancamento = await this.financeiroService.criarLancamento({
      descricao: `Pagamento por KM rodado - ${dto.nomePessoa} (${quantidadeKm} km)`,
      tipo: TipoLancamento.DESPESA,
      valorTotal,
      dataCompetencia: dataCompetencia.toISOString().split('T')[0],
      idCategoria: dto.idCategoria,
      parcelas: [
        {
          numeroParcela: 1,
          valor: valorTotal,
          dataVencimento: dataVencimento.toISOString().split('T')[0],
          meioPagamento: (dto.meioPagamento as MeioPagamento) || MeioPagamento.DINHEIRO,
        },
      ],
      pagamentoImediato: dto.idConta
        ? {
            idConta: dto.idConta,
            dataPagamento: dto.dataPagamento,
          }
        : undefined,
    });

    // Criar registro de pagamento de KM
    const pagamentoKm = this.pagamentoKmRepository.create({
      nomePessoa: dto.nomePessoa,
      quantidadeKm: quantidadeKm,
      valorPorKm: valorPorKm,
      valorTotal,
      dataPagamento: new Date(dto.dataPagamento),
      idLancamento: lancamento.idLancamento,
      observacoes: dto.observacoes,
    });

    return this.pagamentoKmRepository.save(pagamentoKm);
  }

  async listarPagamentosKm(dataInicio?: string, dataFim?: string): Promise<PagamentoKm[]> {
    const queryBuilder = this.pagamentoKmRepository
      .createQueryBuilder('pagamentoKm')
      .orderBy('pagamentoKm.dataPagamento', 'DESC');

    if (dataInicio) {
      queryBuilder.andWhere('pagamentoKm.dataPagamento >= :dataInicio', { dataInicio });
    }

    if (dataFim) {
      queryBuilder.andWhere('pagamentoKm.dataPagamento <= :dataFim', { dataFim });
    }

    return queryBuilder.getMany();
  }

  async buscarPagamentoKmPorId(idPagamentoKm: number): Promise<PagamentoKm> {
    const pagamento = await this.pagamentoKmRepository.findOneBy({ idPagamentoKm });
    if (!pagamento) {
      throw new NotFoundException(`Pagamento de KM com ID ${idPagamentoKm} não encontrado.`);
    }
    return pagamento;
  }
}


import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FornecedorLogistica, TipoFornecedorLogistica } from '../domain/fornecedor-logistica.entity';
import { Entrega, StatusEntrega } from '../domain/entrega.entity';
import { FinanceiroService } from './financeiro.service';
import { TipoLancamento } from '../domain/tipo-lancamento.enum';
import { MeioPagamento } from '../domain/parcela.entity';

export interface CreateFornecedorLogisticaDto {
  nome: string;
  tipo: TipoFornecedorLogistica;
  contato?: string;
  telefone?: string;
  email?: string;
  idEmpresa?: number;
}

export interface CreateEntregaDto {
  idFornecedorLogistica: number;
  dataEntrega: string;
  origem: string;
  destino: string;
  peso?: number;
  valorFrete: number;
  observacoes?: string;
  idCategoria?: number;
  idConta?: number;
  meioPagamento?: string;
}

@Injectable()
export class LogisticaService {
  constructor(
    @InjectRepository(FornecedorLogistica)
    private readonly fornecedorRepository: Repository<FornecedorLogistica>,
    @InjectRepository(Entrega)
    private readonly entregaRepository: Repository<Entrega>,
    private readonly financeiroService: FinanceiroService,
  ) {}

  // =================================================================
  // GESTÃO DE FORNECEDORES DE LOGÍSTICA
  // =================================================================

  async criarFornecedor(dto: CreateFornecedorLogisticaDto): Promise<FornecedorLogistica> {
    const fornecedor = this.fornecedorRepository.create(dto);
    return this.fornecedorRepository.save(fornecedor);
  }

  async listarFornecedores(idEmpresa?: number): Promise<FornecedorLogistica[]> {
    const where: any = { ativo: true };
    if (idEmpresa) {
      where.idEmpresa = idEmpresa;
    }
    return this.fornecedorRepository.find({ where, order: { nome: 'ASC' } });
  }

  async buscarFornecedorPorId(idFornecedorLogistica: number): Promise<FornecedorLogistica> {
    const fornecedor = await this.fornecedorRepository.findOneBy({ idFornecedorLogistica });
    if (!fornecedor) {
      throw new NotFoundException(`Fornecedor de logística com ID ${idFornecedorLogistica} não encontrado.`);
    }
    return fornecedor;
  }

  async atualizarFornecedor(
    idFornecedorLogistica: number,
    dto: Partial<CreateFornecedorLogisticaDto>,
  ): Promise<FornecedorLogistica> {
    const fornecedor = await this.buscarFornecedorPorId(idFornecedorLogistica);
    Object.assign(fornecedor, dto);
    return this.fornecedorRepository.save(fornecedor);
  }

  async excluirFornecedor(idFornecedorLogistica: number): Promise<void> {
    const fornecedor = await this.buscarFornecedorPorId(idFornecedorLogistica);
    fornecedor.ativo = false;
    await this.fornecedorRepository.save(fornecedor);
  }

  // =================================================================
  // GESTÃO DE ENTREGAS
  // =================================================================

  async registrarEntrega(dto: CreateEntregaDto): Promise<Entrega> {
    const fornecedor = await this.buscarFornecedorPorId(dto.idFornecedorLogistica);

    // Criar lançamento financeiro
    const dataCompetencia = new Date(dto.dataEntrega);
    const dataVencimento = new Date(dto.dataEntrega);

    const lancamento = await this.financeiroService.criarLancamento({
      descricao: `Frete - ${fornecedor.nome} (${dto.origem} → ${dto.destino})`,
      tipo: TipoLancamento.DESPESA,
      valorTotal: dto.valorFrete,
      dataCompetencia: dataCompetencia.toISOString().split('T')[0],
      idCategoria: dto.idCategoria,
      parcelas: [
        {
          numeroParcela: 1,
          valor: dto.valorFrete,
          dataVencimento: dataVencimento.toISOString().split('T')[0],
          meioPagamento: (dto.meioPagamento as MeioPagamento) || MeioPagamento.TRANSFERENCIA,
        },
      ],
      pagamentoImediato: dto.idConta
        ? {
            idConta: dto.idConta,
            dataPagamento: dto.dataEntrega,
          }
        : undefined,
    });

    // Criar registro de entrega
    const entrega = this.entregaRepository.create({
      idFornecedorLogistica: dto.idFornecedorLogistica,
      idLancamento: lancamento.idLancamento,
      dataEntrega: new Date(dto.dataEntrega),
      origem: dto.origem,
      destino: dto.destino,
      peso: dto.peso,
      valorFrete: dto.valorFrete,
      status: StatusEntrega.PENDENTE,
      observacoes: dto.observacoes,
    });

    return this.entregaRepository.save(entrega);
  }

  async listarEntregas(
    idFornecedorLogistica?: number,
    dataInicio?: string,
    dataFim?: string,
    status?: StatusEntrega,
  ): Promise<Entrega[]> {
    const queryBuilder = this.entregaRepository
      .createQueryBuilder('entrega')
      .leftJoinAndSelect('entrega.fornecedorLogistica', 'fornecedor')
      .orderBy('entrega.dataEntrega', 'DESC');

    if (idFornecedorLogistica) {
      queryBuilder.where('entrega.idFornecedorLogistica = :idFornecedorLogistica', { idFornecedorLogistica });
    }

    if (dataInicio) {
      queryBuilder.andWhere('entrega.dataEntrega >= :dataInicio', { dataInicio });
    }

    if (dataFim) {
      queryBuilder.andWhere('entrega.dataEntrega <= :dataFim', { dataFim });
    }

    if (status) {
      queryBuilder.andWhere('entrega.status = :status', { status });
    }

    return queryBuilder.getMany();
  }

  async atualizarStatusEntrega(idEntrega: number, status: StatusEntrega): Promise<Entrega> {
    const entrega = await this.entregaRepository.findOneBy({ idEntrega });
    if (!entrega) {
      throw new NotFoundException(`Entrega com ID ${idEntrega} não encontrada.`);
    }

    entrega.status = status;
    return this.entregaRepository.save(entrega);
  }
}


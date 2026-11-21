import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Parcela, StatusParcela } from '../domain/parcela.entity';
import { Lancamento } from '../domain/lancamento.entity';
import { TipoLancamento } from '../domain/tipo-lancamento.enum';

export interface BoletoAtrasado {
  idParcela: number;
  idLancamento: number;
  descricao: string;
  tipo: TipoLancamento;
  valor: number;
  valorPago: number;
  valorRestante: number;
  dataVencimento: Date;
  diasAtraso: number;
  numeroBoleto?: string;
  codigoBarras?: string;
  juros?: number;
  multa?: number;
  valorTotalComJuros?: number;
  gerarJuros?: boolean;
  nomeEmpresa?: string;
}

@Injectable()
export class BoletoAtrasadoService {
  private readonly logger = new Logger(BoletoAtrasadoService.name);

  constructor(
    @InjectRepository(Parcela)
    private readonly parcelaRepository: Repository<Parcela>,
    @InjectRepository(Lancamento)
    private readonly lancamentoRepository: Repository<Lancamento>,
  ) {}

  /**
   * Lista todas as parcelas vencidas (boletos atrasados)
   */
  async listarBoletosAtrasados(idEmpresa?: number, tipo?: TipoLancamento): Promise<BoletoAtrasado[]> {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const queryBuilder = this.parcelaRepository
      .createQueryBuilder('parcela')
      .innerJoinAndSelect('parcela.lancamento', 'lancamento')
      .leftJoinAndSelect('lancamento.clienteEmpresa', 'clienteEmpresa')
      .leftJoinAndSelect('lancamento.fornecedor', 'fornecedor')
      .where('parcela.status IN (:...statuses)', {
        statuses: [StatusParcela.ABERTO, StatusParcela.VENCIDO],
      })
      .andWhere('parcela.dataVencimento < :hoje', { hoje })
      .andWhere('parcela.valorPago < parcela.valor');

    if (idEmpresa) {
      // Assumindo que há um campo idEmpresa no Lancamento ou relacionamento
      queryBuilder.andWhere('lancamento.idClienteFornecedor = :idEmpresa', { idEmpresa });
    }

    if (tipo) {
      queryBuilder.andWhere('lancamento.tipo = :tipo', { tipo });
    }

    const parcelas = await queryBuilder.getMany();

    return parcelas.map((parcela) => {
      const diasAtraso = this.calcularDiasAtraso(parcela.dataVencimento);
      const valorRestante = Number(parcela.valor) - Number(parcela.valorPago);
      const { juros, multa } = this.calcularJurosMulta(parcela, diasAtraso);
      const valorTotalComJuros = valorRestante + juros + multa;

      return {
        idParcela: parcela.idParcela,
        idLancamento: parcela.idLancamento,
        descricao: parcela.lancamento.descricao,
        tipo: parcela.lancamento.tipo,
        valor: Number(parcela.valor),
        valorPago: Number(parcela.valorPago),
        valorRestante,
        dataVencimento: parcela.dataVencimento,
        diasAtraso,
        numeroBoleto: parcela.numeroBoleto,
        codigoBarras: parcela.codigoBarras,
        juros,
        multa,
        valorTotalComJuros,
        gerarJuros: parcela.gerarJuros !== false, // Default true
        nomeEmpresa: parcela.lancamento.tipo === TipoLancamento.RECEITA
          ? parcela.lancamento.clienteEmpresa?.nome
          : (parcela.lancamento.fornecedor?.nomeFantasia || parcela.lancamento.fornecedor?.razaoSocial),
      };
    });
  }

  /**
   * Calcula dias de atraso de uma parcela
   */
  calcularDiasAtraso(dataVencimento: Date): number {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const vencimento = new Date(dataVencimento);
    vencimento.setHours(0, 0, 0, 0);
    const diffTime = hoje.getTime() - vencimento.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  }

  /**
   * Calcula juros e multa de uma parcela atrasada
   * Regras padrão: 1% de multa + 0.033% de juros ao dia
   * Se gerarJuros for false, retorna juros e multa zerados
   */
  calcularJurosMulta(parcela: Parcela, diasAtraso: number): { juros: number; multa: number } {
    if (diasAtraso <= 0) {
      return { juros: 0, multa: 0 };
    }

    // Se a parcela não deve gerar juros, retorna zero
    if (parcela.gerarJuros === false) {
      return { juros: 0, multa: 0 };
    }

    const valorRestante = Number(parcela.valor) - Number(parcela.valorPago);
    const multaPercentual = 0.01; // 1%
    const jurosDiarioPercentual = 0.00033; // 0.033% ao dia

    const multa = valorRestante * multaPercentual;
    const juros = valorRestante * jurosDiarioPercentual * diasAtraso;

    return {
      juros: Math.round(juros * 100) / 100,
      multa: Math.round(multa * 100) / 100,
    };
  }

  /**
   * Atualiza o status de parcelas vencidas
   * Executado diariamente às 00:00
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async atualizarStatusVencidos(): Promise<void> {
    this.logger.log('Iniciando atualização de status de parcelas vencidas...');
    
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const parcelasVencidas = await this.parcelaRepository.find({
      where: {
        status: StatusParcela.ABERTO,
        dataVencimento: LessThan(hoje),
      },
    });

    let atualizadas = 0;
    for (const parcela of parcelasVencidas) {
      parcela.status = StatusParcela.VENCIDO;
      await this.parcelaRepository.save(parcela);
      atualizadas++;
    }

    this.logger.log(`Atualização concluída. ${atualizadas} parcela(s) marcada(s) como vencida(s).`);
  }

  /**
   * Obtém resumo de um boleto atrasado específico
   */
  async obterResumoBoleto(idParcela: number): Promise<BoletoAtrasado> {
    const parcela = await this.parcelaRepository.findOne({
      where: { idParcela },
      relations: ['lancamento', 'lancamento.clienteEmpresa', 'lancamento.fornecedor'],
    });

    if (!parcela) {
      throw new Error(`Parcela com ID ${idParcela} não encontrada.`);
    }

    const diasAtraso = this.calcularDiasAtraso(parcela.dataVencimento);
    const valorRestante = Number(parcela.valor) - Number(parcela.valorPago);
    const { juros, multa } = this.calcularJurosMulta(parcela, diasAtraso);
    const valorTotalComJuros = valorRestante + juros + multa;

    return {
      idParcela: parcela.idParcela,
      idLancamento: parcela.idLancamento,
      descricao: parcela.lancamento.descricao,
      tipo: parcela.lancamento.tipo,
      valor: Number(parcela.valor),
      valorPago: Number(parcela.valorPago),
      valorRestante,
      dataVencimento: parcela.dataVencimento,
      diasAtraso,
      numeroBoleto: parcela.numeroBoleto,
      codigoBarras: parcela.codigoBarras,
      juros,
      multa,
      valorTotalComJuros,
      gerarJuros: parcela.gerarJuros !== false, // Default true
      nomeEmpresa: parcela.lancamento.tipo === TipoLancamento.RECEITA
        ? parcela.lancamento.clienteEmpresa?.nome
        : (parcela.lancamento.fornecedor?.nomeFantasia || parcela.lancamento.fornecedor?.razaoSocial),
    };
  }
}


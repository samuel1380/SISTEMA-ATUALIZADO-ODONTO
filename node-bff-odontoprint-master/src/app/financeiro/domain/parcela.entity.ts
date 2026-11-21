import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToOne } from 'typeorm';
import { Lancamento } from './lancamento.entity';
import { Movimentacao } from './movimentacao.entity';


export enum MeioPagamento {
  DINHEIRO = 'DINHEIRO',
  CARTAO_CREDITO = 'CARTAO_CREDITO',
  CARTAO_DEBITO = 'CARTAO_DEBITO',
  CHEQUE = 'CHEQUE',
  BOLETO = 'BOLETO',
  TRANSFERENCIA = 'TRANSFERENCIA',
  PIX = 'PIX',
  CREDITO_INTERNO = 'CREDITO_INTERNO',
}

export enum StatusParcela {
  ABERTO = 'ABERTO',
  PAGO = 'PAGO',
  VENCIDO = 'VENCIDO',
  CANCELADO = 'CANCELADO',
}

@Entity('TbFinanceiroParcela')
export class Parcela {
  @PrimaryGeneratedColumn()
  idParcela: number;

  @ManyToOne(() => Lancamento, lancamento => lancamento.parcelas)
  @JoinColumn({ name: 'idLancamento' })
  lancamento: Lancamento;

  @Column()
  idLancamento: number;

  @Column()
  numeroParcela: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  valor: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0.00 })
  valorPago: number;

  /** Soma dos acréscimos (juros/multa) registrados nos recebimentos desta parcela (contas a receber). */
  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  valorAcrescimoAcumulado: number;

  @Column({ type: 'date' })
  dataVencimento: Date;

  @Column({ type: 'date', nullable: true })
  dataPagamento?: Date;

  @Column({ type: 'enum', enum: StatusParcela, default: StatusParcela.ABERTO })
  status: StatusParcela;

  @Column({ type: 'enum', enum: MeioPagamento })
  meioPagamento: MeioPagamento;

  // Campo JSON para armazenar dados específicos do meio de pagamento
  @Column({ type: 'json', nullable: true })
  dadosAdicionais?: {
    numeroCheque?: string;
    idTransacaoCartao?: string;
  };

  // Campos para boletos
  @Column({ length: 50, nullable: true })
  numeroBoleto?: string;

  @Column({ length: 100, nullable: true })
  codigoBarras?: string;

  // Campo para controlar se a parcela gera juros ao atrasar
  @Column({ type: 'boolean', default: true })
  gerarJuros: boolean;

  // Campo calculado para dias de atraso (não persistido, calculado em runtime)
  // Será calculado no service quando necessário

  @OneToOne(() => Movimentacao, { nullable: true })
  @JoinColumn({ name: 'idMovimentacao' })
  movimentacao?: Movimentacao;
}

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Conta } from './conta.entity';

export enum TipoMovimentacao {
  CREDITO = 'CREDITO', // Entrada
  DEBITO = 'DEBITO',   // Saída
  CREDITO_INTERNO = 'CREDITO_INTERNO',   // Saída
}

@Entity('TbFinanceiroMovimentacao')
export class Movimentacao {
  @PrimaryGeneratedColumn()
  idMovimentacao: number;

  @ManyToOne(() => Conta)
  @JoinColumn({ name: 'idConta' })
  conta: Conta;

  @Column()
  idConta: number;

  @Column({ type: 'enum', enum: TipoMovimentacao })
  tipo: TipoMovimentacao;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  valor: number;

  /** Juros/multa em recebimentos; somado ao valor no efeito de caixa. */
  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  valorAcrescimo: number;

  @Column()
  descricao: string;

  @Column({ type: 'datetime' })
  dataMovimentacao: Date;

  // ID da parcela que originou a movimentação (se aplicável)
  @Column({ nullable: true })
  idParcelaOrigem?: number;

  // ID para agrupar as duas movimentações de uma transferência
  @Column({ nullable: true })
  idAgrupadorTransferencia?: string;
}


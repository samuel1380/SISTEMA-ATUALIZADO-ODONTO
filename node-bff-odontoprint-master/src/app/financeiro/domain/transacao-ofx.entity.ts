import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
} from 'typeorm';
import { Conta } from './conta.entity';
import { ArquivoOfx } from './arquivo-ofx.entity';
import { ConciliacaoTransacao } from './conciliacao-transacao.entity';

export enum TipoTransacaoOfx {
  CREDITO = 'CREDITO',
  DEBITO = 'DEBITO',
}

export enum StatusConciliacao {
  PENDENTE = 'PENDENTE',
  CONCILIADO = 'CONCILIADO',
  IGNORADO = 'IGNORADO',
}

@Entity('TbTransacaoOfx')
export class TransacaoOfx {
  @PrimaryGeneratedColumn()
  idTransacaoOfx: number;

  @Column()
  idConta: number;

  @ManyToOne(() => Conta)
  @JoinColumn({ name: 'idConta' })
  conta: Conta;

  @Column()
  idArquivoOfx: number;

  @ManyToOne(() => ArquivoOfx, (arquivo) => arquivo.transacoes)
  @JoinColumn({ name: 'idArquivoOfx' })
  arquivoOfx: ArquivoOfx;

  @Column({ length: 100 })
  fitId: string; // ID único da transação no OFX (FITID)

  @Column({ type: 'enum', enum: TipoTransacaoOfx })
  tipo: TipoTransacaoOfx;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  valor: number;

  @Column({ type: 'date' })
  dataTransacao: Date;

  @Column({ type: 'date', nullable: true })
  dataPostagem?: Date;

  @Column({ type: 'text', nullable: true })
  descricao?: string;

  @Column({ length: 50, nullable: true })
  numeroCheque?: string;

  @Column({ type: 'enum', enum: StatusConciliacao, default: StatusConciliacao.PENDENTE })
  statusConciliacao: StatusConciliacao;

  @Column({ type: 'datetime', nullable: true })
  dataConciliacao?: Date;

  @Column({ type: 'text', nullable: true })
  observacoes?: string;

  @OneToOne(() => ConciliacaoTransacao, (conciliacao) => conciliacao.transacaoOfx)
  conciliacao?: ConciliacaoTransacao;

  @CreateDateColumn()
  dataInclusao: Date;

  @UpdateDateColumn()
  dataAlteracao: Date;
}

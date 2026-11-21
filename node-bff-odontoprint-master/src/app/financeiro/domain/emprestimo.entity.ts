import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Lancamento } from './lancamento.entity';
import { Credor } from './credor.entity';

export enum TipoEmprestimo {
  RECEBIDO = 'RECEBIDO', // Empréstimo que a empresa recebeu
  CONCEDIDO = 'CONCEDIDO', // Empréstimo que a empresa concedeu
}

export enum StatusEmprestimo {
  ATIVO = 'ATIVO',
  QUITADO = 'QUITADO',
  CANCELADO = 'CANCELADO',
}

@Entity('TbEmprestimo')
export class Emprestimo {
  @PrimaryGeneratedColumn()
  idEmprestimo: number;

  @Column()
  idLancamento: number;

  @ManyToOne(() => Lancamento)
  @JoinColumn({ name: 'idLancamento' })
  lancamento: Lancamento;

  @Column({ type: 'enum', enum: TipoEmprestimo })
  tipo: TipoEmprestimo;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  valorPrincipal: number;

  /** Saldo devedor restante (empréstimos RECEBIDOS); abatido pelos pagamentos vinculados. */
  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  saldoRestante?: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  taxaJuros?: number; // Taxa de juros mensal (%)

  @Column({ type: 'date' })
  dataContratacao: Date;

  @Column({ type: 'date', nullable: true })
  dataVencimento?: Date;

  @Column({ type: 'enum', enum: StatusEmprestimo, default: StatusEmprestimo.ATIVO })
  status: StatusEmprestimo;

  @Column({ nullable: true })
  idCredorDevedor?: number; // ID do credor ou devedor

  @ManyToOne(() => Credor)
  @JoinColumn({ name: 'idCredorDevedor' })
  credor?: Credor;

  @Column({ type: 'text', nullable: true })
  observacoes?: string;

  @CreateDateColumn()
  dataInclusao: Date;

  @UpdateDateColumn()
  dataAlteracao: Date;
}


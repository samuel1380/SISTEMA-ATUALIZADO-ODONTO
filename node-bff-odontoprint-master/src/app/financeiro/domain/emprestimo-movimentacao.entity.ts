import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Emprestimo } from './emprestimo.entity';
import { Lancamento } from './lancamento.entity';

/** Pagamento/abatimento vinculado a um empréstimo (lançamento de despesa com saída de financiamento). */
/** Pagamento/abatimento vinculado a um empréstimo (lançamento de despesa com saída de financiamento). */
export enum TipoEmprestimoMovimentacao {
  JUROS = 'JUROS',
  PAGAMENTO = 'PAGAMENTO',
  ACRESCIMO = 'ACRESCIMO'
}

@Entity('TbEmprestimoMovimentacao')
export class EmprestimoMovimentacao {
  @PrimaryGeneratedColumn()
  idMovimentacao: number;

  @Column()
  idEmprestimo: number;

  @ManyToOne(() => Emprestimo, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'idEmprestimo' })
  emprestimo: Emprestimo;

  @Column({ unique: true, nullable: true })
  idLancamento: number;

  @ManyToOne(() => Lancamento)
  @JoinColumn({ name: 'idLancamento' })
  lancamento: Lancamento;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  valor: number;

  @Column({ type: 'date' })
  dataMovimentacao: Date;

  @Column({ type: 'enum', enum: TipoEmprestimoMovimentacao, default: TipoEmprestimoMovimentacao.PAGAMENTO })
  tipoMovimentacao: TipoEmprestimoMovimentacao;

  @Column({ type: 'varchar', length: 255, nullable: true })
  observacoes: string;

  @CreateDateColumn()
  dataInclusao: Date;
}

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { FornecedorLogistica } from './fornecedor-logistica.entity';
import { Lancamento } from './lancamento.entity';

export enum StatusEntrega {
  PENDENTE = 'PENDENTE',
  EM_TRANSITO = 'EM_TRANSITO',
  ENTREGUE = 'ENTREGUE',
  CANCELADA = 'CANCELADA',
}

@Entity('TbEntrega')
export class Entrega {
  @PrimaryGeneratedColumn()
  idEntrega: number;

  @Column({ nullable: true })
  idLancamento?: number;

  @ManyToOne(() => Lancamento, { nullable: true })
  @JoinColumn({ name: 'idLancamento' })
  lancamento?: Lancamento;

  @Column()
  idFornecedorLogistica: number;

  @ManyToOne(() => FornecedorLogistica)
  @JoinColumn({ name: 'idFornecedorLogistica' })
  fornecedorLogistica: FornecedorLogistica;

  @Column({ type: 'date' })
  dataEntrega: Date;

  @Column({ length: 255 })
  origem: string;

  @Column({ length: 255 })
  destino: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  peso?: number; // em kg

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  valorFrete: number;

  @Column({ type: 'enum', enum: StatusEntrega, default: StatusEntrega.PENDENTE })
  status: StatusEntrega;

  @Column({ type: 'text', nullable: true })
  observacoes?: string;

  @CreateDateColumn()
  dataInclusao: Date;

  @UpdateDateColumn()
  dataAlteracao: Date;
}


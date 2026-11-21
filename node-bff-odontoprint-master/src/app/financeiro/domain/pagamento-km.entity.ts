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

@Entity('TbPagamentoKm')
export class PagamentoKm {
  @PrimaryGeneratedColumn()
  idPagamentoKm: number;

  @Column({ length: 255 })
  nomePessoa: string;

  @Column({ type: 'int' })
  quantidadeKm: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  valorPorKm: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  valorTotal: number;

  @Column({ type: 'date' })
  dataPagamento: Date;

  @Column({ nullable: true })
  idLancamento?: number;

  @ManyToOne(() => Lancamento, { nullable: true })
  @JoinColumn({ name: 'idLancamento' })
  lancamento?: Lancamento;

  @Column({ type: 'text', nullable: true })
  observacoes?: string;

  @CreateDateColumn()
  dataInclusao: Date;

  @UpdateDateColumn()
  dataAlteracao: Date;
}


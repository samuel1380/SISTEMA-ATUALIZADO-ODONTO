import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Veiculo } from './veiculo.entity';
import { Lancamento } from './lancamento.entity';

@Entity('TbAbastecimento')
export class Abastecimento {
  @PrimaryGeneratedColumn()
  idAbastecimento: number;

  @Column()
  idVeiculo: number;

  @ManyToOne(() => Veiculo)
  @JoinColumn({ name: 'idVeiculo' })
  veiculo: Veiculo;

  @Column({ nullable: true })
  idLancamento?: number;

  @ManyToOne(() => Lancamento, { nullable: true })
  @JoinColumn({ name: 'idLancamento' })
  lancamento?: Lancamento;

  @Column({ type: 'date' })
  dataAbastecimento: Date;

  @Column({ type: 'decimal', precision: 10, scale: 3 })
  litros: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  valorLitro: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  valorTotal: number;

  @Column({ type: 'int', nullable: true })
  quilometragem?: number;

  @Column({ length: 255, nullable: true })
  local?: string;

  @Column({ type: 'text', nullable: true })
  observacoes?: string;

  @CreateDateColumn()
  dataInclusao: Date;

  @UpdateDateColumn()
  dataAlteracao: Date;
}


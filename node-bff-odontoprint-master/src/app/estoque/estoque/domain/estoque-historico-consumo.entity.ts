import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Estoque } from './estoque.entity';

@Entity({ name: 'TbEstoqueHistoricoConsumo' })
export class EstoqueHistoricoConsumo {
  @PrimaryGeneratedColumn({ name: 'idEstoqueHistoricoConsumo' })
  idEstoqueHistoricoConsumo: number;

  @Column({ name: 'idEstoque', type: 'int', nullable: false })
  idEstoque: number;

  @Column({ name: 'quantidadeConsumida', type: 'int', nullable: false })
  quantidadeConsumida: number;

  @Column({ name: 'motivo', type: 'varchar', length: 255, nullable: true })
  motivo: string;

  @CreateDateColumn({ name: 'dataConsumo', type: 'timestamp' })
  dataConsumo: Date;

  @ManyToOne(() => Estoque, (estoque) => estoque.historicosConsumo)
  @JoinColumn({ name: 'idEstoque' })
  estoque: Estoque;
}

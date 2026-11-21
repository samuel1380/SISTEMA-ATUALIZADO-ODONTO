import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  RelationId,
  UpdateDateColumn
} from 'typeorm';
import { Empresa } from '../../empresa/domain/empresa.entity';
import { ItemPedido } from './itemPedido.entity';


@Entity('TbPedido')
export class Pedido {
  @PrimaryGeneratedColumn()
  idPedido?: number;

  @Column()
  idEmpresa: number;

  @Column({ type: 'varchar', length: 255, nullable: false })
  status: string;

  @Column({ type: 'datetime', nullable: true })
  prazoEntrega?: Date;

  @Column({ type: 'datetime', nullable: true })
  vigenciaInicial?: Date;

  @Column({ type: 'datetime', nullable: true })
  vigenciaFinal?: Date;

  @Column({ type: 'int', nullable: false })
  idUsuarioSolicitante: number;

  @Column({ type: 'boolean', default: false })
  ativo: boolean;

  @Column({ type: 'int', nullable: false })
  idUsuarioCadastro: number;

  @CreateDateColumn()
  dataInclusao?: Date;

  @UpdateDateColumn()
  dataAlteracao?: Date;

  @DeleteDateColumn()
  dataExclusao?: Date;

  @OneToMany(type => ItemPedido, (itemPedido) => itemPedido.pedido, { eager: true, cascade: true })
  itemsPedido?: ItemPedido[];

  @ManyToOne(type => Empresa, (empresa) => empresa.pedido, { eager: true })
  @JoinColumn({ name: 'idEmpresa' })
  empresa?: Empresa;
}

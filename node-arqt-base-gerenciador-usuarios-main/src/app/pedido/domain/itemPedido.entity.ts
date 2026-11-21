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
import { Produto } from '../../produto/domain/produto.entity';
import { Pedido } from './pedido.entity';


@Entity('TbItemPedido')
export class ItemPedido {
  @PrimaryGeneratedColumn()
  idItemPedido?: number;

  @Column()
  idPedido?: number;

  @Column()
  idProduto?: number;

  @Column()
  idEmpresa?: number;

  @Column({ type: 'varchar', length: 255, nullable: false, default: 'pendente' })
  status: string;

  @Column({ type: 'datetime', nullable: false })
  prazoEntrega?: Date;

  @Column({ type: 'datetime', nullable: false })
  vigenciaInicial?: Date;

  @Column({ type: 'datetime', nullable: false })
  vigenciaFinal?: Date;

  @Column({ type: 'int', nullable: false })
  idUsuarioSolicitante?: number;

  @Column({ type: 'int', nullable: false })
  quantidade?: number;

  @Column({ type: 'int', nullable: false })
  valor?: number;

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

  @ManyToOne(type => Pedido, (pedido) => pedido.itemsPedido)
  @JoinColumn({ name: 'idPedido' })
  pedido: Pedido;

  @ManyToOne(type => Produto, (produto) => produto.itemsPedido)
  @JoinColumn({ name: 'idProduto' })
  produto: Produto;
}

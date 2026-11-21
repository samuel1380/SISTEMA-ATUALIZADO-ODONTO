import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm';
import { CategoriaProduto } from '../../categoriaProduto/domain/categoriaProduto.entity';
import { ItemPedido } from '../../pedido/domain/itemPedido.entity';
import { CustomProduto } from './customProduto.entity';


@Entity('TbProduto')
export class Produto {
  @PrimaryGeneratedColumn()
  idProduto?: number;

  @Column({ type: 'varchar', length: 255, nullable: false })
  nome: string;

  @Column({ type: 'int', nullable: true })
  prazoEntregaDias?: number;

  @Column({ type: 'decimal', nullable: true })
  precoCusto?: number;

  @Column({ type: 'decimal', nullable: false })
  preco?: number;

  @Column({ type: 'int', nullable: false })
  idCategoriaProduto?: number;

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

  @OneToMany(type => ItemPedido, (itemPedido) => itemPedido.produto)
  itemsPedido?: ItemPedido[];

  @OneToOne(type => CategoriaProduto, (categoriaProduto) => categoriaProduto.produto)
  @JoinColumn({ name: 'idCategoriaProduto' })
  categoriaProduto?: CategoriaProduto;

  @OneToMany(type => CustomProduto, (customProduto) => customProduto.produto, { eager: true })
  customProduto?: CustomProduto[];
}

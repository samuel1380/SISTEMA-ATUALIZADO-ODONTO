import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm';
import { Produto } from './produto.entity';


@Entity('TbCustomProduto')
export class CustomProduto {
  @PrimaryGeneratedColumn()
  idCustomProduto?: number;

  @Column({ type: 'int', nullable: false })
  idProduto?: number;

  @Column({ type: 'varchar', nullable: false })
  customName?: string;

  @Column({ type: 'varchar', nullable: false })
  customValue?: number;

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

  @ManyToOne(type => Produto, (produto) => produto.customProduto)
  @JoinColumn({ name: 'idProduto' })
  produto?: Produto;
}

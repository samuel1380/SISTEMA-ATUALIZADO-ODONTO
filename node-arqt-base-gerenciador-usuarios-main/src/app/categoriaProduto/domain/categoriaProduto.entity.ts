import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm';
import { Produto } from '../../produto/domain/produto.entity';


@Entity('TbCategoriaProduto')
export class CategoriaProduto {
  @PrimaryGeneratedColumn()
  idCategoriaProduto?: number;

  @Column({ type: 'varchar', length: 255, nullable: false })
  nome: string;

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

  @OneToMany(type => Produto, (produto) => produto.categoriaProduto)
  produto?: Produto[];
}

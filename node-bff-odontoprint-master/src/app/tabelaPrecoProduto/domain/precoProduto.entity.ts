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
import { TabelaPrecoProduto } from './tabelaPrecoProduto.entity';
import { Produto } from '@hunter-solucoes/node-arqt-base-gerenciador-usuarios/dist/src/app/produto/domain/produto.entity';

@Entity('TbPrecoProduto')
export class PrecoProduto {
  @PrimaryGeneratedColumn()
  idPrecoProduto?: number;

  @Column({ type: 'decimal', nullable: false })
  preco: number;

  @Column({ type: 'int', nullable: false })
  idProduto: number;

  @Column({ type: 'varchar', nullable: false })
  idTabelaPrecoProduto: string;

  @Column({ type: "boolean", default: true })
  ativo: number;

  @Column({ type: 'int', nullable: false, select: false })
  idUsuarioCadastro: number;

  @CreateDateColumn()
  @Column({ select: false })
  dataInclusao?: Date;

  @UpdateDateColumn()
  @Column({ select: false })
  dataAlteracao?: Date;

  @DeleteDateColumn()
  @Column({ select: false })
  dataExclusao?: Date;

  @ManyToOne(type => Produto, { eager: true })
  @JoinColumn({ name: 'idProduto' })
  produto: Produto;

  @ManyToOne(type => TabelaPrecoProduto, (tabelaPrecoProduto) => tabelaPrecoProduto.precoProduto, {orphanedRowAction: 'delete'})
  @JoinColumn({ name: 'idTabelaPrecoProduto' })
  tabelaPrecoProduto: TabelaPrecoProduto;

}

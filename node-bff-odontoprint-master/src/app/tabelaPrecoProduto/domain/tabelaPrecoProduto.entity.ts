import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm';

import { PrecoProduto } from './precoProduto.entity';

@Entity('TbTabelaPrecoProduto')
export class TabelaPrecoProduto {
  @PrimaryGeneratedColumn()
  idTabelaPrecoProduto?: number;

  @Column({ type: 'varchar', nullable: false })
  nome: string;

  @Column({ type: "boolean", default: true })
  ativo: number;

  @Column({ type: 'int', nullable: true })
  idTabelaPrecoProdutoOrigem?: number;

  @Column({ type: 'varchar', nullable: true })
  numeroVersao?: string;

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

  @OneToMany(type => PrecoProduto, (itemPedido) => itemPedido.tabelaPrecoProduto, { eager: true, cascade: true })
  precoProduto?: PrecoProduto[];

  @ManyToOne(() => TabelaPrecoProduto, (tabela) => tabela.versoes, { nullable: true })
  @JoinColumn({ name: 'idTabelaPrecoProdutoOrigem' })
  tabelaOrigem?: TabelaPrecoProduto;

  @OneToMany(() => TabelaPrecoProduto, (versao) => versao.tabelaOrigem)
  versoes?: TabelaPrecoProduto[];
}

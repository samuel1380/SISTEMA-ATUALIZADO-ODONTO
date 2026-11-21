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
import { ProdutoEmpresa } from '../../produtosEmpresa/domain/produtosCategoriaEmpresa.entity';
import { ComponenteEmpresa } from '../../componenteEmpresa/domain/componenteEmpresa.entity';
import { Empresa } from '@hunter-solucoes/node-arqt-base-gerenciador-usuarios/dist/src/app/empresa/domain/empresa.entity';
import { CorEmpresa } from '../../corEmpresa/domain/corEmpresa.entity';
import { Dentista } from '@src/app/dentista/domain/dentista.entity';
import { TabelaPrecoProduto } from '@src/app/tabelaPrecoProduto/domain/tabelaPrecoProduto.entity';

@Entity('TbCadastroComplementarEmpresa')
export class CadastroComplementarEmpresa {
  @PrimaryGeneratedColumn()
  idCadastroComplementarEmpresa?: number;

  @Column({ type: 'float', nullable: true })
  porcentagemDesconto?: number;

  @Column({ type: 'boolean', nullable: true })
  utilizaInterfaces?: boolean;

  @Column({ type: 'boolean', nullable: true })
  scannerProprio?: boolean;

  @Column({ type: 'int', nullable: true })
  diaPagamento?: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  tipoPagamento?: string;

  @Column({ type: 'int', nullable: true })
  quantidadeParcelas?: number;

  @Column({ type: 'int', nullable: false })
  idTabelaPrecoProduto: number;

  @Column({ type: 'int', nullable: false })
  idEmpresa: number;

  @Column({ type: "boolean", default: true, select: false })
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

  @OneToMany(type => ProdutoEmpresa, (produtoEmpresa) => produtoEmpresa.cadastroComplementarEmpresa, { eager: true })
  produtosEmpresa?: ProdutoEmpresa[];

  @OneToMany(type => ComponenteEmpresa, (componenteEmpresa) => componenteEmpresa.cadastroComplementarEmpresa, { eager: true })
  componenteEmpresa?: ComponenteEmpresa[];

  // @OneToMany(type => CorEmpresa, (corEmpresa) => corEmpresa.cadastroComplementarEmpresa, { eager: true })
  // corEmpresa?: CorEmpresa[];

  @OneToMany(type => Dentista, (dentistaEmpresa) => dentistaEmpresa.cadastroComplementarEmpresa, { eager: true })
  dentistaEmpresa?: Dentista[];

  @OneToOne(type => Empresa, { eager: true })
  @JoinColumn({ name: 'idEmpresa' })
  empresa: Empresa;

  @OneToOne(type => TabelaPrecoProduto, { eager: true })
  @JoinColumn({ name: 'idTabelaPrecoProduto' })
  tabelaPrecoProduto: TabelaPrecoProduto;
}

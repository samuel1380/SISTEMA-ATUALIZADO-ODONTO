import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { TipoLancamento } from './tipo-lancamento.enum';
import { ClassificacaoDre } from './classificacao-dre.enum';
import { ClassificacaoDespesa } from './classificacao-despesa.enum';

@Entity('TbFinanceiroCategoria')
export class Categoria {
  @PrimaryGeneratedColumn()
  idCategoria: number;

  @Column({ length: 100 })
  nome: string;

  @Column({ type: 'enum', enum: TipoLancamento })
  tipo: TipoLancamento;

  @Column({ type: 'enum', enum: ClassificacaoDre })
  classificacaoDre: ClassificacaoDre;

  @Column({ type: 'enum', enum: ClassificacaoDespesa, nullable: true })
  classificacaoDespesa?: ClassificacaoDespesa;

  @Column({ nullable: true })
  idCategoriaPai?: number;

  @ManyToOne(() => Categoria, (cat) => cat.subcategorias, { nullable: true })
  @JoinColumn({ name: 'idCategoriaPai' })
  categoriaPai?: Categoria;

  @OneToMany(() => Categoria, (cat) => cat.categoriaPai)
  subcategorias?: Categoria[];

  @CreateDateColumn()
  dataInclusao: Date;

  @UpdateDateColumn()
  dataAlteracao: Date;

  @DeleteDateColumn()
  dataExclusao: Date;
}

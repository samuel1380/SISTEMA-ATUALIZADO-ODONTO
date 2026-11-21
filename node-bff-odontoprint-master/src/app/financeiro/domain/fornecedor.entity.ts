import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Categoria } from './categoria.entity';

@Entity('TbFinanceiroFornecedor')
export class Fornecedor {
  @PrimaryGeneratedColumn()
  idFornecedor: number;

  @Column({ length: 255, nullable: true })
  cnpj?: string;

  @Column({ length: 255, nullable: true })
  cpf?: string;

  @Column({ length: 255 })
  razaoSocial: string;

  @Column({ length: 255, nullable: true })
  nomeFantasia?: string;

  @Column({ length: 20, nullable: true })
  telefone?: string;

  @Column({ length: 10, nullable: true })
  cep?: string;

  @Column({ length: 255, nullable: true })
  logradouro?: string;

  @Column({ length: 20, nullable: true })
  numero?: string;

  @Column({ length: 100, nullable: true })
  complemento?: string;

  @Column({ length: 100, nullable: true })
  bairro?: string;

  @Column({ length: 100, nullable: true })
  cidade?: string;

  @Column({ length: 2, nullable: true })
  uf?: string;

  @Column({ default: true })
  ativo: boolean;

  @Column({ nullable: true })
  idCategoria?: number | null;

  @ManyToOne(() => Categoria, { nullable: true })
  @JoinColumn({ name: 'idCategoria' })
  categoria?: Categoria;

  @CreateDateColumn()
  dataInclusao: Date;

  @UpdateDateColumn()
  dataAlteracao: Date;
}

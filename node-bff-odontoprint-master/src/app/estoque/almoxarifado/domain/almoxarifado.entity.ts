import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Estoque } from '../../estoque/domain/estoque.entity';
import { Empresa } from '@hunter-solucoes/node-arqt-base-gerenciador-usuarios/dist/src/app/empresa/domain/empresa.entity';

@Entity('TbAlmoxarifado')
export class Almoxarifado {
  @PrimaryGeneratedColumn()
  idAlmoxarifado: number;

  @Column({ type: 'varchar', length: 255, nullable: false })
  nome: string;

  @Column({ type: 'text', nullable: true })
  descricao?: string;

  @OneToMany(() => Estoque, (estoque) => estoque.almoxarifado)
  estoques: Estoque[];

  @Column({ type: 'int', nullable: false })
  idEmpresa: number; 

  @CreateDateColumn()
  dataInclusao?: Date;

  @UpdateDateColumn()
  dataAlteracao?: Date;

  @DeleteDateColumn()
  dataExclusao?: Date;

  @ManyToOne(() => Empresa, { eager: true })
  @JoinColumn({ name: 'idEmpresa' })
  empresa: Empresa;
}

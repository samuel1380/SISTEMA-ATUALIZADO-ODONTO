import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm';
import { Trabalho } from './trabalho.entity';
import { Componente } from '@src/app/componente/domain/componente.entity';

@Entity('TbComponentesTrabalhoTbTrabalho')
export class ComponentesTrabalho {
  @PrimaryGeneratedColumn()
  idComponenteTrabalho?: number;

  @Column({ type: 'int', nullable: false })
  qtdItems: number;

  @Column({ type: 'int', nullable: false })
  idTrabalho: number;

  @Column({ type: 'int', nullable: false })
  idComponente: number;

  @Column({ type: "boolean", default: true })
  ativo: number;

  @CreateDateColumn()
  dataInclusao?: Date;

  @UpdateDateColumn()
  dataAlteracao?: Date;

  @DeleteDateColumn()
  dataExclusao?: Date;

  @OneToOne(type => Componente, { eager: true })
  @JoinColumn({ name: 'idComponente' })
  componente: Componente;

  @ManyToOne(type => Trabalho, (trabalho) => trabalho.componentes)
  @JoinColumn({ name: 'idTrabalho' })
  trabalho?: Trabalho;
}

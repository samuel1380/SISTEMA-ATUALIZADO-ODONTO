import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm';
import { Trabalho } from './trabalho.entity';
import { ElementosTrabalho } from './elementosTrabalho.entity';

@Entity('TbServicoTrabalho')
export class ServicoTrabalho {
  @PrimaryGeneratedColumn()
  idServicoTrabalho?: number;

  @Column({ type: 'int', nullable: false })
  idProduto: number;

  @Column({ type: 'int', nullable: false })
  idTrabalho: number;

  @Column({ type: "boolean", default: true })
  ativo: boolean;

  @CreateDateColumn({ name: 'dataInclusao', type: 'datetime' })
  dataInclusao?: Date;

  @UpdateDateColumn({ name: 'dataAlteracao', type: 'datetime', nullable: true })
  dataAlteracao: Date | null;

  @Column({ name: 'dataExclusao', type: 'datetime', nullable: true })
  dataExclusao?: Date | null;

  @ManyToOne(() => Trabalho, (trabalho) => trabalho.servicos, { orphanedRowAction: 'delete' })
  @JoinColumn({ name: 'idTrabalho' })
  trabalho?: Trabalho;

  @ManyToMany(() => ElementosTrabalho, {
    cascade: true,
    eager: true
  })
  @JoinTable({
    name: 'TbServicoTrabalhoTbElementosTrabalho',
    joinColumn: { name: "idServicoTrabalho", referencedColumnName: "idServicoTrabalho", foreignKeyConstraintName: "TbServicoTrabalhoTbElementosTrabalho_ibfk_1", },
    inverseJoinColumn: { name: "idElementoTrabalho", referencedColumnName: "idElementoTrabalho" }
  })
  elementos?: ElementosTrabalho[];
}

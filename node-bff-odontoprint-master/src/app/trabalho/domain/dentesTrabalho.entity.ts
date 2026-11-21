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
import { Trabalho } from './trabalho.entity';

@Entity('TbDentesTrabalho')
export class DenteTrabalho {
  @PrimaryGeneratedColumn()
  idDenteTrabalho?: number;

  @Column({ type: 'int', nullable: false })
  denteNumber: number;

  @Column({ type: 'int', nullable: true })
  idComponente: number;

  @Column({ type: 'int', nullable: true })
  idMarca?: number;

  @Column({ type: 'int', nullable: false })
  idProduto: number;

  @Column({ type: 'varchar', nullable: false })
  idScanBody: string;

  @Column({ type: 'int', nullable: false })
  idTrabalho?: number;

  @Column({ type: "boolean", default: true })
  ativo: number;

  @Column({ type: 'int', nullable: false })
  idUsuarioCadastro: number;

  @CreateDateColumn()
  dataInclusao?: Date;

  @UpdateDateColumn()
  dataAlteracao?: Date;

  @DeleteDateColumn()
  dataExclusao?: Date;

  // @ManyToOne(type => Trabalho, (trabalho) => trabalho.dentesTrabalho, { orphanedRowAction: 'delete' })
  // @JoinColumn({ name: 'idTrabalho' })
  // trabalho?: Trabalho;
}

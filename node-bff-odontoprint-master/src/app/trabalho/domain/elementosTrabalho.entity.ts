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
import { ServicoTrabalho } from './servicoTrabalho.entity';

@Entity('TbElementosTrabalho')
export class ElementosTrabalho {
  @PrimaryGeneratedColumn()
  idElementoTrabalho?: number;

  @Column({ type: 'varchar', nullable: false })
  nome: string;

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

  @ManyToMany(type => ServicoTrabalho, { orphanedRowAction: 'delete' })
  @JoinTable({
    name: 'TbServicoTrabalhoTbElementosTrabalho',
    joinColumn: {
      name: "idElementoTrabalho",
      referencedColumnName: "idElementoTrabalho"
    },
    inverseJoinColumn: {
      name: "idServicoTrabalho",
      referencedColumnName: "idServicoTrabalho"
    }
  })
  trabalho?: ServicoTrabalho[]
}

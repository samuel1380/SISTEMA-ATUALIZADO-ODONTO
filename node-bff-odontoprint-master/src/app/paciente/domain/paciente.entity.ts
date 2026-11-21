import { Empresa } from '@hunter-solucoes/node-arqt-base-gerenciador-usuarios/dist/src/app/empresa/domain/empresa.entity';
import { Trabalho } from '@src/app/trabalho/domain/trabalho.entity';
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

@Entity('TbPaciente')
export class Paciente {
  @PrimaryGeneratedColumn()
  idPaciente?: number;

  @Column({ type: 'varchar', length: 255, nullable: false })
  nome: string;

  @Column({ type: 'int', nullable: false })
  idEmpresa: number;

  @Column({ type: 'int', nullable: false })
  idUsuarioCadastro: number;

  @Column({ type: 'int', nullable: true })
  idProfissional: number;

  @CreateDateColumn()
  dataInclusao?: Date;

  @UpdateDateColumn()
  dataAlteracao?: Date;

  @DeleteDateColumn()
  dataExclusao?: Date;

  @ManyToOne(() => Empresa, { eager: true })
  @JoinColumn({ name: 'idEmpresa' })
  empresa?: Empresa;

  @OneToMany(() => Trabalho, (trabalho) => trabalho.paciente)
  trabalhos: Trabalho[];
}


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
import { CadastroComplementarEmpresa } from '@src/app/cadastroComplementarEmpresa/domain/cadastroComplementarEmpresa.entity';

@Entity('TbDentista')
export class Dentista {
  @PrimaryGeneratedColumn()
  idDentista?: number;

  @Column({ type: 'varchar', nullable: false })
  nome: string;

  @Column({ type: 'varchar', nullable: false })
  email: string;

  @Column({ type: 'varchar', nullable: false })
  idEmpresa: string;

  @Column({ type: 'int', nullable: false })
  idUsuarioSistema?: number;

  @Column({ type: "boolean", default: true })
  ativo: boolean;

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

  @ManyToOne(type => CadastroComplementarEmpresa, (cadastroComplementarEmpresa) => cadastroComplementarEmpresa.dentistaEmpresa)
  @JoinColumn({ name: 'idEmpresa' })
  cadastroComplementarEmpresa?: CadastroComplementarEmpresa;
}

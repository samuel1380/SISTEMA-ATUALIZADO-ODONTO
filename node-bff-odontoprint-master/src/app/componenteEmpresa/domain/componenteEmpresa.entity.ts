import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm';
import { CadastroComplementarEmpresa } from '../../cadastroComplementarEmpresa/domain/cadastroComplementarEmpresa.entity';
import { Componente } from '../../componente/domain/componente.entity';

@Entity('TbComponenteEmpresa')
export class ComponenteEmpresa {
  @PrimaryGeneratedColumn()
  idComponenteEmpresa?: number;

  @Column({ type: 'int', nullable: false })
  idComponente: number;

  @Column({ type: 'int', nullable: false })
  idEmpresa: number;

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

  @ManyToOne(type => CadastroComplementarEmpresa, (cadastroComplementarEmpresa) => cadastroComplementarEmpresa.produtosEmpresa)
  @JoinColumn({ name: 'idEmpresa' })
  cadastroComplementarEmpresa?: CadastroComplementarEmpresa;

  @ManyToOne(type => Componente, (componente) => componente.componenteEmpresa, { eager: true })
  @JoinColumn({ name: 'idComponente' })
  componente?: Componente;
}

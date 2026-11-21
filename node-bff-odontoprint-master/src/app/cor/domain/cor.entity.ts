import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm';
import { ComponenteEmpresa } from '../../componenteEmpresa/domain/componenteEmpresa.entity';

@Entity('TbCor')
export class Cor {
  @PrimaryGeneratedColumn()
  idCor?: number;

  @Column({ type: 'varchar', nullable: false })
  nome: string;

  @Column({ type: "boolean", default: true, select: false })
  ativo: number;

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

  @OneToMany(type => ComponenteEmpresa, (componenteEmpresa) => componenteEmpresa.componente)
  componenteEmpresa?: ComponenteEmpresa[];
}

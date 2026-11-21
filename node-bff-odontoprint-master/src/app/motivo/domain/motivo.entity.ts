import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { MotivoTipo } from '../dto/motivo.dto';

@Entity('TbMotivo')
export class Motivo {
  @PrimaryGeneratedColumn()
  idMotivo?: number;

  @Column({ type: 'varchar', nullable: false })
  nome: string;

  @Column({ type: 'varchar', length: 20, nullable: false })
  tipo: MotivoTipo;

  @Column({ type: 'boolean', default: true, select: false })
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
}


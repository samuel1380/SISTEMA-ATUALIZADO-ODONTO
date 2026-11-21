import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { Motivo } from '@src/app/motivo/domain/motivo.entity';
import { Trabalho } from './trabalho.entity';

@Entity('TbTrabalhoMotivo')
export class TrabalhoMotivo {
  @PrimaryGeneratedColumn()
  idTrabalhoMotivo?: number;

  @Column({ type: 'int', nullable: false })
  idTrabalho: number;

  @Column({ type: 'int', nullable: false })
  idMotivo: number;

  @CreateDateColumn()
  dataInclusao?: Date;

  @ManyToOne(() => Trabalho, (trabalho) => trabalho.trabalhoMotivos, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'idTrabalho' })
  trabalho?: Trabalho;

  @ManyToOne(() => Motivo, { eager: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'idMotivo' })
  motivo?: Motivo;
}


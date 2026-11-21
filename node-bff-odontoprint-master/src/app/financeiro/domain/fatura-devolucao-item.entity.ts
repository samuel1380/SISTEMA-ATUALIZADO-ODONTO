import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Fatura } from './fatura.entity';
import { Componente } from '@src/app/componente/domain/componente.entity';
import { Paciente } from '@src/app/paciente/domain/paciente.entity';

@Entity('TbFaturaDevolucaoItem')
export class FaturaDevolucaoItem {
  @PrimaryGeneratedColumn()
  idFaturaDevolucaoItem: number;

  @Column()
  idFatura: number;

  @ManyToOne(() => Fatura, (fatura) => fatura.devolucoesComponentes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'idFatura' })
  fatura: Fatura;

  @Column()
  idComponente: number;

  @ManyToOne(() => Componente, { eager: true })
  @JoinColumn({ name: 'idComponente' })
  componente: Componente;

  @Column({ nullable: true })
  idPaciente?: number;

  @ManyToOne(() => Paciente, { nullable: true, eager: true })
  @JoinColumn({ name: 'idPaciente' })
  paciente?: Paciente;

  @Column({ type: 'varchar', length: 255, nullable: true })
  nomePaciente?: string;

  @Column({ type: 'int' })
  quantidade: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  valorUnitario: number;

  @CreateDateColumn()
  dataInclusao: Date;
}

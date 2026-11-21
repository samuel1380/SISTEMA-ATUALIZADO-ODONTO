import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Conta } from './conta.entity';

@Entity('TbCredor')
export class Credor {
  @PrimaryGeneratedColumn()
  idCredor: number;

  @Column({ length: 255 })
  nome: string;

  @Column({ length: 100, nullable: true })
  cpf?: string;

  @Column({ length: 100, nullable: true })
  cnpj?: string;

  @Column({ length: 255, nullable: true })
  email?: string;

  @Column({ length: 20, nullable: true })
  telefone?: string;

  @Column({ type: 'text', nullable: true })
  endereco?: string;

  @Column({ nullable: true })
  idEmpresa?: number;

  @Column({ nullable: true })
  idConta?: number;

  @OneToOne(() => Conta, { nullable: true })
  @JoinColumn({ name: 'idConta' })
  conta?: Conta;

  @Column({ default: true })
  ativo: boolean;

  @CreateDateColumn()
  dataInclusao: Date;

  @UpdateDateColumn()
  dataAlteracao: Date;
}


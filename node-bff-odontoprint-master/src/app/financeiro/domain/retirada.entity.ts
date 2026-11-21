import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Lancamento } from './lancamento.entity';

export enum TipoRetirada {
  RETIRADA_CAPITAL = 'RETIRADA_CAPITAL',
  DISTRIBUICAO_LUCROS = 'DISTRIBUICAO_LUCROS',
  OUTROS = 'OUTROS',
}

@Entity('TbRetirada')
export class Retirada {
  @PrimaryGeneratedColumn()
  idRetirada: number;

  @Column()
  idLancamento: number;

  @ManyToOne(() => Lancamento)
  @JoinColumn({ name: 'idLancamento' })
  lancamento: Lancamento;

  @Column({ nullable: true })
  idSocio?: number; // ID do sócio (pode ser da tabela de usuários ou cliente/fornecedor)

  @Column({ type: 'date' })
  dataRetirada: Date;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  valor: number;

  @Column({ type: 'enum', enum: TipoRetirada })
  tipo: TipoRetirada;

  @Column({ type: 'text', nullable: true })
  observacoes?: string;

  @CreateDateColumn()
  dataInclusao: Date;

  @UpdateDateColumn()
  dataAlteracao: Date;
}

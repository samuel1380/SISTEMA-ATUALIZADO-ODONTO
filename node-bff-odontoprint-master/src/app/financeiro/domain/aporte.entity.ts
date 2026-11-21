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
import { Socio } from './socio.entity';

export enum TipoAporte {
  APORTE_CAPITAL = 'APORTE_CAPITAL',
  DISTRIBUICAO_LUCROS = 'DISTRIBUICAO_LUCROS',
}

@Entity('TbAporte')
export class Aporte {
  @PrimaryGeneratedColumn()
  idAporte: number;

  @Column()
  idLancamento: number;

  @ManyToOne(() => Lancamento)
  @JoinColumn({ name: 'idLancamento' })
  lancamento: Lancamento;

  @Column({ nullable: true })
  idSocio?: number; // ID do sócio (pode ser da tabela de usuários ou cliente/fornecedor)

  @ManyToOne(() => Socio)
  @JoinColumn({ name: 'idSocio' })
  socio?: Socio;

  @Column({ type: 'date' })
  dataAporte: Date;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  valor: number;

  @Column({ type: 'enum', enum: TipoAporte })
  tipo: TipoAporte;

  @Column({ type: 'text', nullable: true })
  observacoes?: string;

  @CreateDateColumn()
  dataInclusao: Date;

  @UpdateDateColumn()
  dataAlteracao: Date;
}


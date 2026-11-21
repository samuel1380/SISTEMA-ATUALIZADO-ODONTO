import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToOne,
  CreateDateColumn,
} from 'typeorm';
import { TransacaoOfx } from './transacao-ofx.entity';
import { Movimentacao } from './movimentacao.entity';
import { Aporte } from './aporte.entity';
import { Retirada } from './retirada.entity';

export enum TipoVinculo {
  MOVIMENTACAO = 'MOVIMENTACAO',
  APORTE = 'APORTE',
  RETIRADA = 'RETIRADA',
}

@Entity('TbConciliacaoTransacao')
export class ConciliacaoTransacao {
  @PrimaryGeneratedColumn()
  idConciliacao: number;

  @Column({ unique: true })
  idTransacaoOfx: number;

  @OneToOne(() => TransacaoOfx, (transacao) => transacao.conciliacao)
  @JoinColumn({ name: 'idTransacaoOfx' })
  transacaoOfx: TransacaoOfx;

  @Column({ nullable: true })
  idMovimentacao?: number;

  @ManyToOne(() => Movimentacao, { nullable: true })
  @JoinColumn({ name: 'idMovimentacao' })
  movimentacao?: Movimentacao;

  @Column({ nullable: true })
  idAporte?: number;

  @ManyToOne(() => Aporte, { nullable: true })
  @JoinColumn({ name: 'idAporte' })
  aporte?: Aporte;

  @Column({ nullable: true })
  idRetirada?: number;

  @ManyToOne(() => Retirada, { nullable: true })
  @JoinColumn({ name: 'idRetirada' })
  retirada?: Retirada;

  @Column({ type: 'enum', enum: TipoVinculo })
  tipoVinculo: TipoVinculo;

  @CreateDateColumn()
  dataConciliacao: Date;

  @Column()
  idUsuarioConciliacao: number;

  @Column({ type: 'text', nullable: true })
  observacoes?: string;
}

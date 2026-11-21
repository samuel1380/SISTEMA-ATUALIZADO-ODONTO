import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { Conta } from './conta.entity';
import { TransacaoOfx } from './transacao-ofx.entity';

@Entity('TbArquivoOfx')
export class ArquivoOfx {
  @PrimaryGeneratedColumn()
  idArquivoOfx: number;

  @Column()
  idConta: number;

  @ManyToOne(() => Conta)
  @JoinColumn({ name: 'idConta' })
  conta: Conta;

  @Column({ length: 255 })
  nomeArquivo: string;

  @CreateDateColumn()
  dataImportacao: Date;

  @Column({ type: 'date' })
  dataInicio: Date;

  @Column({ type: 'date' })
  dataFim: Date;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  saldoInicial: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  saldoFinal: number;

  @Column({ type: 'int', default: 0 })
  totalTransacoes: number;

  @Column()
  idUsuarioImportacao: number;

  @OneToMany(() => TransacaoOfx, (transacao) => transacao.arquivoOfx)
  transacoes: TransacaoOfx[];
}

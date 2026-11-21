import { Empresa } from '@hunter-solucoes/node-arqt-base-gerenciador-usuarios/dist/src/app/empresa/domain/empresa.entity';
import { OrdemServico } from '@src/app/ordemServico/domain/ordemServico.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { DevolucaoComponente } from './devolucao-componente.entity';
import { FaturaDevolucaoItem } from './fatura-devolucao-item.entity';

export enum StatusFatura {
  ABERTA = 'ABERTA',
  AGUARDANDO_DEVOLUCAO = 'AGUARDANDO_DEVOLUCAO',
  FECHADA = 'FECHADA',
  PAGA = 'PAGA',
  PAGA_PARCIALMENTE = 'PAGA_PARCIALMENTE',
  CANCELADA = 'CANCELADA',
}

@Entity('TbFinanceiroFatura')
export class Fatura {
  @PrimaryGeneratedColumn()
  idFatura: number;

  @Column()
  idEmpresa: number;

  @ManyToOne(() => Empresa)
  @JoinColumn({ name: 'idEmpresa' })
  empresa: Empresa;

  @Column({ type: 'date' })
  dataInicio: Date;

  @Column({ type: 'date' })
  dataFim: Date;

  @Column({ type: 'date' })
  dataVencimento: Date;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0.00 })
  valorTotalBruto: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0.00 })
  desconto: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  valorTotal: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0.00 })
  valorPago: number;

  @Column({ type: 'enum', enum: StatusFatura, default: StatusFatura.ABERTA })
  status: StatusFatura;

  @Column({ type: 'text', nullable: true })
  anotacoes: string | null;

  @Column({ type: 'int', nullable: true })
  idFaturaOriginal?: number | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  descricao?: string | null;

  @ManyToOne(() => Fatura, { nullable: true })
  @JoinColumn({ name: 'idFaturaOriginal' })
  faturaOriginal?: Fatura | null;

  @OneToMany(() => OrdemServico, (os) => os.fatura)
  ordensDeServico: OrdemServico[];

  @OneToMany(() => DevolucaoComponente, (devolucao) => devolucao.fatura)
  devolucoes: DevolucaoComponente[];

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0.00 })
  descontoDevolucao: number;

  @OneToMany(() => FaturaDevolucaoItem, (devolucao) => devolucao.fatura, { cascade: true })
  devolucoesComponentes: FaturaDevolucaoItem[];
}

import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { TipoLancamento } from './tipo-lancamento.enum';

export enum Periodicidade {
  MENSAL = 'MENSAL',
  ANUAL = 'ANUAL',
}

@Entity('TbFinanceiroLancamentoRecorrente')
export class LancamentoRecorrente {
  @PrimaryGeneratedColumn()
  idLancamentoRecorrente: number;

  @Column()
  descricao: string;

  @Column({ type: 'enum', enum: TipoLancamento })
  tipo: TipoLancamento;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  valorEstimado: number;

  @Column()
  diaVencimento: number;

  @Column({ type: 'date', nullable: true })
  dataEmissao?: Date; // Data de emissão do lançamento recorrente

  @Column({ type: 'enum', enum: Periodicidade, default: Periodicidade.MENSAL })
  periodicidade: Periodicidade;

  @Column({ nullable: true })
  idClienteFornecedor?: number;

  @Column({ default: true })
  ativo: boolean;
}

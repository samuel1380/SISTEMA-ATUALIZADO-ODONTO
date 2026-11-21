import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Movimentacao } from './movimentacao.entity';

export enum TipoConta {
  CONTA_CORRENTE = 'CONTA_CORRENTE',
  POUPANCA = 'POUPANCA',
  CAIXA_INTERNO = 'CAIXA_INTERNO', // Dinheiro físico na empresa
  CARTEIRA_DIGITAL = 'CARTEIRA_DIGITAL',
}

@Entity('TbFinanceiroConta')
export class Conta {
  @PrimaryGeneratedColumn()
  idConta: number;

  @Column({ length: 100 })
  nome: string;

  @Column({ type: 'enum', enum: TipoConta })
  tipo: TipoConta;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0.00 })
  saldoInicial: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0.00 })
  saldoAtual: number;

  @Column({ nullable: true })
  idEmpresa?: number;

  @Column({ default: true })
  ativo: boolean;

  @CreateDateColumn()
  dataInclusao: Date;

  @UpdateDateColumn()
  dataAlteracao: Date;

  @OneToMany(() => Movimentacao, (mov) => mov.conta)
  movimentacoes?: Movimentacao[];
}


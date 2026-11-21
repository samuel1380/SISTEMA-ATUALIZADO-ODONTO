import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany, OneToOne, JoinColumn, ManyToOne } from 'typeorm';
import { Parcela } from './parcela.entity';
import { OrdemServico } from '@src/app/ordemServico/domain/ordemServico.entity';
import { Fatura } from './fatura.entity';
import { Categoria } from './categoria.entity';
import { Fornecedor } from './fornecedor.entity';
import { TipoLancamento } from './tipo-lancamento.enum';
import { Empresa } from '@hunter-solucoes/node-arqt-base-gerenciador-usuarios/dist/src/app/empresa/domain/empresa.entity';

export enum StatusLancamento {
  PENDENTE = 'PENDENTE',
  PARCIALMENTE_PAGO = 'PARCIALMENTE_PAGO',
  PAGO = 'PAGO',
  CANCELADO = 'CANCELADO',
}

@Entity('TbFinanceiroLancamento')
export class Lancamento {
  @PrimaryGeneratedColumn()
  idLancamento: number;

  @Column({ length: 255 })
  descricao: string;

  @Column({ type: 'enum', enum: TipoLancamento })
  tipo: TipoLancamento;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  valorTotal: number;

  @Column({ type: 'int', default: 1 })
  totalParcelas: number;

  @Column({ type: 'date' })
  dataCompetencia: Date; // Mês/Ano a que se refere a despesa/receita

  @Column({ type: 'date', nullable: true })
  dataEmissao?: Date; // Data de emissão do lançamento

  @Column({ length: 100, nullable: true })
  numeroDocumento?: string; // Número do documento (nota, boleto, recibo) - opcional

  @Column({ type: 'enum', enum: StatusLancamento, default: StatusLancamento.PENDENTE })
  status: StatusLancamento;

  // Vincula o lançamento a uma Ordem de Serviço
  @Column({ nullable: true })
  idOrdemServico?: number;

  @OneToOne(() => OrdemServico)
  @JoinColumn({ name: 'idOrdemServico' })
  ordemServico?: OrdemServico;

  // Vincula o lançamento a uma Fatura
  @Column({ nullable: true })
  idFatura?: number;

  @OneToOne(() => Fatura)
  @JoinColumn({ name: 'idFatura' })
  fatura?: Fatura;

  @Column({ nullable: true })
  idClienteFornecedor?: number;

  /** Em contas a receber, idClienteFornecedor pode ser o ID da empresa (cliente que deve). */
  @ManyToOne(() => Empresa, { nullable: true })
  @JoinColumn({ name: 'idClienteFornecedor' })
  clienteEmpresa?: Empresa;

  // Vincula o lançamento a um Fornecedor (contas a pagar)
  @Column({ nullable: true })
  idFornecedor?: number;

  @ManyToOne(() => Fornecedor, { nullable: true })
  @JoinColumn({ name: 'idFornecedor' })
  fornecedor?: Fornecedor;

  // Vincula o lançamento a uma Categoria
  @Column({ nullable: true })
  idCategoria?: number;

  @ManyToOne(() => Categoria, { eager: true })
  @JoinColumn({ name: 'idCategoria' })
  categoria?: Categoria;

  @CreateDateColumn()
  dataInclusao: Date;

  @OneToMany(() => Parcela, parcela => parcela.lancamento, { cascade: true, eager: true })
  parcelas: Parcela[];
}

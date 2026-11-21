import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { OrdemServico } from "./ordemServico.entity";
import { DevolucaoComponente } from "@src/app/financeiro/domain/devolucao-componente.entity";

export enum TipoCobranca {
    SERVICO = 'servico',
    COMPONENTE = 'componente',
    AVULSO = 'avulso',
}

export enum StatusOrdemServicoItem {
    PENDENTE = 'PENDENTE', // Item criado, aguardando faturamento.
    FATURADO = 'FATURADO', // Item incluído em uma fatura.
    DEVOLUCAO_SOLICITADA = 'DEVOLUCAO_SOLICITADA', // Cliente solicitou a devolução.
    DEVOLVIDO = 'DEVOLVIDO', // Item fisicamente devolvido e processo finalizado.
    DEVOLUCAO_CANCELADA = 'DEVOLUCAO_CANCELADA', // Devolução expirou e foi cancelada.
    PAGO = 'PAGO', // PAgou o componente
    CANCELADO = 'CANCELADO', // Item cancelado antes do faturamento.
}

@Entity('TbOrdemServicoItem')
export class OrdemServicoItem {
    @PrimaryGeneratedColumn()
    idOrdemServicoItem: number;

    @Column()
    idOrdemServico: number;

    @ManyToOne(() => OrdemServico, (os) => os.itens)
    @JoinColumn({ name: 'idOrdemServico' })
    ordemServico: OrdemServico;

    @Column({ type: 'enum', enum: TipoCobranca })
    tipoCobranca: TipoCobranca;

    @Column()
    idReferencia: number; // ID do Componente ou Serviço

    @Column()
    descricao: string;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    valor: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0.00 })
  valorPago: number;

    @Column({ type: 'int' })
    quantidade: number;

  @Column({ type: 'int', default: 0 })
  quantidadeDevolvida: number;

    @Column({ type: 'enum', enum: StatusOrdemServicoItem, default: StatusOrdemServicoItem.PENDENTE })
    status: StatusOrdemServicoItem;

    // Campos duplicados para manter o histórico caso a OS seja de um profissional/paciente diferente
    @Column({ nullable: true })
    idProfissional?: number;

    @Column({ nullable: true })
    idPaciente?: number;

  @Column({ type: 'decimal', nullable: false })
  valorTotal: number;

  @Column({ type: "boolean", default: true })
  ativo: boolean;

  @Column({ type: 'int', nullable: false })
  idUsuarioCadastro: number;

  @CreateDateColumn()
  dataInclusao?: Date;

  @UpdateDateColumn()
  dataAlteracao?: Date;

  @DeleteDateColumn()
  dataExclusao?: Date;

  @OneToMany(() => DevolucaoComponente, (devolucao) => devolucao.ordemServicoItem)
  devolucoes: DevolucaoComponente[];
}

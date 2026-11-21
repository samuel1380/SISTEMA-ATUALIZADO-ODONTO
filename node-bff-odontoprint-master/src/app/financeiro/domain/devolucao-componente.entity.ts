import { OrdemServicoItem } from "@src/app/ordemServico/domain/ordemServicoItem.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Fatura } from "./fatura.entity";

export enum StatusDevolucao {
    PENDENTE = 'PENDENTE', // Aguardando recebimento físico do componente
    CONFERIDO = 'CONFERIDO', // Componente recebido e verificado
    CONCLUIDO = 'CONCLUIDO', // Ajuste financeiro e de estoque realizado
    CANCELADO = 'CANCELADO', // Devolução cancelada
}

@Entity('TbDevolucaoComponente')
export class DevolucaoComponente {
    @PrimaryGeneratedColumn()
    idDevolucao: number;

    @Column()
    idFatura: number;

    @ManyToOne(() => Fatura)
    @JoinColumn({ name: 'idFatura' })
    fatura: Fatura;

    @Column()
    idOrdemServicoItem: number;

    @ManyToOne(() => OrdemServicoItem, (osItem) => osItem.devolucoes)
    @JoinColumn({ name: 'idOrdemServicoItem' })
    ordemServicoItem: OrdemServicoItem;

    @Column()
    quantidadeDevolvida: number;

    @Column({ type: 'enum', enum: StatusDevolucao, default: StatusDevolucao.PENDENTE })
    status: StatusDevolucao;

    @Column({ type: 'text', nullable: true })
    observacao?: string;

    @CreateDateColumn()
    dataSolicitacao: Date;

    @Column({ type: 'date', nullable: true })
    dataConferencia?: Date;
}

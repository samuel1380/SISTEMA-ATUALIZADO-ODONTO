import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { OrdemServicoItem, StatusOrdemServicoItem } from "@src/app/ordemServico/domain/ordemServicoItem.entity";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { DataSource, Repository, In } from "typeorm";
import { DevolucaoComponente, StatusDevolucao } from "../domain/devolucao-componente.entity";
import { CreateDevolucaoDto } from "../dto/create-devolucao.dto";
import { Fatura, StatusFatura } from "../domain/fatura.entity";

import { EstoqueService } from "@src/app/estoque/estoque/service/estoque.service";
import { FinanceiroService } from "./financeiro.service";
import { Lancamento } from "../domain/lancamento.entity";
import { OrdemServico } from "@src/app/ordemServico/domain/ordemServico.entity";

@Injectable()
export class DevolucaoComponenteService {
    constructor(
        @InjectRepository(DevolucaoComponente)
        private readonly devolucaoRepository: Repository<DevolucaoComponente>,
        @InjectRepository(Fatura)
        private readonly faturaRepository: Repository<Fatura>,
        @InjectRepository(OrdemServicoItem)
        private readonly osItemRepository: Repository<OrdemServicoItem>,
        @InjectRepository(Lancamento)
        private readonly lancamentoRepository: Repository<Lancamento>,
        private readonly estoqueService: EstoqueService,
        private readonly financeiroService: FinanceiroService,
        private readonly dataSource: DataSource,
        private readonly eventEmitter: EventEmitter2,
    ) {}

    async solicitarDevolucao(dto: CreateDevolucaoDto): Promise<DevolucaoComponente[]> {
        return this.dataSource.transaction(async manager => {
            const faturaRepo = manager.getRepository(Fatura);
            const osItemRepo = manager.getRepository(OrdemServicoItem);
            const devolucaoRepo = manager.getRepository(DevolucaoComponente);
            const osRepo = manager.getRepository(OrdemServico);

            const fatura = await faturaRepo.findOneBy({ idFatura: dto.idFatura });
            if (!fatura) {
                throw new NotFoundException(`Fatura com ID ${dto.idFatura} não encontrada.`);
            }

            if (!dto.itens || dto.itens.length === 0) {
                throw new BadRequestException('A lista de itens para devolução não pode estar vazia.');
            }

            const devolucoesParaSalvar: DevolucaoComponente[] = [];
            let valorTotalADeduzir = 0;
            const osValorADeduzir = new Map<number, number>();

            for (const itemDevolucao of dto.itens) {
                const osItem = await osItemRepo.findOneBy({ idOrdemServicoItem: itemDevolucao.idOrdemServicoItem });
                if (!osItem) {
                    throw new NotFoundException(`Item de Ordem de Serviço com ID ${itemDevolucao.idOrdemServicoItem} não encontrado.`);
                }

                if (osItem.tipoCobranca !== 'componente') {
                    throw new BadRequestException(`A devolução só é permitida para itens do tipo "componente". Item ID: ${osItem.idOrdemServicoItem}.`);
                }

                if (itemDevolucao.quantidade > osItem.quantidade) {
                    throw new BadRequestException(`A quantidade a devolver (${itemDevolucao.quantidade}) não pode ser maior que a quantidade do item na fatura (${osItem.quantidade}) para o item ID ${osItem.idOrdemServicoItem}.`);
                }

                const devolucao = this.devolucaoRepository.create({
                    idFatura: dto.idFatura,
                    idOrdemServicoItem: itemDevolucao.idOrdemServicoItem,
                    quantidadeDevolvida: itemDevolucao.quantidade,
                    observacao: dto.observacao,
                    status: StatusDevolucao.PENDENTE,
                });
                devolucoesParaSalvar.push(devolucao);

                const valorDevolvidoItem = osItem.valor * itemDevolucao.quantidade;
                valorTotalADeduzir += valorDevolvidoItem;
                const valorAtualOS = osValorADeduzir.get(osItem.idOrdemServico) || 0;
                osValorADeduzir.set(osItem.idOrdemServico, valorAtualOS + valorDevolvidoItem);

                // Atualiza o item da OS para refletir a devolução
                const quantidadeJaDevolvida = osItem.quantidadeDevolvida || 0;
                const novaQuantidadeDevolvida = quantidadeJaDevolvida + itemDevolucao.quantidade;

                if (novaQuantidadeDevolvida > osItem.quantidade) {
                    throw new BadRequestException(`A quantidade total a devolver (${novaQuantidadeDevolvida}) excede a quantidade do item (${osItem.quantidade}) para o item ID ${osItem.idOrdemServicoItem}.`);
                }

                osItem.quantidadeDevolvida = novaQuantidadeDevolvida;
                osItem.status = StatusOrdemServicoItem.DEVOLUCAO_SOLICITADA;
                await osItemRepo.save(osItem);
            }

            // Atualiza o valor total de cada Ordem de Serviço afetada
            for (const [idOrdemServico, valorADeduzir] of osValorADeduzir.entries()) {
                const os = await osRepo.findOneBy({ idOrdemServico });
                if (os) {
                    os.valorTotal = Number(os.valorTotal) - valorADeduzir;
                    await osRepo.save(os);
                }
            }

            fatura.status = StatusFatura.AGUARDANDO_DEVOLUCAO;
            await faturaRepo.save(fatura);

            const devolucoesSalvas = await devolucaoRepo.save(devolucoesParaSalvar);
            this.eventEmitter.emit('fatura.recalcular', { idFatura: fatura.idFatura });
            return devolucoesSalvas;
        });
    }

    async confirmarRecebimento(idDevolucao: number, currentUser: any): Promise<DevolucaoComponente> {
        return this.dataSource.transaction(async manager => {
            const devolucaoRepo = manager.getRepository(DevolucaoComponente);
            const devolucao = await devolucaoRepo.findOne({
                where: { idDevolucao },
                relations: ['ordemServicoItem', 'fatura'],
            });

            if (!devolucao) {
                throw new NotFoundException(`Devolução com ID ${idDevolucao} não encontrada.`);
            }
            if (devolucao.status !== StatusDevolucao.PENDENTE) {
                throw new BadRequestException(`A devolução deve estar com status PENDENTE para ser conferida.`);
            }

            devolucao.status = StatusDevolucao.CONFERIDO;
            devolucao.dataConferencia = new Date();

            // 1. Ajustar o estoque (creditando o item devolvido)
            const osItem = devolucao.ordemServicoItem;
            const fatura = devolucao.fatura;

            await this.estoqueService.creditarEstoqueDevolucao({
                idComponente: osItem.idReferencia,
                idEmpresa: fatura.idEmpresa,
                quantidade: devolucao.quantidadeDevolvida,
                motivo: `Devolução referente à Fatura #${fatura.idFatura} (Item OS: ${osItem.idOrdemServicoItem})`,
                currentUser,
            });

            // 2. Financeiro: não gerar automaticamente "Crédito por devolução".
            // A devolução segue ajustando estoque e status; lançamentos financeiros (se necessários)
            // devem ser feitos manualmente pelo usuário no módulo financeiro.

            devolucao.status = StatusDevolucao.CONCLUIDO;
            // Atualiza o status do item original para DEVOLVIDO
            const osItemOriginal = await manager.getRepository(OrdemServicoItem).findOneBy({ idOrdemServicoItem: devolucao.idOrdemServicoItem });
            osItemOriginal.status = StatusOrdemServicoItem.DEVOLVIDO;
            await manager.save(osItemOriginal);
            await devolucaoRepo.save(devolucao);

            // 3. Reavalia o status da fatura
            const outrasDevolucoesPendentes = await devolucaoRepo.count({
                where: {
                    idFatura: fatura.idFatura,
                    status: StatusDevolucao.PENDENTE,
                },
            });

            if (outrasDevolucoesPendentes === 0) {
                fatura.status = StatusFatura.ABERTA;
                await manager.getRepository(Fatura).save(fatura);
            }

            this.eventEmitter.emit('fatura.recalcular', { idFatura: fatura.idFatura });
            return devolucao;
        });
    }

    async listarDevolucoesPorFatura(idFatura: number): Promise<DevolucaoComponente[]> {
        return this.devolucaoRepository.find({
            where: { idFatura },
            relations: ['ordemServicoItem'],
            order: { dataSolicitacao: 'DESC' },
        });
    }

    async listarComponentesPendentes(idEmpresa?: number): Promise<DevolucaoComponente[]> {
        const queryBuilder = this.devolucaoRepository.createQueryBuilder('devolucao')
            .leftJoinAndSelect('devolucao.fatura', 'fatura')
            .leftJoinAndSelect('fatura.empresa', 'empresa')
            .leftJoinAndSelect('devolucao.ordemServicoItem', 'ordemServicoItem')
            .leftJoinAndSelect('ordemServicoItem.ordemServico', 'ordemServico')
            .leftJoinAndSelect('ordemServico.trabalho', 'trabalho')
            .where('devolucao.status = :status', { status: StatusDevolucao.PENDENTE })
            .orderBy('devolucao.dataSolicitacao', 'DESC');

        if (idEmpresa) {
            queryBuilder.andWhere('fatura.idEmpresa = :idEmpresa', { idEmpresa });
        }

        return queryBuilder.getMany();
    }

    async listarComponentesConcluidos(idEmpresa?: number): Promise<DevolucaoComponente[]> {
        const queryBuilder = this.devolucaoRepository.createQueryBuilder('devolucao')
            .leftJoinAndSelect('devolucao.fatura', 'fatura')
            .leftJoinAndSelect('fatura.empresa', 'empresa')
            .leftJoinAndSelect('devolucao.ordemServicoItem', 'ordemServicoItem')
            .leftJoinAndSelect('ordemServicoItem.ordemServico', 'ordemServico')
            .leftJoinAndSelect('ordemServico.trabalho', 'trabalho')
            .where('devolucao.status = :status', { status: StatusDevolucao.CONCLUIDO })
            .orderBy('devolucao.dataConferencia', 'DESC');

        if (idEmpresa) {
            queryBuilder.andWhere('fatura.idEmpresa = :idEmpresa', { idEmpresa });
        }

        return queryBuilder.getMany();
    }


    async buscarHistoricoBaixas(idEmpresa: number, dataInicio: string, dataFim: string): Promise<DevolucaoComponente[]> {
        const queryBuilder = this.devolucaoRepository.createQueryBuilder('devolucao')
            .leftJoin('devolucao.fatura', 'fatura')
            .leftJoinAndSelect('devolucao.ordemServicoItem', 'ordemServicoItem')
            .leftJoinAndSelect('ordemServicoItem.ordemServico', 'ordemServico')
            .leftJoinAndSelect('ordemServico.trabalho', 'trabalho')
            .where('devolucao.status = :status', { status: StatusDevolucao.CONCLUIDO })
            .andWhere('devolucao.dataConferencia BETWEEN :dataInicio AND :dataFim', {
                dataInicio: this.extractDateString(dataInicio),
                dataFim: this.extractDateString(dataFim)
            })
            .orderBy('devolucao.dataConferencia', 'DESC');

        if (idEmpresa && idEmpresa !== -1) {
            queryBuilder.andWhere('fatura.idEmpresa = :idEmpresa', { idEmpresa });
        }

        return queryBuilder.getMany();
    }

    private extractDateString(dateStr: string): string {
        if (!dateStr) return dateStr;
        if (dateStr.includes('T')) {
            return dateStr.split('T')[0];
        }
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) {
            return dateStr;
        }
        const year = d.getUTCFullYear();
        const month = String(d.getUTCMonth() + 1).padStart(2, '0');
        const day = String(d.getUTCDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    private getInicioDia(data: Date) {
        const inicio = new Date(data);
        inicio.setHours(0, 0, 0, 0);
        return inicio;
    }

    private getFimDia(data: Date) {
        const fim = new Date(data);
        fim.setHours(23, 59, 59, 999);
        return fim;
    }
}

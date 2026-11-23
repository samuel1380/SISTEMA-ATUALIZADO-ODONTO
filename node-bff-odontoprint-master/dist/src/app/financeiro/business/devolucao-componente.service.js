"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DevolucaoComponenteService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const ordemServicoItem_entity_1 = require("../../ordemServico/domain/ordemServicoItem.entity");
const event_emitter_1 = require("@nestjs/event-emitter");
const typeorm_2 = require("typeorm");
const devolucao_componente_entity_1 = require("../domain/devolucao-componente.entity");
const fatura_entity_1 = require("../domain/fatura.entity");
const estoque_service_1 = require("../../estoque/estoque/service/estoque.service");
const financeiro_service_1 = require("./financeiro.service");
const lancamento_entity_1 = require("../domain/lancamento.entity");
const ordemServico_entity_1 = require("../../ordemServico/domain/ordemServico.entity");
let DevolucaoComponenteService = class DevolucaoComponenteService {
    constructor(devolucaoRepository, faturaRepository, osItemRepository, lancamentoRepository, estoqueService, financeiroService, dataSource, eventEmitter) {
        this.devolucaoRepository = devolucaoRepository;
        this.faturaRepository = faturaRepository;
        this.osItemRepository = osItemRepository;
        this.lancamentoRepository = lancamentoRepository;
        this.estoqueService = estoqueService;
        this.financeiroService = financeiroService;
        this.dataSource = dataSource;
        this.eventEmitter = eventEmitter;
    }
    async solicitarDevolucao(dto) {
        return this.dataSource.transaction(async (manager) => {
            const faturaRepo = manager.getRepository(fatura_entity_1.Fatura);
            const osItemRepo = manager.getRepository(ordemServicoItem_entity_1.OrdemServicoItem);
            const devolucaoRepo = manager.getRepository(devolucao_componente_entity_1.DevolucaoComponente);
            const osRepo = manager.getRepository(ordemServico_entity_1.OrdemServico);
            const fatura = await faturaRepo.findOneBy({ idFatura: dto.idFatura });
            if (!fatura) {
                throw new common_1.NotFoundException(`Fatura com ID ${dto.idFatura} não encontrada.`);
            }
            if (!dto.itens || dto.itens.length === 0) {
                throw new common_1.BadRequestException('A lista de itens para devolução não pode estar vazia.');
            }
            const devolucoesParaSalvar = [];
            let valorTotalADeduzir = 0;
            const osValorADeduzir = new Map();
            for (const itemDevolucao of dto.itens) {
                const osItem = await osItemRepo.findOneBy({ idOrdemServicoItem: itemDevolucao.idOrdemServicoItem });
                if (!osItem) {
                    throw new common_1.NotFoundException(`Item de Ordem de Serviço com ID ${itemDevolucao.idOrdemServicoItem} não encontrado.`);
                }
                if (osItem.tipoCobranca !== 'componente') {
                    throw new common_1.BadRequestException(`A devolução só é permitida para itens do tipo "componente". Item ID: ${osItem.idOrdemServicoItem}.`);
                }
                if (itemDevolucao.quantidade > osItem.quantidade) {
                    throw new common_1.BadRequestException(`A quantidade a devolver (${itemDevolucao.quantidade}) não pode ser maior que a quantidade do item na fatura (${osItem.quantidade}) para o item ID ${osItem.idOrdemServicoItem}.`);
                }
                const devolucao = this.devolucaoRepository.create({
                    idFatura: dto.idFatura,
                    idOrdemServicoItem: itemDevolucao.idOrdemServicoItem,
                    quantidadeDevolvida: itemDevolucao.quantidade,
                    observacao: dto.observacao,
                    status: devolucao_componente_entity_1.StatusDevolucao.PENDENTE,
                });
                devolucoesParaSalvar.push(devolucao);
                const valorDevolvidoItem = osItem.valor * itemDevolucao.quantidade;
                valorTotalADeduzir += valorDevolvidoItem;
                const valorAtualOS = osValorADeduzir.get(osItem.idOrdemServico) || 0;
                osValorADeduzir.set(osItem.idOrdemServico, valorAtualOS + valorDevolvidoItem);
                const quantidadeJaDevolvida = osItem.quantidadeDevolvida || 0;
                const novaQuantidadeDevolvida = quantidadeJaDevolvida + itemDevolucao.quantidade;
                if (novaQuantidadeDevolvida > osItem.quantidade) {
                    throw new common_1.BadRequestException(`A quantidade total a devolver (${novaQuantidadeDevolvida}) excede a quantidade do item (${osItem.quantidade}) para o item ID ${osItem.idOrdemServicoItem}.`);
                }
                osItem.quantidadeDevolvida = novaQuantidadeDevolvida;
                osItem.status = ordemServicoItem_entity_1.StatusOrdemServicoItem.DEVOLUCAO_SOLICITADA;
                await osItemRepo.save(osItem);
            }
            for (const [idOrdemServico, valorADeduzir] of osValorADeduzir.entries()) {
                const os = await osRepo.findOneBy({ idOrdemServico });
                if (os) {
                    os.valorTotal = Number(os.valorTotal) - valorADeduzir;
                    await osRepo.save(os);
                }
            }
            fatura.status = fatura_entity_1.StatusFatura.AGUARDANDO_DEVOLUCAO;
            await faturaRepo.save(fatura);
            const devolucoesSalvas = await devolucaoRepo.save(devolucoesParaSalvar);
            this.eventEmitter.emit('fatura.recalcular', { idFatura: fatura.idFatura });
            return devolucoesSalvas;
        });
    }
    async confirmarRecebimento(idDevolucao, currentUser) {
        return this.dataSource.transaction(async (manager) => {
            const devolucaoRepo = manager.getRepository(devolucao_componente_entity_1.DevolucaoComponente);
            const devolucao = await devolucaoRepo.findOne({
                where: { idDevolucao },
                relations: ['ordemServicoItem', 'fatura'],
            });
            if (!devolucao) {
                throw new common_1.NotFoundException(`Devolução com ID ${idDevolucao} não encontrada.`);
            }
            if (devolucao.status !== devolucao_componente_entity_1.StatusDevolucao.PENDENTE) {
                throw new common_1.BadRequestException(`A devolução deve estar com status PENDENTE para ser conferida.`);
            }
            devolucao.status = devolucao_componente_entity_1.StatusDevolucao.CONFERIDO;
            devolucao.dataConferencia = new Date();
            const osItem = devolucao.ordemServicoItem;
            const fatura = devolucao.fatura;
            await this.estoqueService.creditarEstoqueDevolucao({
                idComponente: osItem.idReferencia,
                idEmpresa: fatura.idEmpresa,
                quantidade: devolucao.quantidadeDevolvida,
                motivo: `Devolução referente à Fatura #${fatura.idFatura} (Item OS: ${osItem.idOrdemServicoItem})`,
                currentUser,
            });
            devolucao.status = devolucao_componente_entity_1.StatusDevolucao.CONCLUIDO;
            const osItemOriginal = await manager.getRepository(ordemServicoItem_entity_1.OrdemServicoItem).findOneBy({ idOrdemServicoItem: devolucao.idOrdemServicoItem });
            osItemOriginal.status = ordemServicoItem_entity_1.StatusOrdemServicoItem.DEVOLVIDO;
            await manager.save(osItemOriginal);
            await devolucaoRepo.save(devolucao);
            const outrasDevolucoesPendentes = await devolucaoRepo.count({
                where: {
                    idFatura: fatura.idFatura,
                    status: devolucao_componente_entity_1.StatusDevolucao.PENDENTE,
                },
            });
            if (outrasDevolucoesPendentes === 0) {
                fatura.status = fatura_entity_1.StatusFatura.ABERTA;
                await manager.getRepository(fatura_entity_1.Fatura).save(fatura);
            }
            this.eventEmitter.emit('fatura.recalcular', { idFatura: fatura.idFatura });
            return devolucao;
        });
    }
    async listarDevolucoesPorFatura(idFatura) {
        return this.devolucaoRepository.find({
            where: { idFatura },
            relations: ['ordemServicoItem'],
            order: { dataSolicitacao: 'DESC' },
        });
    }
    async listarComponentesPendentes(idEmpresa) {
        const queryBuilder = this.devolucaoRepository.createQueryBuilder('devolucao')
            .leftJoinAndSelect('devolucao.fatura', 'fatura')
            .leftJoinAndSelect('fatura.empresa', 'empresa')
            .leftJoinAndSelect('devolucao.ordemServicoItem', 'ordemServicoItem')
            .leftJoinAndSelect('ordemServicoItem.ordemServico', 'ordemServico')
            .leftJoinAndSelect('ordemServico.trabalho', 'trabalho')
            .where('devolucao.status = :status', { status: devolucao_componente_entity_1.StatusDevolucao.PENDENTE })
            .orderBy('devolucao.dataSolicitacao', 'DESC');
        if (idEmpresa) {
            queryBuilder.andWhere('fatura.idEmpresa = :idEmpresa', { idEmpresa });
        }
        return queryBuilder.getMany();
    }
    async listarComponentesConcluidos(idEmpresa) {
        const queryBuilder = this.devolucaoRepository.createQueryBuilder('devolucao')
            .leftJoinAndSelect('devolucao.fatura', 'fatura')
            .leftJoinAndSelect('fatura.empresa', 'empresa')
            .leftJoinAndSelect('devolucao.ordemServicoItem', 'ordemServicoItem')
            .leftJoinAndSelect('ordemServicoItem.ordemServico', 'ordemServico')
            .leftJoinAndSelect('ordemServico.trabalho', 'trabalho')
            .where('devolucao.status = :status', { status: devolucao_componente_entity_1.StatusDevolucao.CONCLUIDO })
            .orderBy('devolucao.dataConferencia', 'DESC');
        if (idEmpresa) {
            queryBuilder.andWhere('fatura.idEmpresa = :idEmpresa', { idEmpresa });
        }
        return queryBuilder.getMany();
    }
    async buscarHistoricoBaixas(idEmpresa, dataInicio, dataFim) {
        const queryBuilder = this.devolucaoRepository.createQueryBuilder('devolucao')
            .leftJoin('devolucao.fatura', 'fatura')
            .leftJoinAndSelect('devolucao.ordemServicoItem', 'ordemServicoItem')
            .leftJoinAndSelect('ordemServicoItem.ordemServico', 'ordemServico')
            .leftJoinAndSelect('ordemServico.trabalho', 'trabalho')
            .where('devolucao.status = :status', { status: devolucao_componente_entity_1.StatusDevolucao.CONCLUIDO })
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
    extractDateString(dateStr) {
        if (!dateStr)
            return dateStr;
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
    getInicioDia(data) {
        const inicio = new Date(data);
        inicio.setHours(0, 0, 0, 0);
        return inicio;
    }
    getFimDia(data) {
        const fim = new Date(data);
        fim.setHours(23, 59, 59, 999);
        return fim;
    }
};
exports.DevolucaoComponenteService = DevolucaoComponenteService;
exports.DevolucaoComponenteService = DevolucaoComponenteService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(devolucao_componente_entity_1.DevolucaoComponente)),
    __param(1, (0, typeorm_1.InjectRepository)(fatura_entity_1.Fatura)),
    __param(2, (0, typeorm_1.InjectRepository)(ordemServicoItem_entity_1.OrdemServicoItem)),
    __param(3, (0, typeorm_1.InjectRepository)(lancamento_entity_1.Lancamento)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        estoque_service_1.EstoqueService,
        financeiro_service_1.FinanceiroService,
        typeorm_2.DataSource,
        event_emitter_1.EventEmitter2])
], DevolucaoComponenteService);
//# sourceMappingURL=devolucao-componente.service.js.map
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
var FaturaService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FaturaService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const event_emitter_1 = require("@nestjs/event-emitter");
const ordemServico_entity_1 = require("../../ordemServico/domain/ordemServico.entity");
const typeorm_2 = require("typeorm");
const fatura_entity_1 = require("../domain/fatura.entity");
const financeiro_service_1 = require("./financeiro.service");
const parcela_entity_1 = require("../domain/parcela.entity");
const tipo_lancamento_enum_1 = require("../domain/tipo-lancamento.enum");
const ordemServicoItem_entity_1 = require("../../ordemServico/domain/ordemServicoItem.entity");
const conta_entity_1 = require("../domain/conta.entity");
const movimentacao_entity_1 = require("../domain/movimentacao.entity");
const trabalho_entity_1 = require("../../trabalho/domain/trabalho.entity");
const lancamento_entity_1 = require("../domain/lancamento.entity");
const parcela_entity_2 = require("../domain/parcela.entity");
const trabalho_service_1 = require("../../trabalho/business/trabalho.service");
const devolucao_componente_entity_1 = require("../domain/devolucao-componente.entity");
const fatura_devolucao_item_entity_1 = require("../domain/fatura-devolucao-item.entity");
const componente_entity_1 = require("../../componente/domain/componente.entity");
const data_financeiro_util_1 = require("../utils/data-financeiro.util");
function formatDataLocalYYYYMMDD(d) {
    return (0, data_financeiro_util_1.formatDataYYYYMMDD)(d);
}
let FaturaService = FaturaService_1 = class FaturaService {
    constructor(faturaRepository, osRepository, osItemRepository, trabalhoRepository, financeiroService, dataSource, trabalhoService, faturaDevolucaoItemRepository, componenteRepository) {
        this.faturaRepository = faturaRepository;
        this.osRepository = osRepository;
        this.osItemRepository = osItemRepository;
        this.trabalhoRepository = trabalhoRepository;
        this.financeiroService = financeiroService;
        this.dataSource = dataSource;
        this.trabalhoService = trabalhoService;
        this.faturaDevolucaoItemRepository = faturaDevolucaoItemRepository;
        this.componenteRepository = componenteRepository;
        this.logger = new common_1.Logger(FaturaService_1.name);
        this.recalculosEmAndamento = new Set();
    }
    async criarFatura(dto) {
        return this.dataSource.transaction(async (manager) => {
            const faturaRepo = manager.getRepository(fatura_entity_1.Fatura);
            const osRepo = manager.getRepository(ordemServico_entity_1.OrdemServico);
            const osItemRepo = manager.getRepository(ordemServicoItem_entity_1.OrdemServicoItem);
            const dataInicio = (0, data_financeiro_util_1.parseDataParaDataLocal)(dto.dataInicio);
            const dataFim = (0, data_financeiro_util_1.parseDataParaDataLocal)(dto.dataFim);
            const faturaExistente = await faturaRepo.findOne({
                where: {
                    idEmpresa: dto.idEmpresa,
                    status: fatura_entity_1.StatusFatura.ABERTA,
                    dataInicio: dataInicio,
                    dataFim: dataFim,
                },
            });
            if (faturaExistente) {
                this.logger.log(`Fatura aberta (ID: ${faturaExistente.idFatura}) encontrada. Verificando novas OS para adicionar...`);
                const dataFimBusca = new Date(`${dto.dataFim}T23:59:59.999`);
                const novasOrdensParaAdicionar = await osRepo.find({
                    where: {
                        idEmpresa: dto.idEmpresa,
                        fatura: (0, typeorm_2.IsNull)(),
                        status: ordemServico_entity_1.StatusOrdemServico.RECEBER,
                        concluido: true,
                        dataConcluido: (0, typeorm_2.Between)(dataInicio, dataFimBusca),
                    },
                });
                if (novasOrdensParaAdicionar.length === 0) {
                    this.logger.log('Nenhuma nova Ordem de Serviço encontrada para adicionar à fatura existente.');
                    return faturaExistente;
                }
                await osRepo.update(novasOrdensParaAdicionar.map(os => os.idOrdemServico), { fatura: faturaExistente });
                const idsNovasOs = novasOrdensParaAdicionar.map(os => os.idOrdemServico);
                const itensNovasOs = await osItemRepo.find({
                    where: {
                        ordemServico: { idOrdemServico: (0, typeorm_2.In)(idsNovasOs) },
                        status: (0, typeorm_2.Not)(ordemServicoItem_entity_1.StatusOrdemServicoItem.DEVOLVIDO)
                    }
                });
                const idsItensParaAtualizar = itensNovasOs.map(item => item.idOrdemServicoItem);
                if (idsItensParaAtualizar.length > 0) {
                    await osItemRepo.update({ idOrdemServicoItem: (0, typeorm_2.In)(idsItensParaAtualizar) }, { status: ordemServicoItem_entity_1.StatusOrdemServicoItem.FATURADO });
                }
                return this.recalcularFaturaComManager(manager, faturaExistente.idFatura);
            }
            const dataFimBusca = new Date(`${dto.dataFim}T23:59:59.999`);
            const ordensParaFaturar = await osRepo.find({
                where: {
                    idEmpresa: dto.idEmpresa,
                    fatura: (0, typeorm_2.IsNull)(),
                    status: ordemServico_entity_1.StatusOrdemServico.RECEBER,
                    concluido: true,
                    dataConcluido: (0, typeorm_2.Between)(dataInicio, dataFimBusca),
                },
            });
            if (ordensParaFaturar.length === 0) {
                throw new common_1.NotFoundException(`Nenhuma Ordem de Serviço concluída e pendente de faturamento encontrada para a empresa ${dto.idEmpresa} no período de ${dto.dataInicio} a ${dto.dataFim}.`);
            }
            const valorTotal = ordensParaFaturar.reduce((sum, os) => sum + Number(os.valorTotal), 0);
            const dataVencimento = new Date(dataFim.getFullYear(), dataFim.getMonth() + 1, 20);
            const novaFatura = faturaRepo.create({
                idEmpresa: dto.idEmpresa,
                dataInicio: dataInicio,
                dataFim: dataFim,
                dataVencimento: dataVencimento,
                valorTotalBruto: valorTotal,
                desconto: 0,
                valorTotal: valorTotal,
                status: fatura_entity_1.StatusFatura.ABERTA,
                ordensDeServico: ordensParaFaturar,
            });
            const faturaSalva = await faturaRepo.save(novaFatura);
            const idsOs = ordensParaFaturar.map((os) => os.idOrdemServico);
            await osRepo.update(idsOs, { fatura: faturaSalva });
            const idsItens = ordensParaFaturar.flatMap(os => os.itens.map(item => item.idOrdemServicoItem));
            const itensParaAtualizar = await osItemRepo.find({
                where: {
                    idOrdemServicoItem: (0, typeorm_2.In)(idsItens),
                    status: (0, typeorm_2.Not)(ordemServicoItem_entity_1.StatusOrdemServicoItem.DEVOLVIDO)
                }
            });
            const idsItensParaAtualizar = itensParaAtualizar.map(item => item.idOrdemServicoItem);
            if (idsItensParaAtualizar.length > 0) {
                await osItemRepo.update({ idOrdemServicoItem: (0, typeorm_2.In)(idsItensParaAtualizar) }, { status: ordemServicoItem_entity_1.StatusOrdemServicoItem.FATURADO });
            }
            return faturaSalva;
        });
    }
    async removerItemDaFatura(idFatura, idOrdemServico) {
        return this.dataSource.transaction(async (manager) => {
            const faturaRepo = manager.getRepository(fatura_entity_1.Fatura);
            const osRepo = manager.getRepository(ordemServico_entity_1.OrdemServico);
            const fatura = await faturaRepo.findOne({ where: { idFatura }, relations: ['ordensDeServico'] });
            if (!fatura)
                throw new common_1.NotFoundException(`Fatura com ID ${idFatura} não encontrada.`);
            if (fatura.status !== fatura_entity_1.StatusFatura.ABERTA)
                throw new common_1.BadRequestException('Não é possível alterar uma fatura que não está aberta.');
            const osParaRemover = await osRepo.findOneBy({ idOrdemServico, fatura: { idFatura } });
            if (!osParaRemover)
                throw new common_1.NotFoundException(`Ordem de Serviço ${idOrdemServico} não encontrada nesta fatura.`);
            await osRepo.update(idOrdemServico, { fatura: null });
            await this.recalcularFaturaComManager(manager, idFatura);
            return this.buscarFaturaPorIdComManager(manager, idFatura);
        });
    }
    async moverOrdemServicoFatura(dto) {
        return this.dataSource.transaction(async (manager) => {
            const faturaRepo = manager.getRepository(fatura_entity_1.Fatura);
            const osRepo = manager.getRepository(ordemServico_entity_1.OrdemServico);
            const osItemRepo = manager.getRepository(ordemServicoItem_entity_1.OrdemServicoItem);
            const ordemServico = await osRepo.findOne({
                where: { idOrdemServico: dto.idOrdemServico },
                relations: ['fatura', 'empresa'],
            });
            if (!ordemServico) {
                throw new common_1.NotFoundException(`Ordem de Serviço com ID ${dto.idOrdemServico} não encontrada.`);
            }
            if (ordemServico.idEmpresa !== dto.idEmpresa) {
                throw new common_1.BadRequestException(`A Ordem de Serviço pertence à empresa ${ordemServico.idEmpresa}, mas foi informada a empresa ${dto.idEmpresa}.`);
            }
            const idEmpresa = dto.idEmpresa;
            let faturaOrigem = null;
            if (ordemServico.fatura) {
                faturaOrigem = await faturaRepo.findOne({
                    where: { idFatura: ordemServico.fatura.idFatura },
                });
                if (!faturaOrigem) {
                    throw new common_1.NotFoundException(`Fatura de origem não encontrada.`);
                }
                if (faturaOrigem.status !== fatura_entity_1.StatusFatura.ABERTA && faturaOrigem.status !== fatura_entity_1.StatusFatura.PAGA_PARCIALMENTE) {
                    throw new common_1.BadRequestException('Não é possível mover uma Ordem de Serviço de uma fatura que não está aberta.');
                }
                await osRepo.update(dto.idOrdemServico, { fatura: null });
            }
            let faturaDestino;
            if (dto.idFaturaDestino) {
                faturaDestino = await faturaRepo.findOne({
                    where: { idFatura: dto.idFaturaDestino },
                });
                if (!faturaDestino) {
                    throw new common_1.NotFoundException(`Fatura de destino com ID ${dto.idFaturaDestino} não encontrada.`);
                }
                if (faturaDestino.idEmpresa !== idEmpresa) {
                    throw new common_1.BadRequestException('A fatura de destino deve pertencer à mesma empresa da Ordem de Serviço.');
                }
                if (faturaDestino.status !== fatura_entity_1.StatusFatura.ABERTA) {
                    throw new common_1.BadRequestException('Não é possível mover uma Ordem de Serviço para uma fatura que não está aberta.');
                }
            }
            else if (dto.anoDestino && dto.mesDestino) {
                const ano = Number(dto.anoDestino);
                const mes = Number(dto.mesDestino);
                if (isNaN(ano) || isNaN(mes) || mes < 1 || mes > 12) {
                    throw new common_1.BadRequestException('Mês/ano de destino inválido.');
                }
                faturaDestino = await this.obterOuCriarFaturaParaMesAno(manager, idEmpresa, ano, mes);
            }
            else {
                const infoRef = (0, data_financeiro_util_1.extrairAnoMesDia)(faturaOrigem ? faturaOrigem.dataFim : new Date());
                if (!infoRef) {
                    throw new common_1.BadRequestException('Não foi possível determinar a competência de referência.');
                }
                faturaDestino = await this.buscarProximaFaturaDisponivel(manager, idEmpresa, infoRef.ano, infoRef.mes - 1);
                if (!faturaDestino) {
                    throw new common_1.NotFoundException(`Não foi possível encontrar ou criar uma fatura para a competência ${infoRef.mes}/${infoRef.ano}.`);
                }
            }
            await osRepo.update(dto.idOrdemServico, { fatura: faturaDestino });
            const osComItens = await osRepo.findOne({
                where: { idOrdemServico: dto.idOrdemServico },
                relations: ['itens'],
            });
            if (osComItens === null || osComItens === void 0 ? void 0 : osComItens.itens) {
                const idsItens = osComItens.itens.map(item => item.idOrdemServicoItem);
                const itensParaAtualizar = await osItemRepo.find({
                    where: {
                        idOrdemServicoItem: (0, typeorm_2.In)(idsItens),
                        status: (0, typeorm_2.Not)(ordemServicoItem_entity_1.StatusOrdemServicoItem.DEVOLVIDO)
                    }
                });
                const idsItensParaAtualizar = itensParaAtualizar.map(item => item.idOrdemServicoItem);
                if (idsItensParaAtualizar.length > 0) {
                    await osItemRepo.update({ idOrdemServicoItem: (0, typeorm_2.In)(idsItensParaAtualizar) }, { status: ordemServicoItem_entity_1.StatusOrdemServicoItem.FATURADO });
                }
            }
            if (faturaOrigem) {
                await this.recalcularFaturaComManager(manager, faturaOrigem.idFatura);
            }
            await this.recalcularFaturaComManager(manager, faturaDestino.idFatura);
            const faturaAtualizada = await faturaRepo.findOne({
                where: { idFatura: faturaDestino.idFatura },
                relations: [
                    'ordensDeServico',
                    'ordensDeServico.trabalho',
                    'ordensDeServico.itens.devolucoes'
                ],
                order: {
                    ordensDeServico: {
                        trabalho: {
                            idTrabalho: 'ASC',
                        },
                    },
                },
            });
            return faturaAtualizada;
        });
    }
    async buscarOuCriarFaturaAberta(manager, idEmpresa, dataInicio, dataFim) {
        const faturaRepo = manager.getRepository(fatura_entity_1.Fatura);
        const dataInicioDate = new Date(`${dataInicio}T00:00:00`);
        const dataFimDate = new Date(`${dataFim}T00:00:00`);
        let fatura = await faturaRepo.findOne({
            where: {
                idEmpresa: idEmpresa,
                status: fatura_entity_1.StatusFatura.ABERTA,
                dataInicio: dataInicioDate,
                dataFim: dataFimDate,
            },
        });
        if (!fatura) {
            fatura = await faturaRepo.findOne({
                where: {
                    idEmpresa: idEmpresa,
                    status: fatura_entity_1.StatusFatura.ABERTA,
                    dataInicio: dataInicioDate,
                    dataFim: dataFimDate,
                },
                lock: { mode: 'pessimistic_write' },
            });
            if (!fatura) {
                const dataFimObj = new Date(dataFimDate);
                const dataVencimento = new Date(dataFimObj.getFullYear(), dataFimObj.getMonth() + 1, 20);
                fatura = faturaRepo.create({
                    idEmpresa: idEmpresa,
                    dataInicio: dataInicioDate,
                    dataFim: dataFimDate,
                    dataVencimento: dataVencimento,
                    valorTotalBruto: 0,
                    desconto: 0,
                    valorTotal: 0,
                    status: fatura_entity_1.StatusFatura.ABERTA,
                });
                fatura = await faturaRepo.save(fatura);
                this.logger.log(`Nova fatura criada (ID: ${fatura.idFatura}) para empresa ${idEmpresa} - período ${dataInicio} a ${dataFim}.`);
            }
            else {
                this.logger.log(`Fatura existente encontrada após lock (ID: ${fatura.idFatura}) para empresa ${idEmpresa} - período ${dataInicio} a ${dataFim}.`);
            }
        }
        else {
            this.logger.log(`Fatura existente encontrada (ID: ${fatura.idFatura}) para empresa ${idEmpresa} - período ${dataInicio} a ${dataFim}.`);
        }
        return fatura;
    }
    async buscarProximaFaturaDisponivel(manager, idEmpresa, anoInicial, mesInicial) {
        return this.obterOuCriarFaturaParaMesAno(manager, idEmpresa, anoInicial, mesInicial + 1);
    }
    async fecharFatura(idFatura) {
        const fatura = await this.faturaRepository.findOne({
            where: { idFatura },
            relations: ['ordensDeServico'],
        });
        if (!fatura)
            throw new common_1.NotFoundException(`Fatura com ID ${idFatura} não encontrada.`);
        if (fatura.status === fatura_entity_1.StatusFatura.AGUARDANDO_DEVOLUCAO) {
            throw new common_1.BadRequestException('Esta fatura possui devoluções pendentes e não pode ser fechada.');
        }
        if (fatura.status !== fatura_entity_1.StatusFatura.ABERTA)
            throw new common_1.BadRequestException(`Apenas faturas com status 'ABERTA' podem ser fechadas. Status atual: ${fatura.status}`);
        const dataCompetenciaString = formatDataLocalYYYYMMDD(fatura.dataInicio) || formatDataLocalYYYYMMDD(fatura.dataFim);
        const dataVencimentoString = formatDataLocalYYYYMMDD(fatura.dataVencimento);
        const lancamento = await this.financeiroService.criarLancamento({
            descricao: `Fatura #${fatura.idFatura} - Empresa ID ${fatura.idEmpresa}`,
            tipo: tipo_lancamento_enum_1.TipoLancamento.RECEITA,
            valorTotal: fatura.valorTotal,
            dataCompetencia: dataCompetenciaString,
            idClienteFornecedor: fatura.idEmpresa,
            idFatura: fatura.idFatura,
            idCategoria: 44,
            parcelas: [{
                    numeroParcela: 1,
                    valor: fatura.valorTotal,
                    dataVencimento: dataVencimentoString,
                    meioPagamento: parcela_entity_1.MeioPagamento.BOLETO,
                }]
        });
        fatura.status = fatura_entity_1.StatusFatura.FECHADA;
        await this.faturaRepository.save(fatura);
        return fatura;
    }
    async buscarFaturaPorId(idFatura) {
        const fatura = await this.faturaRepository.findOne({
            where: { idFatura },
            relations: [
                'empresa',
                'ordensDeServico',
                'ordensDeServico.trabalho',
                'ordensDeServico.itens.devolucoes',
            ],
            order: {
                ordensDeServico: {
                    trabalho: {
                        idTrabalho: 'ASC',
                    },
                },
            },
        });
        if (!fatura) {
            throw new common_1.NotFoundException(`Fatura com ID ${idFatura} não encontrada.`);
        }
        const [corrigida] = await this.corrigirStatusFaturas([fatura]);
        return corrigida !== null && corrigida !== void 0 ? corrigida : fatura;
    }
    async atualizarDescontoFatura(idFatura, desconto) {
        if (desconto < 0) {
            throw new common_1.BadRequestException('O desconto não pode ser negativo.');
        }
        return this.dataSource.transaction(async (manager) => {
            const faturaRepo = manager.getRepository(fatura_entity_1.Fatura);
            const fatura = await faturaRepo.findOneBy({ idFatura });
            if (!fatura) {
                throw new common_1.NotFoundException(`Fatura com ID ${idFatura} não encontrada.`);
            }
            fatura.desconto = desconto;
            await faturaRepo.save(fatura);
            this.logger.log(`Desconto atualizado para fatura ID ${idFatura}: R$ ${desconto}`);
            return this.recalcularFaturaComManager(manager, idFatura);
        });
    }
    async atualizarAnotacoesFatura(idFatura, anotacoes) {
        const fatura = await this.faturaRepository.findOneBy({ idFatura });
        if (!fatura) {
            throw new common_1.NotFoundException(`Fatura com ID ${idFatura} não encontrada.`);
        }
        fatura.anotacoes = anotacoes || null;
        await this.faturaRepository.save(fatura);
        this.logger.log(`Anotações atualizadas para fatura ID ${idFatura}`);
        return fatura;
    }
    async handleFaturaRecalcular(evento) {
        const { idFatura } = evento;
        if (this.recalculosEmAndamento.has(idFatura)) {
            this.logger.warn(`[Fatura ${idFatura}] Recálculo já em andamento, ignorando evento duplicado`);
            return;
        }
        try {
            this.recalculosEmAndamento.add(idFatura);
            await this.recalcularFatura(idFatura);
        }
        catch (error) {
            this.logger.error(`[Fatura ${idFatura}] Erro ao recalcular fatura: ${error.message}`, error.stack);
            throw error;
        }
        finally {
            this.recalculosEmAndamento.delete(idFatura);
        }
    }
    async recalcularFaturaComManager(manager, idFatura) {
        var _a, _b, _c;
        const faturaRepo = manager.getRepository(fatura_entity_1.Fatura);
        const osItemRepo = manager.getRepository(ordemServicoItem_entity_1.OrdemServicoItem);
        const osRepo = manager.getRepository(ordemServico_entity_1.OrdemServico);
        const fatura = await faturaRepo.findOneBy({ idFatura });
        if (!fatura) {
            throw new common_1.NotFoundException(`Fatura com ID ${idFatura} não encontrada.`);
        }
        if (fatura.status === fatura_entity_1.StatusFatura.PAGA || fatura.status === fatura_entity_1.StatusFatura.FECHADA || fatura.status === fatura_entity_1.StatusFatura.CANCELADA) {
            return fatura;
        }
        const itensComTrabalho = await osItemRepo
            .createQueryBuilder('item')
            .innerJoin('item.ordemServico', 'os')
            .innerJoin('TbTrabalho', 'trabalho', 'trabalho.idTrabalho = os.idTrabalho')
            .select([
            'item.idOrdemServicoItem',
            'item.idOrdemServico',
            'item.tipoCobranca',
            'item.valor',
            'item.valorTotal',
            'item.quantidade',
            'item.quantidadeDevolvida',
            'item.status',
            'trabalho.status'
        ])
            .where('os.idFatura = :idFatura', { idFatura })
            .getRawMany();
        let valorTotalCalculado = 0;
        let itensAtualizados = 0;
        const idsItensParaZerar = [];
        for (const itemRaw of itensComTrabalho) {
            const statusTrabalho = itemRaw.trabalho_status;
            const statusItem = itemRaw.item_status;
            const valor = Number(itemRaw.item_valor);
            const quantidade = Number(itemRaw.item_quantidade);
            const quantidadeDevolvida = Number(itemRaw.item_quantidadeDevolvida || 0);
            const idItem = itemRaw.item_idOrdemServicoItem;
            if (statusTrabalho === trabalho_entity_1.StatusTrabalho.CANCELADO) {
                if (valor !== 0) {
                    idsItensParaZerar.push(idItem);
                }
            }
            else if (statusItem === ordemServicoItem_entity_1.StatusOrdemServicoItem.DEVOLVIDO) {
                if (valor !== 0 || Number((_a = itemRaw.item_valorTotal) !== null && _a !== void 0 ? _a : 0) !== 0) {
                    idsItensParaZerar.push(idItem);
                }
                continue;
            }
            else {
                const quantidadeCobravel = quantidade - quantidadeDevolvida;
                if (quantidadeCobravel <= 0) {
                    continue;
                }
                valorTotalCalculado += valor * quantidadeCobravel;
            }
        }
        if (idsItensParaZerar.length > 0) {
            await osItemRepo.update({ idOrdemServicoItem: (0, typeorm_2.In)(idsItensParaZerar) }, { valor: 0, valorTotal: 0 });
            itensAtualizados = idsItensParaZerar.length;
        }
        fatura.valorTotalBruto = valorTotalCalculado;
        const desconto = Number(fatura.desconto || 0);
        const descontoDevolucao = Number(fatura.descontoDevolucao || 0);
        fatura.valorTotal = Math.max(0, valorTotalCalculado - desconto - descontoDevolucao);
        const vPago = Number((_b = fatura.valorPago) !== null && _b !== void 0 ? _b : 0);
        const vTotal = Number((_c = fatura.valorTotal) !== null && _c !== void 0 ? _c : 0);
        if (vTotal > 0 && vPago >= vTotal - 0.01) {
            fatura.status = fatura_entity_1.StatusFatura.PAGA;
        }
        else if (vPago > 0) {
            fatura.status = fatura_entity_1.StatusFatura.PAGA_PARCIALMENTE;
        }
        else if (fatura.status === fatura_entity_1.StatusFatura.AGUARDANDO_DEVOLUCAO) {
            fatura.status = fatura_entity_1.StatusFatura.AGUARDANDO_DEVOLUCAO;
        }
        else {
            fatura.status = fatura_entity_1.StatusFatura.ABERTA;
        }
        return faturaRepo.save(fatura);
    }
    async recalcularFatura(idFatura) {
        const fatura = await this.faturaRepository.findOneBy({ idFatura });
        if ((fatura === null || fatura === void 0 ? void 0 : fatura.status) === fatura_entity_1.StatusFatura.PAGA) {
            this.logger.log(`[Fatura ${idFatura}] Fatura paga não é recalculada.`);
            return this.buscarFaturaPorId(idFatura);
        }
        this.logger.log(`[Fatura ${idFatura}] Iniciando recálculo de preços...`);
        const rawIds = await this.osRepository
            .createQueryBuilder('os')
            .select('DISTINCT os.idTrabalho', 'idTrabalho')
            .where('os.idFatura = :idFatura', { idFatura })
            .getRawMany();
        const idsTrabalhos = rawIds.map(r => r.idTrabalho).filter((id) => id != null);
        if (idsTrabalhos.length > 0) {
            this.logger.log(`[Fatura ${idFatura}] Atualizando preços para ${idsTrabalhos.length} trabalho(s)...`);
            const currentUser = { user: { idUsuario: 1 } };
            try {
                await this.trabalhoService.atualizarPrecosOrdemServicoEmLote(currentUser, idFatura, idsTrabalhos);
                this.logger.log(`[Fatura ${idFatura}] Preços atualizados com sucesso para ${idsTrabalhos.length} trabalho(s)`);
            }
            catch (error) {
                this.logger.error(`[Fatura ${idFatura}] Erro ao atualizar preços em lote: ${error.message}`, error.stack);
                throw error;
            }
        }
        else {
            this.logger.log(`[Fatura ${idFatura}] Nenhum trabalho encontrado para recalcular`);
        }
        return this.dataSource.transaction(async (manager) => {
            return this.recalcularFaturaComManager(manager, idFatura);
        });
    }
    async recalcularFaturasEmAberto() {
        const statusesParaRecalcular = [
            fatura_entity_1.StatusFatura.ABERTA,
            fatura_entity_1.StatusFatura.AGUARDANDO_DEVOLUCAO,
            fatura_entity_1.StatusFatura.PAGA_PARCIALMENTE
        ];
        const faturas = await this.faturaRepository.find({
            where: { status: (0, typeorm_2.In)(statusesParaRecalcular) }
        });
        if (faturas.length === 0) {
            return { success: true, message: 'Nenhuma fatura em aberto para recalcular.', recalculadas: 0 };
        }
        for (const fatura of faturas) {
            await this.recalcularFatura(fatura.idFatura);
        }
        return { success: true, message: `${faturas.length} faturas foram recalculadas com sucesso.`, recalculadas: faturas.length };
    }
    async pagarItemFatura(dto) {
        return this.dataSource.transaction(async (manager) => {
            var _a;
            const faturaRepo = manager.getRepository(fatura_entity_1.Fatura);
            const osItemRepo = manager.getRepository(ordemServicoItem_entity_1.OrdemServicoItem);
            const contaRepo = manager.getRepository(conta_entity_1.Conta);
            const movRepo = manager.getRepository(movimentacao_entity_1.Movimentacao);
            const ordemServicoRepo = manager.getRepository(ordemServico_entity_1.OrdemServico);
            const fatura = await faturaRepo.findOne({
                where: { idFatura: dto.idFatura },
                lock: { mode: 'pessimistic_write' }
            });
            if (!fatura)
                throw new common_1.NotFoundException(`Fatura com ID ${dto.idFatura} não encontrada.`);
            if (fatura.status === fatura_entity_1.StatusFatura.PAGA || fatura.status === fatura_entity_1.StatusFatura.CANCELADA) {
                throw new common_1.BadRequestException(`Fatura com status ${fatura.status} não pode receber pagamentos.`);
            }
            const conta = await contaRepo.findOne({
                where: { idConta: dto.idConta },
                lock: { mode: 'pessimistic_write' }
            });
            if (!conta)
                throw new common_1.NotFoundException(`Conta com ID ${dto.idConta} não encontrada.`);
            const idsTrabalhosParaAtualizar = new Set();
            const idsOsParaAtualizar = new Set();
            for (const itemPagamento of dto.itens) {
                const osItem = await osItemRepo.findOne({
                    where: { idOrdemServicoItem: itemPagamento.idOrdemServicoItem },
                    lock: { mode: 'pessimistic_write' }
                });
                if (!osItem)
                    throw new common_1.NotFoundException(`Item de Ordem de Serviço com ID ${itemPagamento.idOrdemServicoItem} não encontrado.`);
                idsOsParaAtualizar.add(osItem.idOrdemServico);
                const valorRestanteItem = Number(osItem.valorTotal) - Number(osItem.valorPago);
                if (itemPagamento.valor > valorRestanteItem + 0.001) {
                    throw new common_1.BadRequestException(`O valor a pagar (R$ ${osItem.valor}) para o item ${osItem.idOrdemServicoItem} não pode ser maior que o valor restante (R$ ${valorRestanteItem}).`);
                }
                const valorDoPagamento = Number(osItem.valor) * (osItem.quantidade - osItem.quantidadeDevolvida);
                const movimentacao = movRepo.create({
                    idConta: dto.idConta,
                    tipo: movimentacao_entity_1.TipoMovimentacao.CREDITO,
                    valor: valorDoPagamento,
                    descricao: `Pagamento do item #${osItem.idOrdemServicoItem} (${osItem.descricao}) da Fatura #${fatura.idFatura}`,
                    dataMovimentacao: new Date(dto.dataPagamento),
                });
                await movRepo.save(movimentacao);
                conta.saldoAtual = Number(conta.saldoAtual) + valorDoPagamento;
                osItem.valorPago = valorDoPagamento;
                fatura.valorPago = Number(fatura.valorPago) + valorDoPagamento;
                if (Number(osItem.valorTotal) - osItem.valorPago < 0.01) {
                    osItem.valorPago = osItem.valorTotal;
                    osItem.status = ordemServicoItem_entity_1.StatusOrdemServicoItem.PAGO;
                }
                await osItemRepo.save(osItem);
                if (osItem.status === ordemServicoItem_entity_1.StatusOrdemServicoItem.PAGO) {
                    const itensPendentesDaOS = await osItemRepo.count({
                        where: {
                            idOrdemServico: osItem.idOrdemServico,
                            status: (0, typeorm_2.In)([ordemServicoItem_entity_1.StatusOrdemServicoItem.PENDENTE, ordemServicoItem_entity_1.StatusOrdemServicoItem.FATURADO, ordemServicoItem_entity_1.StatusOrdemServicoItem.DEVOLUCAO_SOLICITADA])
                        }
                    });
                    if (itensPendentesDaOS === 0) {
                        const osCompleta = await manager.getRepository(ordemServico_entity_1.OrdemServico).findOne({
                            where: { idOrdemServico: osItem.idOrdemServico },
                            relations: ['trabalho']
                        });
                        if (osCompleta && osCompleta.trabalho) {
                            idsTrabalhosParaAtualizar.add(osCompleta.trabalho.idTrabalho);
                            await manager.getRepository(trabalho_entity_1.Trabalho).update({ idTrabalho: osCompleta.trabalho.idTrabalho }, {
                                finalizado: true,
                            });
                        }
                    }
                }
            }
            await contaRepo.save(conta);
            const valorRestanteFatura = Number(fatura.valorTotal) - Number((_a = fatura.valorPago) !== null && _a !== void 0 ? _a : 0);
            if (valorRestanteFatura < 0.01) {
                fatura.status = fatura_entity_1.StatusFatura.PAGA;
                if (idsOsParaAtualizar.size > 0) {
                    await osItemRepo.update({ idOrdemServico: (0, typeorm_2.In)(Array.from(idsOsParaAtualizar)) }, { status: ordemServicoItem_entity_1.StatusOrdemServicoItem.PAGO });
                }
                const todasAsOsDaFatura = await ordemServicoRepo.find({ where: { idFatura: fatura.idFatura }, select: ['idTrabalho'] });
                todasAsOsDaFatura.forEach(os => idsTrabalhosParaAtualizar.add(os.idTrabalho));
                if (idsTrabalhosParaAtualizar.size > 0) {
                    await manager.getRepository(trabalho_entity_1.Trabalho).update({ idTrabalho: (0, typeorm_2.In)(Array.from(idsTrabalhosParaAtualizar)) }, {
                        finalizado: true,
                    });
                }
            }
            else {
                fatura.status = fatura_entity_1.StatusFatura.PAGA_PARCIALMENTE;
            }
            await faturaRepo.save(fatura);
            return this.buscarFaturaPorId(fatura.idFatura);
        });
    }
    async listarFaturas(currentUser, idEmpresa, status, competencia) {
        var _a, _b, _c, _d;
        const isAdmin = (_c = (_b = (_a = currentUser === null || currentUser === void 0 ? void 0 : currentUser.user) === null || _a === void 0 ? void 0 : _a.permissoes) === null || _b === void 0 ? void 0 : _b.some(permissao => permissao === 'admin')) !== null && _c !== void 0 ? _c : false;
        const whereClause = {};
        if (isAdmin) {
            if (idEmpresa) {
                whereClause.idEmpresa = idEmpresa;
            }
        }
        else {
            if (!((_d = currentUser === null || currentUser === void 0 ? void 0 : currentUser.user) === null || _d === void 0 ? void 0 : _d.idEmpresa)) {
                throw new common_1.BadRequestException('Não foi possível identificar a empresa do usuário.');
            }
            whereClause.idEmpresa = currentUser.user.idEmpresa;
        }
        if (status && status.length > 0) {
            whereClause.status = (0, typeorm_2.In)(status);
        }
        if (competencia) {
            const competenciaRegex = /^(\d{1,2})\/(\d{4})$/;
            const match = competencia.match(competenciaRegex);
            if (!match) {
                throw new common_1.BadRequestException('Formato de competência inválido. Use o formato MM/YYYY (ex: 11/2025)');
            }
            const mes = parseInt(match[1], 10);
            const ano = parseInt(match[2], 10);
            if (mes < 1 || mes > 12) {
                throw new common_1.BadRequestException('Mês inválido. O mês deve estar entre 1 e 12.');
            }
            const primeiroDiaMes = new Date(ano, mes - 1, 1);
            const ultimoDiaMes = new Date(ano, mes, 0);
            const dataInicioStr = `${ano}-${String(mes).padStart(2, '0')}-01`;
            const dataFimStr = `${ano}-${String(mes).padStart(2, '0')}-${String(ultimoDiaMes.getDate()).padStart(2, '0')}`;
            const dataInicioDate = new Date(`${dataInicioStr}T00:00:00`);
            const dataFimDate = new Date(`${dataFimStr}T23:59:59`);
            const queryBuilder = this.faturaRepository.createQueryBuilder('fatura');
            queryBuilder.where('fatura.dataInicio <= :dataFim', { dataFim: dataFimDate });
            queryBuilder.andWhere('fatura.dataFim >= :dataInicio', { dataInicio: dataInicioDate });
            if (whereClause.idEmpresa) {
                queryBuilder.andWhere('fatura.idEmpresa = :idEmpresa', { idEmpresa: whereClause.idEmpresa });
            }
            if (status && status.length > 0) {
                queryBuilder.andWhere('fatura.status IN (:...status)', { status: status });
            }
            queryBuilder.leftJoinAndSelect('fatura.empresa', 'empresa');
            queryBuilder.orderBy('empresa.nome', 'ASC');
            queryBuilder.addOrderBy('fatura.dataVencimento', 'ASC');
            const faturas = await queryBuilder.getMany();
            return this.corrigirStatusFaturas(faturas);
        }
        const queryBuilder = this.faturaRepository.createQueryBuilder('fatura');
        queryBuilder.leftJoinAndSelect('fatura.empresa', 'empresa');
        if (whereClause.idEmpresa) {
            queryBuilder.andWhere('fatura.idEmpresa = :idEmpresa', { idEmpresa: whereClause.idEmpresa });
        }
        if (status && status.length > 0) {
            queryBuilder.andWhere('fatura.status IN (:...status)', { status: status });
        }
        queryBuilder.orderBy('empresa.nome', 'ASC');
        queryBuilder.addOrderBy('fatura.dataVencimento', 'ASC');
        const faturas = await queryBuilder.getMany();
        return this.corrigirStatusFaturas(faturas);
    }
    async corrigirStatusFaturas(faturas) {
        if (!(faturas === null || faturas === void 0 ? void 0 : faturas.length))
            return faturas;
        const ids = faturas.map((f) => f.idFatura);
        const rows = await this.faturaRepository
            .createQueryBuilder('f')
            .select('f.idFatura', 'idFatura')
            .addSelect('f.status', 'status')
            .where('f.idFatura IN (:...ids)', { ids })
            .getRawMany();
        const mapStatus = new Map(rows.map((r) => [r.idFatura, r.status]));
        faturas.forEach((f) => {
            const s = mapStatus.get(f.idFatura);
            if (s !== undefined)
                f.status = s;
        });
        return faturas;
    }
    async corrigirStatusFaturasQuitadas() {
        const qb = this.faturaRepository
            .createQueryBuilder('f')
            .select('f.idFatura', 'idFatura')
            .addSelect('f.valorTotal', 'valorTotal')
            .addSelect('f.valorPago', 'valorPago')
            .where('f.status != :paga', { paga: fatura_entity_1.StatusFatura.PAGA });
        const rows = await qb.getRawMany();
        const idsParaAtualizar = rows
            .filter((r) => { var _a, _b; return Number((_a = r.valorPago) !== null && _a !== void 0 ? _a : 0) >= Number((_b = r.valorTotal) !== null && _b !== void 0 ? _b : 0) - 0.01; })
            .map((r) => r.idFatura);
        if (idsParaAtualizar.length === 0) {
            return { atualizadas: 0, ids: [] };
        }
        await this.faturaRepository.update({ idFatura: (0, typeorm_2.In)(idsParaAtualizar) }, { status: fatura_entity_1.StatusFatura.PAGA });
        this.logger.log(`Corrigidas ${idsParaAtualizar.length} fatura(s) quitadas com status incorreto: ${idsParaAtualizar.join(', ')}`);
        return { atualizadas: idsParaAtualizar.length, ids: idsParaAtualizar };
    }
    async relatorioFaturasPendentes(currentUser) {
        var _a, _b;
        const statusPendentes = [
            fatura_entity_1.StatusFatura.ABERTA,
            fatura_entity_1.StatusFatura.PAGA_PARCIALMENTE,
            fatura_entity_1.StatusFatura.AGUARDANDO_DEVOLUCAO,
        ];
        const todasPendentes = await this.listarFaturas(currentUser, undefined, statusPendentes, undefined);
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        const faturas = todasPendentes.filter((f) => {
            const venc = new Date(f.dataVencimento);
            venc.setHours(0, 0, 0, 0);
            return venc < hoje;
        });
        const mapaPorEmpresa = new Map();
        for (const fatura of faturas) {
            const idEmpresa = fatura.idEmpresa;
            const empresa = fatura.empresa;
            const nomeEmpresa = (_b = (_a = empresa === null || empresa === void 0 ? void 0 : empresa.nomeFantasia) !== null && _a !== void 0 ? _a : empresa === null || empresa === void 0 ? void 0 : empresa.nome) !== null && _b !== void 0 ? _b : `Empresa ${idEmpresa}`;
            const partesContato = [];
            if (empresa === null || empresa === void 0 ? void 0 : empresa.email)
                partesContato.push(empresa.email);
            if (empresa === null || empresa === void 0 ? void 0 : empresa.telefone)
                partesContato.push(empresa.telefone);
            if (empresa === null || empresa === void 0 ? void 0 : empresa.nomeResponsavel)
                partesContato.push(empresa.nomeResponsavel);
            const contato = partesContato.length > 0 ? partesContato.join(' | ') : '—';
            const valorTotal = Number(fatura.valorTotal) || 0;
            const valorPago = Number(fatura.valorPago) || 0;
            const valorPendente = Math.max(0, valorTotal - valorPago);
            if (!mapaPorEmpresa.has(idEmpresa)) {
                mapaPorEmpresa.set(idEmpresa, {
                    idEmpresa,
                    nomeEmpresa,
                    contato,
                    totalPendenteEmpresa: 0,
                    faturas: [],
                });
            }
            const grupo = mapaPorEmpresa.get(idEmpresa);
            grupo.faturas.push({
                idFatura: fatura.idFatura,
                dataInicio: fatura.dataInicio,
                dataFim: fatura.dataFim,
                dataVencimento: fatura.dataVencimento,
                valorTotal,
                valorPago,
                valorPendente,
            });
            grupo.totalPendenteEmpresa += valorPendente;
        }
        const empresas = Array.from(mapaPorEmpresa.values());
        const totalGeralPendente = empresas.reduce((s, e) => s + e.totalPendenteEmpresa, 0);
        return { empresas, totalGeralPendente };
    }
    async listarFaturasAbertasPorEmpresa(idEmpresa) {
        return this.faturaRepository.find({
            where: {
                idEmpresa: idEmpresa,
                status: fatura_entity_1.StatusFatura.ABERTA,
            },
            relations: ['empresa', 'ordensDeServico'],
            order: { dataFim: 'DESC' },
        });
    }
    async obterResumoImpressaoFatura(idFatura) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x;
        const fatura = await this.faturaRepository
            .createQueryBuilder('fatura')
            .where('fatura.idFatura = :idFatura', { idFatura })
            .leftJoinAndSelect('fatura.empresa', 'empresa')
            .leftJoinAndSelect('fatura.ordensDeServico', 'ordensDeServico')
            .leftJoinAndSelect('ordensDeServico.trabalho', 'trabalho')
            .leftJoinAndSelect('trabalho.paciente', 'paciente')
            .leftJoinAndSelect('trabalho.servicos', 'servicos')
            .leftJoinAndSelect('servicos.elementos', 'elementos')
            .leftJoinAndSelect('ordensDeServico.itens', 'itens')
            .leftJoinAndSelect('itens.devolucoes', 'itensDevolucoes')
            .leftJoinAndSelect('fatura.devolucoesComponentes', 'devolucoesComponentes')
            .leftJoinAndSelect('devolucoesComponentes.componente', 'componente')
            .orderBy('ordensDeServico.idTrabalho', 'ASC')
            .getOne();
        if (!fatura) {
            throw new common_1.NotFoundException(`Fatura com ID ${idFatura} não encontrada.`);
        }
        const servicos = [];
        const componentes = [];
        let valorTotalServicos = 0;
        let valorTotalComponentes = 0;
        if (fatura.ordensDeServico) {
            for (const os of fatura.ordensDeServico) {
                const trabalho = os.trabalho;
                const indiceServicoPorProduto = new Map();
                if (os.itens) {
                    const itensOrdenados = [...os.itens].sort((a, b) => { var _a, _b; return ((_a = a.idOrdemServicoItem) !== null && _a !== void 0 ? _a : 0) - ((_b = b.idOrdemServicoItem) !== null && _b !== void 0 ? _b : 0); });
                    for (const item of itensOrdenados) {
                        let servicoTrabalhoParaElementos;
                        if (item.tipoCobranca === ordemServicoItem_entity_1.TipoCobranca.SERVICO) {
                            const listaServicosMesmoProduto = ((_a = trabalho === null || trabalho === void 0 ? void 0 : trabalho.servicos) !== null && _a !== void 0 ? _a : [])
                                .filter((s) => s.idProduto === item.idReferencia)
                                .sort((a, b) => { var _a, _b; return ((_a = a.idServicoTrabalho) !== null && _a !== void 0 ? _a : 0) - ((_b = b.idServicoTrabalho) !== null && _b !== void 0 ? _b : 0); });
                            const idx = (_b = indiceServicoPorProduto.get(item.idReferencia)) !== null && _b !== void 0 ? _b : 0;
                            indiceServicoPorProduto.set(item.idReferencia, idx + 1);
                            servicoTrabalhoParaElementos = listaServicosMesmoProduto[idx];
                        }
                        if (item.status === ordemServicoItem_entity_1.StatusOrdemServicoItem.DEVOLVIDO) {
                            continue;
                        }
                        const quantidade = Number(item.quantidade);
                        const quantidadeDevolvida = Number(item.quantidadeDevolvida || 0);
                        const quantidadeParaCobrar = quantidade - quantidadeDevolvida;
                        if (quantidadeParaCobrar <= 0) {
                            if (item.tipoCobranca === ordemServicoItem_entity_1.TipoCobranca.COMPONENTE) {
                                const qDevItem = Number(item.quantidadeDevolvida || 0);
                                const qPendenteRegistros = ((_c = item.devolucoes) !== null && _c !== void 0 ? _c : [])
                                    .filter((d) => d.status === devolucao_componente_entity_1.StatusDevolucao.PENDENTE)
                                    .reduce((s, d) => s + Number(d.quantidadeDevolvida || 0), 0);
                                let qDev = qDevItem > 0 ? qDevItem : qPendenteRegistros;
                                if (qDev <= 0 && item.status === ordemServicoItem_entity_1.StatusOrdemServicoItem.DEVOLUCAO_SOLICITADA) {
                                    qDev = Math.max(quantidade, 1);
                                }
                                if (qDev > 0) {
                                    const valorUnitario = Number(item.valor);
                                    const descComContexto = `${item.descricao} — ${qDev} un. aguardando conferência de devolução`;
                                    componentes.push({
                                        idTrabalho: (_d = trabalho === null || trabalho === void 0 ? void 0 : trabalho.idTrabalho) !== null && _d !== void 0 ? _d : os.idTrabalho,
                                        dataConclusao: (_e = trabalho === null || trabalho === void 0 ? void 0 : trabalho.dataConclusao) !== null && _e !== void 0 ? _e : null,
                                        nomePaciente: (_h = (_f = trabalho === null || trabalho === void 0 ? void 0 : trabalho.nomePaciente) !== null && _f !== void 0 ? _f : (_g = trabalho === null || trabalho === void 0 ? void 0 : trabalho.paciente) === null || _g === void 0 ? void 0 : _g.nome) !== null && _h !== void 0 ? _h : null,
                                        descricao: descComContexto,
                                        statusTrabalho: ordemServicoItem_entity_1.StatusOrdemServicoItem.DEVOLUCAO_SOLICITADA,
                                        quantidade: qDev,
                                        quantidadeDevolvida: qDev,
                                        quantidadeParaCobrar: 0,
                                        valorUnitario,
                                        valorTotal: 0,
                                    });
                                }
                            }
                            continue;
                        }
                        const valorUnitario = Number(item.valor);
                        const valorTotalCalculado = valorUnitario * quantidadeParaCobrar;
                        const baseInfo = {
                            idTrabalho: (_j = trabalho === null || trabalho === void 0 ? void 0 : trabalho.idTrabalho) !== null && _j !== void 0 ? _j : os.idTrabalho,
                            dataConclusao: (_k = trabalho === null || trabalho === void 0 ? void 0 : trabalho.dataConclusao) !== null && _k !== void 0 ? _k : null,
                            nomePaciente: (_o = (_l = trabalho === null || trabalho === void 0 ? void 0 : trabalho.nomePaciente) !== null && _l !== void 0 ? _l : (_m = trabalho === null || trabalho === void 0 ? void 0 : trabalho.paciente) === null || _m === void 0 ? void 0 : _m.nome) !== null && _o !== void 0 ? _o : null,
                            descricao: item.descricao,
                            statusTrabalho: (_p = trabalho === null || trabalho === void 0 ? void 0 : trabalho.status) !== null && _p !== void 0 ? _p : null,
                            quantidade: quantidadeParaCobrar,
                            quantidadeDevolvida: quantidadeDevolvida,
                            quantidadeParaCobrar: quantidadeParaCobrar,
                            valorUnitario: valorUnitario,
                            valorTotal: valorTotalCalculado,
                        };
                        if (item.tipoCobranca === ordemServicoItem_entity_1.TipoCobranca.SERVICO) {
                            const elementos = [...((_q = servicoTrabalhoParaElementos === null || servicoTrabalhoParaElementos === void 0 ? void 0 : servicoTrabalhoParaElementos.elementos) !== null && _q !== void 0 ? _q : [])].sort((a, b) => { var _a, _b; return ((_a = a.idElementoTrabalho) !== null && _a !== void 0 ? _a : 0) - ((_b = b.idElementoTrabalho) !== null && _b !== void 0 ? _b : 0); });
                            const elementosNomes = elementos.length > 0
                                ? elementos.map((el) => el.nome).filter(Boolean).join(', ')
                                : null;
                            const servicoInfo = Object.assign(Object.assign({}, baseInfo), { elementosNomes: elementosNomes });
                            servicos.push(servicoInfo);
                            valorTotalServicos += valorTotalCalculado;
                        }
                        else if (item.tipoCobranca === ordemServicoItem_entity_1.TipoCobranca.COMPONENTE) {
                            const qPendenteDev = ((_r = item.devolucoes) !== null && _r !== void 0 ? _r : [])
                                .filter((d) => d.status === devolucao_componente_entity_1.StatusDevolucao.PENDENTE)
                                .reduce((s, d) => s + Number(d.quantidadeDevolvida || 0), 0);
                            const emProcessoDevolucao = item.status === ordemServicoItem_entity_1.StatusOrdemServicoItem.DEVOLUCAO_SOLICITADA ||
                                qPendenteDev > 0;
                            let descricaoComponente = item.descricao;
                            if (quantidadeDevolvida > 0) {
                                descricaoComponente = `${item.descricao} — ${quantidadeDevolvida} un. com devolução solicitada`;
                            }
                            else if (item.status === ordemServicoItem_entity_1.StatusOrdemServicoItem.DEVOLUCAO_SOLICITADA) {
                                descricaoComponente = `${item.descricao} — devolução solicitada`;
                            }
                            const componenteInfo = Object.assign(Object.assign({}, baseInfo), { descricao: descricaoComponente, statusTrabalho: emProcessoDevolucao
                                    ? ordemServicoItem_entity_1.StatusOrdemServicoItem.DEVOLUCAO_SOLICITADA
                                    : item.status });
                            componentes.push(componenteInfo);
                            valorTotalComponentes += valorTotalCalculado;
                        }
                    }
                }
            }
        }
        const valorTotalBruto = valorTotalServicos + valorTotalComponentes;
        const desconto = Number(fatura.desconto || 0);
        const descontoDevolucao = Number(fatura.descontoDevolucao || 0);
        const valorTotalGeral = Math.max(0, valorTotalBruto - desconto - descontoDevolucao);
        const valorPago = Number(fatura.valorPago) || 0;
        const valorPendente = Math.max(0, valorTotalGeral - valorPago);
        const empresa = fatura.empresa;
        const nomeEmpresa = (_t = (_s = empresa === null || empresa === void 0 ? void 0 : empresa.nomeFantasia) !== null && _s !== void 0 ? _s : empresa === null || empresa === void 0 ? void 0 : empresa.nome) !== null && _t !== void 0 ? _t : `Empresa ${fatura.idEmpresa}`;
        const cnpj = (_v = (_u = empresa === null || empresa === void 0 ? void 0 : empresa.documento) !== null && _u !== void 0 ? _u : empresa === null || empresa === void 0 ? void 0 : empresa.cnpj) !== null && _v !== void 0 ? _v : '';
        const telefone = (empresa === null || empresa === void 0 ? void 0 : empresa.telefone) ? String(empresa.telefone) : '';
        const partesRestante = [];
        if (empresa === null || empresa === void 0 ? void 0 : empresa.email)
            partesRestante.push(empresa.email);
        if (empresa === null || empresa === void 0 ? void 0 : empresa.nomeResponsavel)
            partesRestante.push(empresa.nomeResponsavel);
        const contatoRestante = partesRestante.length > 0 ? partesRestante.join(' | ') : '';
        const contato = [telefone, ...partesRestante].filter(Boolean).length > 0
            ? [telefone, ...partesRestante].filter(Boolean).join(' | ')
            : '—';
        const telefoneParaWhatsApp = telefone
            ? '55' + telefone.replace(/\D/g, '').replace(/^0+/, '')
            : '';
        const telefoneFinanceiro = (empresa === null || empresa === void 0 ? void 0 : empresa.telefoneFinanceiro) ? String(empresa.telefoneFinanceiro) : '';
        const telefoneFinanceiroWhatsApp = telefoneFinanceiro
            ? '55' + telefoneFinanceiro.replace(/\D/g, '').replace(/^0+/, '')
            : '';
        const contatoFinanceiro = {
            nome: (_w = empresa === null || empresa === void 0 ? void 0 : empresa.nomeResponsavelFinanceiro) !== null && _w !== void 0 ? _w : '',
            telefone: telefoneFinanceiro,
            email: (_x = empresa === null || empresa === void 0 ? void 0 : empresa.emailFinanceiro) !== null && _x !== void 0 ? _x : '',
            telefoneWhatsApp: telefoneFinanceiroWhatsApp,
        };
        const componentesPendentesDevolucao = componentes.filter((c) => String(c.statusTrabalho).toUpperCase() ===
            ordemServicoItem_entity_1.StatusOrdemServicoItem.DEVOLUCAO_SOLICITADA);
        const componentesLista = componentes.filter((c) => String(c.statusTrabalho).toUpperCase() !==
            ordemServicoItem_entity_1.StatusOrdemServicoItem.DEVOLUCAO_SOLICITADA);
        const devolucoesComponentes = (fatura.devolucoesComponentes || []).map((dev) => {
            var _a, _b, _c;
            return ({
                idComponente: dev.idComponente,
                nomeComponente: (_b = (_a = dev.componente) === null || _a === void 0 ? void 0 : _a.nome) !== null && _b !== void 0 ? _b : `Componente #${dev.idComponente}`,
                quantidade: Number(dev.quantidade),
                valorUnitario: Number(dev.valorUnitario),
                valorTotal: Number(dev.quantidade) * Number(dev.valorUnitario),
                idPaciente: dev.idPaciente,
                nomePaciente: dev.nomePaciente || ((_c = dev.paciente) === null || _c === void 0 ? void 0 : _c.nome) || null,
            });
        });
        return {
            nomeEmpresa,
            nomeFantasia: nomeEmpresa,
            cnpj,
            contato,
            telefone,
            contatoRestante,
            telefoneWhatsApp: telefoneParaWhatsApp,
            contatoFinanceiro,
            dataReferencia: fatura.dataFim,
            servicos,
            componentes: componentesLista,
            componentesPendentesDevolucao,
            valorTotalServicos,
            valorTotalComponentes,
            valorTotalBruto,
            desconto,
            descontoDevolucao: Number(fatura.descontoDevolucao || 0),
            devolucoesComponentes,
            valorTotalGeral,
            valorPago,
            valorPendente,
        };
    }
    async obterResumoImpressaoFaturasPorCompetencia(competencia, idEmpresa) {
        const competenciaRegex = /^(\d{1,2})\/(\d{4})$/;
        const match = competencia.match(competenciaRegex);
        if (!match) {
            throw new common_1.BadRequestException('Formato de competência inválido. Use o formato MM/YYYY (ex: 11/2025)');
        }
        const mes = parseInt(match[1], 10);
        const ano = parseInt(match[2], 10);
        if (mes < 1 || mes > 12) {
            throw new common_1.BadRequestException('Mês inválido. O mês deve estar entre 1 e 12.');
        }
        const primeiroDiaMes = new Date(ano, mes - 1, 1);
        const ultimoDiaMes = new Date(ano, mes, 0);
        const dataInicioStr = `${ano}-${String(mes).padStart(2, '0')}-01`;
        const dataFimStr = `${ano}-${String(mes).padStart(2, '0')}-${String(ultimoDiaMes.getDate()).padStart(2, '0')}`;
        const dataInicioDate = new Date(`${dataInicioStr}T00:00:00`);
        const dataFimDate = new Date(`${dataFimStr}T23:59:59`);
        const queryBuilder = this.faturaRepository.createQueryBuilder('fatura');
        queryBuilder.where('fatura.dataInicio <= :dataFim', { dataFim: dataFimDate });
        queryBuilder.andWhere('fatura.dataFim >= :dataInicio', { dataInicio: dataInicioDate });
        if (idEmpresa) {
            queryBuilder.andWhere('fatura.idEmpresa = :idEmpresa', { idEmpresa });
        }
        queryBuilder.leftJoinAndSelect('fatura.empresa', 'empresa');
        queryBuilder.orderBy('fatura.dataFim', 'DESC');
        const faturas = await queryBuilder.getMany();
        const faturasResumo = await Promise.all(faturas.map(async (fatura) => {
            return await this.obterResumoImpressaoFatura(fatura.idFatura);
        }));
        return faturasResumo;
    }
    async adicionarTrabalhosEnviadosAFatura(idEmpresa) {
        return this.dataSource.transaction(async (manager) => {
            const faturaRepo = manager.getRepository(fatura_entity_1.Fatura);
            const osRepo = manager.getRepository(ordemServico_entity_1.OrdemServico);
            const osItemRepo = manager.getRepository(ordemServicoItem_entity_1.OrdemServicoItem);
            const trabalhoRepo = manager.getRepository(trabalho_entity_1.Trabalho);
            const queryBuilder = trabalhoRepo.createQueryBuilder('trabalho');
            queryBuilder.innerJoin('TbOrdemServico', 'os', 'os.idTrabalho = trabalho.idTrabalho');
            queryBuilder.where('trabalho.status IN (:...status)', {
                status: [trabalho_entity_1.StatusTrabalho.ENVIADO, trabalho_entity_1.StatusTrabalho.ENVIADO_PROVA],
            });
            queryBuilder.andWhere('trabalho.dataConclusao IS NOT NULL');
            queryBuilder.andWhere('os.idFatura IS NULL');
            queryBuilder.andWhere('os.status = :osStatus', { osStatus: ordemServico_entity_1.StatusOrdemServico.RECEBER });
            queryBuilder.andWhere('os.concluido = :concluido', { concluido: true });
            if (idEmpresa) {
                queryBuilder.andWhere('trabalho.idEmpresa = :idEmpresa', { idEmpresa });
            }
            const trabalhosEnviados = await queryBuilder.getMany();
            const trabalhosComDataConclusao = trabalhosEnviados.filter(t => t.dataConclusao);
            if (trabalhosComDataConclusao.length === 0) {
                this.logger.log('Nenhum trabalho enviado com dataConclusao encontrado para adicionar à fatura.');
                return { adicionados: 0, faturasAtualizadas: 0 };
            }
            const trabalhosPorFatura = new Map();
            let totalAdicionados = 0;
            let totalFaturasAtualizadas = 0;
            const faturasProcessadas = new Set();
            for (const trabalho of trabalhosComDataConclusao) {
                const dataRef = trabalho.dataConclusao || trabalho.dataHoraEnvio || trabalho.dataInclusao;
                const info = (0, data_financeiro_util_1.extrairAnoMesDia)(dataRef);
                if (!info)
                    continue;
                const ano = info.ano;
                const mes = info.mes;
                const fatura = await this.obterOuCriarFaturaParaMesAno(manager, trabalho.idEmpresa, ano, mes);
                if (fatura) {
                    if (!trabalhosPorFatura.has(fatura.idFatura)) {
                        trabalhosPorFatura.set(fatura.idFatura, { fatura, trabalhos: [] });
                    }
                    trabalhosPorFatura.get(fatura.idFatura).trabalhos.push(trabalho);
                }
            }
            for (const [idFatura, { fatura, trabalhos }] of trabalhosPorFatura) {
                const idsTrabalhos = trabalhos.map(t => t.idTrabalho);
                const ordensServico = await osRepo.find({
                    where: {
                        idTrabalho: (0, typeorm_2.In)(idsTrabalhos),
                        fatura: (0, typeorm_2.IsNull)(),
                        status: ordemServico_entity_1.StatusOrdemServico.RECEBER,
                        concluido: true,
                    },
                    relations: ['itens'],
                });
                if (ordensServico.length === 0) {
                    this.logger.log(`Nenhuma OS pendente encontrada para os trabalhos da fatura ${fatura.idFatura}`);
                    continue;
                }
                await osRepo.update(ordensServico.map(os => os.idOrdemServico), { fatura: fatura });
                const idsItens = ordensServico.flatMap(os => { var _a; return ((_a = os.itens) === null || _a === void 0 ? void 0 : _a.map(item => item.idOrdemServicoItem)) || []; });
                if (idsItens.length > 0) {
                    const itensParaAtualizar = await osItemRepo.find({
                        where: {
                            idOrdemServicoItem: (0, typeorm_2.In)(idsItens),
                            status: (0, typeorm_2.Not)(ordemServicoItem_entity_1.StatusOrdemServicoItem.DEVOLVIDO)
                        }
                    });
                    const idsParaAtualizar = itensParaAtualizar.map(item => item.idOrdemServicoItem);
                    if (idsParaAtualizar.length > 0) {
                        await osItemRepo.update({ idOrdemServicoItem: (0, typeorm_2.In)(idsParaAtualizar) }, { status: ordemServicoItem_entity_1.StatusOrdemServicoItem.FATURADO });
                    }
                }
                await this.recalcularFaturaComManager(manager, fatura.idFatura);
                totalAdicionados += ordensServico.length;
                if (!faturasProcessadas.has(fatura.idFatura)) {
                    faturasProcessadas.add(fatura.idFatura);
                    totalFaturasAtualizadas += 1;
                }
                const dataInicioFormatada = formatDataLocalYYYYMMDD(fatura.dataInicio);
                const dataFimFormatada = formatDataLocalYYYYMMDD(fatura.dataFim);
                this.logger.log(`Adicionadas ${ordensServico.length} OS à fatura ${fatura.idFatura} da empresa ${fatura.idEmpresa} (período: ${dataInicioFormatada} a ${dataFimFormatada})`);
            }
            return {
                adicionados: totalAdicionados,
                faturasAtualizadas: totalFaturasAtualizadas,
            };
        });
    }
    async adicionarTrabalhoAProximaFatura(idTrabalho) {
        return this.dataSource.transaction(async (manager) => {
            const faturaRepo = manager.getRepository(fatura_entity_1.Fatura);
            const osRepo = manager.getRepository(ordemServico_entity_1.OrdemServico);
            const osItemRepo = manager.getRepository(ordemServicoItem_entity_1.OrdemServicoItem);
            const trabalhoRepo = manager.getRepository(trabalho_entity_1.Trabalho);
            const trabalho = await trabalhoRepo.findOne({
                where: { idTrabalho },
            });
            if (!trabalho) {
                this.logger.warn(`Trabalho ${idTrabalho} não encontrado`);
                return null;
            }
            if (trabalho.status !== trabalho_entity_1.StatusTrabalho.ENVIADO && trabalho.status !== trabalho_entity_1.StatusTrabalho.ENVIADO_PROVA) {
                this.logger.log(`Trabalho ${idTrabalho} não está com status ENVIADO ou ENVIADO_PROVA. Status atual: ${trabalho.status}`);
                return null;
            }
            const ordemServico = await osRepo.findOne({
                where: {
                    idTrabalho: idTrabalho,
                    status: ordemServico_entity_1.StatusOrdemServico.RECEBER,
                    concluido: true,
                },
                relations: ['itens'],
            });
            if (!ordemServico) {
                this.logger.log(`Ordem de Serviço não encontrada ou não está pronta para o trabalho ${idTrabalho}`);
                return null;
            }
            if (ordemServico.idFatura) {
                this.logger.log(`Ordem de Serviço ${ordemServico.idOrdemServico} já está na fatura ${ordemServico.idFatura}`);
                return null;
            }
            const dataRef = trabalho.dataConclusao || trabalho.dataHoraEnvio || ordemServico.dataConcluido;
            const info = (0, data_financeiro_util_1.extrairAnoMesDia)(dataRef);
            if (!info) {
                this.logger.warn(`Trabalho ${idTrabalho} não possui data válida. Não é possível determinar a fatura correta.`);
                return null;
            }
            const ano = info.ano;
            const mes = info.mes;
            const fatura = await this.obterOuCriarFaturaParaMesAno(manager, trabalho.idEmpresa, ano, mes);
            await osRepo.update(ordemServico.idOrdemServico, { fatura: fatura });
            if (ordemServico.itens && ordemServico.itens.length > 0) {
                const idsItens = ordemServico.itens.map(item => item.idOrdemServicoItem);
                const itensParaAtualizar = await osItemRepo.find({
                    where: {
                        idOrdemServicoItem: (0, typeorm_2.In)(idsItens),
                        status: (0, typeorm_2.Not)(ordemServicoItem_entity_1.StatusOrdemServicoItem.DEVOLVIDO)
                    }
                });
                const idsItensParaAtualizar = itensParaAtualizar.map(item => item.idOrdemServicoItem);
                if (idsItensParaAtualizar.length > 0) {
                    await osItemRepo.update({ idOrdemServicoItem: (0, typeorm_2.In)(idsItensParaAtualizar) }, { status: ordemServicoItem_entity_1.StatusOrdemServicoItem.FATURADO });
                }
            }
            const faturaAtualizada = await this.recalcularFaturaComManager(manager, fatura.idFatura);
            this.logger.log(`Trabalho ${idTrabalho} (OS ${ordemServico.idOrdemServico}) adicionado à fatura ${fatura.idFatura}`);
            return faturaAtualizada;
        });
    }
    async lancarValorFatura(idFatura, dto) {
        return this.dataSource.transaction(async (manager) => {
            const faturaRepo = manager.getRepository(fatura_entity_1.Fatura);
            const contaRepo = manager.getRepository(conta_entity_1.Conta);
            const movRepo = manager.getRepository(movimentacao_entity_1.Movimentacao);
            const fatura = await faturaRepo.findOne({
                where: { idFatura },
                lock: { mode: 'pessimistic_write' },
            });
            if (!fatura) {
                throw new common_1.NotFoundException(`Fatura com ID ${idFatura} não encontrada.`);
            }
            if (fatura.status === fatura_entity_1.StatusFatura.PAGA || fatura.status === fatura_entity_1.StatusFatura.CANCELADA) {
                throw new common_1.BadRequestException(`Fatura com status ${fatura.status} não pode receber pagamentos.`);
            }
            const conta = await contaRepo.findOne({
                where: { idConta: dto.idConta },
                lock: { mode: 'pessimistic_write' },
            });
            if (!conta) {
                throw new common_1.NotFoundException(`Conta com ID ${dto.idConta} não encontrada.`);
            }
            const valor = Number(dto.valor);
            const valorTotalFatura = Number(fatura.valorTotal);
            const valorPagoAtual = Number(fatura.valorPago || 0);
            const valorRestante = valorTotalFatura - valorPagoAtual;
            if (valor > valorRestante + 0.01) {
                throw new common_1.BadRequestException(`O valor a lançar (R$ ${valor}) não pode ser maior que o valor restante (R$ ${valorRestante}).`);
            }
            const lancamentoRepo = manager.getRepository(lancamento_entity_1.Lancamento);
            const parcelaRepo = manager.getRepository(parcela_entity_2.Parcela);
            const parcelasDto = dto.parcelas && dto.parcelas.length > 0
                ? dto.parcelas
                : [{ valor: valor, dataVencimento: dto.dataPagamento }];
            const totalParcelas = parcelasDto.length;
            const dataCompetenciaString = formatDataLocalYYYYMMDD(fatura.dataInicio) ||
                formatDataLocalYYYYMMDD(fatura.dataFim) ||
                parcelasDto[0].dataVencimento.split('T')[0];
            const lancamento = lancamentoRepo.create({
                descricao: `Pagamento da Fatura #${idFatura}${dto.meioPagamento ? ` - ${dto.meioPagamento}` : ''}${totalParcelas > 1 ? ` (${totalParcelas} parcelas)` : ''}`,
                tipo: tipo_lancamento_enum_1.TipoLancamento.RECEITA,
                valorTotal: valor,
                totalParcelas: totalParcelas,
                dataCompetencia: dataCompetenciaString,
                idFatura: fatura.idFatura,
                idClienteFornecedor: fatura.idEmpresa,
                idCategoria: 44,
                status: lancamento_entity_1.StatusLancamento.PENDENTE,
            });
            const lancamentoSalvo = await lancamentoRepo.save(lancamento);
            let todasPagas = true;
            const meioPagamentoNormalizado = (dto.meioPagamento || '').toLowerCase();
            const ehBoletoOuCheque = meioPagamentoNormalizado.includes('boleto') ||
                meioPagamentoNormalizado.includes('cheque');
            for (let i = 0; i < parcelasDto.length; i++) {
                const pDto = parcelasDto[i];
                const dataVencimentoString = pDto.dataVencimento.split('T')[0];
                const dataVencimentoDate = new Date(dataVencimentoString + 'T12:00:00');
                const hoje = new Date();
                hoje.setHours(0, 0, 0, 0);
                const dataVencimentoComparacao = new Date(dataVencimentoDate);
                dataVencimentoComparacao.setHours(0, 0, 0, 0);
                const isDataFutura = dataVencimentoComparacao > hoje;
                const statusParcela = ehBoletoOuCheque
                    ? parcela_entity_2.StatusParcela.ABERTO
                    : (isDataFutura ? parcela_entity_2.StatusParcela.ABERTO : parcela_entity_2.StatusParcela.PAGO);
                const valorPagoParcela = ehBoletoOuCheque || isDataFutura ? 0 : pDto.valor;
                const dataPagamentoParcela = ehBoletoOuCheque || isDataFutura ? null : dataVencimentoDate;
                if (statusParcela !== parcela_entity_2.StatusParcela.PAGO) {
                    todasPagas = false;
                }
                const parcela = parcelaRepo.create({
                    idLancamento: lancamentoSalvo.idLancamento,
                    numeroParcela: i + 1,
                    valor: pDto.valor,
                    dataVencimento: dataVencimentoString,
                    meioPagamento: dto.meioPagamento || parcela_entity_1.MeioPagamento.DINHEIRO,
                    status: statusParcela,
                    valorPago: valorPagoParcela,
                    dataPagamento: dataPagamentoParcela,
                });
                const parcelaSalva = await parcelaRepo.save(parcela);
                if (!isDataFutura && !ehBoletoOuCheque) {
                    try {
                        const movimentacao = movRepo.create({
                            idConta: conta.idConta,
                            tipo: movimentacao_entity_1.TipoMovimentacao.CREDITO,
                            valor: Number(pDto.valor),
                            descricao: `Pagamento da Fatura #${idFatura}${dto.meioPagamento ? ` - ${dto.meioPagamento}` : ''}${totalParcelas > 1 ? ` (Parcela ${i + 1}/${totalParcelas})` : ''}`,
                            dataMovimentacao: dataVencimentoDate,
                            idParcelaOrigem: parcelaSalva.idParcela,
                        });
                        const movimentacaoSalva = await movRepo.save(movimentacao);
                        if (!movimentacaoSalva || !movimentacaoSalva.idMovimentacao) {
                            throw new Error('Movimentação não foi salva corretamente');
                        }
                        const saldoAnterior = Number(conta.saldoAtual || 0);
                        conta.saldoAtual = saldoAnterior + Number(pDto.valor);
                        await contaRepo.save(conta);
                    }
                    catch (error) {
                        this.logger.error(`Erro ao criar movimentação: ${error.message}`, error.stack);
                        throw error;
                    }
                }
            }
            lancamentoSalvo.status = ehBoletoOuCheque ? lancamento_entity_1.StatusLancamento.PENDENTE : (todasPagas ? lancamento_entity_1.StatusLancamento.PAGO : lancamento_entity_1.StatusLancamento.PENDENTE);
            await lancamentoRepo.save(lancamentoSalvo);
            const novoValorPago = valorPagoAtual + valor;
            fatura.valorPago = novoValorPago;
            const valorRestanteAposPagamento = valorTotalFatura - novoValorPago;
            const osItemRepo = manager.getRepository(ordemServicoItem_entity_1.OrdemServicoItem);
            const ordemServicoRepo = manager.getRepository(ordemServico_entity_1.OrdemServico);
            const trabalhoRepo = manager.getRepository(trabalho_entity_1.Trabalho);
            if (valorRestanteAposPagamento < 0.01) {
                fatura.status = fatura_entity_1.StatusFatura.PAGA;
                const ordensDeServico = await ordemServicoRepo.find({
                    where: { idFatura: fatura.idFatura },
                    select: ['idOrdemServico', 'idTrabalho'],
                });
                if (ordensDeServico.length > 0) {
                    const idsOs = ordensDeServico.map(os => os.idOrdemServico);
                    const idsTrabalhos = new Set(ordensDeServico.map(os => os.idTrabalho));
                    await osItemRepo.update({ idOrdemServico: (0, typeorm_2.In)(idsOs) }, { status: ordemServicoItem_entity_1.StatusOrdemServicoItem.PAGO });
                    if (idsTrabalhos.size > 0) {
                        await trabalhoRepo.update({ idTrabalho: (0, typeorm_2.In)(Array.from(idsTrabalhos)) }, {
                            finalizado: true,
                        });
                    }
                }
            }
            else {
                fatura.status = fatura_entity_1.StatusFatura.PAGA_PARCIALMENTE;
            }
            await faturaRepo.save(fatura);
            return this.buscarFaturaPorId(fatura.idFatura);
        });
    }
    async reabrirFatura(idFatura) {
        return this.dataSource.transaction(async (manager) => {
            const faturaRepo = manager.getRepository(fatura_entity_1.Fatura);
            const ordemServicoRepo = manager.getRepository(ordemServico_entity_1.OrdemServico);
            const osItemRepo = manager.getRepository(ordemServicoItem_entity_1.OrdemServicoItem);
            const trabalhoRepo = manager.getRepository(trabalho_entity_1.Trabalho);
            const fatura = await faturaRepo.findOne({
                where: { idFatura },
                lock: { mode: 'pessimistic_write' },
            });
            if (!fatura) {
                throw new common_1.NotFoundException(`Fatura com ID ${idFatura} não encontrada.`);
            }
            const statusPermitidos = [fatura_entity_1.StatusFatura.PAGA, fatura_entity_1.StatusFatura.PAGA_PARCIALMENTE];
            if (!statusPermitidos.includes(fatura.status)) {
                if (fatura.status === fatura_entity_1.StatusFatura.CANCELADA) {
                    throw new common_1.BadRequestException('Fatura cancelada não pode ser reaberta.');
                }
                if (fatura.status === fatura_entity_1.StatusFatura.AGUARDANDO_DEVOLUCAO) {
                    throw new common_1.BadRequestException('Fatura com devolução pendente não pode ser reaberta.');
                }
                throw new common_1.BadRequestException(`Apenas faturas pagas ou parcialmente pagas podem ser reabertas. Status atual: ${fatura.status}`);
            }
            await this.cancelarLancamentosDaFatura(manager, idFatura);
            await this.estornarMovimentacoesPagamentoItensDaFatura(manager, idFatura);
            fatura.valorPago = 0;
            fatura.status = fatura_entity_1.StatusFatura.ABERTA;
            await faturaRepo.save(fatura);
            const ordensDeServico = await ordemServicoRepo.find({
                where: { idFatura: fatura.idFatura },
                select: ['idOrdemServico', 'idTrabalho'],
            });
            if (ordensDeServico.length > 0) {
                const idsOs = ordensDeServico.map((os) => os.idOrdemServico);
                const idsTrabalhos = new Set(ordensDeServico.map((os) => os.idTrabalho));
                await osItemRepo.update({ idOrdemServico: (0, typeorm_2.In)(idsOs) }, { status: ordemServicoItem_entity_1.StatusOrdemServicoItem.FATURADO, valorPago: 0 });
                if (idsTrabalhos.size > 0) {
                    await trabalhoRepo.update({ idTrabalho: (0, typeorm_2.In)(Array.from(idsTrabalhos)) }, { status: trabalho_entity_1.StatusTrabalho.ENVIADO });
                }
            }
            this.logger.log(`Fatura #${idFatura} reaberta com sucesso.`);
            return this.buscarFaturaPorId(fatura.idFatura);
        });
    }
    async estornarMovimentacaoReabertura(manager, movOriginal, descricaoEstorno, idParcelaOrigem) {
        var _a, _b;
        const movRepo = manager.getRepository(movimentacao_entity_1.Movimentacao);
        const contaRepo = manager.getRepository(conta_entity_1.Conta);
        if (idParcelaOrigem) {
            const estornoExistente = await movRepo.count({
                where: { idParcelaOrigem, descricao: (0, typeorm_2.Like)('Estorno - Reabertura%') },
            });
            if (estornoExistente > 0) {
                return;
            }
        }
        const conta = await contaRepo.findOne({
            where: { idConta: movOriginal.idConta },
            lock: { mode: 'pessimistic_write' },
        });
        if (!conta) {
            throw new common_1.NotFoundException(`Conta com ID ${movOriginal.idConta} não encontrada.`);
        }
        const acrescimoOrig = Number((_a = movOriginal.valorAcrescimo) !== null && _a !== void 0 ? _a : 0);
        const totalEstorno = Number(movOriginal.valor) + acrescimoOrig;
        const tipoEstorno = movOriginal.tipo === movimentacao_entity_1.TipoMovimentacao.CREDITO
            ? movimentacao_entity_1.TipoMovimentacao.DEBITO
            : movimentacao_entity_1.TipoMovimentacao.CREDITO;
        const estorno = movRepo.create({
            idConta: conta.idConta,
            tipo: tipoEstorno,
            valor: movOriginal.valor,
            valorAcrescimo: acrescimoOrig,
            descricao: descricaoEstorno,
            dataMovimentacao: new Date(),
            idParcelaOrigem,
        });
        await movRepo.save(estorno);
        const saldoAtualNum = Number((_b = conta.saldoAtual) !== null && _b !== void 0 ? _b : 0);
        const novoSaldo = tipoEstorno === movimentacao_entity_1.TipoMovimentacao.CREDITO
            ? saldoAtualNum + totalEstorno
            : saldoAtualNum - totalEstorno;
        await contaRepo.update({ idConta: conta.idConta }, { saldoAtual: novoSaldo, dataAlteracao: new Date() });
    }
    async cancelarLancamentosDaFatura(manager, idFatura) {
        const lancamentoRepo = manager.getRepository(lancamento_entity_1.Lancamento);
        const parcelaRepo = manager.getRepository(parcela_entity_2.Parcela);
        const movRepo = manager.getRepository(movimentacao_entity_1.Movimentacao);
        const lancamentos = await lancamentoRepo.find({
            where: { idFatura },
            relations: ['parcelas', 'parcelas.movimentacao'],
        });
        for (const lancamento of lancamentos) {
            for (const parcela of lancamento.parcelas || []) {
                if (parcela.status === parcela_entity_2.StatusParcela.CANCELADO) {
                    continue;
                }
                if (parcela.status === parcela_entity_2.StatusParcela.PAGO) {
                    let movimentacoesOrigem = await movRepo.find({
                        where: { idParcelaOrigem: parcela.idParcela },
                    });
                    if (movimentacoesOrigem.length === 0 && parcela.movimentacao) {
                        movimentacoesOrigem = [parcela.movimentacao];
                    }
                    for (const mov of movimentacoesOrigem) {
                        await this.estornarMovimentacaoReabertura(manager, mov, `Estorno - Reabertura da Fatura #${idFatura} (lançamento #${lancamento.idLancamento})`, parcela.idParcela);
                    }
                }
                parcela.status = parcela_entity_2.StatusParcela.CANCELADO;
                parcela.valorPago = 0;
                parcela.dataPagamento = null;
                parcela.movimentacao = null;
                await parcelaRepo.save(parcela);
            }
            lancamento.status = lancamento_entity_1.StatusLancamento.CANCELADO;
            await lancamentoRepo.save(lancamento);
        }
    }
    async estornarMovimentacoesPagamentoItensDaFatura(manager, idFatura) {
        const movRepo = manager.getRepository(movimentacao_entity_1.Movimentacao);
        const movimentacoes = await movRepo
            .createQueryBuilder('m')
            .where('m.descricao LIKE :itemPattern', { itemPattern: 'Pagamento do item #%' })
            .andWhere('m.descricao LIKE :faturaPattern', { faturaPattern: `%da Fatura #${idFatura}%` })
            .andWhere('m.tipo = :tipo', { tipo: movimentacao_entity_1.TipoMovimentacao.CREDITO })
            .getMany();
        for (const mov of movimentacoes) {
            const estornoExistente = await movRepo
                .createQueryBuilder('e')
                .where('e.descricao LIKE :pattern', { pattern: `%movimentação #${mov.idMovimentacao}%` })
                .andWhere('e.descricao LIKE :reabertura', { reabertura: `Estorno - Reabertura da Fatura #${idFatura}%` })
                .getCount();
            if (estornoExistente > 0) {
                continue;
            }
            await this.estornarMovimentacaoReabertura(manager, mov, `Estorno - Reabertura da Fatura #${idFatura} (movimentação #${mov.idMovimentacao})`);
        }
    }
    async dividirFatura(idFaturaOriginal, dto) {
        return this.dataSource.transaction(async (manager) => {
            const faturaRepo = manager.getRepository(fatura_entity_1.Fatura);
            const osRepo = manager.getRepository(ordemServico_entity_1.OrdemServico);
            const faturaOriginal = await faturaRepo.findOne({
                where: { idFatura: idFaturaOriginal },
                relations: ['ordensDeServico'],
            });
            if (!faturaOriginal) {
                throw new common_1.NotFoundException(`Fatura de origem com ID ${idFaturaOriginal} não encontrada.`);
            }
            if (faturaOriginal.status !== fatura_entity_1.StatusFatura.ABERTA) {
                throw new common_1.BadRequestException('Apenas faturas com status ABERTA podem ser divididas.');
            }
            const idsOrdemServico = dto.idsOrdemServico || [];
            if (idsOrdemServico.length === 0) {
                throw new common_1.BadRequestException('Selecione pelo menos um trabalho para dividir a fatura.');
            }
            const osIdsOriginais = faturaOriginal.ordensDeServico.map(os => os.idOrdemServico);
            const invalidos = idsOrdemServico.filter(id => !osIdsOriginais.includes(id));
            if (invalidos.length > 0) {
                throw new common_1.BadRequestException(`As seguintes Ordens de Serviço não pertencem à fatura original: ${invalidos.join(', ')}`);
            }
            if (idsOrdemServico.length === faturaOriginal.ordensDeServico.length) {
                throw new common_1.BadRequestException('Não é possível mover todas as ordens de serviço. Pelo menos um trabalho deve permanecer na fatura original.');
            }
            const novaFatura = faturaRepo.create({
                idEmpresa: faturaOriginal.idEmpresa,
                dataInicio: faturaOriginal.dataInicio,
                dataFim: faturaOriginal.dataFim,
                dataVencimento: faturaOriginal.dataVencimento,
                valorTotalBruto: 0,
                desconto: 0,
                valorTotal: 0,
                valorPago: 0,
                status: fatura_entity_1.StatusFatura.ABERTA,
                idFaturaOriginal: faturaOriginal.idFatura,
                descricao: dto.descricao,
            });
            const faturaSalva = await faturaRepo.save(novaFatura);
            await osRepo.update(idsOrdemServico, { fatura: faturaSalva });
            await this.recalcularFaturaComManager(manager, faturaOriginal.idFatura);
            await this.recalcularFaturaComManager(manager, faturaSalva.idFatura);
            const originalAtualizada = await this.buscarFaturaPorIdComManager(manager, faturaOriginal.idFatura);
            const novaAtualizada = await this.buscarFaturaPorIdComManager(manager, faturaSalva.idFatura);
            return {
                original: originalAtualizada,
                nova: novaAtualizada,
            };
        });
    }
    async buscarFaturaPorIdComManager(manager, idFatura) {
        const fatura = await manager.getRepository(fatura_entity_1.Fatura).findOne({
            where: { idFatura },
            relations: [
                'empresa',
                'ordensDeServico',
                'ordensDeServico.trabalho',
                'ordensDeServico.itens.devolucoes',
            ],
            order: {
                ordensDeServico: {
                    trabalho: {
                        idTrabalho: 'ASC',
                    },
                },
            },
        });
        if (!fatura) {
            throw new common_1.NotFoundException(`Fatura com ID ${idFatura} não encontrada.`);
        }
        return fatura;
    }
    async buscarDevolucoesComponentes(idFatura) {
        return this.faturaDevolucaoItemRepository.find({
            where: { idFatura },
            relations: ['componente'],
        });
    }
    async salvarDevolucoesComponentes(idFatura, items) {
        const fatura = await this.faturaRepository.findOne({
            where: { idFatura },
        });
        if (!fatura) {
            throw new common_1.NotFoundException(`Fatura com ID ${idFatura} não encontrada.`);
        }
        if (fatura.status === fatura_entity_1.StatusFatura.PAGA) {
            throw new common_1.BadRequestException('Faturas pagas não podem ter suas devoluções alteradas.');
        }
        return this.dataSource.transaction(async (manager) => {
            const devItemRepo = manager.getRepository(fatura_devolucao_item_entity_1.FaturaDevolucaoItem);
            const compRepo = manager.getRepository(componente_entity_1.Componente);
            const faturaRepo = manager.getRepository(fatura_entity_1.Fatura);
            const osItemRepo = manager.getRepository(ordemServicoItem_entity_1.OrdemServicoItem);
            const devolucaoRepo = manager.getRepository(devolucao_componente_entity_1.DevolucaoComponente);
            await devItemRepo.delete({ idFatura });
            let totalDescontoDevolucao = 0;
            if (items && items.length > 0) {
                for (const item of items) {
                    const componente = await compRepo.findOne({
                        where: { idComponente: item.idComponente },
                    });
                    if (!componente) {
                        throw new common_1.NotFoundException(`Componente com ID ${item.idComponente} não encontrado.`);
                    }
                    const osItemsParaReverter = await osItemRepo
                        .createQueryBuilder('osItem')
                        .innerJoinAndSelect('osItem.ordemServico', 'os')
                        .leftJoinAndSelect('os.trabalho', 'trabalho')
                        .where('os.idFatura = :idFatura', { idFatura })
                        .andWhere('osItem.idReferencia = :idComponente', { idComponente: item.idComponente })
                        .andWhere('osItem.tipoCobranca = :tipo', { tipo: ordemServicoItem_entity_1.TipoCobranca.COMPONENTE })
                        .andWhere('osItem.status IN (:...statuses)', {
                        statuses: [
                            ordemServicoItem_entity_1.StatusOrdemServicoItem.DEVOLUCAO_SOLICITADA,
                            ordemServicoItem_entity_1.StatusOrdemServicoItem.DEVOLVIDO,
                        ],
                    })
                        .getMany();
                    const itensParaCancelar = osItemsParaReverter.filter(osItem => {
                        var _a, _b, _c, _d;
                        if (item.idPaciente) {
                            return ((_b = (_a = osItem.ordemServico) === null || _a === void 0 ? void 0 : _a.trabalho) === null || _b === void 0 ? void 0 : _b.idPaciente) === item.idPaciente;
                        }
                        else if (item.nomePaciente) {
                            return ((_d = (_c = osItem.ordemServico) === null || _c === void 0 ? void 0 : _c.trabalho) === null || _d === void 0 ? void 0 : _d.nomePaciente) === item.nomePaciente;
                        }
                        return true;
                    });
                    let quantidadeParaDescontar = Number(item.quantidade);
                    for (const osItem of itensParaCancelar) {
                        if (quantidadeParaDescontar <= 0)
                            break;
                        await devolucaoRepo
                            .createQueryBuilder()
                            .update(devolucao_componente_entity_1.DevolucaoComponente)
                            .set({ status: devolucao_componente_entity_1.StatusDevolucao.CANCELADO })
                            .where('idOrdemServicoItem = :id', { id: osItem.idOrdemServicoItem })
                            .andWhere('status != :cancelado', { cancelado: devolucao_componente_entity_1.StatusDevolucao.CANCELADO })
                            .execute();
                        await osItemRepo.update({ idOrdemServicoItem: osItem.idOrdemServicoItem }, {
                            status: ordemServicoItem_entity_1.StatusOrdemServicoItem.FATURADO,
                            quantidadeDevolvida: 0,
                        });
                        quantidadeParaDescontar -= Number(osItem.quantidade || 0);
                    }
                    const valorUnitario = Number(componente.preco);
                    const valorTotalItem = valorUnitario * Number(item.quantidade);
                    totalDescontoDevolucao += valorTotalItem;
                    const devItem = new fatura_devolucao_item_entity_1.FaturaDevolucaoItem();
                    devItem.idFatura = idFatura;
                    devItem.idComponente = item.idComponente;
                    devItem.quantidade = item.quantidade;
                    devItem.valorUnitario = valorUnitario;
                    devItem.idPaciente = item.idPaciente || null;
                    devItem.nomePaciente = item.nomePaciente || null;
                    await devItemRepo.save(devItem);
                }
            }
            fatura.descontoDevolucao = totalDescontoDevolucao;
            await faturaRepo.save(fatura);
            await this.recalcularFaturaComManager(manager, idFatura);
            return this.buscarFaturaPorIdComManager(manager, idFatura);
        });
    }
    async atualizarPeriodoFatura(idFatura, dto) {
        return this.dataSource.transaction(async (manager) => {
            const faturaRepo = manager.getRepository(fatura_entity_1.Fatura);
            const lancamentoRepo = manager.getRepository(lancamento_entity_1.Lancamento);
            const parcelaRepo = manager.getRepository(parcela_entity_2.Parcela);
            const fatura = await faturaRepo.findOne({
                where: { idFatura },
            });
            if (!fatura) {
                throw new common_1.NotFoundException(`Fatura com ID ${idFatura} não encontrada.`);
            }
            const novaDataInicio = new Date(`${dto.dataInicio}T00:00:00`);
            const novaDataFim = new Date(`${dto.dataFim}T00:00:00`);
            const novaDataVencimento = new Date(`${dto.dataVencimento}T00:00:00`);
            if (novaDataFim < novaDataInicio) {
                throw new common_1.BadRequestException('A data final não pode ser anterior à data inicial.');
            }
            fatura.dataInicio = novaDataInicio;
            fatura.dataFim = novaDataFim;
            fatura.dataVencimento = novaDataVencimento;
            if (dto.motivo) {
                const timestamp = new Date().toLocaleString('pt-BR');
                fatura.anotacoes = fatura.anotacoes
                    ? `${fatura.anotacoes}\n[${timestamp}] Período alterado: ${dto.motivo}`
                    : `[${timestamp}] Período alterado: ${dto.motivo}`;
            }
            await faturaRepo.save(fatura);
            const lancamentos = await lancamentoRepo.find({
                where: { idFatura },
                relations: ['parcelas'],
            });
            for (const lancamento of lancamentos) {
                lancamento.dataCompetencia = novaDataInicio;
                await lancamentoRepo.save(lancamento);
                if (lancamento.parcelas) {
                    for (const parcela of lancamento.parcelas) {
                        if (parcela.status !== parcela_entity_2.StatusParcela.PAGO) {
                            parcela.dataVencimento = novaDataVencimento;
                            await parcelaRepo.save(parcela);
                        }
                    }
                }
            }
            this.logger.log(`Período da fatura #${idFatura} atualizado para ${dto.dataInicio} até ${dto.dataFim} (Venc: ${dto.dataVencimento})`);
            return this.buscarFaturaPorIdComManager(manager, idFatura);
        });
    }
    async listarFaturasPorEmpresa(idEmpresa) {
        return this.faturaRepository.find({
            where: { idEmpresa },
            relations: ['empresa', 'ordensDeServico'],
            order: { dataInicio: 'DESC', idFatura: 'DESC' },
        });
    }
    async obterOuCriarFaturaParaMesAno(manager, idEmpresa, ano, mes) {
        const faturaRepo = manager.getRepository(fatura_entity_1.Fatura);
        const ultimoDia = new Date(ano, mes, 0).getDate();
        const dataInicioStr = `${ano}-${String(mes).padStart(2, '0')}-01`;
        const dataFimStr = `${ano}-${String(mes).padStart(2, '0')}-${String(ultimoDia).padStart(2, '0')}`;
        const dataInicioNormalizada = (0, data_financeiro_util_1.parseDataParaDataLocal)(dataInicioStr);
        const dataFimNormalizada = (0, data_financeiro_util_1.parseDataParaDataLocal)(dataFimStr);
        const dataVencimento = new Date(ano, mes, 20);
        const qb = faturaRepo.createQueryBuilder('fatura')
            .where('fatura.idEmpresa = :idEmpresa', { idEmpresa })
            .andWhere('fatura.status != :cancelada', { cancelada: fatura_entity_1.StatusFatura.CANCELADA })
            .andWhere('EXTRACT(YEAR FROM fatura.dataInicio) = :ano', { ano })
            .andWhere('EXTRACT(MONTH FROM fatura.dataInicio) = :mes', { mes })
            .orderBy('fatura.idFatura', 'DESC');
        const faturas = await qb.getMany();
        const faturaAberta = faturas.find((f) => f.status === fatura_entity_1.StatusFatura.ABERTA || f.status === fatura_entity_1.StatusFatura.AGUARDANDO_DEVOLUCAO);
        if (faturaAberta) {
            return faturaAberta;
        }
        const novaFatura = faturaRepo.create({
            idEmpresa,
            dataInicio: dataInicioNormalizada,
            dataFim: dataFimNormalizada,
            dataVencimento,
            valorTotalBruto: 0,
            desconto: 0,
            valorTotal: 0,
            status: fatura_entity_1.StatusFatura.ABERTA,
            descricao: faturas.length > 0 ? 'Fatura Complementar' : undefined,
        });
        return faturaRepo.save(novaFatura);
    }
    async organizarFaturasNoMesCorreto(idEmpresa) {
        this.logger.warn('organizarFaturasNoMesCorreto desativado para preservar integridade dos dados históricos do financeiro.');
        return {
            faturasAjustadas: 0,
            ordensMovidas: 0,
            faturasVaziasRemovidas: 0,
            faturasDuplicadasConsolidadas: 0,
            detalhes: ['Função de reorganização desativada para manter histórico íntegro.'],
        };
    }
};
exports.FaturaService = FaturaService;
__decorate([
    (0, event_emitter_1.OnEvent)('fatura.recalcular'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FaturaService.prototype, "handleFaturaRecalcular", null);
exports.FaturaService = FaturaService = FaturaService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(fatura_entity_1.Fatura)),
    __param(1, (0, typeorm_1.InjectRepository)(ordemServico_entity_1.OrdemServico)),
    __param(2, (0, typeorm_1.InjectRepository)(ordemServicoItem_entity_1.OrdemServicoItem)),
    __param(3, (0, typeorm_1.InjectRepository)(trabalho_entity_1.Trabalho)),
    __param(6, (0, common_1.Inject)((0, common_1.forwardRef)(() => trabalho_service_1.TrabalhoService))),
    __param(7, (0, typeorm_1.InjectRepository)(fatura_devolucao_item_entity_1.FaturaDevolucaoItem)),
    __param(8, (0, typeorm_1.InjectRepository)(componente_entity_1.Componente)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        financeiro_service_1.FinanceiroService,
        typeorm_2.DataSource,
        trabalho_service_1.TrabalhoService,
        typeorm_2.Repository,
        typeorm_2.Repository])
], FaturaService);
//# sourceMappingURL=fatura.service.js.map
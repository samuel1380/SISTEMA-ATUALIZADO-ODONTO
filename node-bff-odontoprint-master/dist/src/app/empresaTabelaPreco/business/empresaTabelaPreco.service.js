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
var EmpresaTabelaPrecoService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmpresaTabelaPrecoService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const empresaTabelaPreco_entity_1 = require("../domain/empresaTabelaPreco.entity");
const tabelaPrecoProduto_service_1 = require("../../tabelaPrecoProduto/business/tabelaPrecoProduto.service");
const CACHE_TTL_MS = 30000;
let EmpresaTabelaPrecoService = EmpresaTabelaPrecoService_1 = class EmpresaTabelaPrecoService {
    constructor(empresaTabelaPrecoRepository, tabelaPrecoProdutoService) {
        this.empresaTabelaPrecoRepository = empresaTabelaPrecoRepository;
        this.tabelaPrecoProdutoService = tabelaPrecoProdutoService;
        this.logger = new common_1.Logger(EmpresaTabelaPrecoService_1.name);
        this.cacheVigentePorEmpresa = new Map();
    }
    cacheKey(idEmpresa, data) {
        return `empresa-${idEmpresa}-data-${data.toISOString().slice(0, 10)}`;
    }
    limparCacheExpirado() {
        const now = Date.now();
        for (const [key, entry] of this.cacheVigentePorEmpresa.entries()) {
            if (entry.expires < now)
                this.cacheVigentePorEmpresa.delete(key);
        }
    }
    normalizarDataParaDia(data) {
        const ano = data.getUTCFullYear();
        const mes = data.getUTCMonth();
        const dia = data.getUTCDate();
        return new Date(Date.UTC(ano, mes, dia, 0, 0, 0, 0));
    }
    parseISODatePreservandoDia(isoString) {
        const match = isoString.match(/^(\d{4})-(\d{2})-(\d{2})/);
        if (!match) {
            throw new common_1.BadRequestException(`Formato de data inválido: ${isoString}`);
        }
        const ano = parseInt(match[1], 10);
        const mes = parseInt(match[2], 10) - 1;
        const dia = parseInt(match[3], 10);
        return new Date(Date.UTC(ano, mes, dia, 0, 0, 0, 0));
    }
    ajustarDataParaGMT3(data) {
        const dataAjustada = new Date(data);
        const offsetGMT3 = 3 * 60 * 60 * 1000;
        dataAjustada.setTime(dataAjustada.getTime() - offsetGMT3);
        return dataAjustada;
    }
    async buscarTabelaPrecoVigentePorEmpresa(idEmpresa, data) {
        this.limparCacheExpirado();
        const key = this.cacheKey(idEmpresa, data);
        const cached = this.cacheVigentePorEmpresa.get(key);
        if (cached)
            return cached.tabela;
        const dataComparacaoGMT3 = this.ajustarDataParaGMT3(data);
        const dataComparacao = this.normalizarDataParaDia(dataComparacaoGMT3);
        const dataComparacaoInicio = new Date(dataComparacao);
        dataComparacaoInicio.setHours(0, 0, 0, 0);
        const dataComparacaoFim = new Date(dataComparacao);
        dataComparacaoFim.setHours(23, 59, 59, 999);
        const associacoesVigentes = await this.empresaTabelaPrecoRepository
            .createQueryBuilder('etp')
            .innerJoinAndSelect('etp.tabelaPrecoProduto', 'tabela')
            .where('etp.idEmpresa = :idEmpresa', { idEmpresa })
            .andWhere('etp.ativo = :ativo', { ativo: 1 })
            .andWhere('etp.dataInicio <= :dataComparacaoFim', { dataComparacaoFim })
            .andWhere('(etp.dataFim IS NULL OR etp.dataFim >= :dataComparacaoInicio)', { dataComparacaoInicio })
            .orderBy('etp.dataInicio', 'DESC')
            .getMany();
        if (associacoesVigentes.length === 0) {
            this.logger.log(`Nenhuma associação vigente encontrada para empresa ${idEmpresa} na data ${data.toISOString()}`);
            return null;
        }
        const associacaoVigente = associacoesVigentes[0];
        const tabelaAssociada = associacaoVigente.tabelaPrecoProduto;
        if (!tabelaAssociada || !tabelaAssociada.ativo) {
            this.logger.warn(`Tabela associada ${associacaoVigente.idTabelaPrecoProduto} não está ativa para empresa ${idEmpresa}`);
            return null;
        }
        const tabelaVigente = await this.tabelaPrecoProdutoService.buscaTabelaPrecoProdutosPorId(tabelaAssociada.idTabelaPrecoProduto);
        if (tabelaVigente) {
            this.cacheVigentePorEmpresa.set(key, { tabela: tabelaVigente, expires: Date.now() + CACHE_TTL_MS });
        }
        return tabelaVigente;
    }
    async validarSobreposicaoVigencia(idEmpresa, dataInicio, dataFim, idExcluir) {
        const dataInicioNormalizada = this.normalizarDataParaDia(dataInicio);
        const dataFimNormalizada = dataFim ? this.normalizarDataParaDia(dataFim) : null;
        const queryBuilder = this.empresaTabelaPrecoRepository
            .createQueryBuilder('etp')
            .where('etp.idEmpresa = :idEmpresa', { idEmpresa })
            .andWhere('etp.ativo = :ativo', { ativo: 1 });
        if (idExcluir) {
            queryBuilder.andWhere('etp.idEmpresaTabelaPreco != :idExcluir', { idExcluir });
        }
        const associacoesExistentes = await queryBuilder.getMany();
        for (const associacao of associacoesExistentes) {
            const assocDataInicio = this.normalizarDataParaDia(new Date(associacao.dataInicio));
            const assocDataFim = associacao.dataFim ? this.normalizarDataParaDia(new Date(associacao.dataFim)) : null;
            const sobrepoe = this.datasSobrepoem(dataInicioNormalizada, dataFimNormalizada, assocDataInicio, assocDataFim);
            if (sobrepoe) {
                throw new common_1.BadRequestException(`Já existe uma associação vigente para esta empresa no período de ${assocDataInicio.toLocaleDateString('pt-BR')} ` +
                    `a ${assocDataFim ? assocDataFim.toLocaleDateString('pt-BR') : 'indefinidamente'}. ` +
                    `Não é possível criar associações com períodos sobrepostos.`);
            }
        }
    }
    datasSobrepoem(inicio1, fim1, inicio2, fim2) {
        if (!fim1) {
            return !fim2 || inicio1 <= fim2;
        }
        if (!fim2) {
            return inicio2 <= fim1;
        }
        return inicio1 <= fim2 && inicio2 <= fim1;
    }
    async criarAssociacao(currentUser, idEmpresa, idTabelaPrecoProduto, dataInicio, dataFim) {
        const dataInicioNormalizada = this.normalizarDataParaDia(dataInicio);
        const dataFimNormalizada = dataFim ? this.normalizarDataParaDia(dataFim) : null;
        if (dataFimNormalizada) {
            if (dataFimNormalizada <= dataInicioNormalizada) {
                throw new common_1.BadRequestException('A data de fim deve ser maior que a data de início');
            }
        }
        const tabela = await this.tabelaPrecoProdutoService.buscaTabelaPrecoProdutosPorId(idTabelaPrecoProduto);
        if (!tabela) {
            throw new common_1.NotFoundException(`Tabela de preço com ID ${idTabelaPrecoProduto} não encontrada`);
        }
        if (!tabela.ativo) {
            throw new common_1.BadRequestException(`Tabela de preço com ID ${idTabelaPrecoProduto} não está ativa`);
        }
        await this.validarSobreposicaoVigencia(idEmpresa, dataInicioNormalizada, dataFimNormalizada);
        const novaAssociacao = this.empresaTabelaPrecoRepository.create({
            idEmpresa,
            idTabelaPrecoProduto,
            dataInicio: dataInicioNormalizada,
            dataFim: dataFimNormalizada,
            ativo: 1,
            idUsuarioCadastro: currentUser.user.idUsuario,
        });
        const associacaoSalva = await this.empresaTabelaPrecoRepository.save(novaAssociacao);
        this.limparCachePorEmpresa(idEmpresa);
        this.logger.log(`Associação criada: Empresa ${idEmpresa} -> Tabela ${idTabelaPrecoProduto} ` +
            `(${dataInicio.toLocaleDateString('pt-BR')} a ${dataFim ? dataFim.toLocaleDateString('pt-BR') : 'indefinidamente'})`);
        return associacaoSalva;
    }
    async listarAssociacoesPorEmpresa(idEmpresa) {
        return this.empresaTabelaPrecoRepository.find({
            where: { idEmpresa },
            relations: ['tabelaPrecoProduto', 'empresa'],
            order: { dataInicio: 'DESC' },
        });
    }
    async buscarAssociacaoPorId(idEmpresaTabelaPreco) {
        const associacao = await this.empresaTabelaPrecoRepository.findOne({
            where: { idEmpresaTabelaPreco },
            relations: ['tabelaPrecoProduto', 'empresa'],
        });
        if (!associacao) {
            throw new common_1.NotFoundException(`Associação com ID ${idEmpresaTabelaPreco} não encontrada`);
        }
        return associacao;
    }
    async atualizarAssociacao(currentUser, idEmpresaTabelaPreco, idTabelaPrecoProduto, dataInicio, dataFim) {
        const associacao = await this.buscarAssociacaoPorId(idEmpresaTabelaPreco);
        const dataInicioFinal = dataInicio
            ? this.normalizarDataParaDia(dataInicio)
            : this.normalizarDataParaDia(associacao.dataInicio);
        const dataFimFinal = dataFim !== undefined
            ? (dataFim ? this.normalizarDataParaDia(dataFim) : null)
            : (associacao.dataFim ? this.normalizarDataParaDia(associacao.dataFim) : null);
        if (dataFimFinal) {
            if (dataFimFinal <= dataInicioFinal) {
                throw new common_1.BadRequestException('A data de fim deve ser maior que a data de início');
            }
        }
        if (idTabelaPrecoProduto !== undefined && idTabelaPrecoProduto !== null) {
            const tabela = await this.tabelaPrecoProdutoService.buscaTabelaPrecoProdutosPorId(idTabelaPrecoProduto);
            if (!tabela) {
                throw new common_1.NotFoundException(`Tabela de preço com ID ${idTabelaPrecoProduto} não encontrada`);
            }
            if (!tabela.ativo) {
                throw new common_1.BadRequestException(`Tabela de preço com ID ${idTabelaPrecoProduto} não está ativa`);
            }
            associacao.idTabelaPrecoProduto = idTabelaPrecoProduto;
            associacao.tabelaPrecoProduto = tabela;
        }
        await this.validarSobreposicaoVigencia(associacao.idEmpresa, dataInicioFinal, dataFimFinal || null, idEmpresaTabelaPreco);
        if (dataInicio)
            associacao.dataInicio = dataInicioFinal;
        if (dataFim !== undefined)
            associacao.dataFim = dataFimFinal;
        const associacaoAtualizada = await this.empresaTabelaPrecoRepository.save(associacao);
        this.limparCachePorEmpresa(associacao.idEmpresa);
        this.logger.log(`Associação ${idEmpresaTabelaPreco} atualizada`);
        return associacaoAtualizada;
    }
    async desativarAssociacao(idEmpresaTabelaPreco) {
        const associacao = await this.buscarAssociacaoPorId(idEmpresaTabelaPreco);
        associacao.ativo = 0;
        await this.empresaTabelaPrecoRepository.save(associacao);
        this.limparCachePorEmpresa(associacao.idEmpresa);
        this.logger.log(`Associação ${idEmpresaTabelaPreco} desativada`);
    }
    limparCachePorEmpresa(idEmpresa) {
        const keysToDelete = [];
        for (const key of this.cacheVigentePorEmpresa.keys()) {
            if (key.startsWith(`empresa-${idEmpresa}-`)) {
                keysToDelete.push(key);
            }
        }
        keysToDelete.forEach(key => this.cacheVigentePorEmpresa.delete(key));
    }
};
exports.EmpresaTabelaPrecoService = EmpresaTabelaPrecoService;
exports.EmpresaTabelaPrecoService = EmpresaTabelaPrecoService = EmpresaTabelaPrecoService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(empresaTabelaPreco_entity_1.EmpresaTabelaPreco)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        tabelaPrecoProduto_service_1.TabelaPrecoProdutoService])
], EmpresaTabelaPrecoService);
//# sourceMappingURL=empresaTabelaPreco.service.js.map
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
var ClassificacaoLancamentoService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClassificacaoLancamentoService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const schedule_1 = require("@nestjs/schedule");
const lancamento_entity_1 = require("../domain/lancamento.entity");
const fornecedor_entity_1 = require("../domain/fornecedor.entity");
const tipo_lancamento_enum_1 = require("../domain/tipo-lancamento.enum");
let ClassificacaoLancamentoService = ClassificacaoLancamentoService_1 = class ClassificacaoLancamentoService {
    constructor(lancamentoRepository, fornecedorRepository) {
        this.lancamentoRepository = lancamentoRepository;
        this.fornecedorRepository = fornecedorRepository;
        this.logger = new common_1.Logger(ClassificacaoLancamentoService_1.name);
    }
    async classificarLancamento(lancamento) {
        var _a, _b, _c;
        const descricao = lancamento.descricao || '';
        if (lancamento.idFornecedor) {
            const fornecedor = await this.fornecedorRepository.findOne({
                where: { idFornecedor: lancamento.idFornecedor },
                relations: ['categoria'],
            });
            if (fornecedor === null || fornecedor === void 0 ? void 0 : fornecedor.idCategoria) {
                this.logger.debug(`Lançamento ${lancamento.idLancamento}: classificado via fornecedor vinculado (ID ${fornecedor.idFornecedor}).`);
                return { idCategoria: fornecedor.idCategoria, idFornecedor: fornecedor.idFornecedor };
            }
        }
        const fornecedores = await this.fornecedorRepository
            .createQueryBuilder('f')
            .leftJoinAndSelect('f.categoria', 'categoria')
            .where('f.ativo = :ativo', { ativo: true })
            .getMany();
        if (fornecedores.length === 0) {
            return null;
        }
        for (const fornecedor of fornecedores) {
            for (let documento of [fornecedor.cpf, fornecedor.cnpj]) {
                if (!documento || documento.trim() === '')
                    continue;
                documento = documento.trim();
                const regex = this.construirRegexDocumento(documento);
                if (!regex)
                    continue;
                if (regex.test(descricao)) {
                    this.logger.debug(`Lançamento ${lancamento.idLancamento}: classificado via documento do fornecedor ` +
                        `"${fornecedor.razaoSocial}" (padrão: "${documento}").`);
                    return { idCategoria: (_a = fornecedor.idCategoria) !== null && _a !== void 0 ? _a : null, idFornecedor: fornecedor.idFornecedor };
                }
            }
        }
        const descricaoLower = descricao.toLowerCase();
        for (const fornecedor of fornecedores) {
            const razao = (fornecedor.razaoSocial || '').toLowerCase().trim();
            const fantasia = (fornecedor.nomeFantasia || '').toLowerCase().trim();
            if (razao && descricaoLower.includes(razao)) {
                this.logger.debug(`Lançamento ${lancamento.idLancamento}: classificado via razão social "${fornecedor.razaoSocial}".`);
                return { idCategoria: (_b = fornecedor.idCategoria) !== null && _b !== void 0 ? _b : null, idFornecedor: fornecedor.idFornecedor };
            }
            if (fantasia && descricaoLower.includes(fantasia)) {
                this.logger.debug(`Lançamento ${lancamento.idLancamento}: classificado via nome fantasia "${fornecedor.nomeFantasia}".`);
                return { idCategoria: (_c = fornecedor.idCategoria) !== null && _c !== void 0 ? _c : null, idFornecedor: fornecedor.idFornecedor };
            }
        }
        return null;
    }
    construirRegexDocumento(documento) {
        if (!documento || documento.trim() === '')
            return null;
        const cleanDoc = documento.replace(/[^\d*]/g, '');
        if (cleanDoc.length === 0)
            return null;
        let padrao = '';
        for (let i = 0; i < cleanDoc.length; i++) {
            const ch = cleanDoc[i];
            if (ch === '*') {
                padrao += '[\\d*]';
            }
            else {
                padrao += ch;
            }
            if (i < cleanDoc.length - 1) {
                padrao += '[./ -]*';
            }
        }
        try {
            return new RegExp(padrao, 'i');
        }
        catch (e) {
            this.logger.warn(`Não foi possível construir regex para documento "${documento}": ${e}`);
            return null;
        }
    }
    async classificarLancamentosSemCategoria() {
        const lancamentos = await this.lancamentoRepository
            .createQueryBuilder('l')
            .leftJoin('l.categoria', 'categoria')
            .where('l.tipo = :tipo', { tipo: tipo_lancamento_enum_1.TipoLancamento.DESPESA })
            .andWhere('(l.idCategoria IS NULL OR l.idFornecedor IS NULL OR UPPER(categoria.nome) LIKE :nomeDesconhecido)', {
            nomeDesconhecido: 'DESCONHECID%',
        })
            .getMany();
        let classificados = 0;
        for (const lancamento of lancamentos) {
            const classificacao = await this.classificarLancamento(lancamento);
            if (classificacao) {
                const updateData = {};
                const ehDesconhecido = lancamento.categoria && lancamento.categoria.nome.toUpperCase().includes('DESCONHECID');
                const podeAtualizarCategoria = !lancamento.idCategoria || ehDesconhecido;
                if (classificacao.idCategoria && classificacao.idCategoria !== lancamento.idCategoria && podeAtualizarCategoria) {
                    updateData.idCategoria = classificacao.idCategoria;
                }
                if (classificacao.idFornecedor && classificacao.idFornecedor !== lancamento.idFornecedor) {
                    updateData.idFornecedor = classificacao.idFornecedor;
                }
                if (Object.keys(updateData).length > 0) {
                    await this.lancamentoRepository.update(lancamento.idLancamento, updateData);
                    classificados++;
                }
            }
        }
        const semMatch = lancamentos.length - classificados;
        this.logger.log(`Classificação concluída: ${lancamentos.length} processados, ${classificados} classificados, ${semMatch} sem match.`);
        return {
            processados: lancamentos.length,
            classificados,
            semMatch,
        };
    }
    async jobClassificacaoNoturna() {
        this.logger.log('Job de classificação automática de lançamentos iniciado...');
        try {
            const resultado = await this.classificarLancamentosSemCategoria();
            this.logger.log(`Job concluído: ${resultado.classificados}/${resultado.processados} lançamentos classificados.`);
        }
        catch (error) {
            this.logger.error('Erro no job de classificação de lançamentos.', error === null || error === void 0 ? void 0 : error.stack);
        }
    }
};
exports.ClassificacaoLancamentoService = ClassificacaoLancamentoService;
__decorate([
    (0, schedule_1.Cron)('0 2 * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ClassificacaoLancamentoService.prototype, "jobClassificacaoNoturna", null);
exports.ClassificacaoLancamentoService = ClassificacaoLancamentoService = ClassificacaoLancamentoService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(lancamento_entity_1.Lancamento)),
    __param(1, (0, typeorm_1.InjectRepository)(fornecedor_entity_1.Fornecedor)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], ClassificacaoLancamentoService);
//# sourceMappingURL=classificacao-lancamento.service.js.map
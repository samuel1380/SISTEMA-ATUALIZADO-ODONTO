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
exports.FinanceiroController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const class_validator_1 = require("class-validator");
const financeiro_service_1 = require("../business/financeiro.service");
const create_conta_dto_1 = require("../dto/create-conta.dto");
const create_lancamento_dto_1 = require("../dto/create-lancamento.dto");
const update_lancamento_dto_1 = require("../dto/update-lancamento.dto");
const pagar_parcela_dto_1 = require("../dto/pagar-parcela.dto");
const create_transferencia_dto_1 = require("../dto/create-transferencia.dto");
const class_transformer_1 = require("class-transformer");
const node_arqt_base_gerenciador_usuarios_1 = require("@hunter-solucoes/node-arqt-base-gerenciador-usuarios");
const tipo_lancamento_enum_1 = require("../domain/tipo-lancamento.enum");
const optional_parse_int_1 = require("../dto/optional-parse-int");
const parcela_entity_1 = require("../domain/parcela.entity");
const classificacao_lancamento_service_1 = require("../business/classificacao-lancamento.service");
class ListarLancamentosQueryDto {
}
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(tipo_lancamento_enum_1.TipoLancamento),
    __metadata("design:type", String)
], ListarLancamentosQueryDto.prototype, "tipo", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(12),
    __metadata("design:type", Number)
], ListarLancamentosQueryDto.prototype, "mes", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(2000),
    __metadata("design:type", Number)
], ListarLancamentosQueryDto.prototype, "ano", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], ListarLancamentosQueryDto.prototype, "idConta", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(parcela_entity_1.StatusParcela),
    __metadata("design:type", String)
], ListarLancamentosQueryDto.prototype, "statusParcela", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], ListarLancamentosQueryDto.prototype, "idCategoria", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], ListarLancamentosQueryDto.prototype, "idCategoriaPai", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['true', '1']),
    __metadata("design:type", String)
], ListarLancamentosQueryDto.prototype, "incluirTotais", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['competencia', 'vencimento']),
    __metadata("design:type", String)
], ListarLancamentosQueryDto.prototype, "filtroData", void 0);
class DreQueryDto {
}
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DreQueryDto.prototype, "dataInicio", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DreQueryDto.prototype, "dataFim", void 0);
__decorate([
    (0, class_validator_1.IsIn)(['competencia', 'caixa']),
    __metadata("design:type", String)
], DreQueryDto.prototype, "regime", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], DreQueryDto.prototype, "idEmpresa", void 0);
let FinanceiroController = class FinanceiroController {
    constructor(financeiroService, classificacaoService) {
        this.financeiroService = financeiroService;
        this.classificacaoService = classificacaoService;
    }
    criarConta(createContaDto) {
        return this.financeiroService.criarConta(createContaDto);
    }
    listarContas() {
        return this.financeiroService.listarContas();
    }
    buscarContaPorId(id) {
        return this.financeiroService.buscarContaPorId(id);
    }
    criarLancamento(createLancamentoDto) {
        return this.financeiroService.criarLancamento(createLancamentoDto);
    }
    importarLancamentosCsvHistorico(file, idCategoriaReceita, idCategoriaDespesa, idConta) {
        if (!file) {
            throw new common_1.BadRequestException('Arquivo CSV não enviado.');
        }
        if (!file.originalname.toLowerCase().endsWith('.csv')) {
            throw new common_1.BadRequestException('Envie um arquivo com extensão .csv.');
        }
        const parseOpt = (s) => {
            if (s == null || String(s).trim() === '')
                return undefined;
            const n = parseInt(String(s), 10);
            return Number.isNaN(n) ? undefined : n;
        };
        return this.financeiroService.importarLancamentosCsvHistorico(file.buffer, parseOpt(idCategoriaReceita), parseOpt(idCategoriaDespesa), parseOpt(idConta));
    }
    classificarLancamentosSemCategoria() {
        return this.classificacaoService.classificarLancamentosSemCategoria();
    }
    listarLancamentos(query) {
        const incluirTotais = query.incluirTotais === 'true' || query.incluirTotais === '1';
        if (incluirTotais) {
            return this.financeiroService.listarLancamentosComTotais(query);
        }
        return this.financeiroService.listarLancamentos(query);
    }
    buscarLancamentoPorId(id) {
        return this.financeiroService.buscarLancamentoPorId(id);
    }
    atualizarLancamento(id, updateLancamentoDto) {
        return this.financeiroService.atualizarLancamento(id, updateLancamentoDto);
    }
    cancelarParcela(id) {
        return this.financeiroService.cancelarParcela(id);
    }
    pagarParcela(id, pagarParcelaDto) {
        return this.financeiroService.pagarParcela(id, pagarParcelaDto);
    }
    transferirEntreContas(createTransferenciaDto) {
        return this.financeiroService.transferirEntreContas(createTransferenciaDto);
    }
    getFluxoCaixa(dataInicio, dataFim) {
        return this.financeiroService.consultarFluxoCaixa(dataInicio, dataFim);
    }
    obterDashboard(idEmpresa, mes, ano) {
        return this.financeiroService.obterDashboardFinanceiro(idEmpresa, mes, ano);
    }
    listarDividas(idEmpresa) {
        return this.financeiroService.listarDividas(idEmpresa);
    }
    calcularFluxoCaixa(idEmpresa, dias) {
        return this.financeiroService.calcularFluxoCaixa(idEmpresa, dias || 30);
    }
    gerarDre(query) {
        return this.financeiroService.gerarDre({
            dataInicio: query.dataInicio,
            dataFim: query.dataFim,
            regime: query.regime,
            idEmpresa: query.idEmpresa,
        });
    }
};
exports.FinanceiroController = FinanceiroController;
__decorate([
    (0, node_arqt_base_gerenciador_usuarios_1.Roles)('admin', 'financeiro'),
    (0, common_1.Post)('contas'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_conta_dto_1.CreateContaDto]),
    __metadata("design:returntype", void 0)
], FinanceiroController.prototype, "criarConta", null);
__decorate([
    (0, node_arqt_base_gerenciador_usuarios_1.Roles)('admin', 'financeiro'),
    (0, common_1.Get)('contas'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], FinanceiroController.prototype, "listarContas", null);
__decorate([
    (0, node_arqt_base_gerenciador_usuarios_1.Roles)('admin', 'financeiro'),
    (0, common_1.Get)('contas/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], FinanceiroController.prototype, "buscarContaPorId", null);
__decorate([
    (0, node_arqt_base_gerenciador_usuarios_1.Roles)('admin', 'financeiro'),
    (0, common_1.Post)('lancamentos'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_lancamento_dto_1.CreateLancamentoDto]),
    __metadata("design:returntype", void 0)
], FinanceiroController.prototype, "criarLancamento", null);
__decorate([
    (0, node_arqt_base_gerenciador_usuarios_1.Roles)('admin', 'financeiro'),
    (0, common_1.Post)('lancamentos/importar-csv-historico'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('arquivo')),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: false, forbidNonWhitelisted: false })),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Body)('idCategoriaReceita')),
    __param(2, (0, common_1.Body)('idCategoriaDespesa')),
    __param(3, (0, common_1.Body)('idConta')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", void 0)
], FinanceiroController.prototype, "importarLancamentosCsvHistorico", null);
__decorate([
    (0, node_arqt_base_gerenciador_usuarios_1.Roles)('admin', 'financeiro'),
    (0, common_1.Post)('lancamentos/classificar-sem-categoria'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], FinanceiroController.prototype, "classificarLancamentosSemCategoria", null);
__decorate([
    (0, node_arqt_base_gerenciador_usuarios_1.Roles)('admin', 'financeiro'),
    (0, common_1.Get)('lancamentos'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ListarLancamentosQueryDto]),
    __metadata("design:returntype", void 0)
], FinanceiroController.prototype, "listarLancamentos", null);
__decorate([
    (0, node_arqt_base_gerenciador_usuarios_1.Roles)('admin', 'financeiro'),
    (0, common_1.Get)('lancamentos/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], FinanceiroController.prototype, "buscarLancamentoPorId", null);
__decorate([
    (0, node_arqt_base_gerenciador_usuarios_1.Roles)('admin', 'financeiro'),
    (0, common_1.Put)('lancamentos/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_lancamento_dto_1.UpdateLancamentoDto]),
    __metadata("design:returntype", void 0)
], FinanceiroController.prototype, "atualizarLancamento", null);
__decorate([
    (0, node_arqt_base_gerenciador_usuarios_1.Roles)('admin', 'financeiro'),
    (0, common_1.Delete)('parcelas/:id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], FinanceiroController.prototype, "cancelarParcela", null);
__decorate([
    (0, node_arqt_base_gerenciador_usuarios_1.Roles)('admin', 'financeiro'),
    (0, common_1.Post)('parcelas/:id/pagar'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, pagar_parcela_dto_1.PagarParcelaDto]),
    __metadata("design:returntype", void 0)
], FinanceiroController.prototype, "pagarParcela", null);
__decorate([
    (0, node_arqt_base_gerenciador_usuarios_1.Roles)('admin', 'financeiro'),
    (0, common_1.Post)('transferencias'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_transferencia_dto_1.CreateTransferenciaDto]),
    __metadata("design:returntype", void 0)
], FinanceiroController.prototype, "transferirEntreContas", null);
__decorate([
    (0, node_arqt_base_gerenciador_usuarios_1.Roles)('admin'),
    (0, common_1.Get)('fluxo-caixa'),
    __param(0, (0, common_1.Query)('dataInicio')),
    __param(1, (0, common_1.Query)('dataFim')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], FinanceiroController.prototype, "getFluxoCaixa", null);
__decorate([
    (0, node_arqt_base_gerenciador_usuarios_1.Roles)('admin'),
    (0, common_1.Get)('dashboard'),
    __param(0, (0, common_1.Query)('idEmpresa', optional_parse_int_1.OptionalParseIntPipe)),
    __param(1, (0, common_1.Query)('mes')),
    __param(2, (0, common_1.Query)('ano')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Number]),
    __metadata("design:returntype", void 0)
], FinanceiroController.prototype, "obterDashboard", null);
__decorate([
    (0, node_arqt_base_gerenciador_usuarios_1.Roles)('admin'),
    (0, common_1.Get)('dividas'),
    __param(0, (0, common_1.Query)('idEmpresa', optional_parse_int_1.OptionalParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], FinanceiroController.prototype, "listarDividas", null);
__decorate([
    (0, node_arqt_base_gerenciador_usuarios_1.Roles)('admin'),
    (0, common_1.Get)('fluxo-caixa-projecao'),
    __param(0, (0, common_1.Query)('idEmpresa', optional_parse_int_1.OptionalParseIntPipe)),
    __param(1, (0, common_1.Query)('dias')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", void 0)
], FinanceiroController.prototype, "calcularFluxoCaixa", null);
__decorate([
    (0, node_arqt_base_gerenciador_usuarios_1.Roles)('admin', 'financeiro'),
    (0, common_1.Get)('dre'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [DreQueryDto]),
    __metadata("design:returntype", void 0)
], FinanceiroController.prototype, "gerarDre", null);
exports.FinanceiroController = FinanceiroController = __decorate([
    (0, common_1.Controller)('financeiro'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })),
    __metadata("design:paramtypes", [financeiro_service_1.FinanceiroService,
        classificacao_lancamento_service_1.ClassificacaoLancamentoService])
], FinanceiroController);
//# sourceMappingURL=financeiro.controller.js.map
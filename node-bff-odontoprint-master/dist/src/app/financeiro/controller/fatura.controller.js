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
exports.FaturaController = void 0;
const common_1 = require("@nestjs/common");
const fatura_service_1 = require("../business/fatura.service");
const create_fatura_dto_1 = require("../dto/create-fatura.dto");
const pagar_item_fatura_dto_1 = require("../dto/pagar-item-fatura.dto");
const mover_ordem_servico_fatura_dto_1 = require("../dto/mover-ordem-servico-fatura.dto");
const atualizar_desconto_fatura_dto_1 = require("../dto/atualizar-desconto-fatura.dto");
const atualizar_anotacoes_fatura_dto_1 = require("../dto/atualizar-anotacoes-fatura.dto");
const atualizar_periodo_fatura_dto_1 = require("../dto/atualizar-periodo-fatura.dto");
const lancar_valor_fatura_dto_1 = require("../dto/lancar-valor-fatura.dto");
const dividir_fatura_dto_1 = require("../dto/dividir-fatura.dto");
const node_arqt_base_gerenciador_usuarios_1 = require("@hunter-solucoes/node-arqt-base-gerenciador-usuarios");
const fatura_recorrente_service_1 = require("../business/fatura-recorrente.service");
const optional_parse_int_1 = require("../dto/optional-parse-int");
const parse_status_array_pipe_1 = require("../dto/parse-status-array.pipe");
let FaturaController = class FaturaController {
    constructor(faturaService, faturaRecorrenteService) {
        this.faturaService = faturaService;
        this.faturaRecorrenteService = faturaRecorrenteService;
    }
    criarFatura(dto) {
        return this.faturaService.criarFatura(dto);
    }
    listarFaturas(currentUser, idEmpresa, status, competencia) {
        return this.faturaService.listarFaturas(currentUser, idEmpresa, status, competencia);
    }
    listarFaturasAbertasPorEmpresa(idEmpresa) {
        return this.faturaService.listarFaturasAbertasPorEmpresa(idEmpresa);
    }
    relatorioFaturasPendentes(currentUser) {
        return this.faturaService.relatorioFaturasPendentes(currentUser);
    }
    buscarFaturaPorId(id) {
        return this.faturaService.buscarFaturaPorId(id);
    }
    obterResumoImpressao(id) {
        return this.faturaService.obterResumoImpressaoFatura(id);
    }
    obterResumoImpressaoPorCompetencia(competencia, idEmpresa) {
        const competenciaFormatada = competencia.replace('-', '/');
        return this.faturaService.obterResumoImpressaoFaturasPorCompetencia(competenciaFormatada, idEmpresa);
    }
    fecharFatura(id) {
        return this.faturaService.fecharFatura(id);
    }
    recalcularFatura(id) {
        return this.faturaService.recalcularFatura(id);
    }
    organizarFaturasNoMesCorreto(idEmpresa) {
        return this.faturaService.organizarFaturasNoMesCorreto(idEmpresa);
    }
    recalcularFaturasEmAberto() {
        return this.faturaService.recalcularFaturasEmAberto();
    }
    corrigirStatusFaturasQuitadas() {
        return this.faturaService.corrigirStatusFaturasQuitadas();
    }
    removerItemDaFatura(idFatura, idOrdemServico) {
        return this.faturaService.removerItemDaFatura(idFatura, idOrdemServico);
    }
    pagarItemFatura(dto) {
        return this.faturaService.pagarItemFatura(dto);
    }
    moverOrdemServicoFatura(dto) {
        return this.faturaService.moverOrdemServicoFatura(dto);
    }
    atualizarDescontoFatura(id, dto) {
        return this.faturaService.atualizarDescontoFatura(id, dto.desconto);
    }
    atualizarAnotacoesFatura(id, dto) {
        return this.faturaService.atualizarAnotacoesFatura(id, dto.anotacoes);
    }
    lancarValorFatura(id, dto) {
        return this.faturaService.lancarValorFatura(id, dto);
    }
    reabrirFatura(id) {
        return this.faturaService.reabrirFatura(id);
    }
    dividirFatura(id, dto) {
        return this.faturaService.dividirFatura(id, dto);
    }
    buscarDevolucoesComponentes(id) {
        return this.faturaService.buscarDevolucoesComponentes(id);
    }
    salvarDevolucoesComponentes(id, items) {
        return this.faturaService.salvarDevolucoesComponentes(id, items);
    }
    atualizarPeriodoFatura(id, dto) {
        return this.faturaService.atualizarPeriodoFatura(id, dto);
    }
    listarFaturasPorEmpresa(idEmpresa) {
        return this.faturaService.listarFaturasPorEmpresa(idEmpresa);
    }
};
exports.FaturaController = FaturaController;
__decorate([
    (0, node_arqt_base_gerenciador_usuarios_1.Roles)('admin'),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_fatura_dto_1.CreateFaturaDto]),
    __metadata("design:returntype", void 0)
], FaturaController.prototype, "criarFatura", null);
__decorate([
    (0, node_arqt_base_gerenciador_usuarios_1.Roles)('admin', 'financeiro'),
    (0, common_1.Get)(),
    __param(0, (0, node_arqt_base_gerenciador_usuarios_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('idEmpresa', new optional_parse_int_1.OptionalParseIntPipe())),
    __param(2, (0, common_1.Query)('status', new parse_status_array_pipe_1.ParseStatusArrayPipe())),
    __param(3, (0, common_1.Query)('competencia')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Array, String]),
    __metadata("design:returntype", void 0)
], FaturaController.prototype, "listarFaturas", null);
__decorate([
    (0, node_arqt_base_gerenciador_usuarios_1.Roles)('admin', 'financeiro'),
    (0, common_1.Get)('abertas/:idEmpresa'),
    __param(0, (0, common_1.Param)('idEmpresa', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], FaturaController.prototype, "listarFaturasAbertasPorEmpresa", null);
__decorate([
    (0, node_arqt_base_gerenciador_usuarios_1.Roles)('admin', 'financeiro'),
    (0, common_1.Get)('relatorio-faturas-pendentes'),
    __param(0, (0, node_arqt_base_gerenciador_usuarios_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], FaturaController.prototype, "relatorioFaturasPendentes", null);
__decorate([
    (0, node_arqt_base_gerenciador_usuarios_1.Roles)('admin', 'financeiro'),
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], FaturaController.prototype, "buscarFaturaPorId", null);
__decorate([
    (0, node_arqt_base_gerenciador_usuarios_1.Roles)('admin'),
    (0, common_1.Get)(':id/detalhamento-impressao'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], FaturaController.prototype, "obterResumoImpressao", null);
__decorate([
    (0, node_arqt_base_gerenciador_usuarios_1.Roles)('admin'),
    (0, common_1.Get)('impressao/competencia/:competencia'),
    __param(0, (0, common_1.Param)('competencia')),
    __param(1, (0, common_1.Query)('idEmpresa', new optional_parse_int_1.OptionalParseIntPipe())),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", void 0)
], FaturaController.prototype, "obterResumoImpressaoPorCompetencia", null);
__decorate([
    (0, node_arqt_base_gerenciador_usuarios_1.Roles)('admin'),
    (0, common_1.Post)(':id/fechar'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], FaturaController.prototype, "fecharFatura", null);
__decorate([
    (0, node_arqt_base_gerenciador_usuarios_1.Roles)('admin'),
    (0, common_1.Post)(':id/recalcular'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], FaturaController.prototype, "recalcularFatura", null);
__decorate([
    (0, node_arqt_base_gerenciador_usuarios_1.Roles)('admin', 'financeiro'),
    (0, common_1.Post)('organizar-mes-correto'),
    __param(0, (0, common_1.Query)('idEmpresa', new optional_parse_int_1.OptionalParseIntPipe())),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], FaturaController.prototype, "organizarFaturasNoMesCorreto", null);
__decorate([
    (0, node_arqt_base_gerenciador_usuarios_1.Roles)('admin'),
    (0, common_1.Post)('recalcular-todas'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], FaturaController.prototype, "recalcularFaturasEmAberto", null);
__decorate([
    (0, node_arqt_base_gerenciador_usuarios_1.Roles)('admin'),
    (0, common_1.Post)('corrigir-status-quitadas'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], FaturaController.prototype, "corrigirStatusFaturasQuitadas", null);
__decorate([
    (0, node_arqt_base_gerenciador_usuarios_1.Roles)('admin'),
    (0, common_1.Delete)(':idFatura/itens/:idOrdemServico'),
    __param(0, (0, common_1.Param)('idFatura', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('idOrdemServico', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", void 0)
], FaturaController.prototype, "removerItemDaFatura", null);
__decorate([
    (0, node_arqt_base_gerenciador_usuarios_1.Roles)('admin'),
    (0, common_1.Post)('pagar-itens'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pagar_item_fatura_dto_1.PagarItensFaturaDto]),
    __metadata("design:returntype", void 0)
], FaturaController.prototype, "pagarItemFatura", null);
__decorate([
    (0, node_arqt_base_gerenciador_usuarios_1.Roles)('admin'),
    (0, common_1.Put)('mover-ordem-servico'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [mover_ordem_servico_fatura_dto_1.MoverOrdemServicoFaturaDto]),
    __metadata("design:returntype", void 0)
], FaturaController.prototype, "moverOrdemServicoFatura", null);
__decorate([
    (0, node_arqt_base_gerenciador_usuarios_1.Roles)('admin'),
    (0, common_1.Put)(':id/desconto'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, atualizar_desconto_fatura_dto_1.AtualizarDescontoFaturaDto]),
    __metadata("design:returntype", void 0)
], FaturaController.prototype, "atualizarDescontoFatura", null);
__decorate([
    (0, node_arqt_base_gerenciador_usuarios_1.Roles)('admin'),
    (0, common_1.Put)(':id/anotacoes'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, atualizar_anotacoes_fatura_dto_1.AtualizarAnotacoesFaturaDto]),
    __metadata("design:returntype", void 0)
], FaturaController.prototype, "atualizarAnotacoesFatura", null);
__decorate([
    (0, node_arqt_base_gerenciador_usuarios_1.Roles)('admin'),
    (0, common_1.Post)(':id/lancar-valor'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, lancar_valor_fatura_dto_1.LancarValorFaturaDto]),
    __metadata("design:returntype", void 0)
], FaturaController.prototype, "lancarValorFatura", null);
__decorate([
    (0, node_arqt_base_gerenciador_usuarios_1.Roles)('admin'),
    (0, common_1.Post)(':id/reabrir'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], FaturaController.prototype, "reabrirFatura", null);
__decorate([
    (0, node_arqt_base_gerenciador_usuarios_1.Roles)('admin'),
    (0, common_1.Post)(':id/dividir'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, dividir_fatura_dto_1.DividirFaturaDto]),
    __metadata("design:returntype", void 0)
], FaturaController.prototype, "dividirFatura", null);
__decorate([
    (0, node_arqt_base_gerenciador_usuarios_1.Roles)('admin'),
    (0, common_1.Get)(':id/devolucoes-componentes'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], FaturaController.prototype, "buscarDevolucoesComponentes", null);
__decorate([
    (0, node_arqt_base_gerenciador_usuarios_1.Roles)('admin'),
    (0, common_1.Post)(':id/devolucoes-componentes'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Array]),
    __metadata("design:returntype", void 0)
], FaturaController.prototype, "salvarDevolucoesComponentes", null);
__decorate([
    (0, node_arqt_base_gerenciador_usuarios_1.Roles)('admin', 'financeiro'),
    (0, common_1.Put)(':id/periodo'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, atualizar_periodo_fatura_dto_1.AtualizarPeriodoFaturaDto]),
    __metadata("design:returntype", void 0)
], FaturaController.prototype, "atualizarPeriodoFatura", null);
__decorate([
    (0, node_arqt_base_gerenciador_usuarios_1.Roles)('admin', 'financeiro'),
    (0, common_1.Get)('empresa/:idEmpresa/todas'),
    __param(0, (0, common_1.Param)('idEmpresa', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], FaturaController.prototype, "listarFaturasPorEmpresa", null);
exports.FaturaController = FaturaController = __decorate([
    (0, common_1.Controller)('financeiro/faturas'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })),
    __metadata("design:paramtypes", [fatura_service_1.FaturaService,
        fatura_recorrente_service_1.FaturaRecorrenteService])
], FaturaController);
//# sourceMappingURL=fatura.controller.js.map
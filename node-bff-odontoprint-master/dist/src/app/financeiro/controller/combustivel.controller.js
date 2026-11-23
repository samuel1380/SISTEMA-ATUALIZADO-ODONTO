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
exports.CombustivelController = void 0;
const common_1 = require("@nestjs/common");
const node_arqt_base_gerenciador_usuarios_1 = require("@hunter-solucoes/node-arqt-base-gerenciador-usuarios");
const combustivel_service_1 = require("../business/combustivel.service");
const optional_parse_int_1 = require("../dto/optional-parse-int");
let CombustivelController = class CombustivelController {
    constructor(combustivelService) {
        this.combustivelService = combustivelService;
    }
    criarVeiculo(dto) {
        return this.combustivelService.criarVeiculo(dto);
    }
    listarVeiculos() {
        return this.combustivelService.listarVeiculos();
    }
    buscarVeiculoPorId(id) {
        return this.combustivelService.buscarVeiculoPorId(id);
    }
    atualizarVeiculo(id, dto) {
        return this.combustivelService.atualizarVeiculo(id, dto);
    }
    excluirVeiculo(id) {
        return this.combustivelService.excluirVeiculo(id);
    }
    registrarAbastecimento(dto) {
        return this.combustivelService.registrarAbastecimento(dto);
    }
    listarAbastecimentos(idVeiculo, dataInicio, dataFim) {
        return this.combustivelService.listarAbastecimentos(idVeiculo, dataInicio, dataFim);
    }
    obterConsumoVeiculo(id, dataInicio, dataFim) {
        return this.combustivelService.calcularConsumo(id, dataInicio, dataFim);
    }
    obterConfiguracaoKm() {
        return this.combustivelService.obterConfiguracaoKm();
    }
    atualizarConfiguracaoKm(dto) {
        return this.combustivelService.atualizarConfiguracaoKm(dto);
    }
    registrarPagamentoKm(dto) {
        return this.combustivelService.registrarPagamentoKm(dto);
    }
    listarPagamentosKm(dataInicio, dataFim) {
        return this.combustivelService.listarPagamentosKm(dataInicio, dataFim);
    }
    buscarPagamentoKmPorId(id) {
        return this.combustivelService.buscarPagamentoKmPorId(id);
    }
};
exports.CombustivelController = CombustivelController;
__decorate([
    (0, node_arqt_base_gerenciador_usuarios_1.Roles)('admin', 'vendas', 'financeiro'),
    (0, common_1.Post)('veiculos'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CombustivelController.prototype, "criarVeiculo", null);
__decorate([
    (0, node_arqt_base_gerenciador_usuarios_1.Roles)('admin', 'vendas', 'financeiro'),
    (0, common_1.Get)('veiculos'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CombustivelController.prototype, "listarVeiculos", null);
__decorate([
    (0, node_arqt_base_gerenciador_usuarios_1.Roles)('admin', 'vendas', 'financeiro'),
    (0, common_1.Get)('veiculos/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], CombustivelController.prototype, "buscarVeiculoPorId", null);
__decorate([
    (0, node_arqt_base_gerenciador_usuarios_1.Roles)('admin', 'vendas', 'financeiro'),
    (0, common_1.Put)('veiculos/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], CombustivelController.prototype, "atualizarVeiculo", null);
__decorate([
    (0, node_arqt_base_gerenciador_usuarios_1.Roles)('admin', 'vendas', 'financeiro'),
    (0, common_1.Delete)('veiculos/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], CombustivelController.prototype, "excluirVeiculo", null);
__decorate([
    (0, node_arqt_base_gerenciador_usuarios_1.Roles)('admin', 'vendas', 'financeiro'),
    (0, common_1.Post)('abastecimento'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CombustivelController.prototype, "registrarAbastecimento", null);
__decorate([
    (0, node_arqt_base_gerenciador_usuarios_1.Roles)('admin', 'vendas', 'financeiro'),
    (0, common_1.Get)('abastecimentos'),
    __param(0, (0, common_1.Query)('idVeiculo', optional_parse_int_1.OptionalParseIntPipe)),
    __param(1, (0, common_1.Query)('dataInicio')),
    __param(2, (0, common_1.Query)('dataFim')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, String]),
    __metadata("design:returntype", void 0)
], CombustivelController.prototype, "listarAbastecimentos", null);
__decorate([
    (0, node_arqt_base_gerenciador_usuarios_1.Roles)('admin', 'vendas', 'financeiro'),
    (0, common_1.Get)('veiculos/:id/consumo'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)('dataInicio')),
    __param(2, (0, common_1.Query)('dataFim')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, String]),
    __metadata("design:returntype", void 0)
], CombustivelController.prototype, "obterConsumoVeiculo", null);
__decorate([
    (0, node_arqt_base_gerenciador_usuarios_1.Roles)('admin', 'vendas', 'financeiro'),
    (0, common_1.Get)('configuracao-km'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CombustivelController.prototype, "obterConfiguracaoKm", null);
__decorate([
    (0, node_arqt_base_gerenciador_usuarios_1.Roles)('admin', 'vendas', 'financeiro'),
    (0, common_1.Put)('configuracao-km'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CombustivelController.prototype, "atualizarConfiguracaoKm", null);
__decorate([
    (0, node_arqt_base_gerenciador_usuarios_1.Roles)('admin', 'vendas', 'financeiro'),
    (0, common_1.Post)('pagamento-km'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CombustivelController.prototype, "registrarPagamentoKm", null);
__decorate([
    (0, node_arqt_base_gerenciador_usuarios_1.Roles)('admin', 'vendas', 'financeiro'),
    (0, common_1.Get)('pagamentos-km'),
    __param(0, (0, common_1.Query)('dataInicio')),
    __param(1, (0, common_1.Query)('dataFim')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], CombustivelController.prototype, "listarPagamentosKm", null);
__decorate([
    (0, node_arqt_base_gerenciador_usuarios_1.Roles)('admin', 'vendas', 'financeiro'),
    (0, common_1.Get)('pagamentos-km/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], CombustivelController.prototype, "buscarPagamentoKmPorId", null);
exports.CombustivelController = CombustivelController = __decorate([
    (0, common_1.Controller)('financeiro/combustivel'),
    __metadata("design:paramtypes", [combustivel_service_1.CombustivelService])
], CombustivelController);
//# sourceMappingURL=combustivel.controller.js.map
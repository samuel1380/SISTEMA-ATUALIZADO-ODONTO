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
exports.LogisticaController = void 0;
const common_1 = require("@nestjs/common");
const node_arqt_base_gerenciador_usuarios_1 = require("@hunter-solucoes/node-arqt-base-gerenciador-usuarios");
const logistica_service_1 = require("../business/logistica.service");
const entrega_entity_1 = require("../domain/entrega.entity");
const optional_parse_int_1 = require("../dto/optional-parse-int");
let LogisticaController = class LogisticaController {
    constructor(logisticaService) {
        this.logisticaService = logisticaService;
    }
    criarFornecedor(dto) {
        return this.logisticaService.criarFornecedor(dto);
    }
    listarFornecedores(idEmpresa) {
        return this.logisticaService.listarFornecedores(idEmpresa);
    }
    buscarFornecedorPorId(id) {
        return this.logisticaService.buscarFornecedorPorId(id);
    }
    atualizarFornecedor(id, dto) {
        return this.logisticaService.atualizarFornecedor(id, dto);
    }
    excluirFornecedor(id) {
        return this.logisticaService.excluirFornecedor(id);
    }
    registrarEntrega(dto) {
        return this.logisticaService.registrarEntrega(dto);
    }
    listarEntregas(idFornecedorLogistica, dataInicio, dataFim, status) {
        return this.logisticaService.listarEntregas(idFornecedorLogistica, dataInicio, dataFim, status);
    }
    atualizarStatusEntrega(id, status) {
        return this.logisticaService.atualizarStatusEntrega(id, status);
    }
};
exports.LogisticaController = LogisticaController;
__decorate([
    (0, node_arqt_base_gerenciador_usuarios_1.Roles)('admin', 'vendas', 'financeiro'),
    (0, common_1.Post)('fornecedores'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], LogisticaController.prototype, "criarFornecedor", null);
__decorate([
    (0, node_arqt_base_gerenciador_usuarios_1.Roles)('admin', 'vendas', 'financeiro'),
    (0, common_1.Get)('fornecedores'),
    __param(0, (0, common_1.Query)('idEmpresa', optional_parse_int_1.OptionalParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], LogisticaController.prototype, "listarFornecedores", null);
__decorate([
    (0, node_arqt_base_gerenciador_usuarios_1.Roles)('admin', 'vendas', 'financeiro'),
    (0, common_1.Get)('fornecedores/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], LogisticaController.prototype, "buscarFornecedorPorId", null);
__decorate([
    (0, node_arqt_base_gerenciador_usuarios_1.Roles)('admin', 'vendas', 'financeiro'),
    (0, common_1.Put)('fornecedores/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], LogisticaController.prototype, "atualizarFornecedor", null);
__decorate([
    (0, node_arqt_base_gerenciador_usuarios_1.Roles)('admin', 'vendas', 'financeiro'),
    (0, common_1.Delete)('fornecedores/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], LogisticaController.prototype, "excluirFornecedor", null);
__decorate([
    (0, node_arqt_base_gerenciador_usuarios_1.Roles)('admin', 'vendas', 'financeiro'),
    (0, common_1.Post)('entrega'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], LogisticaController.prototype, "registrarEntrega", null);
__decorate([
    (0, node_arqt_base_gerenciador_usuarios_1.Roles)('admin', 'vendas', 'financeiro'),
    (0, common_1.Get)('entregas'),
    __param(0, (0, common_1.Query)('idFornecedorLogistica', optional_parse_int_1.OptionalParseIntPipe)),
    __param(1, (0, common_1.Query)('dataInicio')),
    __param(2, (0, common_1.Query)('dataFim')),
    __param(3, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, String, String]),
    __metadata("design:returntype", void 0)
], LogisticaController.prototype, "listarEntregas", null);
__decorate([
    (0, node_arqt_base_gerenciador_usuarios_1.Roles)('admin', 'vendas', 'financeiro'),
    (0, common_1.Put)('entregas/:id/status'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String]),
    __metadata("design:returntype", void 0)
], LogisticaController.prototype, "atualizarStatusEntrega", null);
exports.LogisticaController = LogisticaController = __decorate([
    (0, common_1.Controller)('financeiro/logistica'),
    __metadata("design:paramtypes", [logistica_service_1.LogisticaService])
], LogisticaController);
//# sourceMappingURL=logistica.controller.js.map
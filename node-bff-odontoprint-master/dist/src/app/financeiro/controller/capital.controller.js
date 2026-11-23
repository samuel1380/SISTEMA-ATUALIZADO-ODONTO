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
exports.CapitalController = void 0;
const common_1 = require("@nestjs/common");
const node_arqt_base_gerenciador_usuarios_1 = require("@hunter-solucoes/node-arqt-base-gerenciador-usuarios");
const capital_service_1 = require("../business/capital.service");
const aporte_entity_1 = require("../domain/aporte.entity");
const emprestimo_entity_1 = require("../domain/emprestimo.entity");
const optional_parse_int_1 = require("../dto/optional-parse-int");
let CapitalController = class CapitalController {
    constructor(capitalService) {
        this.capitalService = capitalService;
    }
    registrarAporte(dto) {
        return this.capitalService.registrarAporte(dto);
    }
    listarAportes(idSocio, dataInicio, dataFim, tipo) {
        return this.capitalService.listarAportes(idSocio, dataInicio, dataFim, tipo);
    }
    registrarEmprestimo(dto) {
        return this.capitalService.registrarEmprestimo(dto);
    }
    listarEmprestimos(tipo, status, dataInicio, dataFim) {
        return this.capitalService.listarEmprestimos(tipo, status, dataInicio, dataFim);
    }
    atualizarStatusEmprestimo(id, status) {
        return this.capitalService.atualizarStatusEmprestimo(id, status);
    }
    registrarJurosEmprestimo(id, dto) {
        return this.capitalService.registrarJurosEmprestimo(id, dto);
    }
    registrarAcrescimoEmprestimo(id, dto) {
        return this.capitalService.registrarAcrescimoEmprestimo(id, dto);
    }
    registrarPagamentoEmprestimo(id, dto) {
        return this.capitalService.registrarPagamentoEmprestimo(id, dto);
    }
    recalcularSaldoEmprestimo(id) {
        return this.capitalService.recalcularSaldoEmprestimo(id);
    }
    listarMovimentacoesPagamentoEmprestimo(id) {
        return this.capitalService.listarMovimentacoesPagamentoEmprestimo(id);
    }
};
exports.CapitalController = CapitalController;
__decorate([
    (0, node_arqt_base_gerenciador_usuarios_1.Roles)('admin'),
    (0, common_1.Post)('aporte'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CapitalController.prototype, "registrarAporte", null);
__decorate([
    (0, node_arqt_base_gerenciador_usuarios_1.Roles)('admin'),
    (0, common_1.Get)('aportes'),
    __param(0, (0, common_1.Query)('idSocio', optional_parse_int_1.OptionalParseIntPipe)),
    __param(1, (0, common_1.Query)('dataInicio')),
    __param(2, (0, common_1.Query)('dataFim')),
    __param(3, (0, common_1.Query)('tipo')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, String, String]),
    __metadata("design:returntype", void 0)
], CapitalController.prototype, "listarAportes", null);
__decorate([
    (0, node_arqt_base_gerenciador_usuarios_1.Roles)('admin'),
    (0, common_1.Post)('emprestimo'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CapitalController.prototype, "registrarEmprestimo", null);
__decorate([
    (0, node_arqt_base_gerenciador_usuarios_1.Roles)('admin'),
    (0, common_1.Get)('emprestimos'),
    __param(0, (0, common_1.Query)('tipo')),
    __param(1, (0, common_1.Query)('status')),
    __param(2, (0, common_1.Query)('dataInicio')),
    __param(3, (0, common_1.Query)('dataFim')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", void 0)
], CapitalController.prototype, "listarEmprestimos", null);
__decorate([
    (0, node_arqt_base_gerenciador_usuarios_1.Roles)('admin'),
    (0, common_1.Put)('emprestimos/:id/status'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String]),
    __metadata("design:returntype", void 0)
], CapitalController.prototype, "atualizarStatusEmprestimo", null);
__decorate([
    (0, node_arqt_base_gerenciador_usuarios_1.Roles)('admin'),
    (0, common_1.Post)('emprestimos/:id/juros'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], CapitalController.prototype, "registrarJurosEmprestimo", null);
__decorate([
    (0, node_arqt_base_gerenciador_usuarios_1.Roles)('admin'),
    (0, common_1.Post)('emprestimos/:id/acrescimo'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], CapitalController.prototype, "registrarAcrescimoEmprestimo", null);
__decorate([
    (0, node_arqt_base_gerenciador_usuarios_1.Roles)('admin'),
    (0, common_1.Post)('emprestimos/:id/pagamento'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], CapitalController.prototype, "registrarPagamentoEmprestimo", null);
__decorate([
    (0, node_arqt_base_gerenciador_usuarios_1.Roles)('admin'),
    (0, common_1.Post)('emprestimos/:id/recalcular'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], CapitalController.prototype, "recalcularSaldoEmprestimo", null);
__decorate([
    (0, node_arqt_base_gerenciador_usuarios_1.Roles)('admin'),
    (0, common_1.Get)('emprestimos/:id/movimentacoes-pagamento'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], CapitalController.prototype, "listarMovimentacoesPagamentoEmprestimo", null);
exports.CapitalController = CapitalController = __decorate([
    (0, common_1.Controller)('financeiro/capital'),
    __metadata("design:paramtypes", [capital_service_1.CapitalService])
], CapitalController);
//# sourceMappingURL=capital.controller.js.map
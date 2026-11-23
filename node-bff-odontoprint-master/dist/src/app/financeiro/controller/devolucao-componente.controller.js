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
exports.DevolucaoComponenteController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const node_arqt_base_gerenciador_usuarios_1 = require("@hunter-solucoes/node-arqt-base-gerenciador-usuarios");
const devolucao_componente_service_1 = require("../business/devolucao-componente.service");
const create_devolucao_dto_1 = require("../dto/create-devolucao.dto");
let DevolucaoComponenteController = class DevolucaoComponenteController {
    constructor(devolucaoService) {
        this.devolucaoService = devolucaoService;
    }
    solicitarDevolucao(dto) {
        return this.devolucaoService.solicitarDevolucao(dto);
    }
    confirmarRecebimento(currentUser, id) {
        return this.devolucaoService.confirmarRecebimento(id, currentUser);
    }
    listarComponentesPendentes(idEmpresa) {
        const idEmpresaNumber = idEmpresa ? parseInt(idEmpresa, 10) : undefined;
        return this.devolucaoService.listarComponentesPendentes(idEmpresaNumber);
    }
    listarComponentesConcluidos(idEmpresa) {
        const idEmpresaNumber = idEmpresa ? parseInt(idEmpresa, 10) : undefined;
        return this.devolucaoService.listarComponentesConcluidos(idEmpresaNumber);
    }
    listarDevolucoesPorFatura(idFatura) {
        return this.devolucaoService.listarDevolucoesPorFatura(idFatura);
    }
};
exports.DevolucaoComponenteController = DevolucaoComponenteController;
__decorate([
    (0, node_arqt_base_gerenciador_usuarios_1.Roles)('admin', 'vendas', 'financeiro'),
    (0, common_1.Post)('solicitar'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_devolucao_dto_1.CreateDevolucaoDto]),
    __metadata("design:returntype", void 0)
], DevolucaoComponenteController.prototype, "solicitarDevolucao", null);
__decorate([
    (0, node_arqt_base_gerenciador_usuarios_1.Roles)('admin', 'vendas', 'financeiro'),
    (0, common_1.Post)(':id/confirmar'),
    __param(0, (0, node_arqt_base_gerenciador_usuarios_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", void 0)
], DevolucaoComponenteController.prototype, "confirmarRecebimento", null);
__decorate([
    (0, node_arqt_base_gerenciador_usuarios_1.Roles)('admin', 'vendas', 'financeiro'),
    (0, common_1.Get)('pendentes'),
    __param(0, (0, common_1.Query)('idEmpresa')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DevolucaoComponenteController.prototype, "listarComponentesPendentes", null);
__decorate([
    (0, node_arqt_base_gerenciador_usuarios_1.Roles)('admin', 'vendas', 'financeiro'),
    (0, common_1.Get)('concluidas'),
    __param(0, (0, common_1.Query)('idEmpresa')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DevolucaoComponenteController.prototype, "listarComponentesConcluidos", null);
__decorate([
    (0, node_arqt_base_gerenciador_usuarios_1.Roles)('admin', 'vendas', 'financeiro'),
    (0, common_1.Get)('fatura/:idFatura'),
    __param(0, (0, common_1.Param)('idFatura', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], DevolucaoComponenteController.prototype, "listarDevolucoesPorFatura", null);
exports.DevolucaoComponenteController = DevolucaoComponenteController = __decorate([
    (0, swagger_1.ApiTags)('Financeiro - Devoluções'),
    (0, common_1.Controller)('devolucao-componente'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })),
    __metadata("design:paramtypes", [devolucao_componente_service_1.DevolucaoComponenteService])
], DevolucaoComponenteController);
//# sourceMappingURL=devolucao-componente.controller.js.map
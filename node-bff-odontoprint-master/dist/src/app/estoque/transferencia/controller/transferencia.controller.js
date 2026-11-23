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
exports.TransferenciaController = void 0;
const common_1 = require("@nestjs/common");
const create_transferencia_dto_1 = require("../domain/dto/create-transferencia.dto");
const transferencia_service_1 = require("../service/transferencia.service");
const node_arqt_base_gerenciador_usuarios_1 = require("@hunter-solucoes/node-arqt-base-gerenciador-usuarios");
let TransferenciaController = class TransferenciaController {
    constructor(transferenciaService) {
        this.transferenciaService = transferenciaService;
    }
    create(createTransferenciaDto) {
        return this.transferenciaService.create(createTransferenciaDto);
    }
    findAll() {
        return this.transferenciaService.findAll();
    }
    findDebts(idAlmoxarifado) {
        return this.transferenciaService.findDebtsByAlmoxarifado(idAlmoxarifado);
    }
    findCredits(idAlmoxarifado) {
        return this.transferenciaService.findCreditsByAlmoxarifado(idAlmoxarifado);
    }
};
exports.TransferenciaController = TransferenciaController;
__decorate([
    (0, node_arqt_base_gerenciador_usuarios_1.Roles)('admin', 'vendas', 'financeiro'),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_transferencia_dto_1.CreateTransferenciaDto]),
    __metadata("design:returntype", void 0)
], TransferenciaController.prototype, "create", null);
__decorate([
    (0, node_arqt_base_gerenciador_usuarios_1.Roles)('admin', 'vendas', 'financeiro'),
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TransferenciaController.prototype, "findAll", null);
__decorate([
    (0, node_arqt_base_gerenciador_usuarios_1.Roles)('admin', 'vendas', 'financeiro'),
    (0, common_1.Get)('debitos/:idAlmoxarifado'),
    __param(0, (0, common_1.Param)('idAlmoxarifado', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], TransferenciaController.prototype, "findDebts", null);
__decorate([
    (0, node_arqt_base_gerenciador_usuarios_1.Roles)('admin', 'vendas', 'financeiro'),
    (0, common_1.Get)('creditos/:idAlmoxarifado'),
    __param(0, (0, common_1.Param)('idAlmoxarifado', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], TransferenciaController.prototype, "findCredits", null);
exports.TransferenciaController = TransferenciaController = __decorate([
    (0, common_1.Controller)('transferencia'),
    __metadata("design:paramtypes", [transferencia_service_1.TransferenciaService])
], TransferenciaController);
//# sourceMappingURL=transferencia.controller.js.map
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
exports.ComponenteController = void 0;
const dist_1 = require("@hunter-solucoes/node-arqt-base-gerenciador-usuarios/dist");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const componente_service_1 = require("../business/componente.service");
const componente_dto_1 = require("../dto/componente.dto");
let ComponenteController = class ComponenteController {
    constructor(componenteService) {
        this.componenteService = componenteService;
    }
    async buscarComponente() {
        return this.componenteService.buscaComponentesAtivos();
    }
    async buscaComponentePorId(idComponente) {
        return this.componenteService.buscaComponentePorId(idComponente);
    }
    async cadastrarComponente(currentUser, componenteDto) {
        return this.componenteService.cadastrarComponente(currentUser, componenteDto);
    }
    async editarComponente(currentUser, idComponente, componenteDto) {
        return this.componenteService.editarComponente(currentUser, idComponente, componenteDto);
    }
};
exports.ComponenteController = ComponenteController;
__decorate([
    (0, dist_1.Roles)('admin', 'comum', 'producao'),
    (0, common_1.Get)('ativos'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ComponenteController.prototype, "buscarComponente", null);
__decorate([
    (0, dist_1.Roles)('admin'),
    (0, common_1.Get)(':idComponente'),
    __param(0, (0, common_1.Param)('idComponente', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ComponenteController.prototype, "buscaComponentePorId", null);
__decorate([
    (0, dist_1.Roles)('admin'),
    (0, common_1.Post)(''),
    __param(0, (0, dist_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, componente_dto_1.ComponenteDto]),
    __metadata("design:returntype", Promise)
], ComponenteController.prototype, "cadastrarComponente", null);
__decorate([
    (0, dist_1.Roles)('admin'),
    (0, common_1.Put)(':idComponente'),
    __param(0, (0, dist_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('idComponente', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, componente_dto_1.ComponenteDto]),
    __metadata("design:returntype", Promise)
], ComponenteController.prototype, "editarComponente", null);
exports.ComponenteController = ComponenteController = __decorate([
    (0, swagger_1.ApiTags)('Componente'),
    (0, common_1.Controller)('componente'),
    __metadata("design:paramtypes", [componente_service_1.ComponenteService])
], ComponenteController);
//# sourceMappingURL=componente.controller.js.map
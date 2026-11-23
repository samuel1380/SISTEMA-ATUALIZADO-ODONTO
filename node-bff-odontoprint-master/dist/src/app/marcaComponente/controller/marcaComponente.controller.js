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
exports.MarcaComponenteController = void 0;
const dist_1 = require("@hunter-solucoes/node-arqt-base-gerenciador-usuarios/dist");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const marcaComponente_service_1 = require("../business/marcaComponente.service");
const marcaComponente_dto_1 = require("../dto/marcaComponente.dto");
let MarcaComponenteController = class MarcaComponenteController {
    constructor(produtoEmpresaService) {
        this.produtoEmpresaService = produtoEmpresaService;
    }
    async cadastrarMarcaComponente(currentUser, marcaComponenteDto) {
        return this.produtoEmpresaService.cadastrarMarcaComponente(currentUser, marcaComponenteDto);
    }
    async buscarMarcaComponente() {
        return this.produtoEmpresaService.buscarMarcaComponente();
    }
    async buscarMarcaComponentePorId(idMarcaComponente) {
        return this.produtoEmpresaService.buscarMarcaPorId(idMarcaComponente);
    }
    async editarMarcaComponente(idMarcaComponente, marcaComponenteDto) {
        return this.produtoEmpresaService.editarMarcaComponente(idMarcaComponente, marcaComponenteDto);
    }
};
exports.MarcaComponenteController = MarcaComponenteController;
__decorate([
    (0, dist_1.Roles)('admin'),
    (0, common_1.Post)(),
    __param(0, (0, dist_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, marcaComponente_dto_1.MarcaComponenteDto]),
    __metadata("design:returntype", Promise)
], MarcaComponenteController.prototype, "cadastrarMarcaComponente", null);
__decorate([
    (0, dist_1.Roles)('admin', 'comum'),
    (0, common_1.Get)('ativos'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MarcaComponenteController.prototype, "buscarMarcaComponente", null);
__decorate([
    (0, dist_1.Roles)('admin'),
    (0, common_1.Get)(':idMarcaComponente'),
    __param(0, (0, common_1.Param)('idMarcaComponente', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], MarcaComponenteController.prototype, "buscarMarcaComponentePorId", null);
__decorate([
    (0, dist_1.Roles)('admin'),
    (0, common_1.Put)(':idMarcaComponente'),
    __param(0, (0, common_1.Param)('idMarcaComponente', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, marcaComponente_dto_1.MarcaComponenteDto]),
    __metadata("design:returntype", Promise)
], MarcaComponenteController.prototype, "editarMarcaComponente", null);
exports.MarcaComponenteController = MarcaComponenteController = __decorate([
    (0, swagger_1.ApiTags)('Marca Componente'),
    (0, common_1.Controller)('marcacomponente'),
    __metadata("design:paramtypes", [marcaComponente_service_1.MarcaComponenteService])
], MarcaComponenteController);
//# sourceMappingURL=marcaComponente.controller.js.map
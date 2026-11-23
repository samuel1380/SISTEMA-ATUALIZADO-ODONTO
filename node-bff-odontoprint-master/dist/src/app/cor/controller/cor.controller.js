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
exports.CorController = void 0;
const dist_1 = require("@hunter-solucoes/node-arqt-base-gerenciador-usuarios/dist");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const cor_service_1 = require("../business/cor.service");
const cor_dto_1 = require("../dto/cor.dto");
let CorController = class CorController {
    constructor(corService) {
        this.corService = corService;
    }
    async cadastrarMarcaComponente(currentUser, corDto) {
        return this.corService.cadastrarCor(currentUser, corDto);
    }
    async buscaCores() {
        return this.corService.buscaCores();
    }
    async buscaComponentePorId(idCor) {
        return this.corService.buscaCorPorId(idCor);
    }
    async editarComponente(idCor, corDto) {
        return this.corService.editarCor(idCor, corDto);
    }
};
exports.CorController = CorController;
__decorate([
    (0, dist_1.Roles)('admin'),
    (0, common_1.Post)(),
    __param(0, (0, dist_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, cor_dto_1.CorDto]),
    __metadata("design:returntype", Promise)
], CorController.prototype, "cadastrarMarcaComponente", null);
__decorate([
    (0, dist_1.Roles)('admin', 'comum'),
    (0, common_1.Get)('ativos'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CorController.prototype, "buscaCores", null);
__decorate([
    (0, dist_1.Roles)('admin'),
    (0, common_1.Get)(':idCor'),
    __param(0, (0, common_1.Param)('idCor', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], CorController.prototype, "buscaComponentePorId", null);
__decorate([
    (0, dist_1.Roles)('admin'),
    (0, common_1.Put)(':idCor'),
    __param(0, (0, common_1.Param)('idCor', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, cor_dto_1.CorDto]),
    __metadata("design:returntype", Promise)
], CorController.prototype, "editarComponente", null);
exports.CorController = CorController = __decorate([
    (0, swagger_1.ApiTags)('Cor'),
    (0, common_1.Controller)('cor'),
    __metadata("design:paramtypes", [cor_service_1.CorService])
], CorController);
//# sourceMappingURL=cor.controller.js.map
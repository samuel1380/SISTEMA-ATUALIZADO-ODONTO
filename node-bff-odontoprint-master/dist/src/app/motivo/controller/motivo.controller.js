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
exports.MotivoController = void 0;
const dist_1 = require("@hunter-solucoes/node-arqt-base-gerenciador-usuarios/dist");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const motivo_service_1 = require("../business/motivo.service");
const motivo_dto_1 = require("../dto/motivo.dto");
let MotivoController = class MotivoController {
    constructor(motivoService) {
        this.motivoService = motivoService;
    }
    async cadastrarMotivo(currentUser, motivoDto) {
        return this.motivoService.cadastrarMotivo(currentUser, motivoDto);
    }
    async buscaMotivos(tipo, todas) {
        const incluirInativos = todas === 'true' || todas === '1';
        return this.motivoService.buscaMotivos(tipo, incluirInativos);
    }
    async buscaMotivoPorId(idMotivo) {
        return this.motivoService.buscaMotivoPorId(idMotivo);
    }
    async editarMotivo(idMotivo, motivoDto) {
        return this.motivoService.editarMotivo(idMotivo, motivoDto);
    }
    async desativarMotivo(idMotivo) {
        return this.motivoService.desativarMotivo(idMotivo);
    }
};
exports.MotivoController = MotivoController;
__decorate([
    (0, dist_1.Roles)('admin'),
    (0, common_1.Post)(),
    __param(0, (0, dist_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, motivo_dto_1.MotivoDto]),
    __metadata("design:returntype", Promise)
], MotivoController.prototype, "cadastrarMotivo", null);
__decorate([
    (0, dist_1.Roles)('admin', 'producao', 'vendas', 'financeiro'),
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('tipo')),
    __param(1, (0, common_1.Query)('todas')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], MotivoController.prototype, "buscaMotivos", null);
__decorate([
    (0, dist_1.Roles)('admin'),
    (0, common_1.Get)(':idMotivo'),
    __param(0, (0, common_1.Param)('idMotivo', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], MotivoController.prototype, "buscaMotivoPorId", null);
__decorate([
    (0, dist_1.Roles)('admin'),
    (0, common_1.Put)(':idMotivo'),
    __param(0, (0, common_1.Param)('idMotivo', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], MotivoController.prototype, "editarMotivo", null);
__decorate([
    (0, dist_1.Roles)('admin'),
    (0, common_1.Delete)(':idMotivo'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Param)('idMotivo', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], MotivoController.prototype, "desativarMotivo", null);
exports.MotivoController = MotivoController = __decorate([
    (0, swagger_1.ApiTags)('Motivo'),
    (0, common_1.Controller)('motivo'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })),
    __metadata("design:paramtypes", [motivo_service_1.MotivoService])
], MotivoController);
//# sourceMappingURL=motivo.controller.js.map
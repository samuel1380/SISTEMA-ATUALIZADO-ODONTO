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
exports.DentistaController = void 0;
const dist_1 = require("@hunter-solucoes/node-arqt-base-gerenciador-usuarios/dist");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const dentista_service_1 = require("../business/dentista.service");
const dentista_dto_1 = require("../dto/dentista.dto");
let DentistaController = class DentistaController {
    constructor(dentistaService) {
        this.dentistaService = dentistaService;
    }
    async cadastrarDentista(currentUser, dentistaDto, idEmpresaHeaders) {
        var _a;
        let idEmpresa = currentUser.user.empresas && ((_a = currentUser.user.empresas[0]) === null || _a === void 0 ? void 0 : _a.idEmpresa);
        if (currentUser.user.tipoUsuario === "externo" && idEmpresa) {
            dentistaDto.idEmpresa = idEmpresa;
            return this.dentistaService.cadastrarDentista(currentUser, idEmpresa, dentistaDto);
        }
        else if (currentUser.user.tipoUsuario === "interno") {
            idEmpresa = parseInt(idEmpresaHeaders);
            dentistaDto.idEmpresa = idEmpresa;
            return this.dentistaService.cadastrarDentista(currentUser, idEmpresa, dentistaDto);
        }
    }
    async buscaDentistas(currentUser) {
        var _a;
        let idEmpresa = currentUser.user.empresas && ((_a = currentUser.user.empresas[0]) === null || _a === void 0 ? void 0 : _a.idEmpresa);
        return this.dentistaService.buscaDentistaPorEmpresaId(idEmpresa);
    }
    async buscaDentistaPorEmpresaId(idEmpresaHeaders) {
        return this.dentistaService.buscaDentistaPorEmpresaId(idEmpresaHeaders);
    }
};
exports.DentistaController = DentistaController;
__decorate([
    (0, dist_1.Roles)('admin'),
    (0, common_1.Post)(),
    __param(0, (0, dist_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Headers)('idEmpresa')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, dentista_dto_1.DentistaDto, String]),
    __metadata("design:returntype", Promise)
], DentistaController.prototype, "cadastrarDentista", null);
__decorate([
    (0, dist_1.Roles)('admin', 'comum'),
    (0, common_1.Get)(),
    __param(0, (0, dist_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DentistaController.prototype, "buscaDentistas", null);
__decorate([
    (0, dist_1.Roles)('admin', 'producao'),
    (0, common_1.Get)('idEmpresa'),
    __param(0, (0, common_1.Headers)('idEmpresa')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DentistaController.prototype, "buscaDentistaPorEmpresaId", null);
exports.DentistaController = DentistaController = __decorate([
    (0, swagger_1.ApiTags)('Dentista'),
    (0, common_1.Controller)('dentista'),
    __metadata("design:paramtypes", [dentista_service_1.DentistaService])
], DentistaController);
//# sourceMappingURL=dentista.controller.js.map
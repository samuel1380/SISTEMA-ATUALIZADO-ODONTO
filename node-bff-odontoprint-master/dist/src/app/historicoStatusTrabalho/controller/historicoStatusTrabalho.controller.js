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
exports.HistoricoStatusTrabalhoController = void 0;
const dist_1 = require("@hunter-solucoes/node-arqt-base-gerenciador-usuarios/dist");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const historicoStatusTrabalho_service_1 = require("../business/historicoStatusTrabalho.service");
let HistoricoStatusTrabalhoController = class HistoricoStatusTrabalhoController {
    constructor(historicoStatusTrabalhoService) {
        this.historicoStatusTrabalhoService = historicoStatusTrabalhoService;
    }
    async buscaHistoricoStatusTrabalho(idTrabalho) {
        return this.historicoStatusTrabalhoService.buscaHistoricoStatusTrabalho(idTrabalho);
    }
};
exports.HistoricoStatusTrabalhoController = HistoricoStatusTrabalhoController;
__decorate([
    (0, dist_1.Roles)('admin'),
    (0, common_1.Get)(':idTrabalho'),
    __param(0, (0, common_1.Param)('idTrabalho', new common_1.ParseIntPipe())),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], HistoricoStatusTrabalhoController.prototype, "buscaHistoricoStatusTrabalho", null);
exports.HistoricoStatusTrabalhoController = HistoricoStatusTrabalhoController = __decorate([
    (0, swagger_1.ApiTags)('HistoricoStatusTrabalho'),
    (0, common_1.Controller)('historicoStatusTrabalho'),
    __metadata("design:paramtypes", [historicoStatusTrabalho_service_1.HistoricoStatusTrabalhoService])
], HistoricoStatusTrabalhoController);
//# sourceMappingURL=historicoStatusTrabalho.controller.js.map
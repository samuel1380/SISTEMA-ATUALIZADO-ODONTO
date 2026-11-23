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
exports.ConciliacaoController = void 0;
const common_1 = require("@nestjs/common");
const node_arqt_base_gerenciador_usuarios_1 = require("@hunter-solucoes/node-arqt-base-gerenciador-usuarios");
const conciliacao_service_1 = require("../business/conciliacao.service");
const vincular_conciliacao_dto_1 = require("../dto/vincular-conciliacao.dto");
const filtro_conciliacao_dto_1 = require("../dto/filtro-conciliacao.dto");
let ConciliacaoController = class ConciliacaoController {
    constructor(conciliacaoService) {
        this.conciliacaoService = conciliacaoService;
    }
    async listarTransacoes(filtros) {
        return this.conciliacaoService.listarTransacoesNaoConciliadas(filtros);
    }
    async listarDisponiveis(filtros) {
        return this.conciliacaoService.listarMovimentacoesDisponiveis(filtros);
    }
    async vincular(dto, currentUser) {
        var _a, _b;
        const idUsuario = ((_a = currentUser.user) === null || _a === void 0 ? void 0 : _a.idUsuario) || ((_b = currentUser.user) === null || _b === void 0 ? void 0 : _b.id) || 0;
        return this.conciliacaoService.vincularConciliacao(dto, idUsuario);
    }
    async desfazerConciliacao(id) {
        await this.conciliacaoService.desfazerConciliacao(id);
        return { message: 'Conciliação desfeita com sucesso.' };
    }
    async ignorarTransacao(id) {
        await this.conciliacaoService.ignorarTransacao(id);
        return { message: 'Transação marcada como ignorada.' };
    }
    async buscarSugestoes(idTransacao) {
        return this.conciliacaoService.buscarSugestoes(idTransacao);
    }
};
exports.ConciliacaoController = ConciliacaoController;
__decorate([
    (0, node_arqt_base_gerenciador_usuarios_1.Roles)('admin', 'financeiro'),
    (0, common_1.Get)('transacoes'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [filtro_conciliacao_dto_1.FiltroConciliacaoDto]),
    __metadata("design:returntype", Promise)
], ConciliacaoController.prototype, "listarTransacoes", null);
__decorate([
    (0, node_arqt_base_gerenciador_usuarios_1.Roles)('admin', 'financeiro'),
    (0, common_1.Get)('disponiveis'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [filtro_conciliacao_dto_1.FiltroConciliacaoDto]),
    __metadata("design:returntype", Promise)
], ConciliacaoController.prototype, "listarDisponiveis", null);
__decorate([
    (0, node_arqt_base_gerenciador_usuarios_1.Roles)('admin', 'financeiro'),
    (0, common_1.Post)('vincular'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, node_arqt_base_gerenciador_usuarios_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [vincular_conciliacao_dto_1.VincularConciliacaoDto, Object]),
    __metadata("design:returntype", Promise)
], ConciliacaoController.prototype, "vincular", null);
__decorate([
    (0, node_arqt_base_gerenciador_usuarios_1.Roles)('admin', 'financeiro'),
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ConciliacaoController.prototype, "desfazerConciliacao", null);
__decorate([
    (0, node_arqt_base_gerenciador_usuarios_1.Roles)('admin', 'financeiro'),
    (0, common_1.Post)(':id/ignorar'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ConciliacaoController.prototype, "ignorarTransacao", null);
__decorate([
    (0, node_arqt_base_gerenciador_usuarios_1.Roles)('admin', 'financeiro'),
    (0, common_1.Get)('sugestoes/:idTransacao'),
    __param(0, (0, common_1.Param)('idTransacao', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ConciliacaoController.prototype, "buscarSugestoes", null);
exports.ConciliacaoController = ConciliacaoController = __decorate([
    (0, common_1.Controller)('financeiro/conciliacao'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })),
    __metadata("design:paramtypes", [conciliacao_service_1.ConciliacaoService])
], ConciliacaoController);
//# sourceMappingURL=conciliacao.controller.js.map
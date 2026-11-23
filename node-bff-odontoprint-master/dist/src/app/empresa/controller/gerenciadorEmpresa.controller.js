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
exports.GerenciadorEmpresaController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const node_arqt_base_gerenciador_usuarios_1 = require("@hunter-solucoes/node-arqt-base-gerenciador-usuarios");
const empresaCadastro_dto_1 = require("@hunter-solucoes/node-arqt-base-gerenciador-usuarios/dist/src/app/empresa/dto/empresaCadastro.dto");
const gerenciadorEmpresa_service_1 = require("../business/gerenciadorEmpresa.service");
let GerenciadorEmpresaController = class GerenciadorEmpresaController {
    constructor(gerenciadorEmpresaService) {
        this.gerenciadorEmpresaService = gerenciadorEmpresaService;
    }
    async criaEmpresa(body) {
        return this.gerenciadorEmpresaService.cadastraEmpresa(body);
    }
    async emitirEventosEmpresas() {
        return this.gerenciadorEmpresaService.emitirEventosEmpresas();
    }
    async editarEmpresa(idEmpresa, body) {
        return this.gerenciadorEmpresaService.editarEmpresa(idEmpresa, body);
    }
    async buscarEmpresas() {
        return this.gerenciadorEmpresaService.buscarEmpresas();
    }
    async buscarEmpresasAguardandoAprovacao() {
        return this.gerenciadorEmpresaService.buscarEmpresasAguardandoAprovacao();
    }
    async aprovaEmpresa(idEmpresa) {
        return this.gerenciadorEmpresaService.aprovaEmpresa(idEmpresa);
    }
    async buscarEmpresa(idEmpresa) {
        return this.gerenciadorEmpresaService.buscarEmpresa(idEmpresa);
    }
    async desabilitarEmpresa(idEmpresa) {
        return this.gerenciadorEmpresaService.desabilitarEmpresa(idEmpresa);
    }
};
exports.GerenciadorEmpresaController = GerenciadorEmpresaController;
__decorate([
    (0, node_arqt_base_gerenciador_usuarios_1.Public)(),
    (0, swagger_1.ApiExcludeEndpoint)(),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [empresaCadastro_dto_1.EmpresaCadastroDto]),
    __metadata("design:returntype", Promise)
], GerenciadorEmpresaController.prototype, "criaEmpresa", null);
__decorate([
    (0, node_arqt_base_gerenciador_usuarios_1.Roles)('admin'),
    (0, common_1.Post)('emitirEventosEmpresas'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], GerenciadorEmpresaController.prototype, "emitirEventosEmpresas", null);
__decorate([
    (0, node_arqt_base_gerenciador_usuarios_1.Roles)('admin'),
    (0, common_1.Put)(':idEmpresa'),
    __param(0, (0, common_1.Param)('idEmpresa', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, empresaCadastro_dto_1.EmpresaCadastroDto]),
    __metadata("design:returntype", Promise)
], GerenciadorEmpresaController.prototype, "editarEmpresa", null);
__decorate([
    (0, node_arqt_base_gerenciador_usuarios_1.Roles)('admin', 'producao'),
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], GerenciadorEmpresaController.prototype, "buscarEmpresas", null);
__decorate([
    (0, node_arqt_base_gerenciador_usuarios_1.Roles)('admin'),
    (0, common_1.Get)('aguardandoaprovacao'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], GerenciadorEmpresaController.prototype, "buscarEmpresasAguardandoAprovacao", null);
__decorate([
    (0, node_arqt_base_gerenciador_usuarios_1.Roles)('admin'),
    (0, common_1.Get)('aprovar/:idEmpresa'),
    __param(0, (0, common_1.Param)('idEmpresa', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], GerenciadorEmpresaController.prototype, "aprovaEmpresa", null);
__decorate([
    (0, node_arqt_base_gerenciador_usuarios_1.Roles)('admin'),
    (0, common_1.Get)(':idEmpresa'),
    __param(0, (0, common_1.Param)('idEmpresa', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], GerenciadorEmpresaController.prototype, "buscarEmpresa", null);
__decorate([
    (0, node_arqt_base_gerenciador_usuarios_1.Roles)('admin'),
    (0, common_1.Put)(':idEmpresa/desativar'),
    __param(0, (0, common_1.Param)('idEmpresa', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], GerenciadorEmpresaController.prototype, "desabilitarEmpresa", null);
exports.GerenciadorEmpresaController = GerenciadorEmpresaController = __decorate([
    (0, swagger_1.ApiTags)('Empresa'),
    (0, common_1.Controller)('empresa'),
    __metadata("design:paramtypes", [gerenciadorEmpresa_service_1.GerenciadorEmpresaService])
], GerenciadorEmpresaController);
//# sourceMappingURL=gerenciadorEmpresa.controller.js.map
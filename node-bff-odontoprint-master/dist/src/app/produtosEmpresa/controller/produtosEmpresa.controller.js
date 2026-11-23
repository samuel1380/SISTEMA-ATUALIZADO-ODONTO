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
exports.ProdutoEmpresaController = void 0;
const dist_1 = require("@hunter-solucoes/node-arqt-base-gerenciador-usuarios/dist");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const produtosEmpresa_service_1 = require("../business/produtosEmpresa.service");
let ProdutoEmpresaController = class ProdutoEmpresaController {
    constructor(produtoEmpresaService) {
        this.produtoEmpresaService = produtoEmpresaService;
    }
    async cadastrarProdutoEmpresa(currentUser, produtoCadastroDto) {
        var _a;
        const idEmpresa = currentUser.user.empresas && ((_a = currentUser.user.empresas[0]) === null || _a === void 0 ? void 0 : _a.idEmpresa);
        return this.produtoEmpresaService.sincronizarProdutosEmpresa(currentUser, idEmpresa, produtoCadastroDto);
    }
    async buscarProdutosEmpresa(currentUser, idEmpresaHeaders) {
        var _a;
        const idEmpresa = currentUser.user.empresas && ((_a = currentUser.user.empresas[0]) === null || _a === void 0 ? void 0 : _a.idEmpresa);
        if (currentUser.user.tipoUsuario === "externo" && idEmpresa) {
            return this.produtoEmpresaService.buscarProdutosPorEmpresa(idEmpresa);
        }
        else if (currentUser.user.tipoUsuario === "interno") {
            return this.produtoEmpresaService.buscarProdutosPorEmpresa(idEmpresaHeaders);
        }
        return [];
    }
};
exports.ProdutoEmpresaController = ProdutoEmpresaController;
__decorate([
    (0, dist_1.Roles)('admin'),
    (0, common_1.Post)(),
    __param(0, (0, dist_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Array]),
    __metadata("design:returntype", Promise)
], ProdutoEmpresaController.prototype, "cadastrarProdutoEmpresa", null);
__decorate([
    (0, dist_1.Roles)('admin', 'comum'),
    (0, common_1.Get)(),
    __param(0, (0, dist_1.CurrentUser)()),
    __param(1, (0, common_1.Headers)('idEmpresa')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ProdutoEmpresaController.prototype, "buscarProdutosEmpresa", null);
exports.ProdutoEmpresaController = ProdutoEmpresaController = __decorate([
    (0, swagger_1.ApiTags)('Produto da Empresa'),
    (0, common_1.Controller)('produtoempresa'),
    __metadata("design:paramtypes", [produtosEmpresa_service_1.ProdutoEmpresaService])
], ProdutoEmpresaController);
//# sourceMappingURL=produtosEmpresa.controller.js.map
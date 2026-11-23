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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProdutoController = void 0;
const dist_1 = require("@hunter-solucoes/node-arqt-base-gerenciador-usuarios/dist");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const dist_2 = require("@hunter-solucoes/node-arqt-base-gerenciador-usuarios/dist");
let ProdutoController = class ProdutoController {
    constructor(produtoService) {
        this.produtoService = produtoService;
    }
    async buscarProdutosAtivos() {
        return this.produtoService.buscarProdutosAtivos();
    }
};
exports.ProdutoController = ProdutoController;
__decorate([
    (0, dist_1.Roles)('admin', 'comum', 'producao', 'vendas', 'financeiro'),
    (0, common_1.Get)('ativos'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ProdutoController.prototype, "buscarProdutosAtivos", null);
exports.ProdutoController = ProdutoController = __decorate([
    (0, swagger_1.ApiTags)('Produto'),
    (0, common_1.Controller)('produto'),
    __metadata("design:paramtypes", [dist_2.ProdutoService])
], ProdutoController);
//# sourceMappingURL=produto.controller.js.map
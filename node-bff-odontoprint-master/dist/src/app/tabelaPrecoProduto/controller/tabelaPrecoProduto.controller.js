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
exports.TabelaPrecoProdutoController = void 0;
const dist_1 = require("@hunter-solucoes/node-arqt-base-gerenciador-usuarios/dist");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const tabelaPrecoProduto_service_1 = require("../business/tabelaPrecoProduto.service");
const tabelaPrecoProduto_dto_1 = require("../dto/tabelaPrecoProduto.dto");
let TabelaPrecoProdutoController = class TabelaPrecoProdutoController {
    constructor(tabelaPrecoProdutoService) {
        this.tabelaPrecoProdutoService = tabelaPrecoProdutoService;
    }
    async cadastrarTabelaPrecoProduto(currentUser, tabelaPrecoProdutoDto) {
        return this.tabelaPrecoProdutoService.cadastrarTabelaPrecoProduto(currentUser, tabelaPrecoProdutoDto);
    }
    async atualizarTabelaPrecoProduto(currentUser, tabelaPrecoProdutoDto, idTabelaPrecoProduto) {
        tabelaPrecoProdutoDto.idTabelaPrecoProduto = idTabelaPrecoProduto;
        return this.tabelaPrecoProdutoService.cadastrarTabelaPrecoProduto(currentUser, tabelaPrecoProdutoDto);
    }
    async buscaTabelaPrecoProdutos() {
        return this.tabelaPrecoProdutoService.buscaTabelaPrecoProdutos();
    }
    async buscarTabelasMatriz() {
        return this.tabelaPrecoProdutoService.buscarTabelasMatriz();
    }
    async buscarVersoesTabela(idMatriz) {
        return this.tabelaPrecoProdutoService.buscarVersoesTabela(idMatriz);
    }
    async criarNovaVersao(currentUser, idOrigem, dadosVersao) {
        return this.tabelaPrecoProdutoService.criarNovaVersao(currentUser, idOrigem, dadosVersao);
    }
    async buscaTabelaPrecoProdutosPorId(idTabelaPrecoProduto) {
        return this.tabelaPrecoProdutoService.buscaTabelaPrecoProdutosPorId(idTabelaPrecoProduto);
    }
    async buscarTabelaPrecoVigente(data) {
        const dataObj = new Date(data);
        return this.tabelaPrecoProdutoService.buscarTabelaPrecoVigentePorData(dataObj);
    }
    async buscarTabelasProximasVencimento(diasAntecedencia) {
        const dias = diasAntecedencia ? parseInt(diasAntecedencia, 10) : 30;
        return this.tabelaPrecoProdutoService.buscarTabelasProximasVencimento(dias);
    }
};
exports.TabelaPrecoProdutoController = TabelaPrecoProdutoController;
__decorate([
    (0, dist_1.Roles)('admin', 'vendas'),
    (0, common_1.Post)(),
    __param(0, (0, dist_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, tabelaPrecoProduto_dto_1.TabelaPrecoProdutoDto]),
    __metadata("design:returntype", Promise)
], TabelaPrecoProdutoController.prototype, "cadastrarTabelaPrecoProduto", null);
__decorate([
    (0, dist_1.Roles)('admin', 'vendas'),
    (0, common_1.Put)(':idTabelaPrecoProduto'),
    __param(0, (0, dist_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Param)('idTabelaPrecoProduto', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, tabelaPrecoProduto_dto_1.TabelaPrecoProdutoDto, Number]),
    __metadata("design:returntype", Promise)
], TabelaPrecoProdutoController.prototype, "atualizarTabelaPrecoProduto", null);
__decorate([
    (0, dist_1.Roles)('admin', 'vendas', 'financeiro'),
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TabelaPrecoProdutoController.prototype, "buscaTabelaPrecoProdutos", null);
__decorate([
    (0, dist_1.Roles)('admin', 'vendas', 'financeiro'),
    (0, common_1.Get)('matriz'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TabelaPrecoProdutoController.prototype, "buscarTabelasMatriz", null);
__decorate([
    (0, dist_1.Roles)('admin', 'vendas', 'financeiro'),
    (0, common_1.Get)(':idMatriz/versoes'),
    __param(0, (0, common_1.Param)('idMatriz', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], TabelaPrecoProdutoController.prototype, "buscarVersoesTabela", null);
__decorate([
    (0, dist_1.Roles)('admin', 'vendas'),
    (0, common_1.Post)(':idOrigem/nova-versao'),
    __param(0, (0, dist_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('idOrigem', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Object]),
    __metadata("design:returntype", Promise)
], TabelaPrecoProdutoController.prototype, "criarNovaVersao", null);
__decorate([
    (0, dist_1.Roles)('admin', 'vendas', 'financeiro'),
    (0, common_1.Get)(':idTabelaPrecoProduto'),
    __param(0, (0, common_1.Param)('idTabelaPrecoProduto', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], TabelaPrecoProdutoController.prototype, "buscaTabelaPrecoProdutosPorId", null);
__decorate([
    (0, dist_1.Roles)('admin', 'vendas', 'financeiro'),
    (0, common_1.Get)('vigente/:data'),
    __param(0, (0, common_1.Param)('data')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TabelaPrecoProdutoController.prototype, "buscarTabelaPrecoVigente", null);
__decorate([
    (0, dist_1.Roles)('admin', 'vendas', 'financeiro'),
    (0, common_1.Get)('proximas-vencimento'),
    __param(0, (0, common_1.Query)('diasAntecedencia')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TabelaPrecoProdutoController.prototype, "buscarTabelasProximasVencimento", null);
exports.TabelaPrecoProdutoController = TabelaPrecoProdutoController = __decorate([
    (0, swagger_1.ApiTags)('TabelaPrecoProduto'),
    (0, common_1.Controller)('tabelaPrecoProduto'),
    __metadata("design:paramtypes", [tabelaPrecoProduto_service_1.TabelaPrecoProdutoService])
], TabelaPrecoProdutoController);
//# sourceMappingURL=tabelaPrecoProduto.controller.js.map
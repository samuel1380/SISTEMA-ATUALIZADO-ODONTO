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
exports.EmpresaTabelaPrecoController = void 0;
const dist_1 = require("@hunter-solucoes/node-arqt-base-gerenciador-usuarios/dist");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const empresaTabelaPreco_service_1 = require("../business/empresaTabelaPreco.service");
const criar_empresa_tabela_preco_dto_1 = require("../dto/criar-empresa-tabela-preco.dto");
const atualizar_empresa_tabela_preco_dto_1 = require("../dto/atualizar-empresa-tabela-preco.dto");
let EmpresaTabelaPrecoController = class EmpresaTabelaPrecoController {
    constructor(empresaTabelaPrecoService) {
        this.empresaTabelaPrecoService = empresaTabelaPrecoService;
    }
    async criarAssociacao(currentUser, dto) {
        const dataInicio = this.parseISODatePreservandoDia(dto.dataInicio);
        const dataFim = dto.dataFim ? this.parseISODatePreservandoDia(dto.dataFim) : undefined;
        return this.empresaTabelaPrecoService.criarAssociacao(currentUser, dto.idEmpresa, dto.idTabelaPrecoProduto, dataInicio, dataFim);
    }
    parseISODatePreservandoDia(isoString) {
        const match = isoString.match(/^(\d{4})-(\d{2})-(\d{2})/);
        if (!match) {
            throw new common_1.BadRequestException(`Formato de data inválido: ${isoString}`);
        }
        const ano = parseInt(match[1], 10);
        const mes = parseInt(match[2], 10) - 1;
        const dia = parseInt(match[3], 10);
        return new Date(Date.UTC(ano, mes, dia, 0, 0, 0, 0));
    }
    async listarAssociacoesPorEmpresa(idEmpresa) {
        return this.empresaTabelaPrecoService.listarAssociacoesPorEmpresa(idEmpresa);
    }
    async buscarAssociacaoPorId(idEmpresaTabelaPreco) {
        return this.empresaTabelaPrecoService.buscarAssociacaoPorId(idEmpresaTabelaPreco);
    }
    async atualizarAssociacao(currentUser, idEmpresaTabelaPreco, dto) {
        const dataInicio = dto.dataInicio ? this.parseISODatePreservandoDia(dto.dataInicio) : undefined;
        const dataFim = dto.dataFim !== undefined
            ? (dto.dataFim ? this.parseISODatePreservandoDia(dto.dataFim) : null)
            : undefined;
        return this.empresaTabelaPrecoService.atualizarAssociacao(currentUser, idEmpresaTabelaPreco, dto.idTabelaPrecoProduto, dataInicio, dataFim);
    }
    async desativarAssociacao(idEmpresaTabelaPreco) {
        await this.empresaTabelaPrecoService.desativarAssociacao(idEmpresaTabelaPreco);
        return { message: 'Associação desativada com sucesso' };
    }
};
exports.EmpresaTabelaPrecoController = EmpresaTabelaPrecoController;
__decorate([
    (0, dist_1.Roles)('admin', 'vendas'),
    (0, common_1.Post)(),
    __param(0, (0, dist_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, criar_empresa_tabela_preco_dto_1.CriarEmpresaTabelaPrecoDto]),
    __metadata("design:returntype", Promise)
], EmpresaTabelaPrecoController.prototype, "criarAssociacao", null);
__decorate([
    (0, dist_1.Roles)('admin', 'vendas', 'financeiro'),
    (0, common_1.Get)('empresa/:idEmpresa'),
    __param(0, (0, common_1.Param)('idEmpresa', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], EmpresaTabelaPrecoController.prototype, "listarAssociacoesPorEmpresa", null);
__decorate([
    (0, dist_1.Roles)('admin', 'vendas', 'financeiro'),
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], EmpresaTabelaPrecoController.prototype, "buscarAssociacaoPorId", null);
__decorate([
    (0, dist_1.Roles)('admin', 'vendas'),
    (0, common_1.Put)(':id'),
    __param(0, (0, dist_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, atualizar_empresa_tabela_preco_dto_1.AtualizarEmpresaTabelaPrecoDto]),
    __metadata("design:returntype", Promise)
], EmpresaTabelaPrecoController.prototype, "atualizarAssociacao", null);
__decorate([
    (0, dist_1.Roles)('admin', 'vendas'),
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], EmpresaTabelaPrecoController.prototype, "desativarAssociacao", null);
exports.EmpresaTabelaPrecoController = EmpresaTabelaPrecoController = __decorate([
    (0, swagger_1.ApiTags)('EmpresaTabelaPreco'),
    (0, common_1.Controller)('empresa-tabela-preco'),
    __metadata("design:paramtypes", [empresaTabelaPreco_service_1.EmpresaTabelaPrecoService])
], EmpresaTabelaPrecoController);
//# sourceMappingURL=empresaTabelaPreco.controller.js.map
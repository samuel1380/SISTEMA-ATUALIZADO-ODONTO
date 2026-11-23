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
exports.TrabalhoController = void 0;
const dist_1 = require("@hunter-solucoes/node-arqt-base-gerenciador-usuarios/dist");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const trabalho_service_1 = require("../business/trabalho.service");
const trabalhoCadastro_dto_1 = require("../dto/trabalhoCadastro.dto");
const trabalhoStatusEditar_dto_1 = require("../dto/trabalhoStatusEditar.dto");
let TrabalhoController = class TrabalhoController {
    constructor(trabalhoService) {
        this.trabalhoService = trabalhoService;
    }
    async emitirEventosEmpresas() {
        return this.trabalhoService.emitirEventosTrabalhoEnviado();
    }
    async cadastrarProduto(currentUser, produtoCadastroDto) {
        var _a, _b;
        const idEmpresa = currentUser.user.empresas && ((_a = currentUser.user.empresas[0]) === null || _a === void 0 ? void 0 : _a.idEmpresa);
        const nomeEmpresa = currentUser.user.empresas && ((_b = currentUser.user.empresas[0]) === null || _b === void 0 ? void 0 : _b.nome);
        if (currentUser.user.tipoUsuario === "externo" && idEmpresa) {
            return this.trabalhoService.cadastrarTrabalho(currentUser, idEmpresa, nomeEmpresa, produtoCadastroDto);
        }
        else if (currentUser.user.tipoUsuario === "interno") {
            return this.trabalhoService.cadastrarTrabalho(currentUser, produtoCadastroDto.idEmpresa, nomeEmpresa, produtoCadastroDto);
        }
        return;
    }
    async buscarTrabalhos(currentUser, statusTrabalho, incluirOcultosQuery) {
        var _a;
        const incluirOcultos = incluirOcultosQuery === 'true';
        const statusArray = Array.isArray(statusTrabalho)
            ? statusTrabalho
            : (statusTrabalho ? [statusTrabalho] : []);
        const idEmpresa = currentUser.user.empresas && ((_a = currentUser.user.empresas[0]) === null || _a === void 0 ? void 0 : _a.idEmpresa);
        if (currentUser.user.tipoUsuario === "externo" && idEmpresa) {
            return this.trabalhoService.buscarTrabalhos(statusArray, idEmpresa, incluirOcultos);
        }
        else if (currentUser.user.tipoUsuario === "interno") {
            return this.trabalhoService.buscarTrabalhos(statusArray, undefined, incluirOcultos);
        }
        return [];
    }
    async buscarTrabalhosPendentes(currentUser) {
        var _a;
        const idEmpresa = currentUser.user.empresas && ((_a = currentUser.user.empresas[0]) === null || _a === void 0 ? void 0 : _a.idEmpresa);
        if (currentUser.user.tipoUsuario === "externo" && idEmpresa) {
            return this.trabalhoService.buscarTrabalhosPendentes(idEmpresa);
        }
        else if (currentUser.user.tipoUsuario === "interno") {
            return this.trabalhoService.buscarTrabalhosPendentes();
        }
        return [];
    }
    async buscarTrabalhosConcluidos(currentUser, idEmpresaHeaders, dataInicio, dataFim, incluirOcultosQuery) {
        var _a;
        const incluirOcultos = incluirOcultosQuery === 'true';
        const idEmpresa = currentUser.user.empresas && ((_a = currentUser.user.empresas[0]) === null || _a === void 0 ? void 0 : _a.idEmpresa);
        if (currentUser.user.tipoUsuario === "externo" && idEmpresa) {
            return this.trabalhoService.buscarTrabalhosConcluidos(idEmpresa, dataInicio, dataFim, incluirOcultos);
        }
        else if (currentUser.user.tipoUsuario === "interno") {
            const idEmpresaInt = parseInt(idEmpresaHeaders);
            return this.trabalhoService.buscarTrabalhosConcluidos(idEmpresaInt, dataInicio, dataFim, incluirOcultos);
        }
        return [];
    }
    async alternarOcultarConcluido(trabalhoId, body) {
        return this.trabalhoService.alternarOcultarConcluido(trabalhoId, body === null || body === void 0 ? void 0 : body.ocultar);
    }
    async recalcularValorTrabalhosEnviados(currentUser) {
        return this.trabalhoService.recalcularValorTrabalhosEnviados(currentUser);
    }
    async buscarRelatorio(currentUser, idEmpresaHeaders, dataInicio, dataFim, statusTrabalho) {
        var _a;
        const idEmpresa = currentUser.user.empresas && ((_a = currentUser.user.empresas[0]) === null || _a === void 0 ? void 0 : _a.idEmpresa);
        if (currentUser.user.tipoUsuario === "externo" && idEmpresa) {
            return this.trabalhoService.buscarRelatorio(idEmpresa, statusTrabalho, dataInicio, dataFim);
        }
        else if (currentUser.user.tipoUsuario === "interno") {
            const idEmpresaInt = parseInt(idEmpresaHeaders);
            return this.trabalhoService.buscarRelatorio(idEmpresaInt, statusTrabalho, dataInicio, dataFim);
        }
        return [];
    }
    async buscarDashboardStatus(dataInicio, dataFim) {
        return this.trabalhoService.buscarDashboardStatus(dataInicio, dataFim);
    }
    async atualizarAnotacoesTrabalho(trabalhoId, trabalhoCadastroDto, currentUser) {
        return this.trabalhoService.atualizarAnotacoesTrabalho(currentUser, trabalhoId, trabalhoCadastroDto);
    }
    async atualizarTrabalho(trabalhoId, trabalhoCadastroDto, currentUser) {
        return this.trabalhoService.atualizarTrabalho(currentUser, trabalhoId, trabalhoCadastroDto);
    }
    async atualizarStatusTrabalho(trabalhoId, trabalhoStatusEditarDto, currentUser) {
        return this.trabalhoService.atualizarStatusTrabalho(currentUser, trabalhoId, trabalhoStatusEditarDto);
    }
    async EnviaTrabalhoProducao(trabalhoId) {
        return this.trabalhoService.enviarParaProducao(trabalhoId);
    }
    async pesquisarTrabalhos(currentUser, termo) {
        var _a;
        const idEmpresa = currentUser.user.empresas && ((_a = currentUser.user.empresas[0]) === null || _a === void 0 ? void 0 : _a.idEmpresa);
        const isExterno = currentUser.user.tipoUsuario === 'externo';
        return this.trabalhoService.pesquisarTrabalhos(termo, isExterno ? idEmpresa : undefined);
    }
    async buscarProdutoPorId(trabalhoId) {
        return this.trabalhoService.buscarTrabalhoPorId(trabalhoId);
    }
    async ordenatrabalhos(currentUser, trabalhos) {
        var _a;
        const idEmpresa = currentUser.user.empresas && ((_a = currentUser.user.empresas[0]) === null || _a === void 0 ? void 0 : _a.idEmpresa);
        if (currentUser.user.tipoUsuario === "externo" && idEmpresa) {
            return this.trabalhoService.ordenatrabalhos(idEmpresa, trabalhos);
        }
        else if (currentUser.user.tipoUsuario === "interno") {
            return this.trabalhoService.ordenatrabalhos(null, trabalhos);
        }
    }
};
exports.TrabalhoController = TrabalhoController;
__decorate([
    (0, dist_1.Roles)('admin'),
    (0, common_1.Post)('trabalho/emitirEventosTrabalhoEnviado'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TrabalhoController.prototype, "emitirEventosEmpresas", null);
__decorate([
    (0, dist_1.Roles)('admin', 'producao', 'vendas', 'financeiro'),
    (0, common_1.Post)('trabalho'),
    __param(0, (0, dist_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, trabalhoCadastro_dto_1.TrabalhoCadastroDto]),
    __metadata("design:returntype", Promise)
], TrabalhoController.prototype, "cadastrarProduto", null);
__decorate([
    (0, dist_1.Roles)('admin', 'producao', 'vendas', 'financeiro'),
    (0, common_1.Get)('trabalho'),
    __param(0, (0, dist_1.CurrentUser)()),
    __param(1, (0, common_1.Query)("statusTrabalho")),
    __param(2, (0, common_1.Query)("incluirOcultos")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Array, String]),
    __metadata("design:returntype", Promise)
], TrabalhoController.prototype, "buscarTrabalhos", null);
__decorate([
    (0, dist_1.Roles)('admin', 'producao', 'vendas', 'financeiro'),
    (0, common_1.Get)('trabalhopendentes'),
    __param(0, (0, dist_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TrabalhoController.prototype, "buscarTrabalhosPendentes", null);
__decorate([
    (0, dist_1.Roles)('admin', 'producao', 'vendas', 'financeiro'),
    (0, common_1.Get)('trabalhoconcluidos'),
    __param(0, (0, dist_1.CurrentUser)()),
    __param(1, (0, common_1.Headers)('idEmpresa')),
    __param(2, (0, common_1.Query)("dataInicio")),
    __param(3, (0, common_1.Query)("dataFim")),
    __param(4, (0, common_1.Query)("incluirOcultos")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String]),
    __metadata("design:returntype", Promise)
], TrabalhoController.prototype, "buscarTrabalhosConcluidos", null);
__decorate([
    (0, dist_1.Roles)('admin', 'producao', 'vendas', 'financeiro'),
    (0, common_1.Put)('trabalho/:trabalhoId/ocultar-concluido'),
    __param(0, (0, common_1.Param)('trabalhoId', new common_1.ParseIntPipe())),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], TrabalhoController.prototype, "alternarOcultarConcluido", null);
__decorate([
    (0, dist_1.Roles)('admin'),
    (0, common_1.Get)('recalcular'),
    __param(0, (0, dist_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TrabalhoController.prototype, "recalcularValorTrabalhosEnviados", null);
__decorate([
    (0, dist_1.Roles)('admin'),
    (0, common_1.Get)('relatorio'),
    __param(0, (0, dist_1.CurrentUser)()),
    __param(1, (0, common_1.Headers)('idEmpresa')),
    __param(2, (0, common_1.Query)("dataInicio")),
    __param(3, (0, common_1.Query)("dataFim")),
    __param(4, (0, common_1.Query)("statusTrabalho")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, Array]),
    __metadata("design:returntype", Promise)
], TrabalhoController.prototype, "buscarRelatorio", null);
__decorate([
    (0, dist_1.Roles)('admin'),
    (0, common_1.Get)('relatorio/dashboard-status'),
    __param(0, (0, common_1.Query)("dataInicio")),
    __param(1, (0, common_1.Query)("dataFim")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], TrabalhoController.prototype, "buscarDashboardStatus", null);
__decorate([
    (0, dist_1.Roles)('admin', 'producao', 'vendas'),
    (0, common_1.Put)('trabalho/:trabalhoId/anotacoes'),
    __param(0, (0, common_1.Param)('trabalhoId', new common_1.ParseIntPipe())),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, dist_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, Object]),
    __metadata("design:returntype", Promise)
], TrabalhoController.prototype, "atualizarAnotacoesTrabalho", null);
__decorate([
    (0, dist_1.Roles)('admin', 'producao', 'vendas', 'financeiro'),
    (0, common_1.Put)('trabalho/:trabalhoId'),
    __param(0, (0, common_1.Param)('trabalhoId', new common_1.ParseIntPipe())),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, dist_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, Object]),
    __metadata("design:returntype", Promise)
], TrabalhoController.prototype, "atualizarTrabalho", null);
__decorate([
    (0, dist_1.Roles)('admin', 'producao', 'financeiro'),
    (0, common_1.Put)('trabalho/:trabalhoId/status'),
    __param(0, (0, common_1.Param)('trabalhoId', new common_1.ParseIntPipe())),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, dist_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, trabalhoStatusEditar_dto_1.TrabalhoStatusEditarDto, Object]),
    __metadata("design:returntype", Promise)
], TrabalhoController.prototype, "atualizarStatusTrabalho", null);
__decorate([
    (0, dist_1.Roles)('producao', 'vendas', 'financeiro'),
    (0, common_1.Put)('trabalho/:trabalhoId/enviaproducao'),
    __param(0, (0, common_1.Param)('trabalhoId', new common_1.ParseIntPipe())),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], TrabalhoController.prototype, "EnviaTrabalhoProducao", null);
__decorate([
    (0, dist_1.Roles)('admin', 'producao', 'vendas', 'financeiro'),
    (0, common_1.Get)('trabalho-pesquisa'),
    __param(0, (0, dist_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('termo')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], TrabalhoController.prototype, "pesquisarTrabalhos", null);
__decorate([
    (0, dist_1.Roles)('admin', 'producao', 'vendas', 'financeiro'),
    (0, common_1.Get)('trabalho/:trabalhoId'),
    __param(0, (0, common_1.Param)('trabalhoId', new common_1.ParseIntPipe())),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], TrabalhoController.prototype, "buscarProdutoPorId", null);
__decorate([
    (0, dist_1.Roles)('admin', 'producao', 'vendas', 'financeiro'),
    (0, common_1.Put)('ordenatrabalhos'),
    __param(0, (0, dist_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], TrabalhoController.prototype, "ordenatrabalhos", null);
exports.TrabalhoController = TrabalhoController = __decorate([
    (0, swagger_1.ApiTags)('Trabalho'),
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [trabalho_service_1.TrabalhoService])
], TrabalhoController);
//# sourceMappingURL=trabalho.controller.js.map
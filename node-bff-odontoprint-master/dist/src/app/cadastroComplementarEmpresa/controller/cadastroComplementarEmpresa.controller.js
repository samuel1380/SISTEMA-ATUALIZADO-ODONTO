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
exports.CadastroComplementarEmpresaController = void 0;
const dist_1 = require("@hunter-solucoes/node-arqt-base-gerenciador-usuarios/dist");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const cadastroComplementarEmpresa_service_1 = require("../business/cadastroComplementarEmpresa.service");
const produtoEmpresa_dto_1 = require("../dto/produtoEmpresa.dto");
let CadastroComplementarEmpresaController = class CadastroComplementarEmpresaController {
    constructor(cadastroComplementarEmpresaService) {
        this.cadastroComplementarEmpresaService = cadastroComplementarEmpresaService;
    }
    async cadastroComplementarEmpresa(currentUser, produtoCadastroDto, idEmpresaHeaders) {
        const idEmpresa = parseInt(idEmpresaHeaders);
        return this.cadastroComplementarEmpresaService.cadastroComplementarEmpresa(currentUser, idEmpresa, produtoCadastroDto);
    }
    async atualizarPagamento(currentUser, body, idEmpresaHeaders) {
        const idEmpresa = parseInt(idEmpresaHeaders);
        return this.cadastroComplementarEmpresaService.atualizarPagamento(idEmpresa, body.diaPagamento, body.tipoPagamento, body.quantidadeParcelas);
    }
    async buscarCadastroComplementarEmpresa(currentUser, idEmpresaHeaders) {
        var _a;
        let idEmpresa = currentUser.user.empresas && ((_a = currentUser.user.empresas[0]) === null || _a === void 0 ? void 0 : _a.idEmpresa);
        let cadastroComplementar;
        if (currentUser.user.tipoUsuario === "externo" && idEmpresa) {
            cadastroComplementar = this.cadastroComplementarEmpresaService.buscarCadastroComplementarEmpresa(idEmpresa);
        }
        else if (currentUser.user.tipoUsuario === "interno") {
            idEmpresa = parseInt(idEmpresaHeaders);
            cadastroComplementar = this.cadastroComplementarEmpresaService.buscarCadastroComplementarEmpresa(idEmpresa);
        }
        if (!cadastroComplementar) {
            throw new common_1.HttpException("Não encontrado", common_1.HttpStatus.NOT_FOUND);
        }
        return cadastroComplementar;
    }
    async buscarInfosCadastroComplementar(currentUser) {
        return this.cadastroComplementarEmpresaService.buscarInfosCadastroComplementar();
    }
};
exports.CadastroComplementarEmpresaController = CadastroComplementarEmpresaController;
__decorate([
    (0, dist_1.Roles)('admin'),
    (0, common_1.Post)(),
    __param(0, (0, dist_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Headers)('idEmpresa')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, produtoEmpresa_dto_1.CadastroComplementarEmpresaDto, String]),
    __metadata("design:returntype", Promise)
], CadastroComplementarEmpresaController.prototype, "cadastroComplementarEmpresa", null);
__decorate([
    (0, dist_1.Roles)('admin'),
    (0, common_1.Patch)('pagamento'),
    __param(0, (0, dist_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Headers)('idEmpresa')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String]),
    __metadata("design:returntype", Promise)
], CadastroComplementarEmpresaController.prototype, "atualizarPagamento", null);
__decorate([
    (0, dist_1.Roles)('admin', 'comum'),
    (0, common_1.Get)(),
    __param(0, (0, dist_1.CurrentUser)()),
    __param(1, (0, common_1.Headers)('idEmpresa')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], CadastroComplementarEmpresaController.prototype, "buscarCadastroComplementarEmpresa", null);
__decorate([
    (0, dist_1.Roles)('admin'),
    (0, common_1.Get)("infos"),
    __param(0, (0, dist_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CadastroComplementarEmpresaController.prototype, "buscarInfosCadastroComplementar", null);
exports.CadastroComplementarEmpresaController = CadastroComplementarEmpresaController = __decorate([
    (0, swagger_1.ApiTags)('Cadastro Complementar Empresa'),
    (0, common_1.Controller)('cadastrocomplementar'),
    __metadata("design:paramtypes", [cadastroComplementarEmpresa_service_1.CadastroComplementarEmpresaService])
], CadastroComplementarEmpresaController);
//# sourceMappingURL=cadastroComplementarEmpresa.controller.js.map
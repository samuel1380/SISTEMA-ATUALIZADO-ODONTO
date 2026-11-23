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
exports.OfxController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const node_arqt_base_gerenciador_usuarios_1 = require("@hunter-solucoes/node-arqt-base-gerenciador-usuarios");
const ofx_service_1 = require("../business/ofx.service");
const optional_parse_int_1 = require("../dto/optional-parse-int");
let OfxController = class OfxController {
    constructor(ofxService) {
        this.ofxService = ofxService;
    }
    async importarArquivo(file, idConta, currentUser) {
        var _a, _b;
        const idUsuario = ((_a = currentUser.user) === null || _a === void 0 ? void 0 : _a.idUsuario) || ((_b = currentUser.user) === null || _b === void 0 ? void 0 : _b.id) || 0;
        return this.ofxService.importarArquivoOfx(file, idConta, idUsuario);
    }
    async importarContasPagar(file, idCategoriaStr, idContaStr) {
        const idCategoria = parseInt(String(idCategoriaStr), 10);
        if (Number.isNaN(idCategoria)) {
            throw new common_1.BadRequestException('idCategoria inválido.');
        }
        const idConta = idContaStr !== undefined && idContaStr !== null && String(idContaStr).trim() !== ''
            ? parseInt(String(idContaStr), 10)
            : undefined;
        if (idConta !== undefined && Number.isNaN(idConta)) {
            throw new common_1.BadRequestException('idConta inválido.');
        }
        return this.ofxService.importarOfxContasPagar(file, idCategoria, idConta);
    }
    async listarArquivos(idConta) {
        return this.ofxService.listarArquivos(idConta);
    }
    async buscarArquivo(id) {
        return this.ofxService.buscarArquivoPorId(id);
    }
    async excluirArquivo(id) {
        await this.ofxService.excluirArquivo(id);
        return { message: 'Arquivo excluído com sucesso.' };
    }
};
exports.OfxController = OfxController;
__decorate([
    (0, node_arqt_base_gerenciador_usuarios_1.Roles)('admin', 'financeiro'),
    (0, common_1.Post)('importar'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('arquivo')),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Body)('idConta', common_1.ParseIntPipe)),
    __param(2, (0, node_arqt_base_gerenciador_usuarios_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Object]),
    __metadata("design:returntype", Promise)
], OfxController.prototype, "importarArquivo", null);
__decorate([
    (0, node_arqt_base_gerenciador_usuarios_1.Roles)('admin', 'financeiro'),
    (0, common_1.Post)('importar-contas-pagar'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('arquivo')),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Body)('idCategoria')),
    __param(2, (0, common_1.Body)('idConta')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], OfxController.prototype, "importarContasPagar", null);
__decorate([
    (0, node_arqt_base_gerenciador_usuarios_1.Roles)('admin', 'financeiro'),
    (0, common_1.Get)('arquivos'),
    __param(0, (0, common_1.Query)('idConta', optional_parse_int_1.OptionalParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], OfxController.prototype, "listarArquivos", null);
__decorate([
    (0, node_arqt_base_gerenciador_usuarios_1.Roles)('admin', 'financeiro'),
    (0, common_1.Get)('arquivos/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], OfxController.prototype, "buscarArquivo", null);
__decorate([
    (0, node_arqt_base_gerenciador_usuarios_1.Roles)('admin'),
    (0, common_1.Delete)('arquivos/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], OfxController.prototype, "excluirArquivo", null);
exports.OfxController = OfxController = __decorate([
    (0, common_1.Controller)('financeiro/ofx'),
    __metadata("design:paramtypes", [ofx_service_1.OfxService])
], OfxController);
//# sourceMappingURL=ofx.controller.js.map
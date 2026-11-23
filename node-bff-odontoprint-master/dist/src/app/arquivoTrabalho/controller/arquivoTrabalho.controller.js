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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArquivoTrabalhoController = void 0;
const dist_1 = require("@hunter-solucoes/node-arqt-base-gerenciador-usuarios/dist");
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const arquivoTrabalho_service_1 = require("../business/arquivoTrabalho.service");
let ArquivoTrabalhoController = class ArquivoTrabalhoController {
    constructor(arquivoTrabalhoService) {
        this.arquivoTrabalhoService = arquivoTrabalhoService;
    }
    async enviarArquivos(currentUser, files, idTrabalho) {
        var _a, e_1, _b, _c;
        var _d;
        const idEmpresa = currentUser.user.empresas && ((_d = currentUser.user.empresas[0]) === null || _d === void 0 ? void 0 : _d.idEmpresa);
        const response = [];
        try {
            for (var _e = true, files_1 = __asyncValues(files), files_1_1; files_1_1 = await files_1.next(), _a = files_1_1.done, !_a; _e = true) {
                _c = files_1_1.value;
                _e = false;
                const file = _c;
                const ret = await this.arquivoTrabalhoService.cadastrarArquivosTrabalho(currentUser, idEmpresa, idTrabalho, file);
                response.push(ret);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (!_e && !_a && (_b = files_1.return)) await _b.call(files_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return response;
    }
    async deletaArquivos(currentUser, files, idTrabalho, idArquivo) {
        var _a;
        const idEmpresa = currentUser.user.empresas && ((_a = currentUser.user.empresas[0]) === null || _a === void 0 ? void 0 : _a.idEmpresa);
        const tipoUsuario = currentUser.user.tipoUsuario;
        return await this.arquivoTrabalhoService.deletarArquivo(currentUser, idEmpresa, idTrabalho, idArquivo, tipoUsuario);
    }
    async buscaArquivos(currentUser, idEmpresa, arquivoNome, res) {
        var _a;
        const idEmpresaCurrentUser = currentUser.user.empresas && ((_a = currentUser.user.empresas[0]) === null || _a === void 0 ? void 0 : _a.idEmpresa);
        if (currentUser.user.tipoUsuario === "externo" && idEmpresa !== idEmpresaCurrentUser) {
            throw new common_1.HttpException("Não Autorizado", common_1.HttpStatus.UNAUTHORIZED);
        }
        const stream = await this.arquivoTrabalhoService.buscarArquivo(currentUser, idEmpresa, arquivoNome);
        res.setHeader('Content-Type', 'application/octet-stream');
        stream.pipe(res);
    }
};
exports.ArquivoTrabalhoController = ArquivoTrabalhoController;
__decorate([
    (0, dist_1.Roles)('admin', 'comum'),
    (0, common_1.Post)("trabalho/:idTrabalho"),
    (0, common_1.UseInterceptors)((0, platform_express_1.AnyFilesInterceptor)()),
    __param(0, (0, dist_1.CurrentUser)()),
    __param(1, (0, common_1.UploadedFiles)()),
    __param(2, (0, common_1.Param)("idTrabalho", new common_1.ParseIntPipe())),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Array, Number]),
    __metadata("design:returntype", Promise)
], ArquivoTrabalhoController.prototype, "enviarArquivos", null);
__decorate([
    (0, dist_1.Roles)('admin', 'comum'),
    (0, common_1.Delete)("trabalho/:idTrabalho/arquivo/:idArquivo"),
    (0, common_1.UseInterceptors)((0, platform_express_1.AnyFilesInterceptor)()),
    __param(0, (0, dist_1.CurrentUser)()),
    __param(1, (0, common_1.UploadedFiles)()),
    __param(2, (0, common_1.Param)("idTrabalho", new common_1.ParseIntPipe())),
    __param(3, (0, common_1.Param)("idArquivo", new common_1.ParseIntPipe())),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Array, Number, Number]),
    __metadata("design:returntype", Promise)
], ArquivoTrabalhoController.prototype, "deletaArquivos", null);
__decorate([
    (0, dist_1.Roles)('admin', 'comum'),
    (0, common_1.Get)("trabalho/:idEmpresa/:arquivoNome"),
    (0, common_1.UseInterceptors)((0, platform_express_1.AnyFilesInterceptor)()),
    __param(0, (0, dist_1.CurrentUser)()),
    __param(1, (0, common_1.Param)("idEmpresa", new common_1.ParseIntPipe())),
    __param(2, (0, common_1.Param)("arquivoNome")),
    __param(3, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, String, Object]),
    __metadata("design:returntype", Promise)
], ArquivoTrabalhoController.prototype, "buscaArquivos", null);
exports.ArquivoTrabalhoController = ArquivoTrabalhoController = __decorate([
    (0, swagger_1.ApiTags)('Arquivo Trabalho'),
    (0, common_1.Controller)('arquivo'),
    __metadata("design:paramtypes", [arquivoTrabalho_service_1.ArquivoTrabalhoService])
], ArquivoTrabalhoController);
//# sourceMappingURL=arquivoTrabalho.controller.js.map
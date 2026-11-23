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
exports.UsuarioController = void 0;
const common_1 = require("@nestjs/common");
const node_arqt_base_gerenciador_usuarios_1 = require("@hunter-solucoes/node-arqt-base-gerenciador-usuarios");
const swagger_1 = require("@nestjs/swagger");
const usuario_service_1 = require("../business/usuario.service");
const create_usuario_dto_1 = require("../dto/create-usuario.dto");
const update_usuario_dto_1 = require("../dto/update-usuario.dto");
const adicionar_permissao_dto_1 = require("../dto/adicionar-permissao.dto");
const optional_parse_int_1 = require("../../financeiro/dto/optional-parse-int");
const change_password_dto_1 = require("../dto/change-password.dto");
const resetar_senha_dto_1 = require("../dto/resetar-senha.dto");
let UsuarioController = class UsuarioController {
    constructor(usuarioService) {
        this.usuarioService = usuarioService;
    }
    async listarUsuarios(idEmpresa) {
        return this.usuarioService.listarUsuarios(idEmpresa);
    }
    async listarUsuariosPorEmpresa(idEmpresa) {
        return this.usuarioService.listarUsuariosPorEmpresa(idEmpresa);
    }
    async buscarUsuarioPorId(id) {
        return this.usuarioService.buscarUsuarioPorId(id);
    }
    async criarUsuario(currentUser, dto) {
        return this.usuarioService.criarUsuario(dto, currentUser);
    }
    async editarUsuario(id, dto) {
        return this.usuarioService.editarUsuario(id, dto);
    }
    async ativarUsuario(id) {
        return this.usuarioService.ativarUsuario(id);
    }
    async inativarUsuario(id) {
        return this.usuarioService.inativarUsuario(id);
    }
    async adicionarPermissao(id, dto) {
        return this.usuarioService.adicionarPermissao(id, dto.permissao);
    }
    async removerPermissao(id, permissao) {
        return this.usuarioService.removerPermissao(id, permissao);
    }
    async resetarSenha(id, dto) {
        const novaSenha = (dto === null || dto === void 0 ? void 0 : dto.novaSenha) || (dto === null || dto === void 0 ? void 0 : dto.senha);
        return this.usuarioService.resetarSenha(id, novaSenha);
    }
    async alterarSenha(currentUser, dto) {
        return this.usuarioService.alterarSenha(currentUser.user.idUsuario, dto);
    }
};
exports.UsuarioController = UsuarioController;
__decorate([
    (0, node_arqt_base_gerenciador_usuarios_1.Roles)('admin'),
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('idEmpresa', new optional_parse_int_1.OptionalParseIntPipe())),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], UsuarioController.prototype, "listarUsuarios", null);
__decorate([
    (0, node_arqt_base_gerenciador_usuarios_1.Roles)('admin'),
    (0, common_1.Get)('empresa/:idEmpresa'),
    __param(0, (0, common_1.Param)('idEmpresa', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], UsuarioController.prototype, "listarUsuariosPorEmpresa", null);
__decorate([
    (0, node_arqt_base_gerenciador_usuarios_1.Roles)('admin'),
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], UsuarioController.prototype, "buscarUsuarioPorId", null);
__decorate([
    (0, node_arqt_base_gerenciador_usuarios_1.Roles)('admin'),
    (0, common_1.Post)(),
    __param(0, (0, node_arqt_base_gerenciador_usuarios_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_usuario_dto_1.CreateUsuarioDto]),
    __metadata("design:returntype", Promise)
], UsuarioController.prototype, "criarUsuario", null);
__decorate([
    (0, node_arqt_base_gerenciador_usuarios_1.Roles)('admin'),
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_usuario_dto_1.UpdateUsuarioDto]),
    __metadata("design:returntype", Promise)
], UsuarioController.prototype, "editarUsuario", null);
__decorate([
    (0, node_arqt_base_gerenciador_usuarios_1.Roles)('admin'),
    (0, common_1.Patch)(':id/ativar'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], UsuarioController.prototype, "ativarUsuario", null);
__decorate([
    (0, node_arqt_base_gerenciador_usuarios_1.Roles)('admin'),
    (0, common_1.Patch)(':id/inativar'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], UsuarioController.prototype, "inativarUsuario", null);
__decorate([
    (0, node_arqt_base_gerenciador_usuarios_1.Roles)('admin'),
    (0, common_1.Post)(':id/permissoes'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, adicionar_permissao_dto_1.AdicionarPermissaoDto]),
    __metadata("design:returntype", Promise)
], UsuarioController.prototype, "adicionarPermissao", null);
__decorate([
    (0, node_arqt_base_gerenciador_usuarios_1.Roles)('admin'),
    (0, common_1.Delete)(':id/permissoes/:permissao'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('permissao')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String]),
    __metadata("design:returntype", Promise)
], UsuarioController.prototype, "removerPermissao", null);
__decorate([
    (0, node_arqt_base_gerenciador_usuarios_1.Roles)('admin'),
    (0, common_1.Post)(':id/reset-password'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, resetar_senha_dto_1.ResetarSenhaDto]),
    __metadata("design:returntype", Promise)
], UsuarioController.prototype, "resetarSenha", null);
__decorate([
    (0, common_1.Post)('change-password'),
    __param(0, (0, node_arqt_base_gerenciador_usuarios_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, change_password_dto_1.ChangePasswordDto]),
    __metadata("design:returntype", Promise)
], UsuarioController.prototype, "alterarSenha", null);
exports.UsuarioController = UsuarioController = __decorate([
    (0, swagger_1.ApiTags)('Usuário'),
    (0, common_1.Controller)('usuario'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })),
    __metadata("design:paramtypes", [usuario_service_1.UsuarioService])
], UsuarioController);
//# sourceMappingURL=usuario.controller.js.map
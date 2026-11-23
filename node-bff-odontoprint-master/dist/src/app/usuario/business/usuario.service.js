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
var UsuarioService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsuarioService = void 0;
const common_1 = require("@nestjs/common");
const dist_1 = require("@hunter-solucoes/node-arqt-base-gerenciador-usuarios/dist");
const usuarioCadastro_dto_1 = require("@hunter-solucoes/node-arqt-base-gerenciador-usuarios/dist/src/app/usuario/dto/usuarioCadastro.dto");
const usuario_entity_1 = require("@hunter-solucoes/node-arqt-base-gerenciador-usuarios/dist/src/app/usuario/domain/usuario.entity");
const typeorm_1 = require("typeorm");
const typeorm_2 = require("@nestjs/typeorm");
const crypto = require("crypto");
let UsuarioService = UsuarioService_1 = class UsuarioService {
    constructor(baseUsuarioService, usuarioRepository) {
        this.baseUsuarioService = baseUsuarioService;
        this.usuarioRepository = usuarioRepository;
        this.logger = new common_1.Logger(UsuarioService_1.name);
    }
    async listarUsuarios(idEmpresa) {
        if (idEmpresa) {
            return this.baseUsuarioService.buscarUsuariosPorEmpresaId(idEmpresa);
        }
        return this.usuarioRepository.find({
            relations: ['empresas', 'permissoes'],
        });
    }
    async buscarUsuarioPorId(idUsuario) {
        const usuario = await this.baseUsuarioService.buscarUsuarioPorId(idUsuario);
        if (!usuario) {
            throw new common_1.NotFoundException(`Usuário com ID ${idUsuario} não encontrado.`);
        }
        return usuario;
    }
    async criarUsuario(dto, currentUser) {
        const usuarioCadastroDto = new usuarioCadastro_dto_1.UsuarioCadastroDto();
        usuarioCadastroDto.nome = dto.nome;
        usuarioCadastroDto.email = dto.email;
        usuarioCadastroDto.tipoUsuario = dto.tipoUsuario;
        usuarioCadastroDto.permissoes = dto.permissoes || [];
        usuarioCadastroDto.ativo = dto.ativo !== undefined ? dto.ativo : true;
        usuarioCadastroDto.bloqueado = dto.bloqueado !== undefined ? dto.bloqueado : false;
        usuarioCadastroDto.idUsuarioCadastro = currentUser.user.idUsuario;
        try {
            const resultado = await this.baseUsuarioService.cadastrarUsuario(usuarioCadastroDto);
            if (dto.senha && dto.senha.trim().length > 0) {
                const senhaCriptografada = this.criptografarNovaSenha(dto.senha.trim());
                await this.usuarioRepository.update(resultado.idUsuario, { senha: senhaCriptografada });
            }
            if (dto.idEmpresa) {
                await this.baseUsuarioService.adicionarUsuarioNaEmpresa(resultado.idUsuario, dto.idEmpresa);
            }
            return await this.buscarUsuarioPorId(resultado.idUsuario);
        }
        catch (error) {
            this.logger.error(`Erro ao criar usuário: ${error.message}`, error.stack);
            throw new common_1.BadRequestException(`Erro ao criar usuário: ${error.message}`);
        }
    }
    async editarUsuario(idUsuario, dto) {
        const usuarioExistente = await this.buscarUsuarioPorId(idUsuario);
        const usuarioCadastroDto = new usuarioCadastro_dto_1.UsuarioCadastroDto();
        usuarioCadastroDto.nome = dto.nome || usuarioExistente.nome;
        usuarioCadastroDto.email = dto.email || usuarioExistente.email;
        usuarioCadastroDto.tipoUsuario = dto.tipoUsuario || usuarioExistente.tipoUsuario;
        usuarioCadastroDto.idUsuarioCadastro = usuarioExistente.idUsuarioCadastro;
        try {
            await this.baseUsuarioService.editarUsuario(idUsuario, usuarioCadastroDto);
            return await this.buscarUsuarioPorId(idUsuario);
        }
        catch (error) {
            this.logger.error(`Erro ao editar usuário: ${error.message}`, error.stack);
            throw new common_1.BadRequestException(`Erro ao editar usuário: ${error.message}`);
        }
    }
    async ativarUsuario(idUsuario) {
        const usuario = await this.buscarUsuarioPorId(idUsuario);
        await this.usuarioRepository.update(idUsuario, { ativo: true });
        this.logger.log(`Usuário ${idUsuario} ativado`);
        return await this.buscarUsuarioPorId(idUsuario);
    }
    async inativarUsuario(idUsuario) {
        const usuario = await this.buscarUsuarioPorId(idUsuario);
        await this.usuarioRepository.update(idUsuario, { ativo: false });
        this.logger.log(`Usuário ${idUsuario} inativado`);
        return await this.buscarUsuarioPorId(idUsuario);
    }
    async adicionarPermissao(idUsuario, permissao) {
        await this.buscarUsuarioPorId(idUsuario);
        try {
            await this.baseUsuarioService.adicionarPermissao(idUsuario, permissao);
            this.logger.log(`Permissão ${permissao} adicionada ao usuário ${idUsuario}`);
            return await this.buscarUsuarioPorId(idUsuario);
        }
        catch (error) {
            this.logger.error(`Erro ao adicionar permissão: ${error.message}`, error.stack);
            throw new common_1.BadRequestException(`Erro ao adicionar permissão: ${error.message}`);
        }
    }
    async removerPermissao(idUsuario, permissao) {
        await this.buscarUsuarioPorId(idUsuario);
        try {
            await this.baseUsuarioService.removerPermissao(idUsuario, permissao);
            this.logger.log(`Permissão ${permissao} removida do usuário ${idUsuario}`);
            return await this.buscarUsuarioPorId(idUsuario);
        }
        catch (error) {
            this.logger.error(`Erro ao remover permissão: ${error.message}`, error.stack);
            throw new common_1.BadRequestException(`Erro ao remover permissão: ${error.message}`);
        }
    }
    async listarUsuariosPorEmpresa(idEmpresa) {
        return this.baseUsuarioService.buscarUsuariosPorEmpresaId(idEmpresa);
    }
    criptografarNovaSenha(senha) {
        const secret = process.env.CHAVE_SECRETA || 'hunter_segredo';
        return crypto.createHmac('sha256', secret).update(senha).digest('hex');
    }
    gerarSenhaAleatoria() {
        const length = 12;
        const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~`|}{[]:;?><,./-=";
        let retVal = "";
        retVal += "aA1!";
        for (let i = 0, n = charset.length; i < length - 4; ++i) {
            retVal += charset.charAt(Math.floor(Math.random() * n));
        }
        return retVal.split('').sort(() => 0.5 - Math.random()).join('');
    }
    async resetarSenha(idUsuario, novaSenhaCustom) {
        const usuario = await this.buscarUsuarioPorId(idUsuario);
        const novaSenha = (novaSenhaCustom && novaSenhaCustom.trim().length > 0)
            ? novaSenhaCustom.trim()
            : this.gerarSenhaAleatoria();
        const senhaCriptografada = this.criptografarNovaSenha(novaSenha);
        await this.usuarioRepository.update(idUsuario, { senha: senhaCriptografada });
        this.logger.log(`Senha do usuário ${idUsuario} resetada/atualizada`);
        return { senhaGerada: novaSenha };
    }
    async alterarSenha(idUsuario, dto) {
        const usuario = await this.buscarUsuarioPorId(idUsuario);
        const senhaAtualCriptografada = this.criptografarNovaSenha(dto.senhaAtual);
        if (usuario.senha !== senhaAtualCriptografada) {
            throw new common_1.BadRequestException('A senha atual está incorreta');
        }
        const novaSenhaCriptografada = this.criptografarNovaSenha(dto.novaSenha);
        await this.usuarioRepository.update(idUsuario, { senha: novaSenhaCriptografada });
        this.logger.log(`Senha do usuário ${idUsuario} alterada com sucesso`);
    }
};
exports.UsuarioService = UsuarioService;
exports.UsuarioService = UsuarioService = UsuarioService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_2.InjectRepository)(usuario_entity_1.Usuario)),
    __metadata("design:paramtypes", [dist_1.UsuarioService,
        typeorm_1.Repository])
], UsuarioService);
//# sourceMappingURL=usuario.service.js.map
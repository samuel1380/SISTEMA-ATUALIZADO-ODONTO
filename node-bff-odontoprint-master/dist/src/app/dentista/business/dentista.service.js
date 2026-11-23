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
exports.DentistaService = void 0;
const dist_1 = require("@hunter-solucoes/node-arqt-base-gerenciador-usuarios/dist");
const usuarioCadastro_dto_1 = require("@hunter-solucoes/node-arqt-base-gerenciador-usuarios/dist/src/app/usuario/dto/usuarioCadastro.dto");
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const dentista_entity_1 = require("../domain/dentista.entity");
let DentistaService = class DentistaService {
    constructor(dentistaRepository, usuarioService) {
        this.dentistaRepository = dentistaRepository;
        this.usuarioService = usuarioService;
    }
    async cadastrarDentista(currentUser, idEmpresa, dentistaDto) {
        const dentistasExistentes = await this.buscaDentistaPorEmail(dentistaDto.email);
        if ((dentistasExistentes === null || dentistasExistentes === void 0 ? void 0 : dentistasExistentes.length) > 0) {
            return dentistasExistentes[0];
        }
        let usuarioCadastrado = await this.usuarioService.buscarUsuarioPorEmail(dentistaDto.email);
        let retornoUsuarioCadastrado;
        if (!usuarioCadastrado) {
            const usuarioCadastroDto = new usuarioCadastro_dto_1.UsuarioCadastroDto();
            usuarioCadastroDto.idUsuarioCadastro = currentUser.user.idUsuario;
            usuarioCadastroDto.ativo = true;
            usuarioCadastroDto.email = dentistaDto.email;
            usuarioCadastroDto.nome = dentistaDto.nome;
            usuarioCadastroDto.permissoes = ['comum'];
            usuarioCadastroDto.tipoUsuario = 'externo';
            usuarioCadastroDto.bloqueado = false;
            retornoUsuarioCadastrado = await this.usuarioService.cadastrarUsuario(usuarioCadastroDto);
            await this.usuarioService.adicionarUsuarioNaEmpresa(retornoUsuarioCadastrado.idUsuario, idEmpresa);
        }
        const dentistaDomain = new dentista_entity_1.Dentista();
        dentistaDomain.idDentista = dentistaDto.idDentista;
        dentistaDomain.nome = dentistaDto.nome;
        dentistaDomain.email = dentistaDto.email;
        dentistaDomain.idEmpresa = dentistaDto.idEmpresa;
        dentistaDomain.ativo = true;
        dentistaDomain.idUsuarioCadastro = currentUser.user.idUsuario;
        dentistaDomain.idUsuarioSistema = (usuarioCadastrado === null || usuarioCadastrado === void 0 ? void 0 : usuarioCadastrado.idUsuario) || (retornoUsuarioCadastrado === null || retornoUsuarioCadastrado === void 0 ? void 0 : retornoUsuarioCadastrado.idUsuario);
        return this.dentistaRepository.save(dentistaDomain);
    }
    async atualizaDentista(currentUser, idEmpresa, dentista) {
        const dentistaExistente = await this.buscaDentistaPorEmail(dentista.email);
        dentista.idUsuarioCadastro = currentUser.user.idUsuario;
        dentista.ativo = true;
        if (!dentistaExistente.length) {
            throw new common_1.HttpException(`Dentista não cadastrado`, common_1.HttpStatus.BAD_REQUEST);
        }
        await this.usuarioService.adicionarUsuarioNaEmpresa(dentistaExistente[0].idUsuarioSistema, idEmpresa);
        return this.dentistaRepository.save(dentista);
    }
    async buscaDentistas() {
        return this.dentistaRepository.find({ where: { ativo: true } });
    }
    async desativarDentista(idEmpresa, idDentista) {
        const dentista = await this.dentistaRepository.findOne({ where: { idDentista } });
        if (!dentista) {
            throw new common_1.NotFoundException(`Dentista com ID ${idDentista} não encontrado.`);
        }
        await this.dentistaRepository.update(idDentista, { ativo: false });
        await this.usuarioService.removerUsuarioNaEmpresa(dentista.idUsuarioSistema, idEmpresa);
    }
    async buscaDentistaPorEmail(email) {
        return this.dentistaRepository.find({ where: { email } });
    }
    async buscaDentistaPorId(idDentista) {
        return this.dentistaRepository.find({ where: { idDentista } });
    }
    async buscaDentistaPorEmpresaId(idEmpresa) {
        return this.dentistaRepository.find({ where: { idEmpresa } });
    }
};
exports.DentistaService = DentistaService;
exports.DentistaService = DentistaService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(dentista_entity_1.Dentista)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        dist_1.UsuarioService])
], DentistaService);
//# sourceMappingURL=dentista.service.js.map
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
exports.GerenciadorEmpresaService = void 0;
const common_1 = require("@nestjs/common");
const node_arqt_base_gerenciador_usuarios_1 = require("@hunter-solucoes/node-arqt-base-gerenciador-usuarios");
const usuarioCadastro_dto_1 = require("@hunter-solucoes/node-arqt-base-gerenciador-usuarios/dist/src/app/usuario/dto/usuarioCadastro.dto");
const event_emitter_1 = require("@nestjs/event-emitter");
let GerenciadorEmpresaService = class GerenciadorEmpresaService {
    constructor(empresaService, eventEmitter) {
        this.empresaService = empresaService;
        this.eventEmitter = eventEmitter;
    }
    async cadastraEmpresa(body) {
        const empresa = await this.empresaService.cadastrarEmpresa({}, body);
        this.eventEmitter.emit('empresa.created', { idEmpresa: empresa.idEmpresa, nome: empresa.nome });
        await this.aprovaEmpresa(empresa.idEmpresa);
        return empresa;
    }
    async editarEmpresa(idEmpresa, body) {
        return await this.empresaService.editarEmpresa({}, idEmpresa, body);
    }
    async emitirEventosEmpresas() {
        const empresas = await this.empresaService.buscarEmpresas();
        for (const empresa of empresas) {
            this.eventEmitter.emit('empresa.created', { idEmpresa: empresa.idEmpresa, nome: empresa.nome });
        }
    }
    async buscarEmpresas() {
        return await this.empresaService.buscarEmpresas();
    }
    async buscarEmpresasAguardandoAprovacao() {
        return await this.empresaService.buscarEmpresasAguardandoAprovacao();
    }
    async buscarEmpresa(idEmpresa) {
        return await this.empresaService.buscarEmpresasPorId(idEmpresa);
    }
    async desabilitarEmpresa(idEmpresa) {
        return await this.empresaService.desabilitarEmpresa(idEmpresa);
    }
    async aprovaEmpresa(idEmpresa) {
        const response = await this.empresaService.aprovaEmpresa(idEmpresa);
        if (response.affected != 1) {
            new common_1.HttpException('Erro ao aprovar empresa', common_1.HttpStatus.BAD_REQUEST);
        }
        const empresaAprovada = await this.empresaService.buscarEmpresasPorId(idEmpresa);
        const usuarioCadastroDto = new usuarioCadastro_dto_1.UsuarioCadastroDto();
        usuarioCadastroDto.nome = empresaAprovada.nome;
        usuarioCadastroDto.email = empresaAprovada.email;
        usuarioCadastroDto.ativo = true;
        usuarioCadastroDto.bloqueado = false;
        usuarioCadastroDto.permissoes = ['comum'];
        usuarioCadastroDto.tipoUsuario = 'externo';
        usuarioCadastroDto.idUsuarioCadastro = 1;
        return response;
    }
};
exports.GerenciadorEmpresaService = GerenciadorEmpresaService;
exports.GerenciadorEmpresaService = GerenciadorEmpresaService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [node_arqt_base_gerenciador_usuarios_1.EmpresaService,
        event_emitter_1.EventEmitter2])
], GerenciadorEmpresaService);
//# sourceMappingURL=gerenciadorEmpresa.service.js.map
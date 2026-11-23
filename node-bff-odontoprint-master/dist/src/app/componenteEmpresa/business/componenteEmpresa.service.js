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
exports.ComponenteEmpresaService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const componenteEmpresa_entity_1 = require("../domain/componenteEmpresa.entity");
let ComponenteEmpresaService = class ComponenteEmpresaService {
    constructor(componenteEmpresaRepository) {
        this.componenteEmpresaRepository = componenteEmpresaRepository;
    }
    async sincronizarComponentesEmpresa(currentUser, idEmpresa, componentesDto) {
        const idUsuarioCadastro = currentUser.user.idUsuario;
        const componentesAtuais = await this.componenteEmpresaRepository.find({
            where: { idEmpresa },
        });
        const mapaComponentesAtuais = new Map(componentesAtuais.map((c) => [c.idComponente, c]));
        const idsComponentesDto = new Set(componentesDto.map((c) => c.idComponente));
        const componentesParaRemover = componentesAtuais.filter((c) => !idsComponentesDto.has(c.idComponente));
        if (componentesParaRemover.length > 0) {
            await this.componenteEmpresaRepository.remove(componentesParaRemover);
        }
        const componentesParaAdicionar = componentesDto
            .filter((dto) => !mapaComponentesAtuais.has(dto.idComponente))
            .map((dto) => this.componenteEmpresaRepository.create({
            idEmpresa,
            idComponente: dto.idComponente,
            ativo: 1,
            idUsuarioCadastro,
        }));
        if (componentesParaAdicionar.length > 0) {
            await this.componenteEmpresaRepository.save(componentesParaAdicionar);
        }
        return this.componenteEmpresaRepository.find({ where: { idEmpresa } });
    }
    async buscarPorEmpresa(idEmpresa) {
        return this.componenteEmpresaRepository.find({ where: { idEmpresa } });
    }
    async buscarPorEmpresaEComponente(idEmpresa, idComponente) {
        return this.componenteEmpresaRepository.findOne({ where: { idEmpresa, idComponente } });
    }
};
exports.ComponenteEmpresaService = ComponenteEmpresaService;
exports.ComponenteEmpresaService = ComponenteEmpresaService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(componenteEmpresa_entity_1.ComponenteEmpresa)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ComponenteEmpresaService);
//# sourceMappingURL=componenteEmpresa.service.js.map
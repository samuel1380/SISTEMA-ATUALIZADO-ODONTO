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
exports.ComponenteService = void 0;
const common_1 = require("@nestjs/common");
const componente_entity_1 = require("../domain/componente.entity");
const event_emitter_1 = require("@nestjs/event-emitter");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
let ComponenteService = class ComponenteService {
    constructor(componenteRepository, eventEmitter) {
        this.componenteRepository = componenteRepository;
        this.eventEmitter = eventEmitter;
    }
    async cadastrarComponente(currentUser, componenteDto) {
        var _a;
        const componente = this.componenteRepository.create(Object.assign(Object.assign({}, componenteDto), { preco: Number(componenteDto.preco), idMarcaComponente: Number(componenteDto.idMarcaComponente), ativo: 1, idUsuarioCadastro: ((_a = currentUser === null || currentUser === void 0 ? void 0 : currentUser.user) === null || _a === void 0 ? void 0 : _a.idUsuario) || 1 }));
        return this.componenteRepository.save(componente);
    }
    async editarComponente(currentUser, idComponente, componenteDto) {
        const componente = await this.componenteRepository.preload(Object.assign(Object.assign({ idComponente }, componenteDto), { preco: componenteDto.preco !== undefined ? Number(componenteDto.preco) : undefined, idMarcaComponente: componenteDto.idMarcaComponente !== undefined ? Number(componenteDto.idMarcaComponente) : undefined }));
        if (!componente) {
            throw new common_1.NotFoundException(`Componente com ID ${idComponente} não encontrado.`);
        }
        const componenteAtualizado = await this.componenteRepository.save(componente);
        try {
            this.eventEmitter.emit('preco.changed', currentUser);
        }
        catch (err) {
            console.warn(`Erro ao emitir preco.changed: ${err === null || err === void 0 ? void 0 : err.message}`);
        }
        return componenteAtualizado;
    }
    async buscaComponentesAtivos() {
        return this.componenteRepository.find({ where: { ativo: 1 } });
    }
    async buscaComponentePorId(idComponente) {
        return this.componenteRepository.findOne({ where: { idComponente } });
    }
};
exports.ComponenteService = ComponenteService;
exports.ComponenteService = ComponenteService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(componente_entity_1.Componente)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        event_emitter_1.EventEmitter2])
], ComponenteService);
//# sourceMappingURL=componente.service.js.map
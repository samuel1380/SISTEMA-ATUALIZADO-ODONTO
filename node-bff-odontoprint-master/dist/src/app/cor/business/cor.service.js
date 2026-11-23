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
exports.CorService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const cor_entity_1 = require("../domain/cor.entity");
let CorService = class CorService {
    constructor(corRepository) {
        this.corRepository = corRepository;
    }
    async cadastrarCor(currentUser, corDto) {
        const cor = this.corRepository.create(Object.assign(Object.assign({}, corDto), { ativo: 1, idUsuarioCadastro: currentUser.user.idUsuario }));
        return this.corRepository.save(cor);
    }
    async buscaCores() {
        return this.corRepository.find({ where: { ativo: 1 } });
    }
    async editarCor(idCor, corDto) {
        const cor = await this.corRepository.preload(Object.assign({ idCor }, corDto));
        if (!cor) {
            throw new common_1.NotFoundException(`Cor com ID ${idCor} não encontrada.`);
        }
        return this.corRepository.save(cor);
    }
    async buscaCorPorId(idCor) {
        return this.corRepository.findOne({ where: { idCor } });
    }
    async desativarCor(idCor) {
        const result = await this.corRepository.update(idCor, { ativo: 0 });
        if (result.affected === 0) {
            throw new common_1.NotFoundException(`Cor com ID ${idCor} não encontrada.`);
        }
    }
};
exports.CorService = CorService;
exports.CorService = CorService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(cor_entity_1.Cor)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], CorService);
//# sourceMappingURL=cor.service.js.map
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArquivoTrabalhoRepositoryProvider = exports.ArquivoTrabalhoRepository = void 0;
const typeorm_1 = require("typeorm");
const arquivoTrabalho_entity_1 = require("../domain/arquivoTrabalho.entity");
let ArquivoTrabalhoRepository = class ArquivoTrabalhoRepository extends typeorm_1.Repository {
    async salvaTrabalho(arquivoTrabalho) {
        return this.save(arquivoTrabalho);
    }
    async buscaArquivo(idArquivoTrabalho) {
        return await this.findOne({ where: { idArquivoTrabalho } });
    }
    async deleteArquivo(arquivoTrabalho) {
        return await this.remove([arquivoTrabalho]);
    }
};
exports.ArquivoTrabalhoRepository = ArquivoTrabalhoRepository;
exports.ArquivoTrabalhoRepository = ArquivoTrabalhoRepository = __decorate([
    (0, typeorm_1.EntityRepository)(arquivoTrabalho_entity_1.ArquivoTrabalho)
], ArquivoTrabalhoRepository);
exports.ArquivoTrabalhoRepositoryProvider = {
    provide: 'ArquivoTrabalhoRepository',
    useFactory: (connection) => connection.getCustomRepository(ArquivoTrabalhoRepository),
    inject: [typeorm_1.Connection]
};
//# sourceMappingURL=arquivoTrabalho.repository.js.map
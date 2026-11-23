"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FotoPacienteRepositoryProvider = exports.FotoPacienteRepository = void 0;
const typeorm_1 = require("typeorm");
const fotoPaciente_entity_1 = require("../domain/fotoPaciente.entity");
let FotoPacienteRepository = class FotoPacienteRepository extends typeorm_1.Repository {
    async salvaFotoPaciente(fotoPaciente) {
        return this.save(fotoPaciente);
    }
    async buscaArquivo(idFotoPaciente) {
        return await this.findOne({ where: { idFotoPaciente } });
    }
    async deleteArquivo(arquivoTrabalho) {
        return await this.remove([arquivoTrabalho]);
    }
};
exports.FotoPacienteRepository = FotoPacienteRepository;
exports.FotoPacienteRepository = FotoPacienteRepository = __decorate([
    (0, typeorm_1.EntityRepository)(fotoPaciente_entity_1.FotoPaciente)
], FotoPacienteRepository);
exports.FotoPacienteRepositoryProvider = {
    provide: 'FotoPacienteRepository',
    useFactory: (connection) => connection.getCustomRepository(FotoPacienteRepository),
    inject: [typeorm_1.Connection]
};
//# sourceMappingURL=fotoPaciente.repository.js.map
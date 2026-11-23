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
exports.CadastroComplementarEmpresaRepository = void 0;
const typeorm_1 = require("typeorm");
const cadastroComplementarEmpresa_entity_1 = require("../domain/cadastroComplementarEmpresa.entity");
const typeorm_2 = require("@nestjs/typeorm");
const common_1 = require("@nestjs/common");
let CadastroComplementarEmpresaRepository = class CadastroComplementarEmpresaRepository {
    constructor(repository) {
        this.repository = repository;
    }
    async salvaCadastroComplementar(produtoEmpresa) {
        return this.repository.save([produtoEmpresa]);
    }
    async buscarCadastroComplementarEmpresa(idEmpresa) {
        try {
            const cadastro = await this.repository.findOne({
                where: {
                    idEmpresa
                }
            });
            cadastro.dentistaEmpresa = cadastro.dentistaEmpresa.filter(dentista => dentista.ativo);
            return cadastro;
        }
        catch (e) {
            console.log(e);
        }
    }
};
exports.CadastroComplementarEmpresaRepository = CadastroComplementarEmpresaRepository;
exports.CadastroComplementarEmpresaRepository = CadastroComplementarEmpresaRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_2.InjectRepository)(cadastroComplementarEmpresa_entity_1.CadastroComplementarEmpresa)),
    __metadata("design:paramtypes", [typeorm_1.Repository])
], CadastroComplementarEmpresaRepository);
//# sourceMappingURL=cadastroComplementarEmpresa.repository.js.map
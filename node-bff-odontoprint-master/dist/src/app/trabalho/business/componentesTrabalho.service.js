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
exports.ComponentesTrabalhoService = void 0;
const common_1 = require("@nestjs/common");
const componentesTrabalho_entity_1 = require("../domain/componentesTrabalho.entity");
const typeorm_1 = require("typeorm");
const typeorm_2 = require("@nestjs/typeorm");
let ComponentesTrabalhoService = class ComponentesTrabalhoService {
    constructor(componentesTrabalhoRepository) {
        this.componentesTrabalhoRepository = componentesTrabalhoRepository;
    }
    async buscarComponentesTrabalho() {
        return this.componentesTrabalhoRepository.find();
    }
    async buscarPorIdTrabalho(idTrabalho) {
        return this.componentesTrabalhoRepository.find({ where: { idTrabalho } });
    }
    async salvarComponentes(componentesTrabalho, idTrabalho) {
        var _a, _b;
        const existentes = await this.componentesTrabalhoRepository.find({ where: { idTrabalho } });
        const vistoPorComponente = new Map();
        const duplicatas = [];
        for (const row of existentes) {
            const idC = row.idComponente;
            if (vistoPorComponente.has(idC)) {
                const principal = vistoPorComponente.get(idC);
                principal.qtdItems = ((_a = principal.qtdItems) !== null && _a !== void 0 ? _a : 0) + ((_b = row.qtdItems) !== null && _b !== void 0 ? _b : 0);
                duplicatas.push(row);
            }
            else {
                vistoPorComponente.set(idC, row);
            }
        }
        if (duplicatas.length) {
            await this.componentesTrabalhoRepository.softRemove(duplicatas);
            await this.componentesTrabalhoRepository.save([...vistoPorComponente.values()]);
        }
        const unicosExistentes = [...vistoPorComponente.values()];
        if (!(componentesTrabalho === null || componentesTrabalho === void 0 ? void 0 : componentesTrabalho.length)) {
            if (unicosExistentes.length) {
                await this.componentesTrabalhoRepository.softRemove(unicosExistentes);
            }
            return;
        }
        const payload = componentesTrabalho.map((c) => {
            c.idTrabalho = idTrabalho;
            return c;
        });
        const idsDesejados = new Set(payload.map((c) => Number(c.idComponente)).filter((id) => !Number.isNaN(id) && id > 0));
        for (const row of unicosExistentes) {
            if (!idsDesejados.has(row.idComponente)) {
                await this.componentesTrabalhoRepository.softRemove(row);
            }
        }
        const existentePorComponente = new Map(unicosExistentes.filter((e) => idsDesejados.has(e.idComponente)).map((e) => [e.idComponente, e]));
        for (const c of payload) {
            const idComp = Number(c.idComponente);
            if (!idComp || Number.isNaN(idComp)) {
                continue;
            }
            const atual = existentePorComponente.get(idComp);
            if (atual) {
                atual.qtdItems = c.qtdItems;
                atual.idTrabalho = idTrabalho;
                await this.componentesTrabalhoRepository.save(atual);
            }
            else {
                const novo = this.componentesTrabalhoRepository.create({
                    idTrabalho,
                    idComponente: idComp,
                    qtdItems: c.qtdItems,
                    ativo: 1,
                });
                await this.componentesTrabalhoRepository.save(novo);
                existentePorComponente.set(idComp, novo);
            }
        }
    }
};
exports.ComponentesTrabalhoService = ComponentesTrabalhoService;
exports.ComponentesTrabalhoService = ComponentesTrabalhoService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_2.InjectRepository)(componentesTrabalho_entity_1.ComponentesTrabalho)),
    __metadata("design:paramtypes", [typeorm_1.Repository])
], ComponentesTrabalhoService);
//# sourceMappingURL=componentesTrabalho.service.js.map
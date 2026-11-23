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
exports.SocioCredorService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const socio_entity_1 = require("../domain/socio.entity");
const credor_entity_1 = require("../domain/credor.entity");
const financeiro_service_1 = require("./financeiro.service");
const conta_entity_1 = require("../domain/conta.entity");
let SocioCredorService = class SocioCredorService {
    constructor(socioRepository, credorRepository, financeiroService) {
        this.socioRepository = socioRepository;
        this.credorRepository = credorRepository;
        this.financeiroService = financeiroService;
    }
    async criarSocio(dto) {
        const conta = await this.financeiroService.criarConta({
            nome: `Conta - ${dto.nome}`,
            tipo: conta_entity_1.TipoConta.CONTA_CORRENTE,
            saldoInicial: 0,
            idEmpresa: dto.idEmpresa,
        });
        const socio = this.socioRepository.create(Object.assign(Object.assign({}, dto), { idConta: conta.idConta }));
        return this.socioRepository.save(socio);
    }
    async listarSocios(idEmpresa) {
        const where = { ativo: true };
        if (idEmpresa) {
            where.idEmpresa = idEmpresa;
        }
        return this.socioRepository.find({
            where,
            relations: ['conta'],
            order: { nome: 'ASC' },
        });
    }
    async buscarSocioPorId(idSocio) {
        const socio = await this.socioRepository.findOne({
            where: { idSocio },
            relations: ['conta'],
        });
        if (!socio) {
            throw new common_1.NotFoundException(`Sócio com ID ${idSocio} não encontrado.`);
        }
        return socio;
    }
    async atualizarSocio(idSocio, dto) {
        const socio = await this.buscarSocioPorId(idSocio);
        Object.assign(socio, dto);
        return this.socioRepository.save(socio);
    }
    async excluirSocio(idSocio) {
        const socio = await this.buscarSocioPorId(idSocio);
        socio.ativo = false;
        await this.socioRepository.save(socio);
    }
    async criarCredor(dto) {
        const conta = await this.financeiroService.criarConta({
            nome: `Conta - ${dto.nome}`,
            tipo: conta_entity_1.TipoConta.CONTA_CORRENTE,
            saldoInicial: 0,
            idEmpresa: dto.idEmpresa,
        });
        const credor = this.credorRepository.create(Object.assign(Object.assign({}, dto), { idConta: conta.idConta }));
        return this.credorRepository.save(credor);
    }
    async listarCredores(idEmpresa) {
        const where = { ativo: true };
        if (idEmpresa) {
            where.idEmpresa = idEmpresa;
        }
        return this.credorRepository.find({
            where,
            relations: ['conta'],
            order: { nome: 'ASC' },
        });
    }
    async buscarCredorPorId(idCredor) {
        const credor = await this.credorRepository.findOne({
            where: { idCredor },
            relations: ['conta'],
        });
        if (!credor) {
            throw new common_1.NotFoundException(`Credor com ID ${idCredor} não encontrado.`);
        }
        return credor;
    }
    async atualizarCredor(idCredor, dto) {
        const credor = await this.buscarCredorPorId(idCredor);
        Object.assign(credor, dto);
        return this.credorRepository.save(credor);
    }
    async excluirCredor(idCredor) {
        const credor = await this.buscarCredorPorId(idCredor);
        credor.ativo = false;
        await this.credorRepository.save(credor);
    }
};
exports.SocioCredorService = SocioCredorService;
exports.SocioCredorService = SocioCredorService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(socio_entity_1.Socio)),
    __param(1, (0, typeorm_1.InjectRepository)(credor_entity_1.Credor)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        financeiro_service_1.FinanceiroService])
], SocioCredorService);
//# sourceMappingURL=socio-credor.service.js.map
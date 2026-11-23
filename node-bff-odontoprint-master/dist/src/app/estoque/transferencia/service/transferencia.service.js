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
exports.TransferenciaService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const estoque_service_1 = require("../../estoque/service/estoque.service");
const transferencia_entity_1 = require("../domain/transferencia.entity");
const almoxarifado_service_1 = require("../../almoxarifado/service/almoxarifado.service");
let TransferenciaService = class TransferenciaService {
    constructor(transferenciaRepository, estoqueService, almoxarifadoService) {
        this.transferenciaRepository = transferenciaRepository;
        this.estoqueService = estoqueService;
        this.almoxarifadoService = almoxarifadoService;
    }
    async create(dto) {
        const [almoxarifadoOrigem, almoxarifadoDestino] = await Promise.all([
            this.almoxarifadoService['almoxarifadoRepository'].findOne({ where: { idAlmoxarifado: dto.idAlmoxarifadoOrigem } }),
            this.almoxarifadoService['almoxarifadoRepository'].findOne({ where: { idAlmoxarifado: dto.idAlmoxarifadoDestino } }),
        ]);
        if (!almoxarifadoOrigem) {
            console.warn('Almoxarifado de origem não encontrado:', dto.idAlmoxarifadoOrigem, " Registrando débito global");
        }
        if (!almoxarifadoDestino) {
            throw new common_1.BadRequestException(`Almoxarifado de destino com ID ${dto.idAlmoxarifadoDestino} não encontrado.`);
        }
        if (dto.idAlmoxarifadoOrigem === dto.idAlmoxarifadoDestino) {
            throw new common_1.BadRequestException('O almoxarifado de origem e destino não podem ser o mesmo.');
        }
        if (dto.idAlmoxarifadoOrigem) {
            const estoqueOrigem = await this.estoqueService['estoqueRepository'].findOne({
                where: { idAlmoxarifado: dto.idAlmoxarifadoOrigem, idComponente: dto.idComponente },
            });
            if (!estoqueOrigem || estoqueOrigem.quantidade < dto.quantidade) {
                throw new common_1.BadRequestException(`Estoque insuficiente do produto no almoxarifado de origem.`);
            }
        }
        return await this.transferenciaRepository.save(dto);
    }
    findAll() {
        return this.transferenciaRepository.find({
            order: { dataTransferencia: 'DESC' },
        });
    }
    async findDebtsByAlmoxarifado(idAlmoxarifado) {
        const rawResults = await this.transferenciaRepository
            .createQueryBuilder('transferencia')
            .select('componente.idComponente', 'idComponente')
            .addSelect('componente.nome', 'nome')
            .addSelect('SUM(transferencia.quantidade)', 'quantidade')
            .innerJoin('transferencia.componente', 'componente')
            .where('transferencia.idAlmoxarifadoDestino = :idAlmoxarifado', { idAlmoxarifado })
            .andWhere('transferencia.baixado = :baixado', { baixado: false })
            .groupBy('componente.idComponente, componente.nome')
            .orderBy('componente.nome', 'ASC')
            .getRawMany();
        return rawResults.map((item) => ({
            idComponente: item.idComponente,
            nome: item.nome,
            quantidade: parseInt(item.quantidade, 10) || 0,
        }));
    }
    async findCreditsByAlmoxarifado(idAlmoxarifado) {
        const rawResults = await this.transferenciaRepository
            .createQueryBuilder('transferencia')
            .select('componente.idComponente', 'idComponente')
            .addSelect('componente.nome', 'nome')
            .addSelect('SUM(transferencia.quantidade)', 'quantidade')
            .innerJoin('transferencia.componente', 'componente')
            .where('transferencia.idAlmoxarifadoOrigem = :idAlmoxarifado', { idAlmoxarifado })
            .andWhere('transferencia.baixado = :baixado', { baixado: false })
            .groupBy('componente.idComponente, componente.nome')
            .orderBy('componente.nome', 'ASC')
            .getRawMany();
        return rawResults.map((item) => ({
            idComponente: item.idComponente,
            nome: item.nome,
            quantidade: parseInt(item.quantidade, 10) || 0,
        }));
    }
};
exports.TransferenciaService = TransferenciaService;
exports.TransferenciaService = TransferenciaService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(transferencia_entity_1.Transferencia)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        estoque_service_1.EstoqueService,
        almoxarifado_service_1.AlmoxarifadoService])
], TransferenciaService);
//# sourceMappingURL=transferencia.service.js.map
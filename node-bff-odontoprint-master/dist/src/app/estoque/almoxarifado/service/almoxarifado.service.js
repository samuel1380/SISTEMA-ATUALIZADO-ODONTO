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
var AlmoxarifadoService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlmoxarifadoService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const almoxarifado_entity_1 = require("../domain/almoxarifado.entity");
const event_emitter_1 = require("@nestjs/event-emitter");
const empresa_created_events_1 = require("../../estoque/events/empresa-created.events");
let AlmoxarifadoService = AlmoxarifadoService_1 = class AlmoxarifadoService {
    constructor(almoxarifadoRepository, logger = new common_1.Logger(AlmoxarifadoService_1.name)) {
        this.almoxarifadoRepository = almoxarifadoRepository;
        this.logger = logger;
    }
    create(createAlmoxarifadoDto) {
        const almoxarifado = this.almoxarifadoRepository.create(createAlmoxarifadoDto);
        return this.almoxarifadoRepository.save(almoxarifado);
    }
    findAll() {
        return this.almoxarifadoRepository.find();
    }
    async findOne(id) {
        const almoxarifado = await this.almoxarifadoRepository.findOne({ where: { idAlmoxarifado: id } });
        if (!almoxarifado) {
            throw new common_1.NotFoundException(`Almoxarifado com ID "${id}" não encontrado.`);
        }
        return almoxarifado;
    }
    async findOneByEmpresa(idEmpresa) {
        let almoxarifado = await this.almoxarifadoRepository.findOne({ where: { idEmpresa } });
        if (!almoxarifado) {
            almoxarifado = await this.almoxarifadoRepository.findOne({ where: { idEmpresa: 1 } });
        }
        if (!almoxarifado) {
            const primeiro = await this.almoxarifadoRepository.findOne({ where: {} });
            if (primeiro) {
                return primeiro;
            }
            almoxarifado = await this.create({
                nome: `Almoxarifado Principal`,
                descricao: `Almoxarifado padrão do sistema`,
                idEmpresa: idEmpresa || 1,
            });
        }
        return almoxarifado;
    }
    async update(id, updateAlmoxarifadoDto) {
        const almoxarifado = await this.almoxarifadoRepository.preload(Object.assign({ idAlmoxarifado: id }, updateAlmoxarifadoDto));
        if (!almoxarifado) {
            throw new common_1.NotFoundException(`Almoxarifado com ID "${id}" não encontrado.`);
        }
        return this.almoxarifadoRepository.save(almoxarifado);
    }
    async remove(id) {
        const result = await this.almoxarifadoRepository.softDelete(id);
        if (result.affected === 0) {
            throw new common_1.NotFoundException(`Almoxarifado com ID "${id}" não encontrado.`);
        }
    }
    async handleTrabalhoCriadoEvent(payload) {
        this.logger.log(`Recebido evento 'empresa.created'. Criando almoxarifado para a empresa ${payload.idEmpresa}.`);
        const almoxarifadoExistente = await this.almoxarifadoRepository.findOne({ where: { idEmpresa: payload.idEmpresa } });
        if (almoxarifadoExistente) {
            this.logger.log(`Almoxarifado para a empresa ${payload.idEmpresa} já existe.`);
            return;
        }
        const novoAlmoxarifado = this.almoxarifadoRepository.create({
            idEmpresa: payload.idEmpresa,
            nome: payload.nome,
        });
        await this.almoxarifadoRepository.save(novoAlmoxarifado);
    }
};
exports.AlmoxarifadoService = AlmoxarifadoService;
__decorate([
    (0, event_emitter_1.OnEvent)('empresa.created', { async: true }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [empresa_created_events_1.EmpresaCreatedEvent]),
    __metadata("design:returntype", Promise)
], AlmoxarifadoService.prototype, "handleTrabalhoCriadoEvent", null);
exports.AlmoxarifadoService = AlmoxarifadoService = AlmoxarifadoService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(almoxarifado_entity_1.Almoxarifado)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        common_1.Logger])
], AlmoxarifadoService);
//# sourceMappingURL=almoxarifado.service.js.map
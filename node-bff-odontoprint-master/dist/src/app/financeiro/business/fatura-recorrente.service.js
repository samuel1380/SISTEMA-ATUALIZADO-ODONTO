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
var FaturaRecorrenteService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FaturaRecorrenteService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const fatura_service_1 = require("./fatura.service");
const typeorm_1 = require("@nestjs/typeorm");
const ordemServico_entity_1 = require("../../ordemServico/domain/ordemServico.entity");
const typeorm_2 = require("typeorm");
let FaturaRecorrenteService = FaturaRecorrenteService_1 = class FaturaRecorrenteService {
    constructor(faturaService, osRepository) {
        this.faturaService = faturaService;
        this.osRepository = osRepository;
        this.logger = new common_1.Logger(FaturaRecorrenteService_1.name);
        this.jaExecutadoEsteMes = false;
    }
    async adicionarTrabalhosEnviadosAFaturas() {
        const hoje = new Date();
        const dia = hoje.getDate();
        this.logger.log(`Executando JOB para adicionar trabalhos enviados às faturas (dia ${dia})...`);
        try {
            const resultado = await this.faturaService.adicionarTrabalhosEnviadosAFatura();
            this.logger.log(`JOB concluído: ${resultado.adicionados} trabalhos adicionados a ${resultado.faturasAtualizadas} faturas.`);
        }
        catch (error) {
            this.logger.error(`Erro ao executar JOB de adicionar trabalhos enviados às faturas: ${error.message}`, error.stack);
        }
    }
};
exports.FaturaRecorrenteService = FaturaRecorrenteService;
__decorate([
    (0, schedule_1.Cron)('0 2 * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], FaturaRecorrenteService.prototype, "adicionarTrabalhosEnviadosAFaturas", null);
exports.FaturaRecorrenteService = FaturaRecorrenteService = FaturaRecorrenteService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectRepository)(ordemServico_entity_1.OrdemServico)),
    __metadata("design:paramtypes", [fatura_service_1.FaturaService,
        typeorm_2.Repository])
], FaturaRecorrenteService);
//# sourceMappingURL=fatura-recorrente.service.js.map
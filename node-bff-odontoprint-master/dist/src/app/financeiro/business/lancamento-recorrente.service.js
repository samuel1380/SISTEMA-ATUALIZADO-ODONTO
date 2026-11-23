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
var LancamentoRecorrenteService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LancamentoRecorrenteService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const schedule_1 = require("@nestjs/schedule");
const lancamento_recorrente_entity_1 = require("../domain/lancamento-recorrente.entity");
const financeiro_service_1 = require("./financeiro.service");
const parcela_entity_1 = require("../domain/parcela.entity");
let LancamentoRecorrenteService = LancamentoRecorrenteService_1 = class LancamentoRecorrenteService {
    constructor(recorrenteRepo, financeiroService) {
        this.recorrenteRepo = recorrenteRepo;
        this.financeiroService = financeiroService;
        this.logger = new common_1.Logger(LancamentoRecorrenteService_1.name);
    }
    async gerarLancamentosRecorrentes() {
        this.logger.log('Iniciando a geração de lançamentos recorrentes mensais...');
        const recorrentes = await this.recorrenteRepo.find({ where: { ativo: true, periodicidade: lancamento_recorrente_entity_1.Periodicidade.MENSAL } });
        if (recorrentes.length === 0) {
            this.logger.log('Nenhum lançamento recorrente ativo para gerar.');
            return;
        }
        const hoje = new Date();
        const ano = hoje.getFullYear();
        const mes = hoje.getMonth();
        for (const recorrente of recorrentes) {
            const dataCompetencia = new Date(ano, mes, 1);
            const dataVencimento = new Date(ano, mes, recorrente.diaVencimento);
            await this.financeiroService.criarLancamento({
                descricao: `${recorrente.descricao} - Competência ${String(mes + 1).padStart(2, '0')}/${ano}`,
                tipo: recorrente.tipo,
                valorTotal: recorrente.valorEstimado,
                dataCompetencia: dataCompetencia.toISOString().split('T')[0],
                idClienteFornecedor: recorrente.idClienteFornecedor,
                parcelas: [{
                        numeroParcela: 1,
                        valor: recorrente.valorEstimado,
                        dataVencimento: dataVencimento.toISOString().split('T')[0],
                        meioPagamento: parcela_entity_1.MeioPagamento.BOLETO,
                    }],
            });
            this.logger.log(`Lançamento gerado para: ${recorrente.descricao}`);
        }
        this.logger.log('Geração de lançamentos recorrentes concluída.');
    }
};
exports.LancamentoRecorrenteService = LancamentoRecorrenteService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], LancamentoRecorrenteService.prototype, "gerarLancamentosRecorrentes", null);
exports.LancamentoRecorrenteService = LancamentoRecorrenteService = LancamentoRecorrenteService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(lancamento_recorrente_entity_1.LancamentoRecorrente)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        financeiro_service_1.FinanceiroService])
], LancamentoRecorrenteService);
//# sourceMappingURL=lancamento-recorrente.service.js.map
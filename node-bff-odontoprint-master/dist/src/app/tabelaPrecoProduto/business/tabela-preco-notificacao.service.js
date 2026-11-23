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
var TabelaPrecoNotificacaoService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TabelaPrecoNotificacaoService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const tabelaPrecoProduto_service_1 = require("./tabelaPrecoProduto.service");
const event_emitter_1 = require("@nestjs/event-emitter");
let TabelaPrecoNotificacaoService = TabelaPrecoNotificacaoService_1 = class TabelaPrecoNotificacaoService {
    constructor(tabelaPrecoProdutoService, eventEmitter) {
        this.tabelaPrecoProdutoService = tabelaPrecoProdutoService;
        this.eventEmitter = eventEmitter;
        this.logger = new common_1.Logger(TabelaPrecoNotificacaoService_1.name);
    }
    async verificarTabelasProximasVencimento() {
        this.logger.log('Executando verificação de tabelas de preço próximas do vencimento...');
        try {
            const tabelasProximasVencimento = await this.tabelaPrecoProdutoService.buscarTabelasProximasVencimento(30);
            if (tabelasProximasVencimento.length > 0) {
                this.logger.warn(`Encontradas ${tabelasProximasVencimento.length} tabela(s) de preço próxima(s) do vencimento.`);
                this.eventEmitter.emit('tabela.preco.vencimento.proximo', {
                    tabelas: tabelasProximasVencimento,
                    quantidade: tabelasProximasVencimento.length,
                });
            }
            else {
                this.logger.log('Nenhuma tabela de preço próxima do vencimento encontrada.');
            }
        }
        catch (error) {
            this.logger.error(`Erro ao verificar tabelas próximas do vencimento: ${error.message}`, error.stack);
        }
    }
};
exports.TabelaPrecoNotificacaoService = TabelaPrecoNotificacaoService;
__decorate([
    (0, schedule_1.Cron)('0 6 * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TabelaPrecoNotificacaoService.prototype, "verificarTabelasProximasVencimento", null);
exports.TabelaPrecoNotificacaoService = TabelaPrecoNotificacaoService = TabelaPrecoNotificacaoService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [tabelaPrecoProduto_service_1.TabelaPrecoProdutoService,
        event_emitter_1.EventEmitter2])
], TabelaPrecoNotificacaoService);
//# sourceMappingURL=tabela-preco-notificacao.service.js.map
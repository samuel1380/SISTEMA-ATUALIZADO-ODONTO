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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Parcela = exports.StatusParcela = exports.MeioPagamento = void 0;
const typeorm_1 = require("typeorm");
const lancamento_entity_1 = require("./lancamento.entity");
const movimentacao_entity_1 = require("./movimentacao.entity");
var MeioPagamento;
(function (MeioPagamento) {
    MeioPagamento["DINHEIRO"] = "DINHEIRO";
    MeioPagamento["CARTAO_CREDITO"] = "CARTAO_CREDITO";
    MeioPagamento["CARTAO_DEBITO"] = "CARTAO_DEBITO";
    MeioPagamento["CHEQUE"] = "CHEQUE";
    MeioPagamento["BOLETO"] = "BOLETO";
    MeioPagamento["TRANSFERENCIA"] = "TRANSFERENCIA";
    MeioPagamento["PIX"] = "PIX";
    MeioPagamento["CREDITO_INTERNO"] = "CREDITO_INTERNO";
})(MeioPagamento || (exports.MeioPagamento = MeioPagamento = {}));
var StatusParcela;
(function (StatusParcela) {
    StatusParcela["ABERTO"] = "ABERTO";
    StatusParcela["PAGO"] = "PAGO";
    StatusParcela["VENCIDO"] = "VENCIDO";
    StatusParcela["CANCELADO"] = "CANCELADO";
})(StatusParcela || (exports.StatusParcela = StatusParcela = {}));
let Parcela = class Parcela {
};
exports.Parcela = Parcela;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Parcela.prototype, "idParcela", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => lancamento_entity_1.Lancamento, lancamento => lancamento.parcelas),
    (0, typeorm_1.JoinColumn)({ name: 'idLancamento' }),
    __metadata("design:type", lancamento_entity_1.Lancamento)
], Parcela.prototype, "lancamento", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Parcela.prototype, "idLancamento", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Parcela.prototype, "numeroParcela", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 15, scale: 2 }),
    __metadata("design:type", Number)
], Parcela.prototype, "valor", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 15, scale: 2, default: 0.00 }),
    __metadata("design:type", Number)
], Parcela.prototype, "valorPago", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Parcela.prototype, "valorAcrescimoAcumulado", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", Date)
], Parcela.prototype, "dataVencimento", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Date)
], Parcela.prototype, "dataPagamento", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: StatusParcela, default: StatusParcela.ABERTO }),
    __metadata("design:type", String)
], Parcela.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: MeioPagamento }),
    __metadata("design:type", String)
], Parcela.prototype, "meioPagamento", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Object)
], Parcela.prototype, "dadosAdicionais", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50, nullable: true }),
    __metadata("design:type", String)
], Parcela.prototype, "numeroBoleto", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, nullable: true }),
    __metadata("design:type", String)
], Parcela.prototype, "codigoBarras", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], Parcela.prototype, "gerarJuros", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => movimentacao_entity_1.Movimentacao, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'idMovimentacao' }),
    __metadata("design:type", movimentacao_entity_1.Movimentacao)
], Parcela.prototype, "movimentacao", void 0);
exports.Parcela = Parcela = __decorate([
    (0, typeorm_1.Entity)('TbFinanceiroParcela')
], Parcela);
//# sourceMappingURL=parcela.entity.js.map
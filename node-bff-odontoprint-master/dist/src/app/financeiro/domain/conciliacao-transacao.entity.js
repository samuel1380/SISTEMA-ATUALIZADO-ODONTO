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
exports.ConciliacaoTransacao = exports.TipoVinculo = void 0;
const typeorm_1 = require("typeorm");
const transacao_ofx_entity_1 = require("./transacao-ofx.entity");
const movimentacao_entity_1 = require("./movimentacao.entity");
const aporte_entity_1 = require("./aporte.entity");
const retirada_entity_1 = require("./retirada.entity");
var TipoVinculo;
(function (TipoVinculo) {
    TipoVinculo["MOVIMENTACAO"] = "MOVIMENTACAO";
    TipoVinculo["APORTE"] = "APORTE";
    TipoVinculo["RETIRADA"] = "RETIRADA";
})(TipoVinculo || (exports.TipoVinculo = TipoVinculo = {}));
let ConciliacaoTransacao = class ConciliacaoTransacao {
};
exports.ConciliacaoTransacao = ConciliacaoTransacao;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], ConciliacaoTransacao.prototype, "idConciliacao", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", Number)
], ConciliacaoTransacao.prototype, "idTransacaoOfx", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => transacao_ofx_entity_1.TransacaoOfx, (transacao) => transacao.conciliacao),
    (0, typeorm_1.JoinColumn)({ name: 'idTransacaoOfx' }),
    __metadata("design:type", transacao_ofx_entity_1.TransacaoOfx)
], ConciliacaoTransacao.prototype, "transacaoOfx", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], ConciliacaoTransacao.prototype, "idMovimentacao", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => movimentacao_entity_1.Movimentacao, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'idMovimentacao' }),
    __metadata("design:type", movimentacao_entity_1.Movimentacao)
], ConciliacaoTransacao.prototype, "movimentacao", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], ConciliacaoTransacao.prototype, "idAporte", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => aporte_entity_1.Aporte, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'idAporte' }),
    __metadata("design:type", aporte_entity_1.Aporte)
], ConciliacaoTransacao.prototype, "aporte", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], ConciliacaoTransacao.prototype, "idRetirada", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => retirada_entity_1.Retirada, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'idRetirada' }),
    __metadata("design:type", retirada_entity_1.Retirada)
], ConciliacaoTransacao.prototype, "retirada", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: TipoVinculo }),
    __metadata("design:type", String)
], ConciliacaoTransacao.prototype, "tipoVinculo", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], ConciliacaoTransacao.prototype, "dataConciliacao", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], ConciliacaoTransacao.prototype, "idUsuarioConciliacao", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], ConciliacaoTransacao.prototype, "observacoes", void 0);
exports.ConciliacaoTransacao = ConciliacaoTransacao = __decorate([
    (0, typeorm_1.Entity)('TbConciliacaoTransacao')
], ConciliacaoTransacao);
//# sourceMappingURL=conciliacao-transacao.entity.js.map
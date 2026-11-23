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
exports.Movimentacao = exports.TipoMovimentacao = void 0;
const typeorm_1 = require("typeorm");
const conta_entity_1 = require("./conta.entity");
var TipoMovimentacao;
(function (TipoMovimentacao) {
    TipoMovimentacao["CREDITO"] = "CREDITO";
    TipoMovimentacao["DEBITO"] = "DEBITO";
    TipoMovimentacao["CREDITO_INTERNO"] = "CREDITO_INTERNO";
})(TipoMovimentacao || (exports.TipoMovimentacao = TipoMovimentacao = {}));
let Movimentacao = class Movimentacao {
};
exports.Movimentacao = Movimentacao;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Movimentacao.prototype, "idMovimentacao", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => conta_entity_1.Conta),
    (0, typeorm_1.JoinColumn)({ name: 'idConta' }),
    __metadata("design:type", conta_entity_1.Conta)
], Movimentacao.prototype, "conta", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Movimentacao.prototype, "idConta", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: TipoMovimentacao }),
    __metadata("design:type", String)
], Movimentacao.prototype, "tipo", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 15, scale: 2 }),
    __metadata("design:type", Number)
], Movimentacao.prototype, "valor", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Movimentacao.prototype, "valorAcrescimo", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Movimentacao.prototype, "descricao", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'datetime' }),
    __metadata("design:type", Date)
], Movimentacao.prototype, "dataMovimentacao", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], Movimentacao.prototype, "idParcelaOrigem", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Movimentacao.prototype, "idAgrupadorTransferencia", void 0);
exports.Movimentacao = Movimentacao = __decorate([
    (0, typeorm_1.Entity)('TbFinanceiroMovimentacao')
], Movimentacao);
//# sourceMappingURL=movimentacao.entity.js.map
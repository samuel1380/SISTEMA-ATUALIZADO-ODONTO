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
exports.Conta = exports.TipoConta = void 0;
const typeorm_1 = require("typeorm");
const movimentacao_entity_1 = require("./movimentacao.entity");
var TipoConta;
(function (TipoConta) {
    TipoConta["CONTA_CORRENTE"] = "CONTA_CORRENTE";
    TipoConta["POUPANCA"] = "POUPANCA";
    TipoConta["CAIXA_INTERNO"] = "CAIXA_INTERNO";
    TipoConta["CARTEIRA_DIGITAL"] = "CARTEIRA_DIGITAL";
})(TipoConta || (exports.TipoConta = TipoConta = {}));
let Conta = class Conta {
};
exports.Conta = Conta;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Conta.prototype, "idConta", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100 }),
    __metadata("design:type", String)
], Conta.prototype, "nome", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: TipoConta }),
    __metadata("design:type", String)
], Conta.prototype, "tipo", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 15, scale: 2, default: 0.00 }),
    __metadata("design:type", Number)
], Conta.prototype, "saldoInicial", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 15, scale: 2, default: 0.00 }),
    __metadata("design:type", Number)
], Conta.prototype, "saldoAtual", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], Conta.prototype, "idEmpresa", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], Conta.prototype, "ativo", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Conta.prototype, "dataInclusao", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Conta.prototype, "dataAlteracao", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => movimentacao_entity_1.Movimentacao, (mov) => mov.conta),
    __metadata("design:type", Array)
], Conta.prototype, "movimentacoes", void 0);
exports.Conta = Conta = __decorate([
    (0, typeorm_1.Entity)('TbFinanceiroConta')
], Conta);
//# sourceMappingURL=conta.entity.js.map
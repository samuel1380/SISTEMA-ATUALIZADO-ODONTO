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
exports.Emprestimo = exports.StatusEmprestimo = exports.TipoEmprestimo = void 0;
const typeorm_1 = require("typeorm");
const lancamento_entity_1 = require("./lancamento.entity");
const credor_entity_1 = require("./credor.entity");
var TipoEmprestimo;
(function (TipoEmprestimo) {
    TipoEmprestimo["RECEBIDO"] = "RECEBIDO";
    TipoEmprestimo["CONCEDIDO"] = "CONCEDIDO";
})(TipoEmprestimo || (exports.TipoEmprestimo = TipoEmprestimo = {}));
var StatusEmprestimo;
(function (StatusEmprestimo) {
    StatusEmprestimo["ATIVO"] = "ATIVO";
    StatusEmprestimo["QUITADO"] = "QUITADO";
    StatusEmprestimo["CANCELADO"] = "CANCELADO";
})(StatusEmprestimo || (exports.StatusEmprestimo = StatusEmprestimo = {}));
let Emprestimo = class Emprestimo {
};
exports.Emprestimo = Emprestimo;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Emprestimo.prototype, "idEmprestimo", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Emprestimo.prototype, "idLancamento", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => lancamento_entity_1.Lancamento),
    (0, typeorm_1.JoinColumn)({ name: 'idLancamento' }),
    __metadata("design:type", lancamento_entity_1.Lancamento)
], Emprestimo.prototype, "lancamento", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: TipoEmprestimo }),
    __metadata("design:type", String)
], Emprestimo.prototype, "tipo", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 15, scale: 2 }),
    __metadata("design:type", Number)
], Emprestimo.prototype, "valorPrincipal", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 15, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Emprestimo.prototype, "saldoRestante", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 5, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Emprestimo.prototype, "taxaJuros", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", Date)
], Emprestimo.prototype, "dataContratacao", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Date)
], Emprestimo.prototype, "dataVencimento", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: StatusEmprestimo, default: StatusEmprestimo.ATIVO }),
    __metadata("design:type", String)
], Emprestimo.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], Emprestimo.prototype, "idCredorDevedor", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => credor_entity_1.Credor),
    (0, typeorm_1.JoinColumn)({ name: 'idCredorDevedor' }),
    __metadata("design:type", credor_entity_1.Credor)
], Emprestimo.prototype, "credor", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Emprestimo.prototype, "observacoes", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Emprestimo.prototype, "dataInclusao", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Emprestimo.prototype, "dataAlteracao", void 0);
exports.Emprestimo = Emprestimo = __decorate([
    (0, typeorm_1.Entity)('TbEmprestimo')
], Emprestimo);
//# sourceMappingURL=emprestimo.entity.js.map
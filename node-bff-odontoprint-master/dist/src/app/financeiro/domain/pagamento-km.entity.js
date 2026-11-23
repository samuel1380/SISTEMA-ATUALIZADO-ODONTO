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
exports.PagamentoKm = void 0;
const typeorm_1 = require("typeorm");
const lancamento_entity_1 = require("./lancamento.entity");
let PagamentoKm = class PagamentoKm {
};
exports.PagamentoKm = PagamentoKm;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], PagamentoKm.prototype, "idPagamentoKm", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255 }),
    __metadata("design:type", String)
], PagamentoKm.prototype, "nomePessoa", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], PagamentoKm.prototype, "quantidadeKm", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], PagamentoKm.prototype, "valorPorKm", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 15, scale: 2 }),
    __metadata("design:type", Number)
], PagamentoKm.prototype, "valorTotal", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", Date)
], PagamentoKm.prototype, "dataPagamento", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], PagamentoKm.prototype, "idLancamento", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => lancamento_entity_1.Lancamento, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'idLancamento' }),
    __metadata("design:type", lancamento_entity_1.Lancamento)
], PagamentoKm.prototype, "lancamento", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], PagamentoKm.prototype, "observacoes", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], PagamentoKm.prototype, "dataInclusao", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], PagamentoKm.prototype, "dataAlteracao", void 0);
exports.PagamentoKm = PagamentoKm = __decorate([
    (0, typeorm_1.Entity)('TbPagamentoKm')
], PagamentoKm);
//# sourceMappingURL=pagamento-km.entity.js.map
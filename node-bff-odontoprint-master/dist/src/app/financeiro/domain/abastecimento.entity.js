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
exports.Abastecimento = void 0;
const typeorm_1 = require("typeorm");
const veiculo_entity_1 = require("./veiculo.entity");
const lancamento_entity_1 = require("./lancamento.entity");
let Abastecimento = class Abastecimento {
};
exports.Abastecimento = Abastecimento;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Abastecimento.prototype, "idAbastecimento", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Abastecimento.prototype, "idVeiculo", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => veiculo_entity_1.Veiculo),
    (0, typeorm_1.JoinColumn)({ name: 'idVeiculo' }),
    __metadata("design:type", veiculo_entity_1.Veiculo)
], Abastecimento.prototype, "veiculo", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], Abastecimento.prototype, "idLancamento", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => lancamento_entity_1.Lancamento, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'idLancamento' }),
    __metadata("design:type", lancamento_entity_1.Lancamento)
], Abastecimento.prototype, "lancamento", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", Date)
], Abastecimento.prototype, "dataAbastecimento", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 3 }),
    __metadata("design:type", Number)
], Abastecimento.prototype, "litros", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], Abastecimento.prototype, "valorLitro", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 15, scale: 2 }),
    __metadata("design:type", Number)
], Abastecimento.prototype, "valorTotal", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], Abastecimento.prototype, "quilometragem", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255, nullable: true }),
    __metadata("design:type", String)
], Abastecimento.prototype, "local", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Abastecimento.prototype, "observacoes", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Abastecimento.prototype, "dataInclusao", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Abastecimento.prototype, "dataAlteracao", void 0);
exports.Abastecimento = Abastecimento = __decorate([
    (0, typeorm_1.Entity)('TbAbastecimento')
], Abastecimento);
//# sourceMappingURL=abastecimento.entity.js.map
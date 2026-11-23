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
exports.FaturaDevolucaoItem = void 0;
const typeorm_1 = require("typeorm");
const fatura_entity_1 = require("./fatura.entity");
const componente_entity_1 = require("../../componente/domain/componente.entity");
const paciente_entity_1 = require("../../paciente/domain/paciente.entity");
let FaturaDevolucaoItem = class FaturaDevolucaoItem {
};
exports.FaturaDevolucaoItem = FaturaDevolucaoItem;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], FaturaDevolucaoItem.prototype, "idFaturaDevolucaoItem", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], FaturaDevolucaoItem.prototype, "idFatura", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => fatura_entity_1.Fatura, (fatura) => fatura.devolucoesComponentes, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'idFatura' }),
    __metadata("design:type", fatura_entity_1.Fatura)
], FaturaDevolucaoItem.prototype, "fatura", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], FaturaDevolucaoItem.prototype, "idComponente", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => componente_entity_1.Componente, { eager: true }),
    (0, typeorm_1.JoinColumn)({ name: 'idComponente' }),
    __metadata("design:type", componente_entity_1.Componente)
], FaturaDevolucaoItem.prototype, "componente", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], FaturaDevolucaoItem.prototype, "idPaciente", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => paciente_entity_1.Paciente, { nullable: true, eager: true }),
    (0, typeorm_1.JoinColumn)({ name: 'idPaciente' }),
    __metadata("design:type", paciente_entity_1.Paciente)
], FaturaDevolucaoItem.prototype, "paciente", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], FaturaDevolucaoItem.prototype, "nomePaciente", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], FaturaDevolucaoItem.prototype, "quantidade", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 15, scale: 2 }),
    __metadata("design:type", Number)
], FaturaDevolucaoItem.prototype, "valorUnitario", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], FaturaDevolucaoItem.prototype, "dataInclusao", void 0);
exports.FaturaDevolucaoItem = FaturaDevolucaoItem = __decorate([
    (0, typeorm_1.Entity)('TbFaturaDevolucaoItem')
], FaturaDevolucaoItem);
//# sourceMappingURL=fatura-devolucao-item.entity.js.map
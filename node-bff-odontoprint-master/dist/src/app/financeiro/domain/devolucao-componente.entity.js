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
exports.DevolucaoComponente = exports.StatusDevolucao = void 0;
const ordemServicoItem_entity_1 = require("../../ordemServico/domain/ordemServicoItem.entity");
const typeorm_1 = require("typeorm");
const fatura_entity_1 = require("./fatura.entity");
var StatusDevolucao;
(function (StatusDevolucao) {
    StatusDevolucao["PENDENTE"] = "PENDENTE";
    StatusDevolucao["CONFERIDO"] = "CONFERIDO";
    StatusDevolucao["CONCLUIDO"] = "CONCLUIDO";
    StatusDevolucao["CANCELADO"] = "CANCELADO";
})(StatusDevolucao || (exports.StatusDevolucao = StatusDevolucao = {}));
let DevolucaoComponente = class DevolucaoComponente {
};
exports.DevolucaoComponente = DevolucaoComponente;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], DevolucaoComponente.prototype, "idDevolucao", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], DevolucaoComponente.prototype, "idFatura", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => fatura_entity_1.Fatura),
    (0, typeorm_1.JoinColumn)({ name: 'idFatura' }),
    __metadata("design:type", fatura_entity_1.Fatura)
], DevolucaoComponente.prototype, "fatura", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], DevolucaoComponente.prototype, "idOrdemServicoItem", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => ordemServicoItem_entity_1.OrdemServicoItem, (osItem) => osItem.devolucoes),
    (0, typeorm_1.JoinColumn)({ name: 'idOrdemServicoItem' }),
    __metadata("design:type", ordemServicoItem_entity_1.OrdemServicoItem)
], DevolucaoComponente.prototype, "ordemServicoItem", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], DevolucaoComponente.prototype, "quantidadeDevolvida", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: StatusDevolucao, default: StatusDevolucao.PENDENTE }),
    __metadata("design:type", String)
], DevolucaoComponente.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], DevolucaoComponente.prototype, "observacao", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], DevolucaoComponente.prototype, "dataSolicitacao", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Date)
], DevolucaoComponente.prototype, "dataConferencia", void 0);
exports.DevolucaoComponente = DevolucaoComponente = __decorate([
    (0, typeorm_1.Entity)('TbDevolucaoComponente')
], DevolucaoComponente);
//# sourceMappingURL=devolucao-componente.entity.js.map
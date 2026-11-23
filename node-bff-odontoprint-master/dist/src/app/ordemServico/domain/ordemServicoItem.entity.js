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
exports.OrdemServicoItem = exports.StatusOrdemServicoItem = exports.TipoCobranca = void 0;
const typeorm_1 = require("typeorm");
const ordemServico_entity_1 = require("./ordemServico.entity");
const devolucao_componente_entity_1 = require("../../financeiro/domain/devolucao-componente.entity");
var TipoCobranca;
(function (TipoCobranca) {
    TipoCobranca["SERVICO"] = "servico";
    TipoCobranca["COMPONENTE"] = "componente";
    TipoCobranca["AVULSO"] = "avulso";
})(TipoCobranca || (exports.TipoCobranca = TipoCobranca = {}));
var StatusOrdemServicoItem;
(function (StatusOrdemServicoItem) {
    StatusOrdemServicoItem["PENDENTE"] = "PENDENTE";
    StatusOrdemServicoItem["FATURADO"] = "FATURADO";
    StatusOrdemServicoItem["DEVOLUCAO_SOLICITADA"] = "DEVOLUCAO_SOLICITADA";
    StatusOrdemServicoItem["DEVOLVIDO"] = "DEVOLVIDO";
    StatusOrdemServicoItem["DEVOLUCAO_CANCELADA"] = "DEVOLUCAO_CANCELADA";
    StatusOrdemServicoItem["PAGO"] = "PAGO";
    StatusOrdemServicoItem["CANCELADO"] = "CANCELADO";
})(StatusOrdemServicoItem || (exports.StatusOrdemServicoItem = StatusOrdemServicoItem = {}));
let OrdemServicoItem = class OrdemServicoItem {
};
exports.OrdemServicoItem = OrdemServicoItem;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], OrdemServicoItem.prototype, "idOrdemServicoItem", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], OrdemServicoItem.prototype, "idOrdemServico", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => ordemServico_entity_1.OrdemServico, (os) => os.itens),
    (0, typeorm_1.JoinColumn)({ name: 'idOrdemServico' }),
    __metadata("design:type", ordemServico_entity_1.OrdemServico)
], OrdemServicoItem.prototype, "ordemServico", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: TipoCobranca }),
    __metadata("design:type", String)
], OrdemServicoItem.prototype, "tipoCobranca", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], OrdemServicoItem.prototype, "idReferencia", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], OrdemServicoItem.prototype, "descricao", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], OrdemServicoItem.prototype, "valor", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2, default: 0.00 }),
    __metadata("design:type", Number)
], OrdemServicoItem.prototype, "valorPago", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], OrdemServicoItem.prototype, "quantidade", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], OrdemServicoItem.prototype, "quantidadeDevolvida", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: StatusOrdemServicoItem, default: StatusOrdemServicoItem.PENDENTE }),
    __metadata("design:type", String)
], OrdemServicoItem.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], OrdemServicoItem.prototype, "idProfissional", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], OrdemServicoItem.prototype, "idPaciente", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', nullable: false }),
    __metadata("design:type", Number)
], OrdemServicoItem.prototype, "valorTotal", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "boolean", default: true }),
    __metadata("design:type", Boolean)
], OrdemServicoItem.prototype, "ativo", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: false }),
    __metadata("design:type", Number)
], OrdemServicoItem.prototype, "idUsuarioCadastro", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], OrdemServicoItem.prototype, "dataInclusao", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], OrdemServicoItem.prototype, "dataAlteracao", void 0);
__decorate([
    (0, typeorm_1.DeleteDateColumn)(),
    __metadata("design:type", Date)
], OrdemServicoItem.prototype, "dataExclusao", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => devolucao_componente_entity_1.DevolucaoComponente, (devolucao) => devolucao.ordemServicoItem),
    __metadata("design:type", Array)
], OrdemServicoItem.prototype, "devolucoes", void 0);
exports.OrdemServicoItem = OrdemServicoItem = __decorate([
    (0, typeorm_1.Entity)('TbOrdemServicoItem')
], OrdemServicoItem);
//# sourceMappingURL=ordemServicoItem.entity.js.map
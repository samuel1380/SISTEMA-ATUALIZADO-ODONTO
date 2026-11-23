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
exports.Fatura = exports.StatusFatura = void 0;
const empresa_entity_1 = require("@hunter-solucoes/node-arqt-base-gerenciador-usuarios/dist/src/app/empresa/domain/empresa.entity");
const ordemServico_entity_1 = require("../../ordemServico/domain/ordemServico.entity");
const typeorm_1 = require("typeorm");
const devolucao_componente_entity_1 = require("./devolucao-componente.entity");
const fatura_devolucao_item_entity_1 = require("./fatura-devolucao-item.entity");
var StatusFatura;
(function (StatusFatura) {
    StatusFatura["ABERTA"] = "ABERTA";
    StatusFatura["AGUARDANDO_DEVOLUCAO"] = "AGUARDANDO_DEVOLUCAO";
    StatusFatura["FECHADA"] = "FECHADA";
    StatusFatura["PAGA"] = "PAGA";
    StatusFatura["PAGA_PARCIALMENTE"] = "PAGA_PARCIALMENTE";
    StatusFatura["CANCELADA"] = "CANCELADA";
})(StatusFatura || (exports.StatusFatura = StatusFatura = {}));
let Fatura = class Fatura {
};
exports.Fatura = Fatura;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Fatura.prototype, "idFatura", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Fatura.prototype, "idEmpresa", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => empresa_entity_1.Empresa),
    (0, typeorm_1.JoinColumn)({ name: 'idEmpresa' }),
    __metadata("design:type", empresa_entity_1.Empresa)
], Fatura.prototype, "empresa", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", Date)
], Fatura.prototype, "dataInicio", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", Date)
], Fatura.prototype, "dataFim", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", Date)
], Fatura.prototype, "dataVencimento", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 15, scale: 2, default: 0.00 }),
    __metadata("design:type", Number)
], Fatura.prototype, "valorTotalBruto", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 15, scale: 2, default: 0.00 }),
    __metadata("design:type", Number)
], Fatura.prototype, "desconto", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 15, scale: 2 }),
    __metadata("design:type", Number)
], Fatura.prototype, "valorTotal", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 15, scale: 2, default: 0.00 }),
    __metadata("design:type", Number)
], Fatura.prototype, "valorPago", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: StatusFatura, default: StatusFatura.ABERTA }),
    __metadata("design:type", String)
], Fatura.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Fatura.prototype, "anotacoes", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], Fatura.prototype, "idFaturaOriginal", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], Fatura.prototype, "descricao", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Fatura, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'idFaturaOriginal' }),
    __metadata("design:type", Fatura)
], Fatura.prototype, "faturaOriginal", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => ordemServico_entity_1.OrdemServico, (os) => os.fatura),
    __metadata("design:type", Array)
], Fatura.prototype, "ordensDeServico", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => devolucao_componente_entity_1.DevolucaoComponente, (devolucao) => devolucao.fatura),
    __metadata("design:type", Array)
], Fatura.prototype, "devolucoes", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 15, scale: 2, default: 0.00 }),
    __metadata("design:type", Number)
], Fatura.prototype, "descontoDevolucao", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => fatura_devolucao_item_entity_1.FaturaDevolucaoItem, (devolucao) => devolucao.fatura, { cascade: true }),
    __metadata("design:type", Array)
], Fatura.prototype, "devolucoesComponentes", void 0);
exports.Fatura = Fatura = __decorate([
    (0, typeorm_1.Entity)('TbFinanceiroFatura')
], Fatura);
//# sourceMappingURL=fatura.entity.js.map
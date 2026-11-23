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
exports.Lancamento = exports.StatusLancamento = void 0;
const typeorm_1 = require("typeorm");
const parcela_entity_1 = require("./parcela.entity");
const ordemServico_entity_1 = require("../../ordemServico/domain/ordemServico.entity");
const fatura_entity_1 = require("./fatura.entity");
const categoria_entity_1 = require("./categoria.entity");
const fornecedor_entity_1 = require("./fornecedor.entity");
const tipo_lancamento_enum_1 = require("./tipo-lancamento.enum");
const empresa_entity_1 = require("@hunter-solucoes/node-arqt-base-gerenciador-usuarios/dist/src/app/empresa/domain/empresa.entity");
var StatusLancamento;
(function (StatusLancamento) {
    StatusLancamento["PENDENTE"] = "PENDENTE";
    StatusLancamento["PARCIALMENTE_PAGO"] = "PARCIALMENTE_PAGO";
    StatusLancamento["PAGO"] = "PAGO";
    StatusLancamento["CANCELADO"] = "CANCELADO";
})(StatusLancamento || (exports.StatusLancamento = StatusLancamento = {}));
let Lancamento = class Lancamento {
};
exports.Lancamento = Lancamento;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Lancamento.prototype, "idLancamento", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255 }),
    __metadata("design:type", String)
], Lancamento.prototype, "descricao", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: tipo_lancamento_enum_1.TipoLancamento }),
    __metadata("design:type", String)
], Lancamento.prototype, "tipo", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 15, scale: 2 }),
    __metadata("design:type", Number)
], Lancamento.prototype, "valorTotal", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 1 }),
    __metadata("design:type", Number)
], Lancamento.prototype, "totalParcelas", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", Date)
], Lancamento.prototype, "dataCompetencia", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Date)
], Lancamento.prototype, "dataEmissao", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, nullable: true }),
    __metadata("design:type", String)
], Lancamento.prototype, "numeroDocumento", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: StatusLancamento, default: StatusLancamento.PENDENTE }),
    __metadata("design:type", String)
], Lancamento.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], Lancamento.prototype, "idOrdemServico", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => ordemServico_entity_1.OrdemServico),
    (0, typeorm_1.JoinColumn)({ name: 'idOrdemServico' }),
    __metadata("design:type", ordemServico_entity_1.OrdemServico)
], Lancamento.prototype, "ordemServico", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], Lancamento.prototype, "idFatura", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => fatura_entity_1.Fatura),
    (0, typeorm_1.JoinColumn)({ name: 'idFatura' }),
    __metadata("design:type", fatura_entity_1.Fatura)
], Lancamento.prototype, "fatura", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], Lancamento.prototype, "idClienteFornecedor", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => empresa_entity_1.Empresa, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'idClienteFornecedor' }),
    __metadata("design:type", empresa_entity_1.Empresa)
], Lancamento.prototype, "clienteEmpresa", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], Lancamento.prototype, "idFornecedor", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => fornecedor_entity_1.Fornecedor, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'idFornecedor' }),
    __metadata("design:type", fornecedor_entity_1.Fornecedor)
], Lancamento.prototype, "fornecedor", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], Lancamento.prototype, "idCategoria", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => categoria_entity_1.Categoria, { eager: true }),
    (0, typeorm_1.JoinColumn)({ name: 'idCategoria' }),
    __metadata("design:type", categoria_entity_1.Categoria)
], Lancamento.prototype, "categoria", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Lancamento.prototype, "dataInclusao", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => parcela_entity_1.Parcela, parcela => parcela.lancamento, { cascade: true, eager: true }),
    __metadata("design:type", Array)
], Lancamento.prototype, "parcelas", void 0);
exports.Lancamento = Lancamento = __decorate([
    (0, typeorm_1.Entity)('TbFinanceiroLancamento')
], Lancamento);
//# sourceMappingURL=lancamento.entity.js.map
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
exports.OrdemServico = exports.StatusOrdemServico = void 0;
const typeorm_1 = require("typeorm");
const empresa_entity_1 = require("@hunter-solucoes/node-arqt-base-gerenciador-usuarios/dist/src/app/empresa/domain/empresa.entity");
const trabalho_entity_1 = require("../../trabalho/domain/trabalho.entity");
const ordemServicoItem_entity_1 = require("./ordemServicoItem.entity");
const fatura_entity_1 = require("../../financeiro/domain/fatura.entity");
var StatusOrdemServico;
(function (StatusOrdemServico) {
    StatusOrdemServico["PENDENTE"] = "PENDENTE";
    StatusOrdemServico["RECEBER"] = "RECEBER";
    StatusOrdemServico["EM_FATURA"] = "EM_FATURA";
    StatusOrdemServico["PAGO"] = "PAGO";
})(StatusOrdemServico || (exports.StatusOrdemServico = StatusOrdemServico = {}));
let OrdemServico = class OrdemServico {
};
exports.OrdemServico = OrdemServico;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], OrdemServico.prototype, "idOrdemServico", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: false }),
    __metadata("design:type", Number)
], OrdemServico.prototype, "idTrabalho", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], OrdemServico.prototype, "idFatura", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => fatura_entity_1.Fatura, (fatura) => fatura.ordensDeServico),
    (0, typeorm_1.JoinColumn)({ name: 'idFatura' }),
    __metadata("design:type", fatura_entity_1.Fatura)
], OrdemServico.prototype, "fatura", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: false }),
    __metadata("design:type", Number)
], OrdemServico.prototype, "idEmpresa", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: false }),
    __metadata("design:type", String)
], OrdemServico.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', nullable: false }),
    __metadata("design:type", Number)
], OrdemServico.prototype, "valorTotal", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "boolean", default: true, select: false }),
    __metadata("design:type", Boolean)
], OrdemServico.prototype, "concluido", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'datetime', nullable: true }),
    __metadata("design:type", Date)
], OrdemServico.prototype, "dataConcluido", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "boolean", default: true, select: false }),
    __metadata("design:type", Boolean)
], OrdemServico.prototype, "ativo", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: false, select: false }),
    __metadata("design:type", Number)
], OrdemServico.prototype, "idUsuarioCadastro", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    (0, typeorm_1.Column)({ select: false }),
    __metadata("design:type", Date)
], OrdemServico.prototype, "dataInclusao", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    (0, typeorm_1.Column)({ select: false }),
    __metadata("design:type", Date)
], OrdemServico.prototype, "dataAlteracao", void 0);
__decorate([
    (0, typeorm_1.DeleteDateColumn)(),
    (0, typeorm_1.Column)({ select: false }),
    __metadata("design:type", Date)
], OrdemServico.prototype, "dataExclusao", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(type => empresa_entity_1.Empresa, { eager: true }),
    (0, typeorm_1.JoinColumn)({ name: 'idEmpresa' }),
    __metadata("design:type", empresa_entity_1.Empresa)
], OrdemServico.prototype, "empresa", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(type => trabalho_entity_1.Trabalho, { eager: true }),
    (0, typeorm_1.JoinColumn)({ name: 'idTrabalho' }),
    __metadata("design:type", trabalho_entity_1.Trabalho)
], OrdemServico.prototype, "trabalho", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => ordemServicoItem_entity_1.OrdemServicoItem, (item) => item.ordemServico, { eager: true, cascade: true, orphanedRowAction: 'delete' }),
    __metadata("design:type", Array)
], OrdemServico.prototype, "itens", void 0);
exports.OrdemServico = OrdemServico = __decorate([
    (0, typeorm_1.Entity)('TbOrdemServico')
], OrdemServico);
//# sourceMappingURL=ordemServico.entity.js.map
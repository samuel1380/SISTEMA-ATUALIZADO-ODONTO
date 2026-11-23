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
exports.Estoque = void 0;
const empresa_entity_1 = require("@hunter-solucoes/node-arqt-base-gerenciador-usuarios/dist/src/app/empresa/domain/empresa.entity");
const typeorm_1 = require("typeorm");
const almoxarifado_entity_1 = require("../../almoxarifado/domain/almoxarifado.entity");
const estoque_historico_consumo_entity_1 = require("./estoque-historico-consumo.entity");
const componente_entity_1 = require("../../../componente/domain/componente.entity");
let Estoque = class Estoque {
};
exports.Estoque = Estoque;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Estoque.prototype, "idEstoque", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: false }),
    __metadata("design:type", String)
], Estoque.prototype, "nome", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Estoque.prototype, "descricao", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: false }),
    __metadata("design:type", Number)
], Estoque.prototype, "quantidade", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], Estoque.prototype, "idEmpresa", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'idComponente', type: 'int' }),
    __metadata("design:type", Number)
], Estoque.prototype, "idComponente", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: false }),
    __metadata("design:type", Number)
], Estoque.prototype, "idAlmoxarifado", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => empresa_entity_1.Empresa, { eager: true }),
    (0, typeorm_1.JoinColumn)({ name: 'idEmpresa' }),
    __metadata("design:type", empresa_entity_1.Empresa)
], Estoque.prototype, "empresa", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => componente_entity_1.Componente, { eager: true }),
    (0, typeorm_1.JoinColumn)({ name: 'idComponente' }),
    __metadata("design:type", componente_entity_1.Componente)
], Estoque.prototype, "componente", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => almoxarifado_entity_1.Almoxarifado, (almoxarifado) => almoxarifado.estoques, { eager: true }),
    (0, typeorm_1.JoinColumn)({ name: 'idAlmoxarifado' }),
    __metadata("design:type", almoxarifado_entity_1.Almoxarifado)
], Estoque.prototype, "almoxarifado", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => estoque_historico_consumo_entity_1.EstoqueHistoricoConsumo, (historico) => historico.estoque),
    __metadata("design:type", Array)
], Estoque.prototype, "historicosConsumo", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Estoque.prototype, "dataInclusao", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Estoque.prototype, "dataAlteracao", void 0);
__decorate([
    (0, typeorm_1.DeleteDateColumn)(),
    __metadata("design:type", Date)
], Estoque.prototype, "dataExclusao", void 0);
exports.Estoque = Estoque = __decorate([
    (0, typeorm_1.Entity)('TbEstoque')
], Estoque);
//# sourceMappingURL=estoque.entity.js.map
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
exports.Almoxarifado = void 0;
const typeorm_1 = require("typeorm");
const estoque_entity_1 = require("../../estoque/domain/estoque.entity");
const empresa_entity_1 = require("@hunter-solucoes/node-arqt-base-gerenciador-usuarios/dist/src/app/empresa/domain/empresa.entity");
let Almoxarifado = class Almoxarifado {
};
exports.Almoxarifado = Almoxarifado;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Almoxarifado.prototype, "idAlmoxarifado", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: false }),
    __metadata("design:type", String)
], Almoxarifado.prototype, "nome", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Almoxarifado.prototype, "descricao", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => estoque_entity_1.Estoque, (estoque) => estoque.almoxarifado),
    __metadata("design:type", Array)
], Almoxarifado.prototype, "estoques", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: false }),
    __metadata("design:type", Number)
], Almoxarifado.prototype, "idEmpresa", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Almoxarifado.prototype, "dataInclusao", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Almoxarifado.prototype, "dataAlteracao", void 0);
__decorate([
    (0, typeorm_1.DeleteDateColumn)(),
    __metadata("design:type", Date)
], Almoxarifado.prototype, "dataExclusao", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => empresa_entity_1.Empresa, { eager: true }),
    (0, typeorm_1.JoinColumn)({ name: 'idEmpresa' }),
    __metadata("design:type", empresa_entity_1.Empresa)
], Almoxarifado.prototype, "empresa", void 0);
exports.Almoxarifado = Almoxarifado = __decorate([
    (0, typeorm_1.Entity)('TbAlmoxarifado')
], Almoxarifado);
//# sourceMappingURL=almoxarifado.entity.js.map
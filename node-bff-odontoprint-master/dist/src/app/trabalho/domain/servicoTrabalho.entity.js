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
exports.ServicoTrabalho = void 0;
const typeorm_1 = require("typeorm");
const trabalho_entity_1 = require("./trabalho.entity");
const elementosTrabalho_entity_1 = require("./elementosTrabalho.entity");
let ServicoTrabalho = class ServicoTrabalho {
};
exports.ServicoTrabalho = ServicoTrabalho;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], ServicoTrabalho.prototype, "idServicoTrabalho", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: false }),
    __metadata("design:type", Number)
], ServicoTrabalho.prototype, "idProduto", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: false }),
    __metadata("design:type", Number)
], ServicoTrabalho.prototype, "idTrabalho", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "boolean", default: true }),
    __metadata("design:type", Boolean)
], ServicoTrabalho.prototype, "ativo", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'dataInclusao', type: 'datetime' }),
    __metadata("design:type", Date)
], ServicoTrabalho.prototype, "dataInclusao", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'dataAlteracao', type: 'datetime', nullable: true }),
    __metadata("design:type", Date)
], ServicoTrabalho.prototype, "dataAlteracao", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'dataExclusao', type: 'datetime', nullable: true }),
    __metadata("design:type", Date)
], ServicoTrabalho.prototype, "dataExclusao", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => trabalho_entity_1.Trabalho, (trabalho) => trabalho.servicos, { orphanedRowAction: 'delete' }),
    (0, typeorm_1.JoinColumn)({ name: 'idTrabalho' }),
    __metadata("design:type", trabalho_entity_1.Trabalho)
], ServicoTrabalho.prototype, "trabalho", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => elementosTrabalho_entity_1.ElementosTrabalho, {
        cascade: true,
        eager: true
    }),
    (0, typeorm_1.JoinTable)({
        name: 'TbServicoTrabalhoTbElementosTrabalho',
        joinColumn: { name: "idServicoTrabalho", referencedColumnName: "idServicoTrabalho", foreignKeyConstraintName: "TbServicoTrabalhoTbElementosTrabalho_ibfk_1", },
        inverseJoinColumn: { name: "idElementoTrabalho", referencedColumnName: "idElementoTrabalho" }
    }),
    __metadata("design:type", Array)
], ServicoTrabalho.prototype, "elementos", void 0);
exports.ServicoTrabalho = ServicoTrabalho = __decorate([
    (0, typeorm_1.Entity)('TbServicoTrabalho')
], ServicoTrabalho);
//# sourceMappingURL=servicoTrabalho.entity.js.map
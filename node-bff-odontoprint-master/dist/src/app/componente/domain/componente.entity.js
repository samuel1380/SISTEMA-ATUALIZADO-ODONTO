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
exports.Componente = void 0;
const typeorm_1 = require("typeorm");
const componenteEmpresa_entity_1 = require("../../componenteEmpresa/domain/componenteEmpresa.entity");
const trabalho_entity_1 = require("../../trabalho/domain/trabalho.entity");
const marcaComponente_entity_1 = require("../../marcaComponente/domain/marcaComponente.entity");
let Componente = class Componente {
};
exports.Componente = Componente;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Componente.prototype, "idComponente", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: false }),
    __metadata("design:type", Number)
], Componente.prototype, "idMarcaComponente", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: false }),
    __metadata("design:type", String)
], Componente.prototype, "nome", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', nullable: false }),
    __metadata("design:type", Number)
], Componente.prototype, "preco", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Componente.prototype, "hasParafuso", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "boolean", default: true, select: false }),
    __metadata("design:type", Number)
], Componente.prototype, "ativo", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: false, select: false }),
    __metadata("design:type", Number)
], Componente.prototype, "idUsuarioCadastro", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    (0, typeorm_1.Column)({ select: false }),
    __metadata("design:type", Date)
], Componente.prototype, "dataInclusao", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    (0, typeorm_1.Column)({ select: false }),
    __metadata("design:type", Date)
], Componente.prototype, "dataAlteracao", void 0);
__decorate([
    (0, typeorm_1.DeleteDateColumn)(),
    (0, typeorm_1.Column)({ select: false }),
    __metadata("design:type", Date)
], Componente.prototype, "dataExclusao", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(type => componenteEmpresa_entity_1.ComponenteEmpresa, (componenteEmpresa) => componenteEmpresa.componente),
    __metadata("design:type", Array)
], Componente.prototype, "componenteEmpresa", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(type => trabalho_entity_1.Trabalho),
    (0, typeorm_1.JoinTable)({
        name: 'TbComponentesTbTrabalho',
        joinColumn: {
            name: "idComponente",
            referencedColumnName: "idComponente"
        },
        inverseJoinColumn: {
            name: "idTrabalho",
            referencedColumnName: "idTrabalho"
        }
    }),
    __metadata("design:type", Array)
], Componente.prototype, "trabalho", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(type => marcaComponente_entity_1.MarcaComponente, { eager: true }),
    (0, typeorm_1.JoinColumn)({ name: 'idMarcaComponente' }),
    __metadata("design:type", marcaComponente_entity_1.MarcaComponente)
], Componente.prototype, "marca", void 0);
exports.Componente = Componente = __decorate([
    (0, typeorm_1.Entity)('TbComponente')
], Componente);
//# sourceMappingURL=componente.entity.js.map
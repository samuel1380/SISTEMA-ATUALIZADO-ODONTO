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
exports.ComponentesTrabalho = void 0;
const typeorm_1 = require("typeorm");
const trabalho_entity_1 = require("./trabalho.entity");
const componente_entity_1 = require("../../componente/domain/componente.entity");
let ComponentesTrabalho = class ComponentesTrabalho {
};
exports.ComponentesTrabalho = ComponentesTrabalho;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], ComponentesTrabalho.prototype, "idComponenteTrabalho", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: false }),
    __metadata("design:type", Number)
], ComponentesTrabalho.prototype, "qtdItems", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: false }),
    __metadata("design:type", Number)
], ComponentesTrabalho.prototype, "idTrabalho", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: false }),
    __metadata("design:type", Number)
], ComponentesTrabalho.prototype, "idComponente", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "boolean", default: true }),
    __metadata("design:type", Number)
], ComponentesTrabalho.prototype, "ativo", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], ComponentesTrabalho.prototype, "dataInclusao", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], ComponentesTrabalho.prototype, "dataAlteracao", void 0);
__decorate([
    (0, typeorm_1.DeleteDateColumn)(),
    __metadata("design:type", Date)
], ComponentesTrabalho.prototype, "dataExclusao", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(type => componente_entity_1.Componente, { eager: true }),
    (0, typeorm_1.JoinColumn)({ name: 'idComponente' }),
    __metadata("design:type", componente_entity_1.Componente)
], ComponentesTrabalho.prototype, "componente", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(type => trabalho_entity_1.Trabalho, (trabalho) => trabalho.componentes),
    (0, typeorm_1.JoinColumn)({ name: 'idTrabalho' }),
    __metadata("design:type", trabalho_entity_1.Trabalho)
], ComponentesTrabalho.prototype, "trabalho", void 0);
exports.ComponentesTrabalho = ComponentesTrabalho = __decorate([
    (0, typeorm_1.Entity)('TbComponentesTrabalhoTbTrabalho')
], ComponentesTrabalho);
//# sourceMappingURL=componentesTrabalho.entity.js.map
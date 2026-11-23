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
exports.ComponenteEmpresa = void 0;
const typeorm_1 = require("typeorm");
const cadastroComplementarEmpresa_entity_1 = require("../../cadastroComplementarEmpresa/domain/cadastroComplementarEmpresa.entity");
const componente_entity_1 = require("../../componente/domain/componente.entity");
let ComponenteEmpresa = class ComponenteEmpresa {
};
exports.ComponenteEmpresa = ComponenteEmpresa;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], ComponenteEmpresa.prototype, "idComponenteEmpresa", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: false }),
    __metadata("design:type", Number)
], ComponenteEmpresa.prototype, "idComponente", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: false }),
    __metadata("design:type", Number)
], ComponenteEmpresa.prototype, "idEmpresa", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "boolean", default: true }),
    __metadata("design:type", Number)
], ComponenteEmpresa.prototype, "ativo", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: false }),
    __metadata("design:type", Number)
], ComponenteEmpresa.prototype, "idUsuarioCadastro", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], ComponenteEmpresa.prototype, "dataInclusao", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], ComponenteEmpresa.prototype, "dataAlteracao", void 0);
__decorate([
    (0, typeorm_1.DeleteDateColumn)(),
    __metadata("design:type", Date)
], ComponenteEmpresa.prototype, "dataExclusao", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(type => cadastroComplementarEmpresa_entity_1.CadastroComplementarEmpresa, (cadastroComplementarEmpresa) => cadastroComplementarEmpresa.produtosEmpresa),
    (0, typeorm_1.JoinColumn)({ name: 'idEmpresa' }),
    __metadata("design:type", cadastroComplementarEmpresa_entity_1.CadastroComplementarEmpresa)
], ComponenteEmpresa.prototype, "cadastroComplementarEmpresa", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(type => componente_entity_1.Componente, (componente) => componente.componenteEmpresa, { eager: true }),
    (0, typeorm_1.JoinColumn)({ name: 'idComponente' }),
    __metadata("design:type", componente_entity_1.Componente)
], ComponenteEmpresa.prototype, "componente", void 0);
exports.ComponenteEmpresa = ComponenteEmpresa = __decorate([
    (0, typeorm_1.Entity)('TbComponenteEmpresa')
], ComponenteEmpresa);
//# sourceMappingURL=componenteEmpresa.entity.js.map
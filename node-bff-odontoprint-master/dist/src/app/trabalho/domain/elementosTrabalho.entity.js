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
exports.ElementosTrabalho = void 0;
const typeorm_1 = require("typeorm");
const servicoTrabalho_entity_1 = require("./servicoTrabalho.entity");
let ElementosTrabalho = class ElementosTrabalho {
};
exports.ElementosTrabalho = ElementosTrabalho;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], ElementosTrabalho.prototype, "idElementoTrabalho", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: false }),
    __metadata("design:type", String)
], ElementosTrabalho.prototype, "nome", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "boolean", default: true }),
    __metadata("design:type", Number)
], ElementosTrabalho.prototype, "ativo", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: false }),
    __metadata("design:type", Number)
], ElementosTrabalho.prototype, "idUsuarioCadastro", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], ElementosTrabalho.prototype, "dataInclusao", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], ElementosTrabalho.prototype, "dataAlteracao", void 0);
__decorate([
    (0, typeorm_1.DeleteDateColumn)(),
    __metadata("design:type", Date)
], ElementosTrabalho.prototype, "dataExclusao", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(type => servicoTrabalho_entity_1.ServicoTrabalho, { orphanedRowAction: 'delete' }),
    (0, typeorm_1.JoinTable)({
        name: 'TbServicoTrabalhoTbElementosTrabalho',
        joinColumn: {
            name: "idElementoTrabalho",
            referencedColumnName: "idElementoTrabalho"
        },
        inverseJoinColumn: {
            name: "idServicoTrabalho",
            referencedColumnName: "idServicoTrabalho"
        }
    }),
    __metadata("design:type", Array)
], ElementosTrabalho.prototype, "trabalho", void 0);
exports.ElementosTrabalho = ElementosTrabalho = __decorate([
    (0, typeorm_1.Entity)('TbElementosTrabalho')
], ElementosTrabalho);
//# sourceMappingURL=elementosTrabalho.entity.js.map
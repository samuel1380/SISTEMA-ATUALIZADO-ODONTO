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
exports.HistoricoStatusTrabalho = void 0;
const typeorm_1 = require("typeorm");
const trabalho_entity_1 = require("../../trabalho/domain/trabalho.entity");
let HistoricoStatusTrabalho = class HistoricoStatusTrabalho {
};
exports.HistoricoStatusTrabalho = HistoricoStatusTrabalho;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], HistoricoStatusTrabalho.prototype, "idHistoricoStatusTrabalho", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: false }),
    __metadata("design:type", String)
], HistoricoStatusTrabalho.prototype, "nome", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: false }),
    __metadata("design:type", Number)
], HistoricoStatusTrabalho.prototype, "idTrabalho", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: false }),
    __metadata("design:type", String)
], HistoricoStatusTrabalho.prototype, "statusAterior", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: false }),
    __metadata("design:type", String)
], HistoricoStatusTrabalho.prototype, "statusAtual", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "boolean", default: true, select: false }),
    __metadata("design:type", Number)
], HistoricoStatusTrabalho.prototype, "ativo", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: false, select: false }),
    __metadata("design:type", Number)
], HistoricoStatusTrabalho.prototype, "idUsuarioCadastro", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    (0, typeorm_1.Column)({ select: false }),
    __metadata("design:type", Date)
], HistoricoStatusTrabalho.prototype, "dataInclusao", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    (0, typeorm_1.Column)({ select: false }),
    __metadata("design:type", Date)
], HistoricoStatusTrabalho.prototype, "dataAlteracao", void 0);
__decorate([
    (0, typeorm_1.DeleteDateColumn)(),
    (0, typeorm_1.Column)({ select: false }),
    __metadata("design:type", Date)
], HistoricoStatusTrabalho.prototype, "dataExclusao", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(type => trabalho_entity_1.Trabalho, (componente) => componente.historicoStatusTrabalho),
    (0, typeorm_1.JoinColumn)({ name: 'idTrabalho' }),
    __metadata("design:type", trabalho_entity_1.Trabalho)
], HistoricoStatusTrabalho.prototype, "trabalho", void 0);
exports.HistoricoStatusTrabalho = HistoricoStatusTrabalho = __decorate([
    (0, typeorm_1.Entity)('TbHistoricoStatusTrabalho')
], HistoricoStatusTrabalho);
//# sourceMappingURL=historicoStatusTrabalho.entity.js.map
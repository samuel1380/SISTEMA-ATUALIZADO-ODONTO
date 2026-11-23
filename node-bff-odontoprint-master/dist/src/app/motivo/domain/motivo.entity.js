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
exports.Motivo = void 0;
const typeorm_1 = require("typeorm");
const motivo_dto_1 = require("../dto/motivo.dto");
let Motivo = class Motivo {
};
exports.Motivo = Motivo;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Motivo.prototype, "idMotivo", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: false }),
    __metadata("design:type", String)
], Motivo.prototype, "nome", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20, nullable: false }),
    __metadata("design:type", String)
], Motivo.prototype, "tipo", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: true, select: false }),
    __metadata("design:type", Number)
], Motivo.prototype, "ativo", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: false, select: false }),
    __metadata("design:type", Number)
], Motivo.prototype, "idUsuarioCadastro", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    (0, typeorm_1.Column)({ select: false }),
    __metadata("design:type", Date)
], Motivo.prototype, "dataInclusao", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    (0, typeorm_1.Column)({ select: false }),
    __metadata("design:type", Date)
], Motivo.prototype, "dataAlteracao", void 0);
__decorate([
    (0, typeorm_1.DeleteDateColumn)(),
    (0, typeorm_1.Column)({ select: false }),
    __metadata("design:type", Date)
], Motivo.prototype, "dataExclusao", void 0);
exports.Motivo = Motivo = __decorate([
    (0, typeorm_1.Entity)('TbMotivo')
], Motivo);
//# sourceMappingURL=motivo.entity.js.map
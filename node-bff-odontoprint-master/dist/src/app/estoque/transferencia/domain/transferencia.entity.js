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
exports.Transferencia = void 0;
const typeorm_1 = require("typeorm");
const almoxarifado_entity_1 = require("../../almoxarifado/domain/almoxarifado.entity");
const componente_entity_1 = require("../../../componente/domain/componente.entity");
let Transferencia = class Transferencia {
};
exports.Transferencia = Transferencia;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Transferencia.prototype, "idTransferencia", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], Transferencia.prototype, "idAlmoxarifadoOrigem", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Transferencia.prototype, "idAlmoxarifadoDestino", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Transferencia.prototype, "idComponente", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], Transferencia.prototype, "quantidade", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Transferencia.prototype, "baixado", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => almoxarifado_entity_1.Almoxarifado, { eager: true }),
    (0, typeorm_1.JoinColumn)({ name: 'idAlmoxarifadoOrigem', referencedColumnName: 'idAlmoxarifado' }),
    __metadata("design:type", almoxarifado_entity_1.Almoxarifado)
], Transferencia.prototype, "almoxarifadoOrigem", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => almoxarifado_entity_1.Almoxarifado, { eager: true }),
    (0, typeorm_1.JoinColumn)({ name: 'idAlmoxarifadoDestino', referencedColumnName: 'idAlmoxarifado' }),
    __metadata("design:type", almoxarifado_entity_1.Almoxarifado)
], Transferencia.prototype, "almoxarifadoDestino", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => componente_entity_1.Componente, { eager: true }),
    (0, typeorm_1.JoinColumn)({ name: 'idComponente' }),
    __metadata("design:type", componente_entity_1.Componente)
], Transferencia.prototype, "componente", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Transferencia.prototype, "dataTransferencia", void 0);
exports.Transferencia = Transferencia = __decorate([
    (0, typeorm_1.Entity)('TbTransferencia')
], Transferencia);
//# sourceMappingURL=transferencia.entity.js.map
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
exports.LogAuditoria = void 0;
const typeorm_1 = require("typeorm");
let LogAuditoria = class LogAuditoria {
};
exports.LogAuditoria = LogAuditoria;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], LogAuditoria.prototype, "idLog", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'datetime' }),
    __metadata("design:type", Date)
], LogAuditoria.prototype, "dataHora", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], LogAuditoria.prototype, "idUsuario", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], LogAuditoria.prototype, "nomeUsuario", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], LogAuditoria.prototype, "emailUsuario", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, default: 'ACAO' }),
    __metadata("design:type", String)
], LogAuditoria.prototype, "acao", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, default: 'GERAL' }),
    __metadata("design:type", String)
], LogAuditoria.prototype, "modulo", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, default: 'Sistema' }),
    __metadata("design:type", String)
], LogAuditoria.prototype, "entidade", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], LogAuditoria.prototype, "idRegistro", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], LogAuditoria.prototype, "resumo", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 10, nullable: true }),
    __metadata("design:type", String)
], LogAuditoria.prototype, "metodoHttp", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], LogAuditoria.prototype, "rota", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], LogAuditoria.prototype, "ip", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'longtext', nullable: true }),
    __metadata("design:type", String)
], LogAuditoria.prototype, "dadosAnteriores", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'longtext', nullable: true }),
    __metadata("design:type", String)
], LogAuditoria.prototype, "dadosNovos", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'longtext', nullable: true }),
    __metadata("design:type", String)
], LogAuditoria.prototype, "camposAlterados", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true, default: 200 }),
    __metadata("design:type", Number)
], LogAuditoria.prototype, "statusHttp", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], LogAuditoria.prototype, "idRequisicao", void 0);
exports.LogAuditoria = LogAuditoria = __decorate([
    (0, typeorm_1.Entity)('TbLogAuditoria')
], LogAuditoria);
//# sourceMappingURL=log-auditoria.entity.js.map
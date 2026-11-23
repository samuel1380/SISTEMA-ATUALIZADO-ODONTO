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
exports.ArquivoOfx = void 0;
const typeorm_1 = require("typeorm");
const conta_entity_1 = require("./conta.entity");
const transacao_ofx_entity_1 = require("./transacao-ofx.entity");
let ArquivoOfx = class ArquivoOfx {
};
exports.ArquivoOfx = ArquivoOfx;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], ArquivoOfx.prototype, "idArquivoOfx", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], ArquivoOfx.prototype, "idConta", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => conta_entity_1.Conta),
    (0, typeorm_1.JoinColumn)({ name: 'idConta' }),
    __metadata("design:type", conta_entity_1.Conta)
], ArquivoOfx.prototype, "conta", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255 }),
    __metadata("design:type", String)
], ArquivoOfx.prototype, "nomeArquivo", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], ArquivoOfx.prototype, "dataImportacao", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", Date)
], ArquivoOfx.prototype, "dataInicio", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", Date)
], ArquivoOfx.prototype, "dataFim", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 15, scale: 2 }),
    __metadata("design:type", Number)
], ArquivoOfx.prototype, "saldoInicial", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 15, scale: 2 }),
    __metadata("design:type", Number)
], ArquivoOfx.prototype, "saldoFinal", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], ArquivoOfx.prototype, "totalTransacoes", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], ArquivoOfx.prototype, "idUsuarioImportacao", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => transacao_ofx_entity_1.TransacaoOfx, (transacao) => transacao.arquivoOfx),
    __metadata("design:type", Array)
], ArquivoOfx.prototype, "transacoes", void 0);
exports.ArquivoOfx = ArquivoOfx = __decorate([
    (0, typeorm_1.Entity)('TbArquivoOfx')
], ArquivoOfx);
//# sourceMappingURL=arquivo-ofx.entity.js.map
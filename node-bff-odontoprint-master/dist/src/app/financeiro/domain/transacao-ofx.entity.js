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
exports.TransacaoOfx = exports.StatusConciliacao = exports.TipoTransacaoOfx = void 0;
const typeorm_1 = require("typeorm");
const conta_entity_1 = require("./conta.entity");
const arquivo_ofx_entity_1 = require("./arquivo-ofx.entity");
const conciliacao_transacao_entity_1 = require("./conciliacao-transacao.entity");
var TipoTransacaoOfx;
(function (TipoTransacaoOfx) {
    TipoTransacaoOfx["CREDITO"] = "CREDITO";
    TipoTransacaoOfx["DEBITO"] = "DEBITO";
})(TipoTransacaoOfx || (exports.TipoTransacaoOfx = TipoTransacaoOfx = {}));
var StatusConciliacao;
(function (StatusConciliacao) {
    StatusConciliacao["PENDENTE"] = "PENDENTE";
    StatusConciliacao["CONCILIADO"] = "CONCILIADO";
    StatusConciliacao["IGNORADO"] = "IGNORADO";
})(StatusConciliacao || (exports.StatusConciliacao = StatusConciliacao = {}));
let TransacaoOfx = class TransacaoOfx {
};
exports.TransacaoOfx = TransacaoOfx;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], TransacaoOfx.prototype, "idTransacaoOfx", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], TransacaoOfx.prototype, "idConta", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => conta_entity_1.Conta),
    (0, typeorm_1.JoinColumn)({ name: 'idConta' }),
    __metadata("design:type", conta_entity_1.Conta)
], TransacaoOfx.prototype, "conta", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], TransacaoOfx.prototype, "idArquivoOfx", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => arquivo_ofx_entity_1.ArquivoOfx, (arquivo) => arquivo.transacoes),
    (0, typeorm_1.JoinColumn)({ name: 'idArquivoOfx' }),
    __metadata("design:type", arquivo_ofx_entity_1.ArquivoOfx)
], TransacaoOfx.prototype, "arquivoOfx", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100 }),
    __metadata("design:type", String)
], TransacaoOfx.prototype, "fitId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: TipoTransacaoOfx }),
    __metadata("design:type", String)
], TransacaoOfx.prototype, "tipo", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 15, scale: 2 }),
    __metadata("design:type", Number)
], TransacaoOfx.prototype, "valor", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", Date)
], TransacaoOfx.prototype, "dataTransacao", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Date)
], TransacaoOfx.prototype, "dataPostagem", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], TransacaoOfx.prototype, "descricao", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50, nullable: true }),
    __metadata("design:type", String)
], TransacaoOfx.prototype, "numeroCheque", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: StatusConciliacao, default: StatusConciliacao.PENDENTE }),
    __metadata("design:type", String)
], TransacaoOfx.prototype, "statusConciliacao", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'datetime', nullable: true }),
    __metadata("design:type", Date)
], TransacaoOfx.prototype, "dataConciliacao", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], TransacaoOfx.prototype, "observacoes", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => conciliacao_transacao_entity_1.ConciliacaoTransacao, (conciliacao) => conciliacao.transacaoOfx),
    __metadata("design:type", conciliacao_transacao_entity_1.ConciliacaoTransacao)
], TransacaoOfx.prototype, "conciliacao", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], TransacaoOfx.prototype, "dataInclusao", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], TransacaoOfx.prototype, "dataAlteracao", void 0);
exports.TransacaoOfx = TransacaoOfx = __decorate([
    (0, typeorm_1.Entity)('TbTransacaoOfx')
], TransacaoOfx);
//# sourceMappingURL=transacao-ofx.entity.js.map
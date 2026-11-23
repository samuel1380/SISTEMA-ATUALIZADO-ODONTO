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
exports.LancamentoRecorrente = exports.Periodicidade = void 0;
const typeorm_1 = require("typeorm");
const tipo_lancamento_enum_1 = require("./tipo-lancamento.enum");
var Periodicidade;
(function (Periodicidade) {
    Periodicidade["MENSAL"] = "MENSAL";
    Periodicidade["ANUAL"] = "ANUAL";
})(Periodicidade || (exports.Periodicidade = Periodicidade = {}));
let LancamentoRecorrente = class LancamentoRecorrente {
};
exports.LancamentoRecorrente = LancamentoRecorrente;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], LancamentoRecorrente.prototype, "idLancamentoRecorrente", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], LancamentoRecorrente.prototype, "descricao", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: tipo_lancamento_enum_1.TipoLancamento }),
    __metadata("design:type", String)
], LancamentoRecorrente.prototype, "tipo", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 15, scale: 2 }),
    __metadata("design:type", Number)
], LancamentoRecorrente.prototype, "valorEstimado", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], LancamentoRecorrente.prototype, "diaVencimento", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Date)
], LancamentoRecorrente.prototype, "dataEmissao", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: Periodicidade, default: Periodicidade.MENSAL }),
    __metadata("design:type", String)
], LancamentoRecorrente.prototype, "periodicidade", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], LancamentoRecorrente.prototype, "idClienteFornecedor", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], LancamentoRecorrente.prototype, "ativo", void 0);
exports.LancamentoRecorrente = LancamentoRecorrente = __decorate([
    (0, typeorm_1.Entity)('TbFinanceiroLancamentoRecorrente')
], LancamentoRecorrente);
//# sourceMappingURL=lancamento-recorrente.entity.js.map
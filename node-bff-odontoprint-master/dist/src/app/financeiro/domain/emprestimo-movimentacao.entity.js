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
exports.EmprestimoMovimentacao = exports.TipoEmprestimoMovimentacao = void 0;
const typeorm_1 = require("typeorm");
const emprestimo_entity_1 = require("./emprestimo.entity");
const lancamento_entity_1 = require("./lancamento.entity");
var TipoEmprestimoMovimentacao;
(function (TipoEmprestimoMovimentacao) {
    TipoEmprestimoMovimentacao["JUROS"] = "JUROS";
    TipoEmprestimoMovimentacao["PAGAMENTO"] = "PAGAMENTO";
    TipoEmprestimoMovimentacao["ACRESCIMO"] = "ACRESCIMO";
})(TipoEmprestimoMovimentacao || (exports.TipoEmprestimoMovimentacao = TipoEmprestimoMovimentacao = {}));
let EmprestimoMovimentacao = class EmprestimoMovimentacao {
};
exports.EmprestimoMovimentacao = EmprestimoMovimentacao;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], EmprestimoMovimentacao.prototype, "idMovimentacao", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], EmprestimoMovimentacao.prototype, "idEmprestimo", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => emprestimo_entity_1.Emprestimo, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'idEmprestimo' }),
    __metadata("design:type", emprestimo_entity_1.Emprestimo)
], EmprestimoMovimentacao.prototype, "emprestimo", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true, nullable: true }),
    __metadata("design:type", Number)
], EmprestimoMovimentacao.prototype, "idLancamento", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => lancamento_entity_1.Lancamento),
    (0, typeorm_1.JoinColumn)({ name: 'idLancamento' }),
    __metadata("design:type", lancamento_entity_1.Lancamento)
], EmprestimoMovimentacao.prototype, "lancamento", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 15, scale: 2 }),
    __metadata("design:type", Number)
], EmprestimoMovimentacao.prototype, "valor", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", Date)
], EmprestimoMovimentacao.prototype, "dataMovimentacao", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: TipoEmprestimoMovimentacao, default: TipoEmprestimoMovimentacao.PAGAMENTO }),
    __metadata("design:type", String)
], EmprestimoMovimentacao.prototype, "tipoMovimentacao", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], EmprestimoMovimentacao.prototype, "observacoes", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], EmprestimoMovimentacao.prototype, "dataInclusao", void 0);
exports.EmprestimoMovimentacao = EmprestimoMovimentacao = __decorate([
    (0, typeorm_1.Entity)('TbEmprestimoMovimentacao')
], EmprestimoMovimentacao);
//# sourceMappingURL=emprestimo-movimentacao.entity.js.map
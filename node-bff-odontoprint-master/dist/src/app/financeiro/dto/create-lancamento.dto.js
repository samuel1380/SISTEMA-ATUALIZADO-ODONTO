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
exports.CreateLancamentoDto = exports.ParcelaDto = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const parcela_entity_1 = require("../domain/parcela.entity");
const tipo_lancamento_enum_1 = require("../domain/tipo-lancamento.enum");
class PagamentoImediatoDto {
}
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Number)
], PagamentoImediatoDto.prototype, "idConta", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], PagamentoImediatoDto.prototype, "dataPagamento", void 0);
class ParcelaDto {
}
exports.ParcelaDto = ParcelaDto;
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], ParcelaDto.prototype, "numeroParcela", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0.01),
    __metadata("design:type", Number)
], ParcelaDto.prototype, "valor", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ParcelaDto.prototype, "dataVencimento", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(parcela_entity_1.MeioPagamento),
    __metadata("design:type", String)
], ParcelaDto.prototype, "meioPagamento", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], ParcelaDto.prototype, "dadosAdicionais", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], ParcelaDto.prototype, "gerarJuros", void 0);
class CreateLancamentoDto {
}
exports.CreateLancamentoDto = CreateLancamentoDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateLancamentoDto.prototype, "descricao", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(tipo_lancamento_enum_1.TipoLancamento),
    __metadata("design:type", String)
], CreateLancamentoDto.prototype, "tipo", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0.01),
    __metadata("design:type", Number)
], CreateLancamentoDto.prototype, "valorTotal", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateLancamentoDto.prototype, "dataCompetencia", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateLancamentoDto.prototype, "dataEmissao", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateLancamentoDto.prototype, "numeroDocumento", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateLancamentoDto.prototype, "idOrdemServico", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateLancamentoDto.prototype, "idFatura", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateLancamentoDto.prototype, "idClienteFornecedor", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateLancamentoDto.prototype, "idFornecedor", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateLancamentoDto.prototype, "idCategoria", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_validator_1.ArrayMinSize)(1),
    (0, class_transformer_1.Type)(() => ParcelaDto),
    __metadata("design:type", Array)
], CreateLancamentoDto.prototype, "parcelas", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => PagamentoImediatoDto),
    __metadata("design:type", PagamentoImediatoDto)
], CreateLancamentoDto.prototype, "pagamentoImediato", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CreateLancamentoDto.prototype, "idEmprestimo", void 0);
//# sourceMappingURL=create-lancamento.dto.js.map
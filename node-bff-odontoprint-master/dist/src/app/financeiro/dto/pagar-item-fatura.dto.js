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
exports.PagarItensFaturaDto = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const parcela_entity_1 = require("../domain/parcela.entity");
class ItemPagamentoDto {
}
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Number)
], ItemPagamentoDto.prototype, "idOrdemServicoItem", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0.01),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Number)
], ItemPagamentoDto.prototype, "valor", void 0);
class PagarItensFaturaDto {
}
exports.PagarItensFaturaDto = PagarItensFaturaDto;
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Number)
], PagarItensFaturaDto.prototype, "idFatura", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Number)
], PagarItensFaturaDto.prototype, "idConta", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], PagarItensFaturaDto.prototype, "dataPagamento", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(parcela_entity_1.MeioPagamento),
    __metadata("design:type", String)
], PagarItensFaturaDto.prototype, "meioPagamento", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => ItemPagamentoDto),
    __metadata("design:type", Array)
], PagarItensFaturaDto.prototype, "itens", void 0);
//# sourceMappingURL=pagar-item-fatura.dto.js.map
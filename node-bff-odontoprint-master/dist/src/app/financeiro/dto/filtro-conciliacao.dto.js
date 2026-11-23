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
exports.FiltroConciliacaoDto = void 0;
const class_validator_1 = require("class-validator");
const transacao_ofx_entity_1 = require("../domain/transacao-ofx.entity");
class FiltroConciliacaoDto {
}
exports.FiltroConciliacaoDto = FiltroConciliacaoDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], FiltroConciliacaoDto.prototype, "idConta", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FiltroConciliacaoDto.prototype, "dataInicio", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FiltroConciliacaoDto.prototype, "dataFim", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(transacao_ofx_entity_1.TipoTransacaoOfx),
    __metadata("design:type", String)
], FiltroConciliacaoDto.prototype, "tipo", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(transacao_ofx_entity_1.StatusConciliacao),
    __metadata("design:type", String)
], FiltroConciliacaoDto.prototype, "statusConciliacao", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], FiltroConciliacaoDto.prototype, "valorMin", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], FiltroConciliacaoDto.prototype, "valorMax", void 0);
//# sourceMappingURL=filtro-conciliacao.dto.js.map
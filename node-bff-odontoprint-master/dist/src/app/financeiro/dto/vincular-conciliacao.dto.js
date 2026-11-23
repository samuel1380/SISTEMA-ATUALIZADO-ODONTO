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
exports.VincularConciliacaoDto = void 0;
const class_validator_1 = require("class-validator");
const conciliacao_transacao_entity_1 = require("../domain/conciliacao-transacao.entity");
class VincularConciliacaoDto {
}
exports.VincularConciliacaoDto = VincularConciliacaoDto;
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Number)
], VincularConciliacaoDto.prototype, "idTransacaoOfx", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(conciliacao_transacao_entity_1.TipoVinculo),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], VincularConciliacaoDto.prototype, "tipoVinculo", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], VincularConciliacaoDto.prototype, "idMovimentacao", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], VincularConciliacaoDto.prototype, "idAporte", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], VincularConciliacaoDto.prototype, "idRetirada", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], VincularConciliacaoDto.prototype, "observacoes", void 0);
//# sourceMappingURL=vincular-conciliacao.dto.js.map
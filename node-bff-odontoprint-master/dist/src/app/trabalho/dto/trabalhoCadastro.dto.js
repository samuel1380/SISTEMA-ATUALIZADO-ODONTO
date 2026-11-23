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
exports.TrabalhoCadastroDto = exports.ServicoTrabalhoCadastroDto = void 0;
const class_validator_1 = require("class-validator");
const elementosTrabalho_dto_1 = require("./elementosTrabalho.dto");
const class_transformer_1 = require("class-transformer");
class ServicoTrabalhoCadastroDto {
}
exports.ServicoTrabalhoCadastroDto = ServicoTrabalhoCadastroDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ServicoTrabalhoCadastroDto.prototype, "idServicoTrabalho", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ServicoTrabalhoCadastroDto.prototype, "idProduto", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => elementosTrabalho_dto_1.ElementosTrabalhoDto),
    __metadata("design:type", Array)
], ServicoTrabalhoCadastroDto.prototype, "elementos", void 0);
class TrabalhoCadastroDto {
}
exports.TrabalhoCadastroDto = TrabalhoCadastroDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], TrabalhoCadastroDto.prototype, "idPaciente", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], TrabalhoCadastroDto.prototype, "idEmpresa", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], TrabalhoCadastroDto.prototype, "idProfissional", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => ServicoTrabalhoCadastroDto),
    __metadata("design:type", Array)
], TrabalhoCadastroDto.prototype, "servicos", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TrabalhoCadastroDto.prototype, "cor", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], TrabalhoCadastroDto.prototype, "componentes", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TrabalhoCadastroDto.prototype, "observacao", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TrabalhoCadastroDto.prototype, "anotacoes", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], TrabalhoCadastroDto.prototype, "retrabalho", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], TrabalhoCadastroDto.prototype, "bonificacao", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsNumber)({}, { each: true }),
    __metadata("design:type", Array)
], TrabalhoCadastroDto.prototype, "motivosRetrabalhoIds", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsNumber)({}, { each: true }),
    __metadata("design:type", Array)
], TrabalhoCadastroDto.prototype, "motivosBonificacaoIds", void 0);
//# sourceMappingURL=trabalhoCadastro.dto.js.map
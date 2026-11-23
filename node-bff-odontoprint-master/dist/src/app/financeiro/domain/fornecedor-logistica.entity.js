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
exports.FornecedorLogistica = exports.TipoFornecedorLogistica = void 0;
const typeorm_1 = require("typeorm");
var TipoFornecedorLogistica;
(function (TipoFornecedorLogistica) {
    TipoFornecedorLogistica["TRANSPORTADORA"] = "TRANSPORTADORA";
    TipoFornecedorLogistica["CORREIOS"] = "CORREIOS";
    TipoFornecedorLogistica["ENTREGA_RAPIDA"] = "ENTREGA_RAPIDA";
    TipoFornecedorLogistica["OUTRO"] = "OUTRO";
})(TipoFornecedorLogistica || (exports.TipoFornecedorLogistica = TipoFornecedorLogistica = {}));
let FornecedorLogistica = class FornecedorLogistica {
};
exports.FornecedorLogistica = FornecedorLogistica;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], FornecedorLogistica.prototype, "idFornecedorLogistica", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100 }),
    __metadata("design:type", String)
], FornecedorLogistica.prototype, "nome", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: TipoFornecedorLogistica }),
    __metadata("design:type", String)
], FornecedorLogistica.prototype, "tipo", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255, nullable: true }),
    __metadata("design:type", String)
], FornecedorLogistica.prototype, "contato", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, nullable: true }),
    __metadata("design:type", String)
], FornecedorLogistica.prototype, "telefone", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, nullable: true }),
    __metadata("design:type", String)
], FornecedorLogistica.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], FornecedorLogistica.prototype, "idEmpresa", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], FornecedorLogistica.prototype, "ativo", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], FornecedorLogistica.prototype, "dataInclusao", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], FornecedorLogistica.prototype, "dataAlteracao", void 0);
__decorate([
    (0, typeorm_1.DeleteDateColumn)(),
    __metadata("design:type", Date)
], FornecedorLogistica.prototype, "dataExclusao", void 0);
exports.FornecedorLogistica = FornecedorLogistica = __decorate([
    (0, typeorm_1.Entity)('TbFornecedorLogistica')
], FornecedorLogistica);
//# sourceMappingURL=fornecedor-logistica.entity.js.map
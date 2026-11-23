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
exports.Aporte = exports.TipoAporte = void 0;
const typeorm_1 = require("typeorm");
const lancamento_entity_1 = require("./lancamento.entity");
const socio_entity_1 = require("./socio.entity");
var TipoAporte;
(function (TipoAporte) {
    TipoAporte["APORTE_CAPITAL"] = "APORTE_CAPITAL";
    TipoAporte["DISTRIBUICAO_LUCROS"] = "DISTRIBUICAO_LUCROS";
})(TipoAporte || (exports.TipoAporte = TipoAporte = {}));
let Aporte = class Aporte {
};
exports.Aporte = Aporte;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Aporte.prototype, "idAporte", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Aporte.prototype, "idLancamento", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => lancamento_entity_1.Lancamento),
    (0, typeorm_1.JoinColumn)({ name: 'idLancamento' }),
    __metadata("design:type", lancamento_entity_1.Lancamento)
], Aporte.prototype, "lancamento", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], Aporte.prototype, "idSocio", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => socio_entity_1.Socio),
    (0, typeorm_1.JoinColumn)({ name: 'idSocio' }),
    __metadata("design:type", socio_entity_1.Socio)
], Aporte.prototype, "socio", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", Date)
], Aporte.prototype, "dataAporte", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 15, scale: 2 }),
    __metadata("design:type", Number)
], Aporte.prototype, "valor", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: TipoAporte }),
    __metadata("design:type", String)
], Aporte.prototype, "tipo", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Aporte.prototype, "observacoes", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Aporte.prototype, "dataInclusao", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Aporte.prototype, "dataAlteracao", void 0);
exports.Aporte = Aporte = __decorate([
    (0, typeorm_1.Entity)('TbAporte')
], Aporte);
//# sourceMappingURL=aporte.entity.js.map
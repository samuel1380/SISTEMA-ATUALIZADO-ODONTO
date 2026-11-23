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
exports.Entrega = exports.StatusEntrega = void 0;
const typeorm_1 = require("typeorm");
const fornecedor_logistica_entity_1 = require("./fornecedor-logistica.entity");
const lancamento_entity_1 = require("./lancamento.entity");
var StatusEntrega;
(function (StatusEntrega) {
    StatusEntrega["PENDENTE"] = "PENDENTE";
    StatusEntrega["EM_TRANSITO"] = "EM_TRANSITO";
    StatusEntrega["ENTREGUE"] = "ENTREGUE";
    StatusEntrega["CANCELADA"] = "CANCELADA";
})(StatusEntrega || (exports.StatusEntrega = StatusEntrega = {}));
let Entrega = class Entrega {
};
exports.Entrega = Entrega;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Entrega.prototype, "idEntrega", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], Entrega.prototype, "idLancamento", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => lancamento_entity_1.Lancamento, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'idLancamento' }),
    __metadata("design:type", lancamento_entity_1.Lancamento)
], Entrega.prototype, "lancamento", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Entrega.prototype, "idFornecedorLogistica", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => fornecedor_logistica_entity_1.FornecedorLogistica),
    (0, typeorm_1.JoinColumn)({ name: 'idFornecedorLogistica' }),
    __metadata("design:type", fornecedor_logistica_entity_1.FornecedorLogistica)
], Entrega.prototype, "fornecedorLogistica", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", Date)
], Entrega.prototype, "dataEntrega", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255 }),
    __metadata("design:type", String)
], Entrega.prototype, "origem", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255 }),
    __metadata("design:type", String)
], Entrega.prototype, "destino", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Entrega.prototype, "peso", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 15, scale: 2 }),
    __metadata("design:type", Number)
], Entrega.prototype, "valorFrete", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: StatusEntrega, default: StatusEntrega.PENDENTE }),
    __metadata("design:type", String)
], Entrega.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Entrega.prototype, "observacoes", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Entrega.prototype, "dataInclusao", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Entrega.prototype, "dataAlteracao", void 0);
exports.Entrega = Entrega = __decorate([
    (0, typeorm_1.Entity)('TbEntrega')
], Entrega);
//# sourceMappingURL=entrega.entity.js.map
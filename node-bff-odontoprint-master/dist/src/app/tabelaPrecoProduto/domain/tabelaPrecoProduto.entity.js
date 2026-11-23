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
exports.TabelaPrecoProduto = void 0;
const typeorm_1 = require("typeorm");
const precoProduto_entity_1 = require("./precoProduto.entity");
let TabelaPrecoProduto = class TabelaPrecoProduto {
};
exports.TabelaPrecoProduto = TabelaPrecoProduto;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], TabelaPrecoProduto.prototype, "idTabelaPrecoProduto", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: false }),
    __metadata("design:type", String)
], TabelaPrecoProduto.prototype, "nome", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "boolean", default: true }),
    __metadata("design:type", Number)
], TabelaPrecoProduto.prototype, "ativo", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], TabelaPrecoProduto.prototype, "idTabelaPrecoProdutoOrigem", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], TabelaPrecoProduto.prototype, "numeroVersao", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: false, select: false }),
    __metadata("design:type", Number)
], TabelaPrecoProduto.prototype, "idUsuarioCadastro", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    (0, typeorm_1.Column)({ select: false }),
    __metadata("design:type", Date)
], TabelaPrecoProduto.prototype, "dataInclusao", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    (0, typeorm_1.Column)({ select: false }),
    __metadata("design:type", Date)
], TabelaPrecoProduto.prototype, "dataAlteracao", void 0);
__decorate([
    (0, typeorm_1.DeleteDateColumn)(),
    (0, typeorm_1.Column)({ select: false }),
    __metadata("design:type", Date)
], TabelaPrecoProduto.prototype, "dataExclusao", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(type => precoProduto_entity_1.PrecoProduto, (itemPedido) => itemPedido.tabelaPrecoProduto, { eager: true, cascade: true }),
    __metadata("design:type", Array)
], TabelaPrecoProduto.prototype, "precoProduto", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => TabelaPrecoProduto, (tabela) => tabela.versoes, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'idTabelaPrecoProdutoOrigem' }),
    __metadata("design:type", TabelaPrecoProduto)
], TabelaPrecoProduto.prototype, "tabelaOrigem", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => TabelaPrecoProduto, (versao) => versao.tabelaOrigem),
    __metadata("design:type", Array)
], TabelaPrecoProduto.prototype, "versoes", void 0);
exports.TabelaPrecoProduto = TabelaPrecoProduto = __decorate([
    (0, typeorm_1.Entity)('TbTabelaPrecoProduto')
], TabelaPrecoProduto);
//# sourceMappingURL=tabelaPrecoProduto.entity.js.map
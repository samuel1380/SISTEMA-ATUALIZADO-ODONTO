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
exports.PrecoProduto = void 0;
const typeorm_1 = require("typeorm");
const tabelaPrecoProduto_entity_1 = require("./tabelaPrecoProduto.entity");
const produto_entity_1 = require("@hunter-solucoes/node-arqt-base-gerenciador-usuarios/dist/src/app/produto/domain/produto.entity");
let PrecoProduto = class PrecoProduto {
};
exports.PrecoProduto = PrecoProduto;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], PrecoProduto.prototype, "idPrecoProduto", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', nullable: false }),
    __metadata("design:type", Number)
], PrecoProduto.prototype, "preco", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: false }),
    __metadata("design:type", Number)
], PrecoProduto.prototype, "idProduto", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: false }),
    __metadata("design:type", String)
], PrecoProduto.prototype, "idTabelaPrecoProduto", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "boolean", default: true }),
    __metadata("design:type", Number)
], PrecoProduto.prototype, "ativo", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: false, select: false }),
    __metadata("design:type", Number)
], PrecoProduto.prototype, "idUsuarioCadastro", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    (0, typeorm_1.Column)({ select: false }),
    __metadata("design:type", Date)
], PrecoProduto.prototype, "dataInclusao", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    (0, typeorm_1.Column)({ select: false }),
    __metadata("design:type", Date)
], PrecoProduto.prototype, "dataAlteracao", void 0);
__decorate([
    (0, typeorm_1.DeleteDateColumn)(),
    (0, typeorm_1.Column)({ select: false }),
    __metadata("design:type", Date)
], PrecoProduto.prototype, "dataExclusao", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(type => produto_entity_1.Produto, { eager: true }),
    (0, typeorm_1.JoinColumn)({ name: 'idProduto' }),
    __metadata("design:type", produto_entity_1.Produto)
], PrecoProduto.prototype, "produto", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(type => tabelaPrecoProduto_entity_1.TabelaPrecoProduto, (tabelaPrecoProduto) => tabelaPrecoProduto.precoProduto, { orphanedRowAction: 'delete' }),
    (0, typeorm_1.JoinColumn)({ name: 'idTabelaPrecoProduto' }),
    __metadata("design:type", tabelaPrecoProduto_entity_1.TabelaPrecoProduto)
], PrecoProduto.prototype, "tabelaPrecoProduto", void 0);
exports.PrecoProduto = PrecoProduto = __decorate([
    (0, typeorm_1.Entity)('TbPrecoProduto')
], PrecoProduto);
//# sourceMappingURL=precoProduto.entity.js.map
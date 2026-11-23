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
exports.ProdutoEmpresa = void 0;
const produto_entity_1 = require("@hunter-solucoes/node-arqt-base-gerenciador-usuarios/dist/src/app/produto/domain/produto.entity");
const typeorm_1 = require("typeorm");
const cadastroComplementarEmpresa_entity_1 = require("../../cadastroComplementarEmpresa/domain/cadastroComplementarEmpresa.entity");
let ProdutoEmpresa = class ProdutoEmpresa {
};
exports.ProdutoEmpresa = ProdutoEmpresa;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], ProdutoEmpresa.prototype, "idProdutoEmpresa", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: false }),
    __metadata("design:type", Number)
], ProdutoEmpresa.prototype, "idProduto", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: false }),
    __metadata("design:type", Number)
], ProdutoEmpresa.prototype, "idEmpresa", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "boolean", default: true, select: false }),
    __metadata("design:type", Number)
], ProdutoEmpresa.prototype, "ativo", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: false, select: false }),
    __metadata("design:type", Number)
], ProdutoEmpresa.prototype, "idUsuarioCadastro", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ select: false }),
    __metadata("design:type", Date)
], ProdutoEmpresa.prototype, "dataInclusao", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ select: false }),
    __metadata("design:type", Date)
], ProdutoEmpresa.prototype, "dataAlteracao", void 0);
__decorate([
    (0, typeorm_1.DeleteDateColumn)({ select: false }),
    __metadata("design:type", Date)
], ProdutoEmpresa.prototype, "dataExclusao", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(type => cadastroComplementarEmpresa_entity_1.CadastroComplementarEmpresa, (cadastroComplementarEmpresa) => cadastroComplementarEmpresa.produtosEmpresa),
    (0, typeorm_1.JoinColumn)({ name: 'idEmpresa' }),
    __metadata("design:type", cadastroComplementarEmpresa_entity_1.CadastroComplementarEmpresa)
], ProdutoEmpresa.prototype, "cadastroComplementarEmpresa", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(type => produto_entity_1.Produto, { eager: true }),
    (0, typeorm_1.JoinColumn)({ name: 'idProduto' }),
    __metadata("design:type", produto_entity_1.Produto)
], ProdutoEmpresa.prototype, "produto", void 0);
exports.ProdutoEmpresa = ProdutoEmpresa = __decorate([
    (0, typeorm_1.Entity)('TbProdutoEmpresa')
], ProdutoEmpresa);
//# sourceMappingURL=produtosCategoriaEmpresa.entity.js.map
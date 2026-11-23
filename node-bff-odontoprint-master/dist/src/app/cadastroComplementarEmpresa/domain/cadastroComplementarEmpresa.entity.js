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
exports.CadastroComplementarEmpresa = void 0;
const typeorm_1 = require("typeorm");
const produtosCategoriaEmpresa_entity_1 = require("../../produtosEmpresa/domain/produtosCategoriaEmpresa.entity");
const componenteEmpresa_entity_1 = require("../../componenteEmpresa/domain/componenteEmpresa.entity");
const empresa_entity_1 = require("@hunter-solucoes/node-arqt-base-gerenciador-usuarios/dist/src/app/empresa/domain/empresa.entity");
const dentista_entity_1 = require("../../dentista/domain/dentista.entity");
const tabelaPrecoProduto_entity_1 = require("../../tabelaPrecoProduto/domain/tabelaPrecoProduto.entity");
let CadastroComplementarEmpresa = class CadastroComplementarEmpresa {
};
exports.CadastroComplementarEmpresa = CadastroComplementarEmpresa;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], CadastroComplementarEmpresa.prototype, "idCadastroComplementarEmpresa", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'float', nullable: true }),
    __metadata("design:type", Number)
], CadastroComplementarEmpresa.prototype, "porcentagemDesconto", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', nullable: true }),
    __metadata("design:type", Boolean)
], CadastroComplementarEmpresa.prototype, "utilizaInterfaces", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', nullable: true }),
    __metadata("design:type", Boolean)
], CadastroComplementarEmpresa.prototype, "scannerProprio", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], CadastroComplementarEmpresa.prototype, "diaPagamento", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], CadastroComplementarEmpresa.prototype, "tipoPagamento", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], CadastroComplementarEmpresa.prototype, "quantidadeParcelas", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: false }),
    __metadata("design:type", Number)
], CadastroComplementarEmpresa.prototype, "idTabelaPrecoProduto", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: false }),
    __metadata("design:type", Number)
], CadastroComplementarEmpresa.prototype, "idEmpresa", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "boolean", default: true, select: false }),
    __metadata("design:type", Number)
], CadastroComplementarEmpresa.prototype, "ativo", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: false, select: false }),
    __metadata("design:type", Number)
], CadastroComplementarEmpresa.prototype, "idUsuarioCadastro", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    (0, typeorm_1.Column)({ select: false }),
    __metadata("design:type", Date)
], CadastroComplementarEmpresa.prototype, "dataInclusao", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    (0, typeorm_1.Column)({ select: false }),
    __metadata("design:type", Date)
], CadastroComplementarEmpresa.prototype, "dataAlteracao", void 0);
__decorate([
    (0, typeorm_1.DeleteDateColumn)(),
    (0, typeorm_1.Column)({ select: false }),
    __metadata("design:type", Date)
], CadastroComplementarEmpresa.prototype, "dataExclusao", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(type => produtosCategoriaEmpresa_entity_1.ProdutoEmpresa, (produtoEmpresa) => produtoEmpresa.cadastroComplementarEmpresa, { eager: true }),
    __metadata("design:type", Array)
], CadastroComplementarEmpresa.prototype, "produtosEmpresa", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(type => componenteEmpresa_entity_1.ComponenteEmpresa, (componenteEmpresa) => componenteEmpresa.cadastroComplementarEmpresa, { eager: true }),
    __metadata("design:type", Array)
], CadastroComplementarEmpresa.prototype, "componenteEmpresa", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(type => dentista_entity_1.Dentista, (dentistaEmpresa) => dentistaEmpresa.cadastroComplementarEmpresa, { eager: true }),
    __metadata("design:type", Array)
], CadastroComplementarEmpresa.prototype, "dentistaEmpresa", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(type => empresa_entity_1.Empresa, { eager: true }),
    (0, typeorm_1.JoinColumn)({ name: 'idEmpresa' }),
    __metadata("design:type", empresa_entity_1.Empresa)
], CadastroComplementarEmpresa.prototype, "empresa", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(type => tabelaPrecoProduto_entity_1.TabelaPrecoProduto, { eager: true }),
    (0, typeorm_1.JoinColumn)({ name: 'idTabelaPrecoProduto' }),
    __metadata("design:type", tabelaPrecoProduto_entity_1.TabelaPrecoProduto)
], CadastroComplementarEmpresa.prototype, "tabelaPrecoProduto", void 0);
exports.CadastroComplementarEmpresa = CadastroComplementarEmpresa = __decorate([
    (0, typeorm_1.Entity)('TbCadastroComplementarEmpresa')
], CadastroComplementarEmpresa);
//# sourceMappingURL=cadastroComplementarEmpresa.entity.js.map
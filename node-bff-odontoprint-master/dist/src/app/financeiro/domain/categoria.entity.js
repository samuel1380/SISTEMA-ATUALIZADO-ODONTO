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
exports.Categoria = void 0;
const typeorm_1 = require("typeorm");
const tipo_lancamento_enum_1 = require("./tipo-lancamento.enum");
const classificacao_dre_enum_1 = require("./classificacao-dre.enum");
const classificacao_despesa_enum_1 = require("./classificacao-despesa.enum");
let Categoria = class Categoria {
};
exports.Categoria = Categoria;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Categoria.prototype, "idCategoria", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100 }),
    __metadata("design:type", String)
], Categoria.prototype, "nome", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: tipo_lancamento_enum_1.TipoLancamento }),
    __metadata("design:type", String)
], Categoria.prototype, "tipo", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: classificacao_dre_enum_1.ClassificacaoDre }),
    __metadata("design:type", String)
], Categoria.prototype, "classificacaoDre", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: classificacao_despesa_enum_1.ClassificacaoDespesa, nullable: true }),
    __metadata("design:type", String)
], Categoria.prototype, "classificacaoDespesa", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], Categoria.prototype, "idCategoriaPai", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Categoria, (cat) => cat.subcategorias, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'idCategoriaPai' }),
    __metadata("design:type", Categoria)
], Categoria.prototype, "categoriaPai", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Categoria, (cat) => cat.categoriaPai),
    __metadata("design:type", Array)
], Categoria.prototype, "subcategorias", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Categoria.prototype, "dataInclusao", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Categoria.prototype, "dataAlteracao", void 0);
__decorate([
    (0, typeorm_1.DeleteDateColumn)(),
    __metadata("design:type", Date)
], Categoria.prototype, "dataExclusao", void 0);
exports.Categoria = Categoria = __decorate([
    (0, typeorm_1.Entity)('TbFinanceiroCategoria')
], Categoria);
//# sourceMappingURL=categoria.entity.js.map
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
exports.EmpresaTabelaPreco = void 0;
const typeorm_1 = require("typeorm");
const empresa_entity_1 = require("@hunter-solucoes/node-arqt-base-gerenciador-usuarios/dist/src/app/empresa/domain/empresa.entity");
const tabelaPrecoProduto_entity_1 = require("../../tabelaPrecoProduto/domain/tabelaPrecoProduto.entity");
let EmpresaTabelaPreco = class EmpresaTabelaPreco {
};
exports.EmpresaTabelaPreco = EmpresaTabelaPreco;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], EmpresaTabelaPreco.prototype, "idEmpresaTabelaPreco", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: false }),
    __metadata("design:type", Number)
], EmpresaTabelaPreco.prototype, "idEmpresa", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: false }),
    __metadata("design:type", Number)
], EmpresaTabelaPreco.prototype, "idTabelaPrecoProduto", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'date',
        nullable: false,
        transformer: {
            to: (value) => {
                if (!value)
                    return value;
                const ano = value.getUTCFullYear();
                const mes = value.getUTCMonth();
                const dia = value.getUTCDate();
                return `${ano}-${String(mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
            },
            from: (value) => {
                if (!value)
                    return value;
                if (value instanceof Date) {
                    const ano = value.getUTCFullYear();
                    const mes = value.getUTCMonth();
                    const dia = value.getUTCDate();
                    return new Date(Date.UTC(ano, mes, dia, 0, 0, 0, 0));
                }
                if (typeof value === 'string') {
                    const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
                    if (match) {
                        const ano = parseInt(match[1], 10);
                        const mes = parseInt(match[2], 10) - 1;
                        const dia = parseInt(match[3], 10);
                        return new Date(Date.UTC(ano, mes, dia, 0, 0, 0, 0));
                    }
                }
                return value;
            }
        }
    }),
    __metadata("design:type", Date)
], EmpresaTabelaPreco.prototype, "dataInicio", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'date',
        nullable: true,
        transformer: {
            to: (value) => {
                if (!value)
                    return null;
                const ano = value.getUTCFullYear();
                const mes = value.getUTCMonth();
                const dia = value.getUTCDate();
                return `${ano}-${String(mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
            },
            from: (value) => {
                if (!value)
                    return null;
                if (value instanceof Date) {
                    const ano = value.getUTCFullYear();
                    const mes = value.getUTCMonth();
                    const dia = value.getUTCDate();
                    return new Date(Date.UTC(ano, mes, dia, 0, 0, 0, 0));
                }
                if (typeof value === 'string') {
                    const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
                    if (match) {
                        const ano = parseInt(match[1], 10);
                        const mes = parseInt(match[2], 10) - 1;
                        const dia = parseInt(match[3], 10);
                        return new Date(Date.UTC(ano, mes, dia, 0, 0, 0, 0));
                    }
                }
                return null;
            }
        }
    }),
    __metadata("design:type", Date)
], EmpresaTabelaPreco.prototype, "dataFim", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "boolean", default: true }),
    __metadata("design:type", Number)
], EmpresaTabelaPreco.prototype, "ativo", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: false, select: false }),
    __metadata("design:type", Number)
], EmpresaTabelaPreco.prototype, "idUsuarioCadastro", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    (0, typeorm_1.Column)({ select: false }),
    __metadata("design:type", Date)
], EmpresaTabelaPreco.prototype, "dataInclusao", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    (0, typeorm_1.Column)({ select: false }),
    __metadata("design:type", Date)
], EmpresaTabelaPreco.prototype, "dataAlteracao", void 0);
__decorate([
    (0, typeorm_1.DeleteDateColumn)(),
    (0, typeorm_1.Column)({ select: false }),
    __metadata("design:type", Date)
], EmpresaTabelaPreco.prototype, "dataExclusao", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => empresa_entity_1.Empresa, { eager: true }),
    (0, typeorm_1.JoinColumn)({ name: 'idEmpresa' }),
    __metadata("design:type", empresa_entity_1.Empresa)
], EmpresaTabelaPreco.prototype, "empresa", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => tabelaPrecoProduto_entity_1.TabelaPrecoProduto, { eager: true }),
    (0, typeorm_1.JoinColumn)({ name: 'idTabelaPrecoProduto' }),
    __metadata("design:type", tabelaPrecoProduto_entity_1.TabelaPrecoProduto)
], EmpresaTabelaPreco.prototype, "tabelaPrecoProduto", void 0);
exports.EmpresaTabelaPreco = EmpresaTabelaPreco = __decorate([
    (0, typeorm_1.Entity)('TbEmpresaTabelaPreco')
], EmpresaTabelaPreco);
//# sourceMappingURL=empresaTabelaPreco.entity.js.map
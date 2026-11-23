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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoriaService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const categoria_entity_1 = require("../domain/categoria.entity");
const lancamento_entity_1 = require("../domain/lancamento.entity");
const classificacao_dre_enum_1 = require("../domain/classificacao-dre.enum");
const tipo_lancamento_enum_1 = require("../domain/tipo-lancamento.enum");
let CategoriaService = class CategoriaService {
    constructor(categoriaRepository, lancamentoRepository) {
        this.categoriaRepository = categoriaRepository;
        this.lancamentoRepository = lancamentoRepository;
    }
    defaultClassificacaoPorTipo(tipo) {
        return tipo === tipo_lancamento_enum_1.TipoLancamento.RECEITA
            ? classificacao_dre_enum_1.ClassificacaoDre.OPERACIONAL_RECEITA
            : classificacao_dre_enum_1.ClassificacaoDre.OPERACIONAL_DESPESA;
    }
    validarClassificacaoDre(tipo, classificacao) {
        const err = () => new common_1.BadRequestException(`classificacaoDre "${classificacao}" incompatível com tipo "${tipo}".`);
        if (tipo === tipo_lancamento_enum_1.TipoLancamento.RECEITA) {
            if (classificacao !== classificacao_dre_enum_1.ClassificacaoDre.OPERACIONAL_RECEITA &&
                classificacao !== classificacao_dre_enum_1.ClassificacaoDre.APORTE) {
                throw err();
            }
        }
        else {
            if (classificacao !== classificacao_dre_enum_1.ClassificacaoDre.OPERACIONAL_DESPESA &&
                classificacao !== classificacao_dre_enum_1.ClassificacaoDre.INVESTIMENTO &&
                classificacao !== classificacao_dre_enum_1.ClassificacaoDre.SAIDA_FINANCIAMENTO) {
                throw err();
            }
        }
    }
    async create(dto) {
        var _a;
        const { subcategorias } = dto, rest = __rest(dto, ["subcategorias"]);
        const tipo = rest.tipo;
        const classificacaoDre = (_a = rest.classificacaoDre) !== null && _a !== void 0 ? _a : this.defaultClassificacaoPorTipo(tipo);
        this.validarClassificacaoDre(tipo, classificacaoDre);
        const categoria = this.categoriaRepository.create(Object.assign(Object.assign({}, rest), { classificacaoDre }));
        const saved = await this.categoriaRepository.save(categoria);
        if ((subcategorias === null || subcategorias === void 0 ? void 0 : subcategorias.length) && !saved.idCategoriaPai) {
            for (const sub of subcategorias) {
                const subCat = this.categoriaRepository.create({
                    nome: sub.nome,
                    tipo: saved.tipo,
                    classificacaoDre: saved.classificacaoDre,
                    classificacaoDespesa: saved.classificacaoDespesa,
                    idCategoriaPai: saved.idCategoria,
                });
                await this.categoriaRepository.save(subCat);
            }
            return this.findOne(saved.idCategoria);
        }
        return saved;
    }
    async findAll(incluirSubcategorias = false) {
        const options = {
            relations: incluirSubcategorias ? ['categoriaPai', 'subcategorias'] : ['subcategorias'],
            order: { nome: 'ASC' },
        };
        if (!incluirSubcategorias) {
            options.where = { idCategoriaPai: (0, typeorm_2.IsNull)() };
        }
        return this.categoriaRepository.find(options);
    }
    async findOne(id) {
        const categoria = await this.categoriaRepository.findOne({
            where: { idCategoria: id },
            relations: ['categoriaPai', 'subcategorias'],
        });
        if (!categoria) {
            throw new common_1.NotFoundException(`Categoria com ID ${id} não encontrada.`);
        }
        return categoria;
    }
    async update(id, dto) {
        var _a, _b, _c;
        const categoria = await this.categoriaRepository.findOne({
            where: { idCategoria: id },
            relations: ['subcategorias'],
        });
        if (!categoria) {
            throw new common_1.NotFoundException(`Categoria com ID ${id} não encontrada.`);
        }
        const { subcategorias } = dto, rest = __rest(dto, ["subcategorias"]);
        const tipoNovo = (_a = rest.tipo) !== null && _a !== void 0 ? _a : categoria.tipo;
        const classificacaoNova = (_c = (_b = rest.classificacaoDre) !== null && _b !== void 0 ? _b : categoria.classificacaoDre) !== null && _c !== void 0 ? _c : this.defaultClassificacaoPorTipo(tipoNovo);
        this.validarClassificacaoDre(tipoNovo, classificacaoNova);
        const updatedCategoria = this.categoriaRepository.merge(categoria, Object.assign(Object.assign({}, rest), { tipo: tipoNovo, classificacaoDre: classificacaoNova }));
        await this.categoriaRepository.save(updatedCategoria);
        if (subcategorias && !categoria.idCategoriaPai) {
            const existentes = await this.categoriaRepository.find({
                where: { idCategoriaPai: id },
            });
            const nomesNovos = subcategorias.map((s) => s.nome.trim().toUpperCase());
            const nomesAProcessar = new Set(nomesNovos);
            for (const sub of existentes) {
                const nomeUpper = sub.nome.trim().toUpperCase();
                if (nomesAProcessar.has(nomeUpper)) {
                    const updatedSub = this.categoriaRepository.merge(sub, {
                        tipo: updatedCategoria.tipo,
                        classificacaoDre: updatedCategoria.classificacaoDre,
                        classificacaoDespesa: updatedCategoria.classificacaoDespesa,
                    });
                    await this.categoriaRepository.save(updatedSub);
                    nomesAProcessar.delete(nomeUpper);
                }
                else {
                    const lancamentoEmUso = await this.lancamentoRepository.findOne({
                        where: { idCategoria: sub.idCategoria },
                    });
                    if (lancamentoEmUso) {
                        throw new common_1.BadRequestException(`A subcategoria "${sub.nome}" nÃ£o pode ser removida da lista pois estÃ¡ associada a um ou mais lanÃ§amentos.`);
                    }
                    else {
                        await this.categoriaRepository.softDelete(sub.idCategoria);
                    }
                }
            }
            for (const nomeUpper of nomesAProcessar) {
                const subDto = subcategorias.find((s) => s.nome.trim().toUpperCase() === nomeUpper);
                if (subDto) {
                    const subCat = this.categoriaRepository.create({
                        nome: subDto.nome,
                        tipo: updatedCategoria.tipo,
                        classificacaoDre: updatedCategoria.classificacaoDre,
                        classificacaoDespesa: updatedCategoria.classificacaoDespesa,
                        idCategoriaPai: id,
                    });
                    await this.categoriaRepository.save(subCat);
                }
            }
        }
        return this.findOne(id);
    }
    async remove(id) {
        const categoria = await this.findOne(id);
        const lancamentoComCategoria = await this.lancamentoRepository.findOne({
            where: { idCategoria: id },
        });
        if (lancamentoComCategoria) {
            throw new common_1.BadRequestException(`A categoria "${categoria.nome}" não pode ser removida pois está associada a um ou mais lançamentos.`);
        }
        const result = await this.categoriaRepository.softDelete(id);
        if (result.affected === 0) {
            throw new common_1.NotFoundException(`Categoria com ID ${id} não encontrada para remoção.`);
        }
    }
};
exports.CategoriaService = CategoriaService;
exports.CategoriaService = CategoriaService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(categoria_entity_1.Categoria)),
    __param(1, (0, typeorm_1.InjectRepository)(lancamento_entity_1.Lancamento)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], CategoriaService);
//# sourceMappingURL=categoria.service.js.map
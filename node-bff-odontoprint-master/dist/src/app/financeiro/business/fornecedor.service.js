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
Object.defineProperty(exports, "__esModule", { value: true });
exports.FornecedorService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const fornecedor_entity_1 = require("../domain/fornecedor.entity");
const documento_brasil_util_1 = require("../utils/documento-brasil.util");
const categoria_service_1 = require("./categoria.service");
const tipo_lancamento_enum_1 = require("../domain/tipo-lancamento.enum");
let FornecedorService = class FornecedorService {
    constructor(fornecedorRepository, categoriaService) {
        this.fornecedorRepository = fornecedorRepository;
        this.categoriaService = categoriaService;
    }
    trimOuUndefined(v) {
        if (v == null)
            return undefined;
        const t = String(v).trim();
        return t === '' ? undefined : t;
    }
    async validarIdCategoriaFornecedor(idCategoria) {
        if (idCategoria == null)
            return;
        const cat = await this.categoriaService.findOne(idCategoria);
        if (cat.tipo !== tipo_lancamento_enum_1.TipoLancamento.DESPESA) {
            throw new common_1.BadRequestException('A categoria do fornecedor deve ser do tipo DESPESA.');
        }
    }
    async criar(dto) {
        var _a, _b;
        await this.validarIdCategoriaFornecedor(dto.idCategoria);
        const fornecedor = this.fornecedorRepository.create({
            razaoSocial: String(dto.razaoSocial).trim(),
            nomeFantasia: this.trimOuUndefined(dto.nomeFantasia),
            telefone: this.trimOuUndefined(dto.telefone),
            cep: this.trimOuUndefined(dto.cep),
            logradouro: this.trimOuUndefined(dto.logradouro),
            numero: this.trimOuUndefined(dto.numero),
            complemento: this.trimOuUndefined(dto.complemento),
            bairro: this.trimOuUndefined(dto.bairro),
            cidade: this.trimOuUndefined(dto.cidade),
            uf: this.trimOuUndefined(dto.uf),
            cpf: this.trimOuUndefined(dto.cpf),
            cnpj: this.trimOuUndefined(dto.cnpj),
            idCategoria: (_a = dto.idCategoria) !== null && _a !== void 0 ? _a : undefined,
            ativo: (_b = dto.ativo) !== null && _b !== void 0 ? _b : true,
        });
        return this.fornecedorRepository.save(fornecedor);
    }
    async listar(ativo) {
        const qb = this.fornecedorRepository
            .createQueryBuilder('f')
            .leftJoinAndSelect('f.categoria', 'categoria')
            .orderBy('f.razaoSocial', 'ASC');
        if (ativo !== undefined) {
            qb.andWhere('f.ativo = :ativo', { ativo });
        }
        return qb.getMany();
    }
    async buscarPorId(idFornecedor) {
        const fornecedor = await this.fornecedorRepository.findOne({
            where: { idFornecedor },
            relations: ['categoria'],
        });
        if (!fornecedor) {
            throw new common_1.NotFoundException(`Fornecedor com ID ${idFornecedor} não encontrado.`);
        }
        return fornecedor;
    }
    async atualizar(idFornecedor, dto) {
        const fornecedor = await this.buscarPorId(idFornecedor);
        if (dto.idCategoria !== undefined) {
            if (dto.idCategoria != null) {
                await this.validarIdCategoriaFornecedor(dto.idCategoria);
            }
            fornecedor.idCategoria = dto.idCategoria == null ? null : dto.idCategoria;
        }
        if (dto.razaoSocial !== undefined)
            fornecedor.razaoSocial = String(dto.razaoSocial).trim();
        if (dto.nomeFantasia !== undefined)
            fornecedor.nomeFantasia = this.trimOuUndefined(dto.nomeFantasia);
        if (dto.telefone !== undefined)
            fornecedor.telefone = this.trimOuUndefined(dto.telefone);
        if (dto.cep !== undefined)
            fornecedor.cep = this.trimOuUndefined(dto.cep);
        if (dto.logradouro !== undefined)
            fornecedor.logradouro = this.trimOuUndefined(dto.logradouro);
        if (dto.numero !== undefined)
            fornecedor.numero = this.trimOuUndefined(dto.numero);
        if (dto.complemento !== undefined)
            fornecedor.complemento = this.trimOuUndefined(dto.complemento);
        if (dto.bairro !== undefined)
            fornecedor.bairro = this.trimOuUndefined(dto.bairro);
        if (dto.cidade !== undefined)
            fornecedor.cidade = this.trimOuUndefined(dto.cidade);
        if (dto.uf !== undefined)
            fornecedor.uf = this.trimOuUndefined(dto.uf);
        if (dto.ativo !== undefined)
            fornecedor.ativo = dto.ativo;
        if (dto.cpf !== undefined)
            fornecedor.cpf = this.trimOuUndefined(dto.cpf);
        if (dto.cnpj !== undefined)
            fornecedor.cnpj = this.trimOuUndefined(dto.cnpj);
        return this.fornecedorRepository.save(fornecedor);
    }
    async excluir(idFornecedor) {
        const fornecedor = await this.buscarPorId(idFornecedor);
        fornecedor.ativo = false;
        await this.fornecedorRepository.save(fornecedor);
    }
    async buscarPorDocumentoNormalizado(digitos) {
        var _a, _b;
        const d = (0, documento_brasil_util_1.somenteDigitos)(digitos);
        if (d.length === 11) {
            const rows = await this.fornecedorRepository
                .createQueryBuilder('f')
                .leftJoinAndSelect('f.categoria', 'categoria')
                .where("REGEXP_REPLACE(COALESCE(f.cpf, ''), '[^0-9]', '') = :d", { d })
                .orderBy('f.idFornecedor', 'ASC')
                .take(1)
                .getMany();
            return (_a = rows[0]) !== null && _a !== void 0 ? _a : null;
        }
        if (d.length === 14) {
            const rows = await this.fornecedorRepository
                .createQueryBuilder('f')
                .leftJoinAndSelect('f.categoria', 'categoria')
                .where("REGEXP_REPLACE(COALESCE(f.cnpj, ''), '[^0-9]', '') = :d", { d })
                .orderBy('f.idFornecedor', 'ASC')
                .take(1)
                .getMany();
            return (_b = rows[0]) !== null && _b !== void 0 ? _b : null;
        }
        return null;
    }
    async criarFornecedorImportacaoOfx(tipo, digitos) {
        const d = (0, documento_brasil_util_1.somenteDigitos)(digitos);
        if (tipo === 'CPF') {
            if (d.length !== 11)
                throw new common_1.BadRequestException('CPF inválido para cadastro OFX (esperados 11 dígitos).');
            const hint = `**.***.**${d.slice(6, 9)}-${d.slice(9)}`;
            const f = this.fornecedorRepository.create({
                razaoSocial: `Fornecedor OFX — completar cadastro (CPF ${hint})`,
                cpf: d,
                ativo: true,
            });
            return this.fornecedorRepository.save(f);
        }
        if (d.length !== 14)
            throw new common_1.BadRequestException('CNPJ inválido para cadastro OFX (esperados 14 dígitos).');
        const hint = `**.***.***/${d.slice(8, 12)}-**`;
        const f = this.fornecedorRepository.create({
            razaoSocial: `Fornecedor OFX — completar cadastro (CNPJ ${hint})`,
            cnpj: d,
            ativo: true,
        });
        return this.fornecedorRepository.save(f);
    }
};
exports.FornecedorService = FornecedorService;
exports.FornecedorService = FornecedorService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(fornecedor_entity_1.Fornecedor)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        categoria_service_1.CategoriaService])
], FornecedorService);
//# sourceMappingURL=fornecedor.service.js.map
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
var TabelaPrecoProdutoService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TabelaPrecoProdutoService = void 0;
const common_1 = require("@nestjs/common");
const tabelaPrecoProduto_entity_1 = require("../domain/tabelaPrecoProduto.entity");
const precoProduto_entity_1 = require("../domain/precoProduto.entity");
const class_transformer_1 = require("class-transformer");
const event_emitter_1 = require("@nestjs/event-emitter");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const CACHE_TTL_MS = 30000;
let TabelaPrecoProdutoService = TabelaPrecoProdutoService_1 = class TabelaPrecoProdutoService {
    constructor(tabelaPrecoProdutoRepository, eventEmitter) {
        this.tabelaPrecoProdutoRepository = tabelaPrecoProdutoRepository;
        this.eventEmitter = eventEmitter;
        this.logger = new common_1.Logger(TabelaPrecoProdutoService_1.name);
        this.cacheVigentePorMatriz = new Map();
    }
    cacheKey(idTabelaPrecoProduto, data) {
        return `${idTabelaPrecoProduto}-${data.toISOString().slice(0, 10)}`;
    }
    limparCacheExpirado() {
        const now = Date.now();
        for (const [key, entry] of this.cacheVigentePorMatriz.entries()) {
            if (entry.expires < now)
                this.cacheVigentePorMatriz.delete(key);
        }
    }
    async cadastrarTabelaPrecoProduto(currentUser, tabelaPrecoProdutoDto) {
        if (tabelaPrecoProdutoDto.idTabelaPrecoProdutoOrigem && tabelaPrecoProdutoDto.numeroVersao) {
            const versaoExistente = await this.tabelaPrecoProdutoRepository.findOne({
                where: {
                    idTabelaPrecoProdutoOrigem: tabelaPrecoProdutoDto.idTabelaPrecoProdutoOrigem,
                    numeroVersao: tabelaPrecoProdutoDto.numeroVersao,
                    ativo: 1,
                },
            });
            if (versaoExistente && versaoExistente.idTabelaPrecoProduto !== tabelaPrecoProdutoDto.idTabelaPrecoProduto) {
                throw new common_1.BadRequestException(`Já existe uma versão com o número "${tabelaPrecoProdutoDto.numeroVersao}" para esta tabela matriz.`);
            }
        }
        const tabelaProduto = (0, class_transformer_1.plainToClass)(tabelaPrecoProduto_entity_1.TabelaPrecoProduto, tabelaPrecoProdutoDto);
        if (tabelaPrecoProdutoDto.idTabelaPrecoProdutoOrigem) {
            tabelaProduto.idTabelaPrecoProdutoOrigem = tabelaPrecoProdutoDto.idTabelaPrecoProdutoOrigem;
        }
        if (tabelaPrecoProdutoDto.numeroVersao) {
            tabelaProduto.numeroVersao = tabelaPrecoProdutoDto.numeroVersao;
        }
        tabelaProduto.idUsuarioCadastro = currentUser.user.idUsuario;
        tabelaProduto.precoProduto = tabelaProduto.precoProduto.map((preco) => {
            preco.idUsuarioCadastro = currentUser.user.idUsuario;
            return preco;
        });
        const retornoTabelaDePreco = await this.tabelaPrecoProdutoRepository.save(tabelaProduto);
        this.eventEmitter.emit('preco.changed', currentUser);
        return retornoTabelaDePreco;
    }
    async buscaTabelaPrecoProdutos() {
        return this.tabelaPrecoProdutoRepository.find({
            where: { ativo: 1 },
            relations: ['precoProduto', 'precoProduto.produto', 'versoes'],
            order: { idTabelaPrecoProduto: 'DESC' }
        });
    }
    async buscarTabelasMatriz() {
        const tabelas = await this.tabelaPrecoProdutoRepository
            .createQueryBuilder('tabela')
            .where('tabela.ativo = :ativo', { ativo: 1 })
            .andWhere('tabela.idTabelaPrecoProdutoOrigem IS NULL')
            .leftJoinAndSelect('tabela.precoProduto', 'precoProduto')
            .leftJoinAndSelect('precoProduto.produto', 'produto')
            .leftJoinAndSelect('tabela.versoes', 'versoes')
            .leftJoinAndSelect('versoes.precoProduto', 'versoesPrecoProduto')
            .leftJoinAndSelect('versoesPrecoProduto.produto', 'versoesProduto')
            .orderBy('tabela.nome', 'ASC')
            .addOrderBy('tabela.idTabelaPrecoProduto', 'DESC')
            .addOrderBy('versoes.idTabelaPrecoProduto', 'ASC')
            .getMany();
        console.log('[buscarTabelasMatriz] Total de tabelas encontradas:', tabelas.length);
        tabelas.forEach((tabela, index) => {
            var _a;
            console.log(`[buscarTabelasMatriz] Tabela ${index + 1}: ${tabela.nome}, Versões: ${((_a = tabela.versoes) === null || _a === void 0 ? void 0 : _a.length) || 0}`);
            if (tabela.versoes && tabela.versoes.length > 0) {
                console.log(`[buscarTabelasMatriz] Versões da tabela ${tabela.nome}:`, tabela.versoes.map((v) => ({
                    id: v.idTabelaPrecoProduto,
                    numeroVersao: v.numeroVersao,
                    ativo: v.ativo
                })));
            }
        });
        return tabelas;
    }
    async buscarVersoesTabela(idTabelaMatriz) {
        return this.tabelaPrecoProdutoRepository.find({
            where: {
                ativo: 1,
                idTabelaPrecoProdutoOrigem: idTabelaMatriz,
            },
            relations: ['precoProduto', 'precoProduto.produto'],
            order: { idTabelaPrecoProduto: 'ASC' },
        });
    }
    async criarNovaVersao(currentUser, idTabelaOrigem, dadosVersao) {
        var _a;
        const tabelaOrigem = await this.buscaTabelaPrecoProdutosPorId(idTabelaOrigem);
        if (!tabelaOrigem) {
            throw new common_1.BadRequestException('Tabela origem não encontrada');
        }
        const versoes = await this.buscarVersoesTabela(idTabelaOrigem);
        const ultimaVersao = versoes.length > 0 ? versoes[versoes.length - 1] : tabelaOrigem;
        const versaoExistente = await this.tabelaPrecoProdutoRepository.findOne({
            where: {
                idTabelaPrecoProdutoOrigem: idTabelaOrigem,
                numeroVersao: dadosVersao.numeroVersao,
                ativo: 1,
            },
        });
        if (versaoExistente) {
            throw new common_1.BadRequestException(`Já existe uma versão com o número "${dadosVersao.numeroVersao}" para esta tabela matriz.`);
        }
        const novaVersao = new tabelaPrecoProduto_entity_1.TabelaPrecoProduto();
        novaVersao.nome = tabelaOrigem.nome;
        novaVersao.idTabelaPrecoProdutoOrigem = idTabelaOrigem;
        novaVersao.numeroVersao = dadosVersao.numeroVersao;
        novaVersao.ativo = 1;
        novaVersao.idUsuarioCadastro = currentUser.user.idUsuario;
        novaVersao.precoProduto = ((_a = ultimaVersao.precoProduto) === null || _a === void 0 ? void 0 : _a.map((preco) => {
            const novoPreco = new precoProduto_entity_1.PrecoProduto();
            novoPreco.preco = preco.preco;
            novoPreco.idProduto = preco.idProduto;
            novoPreco.ativo = 1;
            novoPreco.idUsuarioCadastro = currentUser.user.idUsuario;
            return novoPreco;
        })) || [];
        const versaoSalva = await this.tabelaPrecoProdutoRepository.save(novaVersao);
        this.eventEmitter.emit('preco.changed', currentUser);
        return await this.buscaTabelaPrecoProdutosPorId(versaoSalva.idTabelaPrecoProduto);
    }
    async buscaTabelaPrecoProdutosPorId(idTabelaPrecoProduto) {
        return this.tabelaPrecoProdutoRepository.findOne({
            where: { idTabelaPrecoProduto },
            relations: ['precoProduto', 'precoProduto.produto'],
        });
    }
    async buscarTabelaPrecoVigentePorData(_data) {
        const tabelas = await this.tabelaPrecoProdutoRepository
            .createQueryBuilder('tabela')
            .where('tabela.ativo = :ativo', { ativo: 1 })
            .andWhere('tabela.idTabelaPrecoProdutoOrigem IS NULL')
            .leftJoinAndSelect('tabela.precoProduto', 'precoProduto')
            .leftJoinAndSelect('precoProduto.produto', 'produto')
            .orderBy('tabela.idTabelaPrecoProduto', 'DESC')
            .take(1)
            .getMany();
        return tabelas.length > 0 ? tabelas[0] : null;
    }
    async buscarTabelaPrecoVigentePorMatriz(idTabelaPrecoProduto, _data) {
        this.limparCacheExpirado();
        const key = `${idTabelaPrecoProduto}`;
        const cached = this.cacheVigentePorMatriz.get(key);
        if (cached)
            return cached.tabela;
        let tabela = await this.buscaTabelaPrecoProdutosPorId(idTabelaPrecoProduto);
        if (!tabela)
            return null;
        if (!tabela.ativo)
            return null;
        let idTabelaMatriz;
        if (tabela.idTabelaPrecoProdutoOrigem) {
            idTabelaMatriz = tabela.idTabelaPrecoProdutoOrigem;
        }
        else {
            idTabelaMatriz = tabela.idTabelaPrecoProduto;
        }
        const tabelaMatriz = await this.buscaTabelaPrecoProdutosPorId(idTabelaMatriz);
        if (!tabelaMatriz || !tabelaMatriz.ativo)
            return null;
        const versoes = await this.buscarVersoesTabela(idTabelaMatriz);
        if (versoes.length === 0) {
            const resultado = tabelaMatriz;
            this.cacheVigentePorMatriz.set(key, { tabela: resultado, expires: Date.now() + CACHE_TTL_MS });
            return resultado;
        }
        const versaoMaisRecente = versoes.slice().sort((a, b) => {
            const numA = parseInt(a.numeroVersao || '0', 10);
            const numB = parseInt(b.numeroVersao || '0', 10);
            if (!isNaN(numA) && !isNaN(numB))
                return numB - numA;
            return (b.numeroVersao || '').localeCompare(a.numeroVersao || '');
        })[0];
        const resultado = versaoMaisRecente;
        this.cacheVigentePorMatriz.set(key, { tabela: resultado, expires: Date.now() + CACHE_TTL_MS });
        return resultado;
    }
    async buscarTabelasProximasVencimento(_diasAntecedencia = 30) {
        return [];
    }
};
exports.TabelaPrecoProdutoService = TabelaPrecoProdutoService;
exports.TabelaPrecoProdutoService = TabelaPrecoProdutoService = TabelaPrecoProdutoService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(tabelaPrecoProduto_entity_1.TabelaPrecoProduto)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        event_emitter_1.EventEmitter2])
], TabelaPrecoProdutoService);
//# sourceMappingURL=tabelaPrecoProduto.service.js.map
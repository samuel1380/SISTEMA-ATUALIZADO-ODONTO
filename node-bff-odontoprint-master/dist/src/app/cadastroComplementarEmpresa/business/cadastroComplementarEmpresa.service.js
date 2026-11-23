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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CadastroComplementarEmpresaService = void 0;
const dist_1 = require("@hunter-solucoes/node-arqt-base-gerenciador-usuarios/dist");
const common_1 = require("@nestjs/common");
const componente_service_1 = require("../../componente/business/componente.service");
const componenteEmpresa_service_1 = require("../../componenteEmpresa/business/componenteEmpresa.service");
const cor_service_1 = require("../../cor/business/cor.service");
const corEmpresa_service_1 = require("../../corEmpresa/business/corEmpresa.service");
const dentista_service_1 = require("../../dentista/business/dentista.service");
const produtosEmpresa_service_1 = require("../../produtosEmpresa/business/produtosEmpresa.service");
const cadastroComplementarEmpresa_entity_1 = require("../domain/cadastroComplementarEmpresa.entity");
const cadastroComplementarEmpresa_repository_1 = require("../repository/cadastroComplementarEmpresa.repository");
const tabelaPrecoProduto_service_1 = require("../../tabelaPrecoProduto/business/tabelaPrecoProduto.service");
const CACHE_CADASTRO_TTL_MS = 10000;
const CACHE_CADASTRO_MAX_SIZE = 50;
let CadastroComplementarEmpresaService = class CadastroComplementarEmpresaService {
    limparCacheCadastro() {
        const now = Date.now();
        for (const [key, entry] of this.cacheCadastro.entries()) {
            if (entry.expires < now)
                this.cacheCadastro.delete(key);
        }
        if (this.cacheCadastro.size > CACHE_CADASTRO_MAX_SIZE) {
            const entradasOrdenadas = [...this.cacheCadastro.entries()].sort((a, b) => a[1].expires - b[1].expires);
            const remover = entradasOrdenadas.length - CACHE_CADASTRO_MAX_SIZE;
            for (let i = 0; i < remover; i++)
                this.cacheCadastro.delete(entradasOrdenadas[i][0]);
        }
    }
    constructor(cadastroComplementarEmpresaRepository, produtoEmpresaService, componenteEmpresaService, corEmpresaService, dentistaService, produtoService, componenteService, corService, tabelaPrecoProdutoService) {
        this.cadastroComplementarEmpresaRepository = cadastroComplementarEmpresaRepository;
        this.produtoEmpresaService = produtoEmpresaService;
        this.componenteEmpresaService = componenteEmpresaService;
        this.corEmpresaService = corEmpresaService;
        this.dentistaService = dentistaService;
        this.produtoService = produtoService;
        this.componenteService = componenteService;
        this.corService = corService;
        this.tabelaPrecoProdutoService = tabelaPrecoProdutoService;
        this.cacheCadastro = new Map();
    }
    async cadastroComplementarEmpresa(currentUser, idEmpresa, cadastroComplementarEmpresaDto) {
        var _a, e_1, _b, _c, _d, e_2, _e, _f, _g, e_3, _h, _j;
        var _k;
        const cadastroComplementarEmpresa = new cadastroComplementarEmpresa_entity_1.CadastroComplementarEmpresa();
        cadastroComplementarEmpresa.idCadastroComplementarEmpresa = idEmpresa;
        cadastroComplementarEmpresa.idEmpresa = idEmpresa;
        cadastroComplementarEmpresa.porcentagemDesconto = cadastroComplementarEmpresaDto.porcentagemDesconto || 0;
        cadastroComplementarEmpresa.scannerProprio = cadastroComplementarEmpresaDto.scannerProprio;
        cadastroComplementarEmpresa.utilizaInterfaces = cadastroComplementarEmpresaDto.utilizaInterfaces;
        cadastroComplementarEmpresa.diaPagamento = cadastroComplementarEmpresaDto.diaPagamento;
        cadastroComplementarEmpresa.tipoPagamento = cadastroComplementarEmpresaDto.tipoPagamento;
        cadastroComplementarEmpresa.ativo = 1;
        cadastroComplementarEmpresa.idUsuarioCadastro = currentUser.user.idUsuario;
        cadastroComplementarEmpresa.idTabelaPrecoProduto = cadastroComplementarEmpresaDto.idTabelaPrecoProduto;
        const cadastroComplementar = this.cadastroComplementarEmpresaRepository.salvaCadastroComplementar(cadastroComplementarEmpresa);
        this.cacheCadastro.delete(idEmpresa);
        await this.produtoEmpresaService.sincronizarProdutosEmpresa(currentUser, idEmpresa, cadastroComplementarEmpresaDto.produtos);
        await this.componenteEmpresaService.sincronizarComponentesEmpresa(currentUser, idEmpresa, cadastroComplementarEmpresaDto.componentes);
        const dentistasCadastrados = await this.dentistaService.buscaDentistaPorEmpresaId(idEmpresa.toString());
        if ((_k = cadastroComplementarEmpresaDto.dentistas) === null || _k === void 0 ? void 0 : _k.length) {
            try {
                for (var _l = true, _m = __asyncValues(cadastroComplementarEmpresaDto.dentistas), _o; _o = await _m.next(), _a = _o.done, !_a; _l = true) {
                    _c = _o.value;
                    _l = false;
                    const dentista = _c;
                    const dentistaCadastrado = this.findDentista(dentistasCadastrados, dentista.email);
                    dentista.idEmpresa = idEmpresa.toString();
                    dentista.idDentista = dentistaCadastrado && dentistaCadastrado.idDentista;
                    if (!dentista.idDentista) {
                        await this.dentistaService.cadastrarDentista(currentUser, idEmpresa, dentista);
                    }
                    else {
                        await this.dentistaService.atualizaDentista(currentUser, idEmpresa, dentista);
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (!_l && !_a && (_b = _m.return)) await _b.call(_m);
                }
                finally { if (e_1) throw e_1.error; }
            }
            const dentistasParaRemoverEmpresa = dentistasCadastrados.filter(dentistaCadastrado => {
                return !cadastroComplementarEmpresaDto.dentistas.some(dentistaCadastroComplementar => dentistaCadastrado.email === dentistaCadastroComplementar.email);
            });
            try {
                for (var _p = true, dentistasParaRemoverEmpresa_1 = __asyncValues(dentistasParaRemoverEmpresa), dentistasParaRemoverEmpresa_1_1; dentistasParaRemoverEmpresa_1_1 = await dentistasParaRemoverEmpresa_1.next(), _d = dentistasParaRemoverEmpresa_1_1.done, !_d; _p = true) {
                    _f = dentistasParaRemoverEmpresa_1_1.value;
                    _p = false;
                    const dentistaRemover = _f;
                    await this.dentistaService.desativarDentista(idEmpresa, dentistaRemover.idDentista);
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (!_p && !_d && (_e = dentistasParaRemoverEmpresa_1.return)) await _e.call(dentistasParaRemoverEmpresa_1);
                }
                finally { if (e_2) throw e_2.error; }
            }
        }
        else {
            try {
                for (var _q = true, dentistasCadastrados_1 = __asyncValues(dentistasCadastrados), dentistasCadastrados_1_1; dentistasCadastrados_1_1 = await dentistasCadastrados_1.next(), _g = dentistasCadastrados_1_1.done, !_g; _q = true) {
                    _j = dentistasCadastrados_1_1.value;
                    _q = false;
                    const dentistaRemover = _j;
                    await this.dentistaService.desativarDentista(idEmpresa, dentistaRemover.idDentista);
                }
            }
            catch (e_3_1) { e_3 = { error: e_3_1 }; }
            finally {
                try {
                    if (!_q && !_g && (_h = dentistasCadastrados_1.return)) await _h.call(dentistasCadastrados_1);
                }
                finally { if (e_3) throw e_3.error; }
            }
        }
        return cadastroComplementar;
    }
    async buscarCadastroComplementarEmpresa(idEmpresa) {
        this.limparCacheCadastro();
        const now = Date.now();
        const cached = this.cacheCadastro.get(idEmpresa);
        if (cached && cached.expires > now)
            return cached.data;
        const data = await this.cadastroComplementarEmpresaRepository.buscarCadastroComplementarEmpresa(idEmpresa);
        this.cacheCadastro.set(idEmpresa, { data, expires: now + CACHE_CADASTRO_TTL_MS });
        return data;
    }
    async buscarInfosCadastroComplementar() {
        const produtos = await this.produtoService.buscarProdutosAtivos();
        const componentes = await this.componenteService.buscaComponentesAtivos();
        const cores = await this.corService.buscaCores();
        const tabelaPrecoProduto = await this.tabelaPrecoProdutoService.buscaTabelaPrecoProdutos();
        return {
            produtos,
            componentes,
            cores,
            tabelaPrecoProduto
        };
    }
    findDentista(dentistasCadastrados, dentistaEmail) {
        const dentista = dentistasCadastrados.filter(dentista => dentista.email === dentistaEmail);
        return dentista && dentista[0];
    }
    async atualizarPagamento(idEmpresa, diaPagamento, tipoPagamento, quantidadeParcelas) {
        let cadastro = await this.cadastroComplementarEmpresaRepository.buscarCadastroComplementarEmpresa(idEmpresa);
        if (!cadastro) {
            cadastro = new cadastroComplementarEmpresa_entity_1.CadastroComplementarEmpresa();
            cadastro.idCadastroComplementarEmpresa = idEmpresa;
            cadastro.idEmpresa = idEmpresa;
            cadastro.ativo = 1;
            cadastro.idUsuarioCadastro = 1;
            cadastro.idTabelaPrecoProduto = 1;
        }
        cadastro.diaPagamento = diaPagamento;
        cadastro.tipoPagamento = tipoPagamento;
        cadastro.quantidadeParcelas = quantidadeParcelas;
        const saved = await this.cadastroComplementarEmpresaRepository.salvaCadastroComplementar(cadastro);
        this.cacheCadastro.delete(idEmpresa);
        return saved;
    }
};
exports.CadastroComplementarEmpresaService = CadastroComplementarEmpresaService;
exports.CadastroComplementarEmpresaService = CadastroComplementarEmpresaService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [cadastroComplementarEmpresa_repository_1.CadastroComplementarEmpresaRepository,
        produtosEmpresa_service_1.ProdutoEmpresaService,
        componenteEmpresa_service_1.ComponenteEmpresaService,
        corEmpresa_service_1.CorEmpresaService,
        dentista_service_1.DentistaService,
        dist_1.ProdutoService,
        componente_service_1.ComponenteService,
        cor_service_1.CorService,
        tabelaPrecoProduto_service_1.TabelaPrecoProdutoService])
], CadastroComplementarEmpresaService);
//# sourceMappingURL=cadastroComplementarEmpresa.service.js.map
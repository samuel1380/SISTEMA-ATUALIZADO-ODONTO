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
exports.ProdutoEmpresaService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const produtosCategoriaEmpresa_entity_1 = require("../domain/produtosCategoriaEmpresa.entity");
let ProdutoEmpresaService = class ProdutoEmpresaService {
    constructor(produtoEmpresaRepository) {
        this.produtoEmpresaRepository = produtoEmpresaRepository;
    }
    async sincronizarProdutosEmpresa(currentUser, idEmpresa, produtosDto) {
        const produtosAtuais = await this.produtoEmpresaRepository.find({
            where: { idEmpresa },
        });
        const idsProdutosDto = produtosDto.map((p) => p.idProduto);
        const produtosParaRemover = produtosAtuais.filter((p) => !idsProdutosDto.includes(p.idProduto));
        if (produtosParaRemover.length > 0) {
            await this.produtoEmpresaRepository.remove(produtosParaRemover);
        }
        const produtosParaSalvar = produtosDto.map((dto) => {
            const produtoExistente = produtosAtuais.find((p) => p.idProduto === dto.idProduto);
            return this.produtoEmpresaRepository.create({
                idProdutoEmpresa: produtoExistente === null || produtoExistente === void 0 ? void 0 : produtoExistente.idProdutoEmpresa,
                idEmpresa,
                idProduto: dto.idProduto,
                ativo: 1,
                idUsuarioCadastro: currentUser.user.idUsuario,
            });
        });
        return this.produtoEmpresaRepository.save(produtosParaSalvar);
    }
    async buscarProdutosPorEmpresa(idEmpresa) {
        return this.produtoEmpresaRepository.find({ where: { idEmpresa } });
    }
    async buscarProdutoEspecifico(idEmpresa, idProduto) {
        return this.produtoEmpresaRepository.findOne({ where: { idEmpresa, idProduto } });
    }
};
exports.ProdutoEmpresaService = ProdutoEmpresaService;
exports.ProdutoEmpresaService = ProdutoEmpresaService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(produtosCategoriaEmpresa_entity_1.ProdutoEmpresa)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ProdutoEmpresaService);
//# sourceMappingURL=produtosEmpresa.service.js.map
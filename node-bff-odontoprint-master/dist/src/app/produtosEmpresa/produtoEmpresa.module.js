"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProdutoEmpresaModule = void 0;
const common_1 = require("@nestjs/common");
const produtosEmpresa_controller_1 = require("./controller/produtosEmpresa.controller");
const produtosEmpresa_service_1 = require("./business/produtosEmpresa.service");
const typeorm_1 = require("@nestjs/typeorm");
const produtosCategoriaEmpresa_entity_1 = require("./domain/produtosCategoriaEmpresa.entity");
let ProdutoEmpresaModule = class ProdutoEmpresaModule {
};
exports.ProdutoEmpresaModule = ProdutoEmpresaModule;
exports.ProdutoEmpresaModule = ProdutoEmpresaModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([produtosCategoriaEmpresa_entity_1.ProdutoEmpresa])
        ],
        controllers: [produtosEmpresa_controller_1.ProdutoEmpresaController],
        providers: [produtosEmpresa_service_1.ProdutoEmpresaService],
        exports: [produtosEmpresa_service_1.ProdutoEmpresaService]
    })
], ProdutoEmpresaModule);
//# sourceMappingURL=produtoEmpresa.module.js.map
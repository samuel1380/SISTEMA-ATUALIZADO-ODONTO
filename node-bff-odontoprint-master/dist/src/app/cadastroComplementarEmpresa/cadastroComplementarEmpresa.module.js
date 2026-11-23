"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CadastroComplementarEmpresaModule = void 0;
const common_1 = require("@nestjs/common");
const utils_1 = require("../../utils");
const httpClient_module_1 = require("../../libs/httpClient/httpClient.module");
const cadastroComplementarEmpresa_controller_1 = require("./controller/cadastroComplementarEmpresa.controller");
const cadastroComplementarEmpresa_service_1 = require("./business/cadastroComplementarEmpresa.service");
const cadastroComplementarEmpresa_repository_1 = require("./repository/cadastroComplementarEmpresa.repository");
const produtoEmpresa_module_1 = require("../produtosEmpresa/produtoEmpresa.module");
const componente_module_1 = require("../componenteEmpresa/componente.module");
const cor_module_1 = require("../corEmpresa/cor.module");
const dentista_module_1 = require("../dentista/dentista.module");
const produto_module_1 = require("../produto/produto.module");
const componente_module_2 = require("../componente/componente.module");
const cor_module_2 = require("../cor/cor.module");
const tabelaPrecoProduto_module_1 = require("../tabelaPrecoProduto/tabelaPrecoProduto.module");
const cadastroComplementarEmpresa_entity_1 = require("./domain/cadastroComplementarEmpresa.entity");
const typeorm_1 = require("@nestjs/typeorm");
let CadastroComplementarEmpresaModule = class CadastroComplementarEmpresaModule {
};
exports.CadastroComplementarEmpresaModule = CadastroComplementarEmpresaModule;
exports.CadastroComplementarEmpresaModule = CadastroComplementarEmpresaModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([cadastroComplementarEmpresa_entity_1.CadastroComplementarEmpresa]),
            utils_1.UtilsModule,
            httpClient_module_1.HttpClienteModule,
            produtoEmpresa_module_1.ProdutoEmpresaModule,
            componente_module_1.ComponenteEmpresaModule,
            cor_module_1.CorEmpresaModule,
            dentista_module_1.DentistaModule,
            produto_module_1.ProdutoCustomModule,
            componente_module_2.ComponenteModule,
            cor_module_2.CorModule,
            tabelaPrecoProduto_module_1.TabelaPrecoProdutoModule
        ],
        controllers: [cadastroComplementarEmpresa_controller_1.CadastroComplementarEmpresaController],
        providers: [cadastroComplementarEmpresa_service_1.CadastroComplementarEmpresaService, cadastroComplementarEmpresa_repository_1.CadastroComplementarEmpresaRepository],
        exports: [cadastroComplementarEmpresa_service_1.CadastroComplementarEmpresaService]
    })
], CadastroComplementarEmpresaModule);
//# sourceMappingURL=cadastroComplementarEmpresa.module.js.map
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const dist_1 = require("@hunter-solucoes/node-arqt-base-gerenciador-usuarios/dist");
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const event_emitter_1 = require("@nestjs/event-emitter");
const typeorm_compat_module_1 = require("./typeorm-compat.module");
const empresa_module_1 = require("./app/empresa/empresa.module");
const database_config_1 = require("./config/database.config");
const httpClient_module_1 = require("./libs/httpClient/httpClient.module");
const trabalho_module_1 = require("./app/trabalho/trabalho.module");
const localidade_module_1 = require("./app/localidade/localidade.module");
const produtoEmpresa_module_1 = require("./app/produtosEmpresa/produtoEmpresa.module");
const cadastroComplementarEmpresa_module_1 = require("./app/cadastroComplementarEmpresa/cadastroComplementarEmpresa.module");
const marcaComponente_module_1 = require("./app/marcaComponente/marcaComponente.module");
const cor_module_1 = require("./app/cor/cor.module");
const dentista_module_1 = require("./app/dentista/dentista.module");
const tabelaPrecoProduto_module_1 = require("./app/tabelaPrecoProduto/tabelaPrecoProduto.module");
const empresaTabelaPreco_module_1 = require("./app/empresaTabelaPreco/empresaTabelaPreco.module");
const historicoStatusTrabalho_module_1 = require("./app/historicoStatusTrabalho/historicoStatusTrabalho.module");
const estoque_module_1 = require("./app/estoque/estoque/estoque.module");
const transferencia_module_1 = require("./app/estoque/transferencia/transferencia.module");
const almoxarifado_module_1 = require("./app/estoque/almoxarifado/almoxarifado.module");
const financeiro_module_1 = require("./app/financeiro/financeiro.module");
const usuario_module_1 = require("./app/usuario/usuario.module");
const produto_module_1 = require("./app/produto/produto.module");
const motivo_module_1 = require("./app/motivo/motivo.module");
const logs_module_1 = require("./app/logs/logs.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forRoot(database_config_1.databaseConfig),
            typeorm_compat_module_1.TypeOrmCompatModule,
            event_emitter_1.EventEmitterModule.forRoot(),
            httpClient_module_1.HttpClienteModule,
            dist_1.AuthModule,
            empresa_module_1.GerenciadorEmpresaModule,
            produto_module_1.ProdutoCustomModule,
            dist_1.PedidoModule,
            trabalho_module_1.TrabalhoModule,
            localidade_module_1.LocalidadeModule,
            produtoEmpresa_module_1.ProdutoEmpresaModule,
            cadastroComplementarEmpresa_module_1.CadastroComplementarEmpresaModule,
            marcaComponente_module_1.MarcaComponenteModule,
            cor_module_1.CorModule,
            dentista_module_1.DentistaModule,
            dist_1.CategoriaProdutoModule,
            tabelaPrecoProduto_module_1.TabelaPrecoProdutoModule,
            empresaTabelaPreco_module_1.EmpresaTabelaPrecoModule,
            historicoStatusTrabalho_module_1.HistoricoStatusTrabalhoModule,
            estoque_module_1.EstoqueModule,
            transferencia_module_1.TransferenciaModule,
            almoxarifado_module_1.AlmoxarifadoModule,
            financeiro_module_1.FinanceiroModule,
            usuario_module_1.UsuarioModule,
            motivo_module_1.MotivoModule,
            logs_module_1.LogsModule,
        ],
        controllers: [],
        providers: [],
        exports: []
    })
], AppModule);
//# sourceMappingURL=app.module.js.map
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TabelaPrecoProdutoModule = void 0;
const common_1 = require("@nestjs/common");
const utils_1 = require("../../utils");
const httpClient_module_1 = require("../../libs/httpClient/httpClient.module");
const tabelaPrecoProduto_service_1 = require("./business/tabelaPrecoProduto.service");
const tabela_preco_notificacao_service_1 = require("./business/tabela-preco-notificacao.service");
const tabelaPrecoProduto_controller_1 = require("./controller/tabelaPrecoProduto.controller");
const dist_1 = require("@hunter-solucoes/node-arqt-base-gerenciador-usuarios/dist");
const typeorm_1 = require("@nestjs/typeorm");
const schedule_1 = require("@nestjs/schedule");
const tabelaPrecoProduto_entity_1 = require("./domain/tabelaPrecoProduto.entity");
let TabelaPrecoProdutoModule = class TabelaPrecoProdutoModule {
};
exports.TabelaPrecoProdutoModule = TabelaPrecoProdutoModule;
exports.TabelaPrecoProdutoModule = TabelaPrecoProdutoModule = __decorate([
    (0, common_1.Module)({
        imports: [
            utils_1.UtilsModule,
            httpClient_module_1.HttpClienteModule,
            dist_1.UsuarioModule,
            schedule_1.ScheduleModule.forRoot(),
            typeorm_1.TypeOrmModule.forFeature([tabelaPrecoProduto_entity_1.TabelaPrecoProduto])
        ],
        controllers: [tabelaPrecoProduto_controller_1.TabelaPrecoProdutoController],
        providers: [tabelaPrecoProduto_service_1.TabelaPrecoProdutoService, tabela_preco_notificacao_service_1.TabelaPrecoNotificacaoService],
        exports: [tabelaPrecoProduto_service_1.TabelaPrecoProdutoService]
    })
], TabelaPrecoProdutoModule);
//# sourceMappingURL=tabelaPrecoProduto.module.js.map
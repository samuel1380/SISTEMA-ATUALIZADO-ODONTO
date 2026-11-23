"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmpresaTabelaPrecoModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const dist_1 = require("@hunter-solucoes/node-arqt-base-gerenciador-usuarios/dist");
const empresaTabelaPreco_entity_1 = require("./domain/empresaTabelaPreco.entity");
const empresaTabelaPreco_service_1 = require("./business/empresaTabelaPreco.service");
const empresaTabelaPreco_controller_1 = require("./controller/empresaTabelaPreco.controller");
const tabelaPrecoProduto_module_1 = require("../tabelaPrecoProduto/tabelaPrecoProduto.module");
let EmpresaTabelaPrecoModule = class EmpresaTabelaPrecoModule {
};
exports.EmpresaTabelaPrecoModule = EmpresaTabelaPrecoModule;
exports.EmpresaTabelaPrecoModule = EmpresaTabelaPrecoModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([empresaTabelaPreco_entity_1.EmpresaTabelaPreco]),
            dist_1.UsuarioModule,
            tabelaPrecoProduto_module_1.TabelaPrecoProdutoModule,
        ],
        controllers: [empresaTabelaPreco_controller_1.EmpresaTabelaPrecoController],
        providers: [empresaTabelaPreco_service_1.EmpresaTabelaPrecoService],
        exports: [empresaTabelaPreco_service_1.EmpresaTabelaPrecoService],
    })
], EmpresaTabelaPrecoModule);
//# sourceMappingURL=empresaTabelaPreco.module.js.map
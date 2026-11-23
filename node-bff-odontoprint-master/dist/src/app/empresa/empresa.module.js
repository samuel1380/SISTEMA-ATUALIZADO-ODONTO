"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GerenciadorEmpresaModule = void 0;
const common_1 = require("@nestjs/common");
const gerenciadorEmpresa_service_1 = require("./business/gerenciadorEmpresa.service");
const gerenciadorEmpresa_controller_1 = require("./controller/gerenciadorEmpresa.controller");
const node_arqt_base_gerenciador_usuarios_1 = require("@hunter-solucoes/node-arqt-base-gerenciador-usuarios");
const dentista_module_1 = require("../dentista/dentista.module");
let GerenciadorEmpresaModule = class GerenciadorEmpresaModule {
};
exports.GerenciadorEmpresaModule = GerenciadorEmpresaModule;
exports.GerenciadorEmpresaModule = GerenciadorEmpresaModule = __decorate([
    (0, common_1.Module)({
        imports: [
            node_arqt_base_gerenciador_usuarios_1.EmpresaModule,
            node_arqt_base_gerenciador_usuarios_1.UsuarioModule,
            dentista_module_1.DentistaModule
        ],
        controllers: [gerenciadorEmpresa_controller_1.GerenciadorEmpresaController],
        providers: [gerenciadorEmpresa_service_1.GerenciadorEmpresaService],
        exports: []
    })
], GerenciadorEmpresaModule);
//# sourceMappingURL=empresa.module.js.map
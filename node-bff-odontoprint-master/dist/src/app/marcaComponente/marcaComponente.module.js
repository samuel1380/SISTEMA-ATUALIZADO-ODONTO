"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarcaComponenteModule = void 0;
const common_1 = require("@nestjs/common");
const utils_1 = require("../../utils");
const httpClient_module_1 = require("../../libs/httpClient/httpClient.module");
const marcaComponente_controller_1 = require("./controller/marcaComponente.controller");
const marcaComponente_service_1 = require("./business/marcaComponente.service");
const componente_module_1 = require("../componente/componente.module");
const typeorm_1 = require("@nestjs/typeorm");
const marcaComponente_entity_1 = require("./domain/marcaComponente.entity");
let MarcaComponenteModule = class MarcaComponenteModule {
};
exports.MarcaComponenteModule = MarcaComponenteModule;
exports.MarcaComponenteModule = MarcaComponenteModule = __decorate([
    (0, common_1.Module)({
        imports: [
            utils_1.UtilsModule,
            httpClient_module_1.HttpClienteModule,
            componente_module_1.ComponenteModule,
            typeorm_1.TypeOrmModule.forFeature([marcaComponente_entity_1.MarcaComponente])
        ],
        controllers: [marcaComponente_controller_1.MarcaComponenteController],
        providers: [marcaComponente_service_1.MarcaComponenteService],
        exports: [marcaComponente_service_1.MarcaComponenteService]
    })
], MarcaComponenteModule);
//# sourceMappingURL=marcaComponente.module.js.map
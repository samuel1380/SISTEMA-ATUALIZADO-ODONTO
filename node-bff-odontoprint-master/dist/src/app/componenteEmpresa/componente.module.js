"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComponenteEmpresaModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const componenteEmpresa_entity_1 = require("./domain/componenteEmpresa.entity");
const componenteEmpresa_service_1 = require("./business/componenteEmpresa.service");
const componenteEmpresa_controller_1 = require("./controller/componenteEmpresa.controller");
let ComponenteEmpresaModule = class ComponenteEmpresaModule {
};
exports.ComponenteEmpresaModule = ComponenteEmpresaModule;
exports.ComponenteEmpresaModule = ComponenteEmpresaModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([componenteEmpresa_entity_1.ComponenteEmpresa])],
        controllers: [componenteEmpresa_controller_1.ComponenteEmpresaController],
        providers: [componenteEmpresa_service_1.ComponenteEmpresaService],
        exports: [componenteEmpresa_service_1.ComponenteEmpresaService],
    })
], ComponenteEmpresaModule);
//# sourceMappingURL=componente.module.js.map
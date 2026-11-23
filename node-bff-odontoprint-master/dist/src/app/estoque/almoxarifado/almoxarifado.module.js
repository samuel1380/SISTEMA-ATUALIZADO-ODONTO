"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlmoxarifadoModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const almoxarifado_entity_1 = require("./domain/almoxarifado.entity");
const almoxarifado_service_1 = require("./service/almoxarifado.service");
const almoxarifado_controller_1 = require("./controller/almoxarifado.controller");
let AlmoxarifadoModule = class AlmoxarifadoModule {
};
exports.AlmoxarifadoModule = AlmoxarifadoModule;
exports.AlmoxarifadoModule = AlmoxarifadoModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([almoxarifado_entity_1.Almoxarifado])],
        controllers: [almoxarifado_controller_1.AlmoxarifadoController],
        providers: [almoxarifado_service_1.AlmoxarifadoService, common_1.Logger],
        exports: [almoxarifado_service_1.AlmoxarifadoService],
    })
], AlmoxarifadoModule);
//# sourceMappingURL=almoxarifado.module.js.map
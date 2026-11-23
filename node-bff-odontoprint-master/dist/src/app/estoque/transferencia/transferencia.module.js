"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransferenciaModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const transferencia_controller_1 = require("./controller/transferencia.controller");
const transferencia_entity_1 = require("./domain/transferencia.entity");
const transferencia_service_1 = require("./service/transferencia.service");
const estoque_entity_1 = require("../estoque/domain/estoque.entity");
const estoque_module_1 = require("../estoque/estoque.module");
const almoxarifado_module_1 = require("../almoxarifado/almoxarifado.module");
let TransferenciaModule = class TransferenciaModule {
};
exports.TransferenciaModule = TransferenciaModule;
exports.TransferenciaModule = TransferenciaModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([transferencia_entity_1.Transferencia, estoque_entity_1.Estoque, transferencia_entity_1.Transferencia]), estoque_module_1.EstoqueModule, almoxarifado_module_1.AlmoxarifadoModule],
        controllers: [transferencia_controller_1.TransferenciaController],
        providers: [transferencia_service_1.TransferenciaService],
        exports: [transferencia_service_1.TransferenciaService]
    })
], TransferenciaModule);
//# sourceMappingURL=transferencia.module.js.map
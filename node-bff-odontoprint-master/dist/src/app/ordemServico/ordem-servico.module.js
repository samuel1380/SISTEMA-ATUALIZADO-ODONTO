"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdemServicoModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const ordemServico_entity_1 = require("./domain/ordemServico.entity");
const ordemServicoItem_entity_1 = require("./domain/ordemServicoItem.entity");
const ordemServico_controller_1 = require("./controller/ordemServico.controller");
const ordemServico_service_1 = require("./business/ordemServico.service");
let OrdemServicoModule = class OrdemServicoModule {
};
exports.OrdemServicoModule = OrdemServicoModule;
exports.OrdemServicoModule = OrdemServicoModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([ordemServico_entity_1.OrdemServico, ordemServicoItem_entity_1.OrdemServicoItem])],
        controllers: [ordemServico_controller_1.OrdemServicoController],
        providers: [ordemServico_service_1.OrdemServicoService],
        exports: [ordemServico_service_1.OrdemServicoService]
    })
], OrdemServicoModule);
//# sourceMappingURL=ordem-servico.module.js.map
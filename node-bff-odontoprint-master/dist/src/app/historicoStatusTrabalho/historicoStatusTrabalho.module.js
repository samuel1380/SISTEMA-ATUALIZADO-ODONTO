"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HistoricoStatusTrabalhoModule = void 0;
const common_1 = require("@nestjs/common");
const utils_1 = require("../../utils");
const httpClient_module_1 = require("../../libs/httpClient/httpClient.module");
const historicoStatusTrabalho_service_1 = require("./business/historicoStatusTrabalho.service");
const historicoStatusTrabalho_controller_1 = require("./controller/historicoStatusTrabalho.controller");
const typeorm_1 = require("@nestjs/typeorm");
const historicoStatusTrabalho_entity_1 = require("./domain/historicoStatusTrabalho.entity");
let HistoricoStatusTrabalhoModule = class HistoricoStatusTrabalhoModule {
};
exports.HistoricoStatusTrabalhoModule = HistoricoStatusTrabalhoModule;
exports.HistoricoStatusTrabalhoModule = HistoricoStatusTrabalhoModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([historicoStatusTrabalho_entity_1.HistoricoStatusTrabalho]),
            utils_1.UtilsModule,
            httpClient_module_1.HttpClienteModule,
        ],
        controllers: [historicoStatusTrabalho_controller_1.HistoricoStatusTrabalhoController],
        providers: [historicoStatusTrabalho_service_1.HistoricoStatusTrabalhoService],
        exports: [historicoStatusTrabalho_service_1.HistoricoStatusTrabalhoService],
    })
], HistoricoStatusTrabalhoModule);
//# sourceMappingURL=historicoStatusTrabalho.module.js.map
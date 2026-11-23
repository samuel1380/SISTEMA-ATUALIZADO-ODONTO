"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FotoPacienteModule = void 0;
const common_1 = require("@nestjs/common");
const utils_1 = require("../../utils");
const httpClient_module_1 = require("../../libs/httpClient/httpClient.module");
const fotoPaciente_controller_1 = require("./controller/fotoPaciente.controller");
const fotoPaciente_service_1 = require("./business/fotoPaciente.service");
const fotoPaciente_repository_1 = require("./repository/fotoPaciente.repository");
const dist_1 = require("@hunter-solucoes/node-arqt-base-gerenciador-usuarios/dist");
const geradorGuid_service_1 = require("./business/geradorGuid.service");
let FotoPacienteModule = class FotoPacienteModule {
};
exports.FotoPacienteModule = FotoPacienteModule;
exports.FotoPacienteModule = FotoPacienteModule = __decorate([
    (0, common_1.Module)({
        imports: [
            utils_1.UtilsModule,
            httpClient_module_1.HttpClienteModule,
            dist_1.S3Module.forRoot({
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                privateKey: process.env.AWS_SECRET_ACCESS_KEY,
                endpoint: process.env.AWS_ENDPOINT
            }),
        ],
        controllers: [fotoPaciente_controller_1.FotoPacienteController],
        providers: [fotoPaciente_service_1.FotoPacienteService, fotoPaciente_repository_1.FotoPacienteRepositoryProvider, geradorGuid_service_1.GeradorGuidService],
        exports: [fotoPaciente_service_1.FotoPacienteService]
    })
], FotoPacienteModule);
//# sourceMappingURL=fotoPaciente.module.js.map
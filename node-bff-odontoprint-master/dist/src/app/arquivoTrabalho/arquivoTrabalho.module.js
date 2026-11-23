"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArquivoTrabalhoModule = void 0;
const common_1 = require("@nestjs/common");
const utils_1 = require("../../utils");
const httpClient_module_1 = require("../../libs/httpClient/httpClient.module");
const arquivoTrabalho_controller_1 = require("./controller/arquivoTrabalho.controller");
const arquivoTrabalho_service_1 = require("./business/arquivoTrabalho.service");
const arquivoTrabalho_repository_1 = require("./repository/arquivoTrabalho.repository");
const dist_1 = require("@hunter-solucoes/node-arqt-base-gerenciador-usuarios/dist");
const geradorGuid_service_1 = require("./business/geradorGuid.service");
let ArquivoTrabalhoModule = class ArquivoTrabalhoModule {
};
exports.ArquivoTrabalhoModule = ArquivoTrabalhoModule;
exports.ArquivoTrabalhoModule = ArquivoTrabalhoModule = __decorate([
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
        controllers: [arquivoTrabalho_controller_1.ArquivoTrabalhoController],
        providers: [arquivoTrabalho_service_1.ArquivoTrabalhoService, arquivoTrabalho_repository_1.ArquivoTrabalhoRepositoryProvider, geradorGuid_service_1.GeradorGuidService],
        exports: [arquivoTrabalho_service_1.ArquivoTrabalhoService]
    })
], ArquivoTrabalhoModule);
//# sourceMappingURL=arquivoTrabalho.module.js.map
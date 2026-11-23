"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DentistaModule = void 0;
const common_1 = require("@nestjs/common");
const dentista_service_1 = require("./business/dentista.service");
const dentista_controller_1 = require("./controller/dentista.controller");
const dist_1 = require("@hunter-solucoes/node-arqt-base-gerenciador-usuarios/dist");
const dentista_entity_1 = require("./domain/dentista.entity");
const typeorm_1 = require("@nestjs/typeorm");
let DentistaModule = class DentistaModule {
};
exports.DentistaModule = DentistaModule;
exports.DentistaModule = DentistaModule = __decorate([
    (0, common_1.Module)({
        imports: [
            dist_1.UsuarioModule,
            typeorm_1.TypeOrmModule.forFeature([dentista_entity_1.Dentista])
        ],
        controllers: [dentista_controller_1.DentistaController],
        providers: [dentista_service_1.DentistaService],
        exports: [dentista_service_1.DentistaService]
    })
], DentistaModule);
//# sourceMappingURL=dentista.module.js.map
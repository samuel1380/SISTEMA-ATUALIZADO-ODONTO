"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MotivoModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const motivo_service_1 = require("./business/motivo.service");
const motivo_controller_1 = require("./controller/motivo.controller");
const motivo_entity_1 = require("./domain/motivo.entity");
let MotivoModule = class MotivoModule {
};
exports.MotivoModule = MotivoModule;
exports.MotivoModule = MotivoModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([motivo_entity_1.Motivo])],
        controllers: [motivo_controller_1.MotivoController],
        providers: [motivo_service_1.MotivoService],
        exports: [motivo_service_1.MotivoService],
    })
], MotivoModule);
//# sourceMappingURL=motivo.module.js.map
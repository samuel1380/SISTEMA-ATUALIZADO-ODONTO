"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PacienteModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const paciente_service_1 = require("./business/paciente.service");
const node_arqt_base_gerenciador_usuarios_1 = require("@hunter-solucoes/node-arqt-base-gerenciador-usuarios");
const trabalho_entity_1 = require("../trabalho/domain/trabalho.entity");
const paciente_entity_1 = require("./domain/paciente.entity");
const paciente_controller_1 = require("./controller/paciente.controller");
const trabalho_module_1 = require("../trabalho/trabalho.module");
let PacienteModule = class PacienteModule {
};
exports.PacienteModule = PacienteModule;
exports.PacienteModule = PacienteModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([paciente_entity_1.Paciente, trabalho_entity_1.Trabalho]),
            (0, common_1.forwardRef)(() => trabalho_module_1.TrabalhoModule),
            node_arqt_base_gerenciador_usuarios_1.AuthModule,
            node_arqt_base_gerenciador_usuarios_1.EmpresaModule,
        ],
        controllers: [paciente_controller_1.PacienteController],
        providers: [paciente_service_1.PacienteService],
        exports: [paciente_service_1.PacienteService],
    })
], PacienteModule);
//# sourceMappingURL=paciente.module.js.map
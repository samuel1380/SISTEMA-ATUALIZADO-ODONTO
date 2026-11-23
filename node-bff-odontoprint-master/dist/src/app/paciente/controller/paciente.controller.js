"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PacienteController = void 0;
const common_1 = require("@nestjs/common");
const paciente_service_1 = require("../business/paciente.service");
const create_paciente_dto_1 = require("../dto/create-paciente.dto");
const update_paciente_dto_1 = require("../dto/update-paciente.dto");
const node_arqt_base_gerenciador_usuarios_1 = require("@hunter-solucoes/node-arqt-base-gerenciador-usuarios");
const swagger_1 = require("@nestjs/swagger");
const optional_parse_int_1 = require("../../financeiro/dto/optional-parse-int");
let PacienteController = class PacienteController {
    constructor(pacienteService) {
        this.pacienteService = pacienteService;
    }
    create(createPacienteDto, currentUser) {
        const idUsuarioCadastro = currentUser.user.idUsuario;
        return this.pacienteService.create(createPacienteDto, idUsuarioCadastro);
    }
    findAllByEmpresa(idEmpresa, idProfissional) {
        return this.pacienteService.findAll(idEmpresa, idProfissional);
    }
    findOne(id, currentUser) {
        const idEmpresa = currentUser.user.idEmpresa;
        return this.pacienteService.findOne(id, idEmpresa);
    }
    update(id, updatePacienteDto, currentUser) {
        return this.pacienteService.updatePacienteETrabalhos(id, updatePacienteDto, currentUser);
    }
    remove(id, currentUser) {
        const idEmpresa = currentUser.user.idEmpresa;
        return this.pacienteService.remove(id, idEmpresa);
    }
};
exports.PacienteController = PacienteController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, node_arqt_base_gerenciador_usuarios_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_paciente_dto_1.CreatePacienteDto, Object]),
    __metadata("design:returntype", void 0)
], PacienteController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('empresa/:idEmpresa'),
    __param(0, (0, common_1.Param)('idEmpresa', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)('idProfissional', optional_parse_int_1.OptionalParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", void 0)
], PacienteController.prototype, "findAllByEmpresa", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, node_arqt_base_gerenciador_usuarios_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], PacienteController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, node_arqt_base_gerenciador_usuarios_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_paciente_dto_1.UpdatePacienteDto, Object]),
    __metadata("design:returntype", void 0)
], PacienteController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, node_arqt_base_gerenciador_usuarios_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], PacienteController.prototype, "remove", null);
exports.PacienteController = PacienteController = __decorate([
    (0, swagger_1.ApiTags)('Paciente'),
    (0, node_arqt_base_gerenciador_usuarios_1.Roles)('admin', 'producao', 'vendas', 'financeiro'),
    (0, common_1.Controller)('paciente'),
    __metadata("design:paramtypes", [paciente_service_1.PacienteService])
], PacienteController);
//# sourceMappingURL=paciente.controller.js.map
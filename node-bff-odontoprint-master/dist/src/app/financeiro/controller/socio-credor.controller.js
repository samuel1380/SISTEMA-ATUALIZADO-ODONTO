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
exports.SocioCredorController = void 0;
const common_1 = require("@nestjs/common");
const node_arqt_base_gerenciador_usuarios_1 = require("@hunter-solucoes/node-arqt-base-gerenciador-usuarios");
const socio_credor_service_1 = require("../business/socio-credor.service");
const optional_parse_int_1 = require("../dto/optional-parse-int");
let SocioCredorController = class SocioCredorController {
    constructor(socioCredorService) {
        this.socioCredorService = socioCredorService;
    }
    criarSocio(dto) {
        return this.socioCredorService.criarSocio(dto);
    }
    listarSocios(idEmpresa) {
        return this.socioCredorService.listarSocios(idEmpresa);
    }
    buscarSocioPorId(id) {
        return this.socioCredorService.buscarSocioPorId(id);
    }
    atualizarSocio(id, dto) {
        return this.socioCredorService.atualizarSocio(id, dto);
    }
    excluirSocio(id) {
        return this.socioCredorService.excluirSocio(id);
    }
    criarCredor(dto) {
        return this.socioCredorService.criarCredor(dto);
    }
    listarCredores(idEmpresa) {
        return this.socioCredorService.listarCredores(idEmpresa);
    }
    buscarCredorPorId(id) {
        return this.socioCredorService.buscarCredorPorId(id);
    }
    atualizarCredor(id, dto) {
        return this.socioCredorService.atualizarCredor(id, dto);
    }
    excluirCredor(id) {
        return this.socioCredorService.excluirCredor(id);
    }
};
exports.SocioCredorController = SocioCredorController;
__decorate([
    (0, node_arqt_base_gerenciador_usuarios_1.Roles)('admin'),
    (0, common_1.Post)('socios'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SocioCredorController.prototype, "criarSocio", null);
__decorate([
    (0, node_arqt_base_gerenciador_usuarios_1.Roles)('admin'),
    (0, common_1.Get)('socios'),
    __param(0, (0, common_1.Query)('idEmpresa', optional_parse_int_1.OptionalParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], SocioCredorController.prototype, "listarSocios", null);
__decorate([
    (0, node_arqt_base_gerenciador_usuarios_1.Roles)('admin'),
    (0, common_1.Get)('socios/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], SocioCredorController.prototype, "buscarSocioPorId", null);
__decorate([
    (0, node_arqt_base_gerenciador_usuarios_1.Roles)('admin'),
    (0, common_1.Put)('socios/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], SocioCredorController.prototype, "atualizarSocio", null);
__decorate([
    (0, node_arqt_base_gerenciador_usuarios_1.Roles)('admin'),
    (0, common_1.Delete)('socios/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], SocioCredorController.prototype, "excluirSocio", null);
__decorate([
    (0, node_arqt_base_gerenciador_usuarios_1.Roles)('admin'),
    (0, common_1.Post)('credores'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SocioCredorController.prototype, "criarCredor", null);
__decorate([
    (0, node_arqt_base_gerenciador_usuarios_1.Roles)('admin'),
    (0, common_1.Get)('credores'),
    __param(0, (0, common_1.Query)('idEmpresa', optional_parse_int_1.OptionalParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], SocioCredorController.prototype, "listarCredores", null);
__decorate([
    (0, node_arqt_base_gerenciador_usuarios_1.Roles)('admin'),
    (0, common_1.Get)('credores/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], SocioCredorController.prototype, "buscarCredorPorId", null);
__decorate([
    (0, node_arqt_base_gerenciador_usuarios_1.Roles)('admin'),
    (0, common_1.Put)('credores/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], SocioCredorController.prototype, "atualizarCredor", null);
__decorate([
    (0, node_arqt_base_gerenciador_usuarios_1.Roles)('admin'),
    (0, common_1.Delete)('credores/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], SocioCredorController.prototype, "excluirCredor", null);
exports.SocioCredorController = SocioCredorController = __decorate([
    (0, common_1.Controller)('financeiro/capital'),
    __metadata("design:paramtypes", [socio_credor_service_1.SocioCredorService])
], SocioCredorController);
//# sourceMappingURL=socio-credor.controller.js.map
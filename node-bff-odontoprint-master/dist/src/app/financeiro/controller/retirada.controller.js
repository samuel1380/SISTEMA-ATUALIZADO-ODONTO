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
exports.RetiradaController = void 0;
const common_1 = require("@nestjs/common");
const node_arqt_base_gerenciador_usuarios_1 = require("@hunter-solucoes/node-arqt-base-gerenciador-usuarios");
const retirada_service_1 = require("../business/retirada.service");
const create_retirada_dto_1 = require("../dto/create-retirada.dto");
const retirada_entity_1 = require("../domain/retirada.entity");
const optional_parse_int_1 = require("../dto/optional-parse-int");
let RetiradaController = class RetiradaController {
    constructor(retiradaService) {
        this.retiradaService = retiradaService;
    }
    async registrarRetirada(dto) {
        return this.retiradaService.registrarRetirada(dto);
    }
    async listarRetiradas(idSocio, dataInicio, dataFim, tipo) {
        return this.retiradaService.listarRetiradas(idSocio, dataInicio, dataFim, tipo);
    }
    async buscarRetirada(id) {
        return this.retiradaService.buscarRetiradaPorId(id);
    }
};
exports.RetiradaController = RetiradaController;
__decorate([
    (0, node_arqt_base_gerenciador_usuarios_1.Roles)('admin'),
    (0, common_1.Post)('retirada'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_retirada_dto_1.CreateRetiradaDto]),
    __metadata("design:returntype", Promise)
], RetiradaController.prototype, "registrarRetirada", null);
__decorate([
    (0, node_arqt_base_gerenciador_usuarios_1.Roles)('admin', 'financeiro'),
    (0, common_1.Get)('retiradas'),
    __param(0, (0, common_1.Query)('idSocio', optional_parse_int_1.OptionalParseIntPipe)),
    __param(1, (0, common_1.Query)('dataInicio')),
    __param(2, (0, common_1.Query)('dataFim')),
    __param(3, (0, common_1.Query)('tipo')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, String, String]),
    __metadata("design:returntype", Promise)
], RetiradaController.prototype, "listarRetiradas", null);
__decorate([
    (0, node_arqt_base_gerenciador_usuarios_1.Roles)('admin', 'financeiro'),
    (0, common_1.Get)('retiradas/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], RetiradaController.prototype, "buscarRetirada", null);
exports.RetiradaController = RetiradaController = __decorate([
    (0, common_1.Controller)('financeiro/capital'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })),
    __metadata("design:paramtypes", [retirada_service_1.RetiradaService])
], RetiradaController);
//# sourceMappingURL=retirada.controller.js.map
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
exports.AlmoxarifadoController = void 0;
const common_1 = require("@nestjs/common");
const almoxarifado_service_1 = require("../service/almoxarifado.service");
const create_almoxarifado_dto_1 = require("../domain/dto/create-almoxarifado.dto");
const update_almoxarifado_dto_1 = require("../domain/dto/update-almoxarifado.dto");
const node_arqt_base_gerenciador_usuarios_1 = require("@hunter-solucoes/node-arqt-base-gerenciador-usuarios");
let AlmoxarifadoController = class AlmoxarifadoController {
    constructor(almoxarifadoService) {
        this.almoxarifadoService = almoxarifadoService;
    }
    create(createAlmoxarifadoDto) {
        return this.almoxarifadoService.create(createAlmoxarifadoDto);
    }
    findAll() {
        return this.almoxarifadoService.findAll();
    }
    findOne(id) {
        return this.almoxarifadoService.findOne(id);
    }
    update(id, updateAlmoxarifadoDto) {
        return this.almoxarifadoService.update(id, updateAlmoxarifadoDto);
    }
    remove(id) {
        return this.almoxarifadoService.remove(id);
    }
};
exports.AlmoxarifadoController = AlmoxarifadoController;
__decorate([
    (0, node_arqt_base_gerenciador_usuarios_1.Roles)('admin', 'vendas', 'financeiro'),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_almoxarifado_dto_1.CreateAlmoxarifadoDto]),
    __metadata("design:returntype", void 0)
], AlmoxarifadoController.prototype, "create", null);
__decorate([
    (0, node_arqt_base_gerenciador_usuarios_1.Roles)('admin', 'vendas', 'financeiro'),
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AlmoxarifadoController.prototype, "findAll", null);
__decorate([
    (0, node_arqt_base_gerenciador_usuarios_1.Roles)('admin', 'vendas', 'financeiro'),
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], AlmoxarifadoController.prototype, "findOne", null);
__decorate([
    (0, node_arqt_base_gerenciador_usuarios_1.Roles)('admin', 'vendas', 'financeiro'),
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_almoxarifado_dto_1.UpdateAlmoxarifadoDto]),
    __metadata("design:returntype", void 0)
], AlmoxarifadoController.prototype, "update", null);
__decorate([
    (0, node_arqt_base_gerenciador_usuarios_1.Roles)('admin', 'vendas', 'financeiro'),
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], AlmoxarifadoController.prototype, "remove", null);
exports.AlmoxarifadoController = AlmoxarifadoController = __decorate([
    (0, common_1.Controller)('almoxarifado'),
    __metadata("design:paramtypes", [almoxarifado_service_1.AlmoxarifadoService])
], AlmoxarifadoController);
//# sourceMappingURL=almoxarifado.controller.js.map
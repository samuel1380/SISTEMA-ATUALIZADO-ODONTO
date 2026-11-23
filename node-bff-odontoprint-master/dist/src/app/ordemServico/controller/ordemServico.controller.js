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
exports.OrdemServicoController = void 0;
const dist_1 = require("@hunter-solucoes/node-arqt-base-gerenciador-usuarios/dist");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const ordemServico_entity_1 = require("../domain/ordemServico.entity");
const ordemServico_service_1 = require("../business/ordemServico.service");
const ordemServico_dto_1 = require("../dto/ordemServico.dto");
let OrdemServicoController = class OrdemServicoController {
    constructor(ordemServicoService) {
        this.ordemServicoService = ordemServicoService;
    }
    async cadastrar(currentUser, ordemServicoDto) {
        const ordemServico = (0, class_transformer_1.plainToClass)(ordemServico_entity_1.OrdemServico, ordemServicoDto);
        return this.ordemServicoService.cadastrar(currentUser, [ordemServico]);
    }
    async buscarAtivos() {
        return this.ordemServicoService.buscarAtivos();
    }
    async buscarPorId(id) {
        return this.ordemServicoService.buscarPorId(id);
    }
    async editar(id, ordemServicoDto) {
        return this.ordemServicoService.editar(id, ordemServicoDto);
    }
};
exports.OrdemServicoController = OrdemServicoController;
__decorate([
    (0, dist_1.Roles)('admin'),
    (0, common_1.Post)(),
    __param(0, (0, dist_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, ordemServico_dto_1.OrdemServicoDto]),
    __metadata("design:returntype", Promise)
], OrdemServicoController.prototype, "cadastrar", null);
__decorate([
    (0, dist_1.Roles)('admin'),
    (0, common_1.Get)('ativos'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], OrdemServicoController.prototype, "buscarAtivos", null);
__decorate([
    (0, dist_1.Roles)('admin'),
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], OrdemServicoController.prototype, "buscarPorId", null);
__decorate([
    (0, dist_1.Roles)('admin'),
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], OrdemServicoController.prototype, "editar", null);
exports.OrdemServicoController = OrdemServicoController = __decorate([
    (0, swagger_1.ApiTags)('Ordem de Serviço'),
    (0, common_1.Controller)('ordem-servico'),
    __metadata("design:paramtypes", [ordemServico_service_1.OrdemServicoService])
], OrdemServicoController);
//# sourceMappingURL=ordemServico.controller.js.map
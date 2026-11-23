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
exports.FornecedorController = void 0;
const common_1 = require("@nestjs/common");
const node_arqt_base_gerenciador_usuarios_1 = require("@hunter-solucoes/node-arqt-base-gerenciador-usuarios");
const fornecedor_service_1 = require("../business/fornecedor.service");
const create_fornecedor_dto_1 = require("../dto/create-fornecedor.dto");
const update_fornecedor_dto_1 = require("../dto/update-fornecedor.dto");
let FornecedorController = class FornecedorController {
    constructor(fornecedorService) {
        this.fornecedorService = fornecedorService;
    }
    criar(dto) {
        return this.fornecedorService.criar(dto);
    }
    listar(ativo) {
        const ativoBool = ativo === 'true' ? true : ativo === 'false' ? false : undefined;
        return this.fornecedorService.listar(ativoBool);
    }
    buscarPorId(id) {
        return this.fornecedorService.buscarPorId(id);
    }
    atualizar(id, dto) {
        return this.fornecedorService.atualizar(id, dto);
    }
    excluir(id) {
        return this.fornecedorService.excluir(id);
    }
};
exports.FornecedorController = FornecedorController;
__decorate([
    (0, node_arqt_base_gerenciador_usuarios_1.Roles)('admin', 'financeiro'),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_fornecedor_dto_1.CreateFornecedorDto]),
    __metadata("design:returntype", void 0)
], FornecedorController.prototype, "criar", null);
__decorate([
    (0, node_arqt_base_gerenciador_usuarios_1.Roles)('admin', 'financeiro'),
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('ativo')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], FornecedorController.prototype, "listar", null);
__decorate([
    (0, node_arqt_base_gerenciador_usuarios_1.Roles)('admin', 'financeiro'),
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], FornecedorController.prototype, "buscarPorId", null);
__decorate([
    (0, node_arqt_base_gerenciador_usuarios_1.Roles)('admin', 'financeiro'),
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_fornecedor_dto_1.UpdateFornecedorDto]),
    __metadata("design:returntype", void 0)
], FornecedorController.prototype, "atualizar", null);
__decorate([
    (0, node_arqt_base_gerenciador_usuarios_1.Roles)('admin', 'financeiro'),
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], FornecedorController.prototype, "excluir", null);
exports.FornecedorController = FornecedorController = __decorate([
    (0, common_1.Controller)('financeiro/fornecedores'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })),
    __metadata("design:paramtypes", [fornecedor_service_1.FornecedorService])
], FornecedorController);
//# sourceMappingURL=fornecedor.controller.js.map
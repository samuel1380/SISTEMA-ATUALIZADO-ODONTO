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
exports.CategoriaController = void 0;
const common_1 = require("@nestjs/common");
const node_arqt_base_gerenciador_usuarios_1 = require("@hunter-solucoes/node-arqt-base-gerenciador-usuarios");
const create_categoria_dto_1 = require("../dto/create-categoria.dto");
const update_categoria_dto_1 = require("../dto/update-categoria.dto");
const categoria_service_1 = require("../business/categoria.service");
let CategoriaController = class CategoriaController {
    constructor(categoriaService) {
        this.categoriaService = categoriaService;
    }
    create(createCategoriaDto) {
        return this.categoriaService.create(createCategoriaDto);
    }
    findAll(todas) {
        const incluirSubcategorias = todas === 'true' || todas === '1';
        return this.categoriaService.findAll(incluirSubcategorias);
    }
    findOne(id) {
        return this.categoriaService.findOne(id);
    }
    update(id, updateCategoriaDto) {
        return this.categoriaService.update(id, updateCategoriaDto);
    }
    remove(id) {
        return this.categoriaService.remove(id);
    }
};
exports.CategoriaController = CategoriaController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_categoria_dto_1.CreateCategoriaDto]),
    __metadata("design:returntype", void 0)
], CategoriaController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('todas')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CategoriaController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], CategoriaController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_categoria_dto_1.UpdateCategoriaDto]),
    __metadata("design:returntype", void 0)
], CategoriaController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], CategoriaController.prototype, "remove", null);
exports.CategoriaController = CategoriaController = __decorate([
    (0, node_arqt_base_gerenciador_usuarios_1.Roles)('admin', 'financeiro'),
    (0, common_1.Controller)('financeiro/categorias'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })),
    __metadata("design:paramtypes", [categoria_service_1.CategoriaService])
], CategoriaController);
//# sourceMappingURL=categoria.controller.js.map
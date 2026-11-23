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
exports.ComponenteEmpresaController = void 0;
const dist_1 = require("@hunter-solucoes/node-arqt-base-gerenciador-usuarios/dist");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const componenteEmpresa_service_1 = require("../business/componenteEmpresa.service");
let ComponenteEmpresaController = class ComponenteEmpresaController {
    constructor(componenteEmpresaService) {
        this.componenteEmpresaService = componenteEmpresaService;
    }
    async buscarComponenteEmpresa(currentUser, idEmpresaHeaders) {
        var _a;
        const idEmpresa = currentUser.user.empresas && ((_a = currentUser.user.empresas[0]) === null || _a === void 0 ? void 0 : _a.idEmpresa);
        if (currentUser.user.tipoUsuario === "externo" && idEmpresa) {
            return this.componenteEmpresaService.buscarPorEmpresa(idEmpresa);
        }
        else if (currentUser.user.tipoUsuario === "interno") {
            return this.componenteEmpresaService.buscarPorEmpresa(idEmpresaHeaders);
        }
        return [];
    }
};
exports.ComponenteEmpresaController = ComponenteEmpresaController;
__decorate([
    (0, dist_1.Roles)('admin', 'comum'),
    (0, common_1.Get)(),
    __param(0, (0, dist_1.CurrentUser)()),
    __param(1, (0, common_1.Headers)('idEmpresa')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ComponenteEmpresaController.prototype, "buscarComponenteEmpresa", null);
exports.ComponenteEmpresaController = ComponenteEmpresaController = __decorate([
    (0, swagger_1.ApiTags)('Componente da Empresa'),
    (0, common_1.Controller)('componenteempresa'),
    __metadata("design:paramtypes", [componenteEmpresa_service_1.ComponenteEmpresaService])
], ComponenteEmpresaController);
//# sourceMappingURL=componenteEmpresa.controller.js.map
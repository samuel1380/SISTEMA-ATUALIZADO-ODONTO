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
exports.BoletoAtrasadoController = void 0;
const common_1 = require("@nestjs/common");
const node_arqt_base_gerenciador_usuarios_1 = require("@hunter-solucoes/node-arqt-base-gerenciador-usuarios");
const boleto_atrasado_service_1 = require("../business/boleto-atrasado.service");
const optional_parse_int_1 = require("../dto/optional-parse-int");
const tipo_lancamento_enum_1 = require("../domain/tipo-lancamento.enum");
let BoletoAtrasadoController = class BoletoAtrasadoController {
    constructor(boletoAtrasadoService) {
        this.boletoAtrasadoService = boletoAtrasadoService;
    }
    listarBoletosAtrasados(idEmpresa, tipo) {
        console.log('listarBoletosAtrasados query params:', { idEmpresa, tipo });
        return this.boletoAtrasadoService.listarBoletosAtrasados(idEmpresa, tipo);
    }
    obterResumoBoleto(id) {
        return this.boletoAtrasadoService.obterResumoBoleto(parseInt(id, 10));
    }
};
exports.BoletoAtrasadoController = BoletoAtrasadoController;
__decorate([
    (0, node_arqt_base_gerenciador_usuarios_1.Roles)('admin'),
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('idEmpresa', optional_parse_int_1.OptionalParseIntPipe)),
    __param(1, (0, common_1.Query)('tipo')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String]),
    __metadata("design:returntype", void 0)
], BoletoAtrasadoController.prototype, "listarBoletosAtrasados", null);
__decorate([
    (0, node_arqt_base_gerenciador_usuarios_1.Roles)('admin'),
    (0, common_1.Get)(':id/resumo'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], BoletoAtrasadoController.prototype, "obterResumoBoleto", null);
exports.BoletoAtrasadoController = BoletoAtrasadoController = __decorate([
    (0, common_1.Controller)('financeiro/boletos-atrasados'),
    __metadata("design:paramtypes", [boleto_atrasado_service_1.BoletoAtrasadoService])
], BoletoAtrasadoController);
//# sourceMappingURL=boleto-atrasado.controller.js.map
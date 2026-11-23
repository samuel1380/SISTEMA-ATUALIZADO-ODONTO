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
exports.LogsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const logs_service_1 = require("../business/logs.service");
const dist_1 = require("@hunter-solucoes/node-arqt-base-gerenciador-usuarios/dist");
let LogsController = class LogsController {
    constructor(logsService) {
        this.logsService = logsService;
    }
    async listarLogs(query) {
        return this.logsService.listarLogs(query);
    }
    async buscarLogPorId(idLog) {
        return this.logsService.buscarLogPorId(idLog);
    }
};
exports.LogsController = LogsController;
__decorate([
    (0, dist_1.Roles)('admin'),
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], LogsController.prototype, "listarLogs", null);
__decorate([
    (0, dist_1.Roles)('admin'),
    (0, common_1.Get)(':idLog'),
    __param(0, (0, common_1.Param)('idLog', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], LogsController.prototype, "buscarLogPorId", null);
exports.LogsController = LogsController = __decorate([
    (0, swagger_1.ApiTags)('Logs'),
    (0, common_1.Controller)('logs'),
    __metadata("design:paramtypes", [logs_service_1.LogsService])
], LogsController);
//# sourceMappingURL=logs.controller.js.map
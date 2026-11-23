"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpExceptionFilter = void 0;
const common_1 = require("@nestjs/common");
let HttpExceptionFilter = class HttpExceptionFilter {
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        const timestamp = new Date().toISOString();
        const isHttp = exception instanceof common_1.HttpException || (exception && typeof exception.getStatus === 'function');
        const resposta = isHttp ? exception.getResponse() : ((exception === null || exception === void 0 ? void 0 : exception.message) || 'Erro interno do servidor');
        const status = isHttp ? exception.getStatus() : common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        console.log(`[ERROR] [${timestamp}] ip=${request === null || request === void 0 ? void 0 : request.header['x-forwarded-for']} url=${request.url} status=${status} mensagem=${JSON.stringify(resposta)} stack=${exception.stack}`);
        response
            .status(status)
            .json({
            statusCode: status,
            timestamp,
            path: request.url,
            resposta
        });
    }
};
exports.HttpExceptionFilter = HttpExceptionFilter;
exports.HttpExceptionFilter = HttpExceptionFilter = __decorate([
    (0, common_1.Catch)()
], HttpExceptionFilter);
//# sourceMappingURL=httpExceptionFilter.js.map
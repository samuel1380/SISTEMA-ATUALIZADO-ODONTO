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
        var _a, _b, _c;
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const exceptionResponse = exception.response;
        console.error(exception.stack);
        if (!exceptionResponse) {
            response
                .status(common_1.HttpStatus.INTERNAL_SERVER_ERROR)
                .json({
                statusCode: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
                timestamp: new Date().toISOString(),
                path: (_a = exceptionResponse === null || exceptionResponse === void 0 ? void 0 : exceptionResponse.config) === null || _a === void 0 ? void 0 : _a.url,
                message: exception.message
            });
        }
        const status = (exceptionResponse === null || exceptionResponse === void 0 ? void 0 : exceptionResponse.status) || (exceptionResponse === null || exceptionResponse === void 0 ? void 0 : exceptionResponse.statusCode);
        const message = ((_b = exceptionResponse === null || exceptionResponse === void 0 ? void 0 : exceptionResponse.data) === null || _b === void 0 ? void 0 : _b.message) || (exceptionResponse === null || exceptionResponse === void 0 ? void 0 : exceptionResponse.message);
        response
            .status(status)
            .json({
            statusCode: status,
            timestamp: new Date().toISOString(),
            path: (_c = exceptionResponse === null || exceptionResponse === void 0 ? void 0 : exceptionResponse.config) === null || _c === void 0 ? void 0 : _c.url,
            message: message
        });
    }
};
exports.HttpExceptionFilter = HttpExceptionFilter;
exports.HttpExceptionFilter = HttpExceptionFilter = __decorate([
    (0, common_1.Catch)()
], HttpExceptionFilter);
//# sourceMappingURL=httpExceptionFilter.js.map
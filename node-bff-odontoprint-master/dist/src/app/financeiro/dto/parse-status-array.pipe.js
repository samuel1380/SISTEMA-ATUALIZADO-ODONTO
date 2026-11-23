"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParseStatusArrayPipe = void 0;
const common_1 = require("@nestjs/common");
const fatura_entity_1 = require("../domain/fatura.entity");
let ParseStatusArrayPipe = class ParseStatusArrayPipe {
    transform(value) {
        if (value === undefined || value === null || value === '') {
            return undefined;
        }
        if (Array.isArray(value)) {
            return this.validateAndReturn(value);
        }
        if (typeof value === 'string') {
            if (value.includes(',')) {
                const values = value.split(',').map(v => v.trim()).filter(v => v);
                return this.validateAndReturn(values);
            }
            return this.validateAndReturn([value.trim()]);
        }
        return this.validateAndReturn([String(value)]);
    }
    validateAndReturn(values) {
        const validStatuses = Object.values(fatura_entity_1.StatusFatura);
        const statusArray = [];
        for (const val of values) {
            if (validStatuses.includes(val)) {
                statusArray.push(val);
            }
            else {
                throw new common_1.BadRequestException(`Status inválido: ${val}. Status válidos: ${validStatuses.join(', ')}`);
            }
        }
        return statusArray.length > 0 ? statusArray : undefined;
    }
};
exports.ParseStatusArrayPipe = ParseStatusArrayPipe;
exports.ParseStatusArrayPipe = ParseStatusArrayPipe = __decorate([
    (0, common_1.Injectable)()
], ParseStatusArrayPipe);
//# sourceMappingURL=parse-status-array.pipe.js.map
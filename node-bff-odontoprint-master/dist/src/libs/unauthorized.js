"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Unauthorized = void 0;
const common_1 = require("@nestjs/common");
class Unauthorized extends common_1.HttpException {
    constructor(mensagem) {
        super(mensagem, common_1.HttpStatus.UNAUTHORIZED);
        this.mensagem = mensagem;
    }
}
exports.Unauthorized = Unauthorized;
//# sourceMappingURL=unauthorized.js.map
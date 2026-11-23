"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BadRequest = void 0;
const common_1 = require("@nestjs/common");
class BadRequest extends common_1.HttpException {
    constructor(mensagem) {
        super(mensagem, common_1.HttpStatus.BAD_REQUEST);
        this.mensagem = mensagem;
    }
}
exports.BadRequest = BadRequest;
//# sourceMappingURL=badRequest.js.map
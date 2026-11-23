"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotFound = void 0;
const common_1 = require("@nestjs/common");
class NotFound extends common_1.HttpException {
    constructor(id) {
        super(`${id} não foi encontrado`, common_1.HttpStatus.NOT_FOUND);
        this.id = id;
    }
}
exports.NotFound = NotFound;
//# sourceMappingURL=notFound.js.map
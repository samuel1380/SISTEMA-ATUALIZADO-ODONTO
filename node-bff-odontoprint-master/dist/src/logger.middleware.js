"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loggerMiddleware = loggerMiddleware;
function loggerMiddleware(req, res, next) {
    console.log(`[INFO] [${new Date().toISOString()}] | ip=${req.ip} method=${req.method} path=${req.path}`);
    next();
}
//# sourceMappingURL=logger.middleware.js.map
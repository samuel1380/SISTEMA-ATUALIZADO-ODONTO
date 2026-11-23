"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./typeorm-patch");
require("dotenv/config");
process.on('uncaughtException', (err) => {
    console.error('UNCAUGHT EXCEPTION:', err);
});
process.on('unhandledRejection', (reason, promise) => {
    console.error('UNHANDLED REJECTION:', reason);
});
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const server_middleware_1 = require("./server.middleware");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const logger_middleware_1 = require("./logger.middleware");
const bodyParser = require("body-parser");
const typeorm_transactional_cls_hooked_1 = require("typeorm-transactional-cls-hooked");
const httpExceptionFilter_1 = require("./libs/httpExceptionFilter");
const helmet = require("helmet");
function createDocument(app) {
    if (process.env.NODE_ENV != 'PRD') {
        const options = new swagger_1.DocumentBuilder()
            .setTitle('node-arqt-base-gerenciador-usuarios - Node')
            .setDescription('API de consulta')
            .setVersion('1.0.0')
            .addBearerAuth()
            .build();
        const document = swagger_1.SwaggerModule.createDocument(app, options);
        swagger_1.SwaggerModule.setup('api/documentation', app, document);
    }
}
async function bootstrap() {
    (0, typeorm_transactional_cls_hooked_1.initializeTransactionalContext)();
    (0, typeorm_transactional_cls_hooked_1.patchTypeORMRepositoryWithBaseRepository)();
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.use(helmet());
    app.useGlobalFilters(new httpExceptionFilter_1.HttpExceptionFilter());
    app.use(bodyParser.json({ limit: '5mb' }));
    app.use(bodyParser.urlencoded({ limit: '5mb', extended: true }));
    app.use(server_middleware_1.statusMiddleware);
    app.use(logger_middleware_1.loggerMiddleware);
    app.useGlobalPipes(new common_1.ValidationPipe({ whitelist: true, transform: true }));
    app.enableCors({ origin: '*' });
    if (process.env.NODE_ENV !== 'PRD') {
        createDocument(app);
    }
    await app.listen(process.env.PORT);
    console.log(`Start api on port ${process.env.PORT}`);
}
bootstrap();
//# sourceMappingURL=main.js.map
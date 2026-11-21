require('module-alias/register')

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { statusMiddleware } from './server.middleware';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { loggerMiddleware } from './logger.middleware';
import bodyParser = require('body-parser');
import {
  initializeTransactionalContext,
  patchTypeORMRepositoryWithBaseRepository
} from 'typeorm-transactional-cls-hooked';
import { HttpExceptionFilter } from './libs/httpExceptionFilter';
import * as helmet from 'helmet';

function createDocument(app: INestApplication) {

  if (process.env.NODE_ENV != 'PRD') {
    const options = new DocumentBuilder()
      .setTitle('node-arqt-base-gerenciador-usuarios - Node')
      .setDescription('API de consulta')
      .setVersion('1.0.0')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup('api/documentation', app, document);
  }
}

async function bootstrap() {
  initializeTransactionalContext();
  patchTypeORMRepositoryWithBaseRepository();

  const app = await NestFactory.create(AppModule);
  app.use(helmet());

  app.useGlobalFilters(new HttpExceptionFilter());

  app.use(bodyParser.json({ limit: '5mb' }));
  app.use(bodyParser.urlencoded({ limit: '5mb', extended: true }));

  app.use(statusMiddleware);
  app.use(loggerMiddleware);

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  app.enableCors({ origin: '*' });
  if (process.env.NODE_ENV !== 'PRD') {
    createDocument(app);
  }

  await app.listen(process.env.PORT);
  console.log(`Start api on port ${process.env.PORT}`);
}

bootstrap();

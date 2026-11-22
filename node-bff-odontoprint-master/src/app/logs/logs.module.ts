import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { LogsController } from './controller/logs.controller';
import { LogsService } from './business/logs.service';
import { LogAuditoria } from './domain/log-auditoria.entity';
import { AuditInterceptor } from './audit.interceptor';

@Module({
  imports: [TypeOrmModule.forFeature([LogAuditoria])],
  controllers: [LogsController],
  providers: [
    LogsService,
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditInterceptor,
    },
  ],
  exports: [LogsService],
})
export class LogsModule {}

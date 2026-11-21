import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MotivoService } from './business/motivo.service';
import { MotivoController } from './controller/motivo.controller';
import { Motivo } from './domain/motivo.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Motivo])],
  controllers: [MotivoController],
  providers: [MotivoService],
  exports: [MotivoService],
})
export class MotivoModule {}


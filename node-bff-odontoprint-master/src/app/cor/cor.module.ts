import { Module } from '@nestjs/common';
import { CorService } from './business/cor.service';
import { CorController } from './controller/cor.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cor } from './domain/cor.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Cor])
  ],
  controllers: [ CorController ],
  providers: [CorService],
  exports: [CorService]
})
export class CorModule { }

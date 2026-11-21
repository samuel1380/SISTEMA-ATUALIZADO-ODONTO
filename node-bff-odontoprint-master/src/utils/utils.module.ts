import { Module } from '@nestjs/common';
import { EncryptaService } from './encrypta.sevice';

@Module({
  imports: [],
  controllers: [],
  providers: [EncryptaService],
  exports: [EncryptaService],
})
export class UtilsModule {}

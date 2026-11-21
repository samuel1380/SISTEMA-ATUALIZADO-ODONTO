import { Module } from '@nestjs/common';
import { UtilsModule } from 'src/utils';
import { HttpClienteModule } from 'src/libs/httpClient/httpClient.module';
import { HistoricoStatusTrabalhoService } from './business/historicoStatusTrabalho.service';
import { HistoricoStatusTrabalhoController } from './controller/historicoStatusTrabalho.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HistoricoStatusTrabalho } from './domain/historicoStatusTrabalho.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([HistoricoStatusTrabalho]),
    UtilsModule,
    HttpClienteModule,
  ],
  controllers: [HistoricoStatusTrabalhoController],
  providers: [HistoricoStatusTrabalhoService],
  exports: [HistoricoStatusTrabalhoService],
})
export class HistoricoStatusTrabalhoModule {}


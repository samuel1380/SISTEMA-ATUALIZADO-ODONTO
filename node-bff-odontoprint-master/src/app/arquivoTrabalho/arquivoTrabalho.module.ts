import { Module } from '@nestjs/common';
import { UtilsModule } from 'src/utils';
import { HttpClienteModule } from 'src/libs/httpClient/httpClient.module';
import { ArquivoTrabalhoController } from './controller/arquivoTrabalho.controller';
import { ArquivoTrabalhoService } from './business/arquivoTrabalho.service';
import { ArquivoTrabalhoRepositoryProvider } from './repository/arquivoTrabalho.repository';
import { S3Module } from '@hunter-solucoes/node-arqt-base-gerenciador-usuarios/dist';
import { GeradorGuidService } from './business/geradorGuid.service';

@Module({
  imports: [
    UtilsModule,
    HttpClienteModule,
    S3Module.forRoot({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      privateKey: process.env.AWS_SECRET_ACCESS_KEY,
      endpoint: process.env.AWS_ENDPOINT
    }),
  ],
  controllers: [ ArquivoTrabalhoController ],
  providers: [ArquivoTrabalhoService, ArquivoTrabalhoRepositoryProvider, GeradorGuidService],
  exports: [ArquivoTrabalhoService]
})
export class ArquivoTrabalhoModule { }

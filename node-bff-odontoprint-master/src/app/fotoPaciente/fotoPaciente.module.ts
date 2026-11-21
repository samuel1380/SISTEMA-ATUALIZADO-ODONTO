import { Module } from '@nestjs/common';
import { UtilsModule } from 'src/utils';
import { HttpClienteModule } from 'src/libs/httpClient/httpClient.module';
import { FotoPacienteController } from './controller/fotoPaciente.controller';
import { FotoPacienteService } from './business/fotoPaciente.service';
import { FotoPacienteRepositoryProvider } from './repository/fotoPaciente.repository';
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
  controllers: [ FotoPacienteController ],
  providers: [FotoPacienteService, FotoPacienteRepositoryProvider, GeradorGuidService],
  exports: [FotoPacienteService]
})
export class FotoPacienteModule { }

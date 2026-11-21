import { Module } from '@nestjs/common';
import { UtilsModule } from 'src/utils';
import { EmpresaService } from './business/empresa.service';
import { HttpClienteModule } from 'src/libs/httpClient/httpClient.module';
import { EmailModule } from '../email/email.modules';
import { EmpresaRepositoryProvider } from './repository/empresa.repository';

@Module({
  imports: [
    UtilsModule,
    HttpClienteModule,
    EmailModule
  ],
  controllers: [ ],
  providers: [EmpresaService, EmpresaRepositoryProvider],
  exports: [EmpresaService]
})
export class EmpresaModule { }

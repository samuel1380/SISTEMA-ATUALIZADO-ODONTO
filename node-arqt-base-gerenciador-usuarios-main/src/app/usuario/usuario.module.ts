import { Module } from '@nestjs/common';
import { UtilsModule } from 'src/utils';
import { UsuarioService } from './business/usuario.service';
import { UsuarioRepositoryProvider } from './repository/usuario.repository';
import { HttpClienteModule } from 'src/libs/httpClient/httpClient.module';
import { EmailModule } from '../email/email.modules';
import { Criptografia } from './business/crypto';
import { EmpresaModule } from '../empresa/empresa.module';
import { PermissaoModule } from '../permissao/permissao/permissao.module';

@Module({
  imports: [
    UtilsModule,
    HttpClienteModule,
    EmailModule,
    EmpresaModule,
    PermissaoModule
  ],
  controllers: [ ],
  providers: [UsuarioService, UsuarioRepositoryProvider, Criptografia],
  exports: [UsuarioService]
})

export class UsuarioModule { }

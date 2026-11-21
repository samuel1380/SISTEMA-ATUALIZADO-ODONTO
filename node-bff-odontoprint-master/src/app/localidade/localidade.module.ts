import { Module } from '@nestjs/common';

import { LocalidadeController } from './controller/localidade.controller';
import { EmpresaModule, UsuarioModule } from '@hunter-solucoes/node-arqt-base-gerenciador-usuarios';
import { LocalidadeService } from './business/gerenciadorEmpresa.service';

@Module({
  imports: [
    EmpresaModule,
    UsuarioModule
  ],
  controllers: [LocalidadeController],
  providers: [LocalidadeService],
  exports: []
})
export class LocalidadeModule { }

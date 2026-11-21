import { Module } from '@nestjs/common';
import { GerenciadorEmpresaService } from './business/gerenciadorEmpresa.service';
import { GerenciadorEmpresaController } from './controller/gerenciadorEmpresa.controller';
import { EmpresaModule, UsuarioModule } from '@hunter-solucoes/node-arqt-base-gerenciador-usuarios';
import { DentistaModule } from '../dentista/dentista.module';

@Module({
  imports: [
    EmpresaModule,
    UsuarioModule,
    DentistaModule
  ],
  controllers: [GerenciadorEmpresaController],
  providers: [GerenciadorEmpresaService],
  exports: []
})
export class GerenciadorEmpresaModule { }

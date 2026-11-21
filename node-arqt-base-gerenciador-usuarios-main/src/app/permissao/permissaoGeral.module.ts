import { Module } from '@nestjs/common';
import { GrupoPermissaoModule } from './grupoPermissao/grupoPermissao.module';
import { PermissaoModule } from './permissao/permissao.module';

@Module({
  imports: [PermissaoModule, GrupoPermissaoModule]
})
export class PermissaoGeralModule {}

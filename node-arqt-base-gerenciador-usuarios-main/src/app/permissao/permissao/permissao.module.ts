import { Module } from '@nestjs/common';
import { PermissaoService } from './business/permissao.service';
import { PermissaoRepositoryProvider } from './repository/permissao.repository';

@Module({
  controllers: [],
  providers: [PermissaoRepositoryProvider, PermissaoService],
  exports: [PermissaoService]
})
export class PermissaoModule {}

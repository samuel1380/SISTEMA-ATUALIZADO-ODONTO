import { Module } from '@nestjs/common';
import { UtilsModule } from 'src/utils';
import { HttpClienteModule } from 'src/libs/httpClient/httpClient.module';
import { CategoriaProdutoRepositoryProvider } from './repository/categoriaProduto.repository';
import { CategoriaProdutoService } from './business/categoriaProduto.service';
import { CategoriaProdutoController } from './controller/categoriaProduto.controller';

@Module({
  imports: [
    UtilsModule,
    HttpClienteModule,
  ],
  controllers: [CategoriaProdutoController],
  providers: [CategoriaProdutoService, CategoriaProdutoRepositoryProvider],
  exports: [CategoriaProdutoService]
})
export class CategoriaProdutoModule { }

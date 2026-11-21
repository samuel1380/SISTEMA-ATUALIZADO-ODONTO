import { Module } from '@nestjs/common';
import { UtilsModule } from 'src/utils';
import { HttpClienteModule } from 'src/libs/httpClient/httpClient.module';
import { ProdutoRepositoryProvider } from './repository/produto.repository';
import { CustomProdutoRepositoryProvider } from './repository/customProduto.repository';
import { ProdutoService } from './business/produto.service';
import { ProdutoController } from './controller/produto.controller';

@Module({
  imports: [
    UtilsModule,
    HttpClienteModule,
  ],
  controllers: [ ProdutoController ],
  providers: [ProdutoService, ProdutoRepositoryProvider, CustomProdutoRepositoryProvider],
  exports: [ProdutoService]
})
export class ProdutoModule { }

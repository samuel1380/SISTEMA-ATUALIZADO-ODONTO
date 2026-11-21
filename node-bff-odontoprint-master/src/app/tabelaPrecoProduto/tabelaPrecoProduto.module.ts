import { Module } from '@nestjs/common';
import { UtilsModule } from 'src/utils';
import { HttpClienteModule } from 'src/libs/httpClient/httpClient.module';
import { TabelaPrecoProdutoService } from './business/tabelaPrecoProduto.service';
import { TabelaPrecoNotificacaoService } from './business/tabela-preco-notificacao.service';
import { TabelaPrecoProdutoController } from './controller/tabelaPrecoProduto.controller';
import { UsuarioModule } from '@hunter-solucoes/node-arqt-base-gerenciador-usuarios/dist';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { TabelaPrecoProduto } from './domain/tabelaPrecoProduto.entity';

@Module({
  imports: [
    UtilsModule,
    HttpClienteModule,
    UsuarioModule,
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([TabelaPrecoProduto])
  ],
  controllers: [ TabelaPrecoProdutoController ],
  providers: [TabelaPrecoProdutoService, TabelaPrecoNotificacaoService],
  exports: [TabelaPrecoProdutoService]
})
export class TabelaPrecoProdutoModule { }

import { Module } from '@nestjs/common';
import { ProdutoModule as BaseProdutoModule } from '@hunter-solucoes/node-arqt-base-gerenciador-usuarios/dist';
import { ProdutoController } from './controller/produto.controller';

@Module({
  imports: [BaseProdutoModule],
  controllers: [ProdutoController],
  providers: [],
  exports: [BaseProdutoModule]
})
export class ProdutoCustomModule { }

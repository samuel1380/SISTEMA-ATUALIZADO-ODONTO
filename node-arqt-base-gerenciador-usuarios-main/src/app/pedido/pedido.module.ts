import { Module } from '@nestjs/common';
import { PedidoRepositoryProvider } from './repository/pedido.repository';
import { PedidoService } from './business/pedido.service';
import { PedidoController } from './controller/pedido.controller';
import { ProdutoModule } from '../produto/produto.module';
import { ItemPedidoRepositoryProvider } from './repository/itemPedido.repository';

@Module({
  imports: [ ProdutoModule ],
  controllers: [ PedidoController ],
  providers: [PedidoService, PedidoRepositoryProvider, ItemPedidoRepositoryProvider],
  exports: [PedidoService]
})
export class PedidoModule { }

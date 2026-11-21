import {
  Connection,
  EntityRepository,
  In,
  Repository
} from 'typeorm';
import { ItemPedido } from '../domain/itemPedido.entity';

@EntityRepository(ItemPedido)
export class ItemPedidoRepository extends Repository<ItemPedido> {

  async buscarItemPedidoPorId(idEmpresa: number, idItemPedido: number) {
    return this.findOne({ where: { idEmpresa, idItemPedido } });
  }

  async buscarItemPedidoNaoConcluidoOfPedido(idPedido: number) {
    return this.find({
      where: {
        status: In(['pendente', 'andamento']),
        idPedido,
        ativo: true
      }
    });
  }

  async atualizarItemPedido(idEmpresa: number, idItemPedido: number, itemPedido: Partial<ItemPedido>) {
    return this.update({ idEmpresa, idItemPedido }, itemPedido);
  }

}

export const ItemPedidoRepositoryProvider = {
  provide: ItemPedidoRepository,
  useFactory: (connection: Connection) =>
    connection.getCustomRepository(ItemPedidoRepository),
  inject: [Connection]
};

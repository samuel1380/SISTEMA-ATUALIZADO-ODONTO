import {
  Connection,
  EntityRepository,
  Repository
} from 'typeorm';
import { Pedido } from '../domain/pedido.entity';

@EntityRepository(Pedido)
export class PedidoRepository extends Repository<Pedido> {

  async buscarPedidos(idEmpresa: number) {
    return this.find({
      where: {
        idEmpresa,
        ativo: true
      }
    });
  }

  async buscarPedidoPorId(idEmpresa: number, idPedido: number) {
    return this.findOne({ where: { idEmpresa, idPedido } });
  }

  async cadastrarPedido(pedido: Pedido) {
    return this.save(pedido);
  }

  async atualizarPedido(idEmpresa: number, idPedido: number, produto: Partial<Pedido>) {
    return this.update({ idEmpresa, idPedido }, produto);
  }

}

export const PedidoRepositoryProvider = {
  provide: PedidoRepository,
  useFactory: (connection: Connection) =>
    connection.getCustomRepository(PedidoRepository),
  inject: [Connection]
};

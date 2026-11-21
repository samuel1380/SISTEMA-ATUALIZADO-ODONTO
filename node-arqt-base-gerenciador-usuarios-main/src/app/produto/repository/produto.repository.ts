import {
  Connection,
  EntityRepository,
  Repository
} from 'typeorm';
import { Produto } from '../domain/produto.entity';

@EntityRepository(Produto)
export class ProdutoRepository extends Repository<Produto> {

  async buscarProdutosAtivos() {
    return this.find({
      where: {
        ativo: true
      },
      order: {
        nome: 'ASC'
      }
    });
  }

  async buscarProdutoPorId(produtoId: number) {
    return this.findOne({
      where: {
        idProduto: produtoId,
      },
    });
  }

  async cadastrarProduto(produto: Produto) {
    return this.save(produto);
  }

  async atualizarProduto(produtoId: number, produto: Partial<Produto>) {
    return this.update(produtoId, produto);
  }

}

export const ProdutoRepositoryProvider = {
  provide: ProdutoRepository,
  useFactory: (connection: Connection) =>
    connection.getCustomRepository(ProdutoRepository),
  inject: [Connection]
};

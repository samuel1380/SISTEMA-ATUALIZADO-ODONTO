import {
  Connection,
  EntityRepository,
  Repository
} from 'typeorm';
import { CategoriaProduto } from '../domain/categoriaProduto.entity';

@EntityRepository(CategoriaProduto)
export class CategoriaProdutoRepository extends Repository<CategoriaProduto> {

  async buscarCategoriaProdutosAtivos() {
    return this.find({
      where: {
        ativo: true
      }
    });
  }

  async buscarCategoriaProdutoPorId(produtoId: number) {
    return this.findOne({
      where: {
        idCategoriaProduto: produtoId,
      },
    });
  }

  async cadastrarCategoriaProduto(produto: CategoriaProduto) {
    return this.save(produto);
  }

  async atualizarCategoriaProduto(produtoId: number, produto: Partial<CategoriaProduto>) {
    return this.update(produtoId, produto);
  }

}

export const CategoriaProdutoRepositoryProvider = {
  provide: CategoriaProdutoRepository,
  useFactory: (connection: Connection) =>
    connection.getCustomRepository(CategoriaProdutoRepository),
  inject: [Connection]
};

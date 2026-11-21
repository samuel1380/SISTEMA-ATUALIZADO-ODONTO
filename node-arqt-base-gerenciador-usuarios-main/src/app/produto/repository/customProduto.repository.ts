import {
  Connection,
  EntityRepository,
  Repository
} from 'typeorm';
import { CustomProduto } from '../domain/customProduto.entity';

@EntityRepository(CustomProduto)
export class CustomProdutoRepository extends Repository<CustomProduto> {

  async buscarProdutosAtivos() {
    // return this.find({
    //   where: {
    //     ativo: true
    //   },
    //   order: {
    //     nome: 'ASC'
    //   }
    // });
  }

  async cadastrarCustomProduto(customProduto: CustomProduto[]) {
    return this.save(customProduto);
  }

}

export const CustomProdutoRepositoryProvider = {
  provide: CustomProdutoRepository,
  useFactory: (connection: Connection) =>
    connection.getCustomRepository(CustomProdutoRepository),
  inject: [Connection]
};

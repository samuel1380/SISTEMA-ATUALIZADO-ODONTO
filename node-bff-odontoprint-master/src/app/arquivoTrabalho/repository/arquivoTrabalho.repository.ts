import {
  Connection,
  EntityRepository,
  Repository
} from 'typeorm';
import { ArquivoTrabalho } from '../domain/arquivoTrabalho.entity';

@EntityRepository(ArquivoTrabalho)
export class ArquivoTrabalhoRepository extends Repository<ArquivoTrabalho> {

  async salvaTrabalho(arquivoTrabalho: ArquivoTrabalho) {
    return this.save(arquivoTrabalho);
  }

  async buscaArquivo(idArquivoTrabalho: number): Promise<ArquivoTrabalho> {
    return await this.findOne({ where: { idArquivoTrabalho } });
  }

  async deleteArquivo(arquivoTrabalho: ArquivoTrabalho): Promise<ArquivoTrabalho[]> {
    return await this.remove([arquivoTrabalho]);
  }
}

export const ArquivoTrabalhoRepositoryProvider = {
  provide: 'ArquivoTrabalhoRepository',
  useFactory: (connection: Connection) =>
    connection.getCustomRepository(ArquivoTrabalhoRepository),
  inject: [Connection]
};

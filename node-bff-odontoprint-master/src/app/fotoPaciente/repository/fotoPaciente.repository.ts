import {
  Connection,
  EntityRepository,
  Repository
} from 'typeorm';
import { FotoPaciente } from '../domain/fotoPaciente.entity';

@EntityRepository(FotoPaciente)
export class FotoPacienteRepository extends Repository<FotoPaciente> {

  async salvaFotoPaciente(fotoPaciente: FotoPaciente) {
    return this.save(fotoPaciente);
  }

  async buscaArquivo(idFotoPaciente: number): Promise<FotoPaciente> {
    return await this.findOne({ where: { idFotoPaciente } });
  }

  async deleteArquivo(arquivoTrabalho: FotoPaciente): Promise<FotoPaciente[]> {
    return await this.remove([arquivoTrabalho]);
  }

}

export const FotoPacienteRepositoryProvider = {
  provide: 'FotoPacienteRepository',
  useFactory: (connection: Connection) =>
    connection.getCustomRepository(FotoPacienteRepository),
  inject: [Connection]
};

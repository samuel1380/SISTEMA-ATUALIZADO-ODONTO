import {
  Connection,
  EntityRepository,
  FindManyOptions,
  Like,
  Repository
} from 'typeorm';
import { Empresa } from '../domain/empresa.entity';

@EntityRepository(Empresa)
export class EmpresaRepository extends Repository<Empresa> {

  async buscarEmpresasPorId(empresaId: number) {
    return this.findOne({
      where: {
        idEmpresa: empresaId,
      },
    });
  }

  async buscarEmpresasAprovadas() {
    return this.find({
      where: {
        aprovada: true,
        ativo: true
      }
    });
  }

  async buscarEmpresas(query?: string) {
    const optionsQuery: FindManyOptions<Empresa> = {
      where: {
        ativo: true,
      }
    }

    if (query) {
      optionsQuery.where = {
        ativo: true,
        nome: Like(`%${query}%`)
      }
    }

    return this.find(optionsQuery);
  }

  async buscarEmpresasAguardandoAprovacao() {
    return this.find({
      where: {
        aprovada: false,
        ativo: true
      }
    });
  }

  async buscarEmpresaPorEmail(email: string) {
    return this.findOne({
      where: {
        email,
        ativo: true
      }
    });
  }

  async buscarEmpresaPorId(empresaId: number) {
    return this.findOne({
      where: {
        idEmpresa: empresaId,
      },
    });
  }

  async cadastrarEmpresa(empresa: Empresa) {
    return this.save(empresa);
  }

  async atualizarEmpresa(empresaId: number, empresa: Partial<Empresa>) {
    return this.update(empresaId, empresa);
  }

}

export const EmpresaRepositoryProvider = {
  provide: EmpresaRepository,
  useFactory: (connection: Connection) =>
    connection.getCustomRepository(EmpresaRepository),
  inject: [Connection]
};

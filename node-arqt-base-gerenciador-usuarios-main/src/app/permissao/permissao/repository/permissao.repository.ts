import { Injectable } from '@nestjs/common';
import { Connection, EntityRepository, Repository } from 'typeorm';
import { Permissao } from '../domain/permissao.entity';

@EntityRepository(Permissao)
export class PermissaoRepository extends Repository<Permissao> {

  buscarPermissaoPorNome(permissaoNome: string) {
    return this.findOne({ where: { nome: permissaoNome } });
  }

}

export const PermissaoRepositoryProvider = {
  provide: PermissaoRepository,
  useFactory: (connection: Connection) =>
    connection.getCustomRepository(PermissaoRepository),
  inject: [Connection]
};

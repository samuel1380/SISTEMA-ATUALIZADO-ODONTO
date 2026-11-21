import { Injectable } from '@nestjs/common';
import { PermissaoRepository } from '../repository/permissao.repository';

@Injectable()
export class PermissaoService {
  constructor(
    private permissaoRepository: PermissaoRepository
  ) { }

  buscarPermissaoPorNome(permissaoNome: string) {
    return this.permissaoRepository.buscarPermissaoPorNome(permissaoNome);
  }

}

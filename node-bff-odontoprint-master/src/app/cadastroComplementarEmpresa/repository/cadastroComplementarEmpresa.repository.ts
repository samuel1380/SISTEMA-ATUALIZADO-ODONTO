import { Repository } from 'typeorm';
import { CadastroComplementarEmpresa } from '../domain/cadastroComplementarEmpresa.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CadastroComplementarEmpresaRepository {

  constructor(
    @InjectRepository(CadastroComplementarEmpresa)
    private readonly repository: Repository<CadastroComplementarEmpresa>
  ) { }

  async salvaCadastroComplementar(produtoEmpresa: CadastroComplementarEmpresa) {
    return this.repository.save([produtoEmpresa]);
  }

  async buscarCadastroComplementarEmpresa(idEmpresa: number): Promise<CadastroComplementarEmpresa> {
    try {
      const cadastro = await this.repository.findOne({
        where: {
          idEmpresa
        }
      });

      cadastro.dentistaEmpresa = cadastro.dentistaEmpresa.filter(dentista => dentista.ativo);
      return cadastro;
    }
    catch (e) {
      console.log(e)
    }
  }
}

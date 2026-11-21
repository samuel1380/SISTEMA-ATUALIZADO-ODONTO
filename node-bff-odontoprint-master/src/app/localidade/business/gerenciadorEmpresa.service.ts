import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { RespostaEndereco } from "../dto/respostaEndereco.dto";

@Injectable()
export class LocalidadeService {
  constructor() { }

  async buscaCep(cep: String): Promise<RespostaEndereco> {
    cep = cep.replace(/\W/, '');

    const resultadoCep = await axios.get(`http://viacep.com.br/ws/${cep}/json`)
    return resultadoCep.data;
  }
}

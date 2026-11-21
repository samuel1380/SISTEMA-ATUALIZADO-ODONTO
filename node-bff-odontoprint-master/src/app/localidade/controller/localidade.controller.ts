
import { Controller, Get, Param } from '@nestjs/common';
import { LocalidadeService } from '../business/gerenciadorEmpresa.service';
import { RespostaEndereco } from '../dto/respostaEndereco.dto';
import { Public } from '@hunter-solucoes/node-arqt-base-gerenciador-usuarios';


@Controller('localidade')
export class LocalidadeController {
  constructor(private localidadeService: LocalidadeService) { }

  @Public()
  @Get('cep/:cep')
  async buscaCep(@Param('cep') cep: string): Promise<RespostaEndereco> {
    cep = cep.replace(/\D/g, '');
    return await this.localidadeService.buscaCep(cep);
  }
}

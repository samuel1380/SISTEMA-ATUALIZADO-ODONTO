
import { Roles, } from '@hunter-solucoes/node-arqt-base-gerenciador-usuarios/dist';
import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { HistoricoStatusTrabalhoService } from '../business/historicoStatusTrabalho.service';

@ApiTags('HistoricoStatusTrabalho')
@Controller('historicoStatusTrabalho')
export class HistoricoStatusTrabalhoController {
  constructor(private historicoStatusTrabalhoService: HistoricoStatusTrabalhoService) { }

  @Roles('admin')
  @Get(':idTrabalho')
  async buscaHistoricoStatusTrabalho(
    @Param('idTrabalho', new ParseIntPipe()) idTrabalho: number,
  ) {
    return this.historicoStatusTrabalhoService.buscaHistoricoStatusTrabalho(idTrabalho);
  }

}


import { CurrentUser, Roles, } from '@hunter-solucoes/node-arqt-base-gerenciador-usuarios/dist';
import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { ElementosTrabalhoService } from '../business/elementosTrabalho.service';

@ApiTags('elementosTrabalho')
@Controller('elementosTrabalho')
export class ElementosTrabalhoController {
  constructor(private elementosTrabalhoService: ElementosTrabalhoService) { }

  @Roles('admin', 'comum', 'producao')
  @Get()
  async buscarElementosTrabalhos(@CurrentUser() currentUser: any) {
    return this.elementosTrabalhoService.buscarElementosTrabalho();
  }
}

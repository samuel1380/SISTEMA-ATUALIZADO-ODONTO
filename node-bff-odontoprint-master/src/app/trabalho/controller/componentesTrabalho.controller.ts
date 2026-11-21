
import { CurrentUser, Roles, } from '@hunter-solucoes/node-arqt-base-gerenciador-usuarios/dist';
import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ComponentesTrabalhoService } from '../business/componentesTrabalho.service';

@ApiTags('componentesTrabalho')
@Controller('componentesTrabalho')
export class ComponentesTrabalhoController {
  constructor(private componentesTrabalhoService: ComponentesTrabalhoService) { }

  @Roles('admin', 'comum')
  @Get()
  async buscarComponentesTrabalhos(@CurrentUser() currentUser: any) {
    return this.componentesTrabalhoService.buscarComponentesTrabalho();
  }
}

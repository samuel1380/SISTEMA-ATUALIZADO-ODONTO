
import { CurrentUser, Roles, } from '@hunter-solucoes/node-arqt-base-gerenciador-usuarios/dist';
import { Body, Controller, Get, Param, ParseIntPipe, Post, Put } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ComponenteService } from '../business/componente.service';
import { ComponenteDto } from '../dto/componente.dto';

@ApiTags('Componente')
@Controller('componente')
export class ComponenteController {
  constructor(private componenteService: ComponenteService) { }

  @Roles('admin', 'comum', 'producao')
  @Get('ativos')
  async buscarComponente() {
    return this.componenteService.buscaComponentesAtivos();
  }

  @Roles('admin')
  @Get(':idComponente')
  async buscaComponentePorId(
    @Param('idComponente', ParseIntPipe) idComponente: number,
  ) {
    return this.componenteService.buscaComponentePorId(idComponente)
  }

  @Roles('admin')
  @Post('')
  async cadastrarComponente(
    @CurrentUser() currentUser: any,
    @Body() componenteDto: ComponenteDto
  ) {
    return this.componenteService.cadastrarComponente(currentUser, componenteDto);
  }

  @Roles('admin')
  @Put(':idComponente')
  async editarComponente(
    @CurrentUser() currentUser: any,
    @Param('idComponente', ParseIntPipe) idComponente: number,
    @Body() componenteDto: ComponenteDto
  ) {
    return this.componenteService.editarComponente(currentUser, idComponente, componenteDto);
  }

}

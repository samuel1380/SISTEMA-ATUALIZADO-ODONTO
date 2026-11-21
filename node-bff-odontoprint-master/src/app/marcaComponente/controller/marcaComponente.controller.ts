
import { CurrentUser, Roles, } from '@hunter-solucoes/node-arqt-base-gerenciador-usuarios/dist';
import { Body, Controller, Get, Param, ParseIntPipe, Post, Put } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { MarcaComponenteService } from '../business/marcaComponente.service';


import { MarcaComponenteDto } from '../dto/marcaComponente.dto';

@ApiTags('Marca Componente')
@Controller('marcacomponente')
export class MarcaComponenteController {
  constructor(private produtoEmpresaService: MarcaComponenteService) { }

  @Roles('admin')
  @Post()
  async cadastrarMarcaComponente(
    @CurrentUser() currentUser: any,
    @Body() marcaComponenteDto: MarcaComponenteDto
  ) {
    return this.produtoEmpresaService.cadastrarMarcaComponente(currentUser, marcaComponenteDto);
  }

  @Roles('admin', 'comum')
  @Get('ativos')
  async buscarMarcaComponente(
  ) {
    return this.produtoEmpresaService.buscarMarcaComponente();
  }

  @Roles('admin')
  @Get(':idMarcaComponente')
  async buscarMarcaComponentePorId(@Param('idMarcaComponente', ParseIntPipe) idMarcaComponente: number) {
    return this.produtoEmpresaService.buscarMarcaPorId(idMarcaComponente);
  }

  @Roles('admin')
  @Put(':idMarcaComponente')
  async editarMarcaComponente(
    @Param('idMarcaComponente', ParseIntPipe) idMarcaComponente: number,
    @Body() marcaComponenteDto: MarcaComponenteDto
  ) {
    return this.produtoEmpresaService.editarMarcaComponente(idMarcaComponente, marcaComponenteDto);
  }
}

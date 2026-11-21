
import { CurrentUser, Roles, } from '@hunter-solucoes/node-arqt-base-gerenciador-usuarios/dist';
import { Body, Controller, Get, Param, ParseIntPipe, Post, Put } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CorService } from '../business/cor.service';
import { CorDto } from '../dto/cor.dto';

@ApiTags('Cor')
@Controller('cor')
export class CorController {
  constructor(private corService: CorService) { }

  @Roles('admin')
  @Post()
  async cadastrarMarcaComponente(
    @CurrentUser() currentUser: any,
    @Body() corDto: CorDto
  ) {
    return this.corService.cadastrarCor(currentUser, corDto);
  }

  @Roles('admin', 'comum')
  @Get('ativos')
  async buscaCores(
  ) {
    return this.corService.buscaCores();
  }

  @Roles('admin')
  @Get(':idCor')
  async buscaComponentePorId(
    @Param('idCor', ParseIntPipe) idCor: number,
  ) {
    return this.corService.buscaCorPorId(idCor)
  }

  @Roles('admin')
  @Put(':idCor')
  async editarComponente(
    @Param('idCor', ParseIntPipe) idCor: number,
    @Body() corDto: CorDto
  ) {
    return this.corService.editarCor(idCor, corDto);
  }

}

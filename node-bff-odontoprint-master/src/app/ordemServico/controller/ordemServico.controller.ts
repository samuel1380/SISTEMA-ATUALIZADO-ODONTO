
import { CurrentUser, Roles, } from '@hunter-solucoes/node-arqt-base-gerenciador-usuarios/dist';
import { Body, Controller, Get, Param, ParseIntPipe, Post, Put } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { plainToClass } from 'class-transformer';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { OrdemServico } from '../domain/ordemServico.entity';
import { OrdemServicoService } from '../business/ordemServico.service';
import { OrdemServicoDto } from '../dto/ordemServico.dto';

@ApiTags('Ordem de Serviço')
@Controller('ordem-servico')
export class OrdemServicoController {
  constructor(private ordemServicoService: OrdemServicoService) { }

  @Roles('admin')
  @Post()
  async cadastrar(
    @CurrentUser() currentUser: any,
    @Body() ordemServicoDto: OrdemServicoDto
  ) {
    const ordemServico = plainToClass(OrdemServico, ordemServicoDto);
    return this.ordemServicoService.cadastrar(currentUser, [ordemServico]);
  }

  @Roles('admin')
  @Get('ativos')
  async buscarAtivos(
  ) {
    return this.ordemServicoService.buscarAtivos();
  }

  @Roles('admin')
  @Get(':id')
  async buscarPorId(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.ordemServicoService.buscarPorId(id)
  }

  @Roles('admin')
  @Put(':id')
  async editar(
    @Param('id', ParseIntPipe) id: number,
    @Body() ordemServicoDto: QueryDeepPartialEntity<OrdemServico>
  ) {
    return this.ordemServicoService.editar(id, ordemServicoDto);
  }

}

import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { AlmoxarifadoService } from '../service/almoxarifado.service';
import { CreateAlmoxarifadoDto } from '../domain/dto/create-almoxarifado.dto';
import { UpdateAlmoxarifadoDto } from '../domain/dto/update-almoxarifado.dto';
import { Roles } from '@hunter-solucoes/node-arqt-base-gerenciador-usuarios';

@Controller('almoxarifado')
export class AlmoxarifadoController {
  constructor(private readonly almoxarifadoService: AlmoxarifadoService) {}

  @Roles('admin', 'vendas', 'financeiro')
  @Post()
  create(@Body() createAlmoxarifadoDto: CreateAlmoxarifadoDto) {
    return this.almoxarifadoService.create(createAlmoxarifadoDto);
  }

  @Roles('admin', 'vendas', 'financeiro')
  @Get()
  findAll() {
    return this.almoxarifadoService.findAll();
  }

  @Roles('admin', 'vendas', 'financeiro')
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.almoxarifadoService.findOne(id);
  }

  @Roles('admin', 'vendas', 'financeiro')
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateAlmoxarifadoDto: UpdateAlmoxarifadoDto) {
    return this.almoxarifadoService.update(id, updateAlmoxarifadoDto);
  }

  @Roles('admin', 'vendas', 'financeiro')
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.almoxarifadoService.remove(id);
  }
}
  
import { CurrentUser, Roles } from '@hunter-solucoes/node-arqt-base-gerenciador-usuarios/dist';
import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { EstoqueService } from '../service/estoque.service';
import { CreateEstoqueDto } from '../domain/dto/create-estoque.dto';
import { UpdateEstoqueDto } from '../domain/dto/update-estoque.dto';

@Controller('estoque')
export class EstoqueController {
  constructor(private readonly estoqueService: EstoqueService) {}

  @Roles('admin', 'vendas', 'financeiro')
  @Post()
  create(@CurrentUser() currentUser: any, @Body() createEstoqueDto: CreateEstoqueDto) {
    return this.estoqueService.create(currentUser, createEstoqueDto);
  }

  @Roles('admin', 'vendas', 'financeiro')
  @Get()
  findAll() {
    return this.estoqueService.findAll();
  }

  @Roles('admin', 'vendas', 'financeiro')
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.estoqueService.findOne(id);
  }

  @Roles('admin', 'vendas', 'financeiro')
  @Get('empresa/:idEmpresa')
  findByEmpresa(@Param('idEmpresa', ParseIntPipe) idEmpresa: number) {
    return this.estoqueService.findByEmpresa(idEmpresa);
  }

  @Roles('admin', 'vendas', 'financeiro')
  @Get('almoxarifado/:idAlmoxarifado')
  findByAlmoxarifado(@Param('idAlmoxarifado', ParseIntPipe) idAlmoxarifado: number) {
    return this.estoqueService.findByAlmoxarifado(idAlmoxarifado);
  }

  @Roles('admin', 'vendas', 'financeiro')
  @Get('almoxarifado/:idAlmoxarifado/componente/:idComponente')
  findByAlmoxarifadoAndProdutoId(@Param('idAlmoxarifado', ParseIntPipe) idAlmoxarifado: number, @Param('idComponente', ParseIntPipe) idComponente: number) {
    return this.estoqueService.findByAlmoxarifadoAndComponenteId(idAlmoxarifado, idComponente);
  }

  @Roles('admin', 'vendas', 'financeiro')
  @Get('historico/consumo/almoxarifado/:idAlmoxarifado')
  findConsumoHistoryByAlmoxarifado(@Param('idAlmoxarifado', ParseIntPipe) idAlmoxarifado: number) {
    return this.estoqueService.findConsumoHistory(idAlmoxarifado);
  }

  @Roles('admin', 'vendas', 'financeiro')
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateEstoqueDto: UpdateEstoqueDto) {
    return this.estoqueService.update(id, updateEstoqueDto);
  }

  @Roles('admin', 'vendas', 'financeiro')
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.estoqueService.remove(id);
  }
}

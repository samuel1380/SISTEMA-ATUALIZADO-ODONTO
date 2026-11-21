
import { CurrentUser, Roles, } from '@hunter-solucoes/node-arqt-base-gerenciador-usuarios/dist';
import { Body, Controller, Get, Headers, Param, ParseIntPipe, Post, Put, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { TabelaPrecoProdutoService } from '../business/tabelaPrecoProduto.service';
import { TabelaPrecoProdutoDto } from '../dto/tabelaPrecoProduto.dto';

@ApiTags('TabelaPrecoProduto')
@Controller('tabelaPrecoProduto')
export class TabelaPrecoProdutoController {
  constructor(private tabelaPrecoProdutoService: TabelaPrecoProdutoService) { }

  @Roles('admin', 'vendas')
  @Post()
  async cadastrarTabelaPrecoProduto(
    @CurrentUser() currentUser: any,
    @Body() tabelaPrecoProdutoDto: TabelaPrecoProdutoDto
  ) {
    return this.tabelaPrecoProdutoService.cadastrarTabelaPrecoProduto(currentUser, tabelaPrecoProdutoDto);
  }

  
  @Roles('admin', 'vendas')
  @Put(':idTabelaPrecoProduto')
  async atualizarTabelaPrecoProduto(
    @CurrentUser() currentUser: any,
    @Body() tabelaPrecoProdutoDto: TabelaPrecoProdutoDto,
    @Param('idTabelaPrecoProduto', ParseIntPipe) idTabelaPrecoProduto: number
  ) {
    tabelaPrecoProdutoDto.idTabelaPrecoProduto = idTabelaPrecoProduto;
    return this.tabelaPrecoProdutoService.cadastrarTabelaPrecoProduto(currentUser, tabelaPrecoProdutoDto);
  }


  @Roles('admin', 'vendas', 'financeiro')
  @Get()
  async buscaTabelaPrecoProdutos(
  ) {
    return this.tabelaPrecoProdutoService.buscaTabelaPrecoProdutos();
  }

  @Roles('admin', 'vendas', 'financeiro')
  @Get('matriz')
  async buscarTabelasMatriz() {
    return this.tabelaPrecoProdutoService.buscarTabelasMatriz();
  }

  @Roles('admin', 'vendas', 'financeiro')
  @Get(':idMatriz/versoes')
  async buscarVersoesTabela(
    @Param('idMatriz', ParseIntPipe) idMatriz: number,
  ) {
    return this.tabelaPrecoProdutoService.buscarVersoesTabela(idMatriz);
  }

  @Roles('admin', 'vendas')
  @Post(':idOrigem/nova-versao')
  async criarNovaVersao(
    @CurrentUser() currentUser: any,
    @Param('idOrigem', ParseIntPipe) idOrigem: number,
    @Body() dadosVersao: { numeroVersao: string }
  ) {
    return this.tabelaPrecoProdutoService.criarNovaVersao(currentUser, idOrigem, dadosVersao);
  }

  @Roles('admin', 'vendas', 'financeiro')
  @Get(':idTabelaPrecoProduto')
  async buscaTabelaPrecoProdutosPorId(
    @Param('idTabelaPrecoProduto', ParseIntPipe) idTabelaPrecoProduto: number,
  ) {
    return this.tabelaPrecoProdutoService.buscaTabelaPrecoProdutosPorId(idTabelaPrecoProduto)
  }

  @Roles('admin', 'vendas', 'financeiro')
  @Get('vigente/:data')
  async buscarTabelaPrecoVigente(
    @Param('data') data: string,
  ) {
    const dataObj = new Date(data);
    return this.tabelaPrecoProdutoService.buscarTabelaPrecoVigentePorData(dataObj);
  }

  @Roles('admin', 'vendas', 'financeiro')
  @Get('proximas-vencimento')
  async buscarTabelasProximasVencimento(
    @Query('diasAntecedencia') diasAntecedencia?: string,
  ) {
    const dias = diasAntecedencia ? parseInt(diasAntecedencia, 10) : 30;
    return this.tabelaPrecoProdutoService.buscarTabelasProximasVencimento(dias);
  }

  // @Roles('admin')
  // @Get('idEmpresa')
  // async buscaTabelaPrecoProdutoPorEmpresaId(
  //   @Headers('idEmpresa') idEmpresaHeaders: string
  // ) {
  //   // return this.tabelaPrecoProdutoService.buscaTabelaPrecoProdutoPorEmpresaId(idEmpresaHeaders);
  // }

}

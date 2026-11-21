
import { CurrentUser, Roles, } from '@hunter-solucoes/node-arqt-base-gerenciador-usuarios/dist';
import { Body, Controller, Get, Headers, Param, ParseIntPipe, Post, Put, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { TrabalhoService } from '../business/trabalho.service';
import { TrabalhoCadastroDto } from '../dto/trabalhoCadastro.dto';
import { TrabalhoEditarDto } from '../dto/trabalhoEditar.dto';
import { TrabalhoStatusEditarDto } from '../dto/trabalhoStatusEditar.dto';
import { StatusTrabalho } from '../domain/trabalho.entity';

@ApiTags('Trabalho')
@Controller()
export class TrabalhoController {
  constructor(private trabalhoService: TrabalhoService) { }

  @Roles('admin')
  @Post('trabalho/emitirEventosTrabalhoEnviado')
  async emitirEventosEmpresas() {
    return this.trabalhoService.emitirEventosTrabalhoEnviado();
  }


  @Roles('admin', 'producao', 'vendas', 'financeiro')
  @Post('trabalho')
  async cadastrarProduto(
    @CurrentUser() currentUser: any,
    @Body() produtoCadastroDto: TrabalhoCadastroDto
  ) {

    const idEmpresa = currentUser.user.empresas && currentUser.user.empresas[0]?.idEmpresa;
    const nomeEmpresa = currentUser.user.empresas && currentUser.user.empresas[0]?.nome;

    if (currentUser.user.tipoUsuario === "externo" && idEmpresa) {
      return this.trabalhoService.cadastrarTrabalho(currentUser, idEmpresa, nomeEmpresa, produtoCadastroDto);
    } else if (currentUser.user.tipoUsuario === "interno") {
      return this.trabalhoService.cadastrarTrabalho(currentUser, produtoCadastroDto.idEmpresa, nomeEmpresa, produtoCadastroDto);
    }

    return 
  }

  @Roles('admin', 'producao', 'vendas', 'financeiro')
  @Get('trabalho')
  async buscarTrabalhos(@CurrentUser() currentUser: any, @Query("statusTrabalho") statusTrabalho: StatusTrabalho[]) {
    const idEmpresa = currentUser.user.empresas && currentUser.user.empresas[0]?.idEmpresa;

    if (currentUser.user.tipoUsuario === "externo" && idEmpresa) {
      return this.trabalhoService.buscarTrabalhos(statusTrabalho, idEmpresa);
    } else if (currentUser.user.tipoUsuario === "interno") {
      return this.trabalhoService.buscarTrabalhos(statusTrabalho);
    }

    return [];
  }

  @Roles('admin', 'producao', 'vendas', 'financeiro')
  @Get('trabalhopendentes')
  async buscarTrabalhosPendentes(@CurrentUser() currentUser: any) {
    const idEmpresa = currentUser.user.empresas && currentUser.user.empresas[0]?.idEmpresa;

    if (currentUser.user.tipoUsuario === "externo" && idEmpresa) {
      return this.trabalhoService.buscarTrabalhosPendentes(idEmpresa);
    } else if (currentUser.user.tipoUsuario === "interno") {
      return this.trabalhoService.buscarTrabalhosPendentes();
    }

    return [];
  }

  @Roles('admin')
  @Get('trabalhoconcluidos')
  async buscarTrabalhosConcluidos(
    @CurrentUser() currentUser: any,
    @Headers('idEmpresa') idEmpresaHeaders: string,
    @Query("dataInicio") dataInicio: string,
    @Query("dataFim") dataFim: string,
  ) {
    const idEmpresa = currentUser.user.empresas && currentUser.user.empresas[0]?.idEmpresa;

    if (currentUser.user.tipoUsuario === "externo" && idEmpresa) {
      return this.trabalhoService.buscarTrabalhosConcluidos(idEmpresa, dataInicio, dataFim);
    } else if (currentUser.user.tipoUsuario === "interno") {
      const idEmpresaInt = parseInt(idEmpresaHeaders);
      return this.trabalhoService.buscarTrabalhosConcluidos(idEmpresaInt, dataInicio, dataFim);
    }

    return [];
  }

  @Roles('admin')
  @Get('recalcular')
  async recalcularValorTrabalhosEnviados(
    @CurrentUser() currentUser: any
  ) {
    return this.trabalhoService.recalcularValorTrabalhosEnviados(currentUser);
  }

  @Roles('admin')
  @Get('relatorio')
  async buscarRelatorio(
    @CurrentUser() currentUser: any,
    @Headers('idEmpresa') idEmpresaHeaders: string,
    @Query("dataInicio") dataInicio: string,
    @Query("dataFim") dataFim: string,
    @Query("statusTrabalho") statusTrabalho: StatusTrabalho[],
  ) {
    const idEmpresa = currentUser.user.empresas && currentUser.user.empresas[0]?.idEmpresa;

    if (currentUser.user.tipoUsuario === "externo" && idEmpresa) {
      return this.trabalhoService.buscarRelatorio(idEmpresa, statusTrabalho, dataInicio, dataFim);
    } else if (currentUser.user.tipoUsuario === "interno") {
      const idEmpresaInt = parseInt(idEmpresaHeaders);
      return this.trabalhoService.buscarRelatorio(idEmpresaInt, statusTrabalho, dataInicio, dataFim);
    }

    return [];
  }

  @Roles('admin')
  @Get('relatorio/dashboard-status')
  async buscarDashboardStatus(
    @Query("dataInicio") dataInicio: string,
    @Query("dataFim") dataFim: string,
  ) {
    return this.trabalhoService.buscarDashboardStatus(dataInicio, dataFim);
  }

  @Roles('admin', 'producao', 'vendas')
  @Put('trabalho/:trabalhoId/anotacoes')
  async atualizarAnotacoesTrabalho(
    @Param('trabalhoId', new ParseIntPipe()) trabalhoId: number,
    @Body() trabalhoCadastroDto: Partial<TrabalhoEditarDto>,
    @CurrentUser() currentUser: any
  ) {
    return this.trabalhoService.atualizarAnotacoesTrabalho(currentUser, trabalhoId, trabalhoCadastroDto);
  }

  @Roles('admin', 'producao', 'vendas', 'financeiro')
  @Put('trabalho/:trabalhoId')
  async atualizarTrabalho(
    @Param('trabalhoId', new ParseIntPipe()) trabalhoId: number,
    @Body() trabalhoCadastroDto: Partial<TrabalhoEditarDto>,
    @CurrentUser() currentUser: any
  ) {
    return this.trabalhoService.atualizarTrabalho(currentUser, trabalhoId, trabalhoCadastroDto);
  }

  @Roles('admin', 'producao', 'financeiro')
  @Put('trabalho/:trabalhoId/status')
  async atualizarStatusTrabalho(
    @Param('trabalhoId', new ParseIntPipe()) trabalhoId: number,
    @Body() trabalhoStatusEditarDto: TrabalhoStatusEditarDto,
    @CurrentUser() currentUser: any
  ) {
    return this.trabalhoService.atualizarStatusTrabalho(currentUser, trabalhoId, trabalhoStatusEditarDto);
  }

  @Roles('producao', 'vendas', 'financeiro')
  @Put('trabalho/:trabalhoId/enviaproducao')
  async EnviaTrabalhoProducao(
    @Param('trabalhoId', new ParseIntPipe()) trabalhoId: number
  ) {
    return this.trabalhoService.enviarParaProducao(trabalhoId);
  }

  @Roles('admin', 'producao', 'vendas', 'financeiro')
  @Get('trabalho/:trabalhoId')
  async buscarProdutoPorId(
    @Param('trabalhoId', new ParseIntPipe()) trabalhoId: number
  ) {
    return this.trabalhoService.buscarTrabalhoPorId(trabalhoId);
  }

  @Roles('admin', 'producao', 'vendas', 'financeiro')
  @Put('ordenatrabalhos')
  async ordenatrabalhos(
    @CurrentUser() currentUser: any,
    @Body() trabalhos: any
  ) {
    const idEmpresa = currentUser.user.empresas && currentUser.user.empresas[0]?.idEmpresa;

    if (currentUser.user.tipoUsuario === "externo" && idEmpresa) {
      return this.trabalhoService.ordenatrabalhos(idEmpresa, trabalhos);
    } else if (currentUser.user.tipoUsuario === "interno") {
      return this.trabalhoService.ordenatrabalhos(null, trabalhos);
    }

  }

}

import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { Roles } from '@hunter-solucoes/node-arqt-base-gerenciador-usuarios';
import {
  CapitalService,
  CreateAporteDto,
  CreateEmprestimoDto,
  CreateJurosEmprestimoDto,
  CreatePagamentoEmprestimoDto,
} from '../business/capital.service';
import { TipoAporte } from '../domain/aporte.entity';
import { TipoEmprestimo, StatusEmprestimo } from '../domain/emprestimo.entity';
import { OptionalParseIntPipe } from '../dto/optional-parse-int';

@Controller('financeiro/capital')
export class CapitalController {
  constructor(private readonly capitalService: CapitalService) {}

  // =================================================================
  // APORTES
  // =================================================================

  @Roles('admin')
  @Post('aporte')
  registrarAporte(@Body() dto: CreateAporteDto) {
    return this.capitalService.registrarAporte(dto);
  }

  @Roles('admin')
  @Get('aportes')
  listarAportes(
    @Query('idSocio', OptionalParseIntPipe) idSocio?: number,
    @Query('dataInicio') dataInicio?: string,
    @Query('dataFim') dataFim?: string,
    @Query('tipo') tipo?: TipoAporte,
  ) {
    return this.capitalService.listarAportes(idSocio, dataInicio, dataFim, tipo);
  }

  // =================================================================
  // EMPRÉSTIMOS
  // =================================================================

  @Roles('admin')
  @Post('emprestimo')
  registrarEmprestimo(@Body() dto: CreateEmprestimoDto) {
    return this.capitalService.registrarEmprestimo(dto);
  }

  @Roles('admin')
  @Get('emprestimos')
  listarEmprestimos(
    @Query('tipo') tipo?: TipoEmprestimo,
    @Query('status') status?: StatusEmprestimo,
    @Query('dataInicio') dataInicio?: string,
    @Query('dataFim') dataFim?: string,
  ) {
    return this.capitalService.listarEmprestimos(tipo, status, dataInicio, dataFim);
  }

  @Roles('admin')
  @Put('emprestimos/:id/status')
  atualizarStatusEmprestimo(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: StatusEmprestimo,
  ) {
    return this.capitalService.atualizarStatusEmprestimo(id, status);
  }

  @Roles('admin')
  @Post('emprestimos/:id/juros')
  registrarJurosEmprestimo(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateJurosEmprestimoDto,
  ) {
    return this.capitalService.registrarJurosEmprestimo(id, dto);
  }

  @Roles('admin')
  @Post('emprestimos/:id/acrescimo')
  registrarAcrescimoEmprestimo(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateJurosEmprestimoDto, // Usar o mesmo DTO já que tem os mesmos campos
  ) {
    return this.capitalService.registrarAcrescimoEmprestimo(id, dto);
  }

  @Roles('admin')
  @Post('emprestimos/:id/pagamento')
  registrarPagamentoEmprestimo(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreatePagamentoEmprestimoDto,
  ) {
    return this.capitalService.registrarPagamentoEmprestimo(id, dto);
  }

  @Roles('admin')
  @Post('emprestimos/:id/recalcular')
  recalcularSaldoEmprestimo(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.capitalService.recalcularSaldoEmprestimo(id);
  }

  @Roles('admin')
  @Get('emprestimos/:id/movimentacoes-pagamento')
  listarMovimentacoesPagamentoEmprestimo(@Param('id', ParseIntPipe) id: number) {
    return this.capitalService.listarMovimentacoesPagamentoEmprestimo(id);
  }
}


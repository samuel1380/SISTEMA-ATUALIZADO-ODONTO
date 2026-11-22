import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UploadedFile,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { IsEnum, IsInt, IsOptional, Max, Min, IsString, IsIn } from 'class-validator';
import { FinanceiroService } from '../business/financeiro.service';
import { CreateContaDto } from '../dto/create-conta.dto';
import { CreateLancamentoDto } from '../dto/create-lancamento.dto';
import { UpdateLancamentoDto } from '../dto/update-lancamento.dto';
import { PagarParcelaDto } from '../dto/pagar-parcela.dto';
import { CreateTransferenciaDto } from '../dto/create-transferencia.dto';
import { Type } from 'class-transformer';
import { Roles } from '@hunter-solucoes/node-arqt-base-gerenciador-usuarios';
import { TipoLancamento } from '../domain/tipo-lancamento.enum';
import { OptionalParseIntPipe } from '../dto/optional-parse-int';
import { StatusParcela } from '../domain/parcela.entity';
import { ClassificacaoLancamentoService } from '../business/classificacao-lancamento.service';

class ListarLancamentosQueryDto {
  @IsOptional()
  @IsEnum(TipoLancamento)
  tipo?: TipoLancamento;

  @IsOptional()
  @Type(() => Number)
  @IsInt() @Min(1) @Max(12)
  mes?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt() @Min(2000)
  ano?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt() @Min(1)
  idConta?: number;

  /**
   * Filtro por status da PARCELA (usado na visão de contas a pagar/receber):
   * PAGO, CANCELADO, VENCIDO (e ABERTO se necessário).
   */
  @IsOptional()
  @IsEnum(StatusParcela)
  statusParcela?: StatusParcela;

  /** Subcategoria (idCategoria do lançamento). */
  @IsOptional()
  @Type(() => Number)
  @IsInt() @Min(1)
  idCategoria?: number;

  /** Categoria pai (categoria principal). */
  @IsOptional()
  @Type(() => Number)
  @IsInt() @Min(1)
  idCategoriaPai?: number;

  /** Quando true/1, retorna também os totais (somatória). */
  @IsOptional()
  @IsIn(['true', '1'])
  incluirTotais?: 'true' | '1';

  /** Filtro por data de competência ou por data de vencimento da parcela. */
  @IsOptional()
  @IsIn(['competencia', 'vencimento'])
  filtroData?: 'competencia' | 'vencimento';
}

class DreQueryDto {
  @IsString()
  dataInicio: string;

  @IsString()
  dataFim: string;

  @IsIn(['competencia', 'caixa'])
  regime: 'competencia' | 'caixa';

  @IsOptional()
  @Type(() => Number)
  @IsInt() @Min(1)
  idEmpresa?: number;
}

@Controller('financeiro')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
export class FinanceiroController {
  constructor(
    private readonly financeiroService: FinanceiroService,
    private readonly classificacaoService: ClassificacaoLancamentoService,
  ) {}

  // -- Contas --
  @Roles('admin', 'financeiro')
  @Post('contas')
  criarConta(@Body() createContaDto: CreateContaDto) {
    return this.financeiroService.criarConta(createContaDto);
  }

  @Roles('admin', 'financeiro')
  @Get('contas')
  listarContas() {
    return this.financeiroService.listarContas();
  }

  @Roles('admin', 'financeiro')
  @Get('contas/:id')
  buscarContaPorId(@Param('id', ParseIntPipe) id: number) {
    return this.financeiroService.buscarContaPorId(id);
  }

  // -- Lançamentos --
  @Roles('admin', 'financeiro')
  @Post('lancamentos')
  criarLancamento(@Body() createLancamentoDto: CreateLancamentoDto) {
    return this.financeiroService.criarLancamento(createLancamentoDto);
  }

  /** Importação temporária de histórico (CSV: data_lancamento, descricao, valor_credito, valor_debito ou formato legado). */
  @Roles('admin', 'financeiro')
  @Post('lancamentos/importar-csv-historico')
  @UseInterceptors(FileInterceptor('arquivo'))
  @UsePipes(new ValidationPipe({ whitelist: false, forbidNonWhitelisted: false }))
  importarLancamentosCsvHistorico(
    @UploadedFile() file: Express.Multer.File,
    @Body('idCategoriaReceita') idCategoriaReceita?: string,
    @Body('idCategoriaDespesa') idCategoriaDespesa?: string,
    @Body('idConta') idConta?: string,
  ) {
    if (!file) {
      throw new BadRequestException('Arquivo CSV não enviado.');
    }
    if (!file.originalname.toLowerCase().endsWith('.csv')) {
      throw new BadRequestException('Envie um arquivo com extensão .csv.');
    }
    const parseOpt = (s?: string) => {
      if (s == null || String(s).trim() === '') return undefined;
      const n = parseInt(String(s), 10);
      return Number.isNaN(n) ? undefined : n;
    };
    return this.financeiroService.importarLancamentosCsvHistorico(
      file.buffer,
      parseOpt(idCategoriaReceita),
      parseOpt(idCategoriaDespesa),
      parseOpt(idConta),
    );
  }

  /** Classifica manualmente lançamentos de DESPESA sem categoria ou com categoria DESCONHECIDA. */
  @Roles('admin', 'financeiro')
  @Post('lancamentos/classificar-sem-categoria')
  classificarLancamentosSemCategoria() {
    return this.classificacaoService.classificarLancamentosSemCategoria();
  }
  @Roles('admin', 'financeiro')
  @Get('lancamentos')
  listarLancamentos(@Query() query: ListarLancamentosQueryDto) {
    const incluirTotais = query.incluirTotais === 'true' || query.incluirTotais === '1';
    if (incluirTotais) {
      return this.financeiroService.listarLancamentosComTotais(query);
    }
    return this.financeiroService.listarLancamentos(query);
  }

  @Roles('admin', 'financeiro')
  @Get('lancamentos/:id')
  buscarLancamentoPorId(@Param('id', ParseIntPipe) id: number) {
    return this.financeiroService.buscarLancamentoPorId(id);
  }

  @Roles('admin', 'financeiro')
  @Put('lancamentos/:id')
  atualizarLancamento(@Param('id', ParseIntPipe) id: number, @Body() updateLancamentoDto: UpdateLancamentoDto) {
    return this.financeiroService.atualizarLancamento(id, updateLancamentoDto);
  }

  @Roles('admin', 'financeiro')
  @Delete('parcelas/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  cancelarParcela(@Param('id', ParseIntPipe) id: number) {
    return this.financeiroService.cancelarParcela(id);
  }

  // -- Operações --
  @Roles('admin', 'financeiro')
  @Post('parcelas/:id/pagar')
  pagarParcela(@Param('id', ParseIntPipe) id: number, @Body() pagarParcelaDto: PagarParcelaDto) {
    return this.financeiroService.pagarParcela(id, pagarParcelaDto);
  }

  @Roles('admin', 'financeiro')
  @Post('transferencias')
  transferirEntreContas(@Body() createTransferenciaDto: CreateTransferenciaDto) {
    return this.financeiroService.transferirEntreContas(createTransferenciaDto);
  }

  // -- Relatórios --
  @Roles('admin')
  @Get('fluxo-caixa')
  getFluxoCaixa(@Query('dataInicio') dataInicio: string, @Query('dataFim') dataFim: string) {
    return this.financeiroService.consultarFluxoCaixa(dataInicio, dataFim);
  }

  @Roles('admin')
  @Get('dashboard')
  obterDashboard(
    @Query('idEmpresa', OptionalParseIntPipe) idEmpresa?: number,
    @Query('mes') mes?: number,
    @Query('ano') ano?: number,
  ) {
    return this.financeiroService.obterDashboardFinanceiro(idEmpresa, mes, ano);
  }

  @Roles('admin')
  @Get('dividas')
  listarDividas(@Query('idEmpresa', OptionalParseIntPipe) idEmpresa?: number) {
    return this.financeiroService.listarDividas(idEmpresa);
  }

  @Roles('admin')
  @Get('fluxo-caixa-projecao')
  calcularFluxoCaixa(
    @Query('idEmpresa', OptionalParseIntPipe) idEmpresa?: number,
    @Query('dias') dias?: number,
  ) {
    return this.financeiroService.calcularFluxoCaixa(idEmpresa, dias || 30);
  }

  @Roles('admin', 'financeiro')
  @Get('dre')
  gerarDre(@Query() query: DreQueryDto) {
    return this.financeiroService.gerarDre({
      dataInicio: query.dataInicio,
      dataFim: query.dataFim,
      regime: query.regime,
      idEmpresa: query.idEmpresa,
    });
  }
}

import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { Roles } from '@hunter-solucoes/node-arqt-base-gerenciador-usuarios';
import { CombustivelService, CreateVeiculoDto, CreateAbastecimentoDto, CreatePagamentoKmDto, UpdateConfiguracaoKmDto } from '../business/combustivel.service';
import { OptionalParseIntPipe } from '../dto/optional-parse-int';

@Controller('financeiro/combustivel')
export class CombustivelController {
  constructor(private readonly combustivelService: CombustivelService) {}

  // =================================================================
  // VEÍCULOS
  // =================================================================

  @Roles('admin', 'vendas', 'financeiro')
  @Post('veiculos')
  criarVeiculo(@Body() dto: CreateVeiculoDto) {
    return this.combustivelService.criarVeiculo(dto);
  }

  @Roles('admin', 'vendas', 'financeiro')
  @Get('veiculos')
  listarVeiculos() {
    return this.combustivelService.listarVeiculos();
  }

  @Roles('admin', 'vendas', 'financeiro')
  @Get('veiculos/:id')
  buscarVeiculoPorId(@Param('id', ParseIntPipe) id: number) {
    return this.combustivelService.buscarVeiculoPorId(id);
  }

  @Roles('admin', 'vendas', 'financeiro')
  @Put('veiculos/:id')
  atualizarVeiculo(@Param('id', ParseIntPipe) id: number, @Body() dto: Partial<CreateVeiculoDto>) {
    return this.combustivelService.atualizarVeiculo(id, dto);
  }

  @Roles('admin', 'vendas', 'financeiro')
  @Delete('veiculos/:id')
  excluirVeiculo(@Param('id', ParseIntPipe) id: number) {
    return this.combustivelService.excluirVeiculo(id);
  }

  // =================================================================
  // ABASTECIMENTOS
  // =================================================================

  @Roles('admin', 'vendas', 'financeiro')
  @Post('abastecimento')
  registrarAbastecimento(@Body() dto: CreateAbastecimentoDto) {
    return this.combustivelService.registrarAbastecimento(dto);
  }

  @Roles('admin', 'vendas', 'financeiro')
  @Get('abastecimentos')
  listarAbastecimentos(
    @Query('idVeiculo', OptionalParseIntPipe) idVeiculo?: number,
    @Query('dataInicio') dataInicio?: string,
    @Query('dataFim') dataFim?: string,
  ) {
    return this.combustivelService.listarAbastecimentos(idVeiculo, dataInicio, dataFim);
  }

  @Roles('admin', 'vendas', 'financeiro')
  @Get('veiculos/:id/consumo')
  obterConsumoVeiculo(
    @Param('id', ParseIntPipe) id: number,
    @Query('dataInicio') dataInicio?: string,
    @Query('dataFim') dataFim?: string,
  ) {
    return this.combustivelService.calcularConsumo(id, dataInicio, dataFim);
  }

  // =================================================================
  // CONFIGURAÇÃO DE KM
  // =================================================================

  @Roles('admin', 'vendas', 'financeiro')
  @Get('configuracao-km')
  obterConfiguracaoKm() {
    return this.combustivelService.obterConfiguracaoKm();
  }

  @Roles('admin', 'vendas', 'financeiro')
  @Put('configuracao-km')
  atualizarConfiguracaoKm(@Body() dto: UpdateConfiguracaoKmDto) {
    return this.combustivelService.atualizarConfiguracaoKm(dto);
  }

  // =================================================================
  // PAGAMENTOS DE KM
  // =================================================================

  @Roles('admin', 'vendas', 'financeiro')
  @Post('pagamento-km')
  registrarPagamentoKm(@Body() dto: CreatePagamentoKmDto) {
    return this.combustivelService.registrarPagamentoKm(dto);
  }

  @Roles('admin', 'vendas', 'financeiro')
  @Get('pagamentos-km')
  listarPagamentosKm(
    @Query('dataInicio') dataInicio?: string,
    @Query('dataFim') dataFim?: string,
  ) {
    return this.combustivelService.listarPagamentosKm(dataInicio, dataFim);
  }

  @Roles('admin', 'vendas', 'financeiro')
  @Get('pagamentos-km/:id')
  buscarPagamentoKmPorId(@Param('id', ParseIntPipe) id: number) {
    return this.combustivelService.buscarPagamentoKmPorId(id);
  }
}


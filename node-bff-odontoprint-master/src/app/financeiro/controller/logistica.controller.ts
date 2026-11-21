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
import {
  LogisticaService,
  CreateFornecedorLogisticaDto,
  CreateEntregaDto,
} from '../business/logistica.service';
import { StatusEntrega } from '../domain/entrega.entity';
import { OptionalParseIntPipe } from '../dto/optional-parse-int';

@Controller('financeiro/logistica')
export class LogisticaController {
  constructor(private readonly logisticaService: LogisticaService) {}

  // =================================================================
  // FORNECEDORES
  // =================================================================

  @Roles('admin', 'vendas', 'financeiro')
  @Post('fornecedores')
  criarFornecedor(@Body() dto: CreateFornecedorLogisticaDto) {
    return this.logisticaService.criarFornecedor(dto);
  }

  @Roles('admin', 'vendas', 'financeiro')
  @Get('fornecedores')
  listarFornecedores(@Query('idEmpresa', OptionalParseIntPipe) idEmpresa?: number) {
    return this.logisticaService.listarFornecedores(idEmpresa);
  }

  @Roles('admin', 'vendas', 'financeiro')
  @Get('fornecedores/:id')
  buscarFornecedorPorId(@Param('id', ParseIntPipe) id: number) {
    return this.logisticaService.buscarFornecedorPorId(id);
  }

  @Roles('admin', 'vendas', 'financeiro')
  @Put('fornecedores/:id')
  atualizarFornecedor(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: Partial<CreateFornecedorLogisticaDto>,
  ) {
    return this.logisticaService.atualizarFornecedor(id, dto);
  }

  @Roles('admin', 'vendas', 'financeiro')
  @Delete('fornecedores/:id')
  excluirFornecedor(@Param('id', ParseIntPipe) id: number) {
    return this.logisticaService.excluirFornecedor(id);
  }

  // =================================================================
  // ENTREGAS
  // =================================================================

  @Roles('admin', 'vendas', 'financeiro')
  @Post('entrega')
  registrarEntrega(@Body() dto: CreateEntregaDto) {
    return this.logisticaService.registrarEntrega(dto);
  }

  @Roles('admin', 'vendas', 'financeiro')
  @Get('entregas')
  listarEntregas(
    @Query('idFornecedorLogistica', OptionalParseIntPipe) idFornecedorLogistica?: number,
    @Query('dataInicio') dataInicio?: string,
    @Query('dataFim') dataFim?: string,
    @Query('status') status?: StatusEntrega,
  ) {
    return this.logisticaService.listarEntregas(idFornecedorLogistica, dataInicio, dataFim, status);
  }

  @Roles('admin', 'vendas', 'financeiro')
  @Put('entregas/:id/status')
  atualizarStatusEntrega(@Param('id', ParseIntPipe) id: number, @Body('status') status: StatusEntrega) {
    return this.logisticaService.atualizarStatusEntrega(id, status);
  }
}


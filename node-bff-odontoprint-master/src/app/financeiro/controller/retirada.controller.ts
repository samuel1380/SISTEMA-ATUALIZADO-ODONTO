import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  ParseIntPipe,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Roles } from '@hunter-solucoes/node-arqt-base-gerenciador-usuarios';
import { RetiradaService } from '../business/retirada.service';
import { CreateRetiradaDto } from '../dto/create-retirada.dto';
import { TipoRetirada } from '../domain/retirada.entity';
import { OptionalParseIntPipe } from '../dto/optional-parse-int';

@Controller('financeiro/capital')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
export class RetiradaController {
  constructor(private readonly retiradaService: RetiradaService) {}

  @Roles('admin')
  @Post('retirada')
  async registrarRetirada(@Body() dto: CreateRetiradaDto) {
    return this.retiradaService.registrarRetirada(dto);
  }

  @Roles('admin', 'financeiro')
  @Get('retiradas')
  async listarRetiradas(
    @Query('idSocio', OptionalParseIntPipe) idSocio?: number,
    @Query('dataInicio') dataInicio?: string,
    @Query('dataFim') dataFim?: string,
    @Query('tipo') tipo?: TipoRetirada,
  ) {
    return this.retiradaService.listarRetiradas(idSocio, dataInicio, dataFim, tipo);
  }

  @Roles('admin', 'financeiro')
  @Get('retiradas/:id')
  async buscarRetirada(@Param('id', ParseIntPipe) id: number) {
    return this.retiradaService.buscarRetiradaPorId(id);
  }
}

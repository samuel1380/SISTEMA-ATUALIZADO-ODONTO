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
  SocioCredorService,
  CreateSocioDto,
  CreateCredorDto,
} from '../business/socio-credor.service';
import { OptionalParseIntPipe } from '../dto/optional-parse-int';

@Controller('financeiro/capital')
export class SocioCredorController {
  constructor(private readonly socioCredorService: SocioCredorService) {}

  // =================================================================
  // SÓCIOS
  // =================================================================

  @Roles('admin')
  @Post('socios')
  criarSocio(@Body() dto: CreateSocioDto) {
    return this.socioCredorService.criarSocio(dto);
  }

  @Roles('admin')
  @Get('socios')
  listarSocios(@Query('idEmpresa', OptionalParseIntPipe) idEmpresa?: number) {
    return this.socioCredorService.listarSocios(idEmpresa);
  }

  @Roles('admin')
  @Get('socios/:id')
  buscarSocioPorId(@Param('id', ParseIntPipe) id: number) {
    return this.socioCredorService.buscarSocioPorId(id);
  }

  @Roles('admin')
  @Put('socios/:id')
  atualizarSocio(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: Partial<CreateSocioDto>,
  ) {
    return this.socioCredorService.atualizarSocio(id, dto);
  }

  @Roles('admin')
  @Delete('socios/:id')
  excluirSocio(@Param('id', ParseIntPipe) id: number) {
    return this.socioCredorService.excluirSocio(id);
  }

  // =================================================================
  // CREDORES
  // =================================================================

  @Roles('admin')
  @Post('credores')
  criarCredor(@Body() dto: CreateCredorDto) {
    return this.socioCredorService.criarCredor(dto);
  }

  @Roles('admin')
  @Get('credores')
  listarCredores(@Query('idEmpresa', OptionalParseIntPipe) idEmpresa?: number) {
    return this.socioCredorService.listarCredores(idEmpresa);
  }

  @Roles('admin')
  @Get('credores/:id')
  buscarCredorPorId(@Param('id', ParseIntPipe) id: number) {
    return this.socioCredorService.buscarCredorPorId(id);
  }

  @Roles('admin')
  @Put('credores/:id')
  atualizarCredor(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: Partial<CreateCredorDto>,
  ) {
    return this.socioCredorService.atualizarCredor(id, dto);
  }

  @Roles('admin')
  @Delete('credores/:id')
  excluirCredor(@Param('id', ParseIntPipe) id: number) {
    return this.socioCredorService.excluirCredor(id);
  }
}


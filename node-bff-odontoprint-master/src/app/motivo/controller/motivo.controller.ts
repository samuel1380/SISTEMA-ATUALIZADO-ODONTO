import { CurrentUser, Roles } from '@hunter-solucoes/node-arqt-base-gerenciador-usuarios/dist';
import {
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
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { MotivoService } from '../business/motivo.service';
import { MotivoDto, MotivoTipo } from '../dto/motivo.dto';

@ApiTags('Motivo')
@Controller('motivo')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
export class MotivoController {
  constructor(private motivoService: MotivoService) {}

  @Roles('admin')
  @Post()
  async cadastrarMotivo(@CurrentUser() currentUser: any, @Body() motivoDto: MotivoDto) {
    return this.motivoService.cadastrarMotivo(currentUser, motivoDto);
  }

  @Roles('admin', 'producao', 'vendas', 'financeiro')
  @Get()
  async buscaMotivos(@Query('tipo') tipo?: MotivoTipo, @Query('todas') todas?: string) {
    const incluirInativos = todas === 'true' || todas === '1';
    return this.motivoService.buscaMotivos(tipo, incluirInativos);
  }

  @Roles('admin')
  @Get(':idMotivo')
  async buscaMotivoPorId(@Param('idMotivo', ParseIntPipe) idMotivo: number) {
    return this.motivoService.buscaMotivoPorId(idMotivo);
  }

  @Roles('admin')
  @Put(':idMotivo')
  async editarMotivo(@Param('idMotivo', ParseIntPipe) idMotivo: number, @Body() motivoDto: Partial<MotivoDto>) {
    return this.motivoService.editarMotivo(idMotivo, motivoDto);
  }

  @Roles('admin')
  @Delete(':idMotivo')
  @HttpCode(HttpStatus.NO_CONTENT)
  async desativarMotivo(@Param('idMotivo', ParseIntPipe) idMotivo: number) {
    return this.motivoService.desativarMotivo(idMotivo);
  }
}


import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  Body,
  ParseIntPipe,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Roles, CurrentUser } from '@hunter-solucoes/node-arqt-base-gerenciador-usuarios';
import { ConciliacaoService } from '../business/conciliacao.service';
import { VincularConciliacaoDto } from '../dto/vincular-conciliacao.dto';
import { FiltroConciliacaoDto } from '../dto/filtro-conciliacao.dto';
import { OptionalParseIntPipe } from '../dto/optional-parse-int';

@Controller('financeiro/conciliacao')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
export class ConciliacaoController {
  constructor(private readonly conciliacaoService: ConciliacaoService) {}

  @Roles('admin', 'financeiro')
  @Get('transacoes')
  async listarTransacoes(@Query() filtros: FiltroConciliacaoDto) {
    return this.conciliacaoService.listarTransacoesNaoConciliadas(filtros);
  }

  @Roles('admin', 'financeiro')
  @Get('disponiveis')
  async listarDisponiveis(@Query() filtros: FiltroConciliacaoDto) {
    return this.conciliacaoService.listarMovimentacoesDisponiveis(filtros);
  }

  @Roles('admin', 'financeiro')
  @Post('vincular')
  async vincular(
    @Body() dto: VincularConciliacaoDto,
    @CurrentUser() currentUser: any,
  ) {
    const idUsuario = currentUser.user?.idUsuario || currentUser.user?.id || 0;
    return this.conciliacaoService.vincularConciliacao(dto, idUsuario);
  }

  @Roles('admin', 'financeiro')
  @Delete(':id')
  async desfazerConciliacao(@Param('id', ParseIntPipe) id: number) {
    await this.conciliacaoService.desfazerConciliacao(id);
    return { message: 'Conciliação desfeita com sucesso.' };
  }

  @Roles('admin', 'financeiro')
  @Post(':id/ignorar')
  async ignorarTransacao(@Param('id', ParseIntPipe) id: number) {
    await this.conciliacaoService.ignorarTransacao(id);
    return { message: 'Transação marcada como ignorada.' };
  }

  @Roles('admin', 'financeiro')
  @Get('sugestoes/:idTransacao')
  async buscarSugestoes(@Param('idTransacao', ParseIntPipe) idTransacao: number) {
    return this.conciliacaoService.buscarSugestoes(idTransacao);
  }
}

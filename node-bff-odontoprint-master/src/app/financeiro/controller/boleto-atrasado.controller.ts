import { Controller, Get, Query, Param } from '@nestjs/common';
import { Roles } from '@hunter-solucoes/node-arqt-base-gerenciador-usuarios';
import { BoletoAtrasadoService } from '../business/boleto-atrasado.service';
import { OptionalParseIntPipe } from '../dto/optional-parse-int';
import { TipoLancamento } from '../domain/tipo-lancamento.enum';

@Controller('financeiro/boletos-atrasados')
export class BoletoAtrasadoController {
  constructor(private readonly boletoAtrasadoService: BoletoAtrasadoService) {}

  @Roles('admin')
  @Get()
  listarBoletosAtrasados(
    @Query('idEmpresa', OptionalParseIntPipe) idEmpresa?: number,
    @Query('tipo') tipo?: TipoLancamento,
  ) {
    console.log('listarBoletosAtrasados query params:', { idEmpresa, tipo });
    return this.boletoAtrasadoService.listarBoletosAtrasados(idEmpresa, tipo);
  }

  @Roles('admin')
  @Get(':id/resumo')
  obterResumoBoleto(@Param('id') id: string) {
    return this.boletoAtrasadoService.obterResumoBoleto(parseInt(id, 10));
  }
}


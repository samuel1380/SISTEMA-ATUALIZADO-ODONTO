import { Body, Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { CreateTransferenciaDto } from '../domain/dto/create-transferencia.dto';
import { TransferenciaService } from '../service/transferencia.service';
import { Roles } from '@hunter-solucoes/node-arqt-base-gerenciador-usuarios';

@Controller('transferencia')
export class TransferenciaController {
  constructor(private readonly transferenciaService: TransferenciaService) {}

  @Roles('admin', 'vendas', 'financeiro')
  @Post()
  create(@Body() createTransferenciaDto: CreateTransferenciaDto) {
    return this.transferenciaService.create(createTransferenciaDto);
  }

  @Roles('admin', 'vendas', 'financeiro')
  @Get()
  findAll() {
    return this.transferenciaService.findAll();
  }

  @Roles('admin', 'vendas', 'financeiro')
  @Get('debitos/:idAlmoxarifado')
  findDebts(@Param('idAlmoxarifado', ParseIntPipe) idAlmoxarifado: number) {
    return this.transferenciaService.findDebtsByAlmoxarifado(idAlmoxarifado);
  }

  @Roles('admin', 'vendas', 'financeiro')
  @Get('creditos/:idAlmoxarifado')
  findCredits(@Param('idAlmoxarifado', ParseIntPipe) idAlmoxarifado: number) {
    return this.transferenciaService.findCreditsByAlmoxarifado(idAlmoxarifado);
  }
}

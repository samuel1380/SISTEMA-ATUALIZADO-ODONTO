import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { LogsService } from '../business/logs.service';
import { Roles } from '@hunter-solucoes/node-arqt-base-gerenciador-usuarios/dist';

@ApiTags('Logs')
@Controller('logs')
export class LogsController {
  constructor(private readonly logsService: LogsService) {}

  @Roles('admin')
  @Get()
  async listarLogs(@Query() query: any) {
    return this.logsService.listarLogs(query);
  }

  @Roles('admin')
  @Get(':idLog')
  async buscarLogPorId(@Param('idLog', ParseIntPipe) idLog: number) {
    return this.logsService.buscarLogPorId(idLog);
  }
}

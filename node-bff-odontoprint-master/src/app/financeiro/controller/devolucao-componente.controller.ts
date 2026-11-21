import { Body, Controller, Get, Param, ParseIntPipe, Post, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentUser, Roles } from '@hunter-solucoes/node-arqt-base-gerenciador-usuarios';
import { DevolucaoComponenteService } from '../business/devolucao-componente.service';
import { CreateDevolucaoDto } from '../dto/create-devolucao.dto';

@ApiTags('Financeiro - Devoluções')
@Controller('devolucao-componente')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
export class DevolucaoComponenteController {
    constructor(private readonly devolucaoService: DevolucaoComponenteService) {}

    @Roles('admin', 'vendas', 'financeiro')
    @Post('solicitar')
    solicitarDevolucao(@Body() dto: CreateDevolucaoDto) {
        return this.devolucaoService.solicitarDevolucao(dto);
    }

    @Roles('admin', 'vendas', 'financeiro')
    @Post(':id/confirmar')
    confirmarRecebimento(
        @CurrentUser() currentUser: any,
        @Param('id', ParseIntPipe) id: number
    ) {
        return this.devolucaoService.confirmarRecebimento(id, currentUser);
    }

    @Roles('admin', 'vendas', 'financeiro')
    @Get('pendentes')
    listarComponentesPendentes(@Query('idEmpresa') idEmpresa?: string) {
        const idEmpresaNumber = idEmpresa ? parseInt(idEmpresa, 10) : undefined;
        return this.devolucaoService.listarComponentesPendentes(idEmpresaNumber);
    }

    @Roles('admin', 'vendas', 'financeiro')
    @Get('concluidas')
    listarComponentesConcluidos(@Query('idEmpresa') idEmpresa?: string) {
        const idEmpresaNumber = idEmpresa ? parseInt(idEmpresa, 10) : undefined;
        return this.devolucaoService.listarComponentesConcluidos(idEmpresaNumber);
    }

    @Roles('admin', 'vendas', 'financeiro')
    @Get('fatura/:idFatura')
    listarDevolucoesPorFatura(@Param('idFatura', ParseIntPipe) idFatura: number) {
        return this.devolucaoService.listarDevolucoesPorFatura(idFatura);
    }
}

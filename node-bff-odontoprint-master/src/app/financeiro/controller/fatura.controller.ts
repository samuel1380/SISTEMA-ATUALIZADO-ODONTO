import { Controller, Post, Body, Get, Param, ParseIntPipe, Delete, Query, UsePipes, ValidationPipe, Put } from '@nestjs/common';
import { FaturaService } from '../business/fatura.service';
import { CreateFaturaDto } from '../dto/create-fatura.dto';
import { PagarItensFaturaDto } from '../dto/pagar-item-fatura.dto';
import { MoverOrdemServicoFaturaDto } from '../dto/mover-ordem-servico-fatura.dto';
import { AtualizarDescontoFaturaDto } from '../dto/atualizar-desconto-fatura.dto';
import { AtualizarAnotacoesFaturaDto } from '../dto/atualizar-anotacoes-fatura.dto';
import { AtualizarPeriodoFaturaDto } from '../dto/atualizar-periodo-fatura.dto';
import { LancarValorFaturaDto } from '../dto/lancar-valor-fatura.dto';
import { DividirFaturaDto } from '../dto/dividir-fatura.dto';
import { CurrentUser, Roles } from '@hunter-solucoes/node-arqt-base-gerenciador-usuarios';
import { FaturaRecorrenteService } from '../business/fatura-recorrente.service';
import { StatusFatura } from '../domain/fatura.entity';
import { OptionalParseIntPipe } from '../dto/optional-parse-int';
import { ParseStatusArrayPipe } from '../dto/parse-status-array.pipe';

@Controller('financeiro/faturas')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
export class FaturaController {
    constructor(
        private readonly faturaService: FaturaService,
        private readonly faturaRecorrenteService: FaturaRecorrenteService,
    ) {}

    @Roles('admin')
    @Post()
    criarFatura(@Body() dto: CreateFaturaDto) {
        return this.faturaService.criarFatura(dto);
    }


    @Roles('admin', 'financeiro')
    @Get()
    listarFaturas(
        @CurrentUser() currentUser: any,
        @Query('idEmpresa', new OptionalParseIntPipe()) idEmpresa?: number,
        @Query('status', new ParseStatusArrayPipe()) status?: StatusFatura[],
        @Query('competencia') competencia?: string,
    ) {
        return this.faturaService.listarFaturas(currentUser, idEmpresa, status, competencia);
    }

    @Roles('admin', 'financeiro')
    @Get('abertas/:idEmpresa')
    listarFaturasAbertasPorEmpresa(
        @Param('idEmpresa', ParseIntPipe) idEmpresa: number,
    ) {
        return this.faturaService.listarFaturasAbertasPorEmpresa(idEmpresa);
    }

    @Roles('admin', 'financeiro')
    @Get('relatorio-faturas-pendentes')
    relatorioFaturasPendentes(@CurrentUser() currentUser: any) {
        return this.faturaService.relatorioFaturasPendentes(currentUser);
    }

    @Roles('admin', 'financeiro')
    @Get(':id')
    buscarFaturaPorId(
        @Param('id', ParseIntPipe) id: number
    ) {
        return this.faturaService.buscarFaturaPorId(id);
    }

    @Roles('admin')
    @Get(':id/detalhamento-impressao')
    obterResumoImpressao(
        @Param('id', ParseIntPipe) id: number,
    ) {
        return this.faturaService.obterResumoImpressaoFatura(id);
    }

    @Roles('admin')
    @Get('impressao/competencia/:competencia')
    obterResumoImpressaoPorCompetencia(
        @Param('competencia') competencia: string,
        @Query('idEmpresa', new OptionalParseIntPipe()) idEmpresa?: number,
    ) {
        // Converte o formato com hífen (11-2025) para o formato com barra (11/2025)
        const competenciaFormatada = competencia.replace('-', '/');
        return this.faturaService.obterResumoImpressaoFaturasPorCompetencia(competenciaFormatada, idEmpresa);
    }

    @Roles('admin')
    @Post(':id/fechar')
    fecharFatura(
        @Param('id', ParseIntPipe) id: number
    ) {
        return this.faturaService.fecharFatura(id);
    }

    @Roles('admin')
    @Post(':id/recalcular')
    recalcularFatura(
        @Param('id', ParseIntPipe) id: number
    ) {
        return this.faturaService.recalcularFatura(id);
    }

    @Roles('admin', 'financeiro')
    @Post('organizar-mes-correto')
    organizarFaturasNoMesCorreto(
        @Query('idEmpresa', new OptionalParseIntPipe()) idEmpresa?: number,
    ) {
        return this.faturaService.organizarFaturasNoMesCorreto(idEmpresa);
    }

    @Roles('admin')
    @Post('recalcular-todas')
    recalcularFaturasEmAberto() {
        return this.faturaService.recalcularFaturasEmAberto();
    }

    @Roles('admin')
    @Post('corrigir-status-quitadas')
    corrigirStatusFaturasQuitadas() {
        return this.faturaService.corrigirStatusFaturasQuitadas();
    }

    @Roles('admin')
    @Delete(':idFatura/itens/:idOrdemServico')
    removerItemDaFatura(
        @Param('idFatura', ParseIntPipe) idFatura: number,
        @Param('idOrdemServico', ParseIntPipe) idOrdemServico: number,
    ) {
        return this.faturaService.removerItemDaFatura(idFatura, idOrdemServico);
    }

    @Roles('admin')
    @Post('pagar-itens')
    pagarItemFatura(@Body() dto: PagarItensFaturaDto) {
        return this.faturaService.pagarItemFatura(dto);
    }

    @Roles('admin')
    @Put('mover-ordem-servico')
    moverOrdemServicoFatura(@Body() dto: MoverOrdemServicoFaturaDto) {
        return this.faturaService.moverOrdemServicoFatura(dto);
    }

    @Roles('admin')
    @Put(':id/desconto')
    atualizarDescontoFatura(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: AtualizarDescontoFaturaDto
    ) {
        return this.faturaService.atualizarDescontoFatura(id, dto.desconto);
    }

    @Roles('admin')
    @Put(':id/anotacoes')
    atualizarAnotacoesFatura(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: AtualizarAnotacoesFaturaDto
    ) {
        return this.faturaService.atualizarAnotacoesFatura(id, dto.anotacoes);
    }

    @Roles('admin')
    @Post(':id/lancar-valor')
    lancarValorFatura(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: LancarValorFaturaDto
    ) {
        return this.faturaService.lancarValorFatura(id, dto);
    }

    @Roles('admin')
    @Post(':id/reabrir')
    reabrirFatura(@Param('id', ParseIntPipe) id: number) {
        return this.faturaService.reabrirFatura(id);
    }

    @Roles('admin')
    @Post(':id/dividir')
    dividirFatura(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: DividirFaturaDto
    ) {
        return this.faturaService.dividirFatura(id, dto);
    }

    @Roles('admin')
    @Get(':id/devolucoes-componentes')
    buscarDevolucoesComponentes(
        @Param('id', ParseIntPipe) id: number,
    ) {
        return this.faturaService.buscarDevolucoesComponentes(id);
    }

    @Roles('admin')
    @Post(':id/devolucoes-componentes')
    salvarDevolucoesComponentes(
        @Param('id', ParseIntPipe) id: number,
        @Body() items: { idComponente: number; quantidade: number }[],
    ) {
        return this.faturaService.salvarDevolucoesComponentes(id, items);
    }

    @Roles('admin', 'financeiro')
    @Put(':id/periodo')
    atualizarPeriodoFatura(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: AtualizarPeriodoFaturaDto,
    ) {
        return this.faturaService.atualizarPeriodoFatura(id, dto);
    }

    @Roles('admin', 'financeiro')
    @Get('empresa/:idEmpresa/todas')
    listarFaturasPorEmpresa(
        @Param('idEmpresa', ParseIntPipe) idEmpresa: number,
    ) {
        return this.faturaService.listarFaturasPorEmpresa(idEmpresa);
    }
}

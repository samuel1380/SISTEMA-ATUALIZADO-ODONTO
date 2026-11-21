import { CurrentUser, Roles } from '@hunter-solucoes/node-arqt-base-gerenciador-usuarios/dist';
import { BadRequestException, Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { EmpresaTabelaPrecoService } from '../business/empresaTabelaPreco.service';
import { CriarEmpresaTabelaPrecoDto } from '../dto/criar-empresa-tabela-preco.dto';
import { AtualizarEmpresaTabelaPrecoDto } from '../dto/atualizar-empresa-tabela-preco.dto';

@ApiTags('EmpresaTabelaPreco')
@Controller('empresa-tabela-preco')
export class EmpresaTabelaPrecoController {
  constructor(private readonly empresaTabelaPrecoService: EmpresaTabelaPrecoService) {}

  @Roles('admin', 'vendas')
  @Post()
  async criarAssociacao(
    @CurrentUser() currentUser: any,
    @Body() dto: CriarEmpresaTabelaPrecoDto
  ) {
    // Converter ISOString para Date preservando apenas o dia
    const dataInicio = this.parseISODatePreservandoDia(dto.dataInicio);
    const dataFim = dto.dataFim ? this.parseISODatePreservandoDia(dto.dataFim) : undefined;
    
    return this.empresaTabelaPrecoService.criarAssociacao(
      currentUser,
      dto.idEmpresa,
      dto.idTabelaPrecoProduto,
      dataInicio,
      dataFim
    );
  }

  /**
   * Converte uma ISOString para Date preservando apenas o dia (ignora hora e timezone)
   */
  private parseISODatePreservandoDia(isoString: string): Date {
    // Extrai apenas a parte da data (YYYY-MM-DD) da ISOString
    const match = isoString.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!match) {
      throw new BadRequestException(`Formato de data inválido: ${isoString}`);
    }
    const ano = parseInt(match[1], 10);
    const mes = parseInt(match[2], 10) - 1; // Mês é 0-indexed em JavaScript
    const dia = parseInt(match[3], 10);
    
    // Cria data em UTC para preservar exatamente o dia selecionado
    return new Date(Date.UTC(ano, mes, dia, 0, 0, 0, 0));
  }

  @Roles('admin', 'vendas', 'financeiro')
  @Get('empresa/:idEmpresa')
  async listarAssociacoesPorEmpresa(
    @Param('idEmpresa', ParseIntPipe) idEmpresa: number
  ) {
    return this.empresaTabelaPrecoService.listarAssociacoesPorEmpresa(idEmpresa);
  }

  @Roles('admin', 'vendas', 'financeiro')
  @Get(':id')
  async buscarAssociacaoPorId(
    @Param('id', ParseIntPipe) idEmpresaTabelaPreco: number
  ) {
    return this.empresaTabelaPrecoService.buscarAssociacaoPorId(idEmpresaTabelaPreco);
  }

  @Roles('admin', 'vendas')
  @Put(':id')
  async atualizarAssociacao(
    @CurrentUser() currentUser: any,
    @Param('id', ParseIntPipe) idEmpresaTabelaPreco: number,
    @Body() dto: AtualizarEmpresaTabelaPrecoDto
  ) {
    // Converter ISOString para Date preservando apenas o dia
    const dataInicio = dto.dataInicio ? this.parseISODatePreservandoDia(dto.dataInicio) : undefined;
    const dataFim = dto.dataFim !== undefined 
      ? (dto.dataFim ? this.parseISODatePreservandoDia(dto.dataFim) : null)
      : undefined;
    
    return this.empresaTabelaPrecoService.atualizarAssociacao(
      currentUser,
      idEmpresaTabelaPreco,
      dto.idTabelaPrecoProduto,
      dataInicio,
      dataFim
    );
  }

  @Roles('admin', 'vendas')
  @Delete(':id')
  async desativarAssociacao(
    @Param('id', ParseIntPipe) idEmpresaTabelaPreco: number
  ) {
    await this.empresaTabelaPrecoService.desativarAssociacao(idEmpresaTabelaPreco);
    return { message: 'Associação desativada com sucesso' };
  }
}

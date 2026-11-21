
import { Body, Controller, Get, Param, ParseIntPipe, Post, Put, Req, UseGuards } from '@nestjs/common';
import { ApiExcludeEndpoint, ApiTags } from '@nestjs/swagger';
import { Public, Roles } from '@hunter-solucoes/node-arqt-base-gerenciador-usuarios';
import { EmpresaCadastroDto } from '@hunter-solucoes/node-arqt-base-gerenciador-usuarios/dist/src/app/empresa/dto/empresaCadastro.dto';
import { GerenciadorEmpresaService } from '../business/gerenciadorEmpresa.service';

@ApiTags('Empresa')
@Controller('empresa')
export class GerenciadorEmpresaController {
  constructor(private gerenciadorEmpresaService: GerenciadorEmpresaService) { }

  @Public()
  @ApiExcludeEndpoint()
  @Post()
  async criaEmpresa(@Body() body: EmpresaCadastroDto) {
    return this.gerenciadorEmpresaService.cadastraEmpresa(body);
  }

  @Roles('admin')
  @Post('emitirEventosEmpresas')
  async emitirEventosEmpresas() {
    return this.gerenciadorEmpresaService.emitirEventosEmpresas();
  }

  @Roles('admin')
  @Put(':idEmpresa')
  async editarEmpresa(
    @Param('idEmpresa', ParseIntPipe) idEmpresa: number,
    @Body() body: EmpresaCadastroDto
  ) {
    return this.gerenciadorEmpresaService.editarEmpresa(idEmpresa, body);
  }

  @Roles('admin', 'producao')
  @Get()
  async buscarEmpresas() {
    return this.gerenciadorEmpresaService.buscarEmpresas();
  }

  @Roles('admin')
  @Get('aguardandoaprovacao')
  async buscarEmpresasAguardandoAprovacao() {
    return this.gerenciadorEmpresaService.buscarEmpresasAguardandoAprovacao();
  }

  @Roles('admin')
  @Get('aprovar/:idEmpresa')
  async aprovaEmpresa(@Param('idEmpresa', ParseIntPipe) idEmpresa: number): Promise<any> {
    return this.gerenciadorEmpresaService.aprovaEmpresa(idEmpresa);
  }

  @Roles('admin')
  @Get(':idEmpresa')
  async buscarEmpresa(@Param('idEmpresa', ParseIntPipe) idEmpresa: number) {
    return this.gerenciadorEmpresaService.buscarEmpresa(idEmpresa);
  }

  @Roles('admin')
  @Put(':idEmpresa/desativar')
  async desabilitarEmpresa(@Param('idEmpresa', ParseIntPipe) idEmpresa: number): Promise<any> {
    return this.gerenciadorEmpresaService.desabilitarEmpresa(idEmpresa);
  }
}

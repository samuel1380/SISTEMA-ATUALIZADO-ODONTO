
import { CurrentUser, Roles, } from '@hunter-solucoes/node-arqt-base-gerenciador-usuarios/dist';
import { Body, Controller, Get, Headers, HttpException, HttpStatus, Patch, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CadastroComplementarEmpresaService } from '../business/cadastroComplementarEmpresa.service';


import { CadastroComplementarEmpresaDto } from '../dto/produtoEmpresa.dto';
import { HttpResponse } from 'aws-sdk';

@ApiTags('Cadastro Complementar Empresa')
@Controller('cadastrocomplementar')
export class CadastroComplementarEmpresaController {
  constructor(private cadastroComplementarEmpresaService: CadastroComplementarEmpresaService) { }

  @Roles('admin')
  @Post()
  async cadastroComplementarEmpresa(
    @CurrentUser() currentUser: any,
    @Body() produtoCadastroDto: CadastroComplementarEmpresaDto,
    @Headers('idEmpresa') idEmpresaHeaders: string
  ) {
    const idEmpresa = parseInt(idEmpresaHeaders);

    return this.cadastroComplementarEmpresaService.cadastroComplementarEmpresa(currentUser, idEmpresa, produtoCadastroDto);
  }

  @Roles('admin')
  @Patch('pagamento')
  async atualizarPagamento(
    @CurrentUser() currentUser: any,
    @Body() body: { diaPagamento: number, tipoPagamento: string, quantidadeParcelas: number },
    @Headers('idEmpresa') idEmpresaHeaders: string
  ) {
    const idEmpresa = parseInt(idEmpresaHeaders);
    return this.cadastroComplementarEmpresaService.atualizarPagamento(idEmpresa, body.diaPagamento, body.tipoPagamento, body.quantidadeParcelas);
  }

  @Roles('admin', 'comum')
  @Get()
  async buscarCadastroComplementarEmpresa(
    @CurrentUser() currentUser: any,
    @Headers('idEmpresa') idEmpresaHeaders: string
  ) {
    let idEmpresa = currentUser.user.empresas && currentUser.user.empresas[0]?.idEmpresa;
    let cadastroComplementar;
    if (currentUser.user.tipoUsuario === "externo" && idEmpresa) {
      cadastroComplementar = this.cadastroComplementarEmpresaService.buscarCadastroComplementarEmpresa(idEmpresa);
    } else if (currentUser.user.tipoUsuario === "interno") {
      idEmpresa = parseInt(idEmpresaHeaders);
      cadastroComplementar = this.cadastroComplementarEmpresaService.buscarCadastroComplementarEmpresa(idEmpresa);
    }

    if (!cadastroComplementar) {
      throw new HttpException("Não encontrado", HttpStatus.NOT_FOUND);
    }
    return cadastroComplementar;
  }

  @Roles('admin')
  @Get("infos")
  async buscarInfosCadastroComplementar(
    @CurrentUser() currentUser: any
  ) {
    return this.cadastroComplementarEmpresaService.buscarInfosCadastroComplementar();
  }

}

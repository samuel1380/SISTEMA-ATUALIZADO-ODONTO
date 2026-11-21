
import { CurrentUser, Roles, } from '@hunter-solucoes/node-arqt-base-gerenciador-usuarios/dist';
import { Body, Controller, Get, Headers, Param, ParseIntPipe, Post, Put } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ProdutoEmpresaService } from '../business/produtosEmpresa.service';


import { ProdutoEmpresaDto } from '../dto/produtosEmpresa.dto';

@ApiTags('Produto da Empresa')
@Controller('produtoempresa')
export class ProdutoEmpresaController {
  constructor(private produtoEmpresaService: ProdutoEmpresaService) { }

  @Roles('admin')
  @Post()
  async cadastrarProdutoEmpresa(
    @CurrentUser() currentUser: any,
    @Body() produtoCadastroDto: ProdutoEmpresaDto[]
  ) {
    const idEmpresa = currentUser.user.empresas && currentUser.user.empresas[0]?.idEmpresa;

    return this.produtoEmpresaService.sincronizarProdutosEmpresa(currentUser, idEmpresa, produtoCadastroDto);
  }

  @Roles('admin', 'comum')
  @Get()
  async buscarProdutosEmpresa(
    @CurrentUser() currentUser: any,
    @Headers('idEmpresa') idEmpresaHeaders: any
  ) {
    const idEmpresa = currentUser.user.empresas && currentUser.user.empresas[0]?.idEmpresa;

    if (currentUser.user.tipoUsuario === "externo" && idEmpresa) {
      return this.produtoEmpresaService.buscarProdutosPorEmpresa(idEmpresa);
    } else if (currentUser.user.tipoUsuario === "interno") {
      return this.produtoEmpresaService.buscarProdutosPorEmpresa(idEmpresaHeaders);
    }

    return [];
  }

}


import { CurrentUser, Roles, } from '@hunter-solucoes/node-arqt-base-gerenciador-usuarios/dist';
import { Body, Controller, Get, Headers, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CorEmpresaService } from '../business/corEmpresa.service';
import { CorEmpresaDto } from '../dto/corEmpresa.dto';

@ApiTags('Cor da Empresa')
@Controller('corempresa')
export class CorEmpresaController {
  constructor(private corEmpresaService: CorEmpresaService) { }

  @Roles('admin')
  @Post()
  async cadastrarCorEmpresa(
    @CurrentUser() currentUser: any,
    @Body() CorEmpresaDto: CorEmpresaDto[]
  ) {
    const idEmpresa = currentUser.user.empresas && currentUser.user.empresas[0]?.idEmpresa;

    return this.corEmpresaService.sincronizarCoresEmpresa(currentUser, idEmpresa, CorEmpresaDto);
  }

  @Roles('admin', 'comum')
  @Get()
  async buscarCorEmpresa(
    @CurrentUser() currentUser: any,
    @Headers('idEmpresa') idEmpresaHeaders: any
  ) {
    const idEmpresa = currentUser.user.empresas && currentUser.user.empresas[0]?.idEmpresa;

    if (currentUser.user.tipoUsuario === "externo" && idEmpresa) {
      return this.corEmpresaService.buscarPorEmpresa(idEmpresa);
    } else if (currentUser.user.tipoUsuario === "interno") {
      return this.corEmpresaService.buscarPorEmpresa(idEmpresaHeaders);
    }

    return [];
  }

}

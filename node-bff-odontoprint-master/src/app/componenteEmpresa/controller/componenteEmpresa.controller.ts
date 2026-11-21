
import { CurrentUser, Roles, } from '@hunter-solucoes/node-arqt-base-gerenciador-usuarios/dist';
import { Controller, Get, Headers } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ComponenteEmpresaService } from '../business/componenteEmpresa.service';

@ApiTags('Componente da Empresa')
@Controller('componenteempresa')
export class ComponenteEmpresaController {
  constructor(private componenteEmpresaService: ComponenteEmpresaService) { }


  @Roles('admin', 'comum')
  @Get()
  async buscarComponenteEmpresa(
    @CurrentUser() currentUser: any,
    @Headers('idEmpresa') idEmpresaHeaders: any
  ) {
    const idEmpresa = currentUser.user.empresas && currentUser.user.empresas[0]?.idEmpresa;

    if (currentUser.user.tipoUsuario === "externo" && idEmpresa) {
      return this.componenteEmpresaService.buscarPorEmpresa(idEmpresa);
    } else if (currentUser.user.tipoUsuario === "interno") {
      return this.componenteEmpresaService.buscarPorEmpresa(idEmpresaHeaders);
    }

    return [];
  }

}

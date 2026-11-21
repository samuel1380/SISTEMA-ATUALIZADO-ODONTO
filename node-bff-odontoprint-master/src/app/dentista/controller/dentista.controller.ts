
import { CurrentUser, Roles, } from '@hunter-solucoes/node-arqt-base-gerenciador-usuarios/dist';
import { Body, Controller, Get, Headers, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DentistaService } from '../business/dentista.service';
import { DentistaDto } from '../dto/dentista.dto';

@ApiTags('Dentista')
@Controller('dentista')
export class DentistaController {
  constructor(private dentistaService: DentistaService) { }

  @Roles('admin')
  @Post()
  async cadastrarDentista(
    @CurrentUser() currentUser: any,
    @Body() dentistaDto: DentistaDto,
    @Headers('idEmpresa') idEmpresaHeaders: string
  ) {

    let idEmpresa = currentUser.user.empresas && currentUser.user.empresas[0]?.idEmpresa;

    if (currentUser.user.tipoUsuario === "externo" && idEmpresa) {
      dentistaDto.idEmpresa = idEmpresa;
      return this.dentistaService.cadastrarDentista(currentUser, idEmpresa, dentistaDto);
    } else if (currentUser.user.tipoUsuario === "interno") {
      idEmpresa = parseInt(idEmpresaHeaders);
      dentistaDto.idEmpresa = idEmpresa;
      return this.dentistaService.cadastrarDentista(currentUser, idEmpresa, dentistaDto);
    }
  }

  @Roles('admin', 'comum')
  @Get()
  async buscaDentistas(
    @CurrentUser() currentUser: any
  ) {
    let idEmpresa = currentUser.user.empresas && currentUser.user.empresas[0]?.idEmpresa;
    return this.dentistaService.buscaDentistaPorEmpresaId(idEmpresa);
  }

  @Roles('admin', 'producao')
  @Get('idEmpresa')
  async buscaDentistaPorEmpresaId(
    @Headers('idEmpresa') idEmpresaHeaders: string
  ) {
    return this.dentistaService.buscaDentistaPorEmpresaId(idEmpresaHeaders);
  }

}

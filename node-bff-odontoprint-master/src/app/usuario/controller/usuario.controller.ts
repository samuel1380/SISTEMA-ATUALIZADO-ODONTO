import { Controller, Get, Post, Put, Patch, Delete, Body, Param, ParseIntPipe, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { Roles, CurrentUser } from '@hunter-solucoes/node-arqt-base-gerenciador-usuarios';
import { ApiTags } from '@nestjs/swagger';
import { UsuarioService } from '../business/usuario.service';
import { CreateUsuarioDto } from '../dto/create-usuario.dto';
import { UpdateUsuarioDto } from '../dto/update-usuario.dto';
import { AdicionarPermissaoDto } from '../dto/adicionar-permissao.dto';
import { OptionalParseIntPipe } from '../../financeiro/dto/optional-parse-int';
import { ChangePasswordDto } from '../dto/change-password.dto';
import { ResetarSenhaDto } from '../dto/resetar-senha.dto';

@ApiTags('Usuário')
@Controller('usuario')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) {}

  @Roles('admin')
  @Get()
  async listarUsuarios(
    @Query('idEmpresa', new OptionalParseIntPipe()) idEmpresa?: number,
  ) {
    return this.usuarioService.listarUsuarios(idEmpresa);
  }

  @Roles('admin')
  @Get('empresa/:idEmpresa')
  async listarUsuariosPorEmpresa(
    @Param('idEmpresa', ParseIntPipe) idEmpresa: number,
  ) {
    return this.usuarioService.listarUsuariosPorEmpresa(idEmpresa);
  }

  @Roles('admin')
  @Get(':id')
  async buscarUsuarioPorId(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.usuarioService.buscarUsuarioPorId(id);
  }

  @Roles('admin')
  @Post()
  async criarUsuario(
    @CurrentUser() currentUser: any,
    @Body() dto: CreateUsuarioDto,
  ) {
    return this.usuarioService.criarUsuario(dto, currentUser);
  }

  @Roles('admin')
  @Put(':id')
  async editarUsuario(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUsuarioDto,
  ) {
    return this.usuarioService.editarUsuario(id, dto);
  }

  @Roles('admin')
  @Patch(':id/ativar')
  async ativarUsuario(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.usuarioService.ativarUsuario(id);
  }

  @Roles('admin')
  @Patch(':id/inativar')
  async inativarUsuario(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.usuarioService.inativarUsuario(id);
  }

  @Roles('admin')
  @Post(':id/permissoes')
  async adicionarPermissao(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AdicionarPermissaoDto,
  ) {
    return this.usuarioService.adicionarPermissao(id, dto.permissao);
  }

  @Roles('admin')
  @Delete(':id/permissoes/:permissao')
  async removerPermissao(
    @Param('id', ParseIntPipe) id: number,
    @Param('permissao') permissao: string,
  ) {
    return this.usuarioService.removerPermissao(id, permissao);
  }

  @Roles('admin')
  @Post(':id/reset-password')
  async resetarSenha(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto?: ResetarSenhaDto,
  ) {
    const novaSenha = dto?.novaSenha || (dto as any)?.senha;
    return this.usuarioService.resetarSenha(id, novaSenha);
  }

  @Post('change-password')
  async alterarSenha(
    @CurrentUser() currentUser: any,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.usuarioService.alterarSenha(currentUser.user.idUsuario, dto);
  }
}


import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiExcludeEndpoint, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';

import { JwtService } from '@nestjs/jwt';
import { Public } from '../guards/decorator/public.decorator';
import { AutenticacaoLocalGuard } from '../guards/autenticacaoLocalGuard';

@ApiTags('Auth')
@Controller('login')
export class LoginController {
  constructor(private jwtService: JwtService) { }

  @Public()
  @ApiExcludeEndpoint()
  @UseGuards(AutenticacaoLocalGuard)
  @Post()
  async authMedico(@Req() request: Request) {
    const usuario: any = request.user

    return {
      token: this.jwtService.sign(request.user),
      nome: usuario.nome,
      email: usuario.email,
      empresas: usuario.empresas,
      permissoes: usuario.permissoes,
      tipoUsuario: usuario.tipoUsuario
    };
  }
}

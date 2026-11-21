import { Injectable } from '@nestjs/common';
import { UsuarioService } from '../../usuario/business/usuario.service';

@Injectable()
export class AuthService {
  constructor(
    private usuarioService: UsuarioService
  ) { }

  async validUser(email: string, senha: string) {
    return await this.usuarioService.autentica(
      email,
      senha
    );
  }
}

import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { AuthService } from '../business/auth.service';
import { Unauthorized } from 'src/libs/unauthorized';

@Injectable()
export class AutenticacaoLocalStrategy extends PassportStrategy(Strategy, 'local') {
  constructor(private authService: AuthService) {
    super();
  }

  async validate(username: string, password: string): Promise<any> {
    console.log(username, password);
    const usuario = await this.authService.validUser(username, password);

    console.log("usuario", usuario);
    if (!usuario) {
      throw new Unauthorized('Não autorizado');
    }

    return usuario;
  }
}

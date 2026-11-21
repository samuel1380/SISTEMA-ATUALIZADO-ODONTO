import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AutorizacaoJwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    console.log("process.env.CHAVE_SECRETA_JWT", process.env.CHAVE_SECRETA_JWT)
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.CHAVE_SECRETA_JWT,
    });
  }
  async validate(payload: any) {
    return payload;
  }
}

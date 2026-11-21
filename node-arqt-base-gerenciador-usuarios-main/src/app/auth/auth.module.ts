import { Module } from '@nestjs/common';
import { AuthService } from './business/auth.service';
import { AutorizacaoJwtGuard } from './guards/autorizacaoJwtGuard';
import { AutorizacaoJwtStrategy } from './guards/autorizacaoJwtStrategy';
import { AutenticacaoLocalGuard } from './guards/autenticacaoLocalGuard';
import { AutenticacaoLocalStrategy } from './guards/autenticacaolocalStrategy';
import { AutorizacaoRoleGuard } from './guards/autorizacaoRoleGuard';
import { UsuarioModule } from '../usuario/usuario.module';
import { APP_GUARD, Reflector } from '@nestjs/core';
import { AutorizacaoGuard } from './guards/autorizacaoGuard';
import { JwtModule } from '@nestjs/jwt';
import { LoginController } from './controller/login.controller';

const roleGuard = {
  inject: [AutorizacaoJwtGuard, AutorizacaoRoleGuard],
  provide: APP_GUARD,
  useFactory: (
    jwtAuthGuard: AutorizacaoJwtGuard,
    roleGuard: AutorizacaoRoleGuard
  ) => {
    return new AutorizacaoGuard(
      jwtAuthGuard,
      roleGuard
    );
  }
};

@Module({
  imports: [
    UsuarioModule,
    JwtModule.register({
      secret: process.env.CHAVE_SECRETA_JWT,
      signOptions: { expiresIn: '4h' }
    })
  ],
  controllers: [LoginController],
  providers: [
    Reflector,
    AuthService,
    AutenticacaoLocalStrategy,
    AutorizacaoJwtStrategy,
    AutenticacaoLocalGuard,
    AutorizacaoRoleGuard,
    AutorizacaoJwtGuard,
    roleGuard,
  ],
  exports: []
})
export class AuthModule { }

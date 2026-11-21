import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AutorizacaoRoleGuard } from './autorizacaoRoleGuard';
import { AutorizacaoJwtGuard } from './autorizacaoJwtGuard';


@Injectable()
export class AutorizacaoGuard implements CanActivate {
  constructor(
    private jwtAuthGuard: AutorizacaoJwtGuard,
    private roleGuard: AutorizacaoRoleGuard,
  ) { }

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    return await this.jwtAuthGuard.canActivate(context) &&
    await this.roleGuard.canActivate(context)

  }
}

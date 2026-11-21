import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from './decorator/public.decorator';

@Injectable()
export class AutorizacaoJwtGuard extends AuthGuard('jwt') {

  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext): any {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);   
    if (isPublic) {
      return true;
    }

    const { user, headers } = context.switchToHttp().getRequest();
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: string): any {
    if (err || !user) {
      throw err || new UnauthorizedException();
    }
    return user;
  }
}

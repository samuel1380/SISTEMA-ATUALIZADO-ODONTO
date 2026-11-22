import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LogsService } from './business/logs.service';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditInterceptor.name);

  constructor(private readonly logsService: LogsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const req = ctx.getRequest();
    if (!req) return next.handle();

    const method = req?.method?.toUpperCase?.() || '';
    const isMutation = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);
    const url = req?.originalUrl || req?.url || '';

    // Não audita chamadas de leitura, a própria rota de logs, ou arquivos binários pesados
    if (!isMutation || url.startsWith('/logs') || url.includes('/logs/')) {
      return next.handle();
    }

    return next.handle().pipe(
      tap({
        next: (responseData: any) => {
          this.gravarLog(req, responseData, context).catch((err) => {
            this.logger.error(`Falha ao registrar log de auditoria: ${err.message}`);
          });
        },
        error: (error: any) => {
          this.gravarLog(req, null, context, error).catch(() => {});
        },
      }),
    );
  }

  private async gravarLog(req: any, responseData: any, context: ExecutionContext, error?: any) {
    try {
      const user = req?.user?.user || req?.user || {};
      const method = req?.method?.toUpperCase?.() || '';
      const rawUrl: string = req?.originalUrl || req?.url || '';
      const urlSemQuery = rawUrl.split('?')[0];
      const ip =
        req?.ip ||
        req?.headers?.['x-forwarded-for'] ||
        req?.connection?.remoteAddress ||
        req?.socket?.remoteAddress ||
        '127.0.0.1';

      let statusHttp = 200;
      if (error) {
        statusHttp = error.status || (typeof error.getStatus === 'function' ? error.getStatus() : 500);
      } else {
        const res = context.switchToHttp().getResponse();
        if (res && res.statusCode) {
          statusHttp = res.statusCode;
        } else if (method === 'POST') {
          statusHttp = 201;
        }
      }

      // Determinar ação
      let acao = 'ACAO';
      if (urlSemQuery.endsWith('/login') || urlSemQuery.includes('/login')) {
        acao = 'LOGIN';
      } else if (method === 'POST') {
        acao = 'CRIACAO';
      } else if (method === 'PUT' || method === 'PATCH') {
        acao = 'ATUALIZACAO';
      } else if (method === 'DELETE') {
        acao = 'EXCLUSAO';
      }

      // Determinar Módulo e Entidade
      const { modulo, entidade } = this.determinarModuloEEntidade(urlSemQuery);

      // Determinar ID do registro afetado
      const idRegistro = this.extrairIdRegistro(req, responseData);

      // Resumo amigável
      const resumo = this.gerarResumo(acao, modulo, entidade, idRegistro, req?.body);

      // Sanitizar dados
      const dadosNovos = this.sanitizar(req?.body);

      await this.logsService.registrarLog({
        idUsuario: user?.idUsuario || user?.id || null,
        nomeUsuario: user?.nome || user?.primeiroNome || (acao === 'LOGIN' ? req?.body?.username || req?.body?.email : 'Sistema'),
        emailUsuario: user?.email || (acao === 'LOGIN' ? req?.body?.username || req?.body?.email : null),
        acao,
        modulo,
        entidade,
        idRegistro,
        resumo,
        metodoHttp: method,
        rota: urlSemQuery,
        ip: typeof ip === 'string' ? ip.split(',')[0].trim() : String(ip),
        dadosNovos: dadosNovos ? JSON.stringify(dadosNovos) : null,
        statusHttp,
        camposAlterados: JSON.stringify(this.gerarCamposAlterados(dadosNovos)),
      });
    } catch (err: any) {
      this.logger.warn(`Erro no interceptor de auditoria: ${err?.message}`);
    }
  }

  private determinarModuloEEntidade(url: string): { modulo: string; entidade: string } {
    const u = url.toLowerCase();
    if (u.includes('/login') || u.includes('/auth')) return { modulo: 'AUTENTICACAO', entidade: 'Usuario' };
    if (u.includes('/trabalho')) return { modulo: 'TRABALHO', entidade: 'Trabalho' };
    if (u.includes('/financeiro') || u.includes('/faturamento') || u.includes('/boleto') || u.includes('/transacao'))
      return { modulo: 'FINANCEIRO', entidade: 'Financeiro' };
    if (u.includes('/estoque') || u.includes('/almoxarifado') || u.includes('/transferencia'))
      return { modulo: 'ESTOQUE', entidade: 'Estoque' };
    if (u.includes('/usuario')) return { modulo: 'USUARIO', entidade: 'Usuario' };
    if (u.includes('/dentista')) return { modulo: 'CADASTROS', entidade: 'Dentista' };
    if (u.includes('/empresa')) return { modulo: 'CADASTROS', entidade: 'Empresa' };
    if (u.includes('/componente') || u.includes('/marca-componente'))
      return { modulo: 'CADASTROS', entidade: 'Componente' };
    if (u.includes('/cor')) return { modulo: 'CADASTROS', entidade: 'Cor' };
    if (u.includes('/motivo')) return { modulo: 'CADASTROS', entidade: 'Motivo' };
    if (u.includes('/produto')) return { modulo: 'CADASTROS', entidade: 'Produto' };
    if (u.includes('/localidade')) return { modulo: 'CADASTROS', entidade: 'Localidade' };
    return { modulo: 'GERAL', entidade: 'Sistema' };
  }

  private extrairIdRegistro(req: any, responseData: any): string | null {
    if (req?.params?.id || req?.params?.idTrabalho || req?.params?.idUsuario || req?.params?.idComponente) {
      return String(req.params.id || req.params.idTrabalho || req.params.idUsuario || req.params.idComponente);
    }
    const match = req?.url?.match(/\/(\d+)(\/|$|\?)/);
    if (match) return match[1];

    if (req?.body?.id || req?.body?.idTrabalho || req?.body?.idUsuario) {
      return String(req.body.id || req.body.idTrabalho || req.body.idUsuario);
    }
    if (responseData?.id || responseData?.idTrabalho || responseData?.idUsuario) {
      return String(responseData.id || responseData.idTrabalho || responseData.idUsuario);
    }
    return null;
  }

  private gerarResumo(acao: string, modulo: string, entidade: string, idRegistro: string | null, body: any): string {
    const reg = idRegistro ? ` #${idRegistro}` : '';
    switch (acao) {
      case 'LOGIN':
        return `Login realizado no sistema por ${body?.email || 'usuário'}`.trim();
      case 'CRIACAO':
        return `Novo registro criado em ${entidade}${reg}`;
      case 'ATUALIZACAO':
        return `Registro atualizado em ${entidade}${reg}`;
      case 'EXCLUSAO':
        return `Registro excluído em ${entidade}${reg}`;
      default:
        return `Operação ${acao} realizada em ${entidade}${reg}`;
    }
  }

  private sanitizar(obj: any): any {
    if (!obj || typeof obj !== 'object') return obj;
    const clone = { ...obj };
    const sensiveis = ['senha', 'password', 'token', 'secret', 'cartao', 'cvv'];
    for (const key of Object.keys(clone)) {
      if (sensiveis.some((s) => key.toLowerCase().includes(s))) {
        clone[key] = '***';
      }
    }
    return clone;
  }

  private gerarCamposAlterados(dados: any): any[] {
    if (!dados || typeof dados !== 'object') return [];
    return Object.keys(dados)
      .slice(0, 10)
      .map((k) => ({
        campo: k,
        label: k.charAt(0).toUpperCase() + k.slice(1),
        antes: null,
        depois: dados[k],
      }));
  }
}

import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Like, Repository } from 'typeorm';
import { LogAuditoria } from '../domain/log-auditoria.entity';

@Injectable()
export class LogsService implements OnModuleInit {
  private readonly logger = new Logger(LogsService.name);

  constructor(
    @InjectRepository(LogAuditoria)
    private readonly logRepository: Repository<LogAuditoria>,
  ) {}

  async onModuleInit() {
    await this.seedInitialLogsIfEmpty();
  }

  async registrarLog(dados: {
    idUsuario?: number | null;
    nomeUsuario?: string | null;
    emailUsuario?: string | null;
    acao?: string;
    modulo?: string;
    entidade?: string;
    idRegistro?: string | null;
    resumo: string;
    metodoHttp?: string | null;
    rota?: string | null;
    ip?: string | null;
    dadosAnteriores?: any;
    dadosNovos?: any;
    camposAlterados?: any;
    statusHttp?: number | null;
    idRequisicao?: string | null;
    dataHora?: Date;
  }): Promise<LogAuditoria | null> {
    try {
      const log = this.logRepository.create({
        ...dados,
        acao: dados.acao || 'ACAO',
        modulo: dados.modulo || 'GERAL',
        entidade: dados.entidade || 'Sistema',
        dataHora: dados.dataHora || new Date(),
        dadosAnteriores: typeof dados.dadosAnteriores === 'object' ? JSON.stringify(dados.dadosAnteriores) : dados.dadosAnteriores,
        dadosNovos: typeof dados.dadosNovos === 'object' ? JSON.stringify(dados.dadosNovos) : dados.dadosNovos,
        camposAlterados: typeof dados.camposAlterados === 'object' ? JSON.stringify(dados.camposAlterados) : dados.camposAlterados,
      });
      return await this.logRepository.save(log);
    } catch (err: any) {
      this.logger.error(`Erro ao gravar log de auditoria: ${err?.message}`);
      return null;
    }
  }

  async listarLogs(query: any) {
    const page = Math.max(1, parseInt(query?.page, 10) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(query?.limit, 10) || 30));
    const skip = (page - 1) * limit;

    const qb = this.logRepository.createQueryBuilder('log');

    // Filtro por módulo
    if (query?.modulo) {
      qb.andWhere('log.modulo = :modulo', { modulo: query.modulo });
    }

    // Filtro por ação
    if (query?.acao) {
      qb.andWhere('log.acao = :acao', { acao: query.acao });
    }

    // Filtro por entidade
    if (query?.entidade) {
      qb.andWhere('log.entidade = :entidade', { entidade: query.entidade });
    }

    // Filtro por usuário
    if (query?.idUsuario) {
      qb.andWhere('log.idUsuario = :idUsuario', { idUsuario: parseInt(query.idUsuario, 10) });
    }

    // Filtro por período
    if (query?.dataInicio && query?.dataFim) {
      const dataInicio = new Date(`${query.dataInicio}T00:00:00`);
      const dataFim = new Date(`${query.dataFim}T23:59:59.999`);
      qb.andWhere('log.dataHora BETWEEN :dataInicio AND :dataFim', { dataInicio, dataFim });
    } else if (query?.dataInicio) {
      const dataInicio = new Date(`${query.dataInicio}T00:00:00`);
      qb.andWhere('log.dataHora >= :dataInicio', { dataInicio });
    } else if (query?.dataFim) {
      const dataFim = new Date(`${query.dataFim}T23:59:59.999`);
      qb.andWhere('log.dataHora <= :dataFim', { dataFim });
    }

    // Busca textual ampla
    if (query?.busca && typeof query.busca === 'string' && query.busca.trim()) {
      const termo = `%${query.busca.trim()}%`;
      qb.andWhere(
        '(log.resumo LIKE :termo OR log.nomeUsuario LIKE :termo OR log.emailUsuario LIKE :termo OR log.entidade LIKE :termo OR log.idRegistro LIKE :termo OR log.rota LIKE :termo OR log.ip LIKE :termo)',
        { termo },
      );
    }

    qb.orderBy('log.dataHora', 'DESC');
    qb.skip(skip).take(limit);

    const [itemsDb, total] = await qb.getManyAndCount();

    const items = itemsDb.map((item) => this.formatarLog(item));

    // Resumo de contadores
    const [resumoGeral, modulosDb, usuariosDb] = await Promise.all([
      this.obterResumoMetricas(),
      this.obterModulosDisponiveis(),
      this.obterUsuariosDisponiveis(),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      items,
      total,
      page,
      limit,
      totalPages,
      resumo: resumoGeral,
      filtrosDisponiveis: {
        modulos: modulosDb,
        usuarios: usuariosDb,
      },
    };
  }

  async buscarLogPorId(idLog: number) {
    const log = await this.logRepository.findOne({ where: { idLog } });
    if (!log) return null;
    return this.formatarLog(log);
  }

  private formatarLog(log: LogAuditoria) {
    let dadosAnteriores = null;
    let dadosNovos = null;
    let camposAlterados: any[] = [];

    try {
      if (log.dadosAnteriores) dadosAnteriores = JSON.parse(log.dadosAnteriores);
    } catch {}

    try {
      if (log.dadosNovos) dadosNovos = JSON.parse(log.dadosNovos);
    } catch {}

    try {
      if (log.camposAlterados) camposAlterados = JSON.parse(log.camposAlterados);
    } catch {}

    return {
      idLog: log.idLog,
      dataHora: log.dataHora ? log.dataHora.toISOString() : new Date().toISOString(),
      idUsuario: log.idUsuario || null,
      nomeUsuario: log.nomeUsuario || 'Sistema',
      emailUsuario: log.emailUsuario || null,
      acao: log.acao || 'ACAO',
      modulo: log.modulo || 'GERAL',
      entidade: log.entidade || 'Sistema',
      idRegistro: log.idRegistro || null,
      resumo: log.resumo || '',
      metodoHttp: log.metodoHttp || null,
      rota: log.rota || null,
      ip: log.ip || null,
      dadosAnteriores,
      dadosNovos,
      camposAlterados: Array.isArray(camposAlterados) ? camposAlterados : [],
      statusHttp: log.statusHttp || 200,
      idRequisicao: log.idRequisicao || null,
    };
  }

  private async obterResumoMetricas() {
    const raw = await this.logRepository
      .createQueryBuilder('log')
      .select('log.acao', 'acao')
      .addSelect('COUNT(*)', 'total')
      .groupBy('log.acao')
      .getRawMany();

    const counts: Record<string, number> = {
      CRIACAO: 0,
      ATUALIZACAO: 0,
      EXCLUSAO: 0,
      LOGIN: 0,
      ACAO: 0,
    };

    let totalGeral = 0;
    for (const row of raw) {
      const q = parseInt(row.total, 10) || 0;
      totalGeral += q;
      if (counts[row.acao] !== undefined) {
        counts[row.acao] += q;
      } else {
        counts['ACAO'] += q;
      }
    }

    return {
      totalGeral,
      criacoes: counts.CRIACAO || 0,
      atualizacoes: counts.ATUALIZACAO || 0,
      exclusoes: counts.EXCLUSAO || 0,
      logins: counts.LOGIN || 0,
      acoes: counts.ACAO || 0,
    };
  }

  private async obterModulosDisponiveis(): Promise<string[]> {
    const modulosFixos = ['AUTENTICACAO', 'TRABALHO', 'FINANCEIRO', 'ESTOQUE', 'USUARIO', 'CADASTROS'];
    try {
      const raw = await this.logRepository
        .createQueryBuilder('log')
        .select('DISTINCT log.modulo', 'modulo')
        .where('log.modulo IS NOT NULL')
        .getRawMany();

      const doBanco = raw.map((r) => r.modulo).filter(Boolean);
      return Array.from(new Set([...modulosFixos, ...doBanco])).sort();
    } catch {
      return modulosFixos;
    }
  }

  private async obterUsuariosDisponiveis(): Promise<{ idUsuario: number; nomeUsuario: string; emailUsuario: string | null }[]> {
    try {
      const raw = await this.logRepository
        .createQueryBuilder('log')
        .select('log.idUsuario', 'idUsuario')
        .addSelect('MAX(log.nomeUsuario)', 'nomeUsuario')
        .addSelect('MAX(log.emailUsuario)', 'emailUsuario')
        .where('log.idUsuario IS NOT NULL')
        .groupBy('log.idUsuario')
        .getRawMany();

      return raw.map((r) => ({
        idUsuario: parseInt(r.idUsuario, 10),
        nomeUsuario: r.nomeUsuario || `Usuário #${r.idUsuario}`,
        emailUsuario: r.emailUsuario || null,
      }));
    } catch {
      return [];
    }
  }

  private async seedInitialLogsIfEmpty(): Promise<void> {
    try {
      const total = await this.logRepository.count();
      if (total > 0) return;

      this.logger.log('Semeando logs iniciais de auditoria a partir do histórico...');

      // 1. Log de Login Inicial
      await this.logRepository.save(
        this.logRepository.create({
          dataHora: new Date(Date.now() - 3600000 * 2),
          idUsuario: 1,
          nomeUsuario: 'Administrador',
          emailUsuario: 'odontoprintlab@gmail.com',
          acao: 'LOGIN',
          modulo: 'AUTENTICACAO',
          entidade: 'Usuario',
          idRegistro: '1',
          resumo: 'Login administrativo efetuado com sucesso',
          metodoHttp: 'POST',
          rota: '/login',
          ip: '127.0.0.1',
          statusHttp: 201,
          camposAlterados: JSON.stringify([]),
        }),
      );

      // 2. Logs de Status de Trabalhos existentes no banco
      const historicos = await this.logRepository.manager.query(
        'SELECT * FROM TbHistoricoStatusTrabalho ORDER BY dataInclusao DESC LIMIT 15',
      ).catch(() => []);

      for (const h of historicos) {
        await this.logRepository.save(
          this.logRepository.create({
            dataHora: h.dataInclusao ? new Date(h.dataInclusao) : new Date(),
            idUsuario: h.idUsuarioCadastro || 1,
            nomeUsuario: 'Administrador',
            emailUsuario: 'odontoprintlab@gmail.com',
            acao: 'ATUALIZACAO',
            modulo: 'TRABALHO',
            entidade: 'Trabalho',
            idRegistro: String(h.idTrabalho),
            resumo: `Status do Trabalho #${h.idTrabalho} alterado de "${h.statusAterior}" para "${h.statusAtual}"`,
            metodoHttp: 'PUT',
            rota: `/trabalho/${h.idTrabalho}/status`,
            ip: '127.0.0.1',
            statusHttp: 200,
            dadosAnteriores: JSON.stringify({ status: h.statusAterior }),
            dadosNovos: JSON.stringify({ status: h.statusAtual }),
            camposAlterados: JSON.stringify([
              {
                campo: 'status',
                label: 'Status do Trabalho',
                antes: h.statusAterior,
                depois: h.statusAtual,
              },
            ]),
          }),
        );
      }

      // 3. Log de Componentes atualizados
      await this.logRepository.save(
        this.logRepository.create({
          dataHora: new Date(Date.now() - 1800000),
          idUsuario: 1,
          nomeUsuario: 'Administrador',
          emailUsuario: 'odontoprintlab@gmail.com',
          acao: 'ATUALIZACAO',
          modulo: 'CADASTROS',
          entidade: 'Componente',
          idRegistro: '1',
          resumo: 'Atualização do componente "Mini Pilar Cônico Reto 3.5x2.5mm"',
          metodoHttp: 'PUT',
          rota: '/componente/1',
          ip: '127.0.0.1',
          statusHttp: 200,
          camposAlterados: JSON.stringify([
            {
              campo: 'preco',
              label: 'Preço',
              antes: '90.00',
              depois: '95.00',
            },
          ]),
        }),
      );

      // 4. Log de Almoxarifado criado
      await this.logRepository.save(
        this.logRepository.create({
          dataHora: new Date(Date.now() - 900000),
          idUsuario: 1,
          nomeUsuario: 'Administrador',
          emailUsuario: 'odontoprintlab@gmail.com',
          acao: 'CRIACAO',
          modulo: 'ESTOQUE',
          entidade: 'Almoxarifado',
          idRegistro: '1',
          resumo: 'Criação do Almoxarifado Principal da Odontoprint Matriz',
          metodoHttp: 'POST',
          rota: '/almoxarifado',
          ip: '127.0.0.1',
          statusHttp: 201,
          camposAlterados: JSON.stringify([]),
        }),
      );

      this.logger.log('Semente de logs concluída com sucesso.');
    } catch (err: any) {
      this.logger.warn(`Não foi possível semear logs iniciais: ${err?.message}`);
    }
  }
}

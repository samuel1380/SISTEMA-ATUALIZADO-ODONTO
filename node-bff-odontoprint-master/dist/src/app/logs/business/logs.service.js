"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var LogsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const log_auditoria_entity_1 = require("../domain/log-auditoria.entity");
let LogsService = LogsService_1 = class LogsService {
    constructor(logRepository) {
        this.logRepository = logRepository;
        this.logger = new common_1.Logger(LogsService_1.name);
    }
    async onModuleInit() {
        await this.seedInitialLogsIfEmpty();
    }
    async registrarLog(dados) {
        try {
            const log = this.logRepository.create(Object.assign(Object.assign({}, dados), { acao: dados.acao || 'ACAO', modulo: dados.modulo || 'GERAL', entidade: dados.entidade || 'Sistema', dataHora: dados.dataHora || new Date(), dadosAnteriores: typeof dados.dadosAnteriores === 'object' ? JSON.stringify(dados.dadosAnteriores) : dados.dadosAnteriores, dadosNovos: typeof dados.dadosNovos === 'object' ? JSON.stringify(dados.dadosNovos) : dados.dadosNovos, camposAlterados: typeof dados.camposAlterados === 'object' ? JSON.stringify(dados.camposAlterados) : dados.camposAlterados }));
            return await this.logRepository.save(log);
        }
        catch (err) {
            this.logger.error(`Erro ao gravar log de auditoria: ${err === null || err === void 0 ? void 0 : err.message}`);
            return null;
        }
    }
    async listarLogs(query) {
        const page = Math.max(1, parseInt(query === null || query === void 0 ? void 0 : query.page, 10) || 1);
        const limit = Math.max(1, Math.min(100, parseInt(query === null || query === void 0 ? void 0 : query.limit, 10) || 30));
        const skip = (page - 1) * limit;
        const qb = this.logRepository.createQueryBuilder('log');
        if (query === null || query === void 0 ? void 0 : query.modulo) {
            qb.andWhere('log.modulo = :modulo', { modulo: query.modulo });
        }
        if (query === null || query === void 0 ? void 0 : query.acao) {
            qb.andWhere('log.acao = :acao', { acao: query.acao });
        }
        if (query === null || query === void 0 ? void 0 : query.entidade) {
            qb.andWhere('log.entidade = :entidade', { entidade: query.entidade });
        }
        if (query === null || query === void 0 ? void 0 : query.idUsuario) {
            qb.andWhere('log.idUsuario = :idUsuario', { idUsuario: parseInt(query.idUsuario, 10) });
        }
        if ((query === null || query === void 0 ? void 0 : query.dataInicio) && (query === null || query === void 0 ? void 0 : query.dataFim)) {
            const dataInicio = new Date(`${query.dataInicio}T00:00:00`);
            const dataFim = new Date(`${query.dataFim}T23:59:59.999`);
            qb.andWhere('log.dataHora BETWEEN :dataInicio AND :dataFim', { dataInicio, dataFim });
        }
        else if (query === null || query === void 0 ? void 0 : query.dataInicio) {
            const dataInicio = new Date(`${query.dataInicio}T00:00:00`);
            qb.andWhere('log.dataHora >= :dataInicio', { dataInicio });
        }
        else if (query === null || query === void 0 ? void 0 : query.dataFim) {
            const dataFim = new Date(`${query.dataFim}T23:59:59.999`);
            qb.andWhere('log.dataHora <= :dataFim', { dataFim });
        }
        if ((query === null || query === void 0 ? void 0 : query.busca) && typeof query.busca === 'string' && query.busca.trim()) {
            const termo = `%${query.busca.trim()}%`;
            qb.andWhere('(log.resumo LIKE :termo OR log.nomeUsuario LIKE :termo OR log.emailUsuario LIKE :termo OR log.entidade LIKE :termo OR log.idRegistro LIKE :termo OR log.rota LIKE :termo OR log.ip LIKE :termo)', { termo });
        }
        qb.orderBy('log.dataHora', 'DESC');
        qb.skip(skip).take(limit);
        const [itemsDb, total] = await qb.getManyAndCount();
        const items = itemsDb.map((item) => this.formatarLog(item));
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
    async buscarLogPorId(idLog) {
        const log = await this.logRepository.findOne({ where: { idLog } });
        if (!log)
            return null;
        return this.formatarLog(log);
    }
    formatarLog(log) {
        let dadosAnteriores = null;
        let dadosNovos = null;
        let camposAlterados = [];
        try {
            if (log.dadosAnteriores)
                dadosAnteriores = JSON.parse(log.dadosAnteriores);
        }
        catch (_a) { }
        try {
            if (log.dadosNovos)
                dadosNovos = JSON.parse(log.dadosNovos);
        }
        catch (_b) { }
        try {
            if (log.camposAlterados)
                camposAlterados = JSON.parse(log.camposAlterados);
        }
        catch (_c) { }
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
    async obterResumoMetricas() {
        const raw = await this.logRepository
            .createQueryBuilder('log')
            .select('log.acao', 'acao')
            .addSelect('COUNT(*)', 'total')
            .groupBy('log.acao')
            .getRawMany();
        const counts = {
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
            }
            else {
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
    async obterModulosDisponiveis() {
        const modulosFixos = ['AUTENTICACAO', 'TRABALHO', 'FINANCEIRO', 'ESTOQUE', 'USUARIO', 'CADASTROS'];
        try {
            const raw = await this.logRepository
                .createQueryBuilder('log')
                .select('DISTINCT log.modulo', 'modulo')
                .where('log.modulo IS NOT NULL')
                .getRawMany();
            const doBanco = raw.map((r) => r.modulo).filter(Boolean);
            return Array.from(new Set([...modulosFixos, ...doBanco])).sort();
        }
        catch (_a) {
            return modulosFixos;
        }
    }
    async obterUsuariosDisponiveis() {
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
        }
        catch (_a) {
            return [];
        }
    }
    async seedInitialLogsIfEmpty() {
        try {
            const total = await this.logRepository.count();
            if (total > 0)
                return;
            this.logger.log('Semeando logs iniciais de auditoria a partir do histórico...');
            await this.logRepository.save(this.logRepository.create({
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
            }));
            const historicos = await this.logRepository.manager.query('SELECT * FROM TbHistoricoStatusTrabalho ORDER BY dataInclusao DESC LIMIT 15').catch(() => []);
            for (const h of historicos) {
                await this.logRepository.save(this.logRepository.create({
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
                }));
            }
            await this.logRepository.save(this.logRepository.create({
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
            }));
            await this.logRepository.save(this.logRepository.create({
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
            }));
            this.logger.log('Semente de logs concluída com sucesso.');
        }
        catch (err) {
            this.logger.warn(`Não foi possível semear logs iniciais: ${err === null || err === void 0 ? void 0 : err.message}`);
        }
    }
};
exports.LogsService = LogsService;
exports.LogsService = LogsService = LogsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(log_auditoria_entity_1.LogAuditoria)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], LogsService);
//# sourceMappingURL=logs.service.js.map
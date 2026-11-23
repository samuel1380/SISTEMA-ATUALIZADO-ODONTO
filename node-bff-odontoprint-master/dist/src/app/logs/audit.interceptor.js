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
var AuditInterceptor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditInterceptor = void 0;
const common_1 = require("@nestjs/common");
const operators_1 = require("rxjs/operators");
const logs_service_1 = require("./business/logs.service");
let AuditInterceptor = AuditInterceptor_1 = class AuditInterceptor {
    constructor(logsService) {
        this.logsService = logsService;
        this.logger = new common_1.Logger(AuditInterceptor_1.name);
    }
    intercept(context, next) {
        var _a, _b;
        const ctx = context.switchToHttp();
        const req = ctx.getRequest();
        if (!req)
            return next.handle();
        const method = ((_b = (_a = req === null || req === void 0 ? void 0 : req.method) === null || _a === void 0 ? void 0 : _a.toUpperCase) === null || _b === void 0 ? void 0 : _b.call(_a)) || '';
        const isMutation = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);
        const url = (req === null || req === void 0 ? void 0 : req.originalUrl) || (req === null || req === void 0 ? void 0 : req.url) || '';
        if (!isMutation || url.startsWith('/logs') || url.includes('/logs/')) {
            return next.handle();
        }
        return next.handle().pipe((0, operators_1.tap)({
            next: (responseData) => {
                this.gravarLog(req, responseData, context).catch((err) => {
                    this.logger.error(`Falha ao registrar log de auditoria: ${err.message}`);
                });
            },
            error: (error) => {
                this.gravarLog(req, null, context, error).catch(() => { });
            },
        }));
    }
    async gravarLog(req, responseData, context, error) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
        try {
            const user = ((_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a.user) || (req === null || req === void 0 ? void 0 : req.user) || {};
            const method = ((_c = (_b = req === null || req === void 0 ? void 0 : req.method) === null || _b === void 0 ? void 0 : _b.toUpperCase) === null || _c === void 0 ? void 0 : _c.call(_b)) || '';
            const rawUrl = (req === null || req === void 0 ? void 0 : req.originalUrl) || (req === null || req === void 0 ? void 0 : req.url) || '';
            const urlSemQuery = rawUrl.split('?')[0];
            const ip = (req === null || req === void 0 ? void 0 : req.ip) ||
                ((_d = req === null || req === void 0 ? void 0 : req.headers) === null || _d === void 0 ? void 0 : _d['x-forwarded-for']) ||
                ((_e = req === null || req === void 0 ? void 0 : req.connection) === null || _e === void 0 ? void 0 : _e.remoteAddress) ||
                ((_f = req === null || req === void 0 ? void 0 : req.socket) === null || _f === void 0 ? void 0 : _f.remoteAddress) ||
                '127.0.0.1';
            let statusHttp = 200;
            if (error) {
                statusHttp = error.status || (typeof error.getStatus === 'function' ? error.getStatus() : 500);
            }
            else {
                const res = context.switchToHttp().getResponse();
                if (res && res.statusCode) {
                    statusHttp = res.statusCode;
                }
                else if (method === 'POST') {
                    statusHttp = 201;
                }
            }
            let acao = 'ACAO';
            if (urlSemQuery.endsWith('/login') || urlSemQuery.includes('/login')) {
                acao = 'LOGIN';
            }
            else if (method === 'POST') {
                acao = 'CRIACAO';
            }
            else if (method === 'PUT' || method === 'PATCH') {
                acao = 'ATUALIZACAO';
            }
            else if (method === 'DELETE') {
                acao = 'EXCLUSAO';
            }
            const { modulo, entidade } = this.determinarModuloEEntidade(urlSemQuery);
            const idRegistro = this.extrairIdRegistro(req, responseData);
            const resumo = this.gerarResumo(acao, modulo, entidade, idRegistro, req === null || req === void 0 ? void 0 : req.body);
            const dadosNovos = this.sanitizar(req === null || req === void 0 ? void 0 : req.body);
            await this.logsService.registrarLog({
                idUsuario: (user === null || user === void 0 ? void 0 : user.idUsuario) || (user === null || user === void 0 ? void 0 : user.id) || null,
                nomeUsuario: (user === null || user === void 0 ? void 0 : user.nome) || (user === null || user === void 0 ? void 0 : user.primeiroNome) || (acao === 'LOGIN' ? ((_g = req === null || req === void 0 ? void 0 : req.body) === null || _g === void 0 ? void 0 : _g.username) || ((_h = req === null || req === void 0 ? void 0 : req.body) === null || _h === void 0 ? void 0 : _h.email) : 'Sistema'),
                emailUsuario: (user === null || user === void 0 ? void 0 : user.email) || (acao === 'LOGIN' ? ((_j = req === null || req === void 0 ? void 0 : req.body) === null || _j === void 0 ? void 0 : _j.username) || ((_k = req === null || req === void 0 ? void 0 : req.body) === null || _k === void 0 ? void 0 : _k.email) : null),
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
        }
        catch (err) {
            this.logger.warn(`Erro no interceptor de auditoria: ${err === null || err === void 0 ? void 0 : err.message}`);
        }
    }
    determinarModuloEEntidade(url) {
        const u = url.toLowerCase();
        if (u.includes('/login') || u.includes('/auth'))
            return { modulo: 'AUTENTICACAO', entidade: 'Usuario' };
        if (u.includes('/trabalho'))
            return { modulo: 'TRABALHO', entidade: 'Trabalho' };
        if (u.includes('/financeiro') || u.includes('/faturamento') || u.includes('/boleto') || u.includes('/transacao'))
            return { modulo: 'FINANCEIRO', entidade: 'Financeiro' };
        if (u.includes('/estoque') || u.includes('/almoxarifado') || u.includes('/transferencia'))
            return { modulo: 'ESTOQUE', entidade: 'Estoque' };
        if (u.includes('/usuario'))
            return { modulo: 'USUARIO', entidade: 'Usuario' };
        if (u.includes('/dentista'))
            return { modulo: 'CADASTROS', entidade: 'Dentista' };
        if (u.includes('/empresa'))
            return { modulo: 'CADASTROS', entidade: 'Empresa' };
        if (u.includes('/componente') || u.includes('/marca-componente'))
            return { modulo: 'CADASTROS', entidade: 'Componente' };
        if (u.includes('/cor'))
            return { modulo: 'CADASTROS', entidade: 'Cor' };
        if (u.includes('/motivo'))
            return { modulo: 'CADASTROS', entidade: 'Motivo' };
        if (u.includes('/produto'))
            return { modulo: 'CADASTROS', entidade: 'Produto' };
        if (u.includes('/localidade'))
            return { modulo: 'CADASTROS', entidade: 'Localidade' };
        return { modulo: 'GERAL', entidade: 'Sistema' };
    }
    extrairIdRegistro(req, responseData) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        if (((_a = req === null || req === void 0 ? void 0 : req.params) === null || _a === void 0 ? void 0 : _a.id) || ((_b = req === null || req === void 0 ? void 0 : req.params) === null || _b === void 0 ? void 0 : _b.idTrabalho) || ((_c = req === null || req === void 0 ? void 0 : req.params) === null || _c === void 0 ? void 0 : _c.idUsuario) || ((_d = req === null || req === void 0 ? void 0 : req.params) === null || _d === void 0 ? void 0 : _d.idComponente)) {
            return String(req.params.id || req.params.idTrabalho || req.params.idUsuario || req.params.idComponente);
        }
        const match = (_e = req === null || req === void 0 ? void 0 : req.url) === null || _e === void 0 ? void 0 : _e.match(/\/(\d+)(\/|$|\?)/);
        if (match)
            return match[1];
        if (((_f = req === null || req === void 0 ? void 0 : req.body) === null || _f === void 0 ? void 0 : _f.id) || ((_g = req === null || req === void 0 ? void 0 : req.body) === null || _g === void 0 ? void 0 : _g.idTrabalho) || ((_h = req === null || req === void 0 ? void 0 : req.body) === null || _h === void 0 ? void 0 : _h.idUsuario)) {
            return String(req.body.id || req.body.idTrabalho || req.body.idUsuario);
        }
        if ((responseData === null || responseData === void 0 ? void 0 : responseData.id) || (responseData === null || responseData === void 0 ? void 0 : responseData.idTrabalho) || (responseData === null || responseData === void 0 ? void 0 : responseData.idUsuario)) {
            return String(responseData.id || responseData.idTrabalho || responseData.idUsuario);
        }
        return null;
    }
    gerarResumo(acao, modulo, entidade, idRegistro, body) {
        const reg = idRegistro ? ` #${idRegistro}` : '';
        switch (acao) {
            case 'LOGIN':
                return `Login realizado no sistema por ${(body === null || body === void 0 ? void 0 : body.email) || 'usuário'}`.trim();
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
    sanitizar(obj) {
        if (!obj || typeof obj !== 'object')
            return obj;
        const clone = Object.assign({}, obj);
        const sensiveis = ['senha', 'password', 'token', 'secret', 'cartao', 'cvv'];
        for (const key of Object.keys(clone)) {
            if (sensiveis.some((s) => key.toLowerCase().includes(s))) {
                clone[key] = '***';
            }
        }
        return clone;
    }
    gerarCamposAlterados(dados) {
        if (!dados || typeof dados !== 'object')
            return [];
        return Object.keys(dados)
            .slice(0, 10)
            .map((k) => ({
            campo: k,
            label: k.charAt(0).toUpperCase() + k.slice(1),
            antes: null,
            depois: dados[k],
        }));
    }
};
exports.AuditInterceptor = AuditInterceptor;
exports.AuditInterceptor = AuditInterceptor = AuditInterceptor_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [logs_service_1.LogsService])
], AuditInterceptor);
//# sourceMappingURL=audit.interceptor.js.map
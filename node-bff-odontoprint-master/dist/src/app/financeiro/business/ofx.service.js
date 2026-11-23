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
Object.defineProperty(exports, "__esModule", { value: true });
exports.OfxService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const arquivo_ofx_entity_1 = require("../domain/arquivo-ofx.entity");
const transacao_ofx_entity_1 = require("../domain/transacao-ofx.entity");
const conta_entity_1 = require("../domain/conta.entity");
const lancamento_entity_1 = require("../domain/lancamento.entity");
const financeiro_service_1 = require("./financeiro.service");
const fornecedor_service_1 = require("./fornecedor.service");
const categoria_service_1 = require("./categoria.service");
const tipo_lancamento_enum_1 = require("../domain/tipo-lancamento.enum");
const parcela_entity_1 = require("../domain/parcela.entity");
const ofx_import_util_1 = require("../utils/ofx-import.util");
const ofxParse = require('ofx-js').parse;
let OfxService = class OfxService {
    constructor(arquivoOfxRepository, transacaoOfxRepository, contaRepository, lancamentoRepository, dataSource, financeiroService, fornecedorService, categoriaService) {
        this.arquivoOfxRepository = arquivoOfxRepository;
        this.transacaoOfxRepository = transacaoOfxRepository;
        this.contaRepository = contaRepository;
        this.lancamentoRepository = lancamentoRepository;
        this.dataSource = dataSource;
        this.financeiroService = financeiroService;
        this.fornecedorService = fornecedorService;
        this.categoriaService = categoriaService;
    }
    async importarArquivoOfx(file, idConta, idUsuario) {
        if (!file) {
            throw new common_1.BadRequestException('Arquivo não fornecido.');
        }
        if (!file.originalname.toLowerCase().endsWith('.ofx')) {
            throw new common_1.BadRequestException('Arquivo deve ser do tipo OFX (.ofx).');
        }
        const maxSize = 10 * 1024 * 1024;
        if (file.size > maxSize) {
            throw new common_1.BadRequestException('Arquivo muito grande. Tamanho máximo: 10MB.');
        }
        const conta = await this.contaRepository.findOneBy({ idConta });
        if (!conta) {
            throw new common_1.NotFoundException(`Conta com ID ${idConta} não encontrada.`);
        }
        return this.dataSource.transaction(async (manager) => {
            var _a, _b;
            const arquivoRepo = manager.getRepository(arquivo_ofx_entity_1.ArquivoOfx);
            const transacaoRepo = manager.getRepository(transacao_ofx_entity_1.TransacaoOfx);
            try {
                const parsed = await this.parseOfxJs(file.buffer.toString());
                const transactions = this.extrairTransacoesNormalizadas(parsed);
                const meta = this.extrairMetadadosExtrato(parsed);
                const dataInicio = meta.dtStart != null
                    ? this.parsearDataOfx(meta.dtStart)
                    : ((_a = transactions[0]) === null || _a === void 0 ? void 0 : _a.datePosted)
                        ? this.parsearDataOfx(transactions[0].datePosted)
                        : new Date();
                const dataFim = meta.dtEnd != null
                    ? this.parsearDataOfx(meta.dtEnd)
                    : ((_b = transactions[transactions.length - 1]) === null || _b === void 0 ? void 0 : _b.datePosted)
                        ? this.parsearDataOfx(transactions[transactions.length - 1].datePosted)
                        : dataInicio;
                const saldoFinal = meta.ledgerBal != null ? this.parsearDecimal(meta.ledgerBal) : 0;
                const arquivoOfx = arquivoRepo.create({
                    idConta,
                    nomeArquivo: file.originalname,
                    dataInicio,
                    dataFim,
                    saldoInicial: 0,
                    saldoFinal,
                    totalTransacoes: transactions.length,
                    idUsuarioImportacao: idUsuario,
                });
                const arquivoSalvo = await arquivoRepo.save(arquivoOfx);
                let transacoesSalvas = 0;
                let transacoesDuplicadas = 0;
                for (const transaction of transactions) {
                    const fitId = transaction.fitId;
                    if (!fitId) {
                        continue;
                    }
                    const existe = await transacaoRepo.findOne({
                        where: { fitId, idConta },
                    });
                    if (existe) {
                        transacoesDuplicadas++;
                        continue;
                    }
                    const valor = this.parsearDecimal(transaction.amount);
                    const tipo = valor >= 0 ? transacao_ofx_entity_1.TipoTransacaoOfx.CREDITO : transacao_ofx_entity_1.TipoTransacaoOfx.DEBITO;
                    const transacaoOfx = transacaoRepo.create({
                        idConta,
                        idArquivoOfx: arquivoSalvo.idArquivoOfx,
                        fitId: fitId.toString(),
                        tipo,
                        valor: Math.abs(valor),
                        dataTransacao: this.parsearDataOfx(transaction.datePosted),
                        dataPostagem: transaction.dateAvailable
                            ? this.parsearDataOfx(transaction.dateAvailable)
                            : undefined,
                        descricao: transaction.memo || transaction.name || '',
                        numeroCheque: transaction.checkNumber || undefined,
                        statusConciliacao: transacao_ofx_entity_1.StatusConciliacao.PENDENTE,
                    });
                    await transacaoRepo.save(transacaoOfx);
                    transacoesSalvas++;
                }
                arquivoSalvo.totalTransacoes = transacoesSalvas;
                await arquivoRepo.save(arquivoSalvo);
                if (transacoesDuplicadas > 0) {
                    console.warn(`${transacoesDuplicadas} transações duplicadas foram ignoradas.`);
                }
                return arquivoSalvo;
            }
            catch (error) {
                if (error instanceof common_1.BadRequestException || error instanceof common_1.NotFoundException) {
                    throw error;
                }
                throw new common_1.BadRequestException(`Erro ao processar arquivo OFX: ${error.message}`);
            }
        });
    }
    async importarOfxContasPagar(file, idCategoria, idContaOpcional) {
        if (!file) {
            throw new common_1.BadRequestException('Arquivo não fornecido.');
        }
        if (!file.originalname.toLowerCase().endsWith('.ofx')) {
            throw new common_1.BadRequestException('Arquivo deve ser do tipo OFX (.ofx).');
        }
        const maxSize = 10 * 1024 * 1024;
        if (file.size > maxSize) {
            throw new common_1.BadRequestException('Arquivo muito grande. Tamanho máximo: 10MB.');
        }
        const categoria = await this.categoriaService.findOne(idCategoria);
        if (categoria.tipo !== tipo_lancamento_enum_1.TipoLancamento.DESPESA) {
            throw new common_1.BadRequestException('A categoria deve ser do tipo DESPESA (contas a pagar).');
        }
        if (idContaOpcional == null) {
            throw new common_1.BadRequestException('Informe a conta bancária: o extrato OFX já reflete pagamentos efetuados; é necessária a conta para lançar cada despesa como paga e movimentar o saldo.');
        }
        const contaPg = await this.contaRepository.findOneBy({ idConta: idContaOpcional });
        if (!contaPg) {
            throw new common_1.NotFoundException(`Conta com ID ${idContaOpcional} não encontrada.`);
        }
        const resultado = {
            inseridos: 0,
            ignoradosDuplicados: 0,
            ignoradosSemFitId: 0,
            ignoradosValorNaoNegativo: 0,
            semFornecedorAutomatico: 0,
            classificadosPelaCategoriaDoFornecedor: 0,
        };
        let parsed;
        try {
            parsed = await this.parseOfxJs(file.buffer.toString());
        }
        catch (e) {
            throw new common_1.BadRequestException(`Erro ao ler OFX: ${e.message}`);
        }
        const transactions = this.extrairTransacoesNormalizadas(parsed);
        for (const t of transactions) {
            const fitId = t.fitId ? String(t.fitId).trim() : '';
            if (!fitId) {
                resultado.ignoradosSemFitId++;
                continue;
            }
            const valor = this.parsearDecimal(t.amount);
            if (valor >= 0) {
                resultado.ignoradosValorNaoNegativo++;
                continue;
            }
            const numeroDocumento = `OFX:${idContaOpcional}:${fitId}`;
            const existente = await this.lancamentoRepository.findOne({
                where: { numeroDocumento },
            });
            if (existente) {
                resultado.ignoradosDuplicados++;
                continue;
            }
            const nameStr = (t.name || '').trim();
            const memoStr = (t.memo || '').trim();
            const textoNome = nameStr || memoStr;
            const extraido = textoNome ? (0, ofx_import_util_1.extrairCpfOuCnpjDoTexto)(textoNome) : null;
            let idFornecedor;
            let idCategoriaLancamento = idCategoria;
            if (extraido) {
                let f = await this.fornecedorService.buscarPorDocumentoNormalizado(extraido.digitos);
                if (!f) {
                    f = await this.fornecedorService.criarFornecedorImportacaoOfx(extraido.tipo, extraido.digitos);
                }
                idFornecedor = f.idFornecedor;
                if (f.idCategoria != null) {
                    idCategoriaLancamento = f.idCategoria;
                    resultado.classificadosPelaCategoriaDoFornecedor++;
                }
            }
            else {
                resultado.semFornecedorAutomatico++;
            }
            const catParaLancamento = await this.categoriaService.findOne(idCategoriaLancamento);
            if (catParaLancamento.tipo !== tipo_lancamento_enum_1.TipoLancamento.DESPESA) {
                throw new common_1.BadRequestException(`A categoria (ID ${idCategoriaLancamento}) deve ser do tipo DESPESA (contas a pagar).`);
            }
            const nomeResp = ((extraido === null || extraido === void 0 ? void 0 : extraido.restoNome) && extraido.restoNome.trim()) ||
                nameStr ||
                memoStr ||
                'Sem identificação';
            const descricao = `Despesa OFX — ${nomeResp}`.slice(0, 255);
            const dataStr = t.datePosted || '';
            const dataIso = this.formatarDataYmd(this.parsearDataOfx(dataStr));
            const valorAbs = Math.abs(valor);
            await this.financeiroService.criarLancamento({
                descricao,
                tipo: tipo_lancamento_enum_1.TipoLancamento.DESPESA,
                valorTotal: valorAbs,
                dataCompetencia: dataIso,
                dataEmissao: dataIso,
                numeroDocumento,
                idCategoria: idCategoriaLancamento,
                idFornecedor,
                parcelas: [
                    {
                        numeroParcela: 1,
                        valor: valorAbs,
                        dataVencimento: dataIso,
                        meioPagamento: parcela_entity_1.MeioPagamento.TRANSFERENCIA,
                        gerarJuros: false,
                    },
                ],
                pagamentoImediato: {
                    idConta: idContaOpcional,
                    dataPagamento: dataIso,
                },
            });
            resultado.inseridos++;
        }
        return resultado;
    }
    async parseOfxJs(content) {
        return ofxParse(content);
    }
    extrairTransacoesNormalizadas(parsed) {
        const brutos = [];
        this.coletarStmtTrn(parsed === null || parsed === void 0 ? void 0 : parsed.OFX, brutos);
        return brutos.map((t) => ({
            fitId: t.FITID != null ? String(t.FITID).trim() : '',
            amount: t.TRNAMT,
            datePosted: t.DTPOSTED != null ? String(t.DTPOSTED) : '',
            dateAvailable: t.DTAVAIL != null ? String(t.DTAVAIL) : undefined,
            name: t.NAME != null ? String(t.NAME) : '',
            memo: t.MEMO != null ? String(t.MEMO) : '',
            checkNumber: t.CHECKNUM != null ? String(t.CHECKNUM) : undefined,
        }));
    }
    coletarStmtTrn(node, acc) {
        if (node == null)
            return;
        if (Array.isArray(node)) {
            node.forEach((n) => this.coletarStmtTrn(n, acc));
            return;
        }
        if (typeof node === 'object') {
            if (node.STMTTRN !== undefined) {
                const t = node.STMTTRN;
                if (Array.isArray(t))
                    acc.push(...t);
                else
                    acc.push(t);
            }
            for (const k of Object.keys(node)) {
                if (k === 'STMTTRN')
                    continue;
                this.coletarStmtTrn(node[k], acc);
            }
        }
    }
    extrairMetadadosExtrato(parsed) {
        const bankList = this.encontrarPrimeiroComChave(parsed === null || parsed === void 0 ? void 0 : parsed.OFX, 'BANKTRANLIST');
        const ledger = this.encontrarPrimeiroComChave(parsed === null || parsed === void 0 ? void 0 : parsed.OFX, 'LEDGERBAL');
        return {
            dtStart: (bankList === null || bankList === void 0 ? void 0 : bankList.DTSTART) != null ? String(bankList.DTSTART) : undefined,
            dtEnd: (bankList === null || bankList === void 0 ? void 0 : bankList.DTEND) != null ? String(bankList.DTEND) : undefined,
            ledgerBal: (ledger === null || ledger === void 0 ? void 0 : ledger.BALAMT) != null ? String(ledger.BALAMT) : undefined,
        };
    }
    encontrarPrimeiroComChave(node, key) {
        if (node == null)
            return null;
        if (Array.isArray(node)) {
            for (const n of node) {
                const f = this.encontrarPrimeiroComChave(n, key);
                if (f)
                    return f;
            }
            return null;
        }
        if (typeof node === 'object') {
            if (node[key] !== undefined && node[key] !== null && typeof node[key] === 'object') {
                return node[key];
            }
            for (const v of Object.values(node)) {
                const f = this.encontrarPrimeiroComChave(v, key);
                if (f)
                    return f;
            }
        }
        return null;
    }
    formatarDataYmd(d) {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
    }
    async listarArquivos(idConta) {
        const queryBuilder = this.arquivoOfxRepository
            .createQueryBuilder('arquivo')
            .leftJoinAndSelect('arquivo.conta', 'conta')
            .orderBy('arquivo.dataImportacao', 'DESC');
        if (idConta) {
            queryBuilder.where('arquivo.idConta = :idConta', { idConta });
        }
        return queryBuilder.getMany();
    }
    async buscarArquivoPorId(id) {
        const arquivo = await this.arquivoOfxRepository.findOne({
            where: { idArquivoOfx: id },
            relations: ['conta', 'transacoes'],
        });
        if (!arquivo) {
            throw new common_1.NotFoundException(`Arquivo OFX com ID ${id} não encontrado.`);
        }
        return arquivo;
    }
    async excluirArquivo(id) {
        const arquivo = await this.buscarArquivoPorId(id);
        const transacoesComConciliacao = await this.transacaoOfxRepository
            .createQueryBuilder('transacao')
            .leftJoin('transacao.conciliacao', 'conciliacao')
            .where('transacao.idArquivoOfx = :idArquivo', { idArquivo: id })
            .andWhere('conciliacao.idConciliacao IS NOT NULL')
            .getCount();
        if (transacoesComConciliacao > 0) {
            throw new common_1.BadRequestException(`Não é possível excluir o arquivo. Existem ${transacoesComConciliacao} transações conciliadas vinculadas a este arquivo.`);
        }
        await this.dataSource.transaction(async (manager) => {
            const transacaoRepo = manager.getRepository(transacao_ofx_entity_1.TransacaoOfx);
            const arquivoRepo = manager.getRepository(arquivo_ofx_entity_1.ArquivoOfx);
            await transacaoRepo.delete({ idArquivoOfx: id });
            await arquivoRepo.delete({ idArquivoOfx: id });
        });
    }
    parsearDataOfx(dataOfx) {
        if (dataOfx instanceof Date) {
            return dataOfx;
        }
        const str = dataOfx.toString().trim();
        if (str.length === 8) {
            const year = parseInt(str.substring(0, 4), 10);
            const month = parseInt(str.substring(4, 6), 10) - 1;
            const day = parseInt(str.substring(6, 8), 10);
            return new Date(year, month, day);
        }
        else if (str.length >= 14) {
            const year = parseInt(str.substring(0, 4), 10);
            const month = parseInt(str.substring(4, 6), 10) - 1;
            const day = parseInt(str.substring(6, 8), 10);
            const hour = parseInt(str.substring(8, 10), 10) || 0;
            const minute = parseInt(str.substring(10, 12), 10) || 0;
            const second = parseInt(str.substring(12, 14), 10) || 0;
            return new Date(year, month, day, hour, minute, second);
        }
        const parsed = new Date(str);
        if (!isNaN(parsed.getTime())) {
            return parsed;
        }
        throw new common_1.BadRequestException(`Formato de data inválido: ${str}`);
    }
    parsearDecimal(valor) {
        if (typeof valor === 'number') {
            return valor;
        }
        const str = valor.toString().trim();
        const cleaned = str.replace(/[^\d.,-]/g, '');
        const normalized = cleaned.replace(',', '.');
        const parsed = parseFloat(normalized);
        if (isNaN(parsed)) {
            return 0;
        }
        return parsed;
    }
};
exports.OfxService = OfxService;
exports.OfxService = OfxService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(arquivo_ofx_entity_1.ArquivoOfx)),
    __param(1, (0, typeorm_1.InjectRepository)(transacao_ofx_entity_1.TransacaoOfx)),
    __param(2, (0, typeorm_1.InjectRepository)(conta_entity_1.Conta)),
    __param(3, (0, typeorm_1.InjectRepository)(lancamento_entity_1.Lancamento)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource,
        financeiro_service_1.FinanceiroService,
        fornecedor_service_1.FornecedorService,
        categoria_service_1.CategoriaService])
], OfxService);
//# sourceMappingURL=ofx.service.js.map
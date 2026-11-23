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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FinanceiroService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const conta_entity_1 = require("../domain/conta.entity");
const lancamento_entity_1 = require("../domain/lancamento.entity");
const movimentacao_entity_1 = require("../domain/movimentacao.entity");
const parcela_entity_1 = require("../domain/parcela.entity");
const crypto_1 = require("crypto");
const ordemServico_service_1 = require("../../ordemServico/business/ordemServico.service");
const tipo_lancamento_enum_1 = require("../domain/tipo-lancamento.enum");
const categoria_service_1 = require("./categoria.service");
const fatura_entity_1 = require("../domain/fatura.entity");
const csv_lancamentos_historico_util_1 = require("../utils/csv-lancamentos-historico.util");
const classificacao_dre_enum_1 = require("../domain/classificacao-dre.enum");
const classificacao_despesa_enum_1 = require("../domain/classificacao-despesa.enum");
const aporte_entity_1 = require("../domain/aporte.entity");
const emprestimo_entity_1 = require("../domain/emprestimo.entity");
const emprestimo_movimentacao_entity_1 = require("../domain/emprestimo-movimentacao.entity");
const fornecedor_entity_1 = require("../domain/fornecedor.entity");
const classificacao_lancamento_service_1 = require("./classificacao-lancamento.service");
const data_financeiro_util_1 = require("../utils/data-financeiro.util");
function parseDataPagamentoParaDataLocal(dataPagamento) {
    return (0, data_financeiro_util_1.parseDataParaDataLocal)(dataPagamento);
}
function formatDataLocalYYYYMMDD(d) {
    return (0, data_financeiro_util_1.formatDataYYYYMMDD)(d);
}
let FinanceiroService = class FinanceiroService {
    constructor(contaRepository, lancamentoRepository, parcelaRepository, movimentacaoRepository, faturaRepository, aporteRepository, emprestimoRepository, fornecedorRepository, dataSource, ordemServicoService, categoriaService, classificacaoService) {
        this.contaRepository = contaRepository;
        this.lancamentoRepository = lancamentoRepository;
        this.parcelaRepository = parcelaRepository;
        this.movimentacaoRepository = movimentacaoRepository;
        this.faturaRepository = faturaRepository;
        this.aporteRepository = aporteRepository;
        this.emprestimoRepository = emprestimoRepository;
        this.fornecedorRepository = fornecedorRepository;
        this.dataSource = dataSource;
        this.ordemServicoService = ordemServicoService;
        this.categoriaService = categoriaService;
        this.classificacaoService = classificacaoService;
    }
    async criarConta(dto) {
        const conta = this.contaRepository.create(Object.assign(Object.assign({}, dto), { saldoAtual: dto.saldoInicial }));
        return this.contaRepository.save(conta);
    }
    async listarContas() {
        return this.contaRepository.find();
    }
    async buscarContaPorId(idConta) {
        var _a;
        const conta = await this.contaRepository.findOne({
            where: { idConta },
            relations: ['movimentacoes'],
        });
        if (!conta) {
            throw new common_1.NotFoundException(`Conta com ID ${idConta} não encontrada.`);
        }
        if ((_a = conta.movimentacoes) === null || _a === void 0 ? void 0 : _a.length) {
            conta.movimentacoes.sort((a, b) => new Date(b.dataMovimentacao).getTime() - new Date(a.dataMovimentacao).getTime());
        }
        return conta;
    }
    async criarLancamento(dto) {
        const valorParcelas = dto.parcelas.reduce((acc, p) => acc + p.valor, 0);
        if (Math.abs(valorParcelas - dto.valorTotal) > 0.01) {
            throw new common_1.BadRequestException('A soma das parcelas não corresponde ao valor total do lançamento.');
        }
        if (dto.idOrdemServico) {
            const ordemServico = await this.ordemServicoService.buscarPorId(dto.idOrdemServico);
            if (!ordemServico) {
                throw new common_1.NotFoundException(`Ordem de Serviço com ID ${dto.idOrdemServico} não encontrada.`);
            }
        }
        if (dto.idEmprestimo != null) {
            if (dto.tipo !== tipo_lancamento_enum_1.TipoLancamento.DESPESA) {
                throw new common_1.BadRequestException('O vínculo com empréstimo só é permitido em despesas.');
            }
            if (!dto.idCategoria) {
                throw new common_1.BadRequestException('Selecione a categoria para pagamento vinculado ao empréstimo.');
            }
            const cat = await this.categoriaService.findOne(dto.idCategoria);
            if (cat.classificacaoDre !== classificacao_dre_enum_1.ClassificacaoDre.SAIDA_FINANCIAMENTO) {
                throw new common_1.BadRequestException('Para vincular um empréstimo, a categoria deve ter classificação DRE "Saídas de financiamento/juros/empréstimos".');
            }
            await this.validarEmprestimoParaPagamento(dto.idEmprestimo, dto.valorTotal);
        }
        if (dto.idEmprestimo != null) {
            return this.dataSource.transaction(async (manager) => {
                const lancamentoRepo = manager.getRepository(lancamento_entity_1.Lancamento);
                const lancamento = this.montarEntidadeLancamentoParaPersistencia(dto, lancamentoRepo);
                const lancamentoSalvo = await lancamentoRepo.save(lancamento);
                if (dto.pagamentoImediato) {
                    for (const parcela of lancamentoSalvo.parcelas) {
                        await this.executarPagamentoParcela(manager, parcela.idParcela, {
                            idConta: dto.pagamentoImediato.idConta,
                            dataPagamento: dto.pagamentoImediato.dataPagamento,
                            valor: Number(parcela.valor),
                        });
                    }
                }
                await this.registrarPagamentoEmprestimoComManager(manager, dto.idEmprestimo, lancamentoSalvo.idLancamento, dto.valorTotal, dto.dataCompetencia);
                return lancamentoRepo.findOne({
                    where: { idLancamento: lancamentoSalvo.idLancamento },
                    relations: ['parcelas'],
                });
            });
        }
        let dtoLancamento = dto;
        if (dtoLancamento.tipo === tipo_lancamento_enum_1.TipoLancamento.DESPESA && dtoLancamento.idFornecedor) {
            const fornecedor = await this.fornecedorRepository.findOne({
                where: { idFornecedor: dtoLancamento.idFornecedor },
                select: ['idFornecedor', 'idCategoria'],
            });
            if ((fornecedor === null || fornecedor === void 0 ? void 0 : fornecedor.idCategoria) != null) {
                dtoLancamento = Object.assign(Object.assign({}, dtoLancamento), { idCategoria: fornecedor.idCategoria });
            }
        }
        const lancamento = this.montarEntidadeLancamentoParaPersistencia(dtoLancamento, this.lancamentoRepository);
        const lancamentoSalvo = await this.lancamentoRepository.save(lancamento);
        if (dtoLancamento.pagamentoImediato) {
            for (const parcela of lancamentoSalvo.parcelas) {
                await this.pagarParcela(parcela.idParcela, {
                    idConta: dtoLancamento.pagamentoImediato.idConta,
                    dataPagamento: dtoLancamento.pagamentoImediato.dataPagamento,
                    valor: Number(parcela.valor),
                });
            }
        }
        return this.lancamentoRepository.findOne({
            where: { idLancamento: lancamentoSalvo.idLancamento },
            relations: ['parcelas'],
        });
    }
    montarEntidadeLancamentoParaPersistencia(dto, repo) {
        var _a;
        const { idEmprestimo: _idEmp } = dto, campos = __rest(dto, ["idEmprestimo"]);
        const totalParcelas = dto.parcelas.length;
        return repo.create(Object.assign(Object.assign({}, campos), { totalParcelas, dataCompetencia: parseDataPagamentoParaDataLocal(dto.dataCompetencia), dataEmissao: dto.dataEmissao ? parseDataPagamentoParaDataLocal(dto.dataEmissao) : new Date(), idFornecedor: (_a = dto.idFornecedor) !== null && _a !== void 0 ? _a : undefined, parcelas: dto.parcelas.map((p, idx) => (Object.assign(Object.assign({}, p), { dataVencimento: parseDataPagamentoParaDataLocal(p.dataVencimento) }))), descricao: dto.descricao }));
    }
    async validarEmprestimoParaPagamento(idEmprestimo, valorPagamento) {
        var _a;
        const emp = await this.emprestimoRepository.findOne({ where: { idEmprestimo } });
        if (!emp) {
            throw new common_1.NotFoundException(`Empréstimo com ID ${idEmprestimo} não encontrado.`);
        }
        if (emp.tipo !== emprestimo_entity_1.TipoEmprestimo.RECEBIDO) {
            throw new common_1.BadRequestException('Somente empréstimos recebidos podem ser abatidos por esta despesa.');
        }
        if (emp.status === emprestimo_entity_1.StatusEmprestimo.CANCELADO) {
            throw new common_1.BadRequestException('Este empréstimo está cancelado.');
        }
        if (emp.status !== emprestimo_entity_1.StatusEmprestimo.ATIVO) {
            throw new common_1.BadRequestException('Só é possível pagar empréstimos com status ATIVO.');
        }
        const saldo = Number((_a = emp.saldoRestante) !== null && _a !== void 0 ? _a : emp.valorPrincipal);
        if (valorPagamento > saldo + 0.01) {
            throw new common_1.BadRequestException(`O valor do lançamento (R$ ${valorPagamento.toFixed(2)}) não pode ser maior que o saldo devedor (R$ ${saldo.toFixed(2)}).`);
        }
    }
    async registrarPagamentoEmprestimoComManager(manager, idEmprestimo, idLancamento, valorTotal, dataCompetenciaIso) {
        var _a;
        const empRepo = manager.getRepository(emprestimo_entity_1.Emprestimo);
        const movRepo = manager.getRepository(emprestimo_movimentacao_entity_1.EmprestimoMovimentacao);
        const emprestimo = await empRepo.findOne({ where: { idEmprestimo } });
        if (!emprestimo) {
            throw new common_1.NotFoundException(`Empréstimo com ID ${idEmprestimo} não encontrado.`);
        }
        const saldo = Number((_a = emprestimo.saldoRestante) !== null && _a !== void 0 ? _a : emprestimo.valorPrincipal);
        const novoSaldo = Math.max(0, saldo - valorTotal);
        emprestimo.saldoRestante = novoSaldo;
        if (novoSaldo < 0.01) {
            emprestimo.status = emprestimo_entity_1.StatusEmprestimo.QUITADO;
        }
        await empRepo.save(emprestimo);
        const mov = movRepo.create({
            idEmprestimo,
            idLancamento,
            valor: valorTotal,
            dataMovimentacao: parseDataPagamentoParaDataLocal(dataCompetenciaIso),
        });
        await movRepo.save(mov);
    }
    async importarLancamentosCsvHistorico(buffer, idCategoriaReceita, idCategoriaDespesa, idConta) {
        const texto = buffer.toString('utf-8');
        const { linhas, errosParse } = (0, csv_lancamentos_historico_util_1.parseCsvLancamentosHistorico)(texto);
        const precisaReceita = linhas.some((l) => l.tipo === tipo_lancamento_enum_1.TipoLancamento.RECEITA);
        const precisaDespesa = linhas.some((l) => l.tipo === tipo_lancamento_enum_1.TipoLancamento.DESPESA);
        if (precisaReceita && (idCategoriaReceita == null || Number.isNaN(idCategoriaReceita))) {
            throw new common_1.BadRequestException('Selecione a categoria de RECEITA (há linhas de crédito no arquivo).');
        }
        if (precisaDespesa && (idCategoriaDespesa == null || Number.isNaN(idCategoriaDespesa))) {
            throw new common_1.BadRequestException('Selecione a categoria de DESPESA (há linhas de débito no arquivo).');
        }
        if (idCategoriaReceita != null) {
            const c = await this.categoriaService.findOne(idCategoriaReceita);
            if (c.tipo !== tipo_lancamento_enum_1.TipoLancamento.RECEITA) {
                throw new common_1.BadRequestException('A categoria de receita deve ser do tipo RECEITA.');
            }
        }
        if (idCategoriaDespesa != null) {
            const c = await this.categoriaService.findOne(idCategoriaDespesa);
            if (c.tipo !== tipo_lancamento_enum_1.TipoLancamento.DESPESA) {
                throw new common_1.BadRequestException('A categoria de despesa deve ser do tipo DESPESA.');
            }
        }
        if (idConta == null || Number.isNaN(idConta)) {
            throw new common_1.BadRequestException('Informe a conta para registrar o histórico como já pago (movimentação na conta).');
        }
        const contaExiste = await this.contaRepository.findOne({ where: { idConta } });
        if (!contaExiste) {
            throw new common_1.NotFoundException(`Conta com ID ${idConta} não encontrada.`);
        }
        const erros = [...errosParse];
        let inseridos = 0;
        let inseridosCredito = 0;
        let inseridosDebito = 0;
        for (const linha of linhas) {
            const idCategoria = linha.tipo === tipo_lancamento_enum_1.TipoLancamento.RECEITA ? idCategoriaReceita : idCategoriaDespesa;
            try {
                await this.criarLancamento({
                    descricao: linha.descricao.trim(),
                    tipo: linha.tipo,
                    valorTotal: linha.valor,
                    dataCompetencia: linha.dataIso,
                    dataEmissao: linha.dataIso,
                    idCategoria,
                    parcelas: [
                        {
                            numeroParcela: 1,
                            valor: linha.valor,
                            dataVencimento: linha.dataIso,
                            meioPagamento: parcela_entity_1.MeioPagamento.TRANSFERENCIA,
                            gerarJuros: true,
                        },
                    ],
                    pagamentoImediato: {
                        idConta,
                        dataPagamento: linha.dataIso,
                    },
                });
                if (linha.tipo === tipo_lancamento_enum_1.TipoLancamento.DESPESA) {
                    const lancamentoCriado = await this.lancamentoRepository.findOne({
                        where: {
                            descricao: linha.descricao.trim(),
                            tipo: tipo_lancamento_enum_1.TipoLancamento.DESPESA,
                        },
                        order: { idLancamento: 'DESC' },
                    });
                    if (lancamentoCriado) {
                        const classificacao = await this.classificacaoService.classificarLancamento(lancamentoCriado);
                        if (classificacao) {
                            const updateData = {};
                            if (classificacao.idCategoria && classificacao.idCategoria !== idCategoria) {
                                updateData.idCategoria = classificacao.idCategoria;
                            }
                            if (classificacao.idFornecedor && classificacao.idFornecedor !== lancamentoCriado.idFornecedor) {
                                updateData.idFornecedor = classificacao.idFornecedor;
                            }
                            if (Object.keys(updateData).length > 0) {
                                await this.lancamentoRepository.update(lancamentoCriado.idLancamento, updateData);
                            }
                        }
                    }
                }
                inseridos++;
                if (linha.tipo === tipo_lancamento_enum_1.TipoLancamento.RECEITA)
                    inseridosCredito++;
                else
                    inseridosDebito++;
            }
            catch (e) {
                erros.push({
                    linha: linha.linhaNumero,
                    mensagem: (e === null || e === void 0 ? void 0 : e.message) || String(e),
                });
            }
        }
        return { inseridos, inseridosCredito, inseridosDebito, erros };
    }
    async listarLancamentos(params) {
        var _a, _b;
        if (params.idConta != null) {
            const qb = this.lancamentoRepository
                .createQueryBuilder('lancamento')
                .leftJoinAndSelect('lancamento.parcelas', 'parcela')
                .leftJoinAndSelect('parcela.movimentacao', 'movimentacao')
                .leftJoinAndSelect('lancamento.categoria', 'categoria')
                .leftJoinAndSelect('categoria.categoriaPai', 'categoriaPai')
                .leftJoinAndSelect('lancamento.fornecedor', 'fornecedor')
                .leftJoinAndSelect('lancamento.clienteEmpresa', 'clienteEmpresa')
                .where('movimentacao.idConta = :idConta', { idConta: params.idConta });
            if (params.tipo) {
                qb.andWhere('lancamento.tipo = :tipo', { tipo: params.tipo });
            }
            if (params.idCategoria != null) {
                qb.andWhere('lancamento.idCategoria = :idCategoria', { idCategoria: params.idCategoria });
            }
            if (params.idCategoriaPai != null && params.idCategoria == null) {
                qb.andWhere('(lancamento.idCategoria = :idCategoriaPai OR categoriaPai.idCategoria = :idCategoriaPai)', { idCategoriaPai: params.idCategoriaPai });
            }
            if (params.mes != null && params.ano != null) {
                if (params.filtroData === 'competencia') {
                    qb.andWhere('EXTRACT(YEAR FROM lancamento.dataCompetencia) = :ano', { ano: params.ano });
                    qb.andWhere('EXTRACT(MONTH FROM lancamento.dataCompetencia) = :mes', { mes: params.mes });
                }
                else {
                    qb.andWhere('EXTRACT(YEAR FROM parcela.dataVencimento) = :ano', { ano: params.ano });
                    qb.andWhere('EXTRACT(MONTH FROM parcela.dataVencimento) = :mes', { mes: params.mes });
                }
            }
            if (params.statusParcela != null) {
                qb.andWhere('parcela.status = :statusParcela', { statusParcela: params.statusParcela });
            }
            qb.orderBy('lancamento.dataCompetencia', 'DESC')
                .addOrderBy('lancamento.idLancamento', 'DESC');
            const lancamentos = await qb.getMany();
            for (const l of lancamentos) {
                l.parcelas = (l.parcelas || []).filter((p) => {
                    const mov = p.movimentacao;
                    if (!mov || mov.idConta !== params.idConta)
                        return false;
                    if (params.mes != null && params.ano != null) {
                        const filtroAno = Number(params.ano);
                        const filtroMes = Number(params.mes);
                        if (params.filtroData === 'competencia') {
                            const comp = (0, data_financeiro_util_1.extrairAnoMesDia)(l.dataCompetencia);
                            if (!comp || comp.ano !== filtroAno || comp.mes !== filtroMes)
                                return false;
                        }
                        else {
                            const venc = (0, data_financeiro_util_1.extrairAnoMesDia)(p.dataVencimento);
                            if (!venc || venc.ano !== filtroAno || venc.mes !== filtroMes)
                                return false;
                        }
                    }
                    if (params.statusParcela != null && p.status !== params.statusParcela)
                        return false;
                    return true;
                });
            }
            return lancamentos.filter((l) => (l.parcelas || []).length > 0);
        }
        const options = {
            relations: {
                parcelas: {
                    movimentacao: true,
                },
                categoria: {
                    categoriaPai: true,
                },
                fornecedor: true,
                clienteEmpresa: true,
            },
            order: {
                dataCompetencia: 'DESC',
                idLancamento: 'DESC',
            },
        };
        const where = {};
        if (params.tipo) {
            where.tipo = params.tipo;
        }
        if (params.idCategoria != null) {
            where.idCategoria = params.idCategoria;
        }
        if (params.mes && params.ano) {
            if (params.filtroData === 'competencia') {
                where.dataCompetencia = (0, typeorm_2.Raw)(alias => `EXTRACT(YEAR FROM ${alias}) = :ano AND EXTRACT(MONTH FROM ${alias}) = :mes`, {
                    ano: params.ano,
                    mes: params.mes,
                });
            }
            else {
                where.parcelas = {
                    dataVencimento: (0, typeorm_2.Raw)(alias => `EXTRACT(YEAR FROM ${alias}) = :ano AND EXTRACT(MONTH FROM ${alias}) = :mes`, {
                        ano: params.ano,
                        mes: params.mes,
                    }),
                };
            }
        }
        options.where = where;
        const lancamentos = await this.lancamentoRepository.find(options);
        const out = [];
        for (const l of lancamentos) {
            if (params.idCategoriaPai != null && params.idCategoria == null) {
                const idCat = ((_a = l.categoria) === null || _a === void 0 ? void 0 : _a.idCategoria) ? Number(l.categoria.idCategoria) : null;
                const idPai = ((_b = l.categoria) === null || _b === void 0 ? void 0 : _b.idCategoriaPai) ? Number(l.categoria.idCategoriaPai) : null;
                const filtroPai = Number(params.idCategoriaPai);
                if (idCat !== filtroPai && idPai !== filtroPai)
                    continue;
            }
            let parcelas = l.parcelas || [];
            if (params.mes != null && params.ano != null) {
                const filtroAno = Number(params.ano);
                const filtroMes = Number(params.mes);
                if (params.filtroData === 'competencia') {
                    const comp = (0, data_financeiro_util_1.extrairAnoMesDia)(l.dataCompetencia);
                    if (!comp || comp.ano !== filtroAno || comp.mes !== filtroMes) {
                        continue;
                    }
                }
                else {
                    parcelas = parcelas.filter((p) => {
                        const venc = (0, data_financeiro_util_1.extrairAnoMesDia)(p.dataVencimento);
                        return venc != null && venc.ano === filtroAno && venc.mes === filtroMes;
                    });
                }
            }
            if (params.statusParcela != null) {
                parcelas = parcelas.filter((p) => p.status === params.statusParcela);
            }
            if (parcelas.length === 0)
                continue;
            l.parcelas = parcelas;
            out.push(l);
        }
        return out;
    }
    async listarLancamentosComTotais(params) {
        var _a;
        const dados = await this.listarLancamentos(params);
        let total = 0;
        for (const l of dados) {
            for (const p of l.parcelas || []) {
                total += Number((_a = p.valor) !== null && _a !== void 0 ? _a : 0);
            }
        }
        return {
            dados,
            totais: {
                valor: total,
            },
        };
    }
    async buscarLancamentoPorId(idLancamento) {
        const lancamento = await this.lancamentoRepository.findOne({
            where: { idLancamento },
            relations: ['parcelas', 'parcelas.movimentacao', 'categoria', 'fornecedor', 'clienteEmpresa'],
        });
        if (!lancamento) {
            throw new common_1.NotFoundException(`Lançamento com ID ${idLancamento} não encontrado.`);
        }
        const movRepo = this.dataSource.getRepository(movimentacao_entity_1.Movimentacao);
        let idsParcelasRelevantes = [];
        if (lancamento.idFatura) {
            const lancamentosDaFatura = await this.lancamentoRepository.find({
                where: { idFatura: lancamento.idFatura },
                relations: ['parcelas'],
            });
            for (const l of lancamentosDaFatura) {
                idsParcelasRelevantes.push(...(l.parcelas || []).map((p) => p.idParcela));
            }
        }
        const lancamentoPlain = JSON.parse(JSON.stringify(lancamento));
        for (const parcela of lancamentoPlain.parcelas) {
            const idsBusca = idsParcelasRelevantes.length > 0
                ? Array.from(new Set([...idsParcelasRelevantes, parcela.idParcela]))
                : [parcela.idParcela];
            const pagamentos = await movRepo.find({
                where: { idParcelaOrigem: (0, typeorm_2.In)(idsBusca) },
                order: { dataMovimentacao: 'ASC' }
            });
            parcela.pagamentos = pagamentos;
        }
        return lancamentoPlain;
    }
    async atualizarLancamento(idLancamento, dto) {
        return this.dataSource.transaction(async (manager) => {
            const lancamentoRepo = manager.getRepository(lancamento_entity_1.Lancamento);
            const lancamento = await lancamentoRepo.findOne({
                where: { idLancamento },
                relations: ['parcelas'],
            });
            if (!lancamento) {
                throw new common_1.NotFoundException(`Lançamento com ID ${idLancamento} não encontrado.`);
            }
            const patch = {};
            if (dto.idCategoria !== undefined) {
                patch.idCategoria = dto.idCategoria;
            }
            if (lancamento.tipo === tipo_lancamento_enum_1.TipoLancamento.DESPESA) {
                if (dto.idFornecedor !== undefined) {
                    patch.idFornecedor = dto.idFornecedor;
                }
            }
            else if (lancamento.tipo === tipo_lancamento_enum_1.TipoLancamento.RECEITA) {
                if (dto.idClienteFornecedor !== undefined) {
                    patch.idClienteFornecedor = dto.idClienteFornecedor;
                }
            }
            if (Object.keys(patch).length > 0) {
                await lancamentoRepo.update({ idLancamento }, patch);
            }
            return lancamentoRepo.findOne({
                where: { idLancamento },
                relations: ['parcelas', 'categoria'],
            });
        });
    }
    async faturarOrdemServico(dto) {
        if (dto.tipo !== tipo_lancamento_enum_1.TipoLancamento.RECEITA) {
            throw new common_1.BadRequestException('Faturamento de Ordem de Serviço deve ser do tipo RECEITA.');
        }
        if (!dto.idOrdemServico) {
            throw new common_1.BadRequestException('idOrdemServico é obrigatório para faturar uma Ordem de Serviço.');
        }
        const lancamentoExistente = await this.lancamentoRepository.findOneBy({ idOrdemServico: dto.idOrdemServico });
        if (lancamentoExistente) {
            throw new common_1.BadRequestException('Esta Ordem de Serviço já possui um lançamento financeiro.');
        }
        return this.criarLancamento(dto);
    }
    async cancelarParcela(idParcela) {
        return this.dataSource.transaction(async (manager) => {
            var _a, _b;
            const parcelaRepo = manager.getRepository(parcela_entity_1.Parcela);
            const lancamentoRepo = manager.getRepository(lancamento_entity_1.Lancamento);
            const movRepo = manager.getRepository(movimentacao_entity_1.Movimentacao);
            const contaRepo = manager.getRepository(conta_entity_1.Conta);
            const parcela = await parcelaRepo.findOne({
                where: { idParcela },
                relations: ['lancamento', 'movimentacao'],
            });
            if (!parcela) {
                throw new common_1.NotFoundException(`Parcela com ID ${idParcela} não encontrada.`);
            }
            if (parcela.status === parcela_entity_1.StatusParcela.CANCELADO) {
                throw new common_1.BadRequestException('Esta parcela já foi cancelada.');
            }
            const lancamento = parcela.lancamento;
            const todasParcelas = await parcelaRepo.find({
                where: { idLancamento: lancamento.idLancamento }
            });
            const totalParcelas = todasParcelas.length;
            const totalParcelasAtivas = todasParcelas.filter(p => p.status === parcela_entity_1.StatusParcela.ABERTO).length;
            const temParcelasPagas = todasParcelas.some(p => p.status === parcela_entity_1.StatusParcela.PAGO);
            if (totalParcelas === 1) {
            }
            else if (temParcelasPagas && parcela.status !== parcela_entity_1.StatusParcela.PAGO) {
                throw new common_1.BadRequestException('Não é possível cancelar parcelas pendentes quando há pagamentos realizados. É necessário fazer o estorno dos pagamentos primeiro.');
            }
            else if (totalParcelasAtivas <= 1 && parcela.status !== parcela_entity_1.StatusParcela.PAGO) {
                throw new common_1.BadRequestException('Não é possível cancelar a última parcela de um lançamento. Remova o lançamento inteiro.');
            }
            if (parcela.status === parcela_entity_1.StatusParcela.PAGO) {
                let movimentacoesOrigem = await movRepo.find({
                    where: { idParcelaOrigem: parcela.idParcela },
                });
                if (movimentacoesOrigem.length === 0 && parcela.movimentacao) {
                    movimentacoesOrigem = [parcela.movimentacao];
                }
                if (movimentacoesOrigem.length === 0) {
                    throw new Error(`Inconsistência: Parcela PAGA (ID: ${parcela.idParcela}) sem movimentação.`);
                }
                for (const movOriginal of movimentacoesOrigem) {
                    const conta = await contaRepo.findOne({
                        where: { idConta: movOriginal.idConta },
                        lock: { mode: 'pessimistic_write' },
                    });
                    if (!conta) {
                        throw new Error(`Inconsistência: Conta (ID: ${movOriginal.idConta}) não encontrada.`);
                    }
                    const acrescimoOrig = Number((_a = movOriginal.valorAcrescimo) !== null && _a !== void 0 ? _a : 0);
                    const totalEstorno = Number(movOriginal.valor) + acrescimoOrig;
                    const tipoEstorno = movOriginal.tipo === movimentacao_entity_1.TipoMovimentacao.CREDITO ? movimentacao_entity_1.TipoMovimentacao.DEBITO : movimentacao_entity_1.TipoMovimentacao.CREDITO;
                    const estorno = movRepo.create({
                        idConta: conta.idConta,
                        tipo: tipoEstorno,
                        valor: movOriginal.valor,
                        valorAcrescimo: acrescimoOrig,
                        descricao: `Estorno referente à parcela #${parcela.numeroParcela} do lançamento #${lancamento.idLancamento}`,
                        dataMovimentacao: new Date(),
                        idParcelaOrigem: parcela.idParcela,
                    });
                    await movRepo.save(estorno);
                    const saldoAtualNum = Number((_b = conta.saldoAtual) !== null && _b !== void 0 ? _b : 0);
                    const novoSaldo = tipoEstorno === movimentacao_entity_1.TipoMovimentacao.CREDITO
                        ? saldoAtualNum + totalEstorno
                        : saldoAtualNum - totalEstorno;
                    await contaRepo.update({ idConta: conta.idConta }, { saldoAtual: novoSaldo, dataAlteracao: new Date() });
                }
            }
            parcela.status = parcela_entity_1.StatusParcela.CANCELADO;
            parcela.dataPagamento = null;
            parcela.movimentacao = null;
            await parcelaRepo.save(parcela);
            const lancamentoAtualizado = await lancamentoRepo.findOne({
                where: { idLancamento: lancamento.idLancamento },
            });
            lancamentoAtualizado.valorTotal = Number(lancamentoAtualizado.valorTotal) - Number(parcela.valor);
            const parcelasRestantes = await parcelaRepo.find({ where: { idLancamento: lancamentoAtualizado.idLancamento } });
            const parcelasPagas = parcelasRestantes.filter(p => p.status === parcela_entity_1.StatusParcela.PAGO).length;
            const parcelasAbertas = parcelasRestantes.filter(p => p.status === parcela_entity_1.StatusParcela.ABERTO).length;
            if (parcelasAbertas === 0 && parcelasPagas === 0) {
                lancamento.status = lancamento_entity_1.StatusLancamento.CANCELADO;
            }
            else if (parcelasAbertas === 0) {
                lancamentoAtualizado.status = lancamento_entity_1.StatusLancamento.PAGO;
            }
            else if (parcelasPagas > 0) {
                lancamentoAtualizado.status = lancamento_entity_1.StatusLancamento.PARCIALMENTE_PAGO;
            }
            else {
                lancamentoAtualizado.status = lancamento_entity_1.StatusLancamento.PENDENTE;
            }
            await lancamentoRepo.save(lancamentoAtualizado);
        });
    }
    async pagarParcela(idParcela, dto) {
        return this.dataSource.transaction(async (manager) => this.executarPagamentoParcela(manager, idParcela, dto));
    }
    async executarPagamentoParcela(manager, idParcela, dto) {
        var _a, _b;
        const parcelaRepo = manager.getRepository(parcela_entity_1.Parcela);
        const contaRepo = manager.getRepository(conta_entity_1.Conta);
        const movRepo = manager.getRepository(movimentacao_entity_1.Movimentacao);
        const lancamentoRepo = manager.getRepository(lancamento_entity_1.Lancamento);
        let parcela = await parcelaRepo.findOne({
            where: { idParcela },
            relations: ['lancamento'],
        });
        if (!parcela)
            throw new common_1.NotFoundException(`Parcela com ID ${idParcela} não encontrada.`);
        if (parcela.status === parcela_entity_1.StatusParcela.PAGO)
            throw new common_1.BadRequestException('Esta parcela já foi paga.');
        if (parcela.status === parcela_entity_1.StatusParcela.CANCELADO)
            throw new common_1.BadRequestException('Não é possível pagar uma parcela cancelada.');
        const valorRestante = Number(parcela.valor) - Number(parcela.valorPago);
        if (dto.valor > valorRestante + 0.001) {
            throw new common_1.BadRequestException(`O valor a pagar (R$ ${dto.valor}) não pode ser maior que o valor restante (R$ ${valorRestante}).`);
        }
        const conta = await contaRepo.findOneBy({ idConta: dto.idConta });
        if (!conta)
            throw new common_1.NotFoundException(`Conta com ID ${dto.idConta} não encontrada.`);
        const tipoMovimentacao = parcela.lancamento.tipo === tipo_lancamento_enum_1.TipoLancamento.RECEITA ? movimentacao_entity_1.TipoMovimentacao.CREDITO : movimentacao_entity_1.TipoMovimentacao.DEBITO;
        const valorPagamento = dto.valor;
        const acrescimo = parcela.lancamento.tipo === tipo_lancamento_enum_1.TipoLancamento.RECEITA ? Math.max(0, Number((_a = dto.acrescimo) !== null && _a !== void 0 ? _a : 0)) : 0;
        const totalEfeitoCaixa = Number(valorPagamento) + acrescimo;
        if (dto.meioPagamento) {
            await parcelaRepo.update({ idLancamento: parcela.idLancamento, status: parcela_entity_1.StatusParcela.ABERTO }, { meioPagamento: dto.meioPagamento });
            parcela.meioPagamento = dto.meioPagamento;
        }
        const movimentacao = movRepo.create({
            idConta: conta.idConta,
            tipo: tipoMovimentacao,
            valor: valorPagamento,
            valorAcrescimo: acrescimo,
            descricao: `Pagamento parcial/total da parcela ${parcela.numeroParcela} do lançamento #${parcela.idLancamento}`,
            dataMovimentacao: parseDataPagamentoParaDataLocal(dto.dataPagamento),
            idParcelaOrigem: parcela.idParcela,
        });
        await movRepo.save(movimentacao);
        if (tipoMovimentacao === movimentacao_entity_1.TipoMovimentacao.CREDITO) {
            conta.saldoAtual = Number(conta.saldoAtual) + totalEfeitoCaixa;
        }
        else {
            conta.saldoAtual = Number(conta.saldoAtual) - totalEfeitoCaixa;
        }
        await contaRepo.save(conta);
        parcela.valorPago = Number(parcela.valorPago) + Number(valorPagamento);
        if (parcela.lancamento.tipo === tipo_lancamento_enum_1.TipoLancamento.RECEITA && acrescimo > 0) {
            parcela.valorAcrescimoAcumulado =
                Number((_b = parcela.valorAcrescimoAcumulado) !== null && _b !== void 0 ? _b : 0) + acrescimo;
        }
        const novoValorRestante = Number(parcela.valor) - parcela.valorPago;
        if (novoValorRestante < 0.01) {
            parcela.status = parcela_entity_1.StatusParcela.PAGO;
            parcela.dataPagamento = parseDataPagamentoParaDataLocal(dto.dataPagamento);
        }
        await parcelaRepo.save(parcela);
        if (parcela.status === parcela_entity_1.StatusParcela.PAGO) {
            const lancamento = await lancamentoRepo.findOneBy({ idLancamento: parcela.idLancamento });
            const parcelasNaoPagas = await parcelaRepo.count({
                where: { idLancamento: lancamento.idLancamento, status: parcela_entity_1.StatusParcela.ABERTO },
            });
            if (parcelasNaoPagas === 0) {
                lancamento.status = lancamento_entity_1.StatusLancamento.PAGO;
            }
            else {
                lancamento.status = lancamento_entity_1.StatusLancamento.PARCIALMENTE_PAGO;
            }
            await lancamentoRepo.save(lancamento);
        }
        return parcela;
    }
    async transferirEntreContas(dto) {
        if (dto.idContaOrigem === dto.idContaDestino) {
            throw new common_1.BadRequestException('Conta de origem e destino não podem ser a mesma.');
        }
        return this.dataSource.transaction(async (manager) => {
            const contaRepo = manager.getRepository(conta_entity_1.Conta);
            const movRepo = manager.getRepository(movimentacao_entity_1.Movimentacao);
            const contaOrigem = await contaRepo.findOneBy({ idConta: dto.idContaOrigem });
            if (!contaOrigem)
                throw new common_1.NotFoundException(`Conta de origem com ID ${dto.idContaOrigem} não encontrada.`);
            const contaDestino = await contaRepo.findOneBy({ idConta: dto.idContaDestino });
            if (!contaDestino)
                throw new common_1.NotFoundException(`Conta de destino com ID ${dto.idContaDestino} não encontrada.`);
            const idAgrupador = (0, crypto_1.randomUUID)();
            const dataTransferencia = new Date(dto.dataTransferencia);
            const debito = movRepo.create({
                idConta: contaOrigem.idConta,
                tipo: movimentacao_entity_1.TipoMovimentacao.DEBITO,
                valor: dto.valor,
                valorAcrescimo: 0,
                descricao: `Transferência para a conta: ${contaDestino.nome}`,
                dataMovimentacao: dataTransferencia,
                idAgrupadorTransferencia: idAgrupador,
            });
            await movRepo.save(debito);
            contaOrigem.saldoAtual = Number(contaOrigem.saldoAtual) - dto.valor;
            await contaRepo.save(contaOrigem);
            const credito = movRepo.create({
                idConta: contaDestino.idConta,
                tipo: movimentacao_entity_1.TipoMovimentacao.CREDITO,
                valor: dto.valor,
                valorAcrescimo: 0,
                descricao: `Transferência recebida da conta: ${contaOrigem.nome}`,
                dataMovimentacao: dataTransferencia,
                idAgrupadorTransferencia: idAgrupador,
            });
            await movRepo.save(credito);
            contaDestino.saldoAtual = Number(contaDestino.saldoAtual) + dto.valor;
            await contaRepo.save(contaDestino);
        });
    }
    async consultarFluxoCaixa(dataInicio, dataFim) {
        const qb = this.parcelaRepository.createQueryBuilder('parcela')
            .leftJoin('parcela.lancamento', 'lancamento')
            .select('parcela.dataVencimento', 'dataVencimento')
            .addSelect('lancamento.tipo', 'tipo')
            .addSelect('SUM(parcela.valor)', 'total')
            .where('parcela.status = :status', { status: parcela_entity_1.StatusParcela.ABERTO })
            .andWhere('parcela.dataVencimento BETWEEN :dataInicio AND :dataFim', { dataInicio, dataFim })
            .groupBy('parcela.dataVencimento, lancamento.tipo')
            .orderBy('parcela.dataVencimento', 'ASC');
        return qb.getRawMany();
    }
    async criarCreditoDevolucao(lancamentoOrigem, valorCredito, idDevolucao) {
        if (lancamentoOrigem.tipo !== tipo_lancamento_enum_1.TipoLancamento.RECEITA) {
            throw new common_1.BadRequestException('Crédito de devolução só pode ser aplicado a lançamentos de receita.');
        }
        const dataHoje = new Date().toISOString().split('T')[0];
        return this.criarLancamento({
            descricao: `Crédito por devolução (Devolução ID: ${idDevolucao}) referente ao Lançamento #${lancamentoOrigem.idLancamento}`,
            tipo: tipo_lancamento_enum_1.TipoLancamento.DESPESA,
            valorTotal: valorCredito,
            dataCompetencia: dataHoje,
            idClienteFornecedor: lancamentoOrigem.idClienteFornecedor,
            idFatura: lancamentoOrigem.idFatura,
            parcelas: [{
                    numeroParcela: 1,
                    valor: valorCredito,
                    dataVencimento: dataHoje,
                    meioPagamento: parcela_entity_1.MeioPagamento.CREDITO_INTERNO,
                }],
        });
    }
    async obterDashboardFinanceiro(idEmpresa, mes, ano) {
        const hoje = new Date();
        const mesAtual = mes || hoje.getMonth() + 1;
        const anoAtual = ano || hoje.getFullYear();
        const contas = await this.contaRepository.find();
        const saldoTotal = contas.reduce((acc, conta) => acc + Number(conta.saldoAtual), 0);
        const lancamentosMes = await this.listarLancamentos({ mes: mesAtual, ano: anoAtual });
        let receitasMes = 0;
        let despesasMes = 0;
        for (const lancamento of lancamentosMes) {
            const valorPago = lancamento.parcelas.reduce((acc, p) => {
                var _a;
                let v = Number(p.valorPago);
                if (lancamento.tipo === tipo_lancamento_enum_1.TipoLancamento.RECEITA) {
                    v += Number((_a = p.valorAcrescimoAcumulado) !== null && _a !== void 0 ? _a : 0);
                }
                return acc + v;
            }, 0);
            if (lancamento.tipo === tipo_lancamento_enum_1.TipoLancamento.RECEITA) {
                receitasMes += valorPago;
            }
            else {
                despesasMes += valorPago;
            }
        }
        const dividas = await this.listarDividas(idEmpresa);
        const dividasPendentes = dividas.reduce((acc, d) => acc + d.valorRestante, 0);
        const receitasPendentes = dividas
            .filter((d) => d.tipo === tipo_lancamento_enum_1.TipoLancamento.RECEITA)
            .reduce((acc, d) => acc + d.valorRestante, 0);
        const movimentacoesRecentes = await this.movimentacaoRepository.find({
            take: 10,
            order: { dataMovimentacao: 'DESC' },
            relations: ['conta'],
        });
        return {
            saldoTotal,
            receitasMes,
            despesasMes,
            dividasPendentes,
            receitasPendentes,
            movimentacoesRecentes: movimentacoesRecentes.map((m) => {
                var _a;
                return ({
                    idMovimentacao: m.idMovimentacao,
                    tipo: m.tipo,
                    valor: Number(m.valor),
                    descricao: m.descricao,
                    dataMovimentacao: m.dataMovimentacao,
                    conta: (_a = m.conta) === null || _a === void 0 ? void 0 : _a.nome,
                });
            }),
        };
    }
    async listarDividas(idEmpresa) {
        const queryBuilder = this.parcelaRepository
            .createQueryBuilder('parcela')
            .innerJoinAndSelect('parcela.lancamento', 'lancamento')
            .where('parcela.status IN (:...statuses)', {
            statuses: [parcela_entity_1.StatusParcela.ABERTO, parcela_entity_1.StatusParcela.VENCIDO],
        })
            .andWhere('parcela.valorPago < parcela.valor');
        if (idEmpresa) {
            queryBuilder.andWhere('lancamento.idClienteFornecedor = :idEmpresa', { idEmpresa });
        }
        const parcelas = await queryBuilder.getMany();
        return parcelas.map((parcela) => {
            const hoje = new Date();
            hoje.setHours(0, 0, 0, 0);
            const vencimento = new Date(parcela.dataVencimento);
            vencimento.setHours(0, 0, 0, 0);
            const diasAtraso = Math.max(0, Math.floor((hoje.getTime() - vencimento.getTime()) / (1000 * 60 * 60 * 24)));
            return {
                idParcela: parcela.idParcela,
                idLancamento: parcela.idLancamento,
                descricao: parcela.lancamento.descricao,
                tipo: parcela.lancamento.tipo,
                valor: Number(parcela.valor),
                valorPago: Number(parcela.valorPago),
                valorRestante: Number(parcela.valor) - Number(parcela.valorPago),
                dataVencimento: parcela.dataVencimento,
                diasAtraso,
            };
        });
    }
    async calcularFluxoCaixa(idEmpresa, dias = 30) {
        const hoje = new Date();
        const dataFim = new Date(hoje);
        dataFim.setDate(hoje.getDate() + dias);
        const queryBuilder = this.parcelaRepository
            .createQueryBuilder('parcela')
            .innerJoin('parcela.lancamento', 'lancamento')
            .where('parcela.status IN (:...statuses)', {
            statuses: [parcela_entity_1.StatusParcela.ABERTO, parcela_entity_1.StatusParcela.VENCIDO],
        })
            .andWhere('parcela.dataVencimento BETWEEN :hoje AND :dataFim', {
            hoje: hoje.toISOString().split('T')[0],
            dataFim: dataFim.toISOString().split('T')[0],
        })
            .andWhere('parcela.valorPago < parcela.valor');
        if (idEmpresa) {
            queryBuilder.andWhere('lancamento.idClienteFornecedor = :idEmpresa', { idEmpresa });
        }
        const parcelas = await queryBuilder
            .select('parcela.dataVencimento', 'data')
            .addSelect('lancamento.tipo', 'tipo')
            .addSelect('SUM(parcela.valor - parcela.valorPago)', 'valor')
            .groupBy('parcela.dataVencimento, lancamento.tipo')
            .orderBy('parcela.dataVencimento', 'ASC')
            .getRawMany();
        const fluxoPorData = new Map();
        for (const parcela of parcelas) {
            const rawData = parcela.data;
            const data = rawData instanceof Date
                ? `${rawData.getFullYear()}-${String(rawData.getMonth() + 1).padStart(2, '0')}-${String(rawData.getDate()).padStart(2, '0')}`
                : String(rawData).split('T')[0];
            if (!fluxoPorData.has(data)) {
                fluxoPorData.set(data, { receitas: 0, despesas: 0 });
            }
            const valor = Number(parcela.valor);
            if (parcela.tipo === tipo_lancamento_enum_1.TipoLancamento.RECEITA) {
                fluxoPorData.get(data).receitas += valor;
            }
            else {
                fluxoPorData.get(data).despesas += valor;
            }
        }
        let saldoAcumulado = 0;
        const resultado = Array.from(fluxoPorData.entries())
            .map(([data, valores]) => {
            saldoAcumulado += valores.receitas - valores.despesas;
            return {
                data,
                receitas: valores.receitas,
                despesas: valores.despesas,
                saldo: saldoAcumulado,
            };
        })
            .sort((a, b) => a.data.localeCompare(b.data));
        return resultado;
    }
    async gerarDre(params) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7, _8, _9, _10, _11, _12, _13;
        const { dataInicio, dataFim, regime, idEmpresa } = params;
        const [inicioAno, inicioMes] = this.parsePeriodo(dataInicio);
        const [fimAno, fimMes] = this.parsePeriodo(dataFim);
        if (!inicioAno || !fimAno || (fimAno < inicioAno) || (fimAno === inicioAno && fimMes < inicioMes)) {
            throw new common_1.BadRequestException('Período inválido. dataInicio deve ser anterior ou igual a dataFim.');
        }
        const meses = [];
        let ano = inicioAno;
        let mes = inicioMes;
        while (ano < fimAno || (ano === fimAno && mes <= fimMes)) {
            meses.push(`${mes}/${ano}`);
            mes++;
            if (mes > 12) {
                mes = 1;
                ano++;
            }
        }
        const dataInicioStr = formatDataLocalYYYYMMDD(new Date(inicioAno, inicioMes - 1, 1));
        const dataFimStr = formatDataLocalYYYYMMDD(new Date(fimAno, fimMes, 0));
        const categorias = await this.categoriaService.findAll(true);
        const idsCategoriasValidas = new Set(categorias.map((c) => c.idCategoria));
        let mapaValores = new Map();
        if (regime === 'competencia') {
            const qbDespesa = this.lancamentoRepository
                .createQueryBuilder('lancamento')
                .select('lancamento.idCategoria', 'idCategoria')
                .addSelect('lancamento.tipo', 'tipo')
                .addSelect('EXTRACT(YEAR FROM lancamento.dataCompetencia)', 'ano')
                .addSelect('EXTRACT(MONTH FROM lancamento.dataCompetencia)', 'mes')
                .addSelect('SUM(lancamento.valorTotal)', 'total')
                .where('lancamento.tipo = :despesa', { despesa: tipo_lancamento_enum_1.TipoLancamento.DESPESA })
                .andWhere('lancamento.status != :cancelado', { cancelado: lancamento_entity_1.StatusLancamento.CANCELADO })
                .andWhere('lancamento.dataCompetencia >= :dataInicio', { dataInicio: dataInicioStr })
                .andWhere('lancamento.dataCompetencia <= :dataFim', { dataFim: dataFimStr })
                .groupBy('lancamento.idCategoria')
                .addGroupBy('lancamento.tipo')
                .addGroupBy('EXTRACT(YEAR FROM lancamento.dataCompetencia)')
                .addGroupBy('EXTRACT(MONTH FROM lancamento.dataCompetencia)');
            if (idEmpresa != null) {
                qbDespesa.andWhere('lancamento.idClienteFornecedor = :idEmpresa', { idEmpresa });
            }
            const raw = await qbDespesa.getRawMany();
            for (const r of raw) {
                const idCat = r.idCategoria != null ? Number(r.idCategoria) : null;
                const mesAno = `${Number(r.mes)}/${Number(r.ano)}`;
                const key = `${idCat !== null && idCat !== void 0 ? idCat : 'null'}_${r.tipo}_${mesAno}`;
                const current = (_a = mapaValores.get(key)) !== null && _a !== void 0 ? _a : 0;
                mapaValores.set(key, current + Number(r.total));
            }
        }
        else {
            const qbCaixa = this.movimentacaoRepository
                .createQueryBuilder('mov')
                .innerJoin(parcela_entity_1.Parcela, 'parcela', 'parcela.idParcela = mov.idParcelaOrigem')
                .innerJoin('parcela.lancamento', 'lancamento')
                .select('lancamento.idCategoria', 'idCategoria')
                .addSelect('lancamento.tipo', 'tipo')
                .addSelect('EXTRACT(YEAR FROM mov.dataMovimentacao)', 'ano')
                .addSelect('EXTRACT(MONTH FROM mov.dataMovimentacao)', 'mes')
                .addSelect('SUM(COALESCE(mov.valor, 0) + COALESCE(mov.valorAcrescimo, 0))', 'total')
                .where('mov.idParcelaOrigem IS NOT NULL')
                .andWhere('DATE(mov.dataMovimentacao) >= :dataInicio', { dataInicio: dataInicioStr })
                .andWhere('DATE(mov.dataMovimentacao) <= :dataFim', { dataFim: dataFimStr })
                .andWhere('lancamento.status != :cancelado', { cancelado: lancamento_entity_1.StatusLancamento.CANCELADO })
                .andWhere('lancamento.idFatura IS NULL')
                .andWhere('(lancamento.tipo = :receita AND mov.tipo = :credito) OR (lancamento.tipo = :despesa AND mov.tipo = :debito)', {
                receita: tipo_lancamento_enum_1.TipoLancamento.RECEITA,
                despesa: tipo_lancamento_enum_1.TipoLancamento.DESPESA,
                credito: movimentacao_entity_1.TipoMovimentacao.CREDITO,
                debito: movimentacao_entity_1.TipoMovimentacao.DEBITO,
            })
                .groupBy('lancamento.idCategoria')
                .addGroupBy('lancamento.tipo')
                .addGroupBy('EXTRACT(YEAR FROM mov.dataMovimentacao)')
                .addGroupBy('EXTRACT(MONTH FROM mov.dataMovimentacao)');
            if (idEmpresa != null) {
                qbCaixa.andWhere('lancamento.idClienteFornecedor = :idEmpresa', { idEmpresa });
            }
            const rawCaixa = await qbCaixa.getRawMany();
            for (const r of rawCaixa) {
                const idCat = r.idCategoria != null ? Number(r.idCategoria) : null;
                const mesAno = `${Number(r.mes)}/${Number(r.ano)}`;
                const key = `${idCat !== null && idCat !== void 0 ? idCat : 'null'}_${r.tipo}_${mesAno}`;
                const current = (_b = mapaValores.get(key)) !== null && _b !== void 0 ? _b : 0;
                mapaValores.set(key, current + Number(r.total));
            }
        }
        let catDesconhecidoDespesa = categorias.find(c => c.nome.trim().toUpperCase() === 'DESCONHECIDO' && c.tipo === tipo_lancamento_enum_1.TipoLancamento.DESPESA);
        if (!catDesconhecidoDespesa) {
            catDesconhecidoDespesa = {
                idCategoria: -999,
                nome: 'DESCONHECIDO',
                tipo: tipo_lancamento_enum_1.TipoLancamento.DESPESA,
                classificacaoDre: classificacao_dre_enum_1.ClassificacaoDre.OPERACIONAL_DESPESA,
            };
            categorias.push(catDesconhecidoDespesa);
            idsCategoriasValidas.add(-999);
        }
        let catDesconhecidoReceita = categorias.find(c => c.nome.trim().toUpperCase() === 'DESCONHECIDO' && c.tipo === tipo_lancamento_enum_1.TipoLancamento.RECEITA);
        if (!catDesconhecidoReceita) {
            catDesconhecidoReceita = {
                idCategoria: -998,
                nome: 'DESCONHECIDO',
                tipo: tipo_lancamento_enum_1.TipoLancamento.RECEITA,
                classificacaoDre: classificacao_dre_enum_1.ClassificacaoDre.OPERACIONAL_RECEITA,
            };
            categorias.push(catDesconhecidoReceita);
            idsCategoriasValidas.add(-998);
        }
        mapaValores = this.remapMapaDrePorCategoriasExcluidas(mapaValores, idsCategoriasValidas);
        for (const key of Array.from(mapaValores.keys())) {
            if (key.startsWith('null_DESPESA_')) {
                const val = mapaValores.get(key);
                mapaValores.delete(key);
                const newKey = `${catDesconhecidoDespesa.idCategoria}_DESPESA_${key.split('_')[2]}`;
                mapaValores.set(newKey, ((_c = mapaValores.get(newKey)) !== null && _c !== void 0 ? _c : 0) + val);
            }
            else if (key.startsWith('null_RECEITA_')) {
                const val = mapaValores.get(key);
                mapaValores.delete(key);
                const newKey = `${catDesconhecidoReceita.idCategoria}_RECEITA_${key.split('_')[2]}`;
                mapaValores.set(newKey, ((_d = mapaValores.get(newKey)) !== null && _d !== void 0 ? _d : 0) + val);
            }
        }
        const categoriasParaExcluir = new Set(categorias
            .filter((c) => c.nome.trim().toUpperCase() === 'PAGAMENTO DE FATURA')
            .map((c) => c.idCategoria));
        for (const key of Array.from(mapaValores.keys())) {
            const idStr = key.split('_')[0];
            if (idStr !== 'null' && categoriasParaExcluir.has(Number(idStr))) {
                mapaValores.delete(key);
            }
        }
        const excluirDaTabelaDemonstrativoDre = (c) => c.classificacaoDre === classificacao_dre_enum_1.ClassificacaoDre.SAIDA_FINANCIAMENTO ||
            c.classificacaoDre === classificacao_dre_enum_1.ClassificacaoDre.INVESTIMENTO ||
            categoriasParaExcluir.has(c.idCategoria);
        const linhasOrdenadas = [];
        const receitasPais = categorias
            .filter((c) => c.tipo === tipo_lancamento_enum_1.TipoLancamento.RECEITA &&
            c.idCategoriaPai == null &&
            !excluirDaTabelaDemonstrativoDre(c))
            .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
        const despesasPais = categorias
            .filter((c) => c.tipo === tipo_lancamento_enum_1.TipoLancamento.DESPESA &&
            c.idCategoriaPai == null &&
            !excluirDaTabelaDemonstrativoDre(c))
            .sort((a, b) => {
            const lowerA = a.nome.toLowerCase();
            const lowerB = b.nome.toLowerCase();
            const isAInsumos = lowerA.includes('insumo');
            const isBInsumos = lowerB.includes('insumo');
            const isAFolha = lowerA.includes('folha');
            const isBFolha = lowerB.includes('folha');
            const rankA = isAInsumos ? 1 : (isAFolha ? 2 : 3);
            const rankB = isBInsumos ? 1 : (isBFolha ? 2 : 3);
            if (rankA !== rankB)
                return rankA - rankB;
            return a.nome.localeCompare(b.nome, 'pt-BR');
        });
        for (const cat of receitasPais) {
            linhasOrdenadas.push({ cat, nivel: 0 });
            const subs = (cat.subcategorias || [])
                .filter((s) => s.idCategoriaPai === cat.idCategoria &&
                idsCategoriasValidas.has(s.idCategoria) &&
                s.tipo === cat.tipo &&
                !excluirDaTabelaDemonstrativoDre(s))
                .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
            for (const sub of subs) {
                linhasOrdenadas.push({ cat: sub, nivel: 1 });
            }
        }
        for (const cat of despesasPais) {
            linhasOrdenadas.push({ cat, nivel: 0 });
            const subs = (cat.subcategorias || [])
                .filter((s) => s.idCategoriaPai === cat.idCategoria &&
                idsCategoriasValidas.has(s.idCategoria) &&
                s.tipo === cat.tipo &&
                !excluirDaTabelaDemonstrativoDre(s))
                .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
            for (const sub of subs) {
                linhasOrdenadas.push({ cat: sub, nivel: 1 });
            }
        }
        const totaisReceitaPorMes = {};
        const totaisDespesaPorMes = {};
        const resultadoPorMes = {};
        const totaisReceitaOperacionalPorMes = {};
        const totaisDespesaOperacionalPorMes = {};
        const resultadoOperacionalPorMes = {};
        const totaisDespesaVariavelPorMes = {};
        const margemContribuicaoPorMes = {};
        const indiceContribuicaoPorMes = {};
        const totaisDepreciacaoAmortizacaoPorMes = {};
        const ebitdaPorMes = {};
        const ebitdaAbsolutoPorMes = {};
        const lucroOperacionalAjustadoPorMes = {};
        const ebitdaAjustadoPorMes = {};
        const totaisInvestimentosPorMes = {};
        const totaisAportesPorMes = {};
        const totaisSaidasFinanciamentoPorMes = {};
        const resultadoPosInvestimentoPorMes = {};
        const resultadoLiquidoPorMes = {};
        for (const m of meses) {
            totaisReceitaPorMes[m] = 0;
            totaisDespesaPorMes[m] = 0;
            totaisDespesaVariavelPorMes[m] = 0;
            margemContribuicaoPorMes[m] = 0;
            resultadoPorMes[m] = 0;
            totaisDepreciacaoAmortizacaoPorMes[m] = 0;
            ebitdaPorMes[m] = 0;
            ebitdaAbsolutoPorMes[m] = 0;
            lucroOperacionalAjustadoPorMes[m] = 0;
            ebitdaAjustadoPorMes[m] = 0;
            totaisReceitaOperacionalPorMes[m] = 0;
            totaisDespesaOperacionalPorMes[m] = 0;
            resultadoOperacionalPorMes[m] = 0;
            totaisInvestimentosPorMes[m] = 0;
            totaisAportesPorMes[m] = 0;
            totaisSaidasFinanciamentoPorMes[m] = 0;
            resultadoPosInvestimentoPorMes[m] = 0;
            resultadoLiquidoPorMes[m] = 0;
        }
        const linhas = [];
        for (const { cat, nivel } of linhasOrdenadas) {
            const valoresPorMes = {};
            let totalGeral = 0;
            for (const m of meses) {
                const key = `${cat.idCategoria}_${cat.tipo}_${m}`;
                const val = (_e = mapaValores.get(key)) !== null && _e !== void 0 ? _e : 0;
                valoresPorMes[m] = val;
                totalGeral += val;
                if (cat.tipo === tipo_lancamento_enum_1.TipoLancamento.RECEITA) {
                    totaisReceitaPorMes[m] += val;
                }
                else {
                    totaisDespesaPorMes[m] += val;
                    if (cat.classificacaoDespesa === classificacao_despesa_enum_1.ClassificacaoDespesa.VARIAVEL) {
                        totaisDespesaVariavelPorMes[m] += val;
                    }
                }
            }
            linhas.push({
                tipo: cat.tipo,
                idCategoria: cat.idCategoria,
                nomeCategoria: cat.nome,
                idCategoriaPai: (_f = cat.idCategoriaPai) !== null && _f !== void 0 ? _f : null,
                nivel,
                valoresPorMes,
                totalGeral,
            });
        }
        const defaultClassificacao = (tipo) => tipo === tipo_lancamento_enum_1.TipoLancamento.RECEITA
            ? classificacao_dre_enum_1.ClassificacaoDre.OPERACIONAL_RECEITA
            : classificacao_dre_enum_1.ClassificacaoDre.OPERACIONAL_DESPESA;
        for (const cat of categorias) {
            if (!(cat === null || cat === void 0 ? void 0 : cat.idCategoria))
                continue;
            const classif = (_g = cat.classificacaoDre) !== null && _g !== void 0 ? _g : defaultClassificacao(cat.tipo);
            for (const m of meses) {
                const key = `${cat.idCategoria}_${cat.tipo}_${m}`;
                const val = (_h = mapaValores.get(key)) !== null && _h !== void 0 ? _h : 0;
                const catNameLower = cat.nome.toLowerCase();
                if (catNameLower.includes('deprecia') || catNameLower.includes('amortiza')) {
                    totaisDepreciacaoAmortizacaoPorMes[m] += val;
                }
                switch (classif) {
                    case classificacao_dre_enum_1.ClassificacaoDre.INVESTIMENTO:
                        totaisInvestimentosPorMes[m] += val;
                        break;
                    case classificacao_dre_enum_1.ClassificacaoDre.APORTE:
                        totaisAportesPorMes[m] += val;
                        break;
                    case classificacao_dre_enum_1.ClassificacaoDre.SAIDA_FINANCIAMENTO:
                        totaisSaidasFinanciamentoPorMes[m] += val;
                        break;
                    case classificacao_dre_enum_1.ClassificacaoDre.OPERACIONAL_RECEITA:
                        totaisReceitaOperacionalPorMes[m] += val;
                        break;
                    case classificacao_dre_enum_1.ClassificacaoDre.OPERACIONAL_DESPESA:
                    default:
                        totaisDespesaOperacionalPorMes[m] += val;
                        break;
                }
            }
        }
        const porIdCategoria = new Map();
        for (const l of linhas) {
            if (l.idCategoria != null) {
                porIdCategoria.set(l.idCategoria, l);
            }
        }
        const somarFilhosNaLinhaPai = (pais) => {
            var _a, _b;
            for (const cat of pais) {
                const subs = (cat.subcategorias || []).filter((s) => s.idCategoriaPai === cat.idCategoria &&
                    idsCategoriasValidas.has(s.idCategoria) &&
                    s.tipo === cat.tipo &&
                    !excluirDaTabelaDemonstrativoDre(s));
                if (subs.length === 0)
                    continue;
                const linhaPai = porIdCategoria.get(cat.idCategoria);
                if (!linhaPai)
                    continue;
                for (const m of meses) {
                    let somaFilhos = 0;
                    for (const sub of subs) {
                        const linhaSub = porIdCategoria.get(sub.idCategoria);
                        if (linhaSub) {
                            somaFilhos += (_a = linhaSub.valoresPorMes[m]) !== null && _a !== void 0 ? _a : 0;
                        }
                    }
                    linhaPai.valoresPorMes[m] = ((_b = linhaPai.valoresPorMes[m]) !== null && _b !== void 0 ? _b : 0) + somaFilhos;
                }
                linhaPai.totalGeral = meses.reduce((acc, m) => { var _a; return acc + ((_a = linhaPai.valoresPorMes[m]) !== null && _a !== void 0 ? _a : 0); }, 0);
            }
        };
        somarFilhosNaLinhaPai(receitasPais);
        somarFilhosNaLinhaPai(despesasPais);
        const totaisReceitaFaturasPorMes = await this.montarTotaisReceitaFaturasPorMes(meses, regime, idEmpresa);
        let totalGeralReceitaFaturas = 0;
        for (const m of meses) {
            totalGeralReceitaFaturas += (_j = totaisReceitaFaturasPorMes[m]) !== null && _j !== void 0 ? _j : 0;
        }
        const linhaReceitaFaturas = {
            tipo: tipo_lancamento_enum_1.TipoLancamento.RECEITA,
            idCategoria: null,
            nomeCategoria: regime === 'competencia' ? 'FATURAS' : 'Receita de faturas (caixa)',
            idCategoriaPai: null,
            nivel: 0,
            valoresPorMes: totaisReceitaFaturasPorMes,
            totalGeral: totalGeralReceitaFaturas,
        };
        const semCategoriaReceita = {};
        const semCategoriaDespesa = {};
        let totalSemCatReceita = 0;
        let totalSemCatDespesa = 0;
        for (const m of meses) {
            const keyR = `null_RECEITA_${m}`;
            const keyD = `null_DESPESA_${m}`;
            const vR = (_k = mapaValores.get(keyR)) !== null && _k !== void 0 ? _k : 0;
            const vD = (_l = mapaValores.get(keyD)) !== null && _l !== void 0 ? _l : 0;
            semCategoriaReceita[m] = vR;
            semCategoriaDespesa[m] = vD;
            totalSemCatReceita += vR;
            totalSemCatDespesa += vD;
            totaisReceitaPorMes[m] = ((_m = totaisReceitaPorMes[m]) !== null && _m !== void 0 ? _m : 0) + vR;
            totaisDespesaPorMes[m] = ((_o = totaisDespesaPorMes[m]) !== null && _o !== void 0 ? _o : 0) + vD;
            totaisReceitaOperacionalPorMes[m] = ((_p = totaisReceitaOperacionalPorMes[m]) !== null && _p !== void 0 ? _p : 0) + vR;
            totaisDespesaOperacionalPorMes[m] = ((_q = totaisDespesaOperacionalPorMes[m]) !== null && _q !== void 0 ? _q : 0) + vD;
        }
        const nomeReceitaSemCategoria = 'Sem categoria';
        const semCatReceitaEhFaturasCaixa = regime === 'caixa' &&
            totalSemCatReceita !== 0 &&
            meses.every((m) => { var _a, _b; return ((_a = semCategoriaReceita[m]) !== null && _a !== void 0 ? _a : 0) === ((_b = totaisReceitaFaturasPorMes[m]) !== null && _b !== void 0 ? _b : 0); });
        const linhasComSemCategoria = [];
        let inseriuSemCatReceita = false;
        for (const linha of linhas) {
            if (linha.tipo === tipo_lancamento_enum_1.TipoLancamento.DESPESA &&
                !inseriuSemCatReceita &&
                totalSemCatReceita !== 0 &&
                !semCatReceitaEhFaturasCaixa) {
                linhasComSemCategoria.push({
                    tipo: tipo_lancamento_enum_1.TipoLancamento.RECEITA,
                    idCategoria: null,
                    nomeCategoria: nomeReceitaSemCategoria,
                    idCategoriaPai: null,
                    nivel: 0,
                    valoresPorMes: semCategoriaReceita,
                    totalGeral: totalSemCatReceita,
                });
                inseriuSemCatReceita = true;
            }
            linhasComSemCategoria.push(linha);
        }
        if (!inseriuSemCatReceita && totalSemCatReceita !== 0 && !semCatReceitaEhFaturasCaixa) {
            linhasComSemCategoria.push({
                tipo: tipo_lancamento_enum_1.TipoLancamento.RECEITA,
                idCategoria: null,
                nomeCategoria: nomeReceitaSemCategoria,
                idCategoriaPai: null,
                nivel: 0,
                valoresPorMes: semCategoriaReceita,
                totalGeral: totalSemCatReceita,
            });
        }
        if (totalSemCatDespesa !== 0) {
            linhasComSemCategoria.push({
                tipo: tipo_lancamento_enum_1.TipoLancamento.DESPESA,
                idCategoria: null,
                nomeCategoria: 'Sem categoria',
                idCategoriaPai: null,
                nivel: 0,
                valoresPorMes: semCategoriaDespesa,
                totalGeral: totalSemCatDespesa,
            });
        }
        if (regime === 'competencia') {
            for (const m of meses) {
                totaisReceitaPorMes[m] = (_r = totaisReceitaFaturasPorMes[m]) !== null && _r !== void 0 ? _r : 0;
                totaisReceitaOperacionalPorMes[m] = (_s = totaisReceitaFaturasPorMes[m]) !== null && _s !== void 0 ? _s : 0;
            }
        }
        else {
            for (const m of meses) {
                totaisReceitaPorMes[m] = ((_t = totaisReceitaPorMes[m]) !== null && _t !== void 0 ? _t : 0) + ((_u = totaisReceitaFaturasPorMes[m]) !== null && _u !== void 0 ? _u : 0);
                totaisReceitaOperacionalPorMes[m] = ((_v = totaisReceitaOperacionalPorMes[m]) !== null && _v !== void 0 ? _v : 0) + ((_w = totaisReceitaFaturasPorMes[m]) !== null && _w !== void 0 ? _w : 0);
            }
        }
        await this.agregarAportesModuloCapitalNoDre({
            meses,
            regime,
            dataInicioStr,
            dataFimStr,
            idEmpresa,
            totaisReceitaOperacionalPorMes,
            totaisDespesaOperacionalPorMes,
            totaisInvestimentosPorMes,
            totaisAportesPorMes,
            totaisSaidasFinanciamentoPorMes,
        });
        for (const m of meses) {
            resultadoPorMes[m] = ((_x = totaisReceitaPorMes[m]) !== null && _x !== void 0 ? _x : 0) - ((_y = totaisDespesaPorMes[m]) !== null && _y !== void 0 ? _y : 0);
            margemContribuicaoPorMes[m] =
                ((_z = totaisReceitaOperacionalPorMes[m]) !== null && _z !== void 0 ? _z : 0) - ((_0 = totaisDespesaVariavelPorMes[m]) !== null && _0 !== void 0 ? _0 : 0);
            const receitaOperacional = (_1 = totaisReceitaOperacionalPorMes[m]) !== null && _1 !== void 0 ? _1 : 0;
            indiceContribuicaoPorMes[m] = receitaOperacional > 0
                ? (margemContribuicaoPorMes[m] / receitaOperacional) * 100
                : 0;
            resultadoOperacionalPorMes[m] =
                ((_2 = totaisReceitaOperacionalPorMes[m]) !== null && _2 !== void 0 ? _2 : 0) - ((_3 = totaisDespesaOperacionalPorMes[m]) !== null && _3 !== void 0 ? _3 : 0);
            ebitdaPorMes[m] = receitaOperacional > 0
                ? (resultadoOperacionalPorMes[m] / receitaOperacional) * 100
                : 0;
            ebitdaAbsolutoPorMes[m] = ((_4 = resultadoOperacionalPorMes[m]) !== null && _4 !== void 0 ? _4 : 0) + ((_5 = totaisDepreciacaoAmortizacaoPorMes[m]) !== null && _5 !== void 0 ? _5 : 0);
            resultadoPosInvestimentoPorMes[m] =
                ((_6 = resultadoOperacionalPorMes[m]) !== null && _6 !== void 0 ? _6 : 0) - ((_7 = totaisInvestimentosPorMes[m]) !== null && _7 !== void 0 ? _7 : 0);
            resultadoLiquidoPorMes[m] =
                ((_8 = resultadoPosInvestimentoPorMes[m]) !== null && _8 !== void 0 ? _8 : 0) +
                    ((_9 = totaisAportesPorMes[m]) !== null && _9 !== void 0 ? _9 : 0) -
                    ((_10 = totaisSaidasFinanciamentoPorMes[m]) !== null && _10 !== void 0 ? _10 : 0);
        }
        const totaisParcelasVencidasPorMes = {};
        for (const m of meses) {
            totaisParcelasVencidasPorMes[m] = 0;
        }
        if (regime === 'caixa') {
            const qbParcelasVencidas = this.parcelaRepository
                .createQueryBuilder('parcela')
                .innerJoin('parcela.lancamento', 'lancamento')
                .select('EXTRACT(YEAR FROM parcela.dataVencimento)', 'ano')
                .addSelect('EXTRACT(MONTH FROM parcela.dataVencimento)', 'mes')
                .addSelect('SUM(parcela.valor - COALESCE(parcela.valorPago, 0))', 'total')
                .where('parcela.status = :vencido', { vencido: parcela_entity_1.StatusParcela.VENCIDO })
                .andWhere('lancamento.status != :cancelado', { cancelado: lancamento_entity_1.StatusLancamento.CANCELADO })
                .andWhere('lancamento.tipo = :tipo', { tipo: tipo_lancamento_enum_1.TipoLancamento.RECEITA })
                .andWhere('DATE(parcela.dataVencimento) >= :dataInicio', { dataInicio: dataInicioStr })
                .andWhere('DATE(parcela.dataVencimento) <= :dataFim', { dataFim: dataFimStr })
                .groupBy('EXTRACT(YEAR FROM parcela.dataVencimento)')
                .addGroupBy('EXTRACT(MONTH FROM parcela.dataVencimento)');
            if (idEmpresa != null) {
                qbParcelasVencidas.andWhere('lancamento.idClienteFornecedor = :idEmpresa', { idEmpresa });
            }
            const rawVencidas = await qbParcelasVencidas.getRawMany();
            for (const r of rawVencidas) {
                const mesAno = `${Number(r.mes)}/${Number(r.ano)}`;
                if (meses.includes(mesAno)) {
                    totaisParcelasVencidasPorMes[mesAno] = Number(r.total);
                }
            }
        }
        for (const m of meses) {
            const parcelasVencidas = (_11 = totaisParcelasVencidasPorMes[m]) !== null && _11 !== void 0 ? _11 : 0;
            lucroOperacionalAjustadoPorMes[m] = ((_12 = resultadoOperacionalPorMes[m]) !== null && _12 !== void 0 ? _12 : 0) + parcelasVencidas;
            const receitaOperacionalAjustada = ((_13 = totaisReceitaOperacionalPorMes[m]) !== null && _13 !== void 0 ? _13 : 0) + parcelasVencidas;
            ebitdaAjustadoPorMes[m] = receitaOperacionalAjustada > 0
                ? (lucroOperacionalAjustadoPorMes[m] / receitaOperacionalAjustada) * 100
                : 0;
        }
        return {
            meses,
            linhas: linhasComSemCategoria,
            totaisReceitaPorMes,
            totaisDespesaPorMes,
            resultadoPorMes,
            totaisReceitaOperacionalPorMes,
            totaisDespesaOperacionalPorMes,
            margemContribuicaoPorMes,
            indiceContribuicaoPorMes,
            ebitdaPorMes,
            ebitdaAbsolutoPorMes,
            totaisDepreciacaoAmortizacaoPorMes,
            lucroOperacionalAjustadoPorMes,
            ebitdaAjustadoPorMes,
            totaisDespesaVariavelPorMes,
            resultadoOperacionalPorMes,
            totaisInvestimentosPorMes,
            totaisAportesPorMes,
            totaisSaidasFinanciamentoPorMes,
            resultadoPosInvestimentoPorMes,
            resultadoLiquidoPorMes,
            totaisReceitaFaturasPorMes,
            linhaReceitaFaturas,
            totaisParcelasVencidasPorMes: regime === 'caixa' ? totaisParcelasVencidasPorMes : undefined,
        };
    }
    async agregarAportesModuloCapitalNoDre(params) {
        var _a, _b, _c, _d, _e;
        const { meses, regime, dataInicioStr, dataFimStr, idEmpresa, totaisReceitaOperacionalPorMes, totaisDespesaOperacionalPorMes, totaisInvestimentosPorMes, totaisAportesPorMes, totaisSaidasFinanciamentoPorMes, } = params;
        const mesesSet = new Set(meses);
        const defaultClassificacao = (tipo) => tipo === tipo_lancamento_enum_1.TipoLancamento.RECEITA
            ? classificacao_dre_enum_1.ClassificacaoDre.OPERACIONAL_RECEITA
            : classificacao_dre_enum_1.ClassificacaoDre.OPERACIONAL_DESPESA;
        const subtrairDoTotalizadorPorClassificacao = (classif, m, valor) => {
            var _a, _b, _c, _d, _e;
            const v = valor;
            switch (classif) {
                case classificacao_dre_enum_1.ClassificacaoDre.INVESTIMENTO:
                    totaisInvestimentosPorMes[m] = ((_a = totaisInvestimentosPorMes[m]) !== null && _a !== void 0 ? _a : 0) - v;
                    break;
                case classificacao_dre_enum_1.ClassificacaoDre.APORTE:
                    totaisAportesPorMes[m] = ((_b = totaisAportesPorMes[m]) !== null && _b !== void 0 ? _b : 0) - v;
                    break;
                case classificacao_dre_enum_1.ClassificacaoDre.SAIDA_FINANCIAMENTO:
                    totaisSaidasFinanciamentoPorMes[m] = ((_c = totaisSaidasFinanciamentoPorMes[m]) !== null && _c !== void 0 ? _c : 0) - v;
                    break;
                case classificacao_dre_enum_1.ClassificacaoDre.OPERACIONAL_RECEITA:
                    totaisReceitaOperacionalPorMes[m] = ((_d = totaisReceitaOperacionalPorMes[m]) !== null && _d !== void 0 ? _d : 0) - v;
                    break;
                case classificacao_dre_enum_1.ClassificacaoDre.OPERACIONAL_DESPESA:
                default:
                    totaisDespesaOperacionalPorMes[m] = ((_e = totaisDespesaOperacionalPorMes[m]) !== null && _e !== void 0 ? _e : 0) - v;
                    break;
            }
        };
        const qb = this.aporteRepository
            .createQueryBuilder('aporte')
            .innerJoinAndSelect('aporte.lancamento', 'lancamento')
            .leftJoinAndSelect('lancamento.categoria', 'categoria')
            .leftJoinAndSelect('lancamento.parcelas', 'parcela')
            .where('aporte.dataAporte >= :di', { di: dataInicioStr })
            .andWhere('aporte.dataAporte <= :df', { df: dataFimStr });
        if (idEmpresa != null) {
            qb.andWhere('lancamento.idClienteFornecedor = :idEmp', { idEmp: idEmpresa });
        }
        const aportes = await qb.getMany();
        for (const aporte of aportes) {
            const lanc = aporte.lancamento;
            if (!lanc || lanc.status === lancamento_entity_1.StatusLancamento.CANCELADO) {
                continue;
            }
            const vLinha = Math.abs(Number(aporte.valor));
            if (vLinha === 0) {
                continue;
            }
            const dataAporte = aporte.dataAporte instanceof Date ? aporte.dataAporte : new Date(aporte.dataAporte);
            const mesAporteKey = `${dataAporte.getMonth() + 1}/${dataAporte.getFullYear()}`;
            if (!mesesSet.has(mesAporteKey)) {
                continue;
            }
            const cat = lanc.categoria;
            const classif = (_a = cat === null || cat === void 0 ? void 0 : cat.classificacaoDre) !== null && _a !== void 0 ? _a : defaultClassificacao(lanc.tipo);
            if (regime === 'caixa') {
                const parcelas = (_b = lanc.parcelas) !== null && _b !== void 0 ? _b : [];
                const pagas = parcelas.filter((p) => p.dataPagamento != null);
                for (const p of pagas) {
                    const dp = p.dataPagamento instanceof Date ? p.dataPagamento : new Date(p.dataPagamento);
                    const mesPagKey = `${dp.getMonth() + 1}/${dp.getFullYear()}`;
                    if (!mesesSet.has(mesPagKey)) {
                        continue;
                    }
                    const vp = Math.abs(Number((_d = (_c = p.valorPago) !== null && _c !== void 0 ? _c : p.valor) !== null && _d !== void 0 ? _d : 0));
                    if (vp === 0) {
                        continue;
                    }
                    subtrairDoTotalizadorPorClassificacao(classif, mesPagKey, vp);
                }
            }
            totaisAportesPorMes[mesAporteKey] = ((_e = totaisAportesPorMes[mesAporteKey]) !== null && _e !== void 0 ? _e : 0) + vLinha;
        }
    }
    async montarTotaisReceitaFaturasPorMes(meses, regime, idEmpresa) {
        var _a, _b, _c;
        const out = {};
        for (const m of meses) {
            out[m] = 0;
        }
        if (regime === 'competencia') {
            for (const mesAno of meses) {
                const partes = mesAno.split('/');
                const mesCol = Number(partes[0]);
                const anoCol = Number(partes[1]);
                const ultimoDia = new Date(anoCol, mesCol, 0).getDate();
                const primeiroDiaMes = `${anoCol}-${String(mesCol).padStart(2, '0')}-01`;
                const ultimoDiaMes = `${anoCol}-${String(mesCol).padStart(2, '0')}-${String(ultimoDia).padStart(2, '0')}`;
                const qb = this.faturaRepository
                    .createQueryBuilder('fatura')
                    .select('COALESCE(SUM(fatura.valorTotal), 0)', 'total')
                    .where('fatura.status != :fatCancel', { fatCancel: fatura_entity_1.StatusFatura.CANCELADA })
                    .andWhere('EXTRACT(YEAR FROM fatura.dataInicio) = :anoCol', { anoCol })
                    .andWhere('EXTRACT(MONTH FROM fatura.dataInicio) = :mesCol', { mesCol });
                if (idEmpresa != null) {
                    qb.andWhere('fatura.idEmpresa = :idEmpresa', { idEmpresa });
                }
                const r = await qb.getRawOne();
                out[mesAno] = Number((_a = r === null || r === void 0 ? void 0 : r.total) !== null && _a !== void 0 ? _a : 0);
            }
        }
        else {
            for (const mesAno of meses) {
                const partes = mesAno.split('/');
                const mesCol = Number(partes[0]);
                const anoCol = Number(partes[1]);
                const ultimoDia = new Date(anoCol, mesCol, 0).getDate();
                const primeiroDiaMes = `${anoCol}-${String(mesCol).padStart(2, '0')}-01`;
                const ultimoDiaMes = `${anoCol}-${String(mesCol).padStart(2, '0')}-${String(ultimoDia).padStart(2, '0')}`;
                const qb = this.parcelaRepository
                    .createQueryBuilder('parcela')
                    .innerJoin('parcela.lancamento', 'lancamento')
                    .select('COALESCE(SUM(parcela.valorPago), 0)', 'total')
                    .where('lancamento.idFatura IS NOT NULL')
                    .andWhere('lancamento.tipo = :receita', { receita: tipo_lancamento_enum_1.TipoLancamento.RECEITA })
                    .andWhere('parcela.dataPagamento IS NOT NULL')
                    .andWhere('DATE(parcela.dataPagamento) >= :p1', { p1: primeiroDiaMes })
                    .andWhere('DATE(parcela.dataPagamento) <= :p2', { p2: ultimoDiaMes })
                    .andWhere('lancamento.status != :cancelado', { cancelado: lancamento_entity_1.StatusLancamento.CANCELADO });
                if (idEmpresa != null) {
                    qb.andWhere('lancamento.idClienteFornecedor = :idEmpresa', { idEmpresa });
                }
                const r = await qb.getRawOne();
                let total = Number((_b = r === null || r === void 0 ? void 0 : r.total) !== null && _b !== void 0 ? _b : 0);
                const qbAcresc = this.movimentacaoRepository
                    .createQueryBuilder('mov')
                    .innerJoin(parcela_entity_1.Parcela, 'parcela', 'parcela.idParcela = mov.idParcelaOrigem')
                    .innerJoin('parcela.lancamento', 'lancamento')
                    .select('COALESCE(SUM(mov.valorAcrescimo), 0)', 'total')
                    .where('mov.idParcelaOrigem IS NOT NULL')
                    .andWhere('lancamento.idFatura IS NOT NULL')
                    .andWhere('lancamento.tipo = :receita', { receita: tipo_lancamento_enum_1.TipoLancamento.RECEITA })
                    .andWhere('DATE(mov.dataMovimentacao) >= :p1', { p1: primeiroDiaMes })
                    .andWhere('DATE(mov.dataMovimentacao) <= :p2', { p2: ultimoDiaMes })
                    .andWhere('lancamento.status != :cancelado', { cancelado: lancamento_entity_1.StatusLancamento.CANCELADO });
                if (idEmpresa != null) {
                    qbAcresc.andWhere('lancamento.idClienteFornecedor = :idEmpresa', { idEmpresa });
                }
                const r2 = await qbAcresc.getRawOne();
                total += Number((_c = r2 === null || r2 === void 0 ? void 0 : r2.total) !== null && _c !== void 0 ? _c : 0);
                out[mesAno] = total;
            }
        }
        return out;
    }
    remapMapaDrePorCategoriasExcluidas(mapa, idsValidos) {
        var _a;
        const out = new Map();
        for (const [key, val] of mapa) {
            const parts = key.split('_');
            if (parts.length < 3)
                continue;
            const mesAno = parts[parts.length - 1];
            const tipo = parts[parts.length - 2];
            const idPrefix = parts.slice(0, -2).join('_');
            let idCat = idPrefix === 'null' ? null : Number(idPrefix);
            if (idCat != null && !idsValidos.has(idCat)) {
                idCat = null;
            }
            const newKey = `${idCat !== null && idCat !== void 0 ? idCat : 'null'}_${tipo}_${mesAno}`;
            out.set(newKey, ((_a = out.get(newKey)) !== null && _a !== void 0 ? _a : 0) + val);
        }
        return out;
    }
    parsePeriodo(value) {
        const parts = value.trim().split('-');
        if (parts.length >= 2) {
            const ano = parseInt(parts[0], 10);
            const mes = parseInt(parts[1], 10);
            if (!isNaN(ano) && !isNaN(mes) && mes >= 1 && mes <= 12) {
                return [ano, mes];
            }
        }
        const d = new Date(value);
        if (!isNaN(d.getTime())) {
            return [d.getFullYear(), d.getMonth() + 1];
        }
        throw new common_1.BadRequestException(`Data/período inválido: ${value}. Use YYYY-MM ou YYYY-MM-DD.`);
    }
};
exports.FinanceiroService = FinanceiroService;
exports.FinanceiroService = FinanceiroService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(conta_entity_1.Conta)),
    __param(1, (0, typeorm_1.InjectRepository)(lancamento_entity_1.Lancamento)),
    __param(2, (0, typeorm_1.InjectRepository)(parcela_entity_1.Parcela)),
    __param(3, (0, typeorm_1.InjectRepository)(movimentacao_entity_1.Movimentacao)),
    __param(4, (0, typeorm_1.InjectRepository)(fatura_entity_1.Fatura)),
    __param(5, (0, typeorm_1.InjectRepository)(aporte_entity_1.Aporte)),
    __param(6, (0, typeorm_1.InjectRepository)(emprestimo_entity_1.Emprestimo)),
    __param(7, (0, typeorm_1.InjectRepository)(fornecedor_entity_1.Fornecedor)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource,
        ordemServico_service_1.OrdemServicoService,
        categoria_service_1.CategoriaService,
        classificacao_lancamento_service_1.ClassificacaoLancamentoService])
], FinanceiroService);
//# sourceMappingURL=financeiro.service.js.map
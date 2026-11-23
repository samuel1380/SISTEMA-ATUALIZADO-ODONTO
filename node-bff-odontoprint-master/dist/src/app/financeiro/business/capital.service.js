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
exports.CapitalService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const aporte_entity_1 = require("../domain/aporte.entity");
const emprestimo_entity_1 = require("../domain/emprestimo.entity");
const emprestimo_movimentacao_entity_1 = require("../domain/emprestimo-movimentacao.entity");
const financeiro_service_1 = require("./financeiro.service");
const tipo_lancamento_enum_1 = require("../domain/tipo-lancamento.enum");
const parcela_entity_1 = require("../domain/parcela.entity");
const socio_entity_1 = require("../domain/socio.entity");
const conta_entity_1 = require("../domain/conta.entity");
const movimentacao_entity_1 = require("../domain/movimentacao.entity");
let CapitalService = class CapitalService {
    constructor(aporteRepository, emprestimoRepository, emprestimoMovimentacaoRepository, socioRepository, contaRepository, movimentacaoRepository, financeiroService, dataSource) {
        this.aporteRepository = aporteRepository;
        this.emprestimoRepository = emprestimoRepository;
        this.emprestimoMovimentacaoRepository = emprestimoMovimentacaoRepository;
        this.socioRepository = socioRepository;
        this.contaRepository = contaRepository;
        this.movimentacaoRepository = movimentacaoRepository;
        this.financeiroService = financeiroService;
        this.dataSource = dataSource;
    }
    async registrarAporte(dto) {
        return this.dataSource.transaction(async (manager) => {
            const aporteRepo = manager.getRepository(aporte_entity_1.Aporte);
            const socioRepo = manager.getRepository(socio_entity_1.Socio);
            const contaRepo = manager.getRepository(conta_entity_1.Conta);
            const movRepo = manager.getRepository(movimentacao_entity_1.Movimentacao);
            let contaSocio = null;
            if (dto.idSocio) {
                const socio = await socioRepo.findOne({
                    where: { idSocio: dto.idSocio },
                    relations: ['conta'],
                });
                if (!socio) {
                    throw new common_1.NotFoundException(`Sócio com ID ${dto.idSocio} não encontrado.`);
                }
                if (socio.idConta) {
                    contaSocio = await contaRepo.findOneBy({ idConta: socio.idConta });
                    if (!contaSocio) {
                        throw new common_1.NotFoundException(`Conta do sócio com ID ${socio.idConta} não encontrada.`);
                    }
                }
            }
            const dataCompetencia = new Date(dto.dataAporte);
            const dataVencimento = new Date(dto.dataAporte);
            const tipoAporte = dto.tipo;
            const descricao = tipoAporte === aporte_entity_1.TipoAporte.APORTE_CAPITAL
                ? `Aporte de Capital - Sócio ID ${dto.idSocio || 'N/A'}`
                : `Distribuição de Lucros - Sócio ID ${dto.idSocio || 'N/A'}`;
            const lancamento = await this.financeiroService.criarLancamento({
                descricao,
                tipo: tipo_lancamento_enum_1.TipoLancamento.RECEITA,
                valorTotal: dto.valor,
                dataCompetencia: dataCompetencia.toISOString().split('T')[0],
                idCategoria: dto.idCategoria,
                idClienteFornecedor: dto.idSocio,
                parcelas: [
                    {
                        numeroParcela: 1,
                        valor: dto.valor,
                        dataVencimento: dataVencimento.toISOString().split('T')[0],
                        meioPagamento: dto.meioPagamento || parcela_entity_1.MeioPagamento.TRANSFERENCIA,
                    },
                ],
                pagamentoImediato: dto.idConta
                    ? {
                        idConta: dto.idConta,
                        dataPagamento: dto.dataAporte,
                    }
                    : undefined,
            });
            if (contaSocio && dto.idSocio) {
                const movimentacaoDebito = movRepo.create({
                    idConta: contaSocio.idConta,
                    tipo: movimentacao_entity_1.TipoMovimentacao.DEBITO,
                    valor: dto.valor,
                    valorAcrescimo: 0,
                    descricao: `Aporte registrado - ${descricao}`,
                    dataMovimentacao: new Date(dto.dataAporte),
                });
                await movRepo.save(movimentacaoDebito);
                contaSocio.saldoAtual = Number(contaSocio.saldoAtual) - Number(dto.valor);
                await contaRepo.save(contaSocio);
            }
            const aporte = aporteRepo.create({
                idLancamento: lancamento.idLancamento,
                idSocio: dto.idSocio,
                dataAporte: new Date(dto.dataAporte),
                valor: dto.valor,
                tipo: tipoAporte,
                observacoes: dto.observacoes,
            });
            return aporteRepo.save(aporte);
        });
    }
    async listarAportes(idSocio, dataInicio, dataFim, tipo) {
        const queryBuilder = this.aporteRepository
            .createQueryBuilder('aporte')
            .leftJoinAndSelect('aporte.lancamento', 'lancamento')
            .leftJoinAndSelect('aporte.socio', 'socio')
            .orderBy('aporte.dataAporte', 'DESC');
        if (idSocio) {
            queryBuilder.where('aporte.idSocio = :idSocio', { idSocio });
        }
        if (dataInicio) {
            queryBuilder.andWhere('aporte.dataAporte >= :dataInicio', { dataInicio });
        }
        if (dataFim) {
            queryBuilder.andWhere('aporte.dataAporte <= :dataFim', { dataFim });
        }
        if (tipo) {
            queryBuilder.andWhere('aporte.tipo = :tipo', { tipo });
        }
        return queryBuilder.getMany();
    }
    async registrarEmprestimo(dto) {
        const tipoEmprestimo = dto.tipo;
        const descricao = tipoEmprestimo === emprestimo_entity_1.TipoEmprestimo.RECEBIDO
            ? `Empréstimo Recebido`
            : `Empréstimo Concedido`;
        const dataCompetencia = new Date(dto.dataContratacao);
        const dataVencimento = dto.dataVencimento ? new Date(dto.dataVencimento) : new Date(dto.dataContratacao);
        const lancamento = await this.financeiroService.criarLancamento({
            descricao,
            tipo: tipoEmprestimo === emprestimo_entity_1.TipoEmprestimo.RECEBIDO ? tipo_lancamento_enum_1.TipoLancamento.RECEITA : tipo_lancamento_enum_1.TipoLancamento.DESPESA,
            valorTotal: dto.valorPrincipal,
            dataCompetencia: dataCompetencia.toISOString().split('T')[0],
            idCategoria: dto.idCategoria,
            idClienteFornecedor: dto.idCredorDevedor,
            parcelas: [
                {
                    numeroParcela: 1,
                    valor: dto.valorPrincipal,
                    dataVencimento: dataVencimento.toISOString().split('T')[0],
                    meioPagamento: dto.meioPagamento || parcela_entity_1.MeioPagamento.TRANSFERENCIA,
                },
            ],
            pagamentoImediato: dto.idConta
                ? {
                    idConta: dto.idConta,
                    dataPagamento: dto.dataContratacao,
                }
                : undefined,
        });
        const emprestimo = this.emprestimoRepository.create({
            idLancamento: lancamento.idLancamento,
            tipo: tipoEmprestimo,
            valorPrincipal: dto.valorPrincipal,
            saldoRestante: dto.valorPrincipal,
            taxaJuros: dto.taxaJuros,
            dataContratacao: new Date(dto.dataContratacao),
            dataVencimento: dto.dataVencimento ? new Date(dto.dataVencimento) : undefined,
            status: emprestimo_entity_1.StatusEmprestimo.ATIVO,
            idCredorDevedor: dto.idCredorDevedor,
            observacoes: dto.observacoes,
        });
        return this.emprestimoRepository.save(emprestimo);
    }
    async listarEmprestimos(tipo, status, dataInicio, dataFim) {
        const queryBuilder = this.emprestimoRepository
            .createQueryBuilder('emprestimo')
            .leftJoinAndSelect('emprestimo.lancamento', 'lancamento')
            .leftJoinAndSelect('emprestimo.credor', 'credor')
            .orderBy('emprestimo.dataContratacao', 'DESC');
        if (tipo) {
            queryBuilder.where('emprestimo.tipo = :tipo', { tipo });
        }
        if (status) {
            queryBuilder.andWhere('emprestimo.status = :status', { status });
        }
        if (dataInicio) {
            queryBuilder.andWhere('emprestimo.dataContratacao >= :dataInicio', { dataInicio });
        }
        if (dataFim) {
            queryBuilder.andWhere('emprestimo.dataContratacao <= :dataFim', { dataFim });
        }
        return queryBuilder.getMany();
    }
    async atualizarStatusEmprestimo(idEmprestimo, status) {
        const emprestimo = await this.emprestimoRepository.findOneBy({ idEmprestimo });
        if (!emprestimo) {
            throw new common_1.NotFoundException(`Empréstimo com ID ${idEmprestimo} não encontrado.`);
        }
        emprestimo.status = status;
        return this.emprestimoRepository.save(emprestimo);
    }
    async registrarJurosEmprestimo(idEmprestimo, dto) {
        const emprestimo = await this.emprestimoRepository.findOneBy({ idEmprestimo });
        if (!emprestimo) {
            throw new common_1.NotFoundException(`Empréstimo com ID ${idEmprestimo} não encontrado.`);
        }
        const movimentacao = this.emprestimoMovimentacaoRepository.create({
            idEmprestimo,
            idLancamento: null,
            valor: dto.valor,
            dataMovimentacao: new Date(dto.dataCompetencia),
            tipoMovimentacao: 'JUROS',
            observacoes: dto.observacoes,
        });
        const saved = await this.emprestimoMovimentacaoRepository.save(movimentacao);
        await this.recalcularSaldoEmprestimo(idEmprestimo);
        return saved;
    }
    async registrarAcrescimoEmprestimo(idEmprestimo, dto) {
        const emprestimo = await this.emprestimoRepository.findOneBy({ idEmprestimo });
        if (!emprestimo) {
            throw new common_1.NotFoundException(`Empréstimo com ID ${idEmprestimo} não encontrado.`);
        }
        const tipoLancamento = emprestimo.tipo === emprestimo_entity_1.TipoEmprestimo.RECEBIDO ? tipo_lancamento_enum_1.TipoLancamento.RECEITA : tipo_lancamento_enum_1.TipoLancamento.DESPESA;
        const lancamento = await this.financeiroService.criarLancamento({
            descricao: `Acréscimo de Empréstimo #${idEmprestimo} - ${dto.observacoes || ''}`,
            tipo: tipoLancamento,
            valorTotal: dto.valor,
            dataCompetencia: dto.dataCompetencia,
            idCategoria: dto.idCategoria,
            idClienteFornecedor: emprestimo.idCredorDevedor,
            parcelas: [
                {
                    numeroParcela: 1,
                    valor: dto.valor,
                    dataVencimento: dto.dataCompetencia,
                    meioPagamento: parcela_entity_1.MeioPagamento.TRANSFERENCIA,
                },
            ],
            pagamentoImediato: dto.idConta ? {
                idConta: dto.idConta,
                dataPagamento: dto.dataCompetencia,
            } : undefined,
        });
        const movimentacao = this.emprestimoMovimentacaoRepository.create({
            idEmprestimo,
            idLancamento: lancamento.idLancamento,
            valor: dto.valor,
            dataMovimentacao: new Date(dto.dataCompetencia),
            tipoMovimentacao: 'ACRESCIMO',
            observacoes: dto.observacoes,
        });
        const saved = await this.emprestimoMovimentacaoRepository.save(movimentacao);
        await this.recalcularSaldoEmprestimo(idEmprestimo);
        return saved;
    }
    async registrarPagamentoEmprestimo(idEmprestimo, dto) {
        const emprestimo = await this.emprestimoRepository.findOneBy({ idEmprestimo });
        if (!emprestimo) {
            throw new common_1.NotFoundException(`Empréstimo com ID ${idEmprestimo} não encontrado.`);
        }
        const tipoLancamento = emprestimo.tipo === emprestimo_entity_1.TipoEmprestimo.RECEBIDO ? tipo_lancamento_enum_1.TipoLancamento.DESPESA : tipo_lancamento_enum_1.TipoLancamento.RECEITA;
        const lancamento = await this.financeiroService.criarLancamento({
            descricao: `Pagamento de Empréstimo #${idEmprestimo} - ${dto.observacoes || ''}`,
            tipo: tipoLancamento,
            valorTotal: dto.valor,
            dataCompetencia: dto.dataPagamento,
            idCategoria: dto.idCategoria,
            idClienteFornecedor: emprestimo.idCredorDevedor,
            parcelas: [
                {
                    numeroParcela: 1,
                    valor: dto.valor,
                    dataVencimento: dto.dataPagamento,
                    meioPagamento: dto.meioPagamento || parcela_entity_1.MeioPagamento.TRANSFERENCIA,
                },
            ],
            pagamentoImediato: {
                idConta: dto.idConta,
                dataPagamento: dto.dataPagamento,
            }
        });
        const movimentacao = this.emprestimoMovimentacaoRepository.create({
            idEmprestimo,
            idLancamento: lancamento.idLancamento,
            valor: dto.valor,
            dataMovimentacao: new Date(dto.dataPagamento),
            tipoMovimentacao: 'PAGAMENTO',
            observacoes: dto.observacoes,
        });
        const saved = await this.emprestimoMovimentacaoRepository.save(movimentacao);
        await this.recalcularSaldoEmprestimo(idEmprestimo);
        return saved;
    }
    async recalcularSaldoEmprestimo(idEmprestimo) {
        const emprestimo = await this.emprestimoRepository.findOneBy({ idEmprestimo });
        if (!emprestimo) {
            throw new common_1.NotFoundException(`Empréstimo com ID ${idEmprestimo} não encontrado.`);
        }
        const movimentacoes = await this.emprestimoMovimentacaoRepository.find({
            where: { idEmprestimo },
            order: { dataMovimentacao: 'ASC', idMovimentacao: 'ASC' }
        });
        let saldoCalculado = Number(emprestimo.valorPrincipal);
        for (const mov of movimentacoes) {
            if ((mov.tipoMovimentacao === 'ACRESCIMO' || mov.tipoMovimentacao === 'PAGAMENTO') && !mov.idLancamento) {
                const isEntrada = (mov.tipoMovimentacao === 'ACRESCIMO' && emprestimo.tipo === emprestimo_entity_1.TipoEmprestimo.RECEBIDO) ||
                    (mov.tipoMovimentacao === 'PAGAMENTO' && emprestimo.tipo === emprestimo_entity_1.TipoEmprestimo.CONCEDIDO);
                const tipoLancamento = isEntrada ? tipo_lancamento_enum_1.TipoLancamento.RECEITA : tipo_lancamento_enum_1.TipoLancamento.DESPESA;
                const dataFormatada = mov.dataMovimentacao instanceof Date ? mov.dataMovimentacao.toISOString().split('T')[0] : mov.dataMovimentacao;
                const contas = await this.financeiroService.listarContas();
                const contaFallback = contas.length > 0 ? contas[0].idConta : undefined;
                const lancamento = await this.financeiroService.criarLancamento({
                    descricao: `${mov.tipoMovimentacao === 'ACRESCIMO' ? 'Acréscimo' : 'Pagamento retroativo'} de Empréstimo #${idEmprestimo} - ${mov.observacoes || ''}`,
                    tipo: tipoLancamento,
                    valorTotal: mov.valor,
                    dataCompetencia: dataFormatada,
                    idClienteFornecedor: emprestimo.idCredorDevedor,
                    parcelas: [
                        {
                            numeroParcela: 1,
                            valor: mov.valor,
                            dataVencimento: dataFormatada,
                            meioPagamento: parcela_entity_1.MeioPagamento.TRANSFERENCIA,
                        },
                    ],
                    pagamentoImediato: contaFallback ? {
                        idConta: contaFallback,
                        dataPagamento: dataFormatada,
                    } : undefined,
                });
                mov.idLancamento = lancamento.idLancamento;
                await this.emprestimoMovimentacaoRepository.save(mov);
            }
            if (mov.tipoMovimentacao === 'JUROS') {
                const novoJuros = Number((saldoCalculado * 0.01).toFixed(2));
                if (Number(mov.valor) !== novoJuros) {
                    mov.valor = novoJuros;
                    await this.emprestimoMovimentacaoRepository.save(mov);
                }
                saldoCalculado += novoJuros;
            }
            else if (mov.tipoMovimentacao === 'ACRESCIMO') {
                saldoCalculado += Number(mov.valor);
            }
            else if (mov.tipoMovimentacao === 'PAGAMENTO') {
                saldoCalculado -= Number(mov.valor);
            }
        }
        saldoCalculado = Math.max(0, saldoCalculado);
        const saldoAnterior = Number(emprestimo.saldoRestante || 0);
        emprestimo.saldoRestante = saldoCalculado;
        if (emprestimo.saldoRestante < 0.01) {
            emprestimo.status = emprestimo_entity_1.StatusEmprestimo.QUITADO;
        }
        else if (emprestimo.status === emprestimo_entity_1.StatusEmprestimo.QUITADO && emprestimo.saldoRestante >= 0.01) {
            emprestimo.status = emprestimo_entity_1.StatusEmprestimo.ATIVO;
        }
        await this.emprestimoRepository.save(emprestimo);
        return {
            saldoAnterior,
            saldoNovo: saldoCalculado
        };
    }
    async listarMovimentacoesPagamentoEmprestimo(idEmprestimo) {
        const emp = await this.emprestimoRepository.findOneBy({ idEmprestimo });
        if (!emp) {
            throw new common_1.NotFoundException(`Empréstimo com ID ${idEmprestimo} não encontrado.`);
        }
        return this.emprestimoMovimentacaoRepository.find({
            where: { idEmprestimo },
            relations: ['lancamento'],
            order: { dataMovimentacao: 'DESC', idMovimentacao: 'DESC' },
        });
    }
};
exports.CapitalService = CapitalService;
exports.CapitalService = CapitalService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(aporte_entity_1.Aporte)),
    __param(1, (0, typeorm_1.InjectRepository)(emprestimo_entity_1.Emprestimo)),
    __param(2, (0, typeorm_1.InjectRepository)(emprestimo_movimentacao_entity_1.EmprestimoMovimentacao)),
    __param(3, (0, typeorm_1.InjectRepository)(socio_entity_1.Socio)),
    __param(4, (0, typeorm_1.InjectRepository)(conta_entity_1.Conta)),
    __param(5, (0, typeorm_1.InjectRepository)(movimentacao_entity_1.Movimentacao)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        financeiro_service_1.FinanceiroService,
        typeorm_2.DataSource])
], CapitalService);
//# sourceMappingURL=capital.service.js.map
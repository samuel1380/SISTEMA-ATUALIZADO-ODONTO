import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, FindManyOptions, Repository, Raw, In } from 'typeorm';
import { Conta, TipoConta } from '../domain/conta.entity';
import { Lancamento, StatusLancamento } from '../domain/lancamento.entity';
import { Movimentacao, TipoMovimentacao } from '../domain/movimentacao.entity';
import { MeioPagamento, Parcela, StatusParcela } from '../domain/parcela.entity';
import { CreateContaDto } from '../dto/create-conta.dto';
import { CreateLancamentoDto } from '../dto/create-lancamento.dto';
import { UpdateLancamentoDto } from '../dto/update-lancamento.dto';
import { PagarParcelaDto } from '../dto/pagar-parcela.dto';
import { CreateTransferenciaDto } from '../dto/create-transferencia.dto';
import { randomUUID } from 'crypto';
import { OrdemServicoService } from '@src/app/ordemServico/business/ordemServico.service';
import { TipoLancamento } from '../domain/tipo-lancamento.enum';
import { CategoriaService } from './categoria.service';
import { Categoria } from '../domain/categoria.entity';
import { Fatura, StatusFatura } from '../domain/fatura.entity';
import { parseCsvLancamentosHistorico } from '../utils/csv-lancamentos-historico.util';
import { ClassificacaoDre } from '../domain/classificacao-dre.enum';
import { ClassificacaoDespesa } from '../domain/classificacao-despesa.enum';
import { Aporte } from '../domain/aporte.entity';
import { Emprestimo, StatusEmprestimo, TipoEmprestimo } from '../domain/emprestimo.entity';
import { EmprestimoMovimentacao } from '../domain/emprestimo-movimentacao.entity';
import { Fornecedor } from '../domain/fornecedor.entity';
import { ClassificacaoLancamentoService } from './classificacao-lancamento.service';
import { extrairAnoMesDia, formatDataYYYYMMDD, parseDataParaDataLocal } from '../utils/data-financeiro.util';

/**
 * String `YYYY-MM-DD` como data local (meia-noite no fuso do servidor).
 * Evita o deslocamento de um dia de `new Date('YYYY-MM-DD')` (interpretado como UTC).
 */
function parseDataPagamentoParaDataLocal(dataPagamento: string): Date {
  return parseDataParaDataLocal(dataPagamento);
}

/** Data civil local em `YYYY-MM-DD` (sem UTC). Evita erro de mês/dia de `toISOString()` em fusos ≠ UTC. */
function formatDataLocalYYYYMMDD(d: Date | string): string {
  return formatDataYYYYMMDD(d);
}

interface ListarLancamentosParams {
  tipo?: TipoLancamento;
  mes?: number;
  ano?: number;
  idConta?: number;
  statusParcela?: StatusParcela;
  idCategoria?: number;
  idCategoriaPai?: number;
  filtroData?: 'competencia' | 'vencimento';
}

export interface DreParams {
  dataInicio: string;
  dataFim: string;
  regime: 'competencia' | 'caixa';
  idEmpresa?: number;
}

export interface DreLinha {
  tipo: TipoLancamento;
  idCategoria: number | null;
  nomeCategoria: string;
  idCategoriaPai: number | null;
  nivel: number;
  valoresPorMes: Record<string, number>;
  totalGeral: number;
}

export interface DreResponse {
  meses: string[];
  linhas: DreLinha[];
  /** Soma de todas as receitas (inclui faturas, outras categorias e sem categoria). */
  totaisReceitaPorMes: Record<string, number>;
  totaisDespesaPorMes: Record<string, number>;
  resultadoPorMes: Record<string, number>;
  /** Totais operacionais (exclui aportes/investimentos/saídas de financiamento). */
  totaisReceitaOperacionalPorMes: Record<string, number>;
  totaisDespesaOperacionalPorMes: Record<string, number>;
  resultadoOperacionalPorMes: Record<string, number>;
  totaisDespesaVariavelPorMes: Record<string, number>;
  margemContribuicaoPorMes: Record<string, number>;
  indiceContribuicaoPorMes: Record<string, number>;
  ebitdaPorMes: Record<string, number>;
  ebitdaAbsolutoPorMes: Record<string, number>;
  totaisDepreciacaoAmortizacaoPorMes: Record<string, number>;
  lucroOperacionalAjustadoPorMes?: Record<string, number>;
  ebitdaAjustadoPorMes?: Record<string, number>;
  totaisInvestimentosPorMes: Record<string, number>;
  totaisAportesPorMes: Record<string, number>;
  totaisSaidasFinanciamentoPorMes: Record<string, number>;
  resultadoPosInvestimentoPorMes: Record<string, number>;
  resultadoLiquidoPorMes: Record<string, number>;
  /**
   * Somente regime de caixa: saldo em aberto (`valor - valorPago`) por mês de **data de vencimento**,
   * apenas parcelas com status `VENCIDO`. Informativo — não entra no resultado líquido.
   */
  totaisParcelasVencidasPorMes?: Record<string, number>;
  /**
   * Agregação exclusiva de receitas vinculadas a faturas (`idFatura`), por mês do período.
   * Competência: vigência da fatura sobrepõe o mês; Caixa: pagamentos no mês.
   */
  totaisReceitaFaturasPorMes: Record<string, number>;
  /** Linha sintética para exibição no DRE (mesmos valores de `totaisReceitaFaturasPorMes`). */
  linhaReceitaFaturas: DreLinha;
}

@Injectable()
export class FinanceiroService {
  constructor(
    @InjectRepository(Conta)
    private readonly contaRepository: Repository<Conta>,
    @InjectRepository(Lancamento)
    private readonly lancamentoRepository: Repository<Lancamento>,
    @InjectRepository(Parcela)
    private readonly parcelaRepository: Repository<Parcela>,
    @InjectRepository(Movimentacao)
    private readonly movimentacaoRepository: Repository<Movimentacao>,
    @InjectRepository(Fatura)
    private readonly faturaRepository: Repository<Fatura>,
    @InjectRepository(Aporte)
    private readonly aporteRepository: Repository<Aporte>,
    @InjectRepository(Emprestimo)
    private readonly emprestimoRepository: Repository<Emprestimo>,
    @InjectRepository(Fornecedor)
    private readonly fornecedorRepository: Repository<Fornecedor>,
    private readonly dataSource: DataSource,
    private readonly ordemServicoService: OrdemServicoService,
    private readonly categoriaService: CategoriaService,
    private readonly classificacaoService: ClassificacaoLancamentoService,
  ) {}

  // =================================================================
  // GESTÃO DE CONTAS
  // =================================================================

  async criarConta(dto: CreateContaDto): Promise<Conta> {
    const conta = this.contaRepository.create({
      ...dto,
      saldoAtual: dto.saldoInicial,
    });
    return this.contaRepository.save(conta);
  }

  async listarContas(): Promise<Conta[]> {
    return this.contaRepository.find();
  }

  async buscarContaPorId(idConta: number): Promise<Conta> {
    const conta = await this.contaRepository.findOne({
      where: { idConta },
      relations: ['movimentacoes'],
    });
    if (!conta) {
      throw new NotFoundException(`Conta com ID ${idConta} não encontrada.`);
    }
    // Ordena movimentações por data (mais recente primeiro)
    if (conta.movimentacoes?.length) {
      conta.movimentacoes.sort(
        (a, b) => new Date(b.dataMovimentacao).getTime() - new Date(a.dataMovimentacao).getTime(),
      );
    }
    return conta;
  }

  // =================================================================
  // LANÇAMENTOS (PAGAR E RECEBER)
  // =================================================================

  async criarLancamento(dto: CreateLancamentoDto): Promise<Lancamento> {
    const valorParcelas = dto.parcelas.reduce((acc, p) => acc + p.valor, 0);
    if (Math.abs(valorParcelas - dto.valorTotal) > 0.01) {
      throw new BadRequestException('A soma das parcelas não corresponde ao valor total do lançamento.');
    }

    // Validação da Ordem de Serviço, se o ID for fornecido.
    if (dto.idOrdemServico) {
      const ordemServico = await this.ordemServicoService.buscarPorId(dto.idOrdemServico);
      if (!ordemServico) {
        throw new NotFoundException(`Ordem de Serviço com ID ${dto.idOrdemServico} não encontrada.`);
      }
    }

    if (dto.idEmprestimo != null) {
      if (dto.tipo !== TipoLancamento.DESPESA) {
        throw new BadRequestException('O vínculo com empréstimo só é permitido em despesas.');
      }
      if (!dto.idCategoria) {
        throw new BadRequestException('Selecione a categoria para pagamento vinculado ao empréstimo.');
      }
      const cat = await this.categoriaService.findOne(dto.idCategoria);
      if ((cat as any).classificacaoDre !== ClassificacaoDre.SAIDA_FINANCIAMENTO) {
        throw new BadRequestException(
          'Para vincular um empréstimo, a categoria deve ter classificação DRE "Saídas de financiamento/juros/empréstimos".',
        );
      }
      await this.validarEmprestimoParaPagamento(dto.idEmprestimo, dto.valorTotal);
    }

    if (dto.idEmprestimo != null) {
      return this.dataSource.transaction(async (manager) => {
        const lancamentoRepo = manager.getRepository(Lancamento);
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

        await this.registrarPagamentoEmprestimoComManager(
          manager,
          dto.idEmprestimo!,
          lancamentoSalvo.idLancamento,
          dto.valorTotal,
          dto.dataCompetencia,
        );

        return lancamentoRepo.findOne({
          where: { idLancamento: lancamentoSalvo.idLancamento },
          relations: ['parcelas'],
        });
      });
    }

    let dtoLancamento = dto;
    if (dtoLancamento.tipo === TipoLancamento.DESPESA && dtoLancamento.idFornecedor) {
      const fornecedor = await this.fornecedorRepository.findOne({
        where: { idFornecedor: dtoLancamento.idFornecedor },
        select: ['idFornecedor', 'idCategoria'],
      });
      if (fornecedor?.idCategoria != null) {
        dtoLancamento = { ...dtoLancamento, idCategoria: fornecedor.idCategoria };
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

  private montarEntidadeLancamentoParaPersistencia(
    dto: CreateLancamentoDto,
    repo: Repository<Lancamento>,
  ): Lancamento {
    const { idEmprestimo: _idEmp, ...campos } = dto;
    const totalParcelas = dto.parcelas.length;
    return repo.create({
      ...campos,
      totalParcelas,
      dataCompetencia: parseDataPagamentoParaDataLocal(dto.dataCompetencia),
      dataEmissao: dto.dataEmissao ? parseDataPagamentoParaDataLocal(dto.dataEmissao) : new Date(),
      idFornecedor: dto.idFornecedor ?? undefined,
      parcelas: dto.parcelas.map((p, idx) => ({
        ...p,
        // Se houver mais de 1 parcela, adiciona sufixo X/N à descrição (via dadosAdicionais ou direto no lançamento)
        dataVencimento: parseDataPagamentoParaDataLocal(p.dataVencimento),
      })),
      // Removemos o sufixo hardcoded de parcelas, a formatação será feita no frontend
      descricao: dto.descricao,
    });
  }


  private async validarEmprestimoParaPagamento(idEmprestimo: number, valorPagamento: number): Promise<void> {
    const emp = await this.emprestimoRepository.findOne({ where: { idEmprestimo } });
    if (!emp) {
      throw new NotFoundException(`Empréstimo com ID ${idEmprestimo} não encontrado.`);
    }
    if (emp.tipo !== TipoEmprestimo.RECEBIDO) {
      throw new BadRequestException('Somente empréstimos recebidos podem ser abatidos por esta despesa.');
    }
    if (emp.status === StatusEmprestimo.CANCELADO) {
      throw new BadRequestException('Este empréstimo está cancelado.');
    }
    if (emp.status !== StatusEmprestimo.ATIVO) {
      throw new BadRequestException('Só é possível pagar empréstimos com status ATIVO.');
    }
    const saldo = Number(emp.saldoRestante ?? emp.valorPrincipal);
    if (valorPagamento > saldo + 0.01) {
      throw new BadRequestException(
        `O valor do lançamento (R$ ${valorPagamento.toFixed(2)}) não pode ser maior que o saldo devedor (R$ ${saldo.toFixed(2)}).`,
      );
    }
  }

  private async registrarPagamentoEmprestimoComManager(
    manager: EntityManager,
    idEmprestimo: number,
    idLancamento: number,
    valorTotal: number,
    dataCompetenciaIso: string,
  ): Promise<void> {
    const empRepo = manager.getRepository(Emprestimo);
    const movRepo = manager.getRepository(EmprestimoMovimentacao);

    const emprestimo = await empRepo.findOne({ where: { idEmprestimo } });
    if (!emprestimo) {
      throw new NotFoundException(`Empréstimo com ID ${idEmprestimo} não encontrado.`);
    }

    const saldo = Number(emprestimo.saldoRestante ?? emprestimo.valorPrincipal);
    const novoSaldo = Math.max(0, saldo - valorTotal);
    emprestimo.saldoRestante = novoSaldo;
    if (novoSaldo < 0.01) {
      emprestimo.status = StatusEmprestimo.QUITADO;
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

  /**
   * Importação temporária de histórico via CSV (dados antigos).
   * Formato preferido: data_lancamento, descricao, valor_credito, valor_debito (DD/MM/AA; crédito/débito vazio ou zero ignorados).
   * Formato legado: data, descrição, valor, tipo (C/crédito ou D/débito).
   */
  async importarLancamentosCsvHistorico(
    buffer: Buffer,
    idCategoriaReceita?: number,
    idCategoriaDespesa?: number,
    idConta?: number,
  ): Promise<{
    inseridos: number;
    inseridosCredito: number;
    inseridosDebito: number;
    erros: { linha?: number; mensagem: string }[];
  }> {
    const texto = buffer.toString('utf-8');
    const { linhas, errosParse } = parseCsvLancamentosHistorico(texto);

    const precisaReceita = linhas.some((l) => l.tipo === TipoLancamento.RECEITA);
    const precisaDespesa = linhas.some((l) => l.tipo === TipoLancamento.DESPESA);

    if (precisaReceita && (idCategoriaReceita == null || Number.isNaN(idCategoriaReceita))) {
      throw new BadRequestException('Selecione a categoria de RECEITA (há linhas de crédito no arquivo).');
    }
    if (precisaDespesa && (idCategoriaDespesa == null || Number.isNaN(idCategoriaDespesa))) {
      throw new BadRequestException('Selecione a categoria de DESPESA (há linhas de débito no arquivo).');
    }

    if (idCategoriaReceita != null) {
      const c = await this.categoriaService.findOne(idCategoriaReceita);
      if (c.tipo !== TipoLancamento.RECEITA) {
        throw new BadRequestException('A categoria de receita deve ser do tipo RECEITA.');
      }
    }
    if (idCategoriaDespesa != null) {
      const c = await this.categoriaService.findOne(idCategoriaDespesa);
      if (c.tipo !== TipoLancamento.DESPESA) {
        throw new BadRequestException('A categoria de despesa deve ser do tipo DESPESA.');
      }
    }

    if (idConta == null || Number.isNaN(idConta)) {
      throw new BadRequestException('Informe a conta para registrar o histórico como já pago (movimentação na conta).');
    }
    const contaExiste = await this.contaRepository.findOne({ where: { idConta } });
    if (!contaExiste) {
      throw new NotFoundException(`Conta com ID ${idConta} não encontrada.`);
    }

    const erros: { linha?: number; mensagem: string }[] = [...errosParse];
    let inseridos = 0;
    let inseridosCredito = 0;
    let inseridosDebito = 0;

    for (const linha of linhas) {
      const idCategoria =
        linha.tipo === TipoLancamento.RECEITA ? idCategoriaReceita! : idCategoriaDespesa!;
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
              meioPagamento: MeioPagamento.TRANSFERENCIA,
              gerarJuros: true,
            },
          ],
          pagamentoImediato: {
            idConta,
            dataPagamento: linha.dataIso,
          },
        });

        // Após criação, tentar classificar por fornecedor (via nome na descrição) para despesas
        if (linha.tipo === TipoLancamento.DESPESA) {
          const lancamentoCriado = await this.lancamentoRepository.findOne({
            where: {
              descricao: linha.descricao.trim(),
              tipo: TipoLancamento.DESPESA,
            },
            order: { idLancamento: 'DESC' },
          });
          if (lancamentoCriado) {
            const classificacao = await this.classificacaoService.classificarLancamento(lancamentoCriado);
            if (classificacao) {
              const updateData: any = {};
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
        if (linha.tipo === TipoLancamento.RECEITA) inseridosCredito++;
        else inseridosDebito++;
      } catch (e: any) {
        erros.push({
          linha: linha.linhaNumero,
          mensagem: e?.message || String(e),
        });
      }
    }

    return { inseridos, inseridosCredito, inseridosDebito, erros };
  }

  async listarLancamentos(params: ListarLancamentosParams): Promise<Lancamento[]> {
    // Quando idConta é informado, usa QueryBuilder para filtrar por conta (parcelas com movimentação na conta).
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
        } else {
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
      // Garante que só ficam as parcelas que realmente pertencem à conta e respeitam filtros (a join pode trazer “sobras”).
      for (const l of lancamentos) {
        l.parcelas = (l.parcelas || []).filter((p) => {
          const mov = p.movimentacao as any;
          if (!mov || mov.idConta !== params.idConta) return false;
          if (params.mes != null && params.ano != null) {
            const filtroAno = Number(params.ano);
            const filtroMes = Number(params.mes);
            if (params.filtroData === 'competencia') {
              const comp = extrairAnoMesDia(l.dataCompetencia);
              if (!comp || comp.ano !== filtroAno || comp.mes !== filtroMes) return false;
            } else {
              const venc = extrairAnoMesDia(p.dataVencimento);
              if (!venc || venc.ano !== filtroAno || venc.mes !== filtroMes) return false;
            }
          }
          if (params.statusParcela != null && p.status !== params.statusParcela) return false;
          return true;
        });
      }
      return lancamentos.filter((l) => (l.parcelas || []).length > 0);
    }

    const options: FindManyOptions<Lancamento> = {
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

    const where: any = {};

    if (params.tipo) {
      where.tipo = params.tipo;
    }

    if (params.idCategoria != null) {
      where.idCategoria = params.idCategoria;
    }

    if (params.mes && params.ano) {
      if (params.filtroData === 'competencia') {
        where.dataCompetencia = Raw(alias => `EXTRACT(YEAR FROM ${alias}) = :ano AND EXTRACT(MONTH FROM ${alias}) = :mes`, {
          ano: params.ano,
          mes: params.mes,
        });
      } else {
        where.parcelas = {
          dataVencimento: Raw(alias => `EXTRACT(YEAR FROM ${alias}) = :ano AND EXTRACT(MONTH FROM ${alias}) = :mes`, {
            ano: params.ano,
            mes: params.mes,
          }),
        };
      }
    }

    options.where = where;

    const lancamentos = await this.lancamentoRepository.find(options);

    // Aplica filtros que não ficam bem expressos no find() com relations (statusParcela e categoriaPai),
    // além de “enxugar” parcelas para refletir exatamente o que a tela está listando.
    const out: Lancamento[] = [];
    for (const l of lancamentos) {
      if (params.idCategoriaPai != null && params.idCategoria == null) {
        const idCat = (l.categoria as any)?.idCategoria ? Number((l.categoria as any).idCategoria) : null;
        const idPai = (l.categoria as any)?.idCategoriaPai ? Number((l.categoria as any).idCategoriaPai) : null;
        const filtroPai = Number(params.idCategoriaPai);
        if (idCat !== filtroPai && idPai !== filtroPai) continue;
      }
      let parcelas = l.parcelas || [];
      if (params.mes != null && params.ano != null) {
        const filtroAno = Number(params.ano);
        const filtroMes = Number(params.mes);
        if (params.filtroData === 'competencia') {
          const comp = extrairAnoMesDia(l.dataCompetencia);
          if (!comp || comp.ano !== filtroAno || comp.mes !== filtroMes) {
            continue;
          }
        } else {
          parcelas = parcelas.filter((p) => {
            const venc = extrairAnoMesDia(p.dataVencimento);
            return venc != null && venc.ano === filtroAno && venc.mes === filtroMes;
          });
        }
      }
      if (params.statusParcela != null) {
        parcelas = parcelas.filter((p) => p.status === params.statusParcela);
      }
      if (parcelas.length === 0) continue;
      l.parcelas = parcelas;
      out.push(l);
    }
    return out;
  }

  async listarLancamentosComTotais(params: ListarLancamentosParams): Promise<{
    dados: Lancamento[];
    totais: {
      valor: number;
    };
  }> {
    const dados = await this.listarLancamentos(params);
    let total = 0;
    for (const l of dados) {
      for (const p of l.parcelas || []) {
        total += Number(p.valor ?? 0);
      }
    }
    return {
      dados,
      totais: {
        valor: total,
      },
    };
  }

  async buscarLancamentoPorId(idLancamento: number): Promise<Lancamento> {
    const lancamento = await this.lancamentoRepository.findOne({
      where: { idLancamento },
      relations: ['parcelas', 'parcelas.movimentacao', 'categoria', 'fornecedor', 'clienteEmpresa'],
    });

    if (!lancamento) {
      throw new NotFoundException(`Lançamento com ID ${idLancamento} não encontrado.`);
    }

    const movRepo = this.dataSource.getRepository(Movimentacao);

    // Se o lançamento pertencer a uma fatura, devemos buscar as movimentações de TODOS os lançamentos vinculados a esta fatura.
    // Assim, pagamentos parciais feitos na fatura aparecerão no histórico.
    let idsParcelasRelevantes: number[] = [];
    if (lancamento.idFatura) {
      const lancamentosDaFatura = await this.lancamentoRepository.find({
        where: { idFatura: lancamento.idFatura },
        relations: ['parcelas'],
      });
      for (const l of lancamentosDaFatura) {
        idsParcelasRelevantes.push(...(l.parcelas || []).map((p) => p.idParcela));
      }
    }

    // Converte para plain object para garantir que campos extras (pagamentos) sejam serializados pelo NestJS
    const lancamentoPlain = JSON.parse(JSON.stringify(lancamento));

    for (const parcela of lancamentoPlain.parcelas) {
      const idsBusca = idsParcelasRelevantes.length > 0 
          ? Array.from(new Set([...idsParcelasRelevantes, parcela.idParcela]))
          : [parcela.idParcela];

      const pagamentos = await movRepo.find({
        where: { idParcelaOrigem: In(idsBusca) },
        order: { dataMovimentacao: 'ASC' }
      });
      parcela.pagamentos = pagamentos;
    }

    return lancamentoPlain;
  }

  async atualizarLancamento(idLancamento: number, dto: UpdateLancamentoDto): Promise<Lancamento> {
    return this.dataSource.transaction(async manager => {
      const lancamentoRepo = manager.getRepository(Lancamento);

      const lancamento = await lancamentoRepo.findOne({
        where: { idLancamento },
        relations: ['parcelas'],
      });

      if (!lancamento) {
        throw new NotFoundException(`Lançamento com ID ${idLancamento} não encontrado.`);
      }

      // Sanitização: só categoria + fornecedor (despesa) ou cliente (receita).
      //
      // Importante: `categoria` em Lancamento é eager: true. Se usarmos save() na entidade
      // carregada, o objeto antigo da relação pode sobrescrever o novo idCategoria no SQL.
      // Por isso persistimos com update() direto nas colunas.
      const patch: Partial<Pick<Lancamento, 'idCategoria' | 'idFornecedor' | 'idClienteFornecedor'>> =
        {};

      if (dto.idCategoria !== undefined) {
        patch.idCategoria = dto.idCategoria as number | null | undefined;
      }

      if (lancamento.tipo === TipoLancamento.DESPESA) {
        if (dto.idFornecedor !== undefined) {
          patch.idFornecedor = dto.idFornecedor as number | null | undefined;
        }
      } else if (lancamento.tipo === TipoLancamento.RECEITA) {
        if (dto.idClienteFornecedor !== undefined) {
          patch.idClienteFornecedor = dto.idClienteFornecedor as number | null | undefined;
        }
      }

      if (Object.keys(patch).length > 0) {
        await lancamentoRepo.update({ idLancamento }, patch);
      }

      return lancamentoRepo.findOne({
        where: { idLancamento },
        relations: ['parcelas', 'categoria'],
      }) as Promise<Lancamento>;
    });
  }

  async faturarOrdemServico(dto: CreateLancamentoDto): Promise<Lancamento> {
    if (dto.tipo !== TipoLancamento.RECEITA) {
        throw new BadRequestException('Faturamento de Ordem de Serviço deve ser do tipo RECEITA.');
    }
    if (!dto.idOrdemServico) {
        throw new BadRequestException('idOrdemServico é obrigatório para faturar uma Ordem de Serviço.');
    }
    
    const lancamentoExistente = await this.lancamentoRepository.findOneBy({ idOrdemServico: dto.idOrdemServico });
    if (lancamentoExistente) {
      throw new BadRequestException('Esta Ordem de Serviço já possui um lançamento financeiro.');
    }

    return this.criarLancamento(dto);
  }

  async cancelarParcela(idParcela: number): Promise<void> {
    return this.dataSource.transaction(async manager => {
      const parcelaRepo = manager.getRepository(Parcela);
      const lancamentoRepo = manager.getRepository(Lancamento);
      const movRepo = manager.getRepository(Movimentacao);
      const contaRepo = manager.getRepository(Conta);

      const parcela = await parcelaRepo.findOne({
        where: { idParcela },
        relations: ['lancamento', 'movimentacao'],
      });

      if (!parcela) {
        throw new NotFoundException(`Parcela com ID ${idParcela} não encontrada.`);
      }
      if (parcela.status === StatusParcela.CANCELADO) {
        throw new BadRequestException('Esta parcela já foi cancelada.');
      }

      const lancamento = parcela.lancamento;
      
      // Buscar todas as parcelas do lançamento para verificar status
      const todasParcelas = await parcelaRepo.find({
        where: { idLancamento: lancamento.idLancamento }
      });

      const totalParcelas = todasParcelas.length;
      const totalParcelasAtivas = todasParcelas.filter(p => p.status === StatusParcela.ABERTO).length;
      const temParcelasPagas = todasParcelas.some(p => p.status === StatusParcela.PAGO);

      // Regra 1: Se for 1/1 (única parcela), permitir cancelar
      if (totalParcelas === 1) {
        // Permitir cancelar mesmo sendo a única parcela
      }
      // Regra 2: Se houver parcelas pagas em lançamento com múltiplas parcelas, impedir cancelar ABERTAS
      else if (temParcelasPagas && parcela.status !== StatusParcela.PAGO) {
        throw new BadRequestException('Não é possível cancelar parcelas pendentes quando há pagamentos realizados. É necessário fazer o estorno dos pagamentos primeiro.');
      }
      // Regra 3: Se for a última parcela ativa em lançamento com múltiplas parcelas (sem pagamentos), impedir
      else if (totalParcelasAtivas <= 1 && parcela.status !== StatusParcela.PAGO) {
        throw new BadRequestException('Não é possível cancelar a última parcela de um lançamento. Remova o lançamento inteiro.');
      }

      // Caso 1: A parcela já foi paga, é preciso estornar (todas as movimentações ligadas à parcela).
      if (parcela.status === StatusParcela.PAGO) {
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

          const acrescimoOrig = Number(movOriginal.valorAcrescimo ?? 0);
          const totalEstorno = Number(movOriginal.valor) + acrescimoOrig;

          const tipoEstorno = movOriginal.tipo === TipoMovimentacao.CREDITO ? TipoMovimentacao.DEBITO : TipoMovimentacao.CREDITO;
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

          const saldoAtualNum = Number(conta.saldoAtual ?? 0);
          const novoSaldo =
            tipoEstorno === TipoMovimentacao.CREDITO
              ? saldoAtualNum + totalEstorno
              : saldoAtualNum - totalEstorno;
          await contaRepo.update(
            { idConta: conta.idConta },
            { saldoAtual: novoSaldo, dataAlteracao: new Date() }
          );
        }
      }

      // 2. Atualiza a parcela para o status CANCELADO
      parcela.status = StatusParcela.CANCELADO;
      parcela.dataPagamento = null;
      parcela.movimentacao = null;
      await parcelaRepo.save(parcela);

      // Recarrega o lançamento para garantir que estamos trabalhando com os dados mais recentes
      // e evitar sobrescrever status alterado por outra operação.
      const lancamentoAtualizado = await lancamentoRepo.findOne({
        where: { idLancamento: lancamento.idLancamento },
      });

      // 3. Ajusta o lançamento pai
      lancamentoAtualizado.valorTotal = Number(lancamentoAtualizado.valorTotal) - Number(parcela.valor);
      // O total de parcelas não muda, apenas o status dela.

      // 4. Reavalia o status do lançamento
      const parcelasRestantes = await parcelaRepo.find({ where: { idLancamento: lancamentoAtualizado.idLancamento } });
      const parcelasPagas = parcelasRestantes.filter(p => p.status === StatusParcela.PAGO).length;
      const parcelasAbertas = parcelasRestantes.filter(p => p.status === StatusParcela.ABERTO).length;

      if (parcelasAbertas === 0 && parcelasPagas === 0) {
        lancamento.status = StatusLancamento.CANCELADO;
      } else if (parcelasAbertas === 0) {
        lancamentoAtualizado.status = StatusLancamento.PAGO;
      } else if (parcelasPagas > 0) {
        lancamentoAtualizado.status = StatusLancamento.PARCIALMENTE_PAGO;
      } else {
        lancamentoAtualizado.status = StatusLancamento.PENDENTE;
      }

      await lancamentoRepo.save(lancamentoAtualizado);
    });
  }

  // =================================================================
  // PAGAMENTOS E TRANSFERÊNCIAS
  // =================================================================

  async pagarParcela(idParcela: number, dto: PagarParcelaDto): Promise<Parcela> {
    return this.dataSource.transaction(async (manager) =>
      this.executarPagamentoParcela(manager, idParcela, dto),
    );
  }

  private async executarPagamentoParcela(
    manager: EntityManager,
    idParcela: number,
    dto: PagarParcelaDto,
  ): Promise<Parcela> {
    const parcelaRepo = manager.getRepository(Parcela);
    const contaRepo = manager.getRepository(Conta);
    const movRepo = manager.getRepository(Movimentacao);
    const lancamentoRepo = manager.getRepository(Lancamento);

    let parcela = await parcelaRepo.findOne({
      where: { idParcela },
      relations: ['lancamento'],
    });
    if (!parcela) throw new NotFoundException(`Parcela com ID ${idParcela} não encontrada.`);
    if (parcela.status === StatusParcela.PAGO) throw new BadRequestException('Esta parcela já foi paga.');
    if (parcela.status === StatusParcela.CANCELADO) throw new BadRequestException('Não é possível pagar uma parcela cancelada.');

    const valorRestante = Number(parcela.valor) - Number(parcela.valorPago);
    if (dto.valor > valorRestante + 0.001) {
      throw new BadRequestException(`O valor a pagar (R$ ${dto.valor}) não pode ser maior que o valor restante (R$ ${valorRestante}).`);
    }

    const conta = await contaRepo.findOneBy({ idConta: dto.idConta });
    if (!conta) throw new NotFoundException(`Conta com ID ${dto.idConta} não encontrada.`);

    const tipoMovimentacao = parcela.lancamento.tipo === TipoLancamento.RECEITA ? TipoMovimentacao.CREDITO : TipoMovimentacao.DEBITO;
    const valorPagamento = dto.valor;
    const acrescimo =
      parcela.lancamento.tipo === TipoLancamento.RECEITA ? Math.max(0, Number(dto.acrescimo ?? 0)) : 0;
    const totalEfeitoCaixa = Number(valorPagamento) + acrescimo;

    if (dto.meioPagamento) {
      await parcelaRepo.update(
        { idLancamento: parcela.idLancamento, status: StatusParcela.ABERTO },
        { meioPagamento: dto.meioPagamento },
      );

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

    if (tipoMovimentacao === TipoMovimentacao.CREDITO) {
      conta.saldoAtual = Number(conta.saldoAtual) + totalEfeitoCaixa;
    } else {
      conta.saldoAtual = Number(conta.saldoAtual) - totalEfeitoCaixa;
    }
    await contaRepo.save(conta);

    parcela.valorPago = Number(parcela.valorPago) + Number(valorPagamento);

    if (parcela.lancamento.tipo === TipoLancamento.RECEITA && acrescimo > 0) {
      parcela.valorAcrescimoAcumulado =
        Number(parcela.valorAcrescimoAcumulado ?? 0) + acrescimo;
    }

    const novoValorRestante = Number(parcela.valor) - parcela.valorPago;

    if (novoValorRestante < 0.01) {
      parcela.status = StatusParcela.PAGO;
      parcela.dataPagamento = parseDataPagamentoParaDataLocal(dto.dataPagamento);
    }

    await parcelaRepo.save(parcela);

    if (parcela.status === StatusParcela.PAGO) {
      const lancamento = await lancamentoRepo.findOneBy({ idLancamento: parcela.idLancamento });

      const parcelasNaoPagas = await parcelaRepo.count({
        where: { idLancamento: lancamento!.idLancamento, status: StatusParcela.ABERTO },
      });

      if (parcelasNaoPagas === 0) {
        lancamento!.status = StatusLancamento.PAGO;
      } else {
        lancamento!.status = StatusLancamento.PARCIALMENTE_PAGO;
      }

      await lancamentoRepo.save(lancamento!);
    }

    return parcela;
  }

  async transferirEntreContas(dto: CreateTransferenciaDto): Promise<void> {
    if (dto.idContaOrigem === dto.idContaDestino) {
        throw new BadRequestException('Conta de origem e destino não podem ser a mesma.');
    }

    return this.dataSource.transaction(async manager => {
        const contaRepo = manager.getRepository(Conta);
        const movRepo = manager.getRepository(Movimentacao);

        const contaOrigem = await contaRepo.findOneBy({ idConta: dto.idContaOrigem });
        if (!contaOrigem) throw new NotFoundException(`Conta de origem com ID ${dto.idContaOrigem} não encontrada.`);

        const contaDestino = await contaRepo.findOneBy({ idConta: dto.idContaDestino });
        if (!contaDestino) throw new NotFoundException(`Conta de destino com ID ${dto.idContaDestino} não encontrada.`);

        const idAgrupador = randomUUID();
        const dataTransferencia = new Date(dto.dataTransferencia);

        // 1. Débito na origem
        const debito = movRepo.create({
            idConta: contaOrigem.idConta,
            tipo: TipoMovimentacao.DEBITO,
            valor: dto.valor,
            valorAcrescimo: 0,
            descricao: `Transferência para a conta: ${contaDestino.nome}`,
            dataMovimentacao: dataTransferencia,
            idAgrupadorTransferencia: idAgrupador,
        });
        await movRepo.save(debito);
        contaOrigem.saldoAtual = Number(contaOrigem.saldoAtual) - dto.valor;
        await contaRepo.save(contaOrigem);

        // 2. Crédito no destino
        const credito = movRepo.create({
            idConta: contaDestino.idConta,
            tipo: TipoMovimentacao.CREDITO,
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

  // =================================================================
  // CONSULTAS E RELATÓRIOS
  // =================================================================

  async consultarFluxoCaixa(dataInicio: string, dataFim: string) {
    const qb = this.parcelaRepository.createQueryBuilder('parcela')
      .leftJoin('parcela.lancamento', 'lancamento')
      .select('parcela.dataVencimento', 'dataVencimento')
      .addSelect('lancamento.tipo', 'tipo')
      .addSelect('SUM(parcela.valor)', 'total')
      .where('parcela.status = :status', { status: StatusParcela.ABERTO })
      .andWhere('parcela.dataVencimento BETWEEN :dataInicio AND :dataFim', { dataInicio, dataFim })
      .groupBy('parcela.dataVencimento, lancamento.tipo')
      .orderBy('parcela.dataVencimento', 'ASC');

    return qb.getRawMany();
  }

  async criarCreditoDevolucao(lancamentoOrigem: Lancamento, valorCredito: number, idDevolucao: number): Promise<Lancamento> {
    if (lancamentoOrigem.tipo !== TipoLancamento.RECEITA) {
      throw new BadRequestException('Crédito de devolução só pode ser aplicado a lançamentos de receita.');
    }

    const dataHoje = new Date().toISOString().split('T')[0];

    return this.criarLancamento({
      descricao: `Crédito por devolução (Devolução ID: ${idDevolucao}) referente ao Lançamento #${lancamentoOrigem.idLancamento}`,
      tipo: TipoLancamento.DESPESA, // Um crédito para o cliente é uma "despesa" para a empresa
      valorTotal: valorCredito,
      dataCompetencia: dataHoje,
      idClienteFornecedor: lancamentoOrigem.idClienteFornecedor,
      idFatura: lancamentoOrigem.idFatura,
      parcelas: [{
        numeroParcela: 1,
        valor: valorCredito,
        dataVencimento: dataHoje,
        meioPagamento: MeioPagamento.CREDITO_INTERNO, // Novo meio de pagamento para identificar
      }],
    });
  }

  // =================================================================
  // DASHBOARD E RELATÓRIOS
  // =================================================================

  async obterDashboardFinanceiro(idEmpresa?: number, mes?: number, ano?: number): Promise<{
    saldoTotal: number;
    receitasMes: number;
    despesasMes: number;
    dividasPendentes: number;
    receitasPendentes: number;
    movimentacoesRecentes: any[];
  }> {
    const hoje = new Date();
    const mesAtual = mes || hoje.getMonth() + 1;
    const anoAtual = ano || hoje.getFullYear();

    // Saldo total de todas as contas
    const contas = await this.contaRepository.find();
    const saldoTotal = contas.reduce((acc, conta) => acc + Number(conta.saldoAtual), 0);

    // Receitas e despesas do mês
    const lancamentosMes = await this.listarLancamentos({ mes: mesAtual, ano: anoAtual });
    let receitasMes = 0;
    let despesasMes = 0;

    for (const lancamento of lancamentosMes) {
      const valorPago = lancamento.parcelas.reduce((acc, p) => {
        let v = Number(p.valorPago);
        if (lancamento.tipo === TipoLancamento.RECEITA) {
          v += Number(p.valorAcrescimoAcumulado ?? 0);
        }
        return acc + v;
      }, 0);
      if (lancamento.tipo === TipoLancamento.RECEITA) {
        receitasMes += valorPago;
      } else {
        despesasMes += valorPago;
      }
    }

    // Dívidas pendentes (parcelas em aberto)
    const dividas = await this.listarDividas(idEmpresa);
    const dividasPendentes = dividas.reduce((acc, d) => acc + d.valorRestante, 0);

    // Receitas pendentes (parcelas de receita em aberto)
    const receitasPendentes = dividas
      .filter((d) => d.tipo === TipoLancamento.RECEITA)
      .reduce((acc, d) => acc + d.valorRestante, 0);

    // Movimentações recentes (últimas 10)
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
      movimentacoesRecentes: movimentacoesRecentes.map((m) => ({
        idMovimentacao: m.idMovimentacao,
        tipo: m.tipo,
        valor: Number(m.valor),
        descricao: m.descricao,
        dataMovimentacao: m.dataMovimentacao,
        conta: m.conta?.nome,
      })),
    };
  }

  async listarDividas(idEmpresa?: number): Promise<Array<{
    idParcela: number;
    idLancamento: number;
    descricao: string;
    tipo: TipoLancamento;
    valor: number;
    valorPago: number;
    valorRestante: number;
    dataVencimento: Date;
    diasAtraso: number;
  }>> {
    const queryBuilder = this.parcelaRepository
      .createQueryBuilder('parcela')
      .innerJoinAndSelect('parcela.lancamento', 'lancamento')
      .where('parcela.status IN (:...statuses)', {
        statuses: [StatusParcela.ABERTO, StatusParcela.VENCIDO],
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

  async calcularFluxoCaixa(idEmpresa?: number, dias: number = 30): Promise<Array<{
    data: string;
    receitas: number;
    despesas: number;
    saldo: number;
  }>> {
    const hoje = new Date();
    const dataFim = new Date(hoje);
    dataFim.setDate(hoje.getDate() + dias);

    const queryBuilder = this.parcelaRepository
      .createQueryBuilder('parcela')
      .innerJoin('parcela.lancamento', 'lancamento')
      .where('parcela.status IN (:...statuses)', {
        statuses: [StatusParcela.ABERTO, StatusParcela.VENCIDO],
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

    // Agrupar por data
    const fluxoPorData: Map<string, { receitas: number; despesas: number }> = new Map();

    for (const parcela of parcelas) {
      const rawData = parcela.data as unknown;
      const data = rawData instanceof Date
        ? `${rawData.getFullYear()}-${String(rawData.getMonth() + 1).padStart(2, '0')}-${String(rawData.getDate()).padStart(2, '0')}`
        : String(rawData).split('T')[0];
      if (!fluxoPorData.has(data)) {
        fluxoPorData.set(data, { receitas: 0, despesas: 0 });
      }

      const valor = Number(parcela.valor);
      if (parcela.tipo === TipoLancamento.RECEITA) {
        fluxoPorData.get(data)!.receitas += valor;
      } else {
        fluxoPorData.get(data)!.despesas += valor;
      }
    }

    // Converter para array e calcular saldo acumulado
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

  async gerarDre(params: DreParams): Promise<DreResponse> {
    const { dataInicio, dataFim, regime, idEmpresa } = params;

    const [inicioAno, inicioMes] = this.parsePeriodo(dataInicio);
    const [fimAno, fimMes] = this.parsePeriodo(dataFim);
    if (!inicioAno || !fimAno || (fimAno < inicioAno) || (fimAno === inicioAno && fimMes < inicioMes)) {
      throw new BadRequestException('Período inválido. dataInicio deve ser anterior ou igual a dataFim.');
    }

    const meses: string[] = [];
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

    type MapKey = string;
    let mapaValores = new Map<MapKey, number>();

    if (regime === 'competencia') {
      // =============================================================
      // REGIME DE COMPETÊNCIA
      // - Receita: somente FATURAS (valorTotal) via `montarTotaisReceitaFaturasPorMes`
      // - Despesa: lançamentos (DESPESA) por `dataCompetencia` no período
      // =============================================================
      const qbDespesa = this.lancamentoRepository
        .createQueryBuilder('lancamento')
        .select('lancamento.idCategoria', 'idCategoria')
        .addSelect('lancamento.tipo', 'tipo')
        .addSelect('EXTRACT(YEAR FROM lancamento.dataCompetencia)', 'ano')
        .addSelect('EXTRACT(MONTH FROM lancamento.dataCompetencia)', 'mes')
        .addSelect('SUM(lancamento.valorTotal)', 'total')
        .where('lancamento.tipo = :despesa', { despesa: TipoLancamento.DESPESA })
        .andWhere('lancamento.status != :cancelado', { cancelado: StatusLancamento.CANCELADO })
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
        const key = `${idCat ?? 'null'}_${r.tipo}_${mesAno}`;
        const current = mapaValores.get(key) ?? 0;
        mapaValores.set(key, current + Number(r.total));
      }
    } else {
      // Caixa: um único agregado por movimentação — principal + juros/multa no mesmo mês da movimentação.
      // Filtra CREDITO em receita e DEBITO em despesa para não contar estornos (tipo invertido).
      const qbCaixa = this.movimentacaoRepository
        .createQueryBuilder('mov')
        .innerJoin(Parcela, 'parcela', 'parcela.idParcela = mov.idParcelaOrigem')
        .innerJoin('parcela.lancamento', 'lancamento')
        .select('lancamento.idCategoria', 'idCategoria')
        .addSelect('lancamento.tipo', 'tipo')
        .addSelect('EXTRACT(YEAR FROM mov.dataMovimentacao)', 'ano')
        .addSelect('EXTRACT(MONTH FROM mov.dataMovimentacao)', 'mes')
        .addSelect('SUM(COALESCE(mov.valor, 0) + COALESCE(mov.valorAcrescimo, 0))', 'total')
        .where('mov.idParcelaOrigem IS NOT NULL')
        .andWhere('DATE(mov.dataMovimentacao) >= :dataInicio', { dataInicio: dataInicioStr })
        .andWhere('DATE(mov.dataMovimentacao) <= :dataFim', { dataFim: dataFimStr })
        .andWhere('lancamento.status != :cancelado', { cancelado: StatusLancamento.CANCELADO })
        .andWhere('lancamento.idFatura IS NULL')
        .andWhere(
          '(lancamento.tipo = :receita AND mov.tipo = :credito) OR (lancamento.tipo = :despesa AND mov.tipo = :debito)',
          {
            receita: TipoLancamento.RECEITA,
            despesa: TipoLancamento.DESPESA,
            credito: TipoMovimentacao.CREDITO,
            debito: TipoMovimentacao.DEBITO,
          },
        )
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
        const key = `${idCat ?? 'null'}_${r.tipo}_${mesAno}`;
        const current = mapaValores.get(key) ?? 0;
        mapaValores.set(key, current + Number(r.total));
      }
    }

    let catDesconhecidoDespesa = categorias.find(c => c.nome.trim().toUpperCase() === 'DESCONHECIDO' && c.tipo === TipoLancamento.DESPESA);
    if (!catDesconhecidoDespesa) {
        catDesconhecidoDespesa = {
            idCategoria: -999,
            nome: 'DESCONHECIDO',
            tipo: TipoLancamento.DESPESA,
            classificacaoDre: ClassificacaoDre.OPERACIONAL_DESPESA,
        } as any;
        categorias.push(catDesconhecidoDespesa);
        idsCategoriasValidas.add(-999);
    }
    let catDesconhecidoReceita = categorias.find(c => c.nome.trim().toUpperCase() === 'DESCONHECIDO' && c.tipo === TipoLancamento.RECEITA);
    if (!catDesconhecidoReceita) {
        catDesconhecidoReceita = {
            idCategoria: -998,
            nome: 'DESCONHECIDO',
            tipo: TipoLancamento.RECEITA,
            classificacaoDre: ClassificacaoDre.OPERACIONAL_RECEITA,
        } as any;
        categorias.push(catDesconhecidoReceita);
        idsCategoriasValidas.add(-998);
    }
    
    mapaValores = this.remapMapaDrePorCategoriasExcluidas(mapaValores, idsCategoriasValidas);

    for (const key of Array.from(mapaValores.keys())) {
        if (key.startsWith('null_DESPESA_')) {
            const val = mapaValores.get(key)!;
            mapaValores.delete(key);
            const newKey = `${catDesconhecidoDespesa.idCategoria}_DESPESA_${key.split('_')[2]}`;
            mapaValores.set(newKey, (mapaValores.get(newKey) ?? 0) + val);
        } else if (key.startsWith('null_RECEITA_')) {
            const val = mapaValores.get(key)!;
            mapaValores.delete(key);
            const newKey = `${catDesconhecidoReceita.idCategoria}_RECEITA_${key.split('_')[2]}`;
            mapaValores.set(newKey, (mapaValores.get(newKey) ?? 0) + val);
        }
    }

    const categoriasParaExcluir = new Set(
      categorias
        .filter((c) =>
          c.nome.trim().toUpperCase() === 'PAGAMENTO DE FATURA'
        )
        .map((c) => c.idCategoria)
    );

    for (const key of Array.from(mapaValores.keys())) {
      const idStr = key.split('_')[0];
      if (idStr !== 'null' && categoriasParaExcluir.has(Number(idStr))) {
        mapaValores.delete(key);
      }
    }

    /** Não listar na tabela superior do DRE; valores seguem nos totalizadores (Investimentos / Saídas de financiamento…). */
    const excluirDaTabelaDemonstrativoDre = (c: Categoria): boolean =>
      c.classificacaoDre === ClassificacaoDre.SAIDA_FINANCIAMENTO ||
      c.classificacaoDre === ClassificacaoDre.INVESTIMENTO ||
      categoriasParaExcluir.has(c.idCategoria);

    const linhasOrdenadas: Array<{ cat: Categoria; nivel: number }> = [];
    const receitasPais = categorias
      .filter(
        (c) =>
          c.tipo === TipoLancamento.RECEITA &&
          c.idCategoriaPai == null &&
          !excluirDaTabelaDemonstrativoDre(c),
      )
      .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
    const despesasPais = categorias
      .filter(
        (c) =>
          c.tipo === TipoLancamento.DESPESA &&
          c.idCategoriaPai == null &&
          !excluirDaTabelaDemonstrativoDre(c),
      )
      .sort((a, b) => {
        const lowerA = a.nome.toLowerCase();
        const lowerB = b.nome.toLowerCase();
        const isAInsumos = lowerA.includes('insumo');
        const isBInsumos = lowerB.includes('insumo');
        const isAFolha = lowerA.includes('folha');
        const isBFolha = lowerB.includes('folha');
        
        const rankA = isAInsumos ? 1 : (isAFolha ? 2 : 3);
        const rankB = isBInsumos ? 1 : (isBFolha ? 2 : 3);
        
        if (rankA !== rankB) return rankA - rankB;
        return a.nome.localeCompare(b.nome, 'pt-BR');
      });
    for (const cat of receitasPais) {
      linhasOrdenadas.push({ cat, nivel: 0 });
      const subs = (cat.subcategorias || [])
        .filter(
          (s) =>
            s.idCategoriaPai === cat.idCategoria &&
            idsCategoriasValidas.has(s.idCategoria) &&
            s.tipo === cat.tipo &&
            !excluirDaTabelaDemonstrativoDre(s),
        )
        .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
      for (const sub of subs) {
        linhasOrdenadas.push({ cat: sub, nivel: 1 });
      }
    }
    for (const cat of despesasPais) {
      linhasOrdenadas.push({ cat, nivel: 0 });
      const subs = (cat.subcategorias || [])
        .filter(
          (s) =>
            s.idCategoriaPai === cat.idCategoria &&
            idsCategoriasValidas.has(s.idCategoria) &&
            s.tipo === cat.tipo &&
            !excluirDaTabelaDemonstrativoDre(s),
        )
        .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
      for (const sub of subs) {
        linhasOrdenadas.push({ cat: sub, nivel: 1 });
      }
    }

    const totaisReceitaPorMes: Record<string, number> = {};
    const totaisDespesaPorMes: Record<string, number> = {};
    const resultadoPorMes: Record<string, number> = {};
    const totaisReceitaOperacionalPorMes: Record<string, number> = {};
    const totaisDespesaOperacionalPorMes: Record<string, number> = {};
    const resultadoOperacionalPorMes: Record<string, number> = {};
    const totaisDespesaVariavelPorMes: Record<string, number> = {};
    const margemContribuicaoPorMes: Record<string, number> = {};
    const indiceContribuicaoPorMes: Record<string, number> = {};
    const totaisDepreciacaoAmortizacaoPorMes: Record<string, number> = {};
    const ebitdaPorMes: Record<string, number> = {};
    const ebitdaAbsolutoPorMes: Record<string, number> = {};
    const lucroOperacionalAjustadoPorMes: Record<string, number> = {};
    const ebitdaAjustadoPorMes: Record<string, number> = {};
    const totaisInvestimentosPorMes: Record<string, number> = {};
    const totaisAportesPorMes: Record<string, number> = {};
    const totaisSaidasFinanciamentoPorMes: Record<string, number> = {};
    const resultadoPosInvestimentoPorMes: Record<string, number> = {};
    const resultadoLiquidoPorMes: Record<string, number> = {};
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

    const linhas: DreLinha[] = [];

    for (const { cat, nivel } of linhasOrdenadas) {
      const valoresPorMes: Record<string, number> = {};
      let totalGeral = 0;
      for (const m of meses) {
        const key = `${cat.idCategoria}_${cat.tipo}_${m}`;
        const val = mapaValores.get(key) ?? 0;
        valoresPorMes[m] = val;
        totalGeral += val;
        if (cat.tipo === TipoLancamento.RECEITA) {
          totaisReceitaPorMes[m] += val;
        } else {
          totaisDespesaPorMes[m] += val;
          if (cat.classificacaoDespesa === ClassificacaoDespesa.VARIAVEL) {
            totaisDespesaVariavelPorMes[m] += val;
          }
        }
      }
      linhas.push({
        tipo: cat.tipo,
        idCategoria: cat.idCategoria,
        nomeCategoria: cat.nome,
        idCategoriaPai: cat.idCategoriaPai ?? null,
        nivel,
        valoresPorMes,
        totalGeral,
      });
    }

    // =============================================================
    // Totais por classificação DRE (por categoria, sem duplicar pai+filho)
    // =============================================================
    const defaultClassificacao = (tipo: TipoLancamento): ClassificacaoDre =>
      tipo === TipoLancamento.RECEITA
        ? ClassificacaoDre.OPERACIONAL_RECEITA
        : ClassificacaoDre.OPERACIONAL_DESPESA;

    for (const cat of categorias) {
      // `findAll(true)` pode retornar subcategorias também; todas devem contar 1x.
      if (!cat?.idCategoria) continue;
      const classif = (cat as any).classificacaoDre ?? defaultClassificacao(cat.tipo);
      for (const m of meses) {
        const key = `${cat.idCategoria}_${cat.tipo}_${m}`;
        const val = mapaValores.get(key) ?? 0;
        
        const catNameLower = cat.nome.toLowerCase();
        if (catNameLower.includes('deprecia') || catNameLower.includes('amortiza')) {
          totaisDepreciacaoAmortizacaoPorMes[m] += val;
        }

        switch (classif) {
          case ClassificacaoDre.INVESTIMENTO:
            totaisInvestimentosPorMes[m] += val;
            break;
          case ClassificacaoDre.APORTE:
            totaisAportesPorMes[m] += val;
            break;
          case ClassificacaoDre.SAIDA_FINANCIAMENTO:
            totaisSaidasFinanciamentoPorMes[m] += val;
            break;
          case ClassificacaoDre.OPERACIONAL_RECEITA:
            totaisReceitaOperacionalPorMes[m] += val;
            break;
          case ClassificacaoDre.OPERACIONAL_DESPESA:
          default:
            totaisDespesaOperacionalPorMes[m] += val;
            break;
        }
      }
    }

    const porIdCategoria = new Map<number, DreLinha>();
    for (const l of linhas) {
      if (l.idCategoria != null) {
        porIdCategoria.set(l.idCategoria, l);
      }
    }

    const somarFilhosNaLinhaPai = (pais: Categoria[]) => {
      for (const cat of pais) {
        const subs = (cat.subcategorias || []).filter(
          (s) =>
            s.idCategoriaPai === cat.idCategoria &&
            idsCategoriasValidas.has(s.idCategoria) &&
            s.tipo === cat.tipo &&
            !excluirDaTabelaDemonstrativoDre(s),
        );
        if (subs.length === 0) continue;
        const linhaPai = porIdCategoria.get(cat.idCategoria);
        if (!linhaPai) continue;
        for (const m of meses) {
          let somaFilhos = 0;
          for (const sub of subs) {
            const linhaSub = porIdCategoria.get(sub.idCategoria);
            if (linhaSub) {
              somaFilhos += linhaSub.valoresPorMes[m] ?? 0;
            }
          }
          linhaPai.valoresPorMes[m] = (linhaPai.valoresPorMes[m] ?? 0) + somaFilhos;
        }
        linhaPai.totalGeral = meses.reduce((acc, m) => acc + (linhaPai.valoresPorMes[m] ?? 0), 0);
      }
    };

    somarFilhosNaLinhaPai(receitasPais);
    somarFilhosNaLinhaPai(despesasPais);

    const totaisReceitaFaturasPorMes = await this.montarTotaisReceitaFaturasPorMes(
      meses,
      regime,
      idEmpresa,
    );
    let totalGeralReceitaFaturas = 0;
    for (const m of meses) {
      totalGeralReceitaFaturas += totaisReceitaFaturasPorMes[m] ?? 0;
    }
    const linhaReceitaFaturas: DreLinha = {
      tipo: TipoLancamento.RECEITA,
      idCategoria: null,
      nomeCategoria: regime === 'competencia' ? 'FATURAS' : 'Receita de faturas (caixa)',
      idCategoriaPai: null,
      nivel: 0,
      valoresPorMes: totaisReceitaFaturasPorMes,
      totalGeral: totalGeralReceitaFaturas,
    };

    const semCategoriaReceita: Record<string, number> = {};
    const semCategoriaDespesa: Record<string, number> = {};
    let totalSemCatReceita = 0;
    let totalSemCatDespesa = 0;
    for (const m of meses) {
      const keyR = `null_RECEITA_${m}`;
      const keyD = `null_DESPESA_${m}`;
      const vR = mapaValores.get(keyR) ?? 0;
      const vD = mapaValores.get(keyD) ?? 0;
      semCategoriaReceita[m] = vR;
      semCategoriaDespesa[m] = vD;
      totalSemCatReceita += vR;
      totalSemCatDespesa += vD;
      totaisReceitaPorMes[m] = (totaisReceitaPorMes[m] ?? 0) + vR;
      totaisDespesaPorMes[m] = (totaisDespesaPorMes[m] ?? 0) + vD;

      // Sem categoria entra como operacional por padrão (mantém resultado coerente)
      totaisReceitaOperacionalPorMes[m] = (totaisReceitaOperacionalPorMes[m] ?? 0) + vR;
      totaisDespesaOperacionalPorMes[m] = (totaisDespesaOperacionalPorMes[m] ?? 0) + vD;
    }

    // Aqui só chegamos no regime de caixa (competência retorna antecipadamente).
    const nomeReceitaSemCategoria = 'Sem categoria';

    const semCatReceitaEhFaturasCaixa =
      regime === 'caixa' &&
      totalSemCatReceita !== 0 &&
      meses.every((m) => (semCategoriaReceita[m] ?? 0) === (totaisReceitaFaturasPorMes[m] ?? 0));

    const linhasComSemCategoria: DreLinha[] = [];
    let inseriuSemCatReceita = false;
    for (const linha of linhas) {
      if (
        linha.tipo === TipoLancamento.DESPESA &&
        !inseriuSemCatReceita &&
        totalSemCatReceita !== 0 &&
        !semCatReceitaEhFaturasCaixa
      ) {
        linhasComSemCategoria.push({
          tipo: TipoLancamento.RECEITA,
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
        tipo: TipoLancamento.RECEITA,
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
        tipo: TipoLancamento.DESPESA,
        idCategoria: null,
        nomeCategoria: 'Sem categoria',
        idCategoriaPai: null,
        nivel: 0,
        valoresPorMes: semCategoriaDespesa,
        totalGeral: totalSemCatDespesa,
      });
    }

    // Regime de competência: receita total = somente faturas (valorTotal). Despesas continuam por lançamentos.
    if (regime === 'competencia') {
      for (const m of meses) {
        totaisReceitaPorMes[m] = totaisReceitaFaturasPorMes[m] ?? 0;
        // No operacional, a receita exibida deve seguir a mesma regra do DRE atual (somente faturas).
        totaisReceitaOperacionalPorMes[m] = totaisReceitaFaturasPorMes[m] ?? 0;
      }
    } else {
      // Regime de caixa: as faturas foram removidas do qbCaixa (idFatura IS NULL),
      // então precisamos adicionar os totais calculados delas aqui.
      for (const m of meses) {
        totaisReceitaPorMes[m] = (totaisReceitaPorMes[m] ?? 0) + (totaisReceitaFaturasPorMes[m] ?? 0);
        totaisReceitaOperacionalPorMes[m] = (totaisReceitaOperacionalPorMes[m] ?? 0) + (totaisReceitaFaturasPorMes[m] ?? 0);
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
      resultadoPorMes[m] = (totaisReceitaPorMes[m] ?? 0) - (totaisDespesaPorMes[m] ?? 0);
      margemContribuicaoPorMes[m] =
        (totaisReceitaOperacionalPorMes[m] ?? 0) - (totaisDespesaVariavelPorMes[m] ?? 0);
      
      const receitaOperacional = totaisReceitaOperacionalPorMes[m] ?? 0;
      indiceContribuicaoPorMes[m] = receitaOperacional > 0 
        ? (margemContribuicaoPorMes[m] / receitaOperacional) * 100 
        : 0;

      resultadoOperacionalPorMes[m] =
        (totaisReceitaOperacionalPorMes[m] ?? 0) - (totaisDespesaOperacionalPorMes[m] ?? 0);
        
      ebitdaPorMes[m] = receitaOperacional > 0
        ? (resultadoOperacionalPorMes[m] / receitaOperacional) * 100
        : 0;

      ebitdaAbsolutoPorMes[m] = (resultadoOperacionalPorMes[m] ?? 0) + (totaisDepreciacaoAmortizacaoPorMes[m] ?? 0);

      resultadoPosInvestimentoPorMes[m] =
        (resultadoOperacionalPorMes[m] ?? 0) - (totaisInvestimentosPorMes[m] ?? 0);
      resultadoLiquidoPorMes[m] =
        (resultadoPosInvestimentoPorMes[m] ?? 0) +
        (totaisAportesPorMes[m] ?? 0) -
        (totaisSaidasFinanciamentoPorMes[m] ?? 0);
    }

    const totaisParcelasVencidasPorMes: Record<string, number> = {};
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
        .where('parcela.status = :vencido', { vencido: StatusParcela.VENCIDO })
        .andWhere('lancamento.status != :cancelado', { cancelado: StatusLancamento.CANCELADO })
        .andWhere('lancamento.tipo = :tipo', { tipo: TipoLancamento.RECEITA })
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
      const parcelasVencidas = totaisParcelasVencidasPorMes[m] ?? 0;
      lucroOperacionalAjustadoPorMes[m] = (resultadoOperacionalPorMes[m] ?? 0) + parcelasVencidas;
      
      const receitaOperacionalAjustada = (totaisReceitaOperacionalPorMes[m] ?? 0) + parcelasVencidas;
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

  /**
   * Soma os aportes cadastrados em Aportes e Empréstimos (`TbAporte`) na linha de totalizadores do DRE,
   * sempre como valor positivo. No regime de caixa, remove o mesmo valor dos totalizadores onde o
   * lançamento já havia sido contabilizado (mês do pagamento), para não duplicar o resultado líquido.
   */
  private async agregarAportesModuloCapitalNoDre(params: {
    meses: string[];
    regime: 'competencia' | 'caixa';
    dataInicioStr: string;
    dataFimStr: string;
    idEmpresa?: number;
    totaisReceitaOperacionalPorMes: Record<string, number>;
    totaisDespesaOperacionalPorMes: Record<string, number>;
    totaisInvestimentosPorMes: Record<string, number>;
    totaisAportesPorMes: Record<string, number>;
    totaisSaidasFinanciamentoPorMes: Record<string, number>;
  }): Promise<void> {
    const {
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
    } = params;

    const mesesSet = new Set(meses);

    const defaultClassificacao = (tipo: TipoLancamento): ClassificacaoDre =>
      tipo === TipoLancamento.RECEITA
        ? ClassificacaoDre.OPERACIONAL_RECEITA
        : ClassificacaoDre.OPERACIONAL_DESPESA;

    const subtrairDoTotalizadorPorClassificacao = (
      classif: ClassificacaoDre,
      m: string,
      valor: number,
    ) => {
      const v = valor;
      switch (classif) {
        case ClassificacaoDre.INVESTIMENTO:
          totaisInvestimentosPorMes[m] = (totaisInvestimentosPorMes[m] ?? 0) - v;
          break;
        case ClassificacaoDre.APORTE:
          totaisAportesPorMes[m] = (totaisAportesPorMes[m] ?? 0) - v;
          break;
        case ClassificacaoDre.SAIDA_FINANCIAMENTO:
          totaisSaidasFinanciamentoPorMes[m] = (totaisSaidasFinanciamentoPorMes[m] ?? 0) - v;
          break;
        case ClassificacaoDre.OPERACIONAL_RECEITA:
          totaisReceitaOperacionalPorMes[m] = (totaisReceitaOperacionalPorMes[m] ?? 0) - v;
          break;
        case ClassificacaoDre.OPERACIONAL_DESPESA:
        default:
          totaisDespesaOperacionalPorMes[m] = (totaisDespesaOperacionalPorMes[m] ?? 0) - v;
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
      if (!lanc || lanc.status === StatusLancamento.CANCELADO) {
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
      const classif =
        (cat as any)?.classificacaoDre ?? defaultClassificacao(lanc.tipo);

      if (regime === 'caixa') {
        const parcelas = lanc.parcelas ?? [];
        const pagas = parcelas.filter((p) => p.dataPagamento != null);
        for (const p of pagas) {
          const dp = p.dataPagamento instanceof Date ? p.dataPagamento : new Date(p.dataPagamento!);
          const mesPagKey = `${dp.getMonth() + 1}/${dp.getFullYear()}`;
          if (!mesesSet.has(mesPagKey)) {
            continue;
          }
          const vp = Math.abs(Number(p.valorPago ?? p.valor ?? 0));
          if (vp === 0) {
            continue;
          }
          subtrairDoTotalizadorPorClassificacao(classif, mesPagKey, vp);
        }
      }

      totaisAportesPorMes[mesAporteKey] = (totaisAportesPorMes[mesAporteKey] ?? 0) + vLinha;
    }
  }

  /**
   * Agrega receita apenas de lançamentos com fatura, alinhado ao regime (competência = vigência no mês; caixa = pagamento no mês).
   */
  private async montarTotaisReceitaFaturasPorMes(
    meses: string[],
    regime: 'competencia' | 'caixa',
    idEmpresa?: number,
  ): Promise<Record<string, number>> {
    const out: Record<string, number> = {};
    for (const m of meses) {
      out[m] = 0;
    }

    if (regime === 'competencia') {
      // No regime de competência, somar o valor faturado (`fatura.valorTotal`) pela competência real (dataInicio dentro do mês).
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
          .where('fatura.status != :fatCancel', { fatCancel: StatusFatura.CANCELADA })
          .andWhere('fatura.dataInicio >= :primeiroDiaMes', { primeiroDiaMes })
          .andWhere('fatura.dataInicio <= :ultimoDiaMes', { ultimoDiaMes });

        if (idEmpresa != null) {
          qb.andWhere('fatura.idEmpresa = :idEmpresa', { idEmpresa });
        }

        const r = await qb.getRawOne<{ total: string | number }>();
        out[mesAno] = Number(r?.total ?? 0);
      }
    } else {
      // No regime de caixa, a linha de faturas reflete entradas (pagamentos) no mês.
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
          .andWhere('lancamento.tipo = :receita', { receita: TipoLancamento.RECEITA })
          .andWhere('parcela.dataPagamento IS NOT NULL')
          .andWhere('DATE(parcela.dataPagamento) >= :p1', { p1: primeiroDiaMes })
          .andWhere('DATE(parcela.dataPagamento) <= :p2', { p2: ultimoDiaMes })
          .andWhere('lancamento.status != :cancelado', { cancelado: StatusLancamento.CANCELADO });

        if (idEmpresa != null) {
          qb.andWhere('lancamento.idClienteFornecedor = :idEmpresa', { idEmpresa });
        }

        const r = await qb.getRawOne<{ total: string | number }>();
        let total = Number(r?.total ?? 0);

        const qbAcresc = this.movimentacaoRepository
          .createQueryBuilder('mov')
          .innerJoin(Parcela, 'parcela', 'parcela.idParcela = mov.idParcelaOrigem')
          .innerJoin('parcela.lancamento', 'lancamento')
          .select('COALESCE(SUM(mov.valorAcrescimo), 0)', 'total')
          .where('mov.idParcelaOrigem IS NOT NULL')
          .andWhere('lancamento.idFatura IS NOT NULL')
          .andWhere('lancamento.tipo = :receita', { receita: TipoLancamento.RECEITA })
          .andWhere('DATE(mov.dataMovimentacao) >= :p1', { p1: primeiroDiaMes })
          .andWhere('DATE(mov.dataMovimentacao) <= :p2', { p2: ultimoDiaMes })
          .andWhere('lancamento.status != :cancelado', { cancelado: StatusLancamento.CANCELADO });

        if (idEmpresa != null) {
          qbAcresc.andWhere('lancamento.idClienteFornecedor = :idEmpresa', { idEmpresa });
        }

        const r2 = await qbAcresc.getRawOne<{ total: string | number }>();
        total += Number(r2?.total ?? 0);
        out[mesAno] = total;
      }
    }

    return out;
  }

  /**
   * Valores agregados por id de categoria inexistente ou excluída (soft delete) passam a "sem categoria" (null).
   */
  private remapMapaDrePorCategoriasExcluidas(
    mapa: Map<string, number>,
    idsValidos: Set<number>,
  ): Map<string, number> {
    const out = new Map<string, number>();
    for (const [key, val] of mapa) {
      const parts = key.split('_');
      if (parts.length < 3) continue;
      const mesAno = parts[parts.length - 1];
      const tipo = parts[parts.length - 2];
      const idPrefix = parts.slice(0, -2).join('_');
      let idCat: number | null = idPrefix === 'null' ? null : Number(idPrefix);
      if (idCat != null && !idsValidos.has(idCat)) {
        idCat = null;
      }
      const newKey = `${idCat ?? 'null'}_${tipo}_${mesAno}`;
      out.set(newKey, (out.get(newKey) ?? 0) + val);
    }
    return out;
  }

  private parsePeriodo(value: string): [number, number] {
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
    throw new BadRequestException(`Data/período inválido: ${value}. Use YYYY-MM ou YYYY-MM-DD.`);
  }
}

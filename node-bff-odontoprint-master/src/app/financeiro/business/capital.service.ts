import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Aporte, TipoAporte } from '../domain/aporte.entity';
import { Emprestimo, TipoEmprestimo, StatusEmprestimo } from '../domain/emprestimo.entity';
import { EmprestimoMovimentacao } from '../domain/emprestimo-movimentacao.entity';
import { FinanceiroService } from './financeiro.service';
import { TipoLancamento } from '../domain/tipo-lancamento.enum';
import { MeioPagamento } from '../domain/parcela.entity';
import { Socio } from '../domain/socio.entity';
import { Conta } from '../domain/conta.entity';
import { Movimentacao, TipoMovimentacao } from '../domain/movimentacao.entity';

export interface CreateAporteDto {
  idSocio?: number;
  dataAporte: string;
  valor: number;
  tipo: string;
  observacoes?: string;
  idCategoria?: number;
  idConta?: number;
  meioPagamento?: string;
}

export interface CreateEmprestimoDto {
  tipo: string;
  valorPrincipal: number;
  taxaJuros?: number;
  dataContratacao: string;
  dataVencimento?: string;
  idCredorDevedor?: number;
  observacoes?: string;
  idCategoria?: number;
  idConta?: number;
  meioPagamento?: string;
}

export interface CreateJurosEmprestimoDto {
  valor: number;
  dataCompetencia: string;
  idCategoria?: number;
  idConta?: number;
  observacoes?: string;
}

export interface CreatePagamentoEmprestimoDto {
  valor: number;
  dataPagamento: string;
  idConta: number;
  idCategoria?: number;
  meioPagamento?: string;
  observacoes?: string;
}

@Injectable()
export class CapitalService {
  constructor(
    @InjectRepository(Aporte)
    private readonly aporteRepository: Repository<Aporte>,
    @InjectRepository(Emprestimo)
    private readonly emprestimoRepository: Repository<Emprestimo>,
    @InjectRepository(EmprestimoMovimentacao)
    private readonly emprestimoMovimentacaoRepository: Repository<EmprestimoMovimentacao>,
    @InjectRepository(Socio)
    private readonly socioRepository: Repository<Socio>,
    @InjectRepository(Conta)
    private readonly contaRepository: Repository<Conta>,
    @InjectRepository(Movimentacao)
    private readonly movimentacaoRepository: Repository<Movimentacao>,
    private readonly financeiroService: FinanceiroService,
    private readonly dataSource: DataSource,
  ) {}

  // =================================================================
  // GESTÃO DE APORTES
  // =================================================================

  async registrarAporte(dto: CreateAporteDto): Promise<Aporte> {
    return this.dataSource.transaction(async manager => {
      const aporteRepo = manager.getRepository(Aporte);
      const socioRepo = manager.getRepository(Socio);
      const contaRepo = manager.getRepository(Conta);
      const movRepo = manager.getRepository(Movimentacao);

      // Buscar sócio e sua conta se fornecido
      let contaSocio: Conta | null = null;
      if (dto.idSocio) {
        const socio = await socioRepo.findOne({
          where: { idSocio: dto.idSocio },
          relations: ['conta'],
        });
        if (!socio) {
          throw new NotFoundException(`Sócio com ID ${dto.idSocio} não encontrado.`);
        }
        if (socio.idConta) {
          contaSocio = await contaRepo.findOneBy({ idConta: socio.idConta });
          if (!contaSocio) {
            throw new NotFoundException(`Conta do sócio com ID ${socio.idConta} não encontrada.`);
          }
        }
      }

      // Criar lançamento financeiro (RECEITA)
      const dataCompetencia = new Date(dto.dataAporte);
      const dataVencimento = new Date(dto.dataAporte);

      const tipoAporte = dto.tipo as TipoAporte;
      const descricao = tipoAporte === TipoAporte.APORTE_CAPITAL
        ? `Aporte de Capital - Sócio ID ${dto.idSocio || 'N/A'}`
        : `Distribuição de Lucros - Sócio ID ${dto.idSocio || 'N/A'}`;

      const lancamento = await this.financeiroService.criarLancamento({
        descricao,
        tipo: TipoLancamento.RECEITA,
        valorTotal: dto.valor,
        dataCompetencia: dataCompetencia.toISOString().split('T')[0],
        idCategoria: dto.idCategoria,
        idClienteFornecedor: dto.idSocio,
        parcelas: [
          {
            numeroParcela: 1,
            valor: dto.valor,
            dataVencimento: dataVencimento.toISOString().split('T')[0],
            meioPagamento: (dto.meioPagamento as MeioPagamento) || MeioPagamento.TRANSFERENCIA,
          },
        ],
        pagamentoImediato: dto.idConta
          ? {
              idConta: dto.idConta,
              dataPagamento: dto.dataAporte,
            }
          : undefined,
      });

      // Se houver sócio com conta, criar movimentação de débito na conta do sócio
      if (contaSocio && dto.idSocio) {
        const movimentacaoDebito = movRepo.create({
          idConta: contaSocio.idConta,
          tipo: TipoMovimentacao.DEBITO,
          valor: dto.valor,
          valorAcrescimo: 0,
          descricao: `Aporte registrado - ${descricao}`,
          dataMovimentacao: new Date(dto.dataAporte),
        });
        await movRepo.save(movimentacaoDebito);

        // Atualizar saldo da conta do sócio (debitar = subtrair)
        contaSocio.saldoAtual = Number(contaSocio.saldoAtual) - Number(dto.valor);
        await contaRepo.save(contaSocio);
      }

      // Criar registro de aporte
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

  async listarAportes(idSocio?: number, dataInicio?: string, dataFim?: string, tipo?: TipoAporte): Promise<Aporte[]> {
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

  // =================================================================
  // GESTÃO DE EMPRÉSTIMOS
  // =================================================================

  async registrarEmprestimo(dto: CreateEmprestimoDto): Promise<Emprestimo> {
    const tipoEmprestimo = dto.tipo as TipoEmprestimo;
    const descricao = tipoEmprestimo === TipoEmprestimo.RECEBIDO
      ? `Empréstimo Recebido`
      : `Empréstimo Concedido`;

    // Criar lançamento financeiro
    const dataCompetencia = new Date(dto.dataContratacao);
    const dataVencimento = dto.dataVencimento ? new Date(dto.dataVencimento) : new Date(dto.dataContratacao);

    const lancamento = await this.financeiroService.criarLancamento({
      descricao,
      tipo: tipoEmprestimo === TipoEmprestimo.RECEBIDO ? TipoLancamento.RECEITA : TipoLancamento.DESPESA,
      valorTotal: dto.valorPrincipal,
      dataCompetencia: dataCompetencia.toISOString().split('T')[0],
      idCategoria: dto.idCategoria,
      idClienteFornecedor: dto.idCredorDevedor,
      parcelas: [
        {
          numeroParcela: 1,
          valor: dto.valorPrincipal,
          dataVencimento: dataVencimento.toISOString().split('T')[0],
          meioPagamento: (dto.meioPagamento as MeioPagamento) || MeioPagamento.TRANSFERENCIA,
        },
      ],
      pagamentoImediato: dto.idConta
        ? {
            idConta: dto.idConta,
            dataPagamento: dto.dataContratacao,
          }
        : undefined,
    });

    // Criar registro de empréstimo
    const emprestimo = this.emprestimoRepository.create({
      idLancamento: lancamento.idLancamento,
      tipo: tipoEmprestimo,
      valorPrincipal: dto.valorPrincipal,
      saldoRestante: dto.valorPrincipal,
      taxaJuros: dto.taxaJuros,
      dataContratacao: new Date(dto.dataContratacao),
      dataVencimento: dto.dataVencimento ? new Date(dto.dataVencimento) : undefined,
      status: StatusEmprestimo.ATIVO,
      idCredorDevedor: dto.idCredorDevedor,
      observacoes: dto.observacoes,
    });

    return this.emprestimoRepository.save(emprestimo);
  }

  async listarEmprestimos(
    tipo?: TipoEmprestimo,
    status?: StatusEmprestimo,
    dataInicio?: string,
    dataFim?: string,
  ): Promise<Emprestimo[]> {
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

  async atualizarStatusEmprestimo(idEmprestimo: number, status: StatusEmprestimo): Promise<Emprestimo> {
    const emprestimo = await this.emprestimoRepository.findOneBy({ idEmprestimo });
    if (!emprestimo) {
      throw new NotFoundException(`Empréstimo com ID ${idEmprestimo} não encontrado.`);
    }

    emprestimo.status = status;
    return this.emprestimoRepository.save(emprestimo);
  }

  async registrarJurosEmprestimo(idEmprestimo: number, dto: CreateJurosEmprestimoDto): Promise<EmprestimoMovimentacao> {
    const emprestimo = await this.emprestimoRepository.findOneBy({ idEmprestimo });
    if (!emprestimo) {
      throw new NotFoundException(`Empréstimo com ID ${idEmprestimo} não encontrado.`);
    }

    // Não precisa atualizar o saldoRestante aqui pois o recalcularSaldoEmprestimo fará isso.

    const movimentacao = this.emprestimoMovimentacaoRepository.create({
      idEmprestimo,
      idLancamento: null as any,
      valor: dto.valor,
      dataMovimentacao: new Date(dto.dataCompetencia),
      tipoMovimentacao: 'JUROS' as any,
      observacoes: dto.observacoes,
    });

    const saved = await this.emprestimoMovimentacaoRepository.save(movimentacao);
    await this.recalcularSaldoEmprestimo(idEmprestimo);
    return saved;
  }

  async registrarAcrescimoEmprestimo(idEmprestimo: number, dto: CreateJurosEmprestimoDto): Promise<EmprestimoMovimentacao> {
    const emprestimo = await this.emprestimoRepository.findOneBy({ idEmprestimo });
    if (!emprestimo) {
      throw new NotFoundException(`Empréstimo com ID ${idEmprestimo} não encontrado.`);
    }

    // Não precisa atualizar o saldoRestante aqui pois o recalcularSaldoEmprestimo fará isso.

    const tipoLancamento = emprestimo.tipo === TipoEmprestimo.RECEBIDO ? TipoLancamento.RECEITA : TipoLancamento.DESPESA;
    
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
          meioPagamento: MeioPagamento.TRANSFERENCIA,
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
      tipoMovimentacao: 'ACRESCIMO' as any,
      observacoes: dto.observacoes,
    });

    const saved = await this.emprestimoMovimentacaoRepository.save(movimentacao);
    await this.recalcularSaldoEmprestimo(idEmprestimo);
    return saved;
  }

  async registrarPagamentoEmprestimo(idEmprestimo: number, dto: CreatePagamentoEmprestimoDto): Promise<EmprestimoMovimentacao> {
    const emprestimo = await this.emprestimoRepository.findOneBy({ idEmprestimo });
    if (!emprestimo) {
      throw new NotFoundException(`Empréstimo com ID ${idEmprestimo} não encontrado.`);
    }

    // Se for empréstimo recebido, pagamento é uma SAÍDA (DESPESA no lançamento). 
    // Se concedido, pagamento é ENTRADA (RECEITA no lançamento).
    const tipoLancamento = emprestimo.tipo === TipoEmprestimo.RECEBIDO ? TipoLancamento.DESPESA : TipoLancamento.RECEITA;
    
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
          meioPagamento: (dto.meioPagamento as MeioPagamento) || MeioPagamento.TRANSFERENCIA,
        },
      ],
      pagamentoImediato: {
        idConta: dto.idConta,
        dataPagamento: dto.dataPagamento,
      }
    });

    // Não precisa atualizar o saldoRestante aqui pois o recalcularSaldoEmprestimo fará isso.

    const movimentacao = this.emprestimoMovimentacaoRepository.create({
      idEmprestimo,
      idLancamento: lancamento.idLancamento,
      valor: dto.valor,
      dataMovimentacao: new Date(dto.dataPagamento),
      tipoMovimentacao: 'PAGAMENTO' as any,
      observacoes: dto.observacoes,
    });

    const saved = await this.emprestimoMovimentacaoRepository.save(movimentacao);
    await this.recalcularSaldoEmprestimo(idEmprestimo);
    return saved;
  }

  async recalcularSaldoEmprestimo(idEmprestimo: number): Promise<{ saldoAnterior: number, saldoNovo: number }> {
    const emprestimo = await this.emprestimoRepository.findOneBy({ idEmprestimo });
    if (!emprestimo) {
      throw new NotFoundException(`Empréstimo com ID ${idEmprestimo} não encontrado.`);
    }

    const movimentacoes = await this.emprestimoMovimentacaoRepository.find({
      where: { idEmprestimo },
      order: { dataMovimentacao: 'ASC', idMovimentacao: 'ASC' }
    });

    let saldoCalculado = Number(emprestimo.valorPrincipal);

    for (const mov of movimentacoes) {
      // Criação retroativa de lançamento se faltar
      if ((mov.tipoMovimentacao === 'ACRESCIMO' || mov.tipoMovimentacao === 'PAGAMENTO') && !mov.idLancamento) {
        const isEntrada = 
          (mov.tipoMovimentacao === 'ACRESCIMO' && emprestimo.tipo === TipoEmprestimo.RECEBIDO) ||
          (mov.tipoMovimentacao === 'PAGAMENTO' && emprestimo.tipo === TipoEmprestimo.CONCEDIDO);
          
        const tipoLancamento = isEntrada ? TipoLancamento.RECEITA : TipoLancamento.DESPESA;
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
              meioPagamento: MeioPagamento.TRANSFERENCIA,
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
      } else if (mov.tipoMovimentacao === 'ACRESCIMO') {
        saldoCalculado += Number(mov.valor);
      } else if (mov.tipoMovimentacao === 'PAGAMENTO') {
        saldoCalculado -= Number(mov.valor);
      }
    }

    saldoCalculado = Math.max(0, saldoCalculado);

    const saldoAnterior = Number(emprestimo.saldoRestante || 0);
    
    emprestimo.saldoRestante = saldoCalculado;
    if (emprestimo.saldoRestante < 0.01) {
      emprestimo.status = StatusEmprestimo.QUITADO;
    } else if (emprestimo.status === StatusEmprestimo.QUITADO && emprestimo.saldoRestante >= 0.01) {
      emprestimo.status = StatusEmprestimo.ATIVO;
    }
    
    await this.emprestimoRepository.save(emprestimo);

    return {
      saldoAnterior,
      saldoNovo: saldoCalculado
    };
  }

  /** Movimentações (Juros/Pagamentos) vinculadas ao empréstimo. */
  async listarMovimentacoesPagamentoEmprestimo(idEmprestimo: number): Promise<EmprestimoMovimentacao[]> {
    const emp = await this.emprestimoRepository.findOneBy({ idEmprestimo });
    if (!emp) {
      throw new NotFoundException(`Empréstimo com ID ${idEmprestimo} não encontrado.`);
    }
    return this.emprestimoMovimentacaoRepository.find({
      where: { idEmprestimo },
      relations: ['lancamento'],
      order: { dataMovimentacao: 'DESC', idMovimentacao: 'DESC' },
    });
  }
}


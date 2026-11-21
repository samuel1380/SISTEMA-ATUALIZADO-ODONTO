import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ArquivoOfx } from '../domain/arquivo-ofx.entity';
import { TransacaoOfx, TipoTransacaoOfx, StatusConciliacao } from '../domain/transacao-ofx.entity';
import { Conta } from '../domain/conta.entity';
import { Lancamento } from '../domain/lancamento.entity';
import { FinanceiroService } from './financeiro.service';
import { FornecedorService } from './fornecedor.service';
import { CategoriaService } from './categoria.service';
import { TipoLancamento } from '../domain/tipo-lancamento.enum';
import { MeioPagamento } from '../domain/parcela.entity';
import { extrairCpfOuCnpjDoTexto } from '../utils/ofx-import.util';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const ofxParse = require('ofx-js').parse as (data: string) => Promise<any>;

export interface ImportarOfxContasPagarResultado {
  inseridos: number;
  ignoradosDuplicados: number;
  ignoradosSemFitId: number;
  ignoradosValorNaoNegativo: number;
  /** Lançamentos sem CPF/CNPJ identificado no NAME (fornecedor não vinculado automaticamente). */
  semFornecedorAutomatico: number;
  /** Lançamentos cuja categoria veio do cadastro do fornecedor (`idCategoria` do fornecedor). */
  classificadosPelaCategoriaDoFornecedor: number;
}

@Injectable()
export class OfxService {
  constructor(
    @InjectRepository(ArquivoOfx)
    private readonly arquivoOfxRepository: Repository<ArquivoOfx>,
    @InjectRepository(TransacaoOfx)
    private readonly transacaoOfxRepository: Repository<TransacaoOfx>,
    @InjectRepository(Conta)
    private readonly contaRepository: Repository<Conta>,
    @InjectRepository(Lancamento)
    private readonly lancamentoRepository: Repository<Lancamento>,
    private readonly dataSource: DataSource,
    private readonly financeiroService: FinanceiroService,
    private readonly fornecedorService: FornecedorService,
    private readonly categoriaService: CategoriaService,
  ) {}

  async importarArquivoOfx(
    file: Express.Multer.File,
    idConta: number,
    idUsuario: number,
  ): Promise<ArquivoOfx> {
    if (!file) {
      throw new BadRequestException('Arquivo não fornecido.');
    }

    if (!file.originalname.toLowerCase().endsWith('.ofx')) {
      throw new BadRequestException('Arquivo deve ser do tipo OFX (.ofx).');
    }

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new BadRequestException('Arquivo muito grande. Tamanho máximo: 10MB.');
    }

    const conta = await this.contaRepository.findOneBy({ idConta });
    if (!conta) {
      throw new NotFoundException(`Conta com ID ${idConta} não encontrada.`);
    }

    return this.dataSource.transaction(async manager => {
      const arquivoRepo = manager.getRepository(ArquivoOfx);
      const transacaoRepo = manager.getRepository(TransacaoOfx);

      try {
        const parsed = await this.parseOfxJs(file.buffer.toString());
        const transactions = this.extrairTransacoesNormalizadas(parsed);
        const meta = this.extrairMetadadosExtrato(parsed);

        const dataInicio =
          meta.dtStart != null
            ? this.parsearDataOfx(meta.dtStart)
            : transactions[0]?.datePosted
              ? this.parsearDataOfx(transactions[0].datePosted)
              : new Date();
        const dataFim =
          meta.dtEnd != null
            ? this.parsearDataOfx(meta.dtEnd)
            : transactions[transactions.length - 1]?.datePosted
              ? this.parsearDataOfx(transactions[transactions.length - 1].datePosted)
              : dataInicio;

        const saldoFinal =
          meta.ledgerBal != null ? this.parsearDecimal(meta.ledgerBal) : 0;

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
          const tipo = valor >= 0 ? TipoTransacaoOfx.CREDITO : TipoTransacaoOfx.DEBITO;

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
            statusConciliacao: StatusConciliacao.PENDENTE,
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
      } catch (error) {
        if (error instanceof BadRequestException || error instanceof NotFoundException) {
          throw error;
        }
        throw new BadRequestException(`Erro ao processar arquivo OFX: ${error.message}`);
      }
    });
  }

  /**
   * Importa débitos (TRNAMT &lt; 0) como lançamentos de despesa (contas a pagar).
   * Idempotência: `numeroDocumento` = OFX[:idConta]:FITID
   */
  async importarOfxContasPagar(
    file: Express.Multer.File,
    idCategoria: number,
    idContaOpcional?: number,
  ): Promise<ImportarOfxContasPagarResultado> {
    if (!file) {
      throw new BadRequestException('Arquivo não fornecido.');
    }
    if (!file.originalname.toLowerCase().endsWith('.ofx')) {
      throw new BadRequestException('Arquivo deve ser do tipo OFX (.ofx).');
    }
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new BadRequestException('Arquivo muito grande. Tamanho máximo: 10MB.');
    }

    const categoria = await this.categoriaService.findOne(idCategoria);
    if (categoria.tipo !== TipoLancamento.DESPESA) {
      throw new BadRequestException('A categoria deve ser do tipo DESPESA (contas a pagar).');
    }

    if (idContaOpcional == null) {
      throw new BadRequestException(
        'Informe a conta bancária: o extrato OFX já reflete pagamentos efetuados; é necessária a conta para lançar cada despesa como paga e movimentar o saldo.',
      );
    }

    const contaPg = await this.contaRepository.findOneBy({ idConta: idContaOpcional });
    if (!contaPg) {
      throw new NotFoundException(`Conta com ID ${idContaOpcional} não encontrada.`);
    }

    const resultado: ImportarOfxContasPagarResultado = {
      inseridos: 0,
      ignoradosDuplicados: 0,
      ignoradosSemFitId: 0,
      ignoradosValorNaoNegativo: 0,
      semFornecedorAutomatico: 0,
      classificadosPelaCategoriaDoFornecedor: 0,
    };

    let parsed: any;
    try {
      parsed = await this.parseOfxJs(file.buffer.toString());
    } catch (e) {
      throw new BadRequestException(`Erro ao ler OFX: ${(e as Error).message}`);
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

      const extraido = textoNome ? extrairCpfOuCnpjDoTexto(textoNome) : null;

      let idFornecedor: number | undefined;
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
      } else {
        resultado.semFornecedorAutomatico++;
      }

      const catParaLancamento = await this.categoriaService.findOne(idCategoriaLancamento);
      if (catParaLancamento.tipo !== TipoLancamento.DESPESA) {
        throw new BadRequestException(
          `A categoria (ID ${idCategoriaLancamento}) deve ser do tipo DESPESA (contas a pagar).`,
        );
      }

      const nomeResp =
        (extraido?.restoNome && extraido.restoNome.trim()) ||
        nameStr ||
        memoStr ||
        'Sem identificação';
      const descricao = `Despesa OFX — ${nomeResp}`.slice(0, 255);

      const dataStr = t.datePosted || '';
      const dataIso = this.formatarDataYmd(this.parsearDataOfx(dataStr));

      const valorAbs = Math.abs(valor);

      await this.financeiroService.criarLancamento({
        descricao,
        tipo: TipoLancamento.DESPESA,
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
            meioPagamento: MeioPagamento.TRANSFERENCIA,
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

  private async parseOfxJs(content: string): Promise<any> {
    return ofxParse(content);
  }

  private extrairTransacoesNormalizadas(parsed: any): Array<{
    fitId: string;
    amount: string | number;
    datePosted: string;
    dateAvailable?: string;
    name: string;
    memo: string;
    checkNumber?: string;
  }> {
    const brutos: any[] = [];
    this.coletarStmtTrn(parsed?.OFX, brutos);
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

  private coletarStmtTrn(node: any, acc: any[]): void {
    if (node == null) return;
    if (Array.isArray(node)) {
      node.forEach((n) => this.coletarStmtTrn(n, acc));
      return;
    }
    if (typeof node === 'object') {
      if (node.STMTTRN !== undefined) {
        const t = node.STMTTRN;
        if (Array.isArray(t)) acc.push(...t);
        else acc.push(t);
      }
      for (const k of Object.keys(node)) {
        if (k === 'STMTTRN') continue;
        this.coletarStmtTrn(node[k], acc);
      }
    }
  }

  private extrairMetadadosExtrato(parsed: any): {
    dtStart?: string;
    dtEnd?: string;
    ledgerBal?: string;
  } {
    const bankList = this.encontrarPrimeiroComChave(parsed?.OFX, 'BANKTRANLIST');
    const ledger = this.encontrarPrimeiroComChave(parsed?.OFX, 'LEDGERBAL');
    return {
      dtStart: bankList?.DTSTART != null ? String(bankList.DTSTART) : undefined,
      dtEnd: bankList?.DTEND != null ? String(bankList.DTEND) : undefined,
      ledgerBal: ledger?.BALAMT != null ? String(ledger.BALAMT) : undefined,
    };
  }

  private encontrarPrimeiroComChave(node: any, key: string): any {
    if (node == null) return null;
    if (Array.isArray(node)) {
      for (const n of node) {
        const f = this.encontrarPrimeiroComChave(n, key);
        if (f) return f;
      }
      return null;
    }
    if (typeof node === 'object') {
      if (node[key] !== undefined && node[key] !== null && typeof node[key] === 'object') {
        return node[key];
      }
      for (const v of Object.values(node)) {
        const f = this.encontrarPrimeiroComChave(v, key);
        if (f) return f;
      }
    }
    return null;
  }

  private formatarDataYmd(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  async listarArquivos(idConta?: number): Promise<ArquivoOfx[]> {
    const queryBuilder = this.arquivoOfxRepository
      .createQueryBuilder('arquivo')
      .leftJoinAndSelect('arquivo.conta', 'conta')
      .orderBy('arquivo.dataImportacao', 'DESC');

    if (idConta) {
      queryBuilder.where('arquivo.idConta = :idConta', { idConta });
    }

    return queryBuilder.getMany();
  }

  async buscarArquivoPorId(id: number): Promise<ArquivoOfx> {
    const arquivo = await this.arquivoOfxRepository.findOne({
      where: { idArquivoOfx: id },
      relations: ['conta', 'transacoes'],
    });

    if (!arquivo) {
      throw new NotFoundException(`Arquivo OFX com ID ${id} não encontrado.`);
    }

    return arquivo;
  }

  async excluirArquivo(id: number): Promise<void> {
    const arquivo = await this.buscarArquivoPorId(id);

    const transacoesComConciliacao = await this.transacaoOfxRepository
      .createQueryBuilder('transacao')
      .leftJoin('transacao.conciliacao', 'conciliacao')
      .where('transacao.idArquivoOfx = :idArquivo', { idArquivo: id })
      .andWhere('conciliacao.idConciliacao IS NOT NULL')
      .getCount();

    if (transacoesComConciliacao > 0) {
      throw new BadRequestException(
        `Não é possível excluir o arquivo. Existem ${transacoesComConciliacao} transações conciliadas vinculadas a este arquivo.`,
      );
    }

    await this.dataSource.transaction(async manager => {
      const transacaoRepo = manager.getRepository(TransacaoOfx);
      const arquivoRepo = manager.getRepository(ArquivoOfx);

      await transacaoRepo.delete({ idArquivoOfx: id });
      await arquivoRepo.delete({ idArquivoOfx: id });
    });
  }

  private parsearDataOfx(dataOfx: string | Date): Date {
    if (dataOfx instanceof Date) {
      return dataOfx;
    }

    const str = dataOfx.toString().trim();
    if (str.length === 8) {
      const year = parseInt(str.substring(0, 4), 10);
      const month = parseInt(str.substring(4, 6), 10) - 1;
      const day = parseInt(str.substring(6, 8), 10);
      return new Date(year, month, day);
    } else if (str.length >= 14) {
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

    throw new BadRequestException(`Formato de data inválido: ${str}`);
  }

  private parsearDecimal(valor: string | number): number {
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
}

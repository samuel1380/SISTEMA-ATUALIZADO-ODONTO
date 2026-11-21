import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron } from '@nestjs/schedule';
import { Lancamento } from '../domain/lancamento.entity';
import { Fornecedor } from '../domain/fornecedor.entity';
import { TipoLancamento } from '../domain/tipo-lancamento.enum';

@Injectable()
export class ClassificacaoLancamentoService {
  private readonly logger = new Logger(ClassificacaoLancamentoService.name);

  constructor(
    @InjectRepository(Lancamento)
    private readonly lancamentoRepository: Repository<Lancamento>,
    @InjectRepository(Fornecedor)
    private readonly fornecedorRepository: Repository<Fornecedor>,
  ) {}

  /**
   * Tenta determinar o idCategoria para um lançamento de despesa sem categoria,
   * usando a seguinte ordem de prioridade:
   *
   * 1. Fornecedor já vinculado ao lançamento com categoria definida.
   * 2. Regex gerado a partir do CPF/CNPJ cadastrado no fornecedor aplicado na descrição.
   *    Suporta documentos mascarados (***.613.265-**) e formatações irregulares (espaço no lugar de /).
   * 3. Nome do fornecedor (razaoSocial ou nomeFantasia) contido na descrição.
   *
   * @returns idCategoria encontrado, ou null se nenhum match.
   */
  async classificarLancamento(lancamento: Lancamento): Promise<{ idCategoria: number | null; idFornecedor: number | null } | null> {
    const descricao = lancamento.descricao || '';

    // 1. Fornecedor já vinculado
    if (lancamento.idFornecedor) {
      const fornecedor = await this.fornecedorRepository.findOne({
        where: { idFornecedor: lancamento.idFornecedor },
        relations: ['categoria'],
      });
      if (fornecedor?.idCategoria) {
        this.logger.debug(
          `Lançamento ${lancamento.idLancamento}: classificado via fornecedor vinculado (ID ${fornecedor.idFornecedor}).`,
        );
        return { idCategoria: fornecedor.idCategoria, idFornecedor: fornecedor.idFornecedor };
      }
    }

    // Carrega todos os fornecedores ativos
    const fornecedores = await this.fornecedorRepository
      .createQueryBuilder('f')
      .leftJoinAndSelect('f.categoria', 'categoria')
      .where('f.ativo = :ativo', { ativo: true })
      .getMany();

    if (fornecedores.length === 0) {
      return null;
    }

    // 2. Regex gerado a partir do CPF/CNPJ do fornecedor aplicado na descrição
    // Funciona com documentos formatados normalmente, com asteriscos (mascarados)
    // ou com formatação irregular (ex: espaço no lugar de /).
    for (const fornecedor of fornecedores) {
      for (let documento of [fornecedor.cpf, fornecedor.cnpj]) {
        if (!documento || documento.trim() === '') continue;
        documento = documento.trim();

        const regex = this.construirRegexDocumento(documento);
        if (!regex) continue;

        if (regex.test(descricao)) {
          this.logger.debug(
            `Lançamento ${lancamento.idLancamento}: classificado via documento do fornecedor ` +
            `"${fornecedor.razaoSocial}" (padrão: "${documento}").`,
          );
          return { idCategoria: fornecedor.idCategoria ?? null, idFornecedor: fornecedor.idFornecedor };
        }
      }
    }

    // 3. Nome do fornecedor na descrição (razaoSocial ou nomeFantasia)
    const descricaoLower = descricao.toLowerCase();
    for (const fornecedor of fornecedores) {
      const razao = (fornecedor.razaoSocial || '').toLowerCase().trim();
      const fantasia = (fornecedor.nomeFantasia || '').toLowerCase().trim();

      if (razao && descricaoLower.includes(razao)) {
        this.logger.debug(
          `Lançamento ${lancamento.idLancamento}: classificado via razão social "${fornecedor.razaoSocial}".`,
        );
        return { idCategoria: fornecedor.idCategoria ?? null, idFornecedor: fornecedor.idFornecedor };
      }
      if (fantasia && descricaoLower.includes(fantasia)) {
        this.logger.debug(
          `Lançamento ${lancamento.idLancamento}: classificado via nome fantasia "${fornecedor.nomeFantasia}".`,
        );
        return { idCategoria: fornecedor.idCategoria ?? null, idFornecedor: fornecedor.idFornecedor };
      }
    }

    return null;
  }

  /**
   * Converte o CPF/CNPJ cadastrado no fornecedor em um RegExp para busca na descrição.
   *
   * Regras de conversão:
   *  - Cada caractere especial de regex é escapado individualmente.
   *  - `*`  → `[\d*]`  (aceita dígito ou asterisco — cobre CPF mascarado).
   *  - `/`  → `[\/ ]`  (aceita barra ou espaço — cobre CNPJ com espaço no banco).
   *
   * Exemplos:
   *  - "***.613.265-**"     → /[\d*][\d*][\d*]\.613\.265-[\d*][\d*]/i
   *  - "04.298.106/0001-74" → /04\.298\.106[\/ ]0001-74/i   ← casa com espaço OU barra
   *  - "04.298.106 0001-74" → /04\.298\.106 0001-74/i
   */
  private construirRegexDocumento(documento: string): RegExp | null {
    if (!documento || documento.trim() === '') return null;

    // Remove toda a pontuação, mantendo apenas dígitos e asteriscos.
    const cleanDoc = documento.replace(/[^\d*]/g, '');
    if (cleanDoc.length === 0) return null;

    // Constrói o regex que espera qualquer pontuação opcional entre cada caractere válido
    let padrao = '';
    for (let i = 0; i < cleanDoc.length; i++) {
      const ch = cleanDoc[i];
      if (ch === '*') {
        padrao += '[\\d*]'; // Aceita dígito ou asterisco (CPF/CNPJ mascarado)
      } else {
        padrao += ch; // Aceita o dígito literal
      }
      
      // Adiciona a possibilidade de pontuação opcional entre os caracteres
      if (i < cleanDoc.length - 1) {
        padrao += '[./ -]*';
      }
    }

    try {
      return new RegExp(padrao, 'i');
    } catch (e) {
      this.logger.warn(`Não foi possível construir regex para documento "${documento}": ${e}`);
      return null;
    }
  }

  /**
   * Varre todos os lançamentos de DESPESA sem categoria ou com categoria "DESCONHECIDA"
   * e tenta classificá-los.
   * Utilizado tanto pelo job noturno quanto pode ser chamado manualmente.
   *
   * @returns Resumo com totais processados e classificados.
   */
  async classificarLancamentosSemCategoria(): Promise<{
    processados: number;
    classificados: number;
    semMatch: number;
  }> {
    const lancamentos = await this.lancamentoRepository
      .createQueryBuilder('l')
      .leftJoin('l.categoria', 'categoria')
      .where('l.tipo = :tipo', { tipo: TipoLancamento.DESPESA })
      .andWhere('(l.idCategoria IS NULL OR l.idFornecedor IS NULL OR UPPER(categoria.nome) LIKE :nomeDesconhecido)', {
        nomeDesconhecido: 'DESCONHECID%',
      })
      .getMany();

    let classificados = 0;

    for (const lancamento of lancamentos) {
      const classificacao = await this.classificarLancamento(lancamento);
      if (classificacao) {
        const updateData: any = {};
        
        // Apenas atualiza a categoria se o lancamento não tiver categoria ou for DESCONHECIDO
        const ehDesconhecido = lancamento.categoria && lancamento.categoria.nome.toUpperCase().includes('DESCONHECID');
        const podeAtualizarCategoria = !lancamento.idCategoria || ehDesconhecido;
        
        if (classificacao.idCategoria && classificacao.idCategoria !== lancamento.idCategoria && podeAtualizarCategoria) {
          updateData.idCategoria = classificacao.idCategoria;
        }
        if (classificacao.idFornecedor && classificacao.idFornecedor !== lancamento.idFornecedor) {
          updateData.idFornecedor = classificacao.idFornecedor;
        }
        
        if (Object.keys(updateData).length > 0) {
          await this.lancamentoRepository.update(lancamento.idLancamento, updateData);
          classificados++;
        }
      }
    }

    const semMatch = lancamentos.length - classificados;

    this.logger.log(
      `Classificação concluída: ${lancamentos.length} processados, ${classificados} classificados, ${semMatch} sem match.`,
    );

    return {
      processados: lancamentos.length,
      classificados,
      semMatch,
    };
  }

  /**
   * Job diário às 02h00 da manhã.
   * Classifica automaticamente os lançamentos de despesa sem categoria.
   */
  @Cron('0 2 * * *')
  async jobClassificacaoNoturna() {
    this.logger.log('Job de classificação automática de lançamentos iniciado...');
    try {
      const resultado = await this.classificarLancamentosSemCategoria();
      this.logger.log(
        `Job concluído: ${resultado.classificados}/${resultado.processados} lançamentos classificados.`,
      );
    } catch (error) {
      this.logger.error('Erro no job de classificação de lançamentos.', error?.stack);
    }
  }
}

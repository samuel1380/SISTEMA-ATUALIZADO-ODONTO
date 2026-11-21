import { Injectable, BadRequestException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, IsNull, Not } from 'typeorm';
import { EmpresaTabelaPreco } from '../domain/empresaTabelaPreco.entity';
import { TabelaPrecoProduto } from '@src/app/tabelaPrecoProduto/domain/tabelaPrecoProduto.entity';
import { TabelaPrecoProdutoService } from '@src/app/tabelaPrecoProduto/business/tabelaPrecoProduto.service';

const CACHE_TTL_MS = 30_000; // 30 segundos - evita buscas repetidas no recálculo de faturas

@Injectable()
export class EmpresaTabelaPrecoService {
  private readonly logger = new Logger(EmpresaTabelaPrecoService.name);
  private readonly cacheVigentePorEmpresa = new Map<string, { tabela: TabelaPrecoProduto; expires: number }>();

  constructor(
    @InjectRepository(EmpresaTabelaPreco)
    private readonly empresaTabelaPrecoRepository: Repository<EmpresaTabelaPreco>,
    private readonly tabelaPrecoProdutoService: TabelaPrecoProdutoService,
  ) {}

  private cacheKey(idEmpresa: number, data: Date): string {
    return `empresa-${idEmpresa}-data-${data.toISOString().slice(0, 10)}`;
  }

  private limparCacheExpirado(): void {
    const now = Date.now();
    for (const [key, entry] of this.cacheVigentePorEmpresa.entries()) {
      if (entry.expires < now) this.cacheVigentePorEmpresa.delete(key);
    }
  }

  /**
   * Normaliza uma data para comparar apenas o dia (remove horas, minutos, segundos e milissegundos)
   * Usa UTC para evitar problemas de timezone
   */
  private normalizarDataParaDia(data: Date): Date {
    // Extrai ano, mês e dia da data e cria nova data em UTC
    const ano = data.getUTCFullYear();
    const mes = data.getUTCMonth();
    const dia = data.getUTCDate();
    return new Date(Date.UTC(ano, mes, dia, 0, 0, 0, 0));
  }

  /**
   * Converte uma ISOString para Date preservando apenas o dia (ignora hora e timezone)
   * Extrai ano, mês e dia da ISOString e cria uma nova data em UTC
   */
  private parseISODatePreservandoDia(isoString: string): Date {
    // Extrai apenas a parte da data (YYYY-MM-DD) da ISOString
    const match = isoString.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!match) {
      throw new BadRequestException(`Formato de data inválido: ${isoString}`);
    }
    const ano = parseInt(match[1], 10);
    const mes = parseInt(match[2], 10) - 1; // Mês é 0-indexed em JavaScript
    const dia = parseInt(match[3], 10);
    
    // Cria data em UTC para preservar exatamente o dia selecionado
    return new Date(Date.UTC(ano, mes, dia, 0, 0, 0, 0));
  }

  /**
   * Ajusta uma data para GMT-3 (fuso horário brasileiro)
   */
  private ajustarDataParaGMT3(data: Date): Date {
    const dataAjustada = new Date(data);
    const offsetGMT3 = 3 * 60 * 60 * 1000; // 3 horas em milissegundos
    dataAjustada.setTime(dataAjustada.getTime() - offsetGMT3);
    return dataAjustada;
  }

  /**
   * Busca a tabela de preço vigente para uma empresa em uma data específica.
   * Considera a vigência da associação empresa-tabela.
   * Se a tabela encontrada for uma versão, busca a versão vigente dentro dela usando a lógica existente.
   * Usa cache de 30s para evitar buscas repetidas durante recálculo de faturas.
   */
  async buscarTabelaPrecoVigentePorEmpresa(idEmpresa: number, data: Date): Promise<TabelaPrecoProduto | null> {
    this.limparCacheExpirado();
    const key = this.cacheKey(idEmpresa, data);
    const cached = this.cacheVigentePorEmpresa.get(key);
    if (cached) return cached.tabela;

    const dataComparacaoGMT3 = this.ajustarDataParaGMT3(data);
    const dataComparacao = this.normalizarDataParaDia(dataComparacaoGMT3);

    // Busca associações vigentes para a empresa na data especificada
    // Cria datas de início e fim do dia para comparação
    const dataComparacaoInicio = new Date(dataComparacao);
    dataComparacaoInicio.setHours(0, 0, 0, 0);
    const dataComparacaoFim = new Date(dataComparacao);
    dataComparacaoFim.setHours(23, 59, 59, 999);

    const associacoesVigentes = await this.empresaTabelaPrecoRepository
      .createQueryBuilder('etp')
      .innerJoinAndSelect('etp.tabelaPrecoProduto', 'tabela')
      .where('etp.idEmpresa = :idEmpresa', { idEmpresa })
      .andWhere('etp.ativo = :ativo', { ativo: 1 })
      .andWhere('etp.dataInicio <= :dataComparacaoFim', { dataComparacaoFim })
      .andWhere('(etp.dataFim IS NULL OR etp.dataFim >= :dataComparacaoInicio)', { dataComparacaoInicio })
      .orderBy('etp.dataInicio', 'DESC')
      .getMany();

    if (associacoesVigentes.length === 0) {
      this.logger.log(`Nenhuma associação vigente encontrada para empresa ${idEmpresa} na data ${data.toISOString()}`);
      return null;
    }

    // Pega a associação mais recente (primeira do resultado ordenado)
    const associacaoVigente = associacoesVigentes[0];
    const tabelaAssociada = associacaoVigente.tabelaPrecoProduto;

    if (!tabelaAssociada || !tabelaAssociada.ativo) {
      this.logger.warn(`Tabela associada ${associacaoVigente.idTabelaPrecoProduto} não está ativa para empresa ${idEmpresa}`);
      return null;
    }

    // Vigência é definida apenas pela associação empresa-tabela (dataInicio/dataFim da EmpresaTabelaPreco).
    // Retornar diretamente a tabela associada, carregada com precoProduto para o cálculo de preços.
    const tabelaVigente = await this.tabelaPrecoProdutoService.buscaTabelaPrecoProdutosPorId(
      tabelaAssociada.idTabelaPrecoProduto!
    );

    if (tabelaVigente) {
      this.cacheVigentePorEmpresa.set(key, { tabela: tabelaVigente, expires: Date.now() + CACHE_TTL_MS });
    }

    return tabelaVigente;
  }

  /**
   * Valida que não há sobreposição de vigências para a mesma empresa
   */
  async validarSobreposicaoVigencia(
    idEmpresa: number,
    dataInicio: Date,
    dataFim: Date | null,
    idExcluir?: number
  ): Promise<void> {
    const dataInicioNormalizada = this.normalizarDataParaDia(dataInicio);
    const dataFimNormalizada = dataFim ? this.normalizarDataParaDia(dataFim) : null;

    const queryBuilder = this.empresaTabelaPrecoRepository
      .createQueryBuilder('etp')
      .where('etp.idEmpresa = :idEmpresa', { idEmpresa })
      .andWhere('etp.ativo = :ativo', { ativo: 1 });

    if (idExcluir) {
      queryBuilder.andWhere('etp.idEmpresaTabelaPreco != :idExcluir', { idExcluir });
    }

    const associacoesExistentes = await queryBuilder.getMany();

    for (const associacao of associacoesExistentes) {
      const assocDataInicio = this.normalizarDataParaDia(new Date(associacao.dataInicio));
      const assocDataFim = associacao.dataFim ? this.normalizarDataParaDia(new Date(associacao.dataFim)) : null;

      // Verifica sobreposição
      const sobrepoe = this.datasSobrepoem(
        dataInicioNormalizada,
        dataFimNormalizada,
        assocDataInicio,
        assocDataFim
      );

      if (sobrepoe) {
        throw new BadRequestException(
          `Já existe uma associação vigente para esta empresa no período de ${assocDataInicio.toLocaleDateString('pt-BR')} ` +
          `a ${assocDataFim ? assocDataFim.toLocaleDateString('pt-BR') : 'indefinidamente'}. ` +
          `Não é possível criar associações com períodos sobrepostos.`
        );
      }
    }
  }

  /**
   * Verifica se dois períodos de datas se sobrepõem
   */
  private datasSobrepoem(
    inicio1: Date,
    fim1: Date | null,
    inicio2: Date,
    fim2: Date | null
  ): boolean {
    // Se o primeiro período não tem fim, ele se sobrepõe se início1 <= fim2 (ou se fim2 é null)
    if (!fim1) {
      return !fim2 || inicio1 <= fim2;
    }

    // Se o segundo período não tem fim, ele se sobrepõe se início2 <= fim1
    if (!fim2) {
      return inicio2 <= fim1;
    }

    // Ambos têm fim: sobrepõem se início1 <= fim2 E início2 <= fim1
    return inicio1 <= fim2 && inicio2 <= fim1;
  }

  /**
   * Cria nova associação empresa-tabela com vigência
   */
  async criarAssociacao(
    currentUser: any,
    idEmpresa: number,
    idTabelaPrecoProduto: number,
    dataInicio: Date,
    dataFim?: Date
  ): Promise<EmpresaTabelaPreco> {
    // As datas já vêm normalizadas do controller em UTC
    // Apenas garantir que estão no início do dia
    const dataInicioNormalizada = this.normalizarDataParaDia(dataInicio);
    const dataFimNormalizada = dataFim ? this.normalizarDataParaDia(dataFim) : null;

    // Validar datas
    if (dataFimNormalizada) {
      if (dataFimNormalizada <= dataInicioNormalizada) {
        throw new BadRequestException('A data de fim deve ser maior que a data de início');
      }
    }

    // Validar que a tabela existe e está ativa
    const tabela = await this.tabelaPrecoProdutoService.buscaTabelaPrecoProdutosPorId(idTabelaPrecoProduto);
    if (!tabela) {
      throw new NotFoundException(`Tabela de preço com ID ${idTabelaPrecoProduto} não encontrada`);
    }
    if (!tabela.ativo) {
      throw new BadRequestException(`Tabela de preço com ID ${idTabelaPrecoProduto} não está ativa`);
    }

    // Validar sobreposição
    await this.validarSobreposicaoVigencia(idEmpresa, dataInicioNormalizada, dataFimNormalizada);

    // Criar associação usando datas normalizadas
    const novaAssociacao = this.empresaTabelaPrecoRepository.create({
      idEmpresa,
      idTabelaPrecoProduto,
      dataInicio: dataInicioNormalizada,
      dataFim: dataFimNormalizada,
      ativo: 1,
      idUsuarioCadastro: currentUser.user.idUsuario,
    });

    const associacaoSalva = await this.empresaTabelaPrecoRepository.save(novaAssociacao);

    // Limpar cache para esta empresa
    this.limparCachePorEmpresa(idEmpresa);

    this.logger.log(
      `Associação criada: Empresa ${idEmpresa} -> Tabela ${idTabelaPrecoProduto} ` +
      `(${dataInicio.toLocaleDateString('pt-BR')} a ${dataFim ? dataFim.toLocaleDateString('pt-BR') : 'indefinidamente'})`
    );

    return associacaoSalva;
  }

  /**
   * Lista todas as associações de uma empresa
   */
  async listarAssociacoesPorEmpresa(idEmpresa: number): Promise<EmpresaTabelaPreco[]> {
    return this.empresaTabelaPrecoRepository.find({
      where: { idEmpresa },
      relations: ['tabelaPrecoProduto', 'empresa'],
      order: { dataInicio: 'DESC' },
    });
  }

  /**
   * Busca uma associação por ID
   */
  async buscarAssociacaoPorId(idEmpresaTabelaPreco: number): Promise<EmpresaTabelaPreco> {
    const associacao = await this.empresaTabelaPrecoRepository.findOne({
      where: { idEmpresaTabelaPreco },
      relations: ['tabelaPrecoProduto', 'empresa'],
    });

    if (!associacao) {
      throw new NotFoundException(`Associação com ID ${idEmpresaTabelaPreco} não encontrada`);
    }

    return associacao;
  }

  /**
   * Atualiza uma associação
   */
  async atualizarAssociacao(
    currentUser: any,
    idEmpresaTabelaPreco: number,
    idTabelaPrecoProduto?: number,
    dataInicio?: Date,
    dataFim?: Date | null
  ): Promise<EmpresaTabelaPreco> {
    const associacao = await this.buscarAssociacaoPorId(idEmpresaTabelaPreco);

    // Normalizar datas se fornecidas, caso contrário usar as existentes
    const dataInicioFinal = dataInicio 
      ? this.normalizarDataParaDia(dataInicio) 
      : this.normalizarDataParaDia(associacao.dataInicio);
    
    const dataFimFinal = dataFim !== undefined 
      ? (dataFim ? this.normalizarDataParaDia(dataFim) : null)
      : (associacao.dataFim ? this.normalizarDataParaDia(associacao.dataFim) : null);

    if (dataFimFinal) {
      if (dataFimFinal <= dataInicioFinal) {
        throw new BadRequestException('A data de fim deve ser maior que a data de início');
      }
    }

    // Validar e atualizar tabela quando fornecida (permite trocar a tabela na edição)
    if (idTabelaPrecoProduto !== undefined && idTabelaPrecoProduto !== null) {
      const tabela = await this.tabelaPrecoProdutoService.buscaTabelaPrecoProdutosPorId(idTabelaPrecoProduto);
      if (!tabela) {
        throw new NotFoundException(`Tabela de preço com ID ${idTabelaPrecoProduto} não encontrada`);
      }
      if (!tabela.ativo) {
        throw new BadRequestException(`Tabela de preço com ID ${idTabelaPrecoProduto} não está ativa`);
      }
      associacao.idTabelaPrecoProduto = idTabelaPrecoProduto;
      associacao.tabelaPrecoProduto = tabela; // Atualizar a relação para o save() persistir o novo ID
    }

    // Validar sobreposição (excluindo a própria associação)
    await this.validarSobreposicaoVigencia(
      associacao.idEmpresa,
      dataInicioFinal,
      dataFimFinal || null,
      idEmpresaTabelaPreco
    );

    // Atualizar campos com datas normalizadas
    if (dataInicio) associacao.dataInicio = dataInicioFinal;
    if (dataFim !== undefined) associacao.dataFim = dataFimFinal;

    const associacaoAtualizada = await this.empresaTabelaPrecoRepository.save(associacao);

    // Limpar cache para esta empresa
    this.limparCachePorEmpresa(associacao.idEmpresa);

    this.logger.log(`Associação ${idEmpresaTabelaPreco} atualizada`);

    return associacaoAtualizada;
  }

  /**
   * Desativa uma associação (soft delete)
   */
  async desativarAssociacao(idEmpresaTabelaPreco: number): Promise<void> {
    const associacao = await this.buscarAssociacaoPorId(idEmpresaTabelaPreco);

    associacao.ativo = 0;
    await this.empresaTabelaPrecoRepository.save(associacao);

    // Limpar cache para esta empresa
    this.limparCachePorEmpresa(associacao.idEmpresa);

    this.logger.log(`Associação ${idEmpresaTabelaPreco} desativada`);
  }

  /**
   * Limpa o cache para uma empresa específica
   */
  private limparCachePorEmpresa(idEmpresa: number): void {
    const keysToDelete: string[] = [];
    for (const key of this.cacheVigentePorEmpresa.keys()) {
      if (key.startsWith(`empresa-${idEmpresa}-`)) {
        keysToDelete.push(key);
      }
    }
    keysToDelete.forEach(key => this.cacheVigentePorEmpresa.delete(key));
  }
}

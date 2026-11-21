import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { TabelaPrecoProduto } from '../domain/tabelaPrecoProduto.entity';
import { PrecoProduto } from '../domain/precoProduto.entity';
import { TabelaPrecoProdutoDto } from '../dto/tabelaPrecoProduto.dto';
import { plainToClass } from 'class-transformer';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';

const CACHE_TTL_MS = 30_000; // 30 segundos - evita buscas repetidas no recálculo de faturas

@Injectable()
export class TabelaPrecoProdutoService{
  private readonly logger = new Logger(TabelaPrecoProdutoService.name);
  private readonly cacheVigentePorMatriz = new Map<string, { tabela: TabelaPrecoProduto; expires: number }>();

  constructor(
    @InjectRepository(TabelaPrecoProduto)
    private readonly tabelaPrecoProdutoRepository: Repository<TabelaPrecoProduto>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  private cacheKey(idTabelaPrecoProduto: number, data: Date): string {
    return `${idTabelaPrecoProduto}-${data.toISOString().slice(0, 10)}`;
  }

  private limparCacheExpirado(): void {
    const now = Date.now();
    for (const [key, entry] of this.cacheVigentePorMatriz.entries()) {
      if (entry.expires < now) this.cacheVigentePorMatriz.delete(key);
    }
  }

  async cadastrarTabelaPrecoProduto(
    currentUser: any,
    tabelaPrecoProdutoDto: TabelaPrecoProdutoDto,
  ): Promise<TabelaPrecoProduto> {
    // Se for versão (tem origem), validar número de versão único
    if (tabelaPrecoProdutoDto.idTabelaPrecoProdutoOrigem && tabelaPrecoProdutoDto.numeroVersao) {
      const versaoExistente = await this.tabelaPrecoProdutoRepository.findOne({
        where: {
          idTabelaPrecoProdutoOrigem: tabelaPrecoProdutoDto.idTabelaPrecoProdutoOrigem,
          numeroVersao: tabelaPrecoProdutoDto.numeroVersao,
          ativo: 1,
        },
      });

      if (versaoExistente && versaoExistente.idTabelaPrecoProduto !== tabelaPrecoProdutoDto.idTabelaPrecoProduto) {
        throw new BadRequestException(
          `Já existe uma versão com o número "${tabelaPrecoProdutoDto.numeroVersao}" para esta tabela matriz.`
        );
      }
    }

    const tabelaProduto = plainToClass(TabelaPrecoProduto, tabelaPrecoProdutoDto);
    if (tabelaPrecoProdutoDto.idTabelaPrecoProdutoOrigem) {
      tabelaProduto.idTabelaPrecoProdutoOrigem = tabelaPrecoProdutoDto.idTabelaPrecoProdutoOrigem;
    }
    if (tabelaPrecoProdutoDto.numeroVersao) {
      tabelaProduto.numeroVersao = tabelaPrecoProdutoDto.numeroVersao;
    }

    tabelaProduto.idUsuarioCadastro = currentUser.user.idUsuario;
    tabelaProduto.precoProduto = tabelaProduto.precoProduto.map((preco) => {
      preco.idUsuarioCadastro = currentUser.user.idUsuario;
      return preco;
    });

    const retornoTabelaDePreco = await this.tabelaPrecoProdutoRepository.save(tabelaProduto);
    this.eventEmitter.emit('preco.changed', currentUser);

    return retornoTabelaDePreco;
  }

  async buscaTabelaPrecoProdutos(): Promise<TabelaPrecoProduto[]> {
    return this.tabelaPrecoProdutoRepository.find({ 
      where: { ativo: 1 },
      relations: ['precoProduto', 'precoProduto.produto', 'versoes'],
      order: { idTabelaPrecoProduto: 'DESC' }
    });
  }

  async buscarTabelasMatriz(): Promise<TabelaPrecoProduto[]> {
    const tabelas = await this.tabelaPrecoProdutoRepository
      .createQueryBuilder('tabela')
      .where('tabela.ativo = :ativo', { ativo: 1 })
      .andWhere('tabela.idTabelaPrecoProdutoOrigem IS NULL')
      .leftJoinAndSelect('tabela.precoProduto', 'precoProduto')
      .leftJoinAndSelect('precoProduto.produto', 'produto')
      .leftJoinAndSelect('tabela.versoes', 'versoes')
      .leftJoinAndSelect('versoes.precoProduto', 'versoesPrecoProduto')
      .leftJoinAndSelect('versoesPrecoProduto.produto', 'versoesProduto')
      .orderBy('tabela.nome', 'ASC')
      .addOrderBy('tabela.idTabelaPrecoProduto', 'DESC')
      .addOrderBy('versoes.idTabelaPrecoProduto', 'ASC')
      .getMany();
    
    console.log('[buscarTabelasMatriz] Total de tabelas encontradas:', tabelas.length);
    tabelas.forEach((tabela, index) => {
      console.log(`[buscarTabelasMatriz] Tabela ${index + 1}: ${tabela.nome}, Versões: ${tabela.versoes?.length || 0}`);
      if (tabela.versoes && tabela.versoes.length > 0) {
        console.log(`[buscarTabelasMatriz] Versões da tabela ${tabela.nome}:`, tabela.versoes.map((v: any) => ({
          id: v.idTabelaPrecoProduto,
          numeroVersao: v.numeroVersao,
          ativo: v.ativo
        })));
      }
    });
    
    return tabelas;
  }

  async buscarVersoesTabela(idTabelaMatriz: number): Promise<TabelaPrecoProduto[]> {
    return this.tabelaPrecoProdutoRepository.find({
      where: {
        ativo: 1,
        idTabelaPrecoProdutoOrigem: idTabelaMatriz,
      },
      relations: ['precoProduto', 'precoProduto.produto'],
      order: { idTabelaPrecoProduto: 'ASC' },
    });
  }

  async criarNovaVersao(
    currentUser: any,
    idTabelaOrigem: number,
    dadosVersao: { numeroVersao: string }
  ): Promise<TabelaPrecoProduto> {
    // Buscar a tabela origem
    const tabelaOrigem = await this.buscaTabelaPrecoProdutosPorId(idTabelaOrigem);
    if (!tabelaOrigem) {
      throw new BadRequestException('Tabela origem não encontrada');
    }

    // Buscar a última versão para copiar os preços
    const versoes = await this.buscarVersoesTabela(idTabelaOrigem);
    const ultimaVersao = versoes.length > 0 ? versoes[versoes.length - 1] : tabelaOrigem;

    // Validar número de versão único
    const versaoExistente = await this.tabelaPrecoProdutoRepository.findOne({
      where: {
        idTabelaPrecoProdutoOrigem: idTabelaOrigem,
        numeroVersao: dadosVersao.numeroVersao,
        ativo: 1,
      },
    });

    if (versaoExistente) {
      throw new BadRequestException(
        `Já existe uma versão com o número "${dadosVersao.numeroVersao}" para esta tabela matriz.`
      );
    }

    // Criar nova versão copiando preços da última versão (vigência fica em EmpresaTabelaPreco)
    const novaVersao = new TabelaPrecoProduto();
    novaVersao.nome = tabelaOrigem.nome;
    novaVersao.idTabelaPrecoProdutoOrigem = idTabelaOrigem;
    novaVersao.numeroVersao = dadosVersao.numeroVersao;
    novaVersao.ativo = 1;
    novaVersao.idUsuarioCadastro = currentUser.user.idUsuario;

    // Copiar preços da última versão criando novos objetos PrecoProduto
    novaVersao.precoProduto = ultimaVersao.precoProduto?.map((preco) => {
      const novoPreco = new PrecoProduto();
      novoPreco.preco = preco.preco;
      novoPreco.idProduto = preco.idProduto;
      novoPreco.ativo = 1;
      novoPreco.idUsuarioCadastro = currentUser.user.idUsuario;
      return novoPreco;
    }) || [];

    const versaoSalva = await this.tabelaPrecoProdutoRepository.save(novaVersao);
    this.eventEmitter.emit('preco.changed', currentUser);

    // Buscar novamente para retornar com relações carregadas
    return await this.buscaTabelaPrecoProdutosPorId(versaoSalva.idTabelaPrecoProduto!);
  }

  async buscaTabelaPrecoProdutosPorId(idTabelaPrecoProduto: number): Promise<TabelaPrecoProduto | null> {
    return this.tabelaPrecoProdutoRepository.findOne({
      where: { idTabelaPrecoProduto },
      relations: ['precoProduto', 'precoProduto.produto'],
    });
  }

  /**
   * Retorna uma tabela de preço ativa (qualquer).
   * Vigência é definida pela associação empresa-tabela; este método é legado.
   */
  async buscarTabelaPrecoVigentePorData(_data?: Date): Promise<TabelaPrecoProduto | null> {
    const tabelas = await this.tabelaPrecoProdutoRepository
      .createQueryBuilder('tabela')
      .where('tabela.ativo = :ativo', { ativo: 1 })
      .andWhere('tabela.idTabelaPrecoProdutoOrigem IS NULL') // apenas matrizes
      .leftJoinAndSelect('tabela.precoProduto', 'precoProduto')
      .leftJoinAndSelect('precoProduto.produto', 'produto')
      .orderBy('tabela.idTabelaPrecoProduto', 'DESC')
      .take(1)
      .getMany();

    return tabelas.length > 0 ? tabelas[0] : null;
  }

  /**
   * Busca a tabela de preço para uma matriz: retorna a versão mais recente (por numeroVersao) ou a própria matriz.
   * Vigência é definida apenas pela associação empresa-tabela (EmpresaTabelaPreco), não mais por datas na tabela.
   * Usa cache de 30s para evitar buscas repetidas durante recálculo de faturas.
   */
  async buscarTabelaPrecoVigentePorMatriz(idTabelaPrecoProduto: number, _data?: Date): Promise<TabelaPrecoProduto | null> {
    this.limparCacheExpirado();
    const key = `${idTabelaPrecoProduto}`;
    const cached = this.cacheVigentePorMatriz.get(key);
    if (cached) return cached.tabela;

    let tabela = await this.buscaTabelaPrecoProdutosPorId(idTabelaPrecoProduto);
    if (!tabela) return null;
    if (!tabela.ativo) return null;

    let idTabelaMatriz: number;
    if (tabela.idTabelaPrecoProdutoOrigem) {
      idTabelaMatriz = tabela.idTabelaPrecoProdutoOrigem;
    } else {
      idTabelaMatriz = tabela.idTabelaPrecoProduto!;
    }

    const tabelaMatriz = await this.buscaTabelaPrecoProdutosPorId(idTabelaMatriz);
    if (!tabelaMatriz || !tabelaMatriz.ativo) return null;

    const versoes = await this.buscarVersoesTabela(idTabelaMatriz);
    if (versoes.length === 0) {
      const resultado = tabelaMatriz;
      this.cacheVigentePorMatriz.set(key, { tabela: resultado, expires: Date.now() + CACHE_TTL_MS });
      return resultado;
    }

    // Retornar a versão com maior numeroVersao (considerando numérico quando possível)
    const versaoMaisRecente = versoes.slice().sort((a, b) => {
      const numA = parseInt(a.numeroVersao || '0', 10);
      const numB = parseInt(b.numeroVersao || '0', 10);
      if (!isNaN(numA) && !isNaN(numB)) return numB - numA;
      return (b.numeroVersao || '').localeCompare(a.numeroVersao || '');
    })[0];

    const resultado = versaoMaisRecente;
    this.cacheVigentePorMatriz.set(key, { tabela: resultado, expires: Date.now() + CACHE_TTL_MS });
    return resultado;
  }

  /**
   * Vigência de tabelas passou a ser apenas em EmpresaTabelaPreco.
   * Retorna array vazio (relatório de “próximas a vencer” não se aplica mais às tabelas).
   */
  async buscarTabelasProximasVencimento(_diasAntecedencia: number = 30): Promise<TabelaPrecoProduto[]> {
    return [];
  }

}


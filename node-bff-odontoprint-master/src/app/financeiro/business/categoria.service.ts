import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Categoria } from '../domain/categoria.entity';
import { CreateCategoriaDto } from '../dto/create-categoria.dto';
import { UpdateCategoriaDto } from '../dto/update-categoria.dto';
import { Lancamento } from '../domain/lancamento.entity';
import { ClassificacaoDre } from '../domain/classificacao-dre.enum';
import { TipoLancamento } from '../domain/tipo-lancamento.enum';

@Injectable()
export class CategoriaService {
  constructor(
    @InjectRepository(Categoria)
    private readonly categoriaRepository: Repository<Categoria>,
    @InjectRepository(Lancamento)
    private readonly lancamentoRepository: Repository<Lancamento>,
  ) {}

  private defaultClassificacaoPorTipo(tipo: TipoLancamento): ClassificacaoDre {
    return tipo === TipoLancamento.RECEITA
      ? ClassificacaoDre.OPERACIONAL_RECEITA
      : ClassificacaoDre.OPERACIONAL_DESPESA;
  }

  private validarClassificacaoDre(tipo: TipoLancamento, classificacao: ClassificacaoDre) {
    const err = () => new BadRequestException(
      `classificacaoDre "${classificacao}" incompatível com tipo "${tipo}".`,
    );

    if (tipo === TipoLancamento.RECEITA) {
      if (
        classificacao !== ClassificacaoDre.OPERACIONAL_RECEITA &&
        classificacao !== ClassificacaoDre.APORTE
      ) {
        throw err();
      }
    } else {
      if (
        classificacao !== ClassificacaoDre.OPERACIONAL_DESPESA &&
        classificacao !== ClassificacaoDre.INVESTIMENTO &&
        classificacao !== ClassificacaoDre.SAIDA_FINANCIAMENTO
      ) {
        throw err();
      }
    }
  }

  async create(dto: CreateCategoriaDto): Promise<Categoria> {
    const { subcategorias, ...rest } = dto;
    const tipo = rest.tipo;
    const classificacaoDre =
      rest.classificacaoDre ?? this.defaultClassificacaoPorTipo(tipo);
    this.validarClassificacaoDre(tipo, classificacaoDre);

    const categoria = this.categoriaRepository.create({
      ...rest,
      classificacaoDre,
    });
    const saved = await this.categoriaRepository.save(categoria);
    if (subcategorias?.length && !saved.idCategoriaPai) {
      for (const sub of subcategorias) {
        const subCat = this.categoriaRepository.create({
          nome: sub.nome,
          tipo: saved.tipo,
          classificacaoDre: saved.classificacaoDre,
          classificacaoDespesa: saved.classificacaoDespesa,
          idCategoriaPai: saved.idCategoria,
        });
        await this.categoriaRepository.save(subCat);
      }
      return this.findOne(saved.idCategoria);
    }
    return saved;
  }

  async findAll(incluirSubcategorias = false): Promise<Categoria[]> {
    const options: any = {
      relations: incluirSubcategorias ? ['categoriaPai', 'subcategorias'] : ['subcategorias'],
      order: { nome: 'ASC' },
    };
    if (!incluirSubcategorias) {
      options.where = { idCategoriaPai: IsNull() };
    }
    return this.categoriaRepository.find(options);
  }

  async findOne(id: number): Promise<Categoria> {
    const categoria = await this.categoriaRepository.findOne({
      where: { idCategoria: id },
      relations: ['categoriaPai', 'subcategorias'],
    });
    if (!categoria) {
      throw new NotFoundException(`Categoria com ID ${id} não encontrada.`);
    }
    return categoria;
  }

  async update(id: number, dto: UpdateCategoriaDto): Promise<Categoria> {
    const categoria = await this.categoriaRepository.findOne({
      where: { idCategoria: id },
      relations: ['subcategorias'],
    });
    if (!categoria) {
      throw new NotFoundException(`Categoria com ID ${id} não encontrada.`);
    }
    const { subcategorias, ...rest } = dto;

    const tipoNovo = rest.tipo ?? categoria.tipo;
    const classificacaoNova =
      rest.classificacaoDre ??
      categoria.classificacaoDre ??
      this.defaultClassificacaoPorTipo(tipoNovo);
    this.validarClassificacaoDre(tipoNovo, classificacaoNova);

    const updatedCategoria = this.categoriaRepository.merge(categoria, {
      ...rest,
      tipo: tipoNovo,
      classificacaoDre: classificacaoNova,
    });
    await this.categoriaRepository.save(updatedCategoria);

    if (subcategorias && !categoria.idCategoriaPai) {
      const existentes = await this.categoriaRepository.find({
        where: { idCategoriaPai: id },
      });

      const nomesNovos = subcategorias.map((s) => s.nome.trim().toUpperCase());
      const nomesAProcessar = new Set(nomesNovos);

      // Processa as subcategorias que jÃ¡ existem
      for (const sub of existentes) {
        const nomeUpper = sub.nome.trim().toUpperCase();

        if (nomesAProcessar.has(nomeUpper)) {
          // Atualiza a subcategoria existente
          const updatedSub = this.categoriaRepository.merge(sub, {
            tipo: updatedCategoria.tipo,
            classificacaoDre: updatedCategoria.classificacaoDre,
            classificacaoDespesa: updatedCategoria.classificacaoDespesa,
          });
          await this.categoriaRepository.save(updatedSub);
          nomesAProcessar.delete(nomeUpper);
        } else {
          // Subcategoria foi removida da lista. Verificar se estÃ¡ em uso.
          const lancamentoEmUso = await this.lancamentoRepository.findOne({
            where: { idCategoria: sub.idCategoria },
          });

          if (lancamentoEmUso) {
            throw new BadRequestException(
              `A subcategoria "${sub.nome}" nÃ£o pode ser removida da lista pois estÃ¡ associada a um ou mais lanÃ§amentos.`,
            );
          } else {
            await this.categoriaRepository.softDelete(sub.idCategoria);
          }
        }
      }

      // Processa as subcategorias que sÃ£o novas
      for (const nomeUpper of nomesAProcessar) {
        // Encontra o nome original (case correto) enviado pelo dto
        const subDto = subcategorias.find((s) => s.nome.trim().toUpperCase() === nomeUpper);
        if (subDto) {
          const subCat = this.categoriaRepository.create({
            nome: subDto.nome,
            tipo: updatedCategoria.tipo,
            classificacaoDre: updatedCategoria.classificacaoDre,
            classificacaoDespesa: updatedCategoria.classificacaoDespesa,
            idCategoriaPai: id,
          });
          await this.categoriaRepository.save(subCat);
        }
      }
    }

    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const categoria = await this.findOne(id);

    // Verifica se a categoria está em uso por algum lançamento
    const lancamentoComCategoria = await this.lancamentoRepository.findOne({
      where: { idCategoria: id },
    });

    if (lancamentoComCategoria) {
      throw new BadRequestException(
        `A categoria "${categoria.nome}" não pode ser removida pois está associada a um ou mais lançamentos.`,
      );
    }

    // Se não estiver em uso, realiza o soft delete
    const result = await this.categoriaRepository.softDelete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`Categoria com ID ${id} não encontrada para remoção.`);
    }
  }
}

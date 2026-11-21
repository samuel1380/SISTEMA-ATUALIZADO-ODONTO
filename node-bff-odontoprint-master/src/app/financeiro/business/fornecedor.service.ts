import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Fornecedor } from '../domain/fornecedor.entity';
import { CreateFornecedorDto } from '../dto/create-fornecedor.dto';
import { UpdateFornecedorDto } from '../dto/update-fornecedor.dto';
import { somenteDigitos } from '../utils/documento-brasil.util';
import { CategoriaService } from './categoria.service';
import { TipoLancamento } from '../domain/tipo-lancamento.enum';

@Injectable()
export class FornecedorService {
  constructor(
    @InjectRepository(Fornecedor)
    private readonly fornecedorRepository: Repository<Fornecedor>,
    private readonly categoriaService: CategoriaService,
  ) {}

  private trimOuUndefined(v: string | undefined | null): string | undefined {
    if (v == null) return undefined;
    const t = String(v).trim();
    return t === '' ? undefined : t;
  }

  private async validarIdCategoriaFornecedor(idCategoria?: number | null): Promise<void> {
    if (idCategoria == null) return;
    const cat = await this.categoriaService.findOne(idCategoria);
    if (cat.tipo !== TipoLancamento.DESPESA) {
      throw new BadRequestException('A categoria do fornecedor deve ser do tipo DESPESA.');
    }
  }

  async criar(dto: CreateFornecedorDto): Promise<Fornecedor> {
    await this.validarIdCategoriaFornecedor(dto.idCategoria);
    const fornecedor = this.fornecedorRepository.create({
      razaoSocial: String(dto.razaoSocial).trim(),
      nomeFantasia: this.trimOuUndefined(dto.nomeFantasia),
      telefone: this.trimOuUndefined(dto.telefone),
      cep: this.trimOuUndefined(dto.cep),
      logradouro: this.trimOuUndefined(dto.logradouro),
      numero: this.trimOuUndefined(dto.numero),
      complemento: this.trimOuUndefined(dto.complemento),
      bairro: this.trimOuUndefined(dto.bairro),
      cidade: this.trimOuUndefined(dto.cidade),
      uf: this.trimOuUndefined(dto.uf),
      cpf: this.trimOuUndefined(dto.cpf),
      cnpj: this.trimOuUndefined(dto.cnpj),
      idCategoria: dto.idCategoria ?? undefined,
      ativo: dto.ativo ?? true,
    });
    return this.fornecedorRepository.save(fornecedor);
  }

  async listar(ativo?: boolean): Promise<Fornecedor[]> {
    const qb = this.fornecedorRepository
      .createQueryBuilder('f')
      .leftJoinAndSelect('f.categoria', 'categoria')
      .orderBy('f.razaoSocial', 'ASC');
    if (ativo !== undefined) {
      qb.andWhere('f.ativo = :ativo', { ativo });
    }
    return qb.getMany();
  }

  async buscarPorId(idFornecedor: number): Promise<Fornecedor> {
    const fornecedor = await this.fornecedorRepository.findOne({
      where: { idFornecedor },
      relations: ['categoria'],
    });
    if (!fornecedor) {
      throw new NotFoundException(`Fornecedor com ID ${idFornecedor} não encontrado.`);
    }
    return fornecedor;
  }

  async atualizar(idFornecedor: number, dto: UpdateFornecedorDto): Promise<Fornecedor> {
    const fornecedor = await this.buscarPorId(idFornecedor);

    if (dto.idCategoria !== undefined) {
      if (dto.idCategoria != null) {
        await this.validarIdCategoriaFornecedor(dto.idCategoria);
      }
      fornecedor.idCategoria = dto.idCategoria == null ? null : dto.idCategoria;
    }

    if (dto.razaoSocial !== undefined) fornecedor.razaoSocial = String(dto.razaoSocial).trim();
    if (dto.nomeFantasia !== undefined) fornecedor.nomeFantasia = this.trimOuUndefined(dto.nomeFantasia);
    if (dto.telefone !== undefined) fornecedor.telefone = this.trimOuUndefined(dto.telefone);
    if (dto.cep !== undefined) fornecedor.cep = this.trimOuUndefined(dto.cep);
    if (dto.logradouro !== undefined) fornecedor.logradouro = this.trimOuUndefined(dto.logradouro);
    if (dto.numero !== undefined) fornecedor.numero = this.trimOuUndefined(dto.numero);
    if (dto.complemento !== undefined) fornecedor.complemento = this.trimOuUndefined(dto.complemento);
    if (dto.bairro !== undefined) fornecedor.bairro = this.trimOuUndefined(dto.bairro);
    if (dto.cidade !== undefined) fornecedor.cidade = this.trimOuUndefined(dto.cidade);
    if (dto.uf !== undefined) fornecedor.uf = this.trimOuUndefined(dto.uf);
    if (dto.ativo !== undefined) fornecedor.ativo = dto.ativo;
    if (dto.cpf !== undefined) fornecedor.cpf = this.trimOuUndefined(dto.cpf);
    if (dto.cnpj !== undefined) fornecedor.cnpj = this.trimOuUndefined(dto.cnpj);
    return this.fornecedorRepository.save(fornecedor);
  }

  async excluir(idFornecedor: number): Promise<void> {
    const fornecedor = await this.buscarPorId(idFornecedor);
    fornecedor.ativo = false;
    await this.fornecedorRepository.save(fornecedor);
  }

  /**
   * Busca por CPF ou CNPJ normalizado (11 ou 14 dígitos), comparando apenas os dígitos
   * armazenados em `cpf` / `cnpj` (permite máscaras no cadastro).
   * Requer MySQL 8+ / MariaDB com REGEXP_REPLACE.
   */
  async buscarPorDocumentoNormalizado(digitos: string): Promise<Fornecedor | null> {
    const d = somenteDigitos(digitos);
    if (d.length === 11) {
      const rows = await this.fornecedorRepository
        .createQueryBuilder('f')
        .leftJoinAndSelect('f.categoria', 'categoria')
        .where("REGEXP_REPLACE(COALESCE(f.cpf, ''), '[^0-9]', '') = :d", { d })
        .orderBy('f.idFornecedor', 'ASC')
        .take(1)
        .getMany();
      return rows[0] ?? null;
    }
    if (d.length === 14) {
      const rows = await this.fornecedorRepository
        .createQueryBuilder('f')
        .leftJoinAndSelect('f.categoria', 'categoria')
        .where("REGEXP_REPLACE(COALESCE(f.cnpj, ''), '[^0-9]', '') = :d", { d })
        .orderBy('f.idFornecedor', 'ASC')
        .take(1)
        .getMany();
      return rows[0] ?? null;
    }
    return null;
  }

  /**
   * Usado na importação OFX: cria fornecedor com nome padrão quando o documento ainda não existe.
   * Persiste apenas os dígitos do documento no campo correspondente (origem confiável do extrato).
   */
  async criarFornecedorImportacaoOfx(tipo: 'CPF' | 'CNPJ', digitos: string): Promise<Fornecedor> {
    const d = somenteDigitos(digitos);
    if (tipo === 'CPF') {
      if (d.length !== 11) throw new BadRequestException('CPF inválido para cadastro OFX (esperados 11 dígitos).');
      const hint = `**.***.**${d.slice(6, 9)}-${d.slice(9)}`;
      const f = this.fornecedorRepository.create({
        razaoSocial: `Fornecedor OFX — completar cadastro (CPF ${hint})`,
        cpf: d,
        ativo: true,
      });
      return this.fornecedorRepository.save(f);
    }
    if (d.length !== 14) throw new BadRequestException('CNPJ inválido para cadastro OFX (esperados 14 dígitos).');
    const hint = `**.***.***/${d.slice(8, 12)}-**`;
    const f = this.fornecedorRepository.create({
      razaoSocial: `Fornecedor OFX — completar cadastro (CNPJ ${hint})`,
      cnpj: d,
      ativo: true,
    });
    return this.fornecedorRepository.save(f);
  }
}

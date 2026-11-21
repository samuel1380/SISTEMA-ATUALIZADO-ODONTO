import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { OrdemServico } from '../domain/ordemServico.entity';
import { OrdemServicoDto } from '../dto/ordemServico.dto';


@Injectable()
export class OrdemServicoService {
  constructor(
    @InjectRepository(OrdemServico)
    private readonly ordemServicoRepository: Repository<OrdemServico>,
  ) {}

  /** Busca ordens de serviço por vários idTrabalho em uma única query (uso em recálculo em lote). */
  async buscarPorIdTrabalhos(idTrabalhos: number[]): Promise<OrdemServico[]> {
    if (idTrabalhos.length === 0) return [];
    return this.ordemServicoRepository.find({
      where: { idTrabalho: In(idTrabalhos) },
      relations: ['itens'],
    });
  }

  async cadastrar(
    currentUser: any,
    ordensServico: OrdemServico[],
  ): Promise<OrdemServico[]> {
    // O método save lida tanto com inserção quanto com atualização (upsert)
    return this.ordemServicoRepository.save(ordensServico);
  }

  async buscarAtivos(): Promise<OrdemServico[]> {
    return this.ordemServicoRepository.find({ where: { ativo: true } });
  }

  async editar(
    idOrdemServico: number,
    ordemServicoDto: QueryDeepPartialEntity<OrdemServico>,
  ): Promise<void> {
    const result = await this.ordemServicoRepository.update(idOrdemServico, ordemServicoDto);
    if (result.affected === 0) {
      throw new NotFoundException(`Ordem de Serviço com ID ${idOrdemServico} não encontrada.`);
    }
  }

  async buscarPorId(idOrdemServico: number): Promise<OrdemServico | null> {
    return this.ordemServicoRepository.findOne({ where: { idOrdemServico } });
  }

  async buscarPorIdTrabalho(idTrabalho: number): Promise<OrdemServico | null> {
    return this.ordemServicoRepository.findOne({ where: { idTrabalho } });
  }
}

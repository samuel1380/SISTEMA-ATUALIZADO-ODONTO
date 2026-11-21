import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Retirada, TipoRetirada } from '../domain/retirada.entity';
import { FinanceiroService } from './financeiro.service';
import { TipoLancamento } from '../domain/tipo-lancamento.enum';
import { MeioPagamento } from '../domain/parcela.entity';
import { CreateRetiradaDto } from '../dto/create-retirada.dto';

@Injectable()
export class RetiradaService {
  constructor(
    @InjectRepository(Retirada)
    private readonly retiradaRepository: Repository<Retirada>,
    private readonly financeiroService: FinanceiroService,
    private readonly dataSource: DataSource,
  ) {}

  async registrarRetirada(dto: CreateRetiradaDto): Promise<Retirada> {
    return this.dataSource.transaction(async manager => {
      const retiradaRepo = manager.getRepository(Retirada);

      // Criar lançamento financeiro (DESPESA)
      const dataCompetencia = new Date(dto.dataRetirada);
      const dataVencimento = new Date(dto.dataRetirada);

      const tipoRetirada = dto.tipo as TipoRetirada;
      const descricao =
        tipoRetirada === TipoRetirada.RETIRADA_CAPITAL
          ? `Retirada de Capital${dto.idSocio ? ` - Sócio ID ${dto.idSocio}` : ''}`
          : tipoRetirada === TipoRetirada.DISTRIBUICAO_LUCROS
            ? `Distribuição de Lucros${dto.idSocio ? ` - Sócio ID ${dto.idSocio}` : ''}`
            : `Retirada${dto.idSocio ? ` - Sócio ID ${dto.idSocio}` : ''}`;

      const lancamento = await this.financeiroService.criarLancamento({
        descricao,
        tipo: TipoLancamento.DESPESA,
        valorTotal: dto.valor,
        dataCompetencia: dataCompetencia.toISOString().split('T')[0],
        idCategoria: dto.idCategoria,
        idClienteFornecedor: dto.idSocio,
        parcelas: [
          {
            numeroParcela: 1,
            valor: dto.valor,
            dataVencimento: dataVencimento.toISOString().split('T')[0],
            meioPagamento:
              (dto.meioPagamento as MeioPagamento) || MeioPagamento.TRANSFERENCIA,
          },
        ],
        pagamentoImediato: dto.idConta
          ? {
              idConta: dto.idConta,
              dataPagamento: dto.dataRetirada,
            }
          : undefined,
      });

      // Criar registro de retirada
      const retirada = retiradaRepo.create({
        idLancamento: lancamento.idLancamento,
        idSocio: dto.idSocio,
        dataRetirada: new Date(dto.dataRetirada),
        valor: dto.valor,
        tipo: tipoRetirada,
        observacoes: dto.observacoes,
      });

      return retiradaRepo.save(retirada);
    });
  }

  async listarRetiradas(
    idSocio?: number,
    dataInicio?: string,
    dataFim?: string,
    tipo?: TipoRetirada,
  ): Promise<Retirada[]> {
    const queryBuilder = this.retiradaRepository
      .createQueryBuilder('retirada')
      .leftJoinAndSelect('retirada.lancamento', 'lancamento')
      .orderBy('retirada.dataRetirada', 'DESC');

    if (idSocio) {
      queryBuilder.andWhere('retirada.idSocio = :idSocio', { idSocio });
    }

    if (dataInicio) {
      queryBuilder.andWhere('retirada.dataRetirada >= :dataInicio', { dataInicio });
    }

    if (dataFim) {
      queryBuilder.andWhere('retirada.dataRetirada <= :dataFim', { dataFim });
    }

    if (tipo) {
      queryBuilder.andWhere('retirada.tipo = :tipo', { tipo });
    }

    return queryBuilder.getMany();
  }

  async buscarRetiradaPorId(id: number): Promise<Retirada> {
    const retirada = await this.retiradaRepository.findOne({
      where: { idRetirada: id },
      relations: ['lancamento'],
    });

    if (!retirada) {
      throw new NotFoundException(`Retirada com ID ${id} não encontrada.`);
    }

    return retirada;
  }
}

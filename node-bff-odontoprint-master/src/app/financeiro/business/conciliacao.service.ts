import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { TransacaoOfx, StatusConciliacao } from '../domain/transacao-ofx.entity';
import { ConciliacaoTransacao, TipoVinculo } from '../domain/conciliacao-transacao.entity';
import { Movimentacao } from '../domain/movimentacao.entity';
import { Aporte } from '../domain/aporte.entity';
import { Retirada } from '../domain/retirada.entity';
import { VincularConciliacaoDto } from '../dto/vincular-conciliacao.dto';
import { FiltroConciliacaoDto } from '../dto/filtro-conciliacao.dto';

@Injectable()
export class ConciliacaoService {
  constructor(
    @InjectRepository(TransacaoOfx)
    private readonly transacaoOfxRepository: Repository<TransacaoOfx>,
    @InjectRepository(ConciliacaoTransacao)
    private readonly conciliacaoRepository: Repository<ConciliacaoTransacao>,
    @InjectRepository(Movimentacao)
    private readonly movimentacaoRepository: Repository<Movimentacao>,
    @InjectRepository(Aporte)
    private readonly aporteRepository: Repository<Aporte>,
    @InjectRepository(Retirada)
    private readonly retiradaRepository: Repository<Retirada>,
    private readonly dataSource: DataSource,
  ) {}

  async listarTransacoesNaoConciliadas(filtros: FiltroConciliacaoDto): Promise<TransacaoOfx[]> {
    const queryBuilder = this.transacaoOfxRepository
      .createQueryBuilder('transacao')
      .leftJoinAndSelect('transacao.conta', 'conta')
      .leftJoinAndSelect('transacao.arquivoOfx', 'arquivo')
      .where('transacao.statusConciliacao = :status', { status: StatusConciliacao.PENDENTE });

    if (filtros.idConta) {
      queryBuilder.andWhere('transacao.idConta = :idConta', { idConta: filtros.idConta });
    }

    if (filtros.dataInicio) {
      queryBuilder.andWhere('transacao.dataTransacao >= :dataInicio', {
        dataInicio: filtros.dataInicio,
      });
    }

    if (filtros.dataFim) {
      queryBuilder.andWhere('transacao.dataTransacao <= :dataFim', {
        dataFim: filtros.dataFim,
      });
    }

    if (filtros.tipo) {
      queryBuilder.andWhere('transacao.tipo = :tipo', { tipo: filtros.tipo });
    }

    if (filtros.valorMin !== undefined) {
      queryBuilder.andWhere('transacao.valor >= :valorMin', { valorMin: filtros.valorMin });
    }

    if (filtros.valorMax !== undefined) {
      queryBuilder.andWhere('transacao.valor <= :valorMax', { valorMax: filtros.valorMax });
    }

    queryBuilder.orderBy('transacao.dataTransacao', 'DESC');

    return queryBuilder.getMany();
  }

  async listarMovimentacoesDisponiveis(filtros: FiltroConciliacaoDto): Promise<Movimentacao[]> {
    // Buscar IDs de movimentações já conciliadas
    const movimentacoesConciliadas = await this.conciliacaoRepository
      .createQueryBuilder('conciliacao')
      .select('conciliacao.idMovimentacao')
      .where('conciliacao.idMovimentacao IS NOT NULL')
      .getRawMany();

    const idsConciliadas = movimentacoesConciliadas
      .map(m => m.conciliacao_idMovimentacao)
      .filter(id => id !== null && id !== undefined);

    const queryBuilder = this.movimentacaoRepository
      .createQueryBuilder('movimentacao')
      .leftJoinAndSelect('movimentacao.conta', 'conta');

    if (idsConciliadas.length > 0) {
      queryBuilder.where('movimentacao.idMovimentacao NOT IN (:...ids)', { ids: idsConciliadas });
    }

    if (filtros.idConta) {
      if (idsConciliadas.length > 0) {
        queryBuilder.andWhere('movimentacao.idConta = :idConta', { idConta: filtros.idConta });
      } else {
        queryBuilder.where('movimentacao.idConta = :idConta', { idConta: filtros.idConta });
      }
    }

    if (filtros.dataInicio) {
      queryBuilder.andWhere('movimentacao.dataMovimentacao >= :dataInicio', {
        dataInicio: filtros.dataInicio,
      });
    }

    if (filtros.dataFim) {
      queryBuilder.andWhere('movimentacao.dataMovimentacao <= :dataFim', {
        dataFim: filtros.dataFim,
      });
    }

    if (filtros.tipo) {
      const tipoMovimentacao =
        filtros.tipo === 'CREDITO' ? 'CREDITO' : filtros.tipo === 'DEBITO' ? 'DEBITO' : null;
      if (tipoMovimentacao) {
        queryBuilder.andWhere('movimentacao.tipo = :tipo', { tipo: tipoMovimentacao });
      }
    }

    if (filtros.valorMin !== undefined) {
      queryBuilder.andWhere('movimentacao.valor >= :valorMin', { valorMin: filtros.valorMin });
    }

    if (filtros.valorMax !== undefined) {
      queryBuilder.andWhere('movimentacao.valor <= :valorMax', { valorMax: filtros.valorMax });
    }

    queryBuilder.orderBy('movimentacao.dataMovimentacao', 'DESC');

    return queryBuilder.getMany();
  }

  async buscarSugestoes(idTransacaoOfx: number): Promise<any[]> {
    const transacao = await this.transacaoOfxRepository.findOne({
      where: { idTransacaoOfx },
      relations: ['conta'],
    });

    if (!transacao) {
      throw new NotFoundException(`Transação OFX com ID ${idTransacaoOfx} não encontrada.`);
    }

    // Buscar movimentações com valor similar (±0.01) e data próxima (±3 dias)
    const valorMin = Number(transacao.valor) - 0.01;
    const valorMax = Number(transacao.valor) + 0.01;
    const dataInicio = new Date(transacao.dataTransacao);
    dataInicio.setDate(dataInicio.getDate() - 3);
    const dataFim = new Date(transacao.dataTransacao);
    dataFim.setDate(dataFim.getDate() + 3);

    // Buscar IDs de movimentações já conciliadas
    const movimentacoesConciliadas = await this.conciliacaoRepository
      .createQueryBuilder('conciliacao')
      .select('conciliacao.idMovimentacao')
      .where('conciliacao.idMovimentacao IS NOT NULL')
      .getRawMany();

    const idsConciliadas = movimentacoesConciliadas
      .map(m => m.conciliacao_idMovimentacao)
      .filter(id => id !== null && id !== undefined);

    const queryBuilder = this.movimentacaoRepository
      .createQueryBuilder('movimentacao')
      .leftJoinAndSelect('movimentacao.conta', 'conta')
      .where('movimentacao.idConta = :idConta', { idConta: transacao.idConta })
      .andWhere('movimentacao.valor BETWEEN :valorMin AND :valorMax', { valorMin, valorMax })
      .andWhere('movimentacao.dataMovimentacao BETWEEN :dataInicio AND :dataFim', {
        dataInicio,
        dataFim,
      });

    if (idsConciliadas.length > 0) {
      queryBuilder.andWhere('movimentacao.idMovimentacao NOT IN (:...ids)', { ids: idsConciliadas });
    }

    const movimentacoes = await queryBuilder
      .orderBy('ABS(DATEDIFF(movimentacao.dataMovimentacao, :dataTransacao))', 'ASC')
      .setParameter('dataTransacao', transacao.dataTransacao)
      .limit(10)
      .getMany();

    // Calcular score de similaridade
    return movimentacoes.map(mov => {
      const diffValor = Math.abs(Number(mov.valor) - Number(transacao.valor));
      const diffDias = Math.abs(
        Math.floor(
          (new Date(mov.dataMovimentacao).getTime() -
            new Date(transacao.dataTransacao).getTime()) /
            (1000 * 60 * 60 * 24),
        ),
      );
      const score = 100 - diffValor * 10 - diffDias * 5; // Score máximo 100

      return {
        ...mov,
        tipoVinculo: TipoVinculo.MOVIMENTACAO,
        score: Math.max(0, score),
        diffValor,
        diffDias,
      };
    });
  }

  async vincularConciliacao(
    dto: VincularConciliacaoDto,
    idUsuario: number,
  ): Promise<ConciliacaoTransacao> {
    return this.dataSource.transaction(async manager => {
      const transacaoRepo = manager.getRepository(TransacaoOfx);
      const conciliacaoRepo = manager.getRepository(ConciliacaoTransacao);
      const movimentacaoRepo = manager.getRepository(Movimentacao);
      const aporteRepo = manager.getRepository(Aporte);
      const retiradaRepo = manager.getRepository(Retirada);

      // Verificar se a transação existe e não está conciliada
      const transacao = await transacaoRepo.findOne({
        where: { idTransacaoOfx: dto.idTransacaoOfx },
        relations: ['conciliacao'],
      });

      if (!transacao) {
        throw new NotFoundException(
          `Transação OFX com ID ${dto.idTransacaoOfx} não encontrada.`,
        );
      }

      if (transacao.statusConciliacao === StatusConciliacao.CONCILIADO) {
        throw new BadRequestException('Esta transação já está conciliada.');
      }

      if (transacao.conciliacao) {
        throw new BadRequestException('Esta transação já possui uma conciliação.');
      }

      // Validar tipo de vínculo e IDs correspondentes
      let idMovimentacao: number | undefined;
      let idAporte: number | undefined;
      let idRetirada: number | undefined;

      switch (dto.tipoVinculo) {
        case TipoVinculo.MOVIMENTACAO:
          if (!dto.idMovimentacao) {
            throw new BadRequestException('ID da movimentação é obrigatório para este tipo de vínculo.');
          }
          const movimentacao = await movimentacaoRepo.findOneBy({
            idMovimentacao: dto.idMovimentacao,
          });
          if (!movimentacao) {
            throw new NotFoundException(`Movimentação com ID ${dto.idMovimentacao} não encontrada.`);
          }
          idMovimentacao = dto.idMovimentacao;
          break;

        case TipoVinculo.APORTE:
          if (!dto.idAporte) {
            throw new BadRequestException('ID do aporte é obrigatório para este tipo de vínculo.');
          }
          const aporte = await aporteRepo.findOneBy({ idAporte: dto.idAporte });
          if (!aporte) {
            throw new NotFoundException(`Aporte com ID ${dto.idAporte} não encontrado.`);
          }
          idAporte = dto.idAporte;
          break;

        case TipoVinculo.RETIRADA:
          if (!dto.idRetirada) {
            throw new BadRequestException('ID da retirada é obrigatório para este tipo de vínculo.');
          }
          const retirada = await retiradaRepo.findOneBy({ idRetirada: dto.idRetirada });
          if (!retirada) {
            throw new NotFoundException(`Retirada com ID ${dto.idRetirada} não encontrada.`);
          }
          idRetirada = dto.idRetirada;
          break;

        default:
          throw new BadRequestException(`Tipo de vínculo inválido: ${dto.tipoVinculo}`);
      }

      // Criar conciliação
      const conciliacao = conciliacaoRepo.create({
        idTransacaoOfx: dto.idTransacaoOfx,
        idMovimentacao,
        idAporte,
        idRetirada,
        tipoVinculo: dto.tipoVinculo,
        idUsuarioConciliacao: idUsuario,
        observacoes: dto.observacoes,
      });

      const conciliacaoSalva = await conciliacaoRepo.save(conciliacao);

      // Atualizar status da transação
      transacao.statusConciliacao = StatusConciliacao.CONCILIADO;
      transacao.dataConciliacao = new Date();
      await transacaoRepo.save(transacao);

      return conciliacaoSalva;
    });
  }

  async desfazerConciliacao(idConciliacao: number): Promise<void> {
    return this.dataSource.transaction(async manager => {
      const conciliacaoRepo = manager.getRepository(ConciliacaoTransacao);
      const transacaoRepo = manager.getRepository(TransacaoOfx);

      const conciliacao = await conciliacaoRepo.findOne({
        where: { idConciliacao },
        relations: ['transacaoOfx'],
      });

      if (!conciliacao) {
        throw new NotFoundException(`Conciliação com ID ${idConciliacao} não encontrada.`);
      }

      // Atualizar status da transação para PENDENTE
      if (conciliacao.transacaoOfx) {
        conciliacao.transacaoOfx.statusConciliacao = StatusConciliacao.PENDENTE;
        conciliacao.transacaoOfx.dataConciliacao = null;
        await transacaoRepo.save(conciliacao.transacaoOfx);
      }

      // Excluir conciliação
      await conciliacaoRepo.delete({ idConciliacao });
    });
  }

  async ignorarTransacao(idTransacaoOfx: number): Promise<void> {
    const transacao = await this.transacaoOfxRepository.findOneBy({ idTransacaoOfx });

    if (!transacao) {
      throw new NotFoundException(`Transação OFX com ID ${idTransacaoOfx} não encontrada.`);
    }

    if (transacao.statusConciliacao === StatusConciliacao.CONCILIADO) {
      throw new BadRequestException('Não é possível ignorar uma transação já conciliada.');
    }

    transacao.statusConciliacao = StatusConciliacao.IGNORADO;
    await this.transacaoOfxRepository.save(transacao);
  }
}

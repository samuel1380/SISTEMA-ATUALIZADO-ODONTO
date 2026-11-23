import { BadRequestException, Injectable, Logger, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OnEvent } from '@nestjs/event-emitter';
import { OrdemServico, StatusOrdemServico } from '@src/app/ordemServico/domain/ordemServico.entity';
import { DataSource, EntityManager, IsNull, Repository, Between, In, FindOptionsWhere, Not, Like } from 'typeorm';
import { Fatura, StatusFatura } from '../domain/fatura.entity';
import { CreateFaturaDto } from '../dto/create-fatura.dto';
import { AtualizarPeriodoFaturaDto } from '../dto/atualizar-periodo-fatura.dto';
import { FinanceiroService } from './financeiro.service';
import { MeioPagamento } from '../domain/parcela.entity';
import { TipoLancamento } from '../domain/tipo-lancamento.enum';
import { OrdemServicoItem, StatusOrdemServicoItem, TipoCobranca } from '@src/app/ordemServico/domain/ordemServicoItem.entity';
import { PagarItensFaturaDto } from '../dto/pagar-item-fatura.dto';
import { MoverOrdemServicoFaturaDto } from '../dto/mover-ordem-servico-fatura.dto';
import { LancarValorFaturaDto } from '../dto/lancar-valor-fatura.dto';
import { DividirFaturaDto } from '../dto/dividir-fatura.dto';
import { Conta } from '../domain/conta.entity';
import { Movimentacao, TipoMovimentacao } from '../domain/movimentacao.entity';
import { StatusTrabalho, Trabalho } from '@src/app/trabalho/domain/trabalho.entity';
import { Lancamento, StatusLancamento } from '../domain/lancamento.entity';
import { Parcela, StatusParcela } from '../domain/parcela.entity';
import { TrabalhoService } from '@src/app/trabalho/business/trabalho.service';
import { DevolucaoComponente, StatusDevolucao } from '../domain/devolucao-componente.entity';
import { FaturaDevolucaoItem } from '../domain/fatura-devolucao-item.entity';
import { Componente } from '@src/app/componente/domain/componente.entity';
import { extrairAnoMesDia, formatDataYYYYMMDD, parseDataParaDataLocal } from '../utils/data-financeiro.util';

/** Formata data em YYYY-MM-DD sem deslocamento por fuso horário. */
function formatDataLocalYYYYMMDD(d: Date | string | null | undefined): string {
  return formatDataYYYYMMDD(d);
}

@Injectable()
export class FaturaService {
  private readonly logger = new Logger(FaturaService.name);
  private readonly recalculosEmAndamento = new Set<number>(); // Proteção contra loops

  constructor(
    @InjectRepository(Fatura)
    private readonly faturaRepository: Repository<Fatura>,
    @InjectRepository(OrdemServico)
    private readonly osRepository: Repository<OrdemServico>,
    @InjectRepository(OrdemServicoItem)
    private readonly osItemRepository: Repository<OrdemServicoItem>,
    @InjectRepository(Trabalho)
    private readonly trabalhoRepository: Repository<Trabalho>,
    private readonly financeiroService: FinanceiroService,
    private readonly dataSource: DataSource,
    @Inject(forwardRef(() => TrabalhoService))
    private readonly trabalhoService: TrabalhoService,
    @InjectRepository(FaturaDevolucaoItem)
    private readonly faturaDevolucaoItemRepository: Repository<FaturaDevolucaoItem>,
    @InjectRepository(Componente)
    private readonly componenteRepository: Repository<Componente>,
  ) {}

  async criarFatura(dto: CreateFaturaDto): Promise<Fatura> {
    return this.dataSource.transaction(async (manager) => {
      const faturaRepo = manager.getRepository(Fatura);
      const osRepo = manager.getRepository(OrdemServico);
      const osItemRepo = manager.getRepository(OrdemServicoItem);

      // Converte as strings de data para objetos Date, ignorando o fuso horário para comparação de data pura.
      const dataInicio = new Date(`${dto.dataInicio}T00:00:00`);
      const dataFim = new Date(`${dto.dataFim}T00:00:00`);

      // Validação: Verifica se já existe uma fatura aberta para o mesmo período e empresa.
      const faturaExistente = await faturaRepo.findOne({
        where: {
          idEmpresa: dto.idEmpresa,
          status: StatusFatura.ABERTA,
          dataInicio: dataInicio,
          dataFim: dataFim,
        },
      });

      if (faturaExistente) {
        this.logger.log(`Fatura aberta (ID: ${faturaExistente.idFatura}) encontrada. Verificando novas OS para adicionar...`);

        const dataFimBusca = new Date(`${dto.dataFim}T23:59:59.999`);

        const novasOrdensParaAdicionar = await osRepo.find({
          where: {
            idEmpresa: dto.idEmpresa,
            fatura: IsNull(), // Apenas OS que ainda não estão em nenhuma fatura
            status: StatusOrdemServico.RECEBER,
            concluido: true,
            dataConcluido: Between(dataInicio, dataFimBusca),
          },
        });

        if (novasOrdensParaAdicionar.length === 0) {
          this.logger.log('Nenhuma nova Ordem de Serviço encontrada para adicionar à fatura existente.');
          return faturaExistente;
        }

        const valorNovasOrdens = novasOrdensParaAdicionar.reduce((sum, os) => sum + Number(os.valorTotal), 0);
        const valorBruto = Number(faturaExistente.valorTotalBruto || faturaExistente.valorTotal) + valorNovasOrdens;
        const desconto = Number(faturaExistente.desconto || 0);
        faturaExistente.valorTotalBruto = valorBruto;
        faturaExistente.valorTotal = Math.max(0, valorBruto - desconto);
        await osRepo.update(novasOrdensParaAdicionar.map(os => os.idOrdemServico), { fatura: faturaExistente });

        // Atualiza o status dos itens das novas OS para FATURADO, mas preserva itens DEVOLVIDOS
        const idsNovasOs = novasOrdensParaAdicionar.map(os => os.idOrdemServico);
        const itensNovasOs = await osItemRepo.find({
          where: {
            ordemServico: { idOrdemServico: In(idsNovasOs) },
            status: Not(StatusOrdemServicoItem.DEVOLVIDO)
          }
        });
        const idsItensParaAtualizar = itensNovasOs.map(item => item.idOrdemServicoItem);
        if (idsItensParaAtualizar.length > 0) {
          await osItemRepo.update(
            { idOrdemServicoItem: In(idsItensParaAtualizar) },
            { status: StatusOrdemServicoItem.FATURADO }
          );
        }

        return faturaRepo.save(faturaExistente);
      }

      const dataFimBusca = new Date(`${dto.dataFim}T23:59:59.999`); // Garante que a busca por OS inclua o dia todo no fuso local
      // 1. Busca as OS concluídas e não faturadas dentro do período especificado.
      const ordensParaFaturar = await osRepo.find({
        where: {
          idEmpresa: dto.idEmpresa,
          fatura: IsNull(),
          status: StatusOrdemServico.RECEBER,
          concluido: true,
          // Filtra as OS pela data em que foram concluídas
          dataConcluido: Between(dataInicio, dataFimBusca),
        },
      });

      if (ordensParaFaturar.length === 0) {
        throw new NotFoundException(`Nenhuma Ordem de Serviço concluída e pendente de faturamento encontrada para a empresa ${dto.idEmpresa} no período de ${dto.dataInicio} a ${dto.dataFim}.`);
      }

      // 2. Calcular o valor total e a data de vencimento
      const valorTotal = ordensParaFaturar.reduce((sum, os) => sum + Number(os.valorTotal), 0);
      const dataVencimento = new Date(dataFim.getFullYear(), dataFim.getMonth() + 1, 20);

      // 3. Criar a nova fatura
      const novaFatura = faturaRepo.create({
        idEmpresa: dto.idEmpresa,
        dataInicio: dataInicio,
        dataFim: dataFim,
        dataVencimento: dataVencimento,
        valorTotalBruto: valorTotal,
        desconto: 0,
        valorTotal: valorTotal,
        status: StatusFatura.ABERTA,
        ordensDeServico: ordensParaFaturar,
      });

      const faturaSalva = await faturaRepo.save(novaFatura);

      // 4. Vincular as OS à nova fatura
      const idsOs = ordensParaFaturar.map((os) => os.idOrdemServico);
      await osRepo.update(idsOs, { fatura: faturaSalva });

      // 5. Atualiza o status de todos os itens para FATURADO, mas preserva itens DEVOLVIDOS
      const idsItens = ordensParaFaturar.flatMap(os => os.itens.map(item => item.idOrdemServicoItem));
      const itensParaAtualizar = await osItemRepo.find({
        where: {
          idOrdemServicoItem: In(idsItens),
          status: Not(StatusOrdemServicoItem.DEVOLVIDO)
        }
      });
      const idsItensParaAtualizar = itensParaAtualizar.map(item => item.idOrdemServicoItem);
      if (idsItensParaAtualizar.length > 0) {
        await osItemRepo.update(
          { idOrdemServicoItem: In(idsItensParaAtualizar) },
          { status: StatusOrdemServicoItem.FATURADO }
        );
      }

      return faturaSalva;
    });
  }

  async removerItemDaFatura(idFatura: number, idOrdemServico: number): Promise<Fatura> {
    return this.dataSource.transaction(async (manager) => {
        const faturaRepo = manager.getRepository(Fatura);
        const osRepo = manager.getRepository(OrdemServico);

        const fatura = await faturaRepo.findOne({ where: { idFatura }, relations: ['ordensDeServico']});
        if (!fatura) throw new NotFoundException(`Fatura com ID ${idFatura} não encontrada.`);
        if (fatura.status !== StatusFatura.ABERTA) throw new BadRequestException('Não é possível alterar uma fatura que não está aberta.');

        const osParaRemover = await osRepo.findOneBy({ idOrdemServico, fatura: { idFatura } });
        if (!osParaRemover) throw new NotFoundException(`Ordem de Serviço ${idOrdemServico} não encontrada nesta fatura.`);

        // Desvincula a OS da fatura
        await osRepo.update(idOrdemServico, { fatura: null });

        // Recalcula o total da fatura (aplica desconto após subtrair)
        const valorBruto = Number(fatura.valorTotalBruto || fatura.valorTotal) - Number(osParaRemover.valorTotal);
        const desconto = Number(fatura.desconto || 0);
        fatura.valorTotalBruto = valorBruto;
        fatura.valorTotal = Math.max(0, valorBruto - desconto);
        await faturaRepo.save(fatura);

        // Retorna a fatura atualizada sem o item removido
        fatura.ordensDeServico = fatura.ordensDeServico.filter(os => os.idOrdemServico !== idOrdemServico);
        return fatura;
    });
  }

  async moverOrdemServicoFatura(dto: MoverOrdemServicoFaturaDto): Promise<Fatura> {
    return this.dataSource.transaction(async (manager) => {
      const faturaRepo = manager.getRepository(Fatura);
      const osRepo = manager.getRepository(OrdemServico);
      const osItemRepo = manager.getRepository(OrdemServicoItem);

      // 1. Buscar a Ordem de Serviço
      const ordemServico = await osRepo.findOne({
        where: { idOrdemServico: dto.idOrdemServico },
        relations: ['fatura', 'empresa'],
      });

      if (!ordemServico) {
        throw new NotFoundException(`Ordem de Serviço com ID ${dto.idOrdemServico} não encontrada.`);
      }

      // Valida se a empresa informada corresponde à empresa da Ordem de Serviço
      if (ordemServico.idEmpresa !== dto.idEmpresa) {
        throw new BadRequestException(`A Ordem de Serviço pertence à empresa ${ordemServico.idEmpresa}, mas foi informada a empresa ${dto.idEmpresa}.`);
      }

      const idEmpresa = dto.idEmpresa;
      let faturaOrigem: Fatura | null = null;

      // 2. Se a OS está em uma fatura, remover dela
      if (ordemServico.fatura) {
        faturaOrigem = await faturaRepo.findOne({
          where: { idFatura: ordemServico.fatura.idFatura },
        });

        if (!faturaOrigem) {
          throw new NotFoundException(`Fatura de origem não encontrada.`);
        }

        if (faturaOrigem.status !== StatusFatura.ABERTA && faturaOrigem.status !== StatusFatura.PAGA_PARCIALMENTE) {
          throw new BadRequestException('Não é possível mover uma Ordem de Serviço de uma fatura que não está aberta.');
        }

        // Desvincula a OS da fatura de origem
        await osRepo.update(dto.idOrdemServico, { fatura: null });
      }

      // 3. Determinar a fatura de destino
      let faturaDestino: Fatura;

      if (dto.idFaturaDestino) {
        // Se foi especificada uma fatura de destino, usar ela
        faturaDestino = await faturaRepo.findOne({
          where: { idFatura: dto.idFaturaDestino },
        });

        if (!faturaDestino) {
          throw new NotFoundException(`Fatura de destino com ID ${dto.idFaturaDestino} não encontrada.`);
        }

        if (faturaDestino.idEmpresa !== idEmpresa) {
          throw new BadRequestException('A fatura de destino deve pertencer à mesma empresa da Ordem de Serviço.');
        }

        if (faturaDestino.status !== StatusFatura.ABERTA) {
          throw new BadRequestException('Não é possível mover uma Ordem de Serviço para uma fatura que não está aberta.');
        }
      } else if (dto.anoDestino && dto.mesDestino) {
        // Se foi especificado ano e mês de destino (1-12)
        const ano = Number(dto.anoDestino);
        const mes = Number(dto.mesDestino) - 1; // 0-11
        const ultimoDiaMes = new Date(ano, mes + 1, 0);
        const dataVencimento = new Date(ano, mes + 1, 20);

        const dataInicioStr = `${ano}-${String(mes + 1).padStart(2, '0')}-01`;
        const dataFimStr = `${ano}-${String(mes + 1).padStart(2, '0')}-${String(ultimoDiaMes.getDate()).padStart(2, '0')}`;
        const dataInicioNormalizada = new Date(`${dataInicioStr}T00:00:00`);
        const dataFimNormalizada = new Date(`${dataFimStr}T00:00:00`);

        const faturasComp = await faturaRepo.find({
          where: {
            idEmpresa,
            dataInicio: dataInicioNormalizada,
            dataFim: dataFimNormalizada,
          },
          order: { idFatura: 'DESC' },
        });

        const faturaAberta = faturasComp.find(
          f => f.status === StatusFatura.ABERTA || f.status === StatusFatura.AGUARDANDO_DEVOLUCAO,
        );

        if (faturaAberta) {
          faturaDestino = faturaAberta;
        } else {
          faturaDestino = faturaRepo.create({
            idEmpresa,
            dataInicio: dataInicioNormalizada,
            dataFim: dataFimNormalizada,
            dataVencimento,
            valorTotalBruto: 0,
            desconto: 0,
            valorTotal: 0,
            status: StatusFatura.ABERTA,
            descricao: faturasComp.length > 0 ? 'Fatura Complementar' : undefined,
          });
          faturaDestino = await faturaRepo.save(faturaDestino);
        }
      } else {
        // Se não foi especificada, buscar a próxima fatura aberta do próximo mês
        // Se existe fatura de origem, usa a data dela; caso contrário, usa a data de hoje
        let dataReferencia: Date;
        if (faturaOrigem) {
          // Usa a data de fim da fatura de origem (que representa a competência)
          dataReferencia = new Date(faturaOrigem.dataFim);
        } else {
          // Se não há fatura de origem, usa a data de hoje
          dataReferencia = new Date();
        }

        const anoReferencia = dataReferencia.getFullYear();
        const mesReferencia = dataReferencia.getMonth(); // 0-11 (janeiro = 0)

        // Busca a próxima fatura disponível (aberta) a partir do próximo mês
        faturaDestino = await this.buscarProximaFaturaDisponivel(
          manager,
          idEmpresa,
          anoReferencia,
          mesReferencia
        );

        if (!faturaDestino) {
          throw new NotFoundException(
            `Não foi possível encontrar ou criar uma fatura aberta para os próximos 12 meses a partir de ${mesReferencia + 1}/${anoReferencia}.`
          );
        }
      }

      // 4. Vincular a OS à fatura de destino
      await osRepo.update(dto.idOrdemServico, { fatura: faturaDestino });

      // 5. Atualizar status dos itens da OS se necessário
      const osComItens = await osRepo.findOne({
        where: { idOrdemServico: dto.idOrdemServico },
        relations: ['itens'],
      });

      if (osComItens?.itens) {
        const idsItens = osComItens.itens.map(item => item.idOrdemServicoItem);
        // Preservar itens DEVOLVIDOS - não atualizar status deles
        const itensParaAtualizar = await osItemRepo.find({
          where: {
            idOrdemServicoItem: In(idsItens),
            status: Not(StatusOrdemServicoItem.DEVOLVIDO)
          }
        });
        const idsItensParaAtualizar = itensParaAtualizar.map(item => item.idOrdemServicoItem);
        if (idsItensParaAtualizar.length > 0) {
          await osItemRepo.update(
            { idOrdemServicoItem: In(idsItensParaAtualizar) },
            { status: StatusOrdemServicoItem.FATURADO }
          );
        }
      }

      // 6. Recalcular o valor total da fatura de origem (se houver)
      if (faturaOrigem) {
        await this.recalcularFaturaComManager(manager, faturaOrigem.idFatura);
      }

      // 7. Recalcular o valor total da fatura de destino
      await this.recalcularFaturaComManager(manager, faturaDestino.idFatura);

      // 8. Retornar a fatura de destino atualizada
      const faturaAtualizada = await faturaRepo.findOne({
        where: { idFatura: faturaDestino.idFatura },
        relations: [
          'ordensDeServico',
          'ordensDeServico.trabalho',
          'ordensDeServico.itens.devolucoes'
        ],
        order: {
          ordensDeServico: {
            trabalho: {
              idTrabalho: 'ASC',
            },
          },
        },
      });

      return faturaAtualizada;
    });
  }

  /**
   * Busca ou cria uma fatura aberta para um período específico.
   * Garante que não haverá duplicatas - apenas uma fatura aberta por empresa/período.
   * 
   * @param manager EntityManager da transação
   * @param idEmpresa ID da empresa
   * @param dataInicio Data de início do período (formato YYYY-MM-DD)
   * @param dataFim Data de fim do período (formato YYYY-MM-DD)
   * @returns Fatura existente ou recém-criada
   */
  private async buscarOuCriarFaturaAberta(
    manager: EntityManager,
    idEmpresa: number,
    dataInicio: string,
    dataFim: string
  ): Promise<Fatura> {
    const faturaRepo = manager.getRepository(Fatura);

    // Formata as datas no mesmo formato usado em criarFatura
    const dataInicioDate = new Date(`${dataInicio}T00:00:00`);
    const dataFimDate = new Date(`${dataFim}T00:00:00`);

    // Primeira verificação: busca fatura aberta existente
    let fatura = await faturaRepo.findOne({
      where: {
        idEmpresa: idEmpresa,
        status: StatusFatura.ABERTA,
        dataInicio: dataInicioDate,
        dataFim: dataFimDate,
      },
    });

    // Se não encontrou, verifica novamente com lock para evitar condições de corrida
    if (!fatura) {
      fatura = await faturaRepo.findOne({
        where: {
          idEmpresa: idEmpresa,
          status: StatusFatura.ABERTA,
          dataInicio: dataInicioDate,
          dataFim: dataFimDate,
        },
        lock: { mode: 'pessimistic_write' },
      });

      // Se ainda não existe, cria uma nova
      if (!fatura) {
        const dataFimObj = new Date(dataFimDate);
        const dataVencimento = new Date(dataFimObj.getFullYear(), dataFimObj.getMonth() + 1, 20);

        fatura = faturaRepo.create({
          idEmpresa: idEmpresa,
          dataInicio: dataInicioDate,
          dataFim: dataFimDate,
          dataVencimento: dataVencimento,
          valorTotalBruto: 0,
          desconto: 0,
          valorTotal: 0,
          status: StatusFatura.ABERTA,
        });

        fatura = await faturaRepo.save(fatura);
        this.logger.log(
          `Nova fatura criada (ID: ${fatura.idFatura}) para empresa ${idEmpresa} - período ${dataInicio} a ${dataFim}.`
        );
      } else {
        this.logger.log(
          `Fatura existente encontrada após lock (ID: ${fatura.idFatura}) para empresa ${idEmpresa} - período ${dataInicio} a ${dataFim}.`
        );
      }
    } else {
      this.logger.log(
        `Fatura existente encontrada (ID: ${fatura.idFatura}) para empresa ${idEmpresa} - período ${dataInicio} a ${dataFim}.`
      );
    }

    return fatura;
  }

  /**
   * Busca a próxima fatura disponível (aberta) a partir de um mês/ano específico.
   * Se não encontrar, busca nos próximos 12 meses.
   */
  private async buscarProximaFaturaDisponivel(
    manager: EntityManager,
    idEmpresa: number,
    anoInicial: number,
    mesInicial: number
  ): Promise<Fatura | null> {
    const faturaRepo = manager.getRepository(Fatura);

    // Busca nas próximas 12 competências (meses)
    for (let i = 1; i <= 12; i++) {
      // Calcula o mês e ano corretamente
      const mesTotal = mesInicial + i;
      const ano = anoInicial + Math.floor(mesTotal / 12);
      const mes = mesTotal % 12;

      // Calcula primeiro e último dia do mês
      const primeiroDiaMes = new Date(ano, mes, 1);
      const ultimoDiaMes = new Date(ano, mes + 1, 0);
      const dataVencimento = new Date(ano, mes + 1, 20);

      // Formata as datas
      const dataInicioStr = `${ano}-${String(mes + 1).padStart(2, '0')}-01`;
      const dataFimStr = `${ano}-${String(mes + 1).padStart(2, '0')}-${String(ultimoDiaMes.getDate()).padStart(2, '0')}`;
      
      const dataInicioNormalizada = new Date(`${dataInicioStr}T00:00:00`);
      const dataFimNormalizada = new Date(`${dataFimStr}T00:00:00`);

      // Verifica se já existe uma fatura para esta competência
      const faturaExistente = await faturaRepo.findOne({
        where: {
          idEmpresa: idEmpresa,
          dataInicio: dataInicioNormalizada,
          dataFim: dataFimNormalizada,
        },
      });

      // Se existe e está aberta (ou aguardando devolução), retorna ela
      const statusPermitidos = [StatusFatura.ABERTA, StatusFatura.AGUARDANDO_DEVOLUCAO];
      if (faturaExistente && statusPermitidos.includes(faturaExistente.status)) {
        this.logger.log(
          `Fatura aberta/aguardando devolução encontrada para próxima vigência: empresa ${idEmpresa} - mês ${mes + 1}/${ano} (ID: ${faturaExistente.idFatura})`
        );
        return faturaExistente;
      }

      // Se não existe nenhuma fatura para esta competência, cria uma nova aberta
      if (!faturaExistente) {
        const novaFatura = faturaRepo.create({
          idEmpresa: idEmpresa,
          dataInicio: dataInicioNormalizada,
          dataFim: dataFimNormalizada,
          dataVencimento: dataVencimento,
          valorTotalBruto: 0,
          desconto: 0,
          valorTotal: 0,
          status: StatusFatura.ABERTA,
        });

        const faturaSalva = await faturaRepo.save(novaFatura);
        this.logger.log(
          `Nova fatura criada para próxima vigência: empresa ${idEmpresa} - mês ${mes + 1}/${ano} (ID: ${faturaSalva.idFatura})`
        );
        return faturaSalva;
      }

      // Se existe mas está fechada, continua procurando no próximo mês
    }

    // Se não encontrou nenhuma fatura disponível nos próximos 12 meses, retorna null
    this.logger.warn(
      `Não foi encontrada nenhuma fatura disponível nos próximos 12 meses para empresa ${idEmpresa} a partir de ${mesInicial + 1}/${anoInicial}`
    );
    return null;
  }

  async fecharFatura(idFatura: number ): Promise<Fatura> {
    const fatura = await this.faturaRepository.findOne({
        where: { idFatura },
        relations: ['ordensDeServico'],
    });

    if (!fatura) throw new NotFoundException(`Fatura com ID ${idFatura} não encontrada.`);
    if (fatura.status === StatusFatura.AGUARDANDO_DEVOLUCAO) {
      throw new BadRequestException('Esta fatura possui devoluções pendentes e não pode ser fechada.');
    }
    if (fatura.status !== StatusFatura.ABERTA) throw new BadRequestException(`Apenas faturas com status 'ABERTA' podem ser fechadas. Status atual: ${fatura.status}`);

    // Tratamento seguro de datas para evitar deslocamento de dia/mês por fuso horário.
    // A competência financeira do lançamento deve corresponder exatamente ao início da vigência da fatura.
    const dataCompetenciaString =
      formatDataLocalYYYYMMDD(fatura.dataInicio) || formatDataLocalYYYYMMDD(fatura.dataFim);

    // Formata a data de vencimento para o formato YYYY-MM-DD.
    const dataVencimentoString = formatDataLocalYYYYMMDD(fatura.dataVencimento);

    // 1. Gerar o Lançamento Financeiro
    const lancamento = await this.financeiroService.criarLancamento({
        descricao: `Fatura #${fatura.idFatura} - Empresa ID ${fatura.idEmpresa}`,
        tipo: TipoLancamento.RECEITA,
        valorTotal: fatura.valorTotal,
        dataCompetencia: dataCompetenciaString,
        idClienteFornecedor: fatura.idEmpresa,
        idFatura: fatura.idFatura,
        idCategoria: 44,
        parcelas: [{
            numeroParcela: 1,
            valor: fatura.valorTotal,
            dataVencimento: dataVencimentoString,
            meioPagamento: MeioPagamento.BOLETO, // ou um padrão
        }]
    });

    // 2. Atualizar o status da Fatura
    fatura.status = StatusFatura.FECHADA;
    // fatura.lancamento = lancamento; // Se a relação for bidirecional

    await this.faturaRepository.save(fatura);

    return fatura;
  }

  async buscarFaturaPorId(idFatura: number): Promise<Fatura> {
    const fatura = await this.faturaRepository.findOne({
        where: { idFatura },
        relations: [
          'empresa',
          'ordensDeServico',
          'ordensDeServico.trabalho',
          'ordensDeServico.itens.devolucoes',
        ],
        order: {
          ordensDeServico: {
            trabalho: {
              idTrabalho: 'ASC', // Ordena os trabalhos por idTrabalho em ordem crescente
            },
          },
        },
    });
    if (!fatura) {
        throw new NotFoundException(`Fatura com ID ${idFatura} não encontrada.`);
    }
    const [corrigida] = await this.corrigirStatusFaturas([fatura]);
    return corrigida ?? fatura;
  }

  async atualizarDescontoFatura(idFatura: number, desconto: number): Promise<Fatura> {
    if (desconto < 0) {
      throw new BadRequestException('O desconto não pode ser negativo.');
    }

    return this.dataSource.transaction(async (manager) => {
      const faturaRepo = manager.getRepository(Fatura);
      const fatura = await faturaRepo.findOneBy({ idFatura });

      if (!fatura) {
        throw new NotFoundException(`Fatura com ID ${idFatura} não encontrada.`);
      }

      // Atualiza o desconto e salva
      fatura.desconto = desconto;
      await faturaRepo.save(fatura);

      this.logger.log(`Desconto atualizado para fatura ID ${idFatura}: R$ ${desconto}`);

      // Recalcula a fatura para aplicar o desconto
      return this.recalcularFaturaComManager(manager, idFatura);
    });
  }

  async atualizarAnotacoesFatura(idFatura: number, anotacoes: string | null): Promise<Fatura> {
    const fatura = await this.faturaRepository.findOneBy({ idFatura });

    if (!fatura) {
      throw new NotFoundException(`Fatura com ID ${idFatura} não encontrada.`);
    }

    fatura.anotacoes = anotacoes || null;
    await this.faturaRepository.save(fatura);

    this.logger.log(`Anotações atualizadas para fatura ID ${idFatura}`);

    return fatura;
  }

  @OnEvent('fatura.recalcular')
  async handleFaturaRecalcular(evento: { idFatura: number }) {
    const { idFatura } = evento;
    
    // Proteção contra loops: se já está recalculando esta fatura, ignora o evento
    if (this.recalculosEmAndamento.has(idFatura)) {
      this.logger.warn(`[Fatura ${idFatura}] Recálculo já em andamento, ignorando evento duplicado`);
      return;
    }

    try {
      this.recalculosEmAndamento.add(idFatura);
      await this.recalcularFatura(idFatura);
    } catch (error) {
      this.logger.error(`[Fatura ${idFatura}] Erro ao recalcular fatura: ${error.message}`, error.stack);
      throw error;
    } finally {
      // Remove a flag de proteção após o recálculo (mesmo em caso de erro)
      this.recalculosEmAndamento.delete(idFatura);
    }
  }

  /**
   * Recalcula apenas os totais da fatura (soma dos itens) dentro da transação.
   * Não chama TrabalhoService para evitar lock wait: atualizarPrecosOrdemServico usa
   * conexão/repositório fora do manager e causaria "Lock wait timeout exceeded".
   */
  private async recalcularFaturaComManager(manager: EntityManager, idFatura: number): Promise<Fatura> {
    const faturaRepo = manager.getRepository(Fatura);
    const osItemRepo = manager.getRepository(OrdemServicoItem);
    const osRepo = manager.getRepository(OrdemServico);

    const fatura = await faturaRepo.findOneBy({ idFatura });
    if (!fatura) {
      throw new NotFoundException(`Fatura com ID ${idFatura} não encontrada.`);
    }
    if (fatura.status === StatusFatura.PAGA || fatura.status === StatusFatura.FECHADA) {
      return fatura;
    }

    // Busca todos os itens da fatura com suas relações (OS e Trabalho) em uma única query
    // Usa uma query otimizada para evitar múltiplas consultas
    const itensComTrabalho = await osItemRepo
      .createQueryBuilder('item')
      .innerJoin('item.ordemServico', 'os')
      .innerJoin('TbTrabalho', 'trabalho', 'trabalho.idTrabalho = os.idTrabalho')
      .select([
        'item.idOrdemServicoItem',
        'item.idOrdemServico',
        'item.tipoCobranca',
        'item.valor',
        'item.valorTotal',
        'item.quantidade',
        'item.quantidadeDevolvida',
        'item.status',
        'trabalho.status'
      ])
      .where('os.idFatura = :idFatura', { idFatura })
      .getRawMany();

    // Para trabalhos cancelados, zera tudo (serviços e componentes)
    let valorTotalCalculado = 0;
    let itensAtualizados = 0;
    const idsItensParaZerar: number[] = [];

    // Primeira passagem: identifica itens que precisam ser zerados e calcula o total
    for (const itemRaw of itensComTrabalho) {
      const statusTrabalho = itemRaw.trabalho_status as StatusTrabalho;
      const statusItem = itemRaw.item_status as StatusOrdemServicoItem;
      const valor = Number(itemRaw.item_valor);
      const quantidade = Number(itemRaw.item_quantidade);
      const quantidadeDevolvida = Number(itemRaw.item_quantidadeDevolvida || 0);
      const idItem = itemRaw.item_idOrdemServicoItem;

      if (statusTrabalho === StatusTrabalho.CANCELADO) {
        // Se o trabalho está cancelado, marca TODOS os itens (serviços e componentes) para zerar
        if (valor !== 0) {
          idsItensParaZerar.push(idItem);
        }
        // Itens de trabalhos cancelados não entram no cálculo
      } else if (statusItem === StatusOrdemServicoItem.DEVOLVIDO) {
        if (valor !== 0 || Number(itemRaw.item_valorTotal ?? 0) !== 0) {
          idsItensParaZerar.push(idItem);
        }
        continue;
      } else {
        const quantidadeCobravel = quantidade - quantidadeDevolvida;
        if (quantidadeCobravel <= 0) {
          continue;
        }
        valorTotalCalculado += valor * quantidadeCobravel;
      }
    }

    // Segunda passagem: atualiza todos os itens (serviços e componentes) que precisam ser zerados
    if (idsItensParaZerar.length > 0) {
      await osItemRepo.update(
        { idOrdemServicoItem: In(idsItensParaZerar) },
        { valor: 0, valorTotal: 0 }
      );
      itensAtualizados = idsItensParaZerar.length;
    }

    // Salva o valor total bruto (antes do desconto)
    fatura.valorTotalBruto = valorTotalCalculado;

    // Aplica o desconto após calcular o total (desconto é um valor fixo em reais)
    const desconto = Number(fatura.desconto || 0);
    const descontoDevolucao = Number(fatura.descontoDevolucao || 0);
    fatura.valorTotal = Math.max(0, valorTotalCalculado - desconto - descontoDevolucao);

    // Reavalia o status da fatura com base no novo valor total e no valor já pago.
    // Usar Number() porque decimal do MySQL pode vir como string; tolerância 0.01 evita erro de arredondamento.
    const vPago = Number(fatura.valorPago ?? 0);
    const vTotal = Number(fatura.valorTotal ?? 0);
    if (vTotal > 0 && vPago >= vTotal - 0.01) {
      fatura.status = StatusFatura.PAGA;
    } else if (vPago > 0) {
      fatura.status = StatusFatura.PAGA_PARCIALMENTE;
    } else {
      fatura.status = StatusFatura.ABERTA;
    }

    return faturaRepo.save(fatura);
  }

  /**
   * Recalcula a fatura: atualiza preços de todas as OS em lote (1 carga de trabalhos, 1 de OS, 1 save),
   * depois em uma transação curta recalcula apenas os totais.
   */
  async recalcularFatura(idFatura: number): Promise<Fatura> {
    const fatura = await this.faturaRepository.findOneBy({ idFatura });
    if (fatura?.status === StatusFatura.PAGA) {
      this.logger.log(`[Fatura ${idFatura}] Fatura paga não é recalculada.`);
      return this.buscarFaturaPorId(idFatura);
    }

    this.logger.log(`[Fatura ${idFatura}] Iniciando recálculo de preços...`);
    const rawIds = await this.osRepository
      .createQueryBuilder('os')
      .select('DISTINCT os.idTrabalho', 'idTrabalho')
      .where('os.idFatura = :idFatura', { idFatura })
      .getRawMany<{ idTrabalho: number }>();
    const idsTrabalhos = rawIds.map(r => r.idTrabalho).filter((id): id is number => id != null);

    if (idsTrabalhos.length > 0) {
      this.logger.log(`[Fatura ${idFatura}] Atualizando preços para ${idsTrabalhos.length} trabalho(s)...`);
      const currentUser = { user: { idUsuario: 1 } };
      try {
        await this.trabalhoService.atualizarPrecosOrdemServicoEmLote(currentUser, idFatura, idsTrabalhos);
        this.logger.log(`[Fatura ${idFatura}] Preços atualizados com sucesso para ${idsTrabalhos.length} trabalho(s)`);
      } catch (error) {
        this.logger.error(`[Fatura ${idFatura}] Erro ao atualizar preços em lote: ${error.message}`, error.stack);
        throw error;
      }
    } else {
      this.logger.log(`[Fatura ${idFatura}] Nenhum trabalho encontrado para recalcular`);
    }

    return this.dataSource.transaction(async (manager) => {
      return this.recalcularFaturaComManager(manager, idFatura);
    });
  }

  async recalcularFaturasEmAberto(): Promise<{ success: boolean; message: string; recalculadas: number; }> {
    const statusesParaRecalcular = [
        StatusFatura.ABERTA,
        StatusFatura.AGUARDANDO_DEVOLUCAO,
        StatusFatura.PAGA_PARCIALMENTE
    ];

    const faturas = await this.faturaRepository.find({
        where: { status: In(statusesParaRecalcular) }
    });

    if (faturas.length === 0) {
        return { success: true, message: 'Nenhuma fatura em aberto para recalcular.', recalculadas: 0 };
    }

    for (const fatura of faturas) {
        await this.recalcularFatura(fatura.idFatura);
    }

    return { success: true, message: `${faturas.length} faturas foram recalculadas com sucesso.`, recalculadas: faturas.length };
  }

  async pagarItemFatura(dto: PagarItensFaturaDto): Promise<Fatura> {
    return this.dataSource.transaction(async manager => {
        const faturaRepo = manager.getRepository(Fatura);
        const osItemRepo = manager.getRepository(OrdemServicoItem);
        const contaRepo = manager.getRepository(Conta);
        const movRepo = manager.getRepository(Movimentacao);
        const ordemServicoRepo = manager.getRepository(OrdemServico)

        // Adquire locks pessimistas para evitar deadlocks.
        // A ordem de aquisição dos locks é importante.
        const fatura = await faturaRepo.findOne({
            where: { idFatura: dto.idFatura },
            lock: { mode: 'pessimistic_write' }
        });
        if (!fatura) throw new NotFoundException(`Fatura com ID ${dto.idFatura} não encontrada.`);
        if (fatura.status === StatusFatura.PAGA || fatura.status === StatusFatura.CANCELADA) {
            throw new BadRequestException(`Fatura com status ${fatura.status} não pode receber pagamentos.`);
        }

        const conta = await contaRepo.findOne({
            where: { idConta: dto.idConta },
            lock: { mode: 'pessimistic_write' }
        });
        if (!conta) throw new NotFoundException(`Conta com ID ${dto.idConta} não encontrada.`);

        const idsTrabalhosParaAtualizar = new Set<number>();
        const idsOsParaAtualizar = new Set<number>();

        for (const itemPagamento of dto.itens) {
            const osItem = await osItemRepo.findOne({
                where: { idOrdemServicoItem: itemPagamento.idOrdemServicoItem },
                lock: { mode: 'pessimistic_write' }
            });
            if (!osItem) throw new NotFoundException(`Item de Ordem de Serviço com ID ${itemPagamento.idOrdemServicoItem} não encontrado.`);

            idsOsParaAtualizar.add(osItem.idOrdemServico);

            const valorRestanteItem = Number(osItem.valorTotal) - Number(osItem.valorPago);
            if (itemPagamento.valor > valorRestanteItem + 0.001) {
                throw new BadRequestException(`O valor a pagar (R$ ${osItem.valor}) para o item ${osItem.idOrdemServicoItem} não pode ser maior que o valor restante (R$ ${valorRestanteItem}).`);
            }

            const valorDoPagamento = Number(osItem.valor) * (osItem.quantidade - osItem.quantidadeDevolvida);
            // 1. Cria a movimentação financeira
            const movimentacao = movRepo.create({
                idConta: dto.idConta,
                tipo: TipoMovimentacao.CREDITO,
                valor: valorDoPagamento,
                descricao: `Pagamento do item #${osItem.idOrdemServicoItem} (${osItem.descricao}) da Fatura #${fatura.idFatura}`,
                dataMovimentacao: new Date(dto.dataPagamento),
            });
            await movRepo.save(movimentacao);

            // 2. Atualiza o saldo da conta
            conta.saldoAtual = Number(conta.saldoAtual) + valorDoPagamento;

            // 3. Atualiza o valor pago no item e na fatura
            osItem.valorPago = valorDoPagamento;
            fatura.valorPago = Number(fatura.valorPago) + valorDoPagamento;

            // 4. Atualiza o status do item se foi totalmente pago
            if (Number(osItem.valorTotal) - osItem.valorPago < 0.01) {
                osItem.valorPago = osItem.valorTotal; // Ajusta para o valor exato, zerando o saldo.
                osItem.status = StatusOrdemServicoItem.PAGO;
            }
            await osItemRepo.save(osItem);

            // 5. Se o item foi pago, verifica se a OS inteira foi quitada para atualizar o Trabalho
            if (osItem.status === StatusOrdemServicoItem.PAGO) {
                const itensPendentesDaOS = await osItemRepo.count({
                    where: {
                        idOrdemServico: osItem.idOrdemServico,
                        // Itens que não estão resolvidos
                        status: In([StatusOrdemServicoItem.PENDENTE, StatusOrdemServicoItem.FATURADO, StatusOrdemServicoItem.DEVOLUCAO_SOLICITADA])
                    }
                });

                if (itensPendentesDaOS === 0) {
                    const osCompleta = await manager.getRepository(OrdemServico).findOne({
                        where: { idOrdemServico: osItem.idOrdemServico },
                        relations: ['trabalho']
                    });

                    if (osCompleta && osCompleta.trabalho) {
                        idsTrabalhosParaAtualizar.add(osCompleta.trabalho.idTrabalho);
                        
                        // Marca o trabalho como pago sem alterar a data de conclusão do envio
                        await manager.getRepository(Trabalho).update(
                            { idTrabalho: osCompleta.trabalho.idTrabalho },
                            {
                                finalizado: true,
                            }
                        );
                    }
                }
            }
        }

        // Salva o saldo da conta uma única vez no final do loop
        await contaRepo.save(conta);

        // 6. Verifica se a fatura foi totalmente paga (Number() evita comparação string de decimais)
        const valorRestanteFatura = Number(fatura.valorTotal) - Number(fatura.valorPago ?? 0);
        if (valorRestanteFatura < 0.01) {
            fatura.status = StatusFatura.PAGA;
            
            // Se a fatura foi paga, atualiza todos os itens e trabalhos relacionados de uma vez.
            if (idsOsParaAtualizar.size > 0) {
                await osItemRepo.update({ idOrdemServico: In(Array.from(idsOsParaAtualizar)) }, { status: StatusOrdemServicoItem.PAGO });
            }

            // Busca os IDs dos trabalhos de todas as OS da fatura para garantir que todos sejam atualizados
            const todasAsOsDaFatura = await ordemServicoRepo.find({ where: { idFatura: fatura.idFatura }, select: ['idTrabalho'] });
            todasAsOsDaFatura.forEach(os => idsTrabalhosParaAtualizar.add(os.idTrabalho));

            if (idsTrabalhosParaAtualizar.size > 0) {
                await manager.getRepository(Trabalho).update(
                    { idTrabalho: In(Array.from(idsTrabalhosParaAtualizar)) },
                    { 
                        finalizado: true,
                    }
                );
            }
        } else {
            fatura.status = StatusFatura.PAGA_PARCIALMENTE;
        }

        await faturaRepo.save(fatura);

        return this.buscarFaturaPorId(fatura.idFatura);
    });
  }

  async listarFaturas(
    currentUser: any, 
    idEmpresa?: number, 
    status?: StatusFatura[],
    competencia?: string
  ): Promise<Fatura[]> {
    const isAdmin = currentUser?.user?.permissoes?.some(permissao => permissao === 'admin') ?? false;

    const whereClause: FindOptionsWhere<Fatura> | FindOptionsWhere<Fatura>[] = {};

    if (isAdmin) {
      // Admin pode filtrar por uma empresa específica ou ver todas se nenhum id for fornecido
      if (idEmpresa) {
        whereClause.idEmpresa = idEmpresa;
      }
    } else {
      // Usuários não-admin só podem ver faturas da sua própria empresa
      if (!currentUser?.user?.idEmpresa) {
        throw new BadRequestException('Não foi possível identificar a empresa do usuário.');
      }
      whereClause.idEmpresa = currentUser.user.idEmpresa;
    }

    if (status && status.length > 0) {
      whereClause.status = In(status);
    }

    // Filtro por competência (formato: MM/YYYY, ex: 11/2025)
    if (competencia) {
      // Valida e parseia a competência
      const competenciaRegex = /^(\d{1,2})\/(\d{4})$/;
      const match = competencia.match(competenciaRegex);

      if (!match) {
        throw new BadRequestException(
          'Formato de competência inválido. Use o formato MM/YYYY (ex: 11/2025)'
        );
      }

      const mes = parseInt(match[1], 10);
      const ano = parseInt(match[2], 10);

      // Valida o mês (1-12)
      if (mes < 1 || mes > 12) {
        throw new BadRequestException('Mês inválido. O mês deve estar entre 1 e 12.');
      }

      // Calcula primeiro e último dia do mês
      const primeiroDiaMes = new Date(ano, mes - 1, 1); // mes - 1 porque Date usa 0-11
      const ultimoDiaMes = new Date(ano, mes, 0); // dia 0 do próximo mês = último dia do mês atual

      // Formata as datas no formato usado no banco
      const dataInicioStr = `${ano}-${String(mes).padStart(2, '0')}-01`;
      const dataFimStr = `${ano}-${String(mes).padStart(2, '0')}-${String(ultimoDiaMes.getDate()).padStart(2, '0')}`;
      
      const dataInicioDate = new Date(`${dataInicioStr}T00:00:00`);
      const dataFimDate = new Date(`${dataFimStr}T23:59:59`);

      // Busca faturas que se sobrepõem ao mês informado
      // Uma fatura se sobrepõe se: dataInicioFatura <= dataFim && dataFimFatura >= dataInicio
      const queryBuilder = this.faturaRepository.createQueryBuilder('fatura');

      queryBuilder.where('fatura.dataInicio <= :dataFim', { dataFim: dataFimDate });
      queryBuilder.andWhere('fatura.dataFim >= :dataInicio', { dataInicio: dataInicioDate });

      // Aplica os outros filtros
      if (whereClause.idEmpresa) {
        queryBuilder.andWhere('fatura.idEmpresa = :idEmpresa', { idEmpresa: whereClause.idEmpresa });
      }

      if (status && status.length > 0) {
        queryBuilder.andWhere('fatura.status IN (:...status)', { status: status });
      }

      queryBuilder.leftJoinAndSelect('fatura.empresa', 'empresa');
      queryBuilder.orderBy('empresa.nome', 'ASC');
      queryBuilder.addOrderBy('fatura.dataVencimento', 'ASC');

      const faturas = await queryBuilder.getMany();
      return this.corrigirStatusFaturas(faturas);
    }

    // Usa QueryBuilder para permitir ordenação por nome da empresa
    const queryBuilder = this.faturaRepository.createQueryBuilder('fatura');
    
    queryBuilder.leftJoinAndSelect('fatura.empresa', 'empresa');
    
    // Aplica os filtros
    if (whereClause.idEmpresa) {
      queryBuilder.andWhere('fatura.idEmpresa = :idEmpresa', { idEmpresa: whereClause.idEmpresa });
    }
    
    if (status && status.length > 0) {
      queryBuilder.andWhere('fatura.status IN (:...status)', { status: status });
    }
    
    // Ordena por nome da empresa e depois por data de vencimento em ordem crescente
    queryBuilder.orderBy('empresa.nome', 'ASC');
    queryBuilder.addOrderBy('fatura.dataVencimento', 'ASC');
    
    const faturas = await queryBuilder.getMany();
    return this.corrigirStatusFaturas(faturas);
  }

  /**
   * Corrige o status das faturas após getMany() com join.
   * O TypeORM pode sobrescrever fatura.status com valor da relação (ex.: empresa)
   * quando há coluna com mesmo nome no JOIN. Re-busca apenas idFatura e status.
   */
  private async corrigirStatusFaturas(faturas: Fatura[]): Promise<Fatura[]> {
    if (!faturas?.length) return faturas;
    const ids = faturas.map((f) => f.idFatura);
    const rows = await this.faturaRepository
      .createQueryBuilder('f')
      .select('f.idFatura', 'idFatura')
      .addSelect('f.status', 'status')
      .where('f.idFatura IN (:...ids)', { ids })
      .getRawMany<{ idFatura: number; status: StatusFatura }>();
    const mapStatus = new Map(rows.map((r) => [r.idFatura, r.status]));
    faturas.forEach((f) => {
      const s = mapStatus.get(f.idFatura);
      if (s !== undefined) f.status = s;
    });
    return faturas;
  }

  /**
   * Corrige status de faturas que estão quitadas (valorPago >= valorTotal) mas com status diferente de PAGA.
   * Útil para corrigir dados que ficaram inconsistentes por comparação string/decimal ou por recálculo anterior.
   * Retorna quantas faturas foram atualizadas.
   */
  async corrigirStatusFaturasQuitadas(): Promise<{ atualizadas: number; ids: number[] }> {
    const qb = this.faturaRepository
      .createQueryBuilder('f')
      .select('f.idFatura', 'idFatura')
      .addSelect('f.valorTotal', 'valorTotal')
      .addSelect('f.valorPago', 'valorPago')
      .where('f.status != :paga', { paga: StatusFatura.PAGA });
    const rows = await qb.getRawMany<{ idFatura: number; valorTotal: string; valorPago: string }>();
    const idsParaAtualizar = rows
      .filter((r) => Number(r.valorPago ?? 0) >= Number(r.valorTotal ?? 0) - 0.01)
      .map((r) => r.idFatura);
    if (idsParaAtualizar.length === 0) {
      return { atualizadas: 0, ids: [] };
    }
    await this.faturaRepository.update(
      { idFatura: In(idsParaAtualizar) },
      { status: StatusFatura.PAGA }
    );
    this.logger.log(`Corrigidas ${idsParaAtualizar.length} fatura(s) quitadas com status incorreto: ${idsParaAtualizar.join(', ')}`);
    return { atualizadas: idsParaAtualizar.length, ids: idsParaAtualizar };
  }

  /**
   * Relatório de faturas pendentes e vencidas (abertas, parcialmente pagas ou aguardando devolução,
   * com data de vencimento já passada). Agrupadas por empresa, com totais por empresa e total geral.
   */
  async relatorioFaturasPendentes(currentUser: any): Promise<{
    empresas: Array<{
      idEmpresa: number;
      nomeEmpresa: string;
      contato: string;
      totalPendenteEmpresa: number;
      faturas: Array<{
        idFatura: number;
        dataInicio: Date;
        dataFim: Date;
        dataVencimento: Date;
        valorTotal: number;
        valorPago: number;
        valorPendente: number;
      }>;
    }>;
    totalGeralPendente: number;
  }> {
    const statusPendentes: StatusFatura[] = [
      StatusFatura.ABERTA,
      StatusFatura.PAGA_PARCIALMENTE,
      StatusFatura.AGUARDANDO_DEVOLUCAO,
    ];
    const todasPendentes = await this.listarFaturas(currentUser, undefined, statusPendentes, undefined);

    // Apenas faturas vencidas (data de vencimento anterior a hoje)
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const faturas = todasPendentes.filter((f) => {
      const venc = new Date(f.dataVencimento);
      venc.setHours(0, 0, 0, 0);
      return venc < hoje;
    });

    const mapaPorEmpresa = new Map<
      number,
      {
        idEmpresa: number;
        nomeEmpresa: string;
        contato: string;
        totalPendenteEmpresa: number;
        faturas: Array<{
          idFatura: number;
          dataInicio: Date;
          dataFim: Date;
          dataVencimento: Date;
          valorTotal: number;
          valorPago: number;
          valorPendente: number;
        }>;
      }
    >();

    for (const fatura of faturas) {
      const idEmpresa = fatura.idEmpresa;
      const empresa = fatura.empresa as any;
      const nomeEmpresa =
        empresa?.nomeFantasia ?? empresa?.nome ?? `Empresa ${idEmpresa}`;
      const partesContato: string[] = [];
      if (empresa?.email) partesContato.push(empresa.email);
      if (empresa?.telefone) partesContato.push(empresa.telefone);
      if (empresa?.nomeResponsavel) partesContato.push(empresa.nomeResponsavel);
      const contato = partesContato.length > 0 ? partesContato.join(' | ') : '—';

      const valorTotal = Number(fatura.valorTotal) || 0;
      const valorPago = Number(fatura.valorPago) || 0;
      const valorPendente = Math.max(0, valorTotal - valorPago);

      if (!mapaPorEmpresa.has(idEmpresa)) {
        mapaPorEmpresa.set(idEmpresa, {
          idEmpresa,
          nomeEmpresa,
          contato,
          totalPendenteEmpresa: 0,
          faturas: [],
        });
      }
      const grupo = mapaPorEmpresa.get(idEmpresa)!;
      grupo.faturas.push({
        idFatura: fatura.idFatura,
        dataInicio: fatura.dataInicio,
        dataFim: fatura.dataFim,
        dataVencimento: fatura.dataVencimento,
        valorTotal,
        valorPago,
        valorPendente,
      });
      grupo.totalPendenteEmpresa += valorPendente;
    }

    const empresas = Array.from(mapaPorEmpresa.values());
    const totalGeralPendente = empresas.reduce((s, e) => s + e.totalPendenteEmpresa, 0);

    return { empresas, totalGeralPendente };
  }

  async listarFaturasAbertasPorEmpresa(idEmpresa: number): Promise<Fatura[]> {
    return this.faturaRepository.find({
      where: {
        idEmpresa: idEmpresa,
        status: StatusFatura.ABERTA,
      },
      relations: ['empresa', 'ordensDeServico'],
      order: { dataFim: 'DESC' },
    });
  }

  async obterResumoImpressaoFatura(idFatura: number) {
    // Usar QueryBuilder para carregar todas as relações em uma única query otimizada
    const fatura = await this.faturaRepository
      .createQueryBuilder('fatura')
      .where('fatura.idFatura = :idFatura', { idFatura })
      .leftJoinAndSelect('fatura.empresa', 'empresa')
      .leftJoinAndSelect('fatura.ordensDeServico', 'ordensDeServico')
      .leftJoinAndSelect('ordensDeServico.trabalho', 'trabalho')
      .leftJoinAndSelect('trabalho.paciente', 'paciente')
      .leftJoinAndSelect('trabalho.servicos', 'servicos')
      .leftJoinAndSelect('servicos.elementos', 'elementos')
      .leftJoinAndSelect('ordensDeServico.itens', 'itens')
      .leftJoinAndSelect('itens.devolucoes', 'itensDevolucoes')
      .leftJoinAndSelect('fatura.devolucoesComponentes', 'devolucoesComponentes')
      .leftJoinAndSelect('devolucoesComponentes.componente', 'componente')
      .orderBy('ordensDeServico.idTrabalho', 'ASC')
      .getOne();

    if (!fatura) {
      throw new NotFoundException(`Fatura com ID ${idFatura} não encontrada.`);
    }

    const servicos: any[] = [];
    const componentes: any[] = [];
    let valorTotalServicos = 0;
    let valorTotalComponentes = 0;

    // Processar itens das ordens de serviço
    if (fatura.ordensDeServico) {
      for (const os of fatura.ordensDeServico) {
        const trabalho = os.trabalho;
        // Mesma ordem do cálculo da OS (calculaServicos): o n-ésimo item SERVICO com idReferencia = X
        // corresponde ao n-ésimo ServicoTrabalho com idProduto = X (por idServicoTrabalho).
        const indiceServicoPorProduto = new Map<number, number>();

        if (os.itens) {
          const itensOrdenados = [...os.itens].sort(
            (a, b) => (a.idOrdemServicoItem ?? 0) - (b.idOrdemServicoItem ?? 0),
          );
          for (const item of itensOrdenados) {
            // Pareamento com TbServicoTrabalho: mesma ordem dos itens SERVICO na OS (inclui devolvidos / zerados)
            let servicoTrabalhoParaElementos: { elementos?: { nome?: string; idElementoTrabalho?: number }[] } | undefined;
            if (item.tipoCobranca === TipoCobranca.SERVICO) {
              const listaServicosMesmoProduto = (trabalho?.servicos ?? [])
                .filter((s) => s.idProduto === item.idReferencia)
                .sort(
                  (a, b) => (a.idServicoTrabalho ?? 0) - (b.idServicoTrabalho ?? 0),
                );
              const idx = indiceServicoPorProduto.get(item.idReferencia) ?? 0;
              indiceServicoPorProduto.set(item.idReferencia, idx + 1);
              servicoTrabalhoParaElementos = listaServicosMesmoProduto[idx];
            }

            // Excluir itens devolvidos da impressão
            if (item.status === StatusOrdemServicoItem.DEVOLVIDO) {
              continue;
            }

            // Calcula o valor considerando a quantidade devolvida (mesma lógica do cálculo da fatura)
            const quantidade = Number(item.quantidade);
            const quantidadeDevolvida = Number(item.quantidadeDevolvida || 0);
            const quantidadeParaCobrar = quantidade - quantidadeDevolvida;
            
            // Excluir itens onde toda a quantidade foi devolvida (não há nada para cobrar),
            // exceto componentes em processo de devolução (ainda não conferidos): continuam visíveis
            // com valor zerado no resumo/impressão.
            if (quantidadeParaCobrar <= 0) {
              if (item.tipoCobranca === TipoCobranca.COMPONENTE) {
                const qDevItem = Number(item.quantidadeDevolvida || 0);
                const qPendenteRegistros = (item.devolucoes ?? [])
                  .filter((d) => d.status === StatusDevolucao.PENDENTE)
                  .reduce((s, d) => s + Number(d.quantidadeDevolvida || 0), 0);
                let qDev = qDevItem > 0 ? qDevItem : qPendenteRegistros;
                // Status DEVOLUCAO_SOLICITADA deve aparecer no resumo mesmo se colunas estiverem inconsistentes
                if (qDev <= 0 && item.status === StatusOrdemServicoItem.DEVOLUCAO_SOLICITADA) {
                  qDev = Math.max(quantidade, 1);
                }
                if (qDev > 0) {
                  const valorUnitario = Number(item.valor);
                  const descComContexto = `${item.descricao} — ${qDev} un. aguardando conferência de devolução`;
                  componentes.push({
                    idTrabalho: trabalho?.idTrabalho ?? os.idTrabalho,
                    dataConclusao: trabalho?.dataConclusao ?? null,
                    nomePaciente: trabalho?.nomePaciente ?? trabalho?.paciente?.nome ?? null,
                    descricao: descComContexto,
                    statusTrabalho: StatusOrdemServicoItem.DEVOLUCAO_SOLICITADA,
                    quantidade: qDev,
                    quantidadeDevolvida: qDev,
                    quantidadeParaCobrar: 0,
                    valorUnitario,
                    valorTotal: 0,
                  });
                }
              }
              continue;
            }

            const valorUnitario = Number(item.valor);
            const valorTotalCalculado = valorUnitario * quantidadeParaCobrar;

            const baseInfo = {
              idTrabalho: trabalho?.idTrabalho ?? os.idTrabalho,
              dataConclusao: trabalho?.dataConclusao ?? null,
              nomePaciente: trabalho?.nomePaciente ?? trabalho?.paciente?.nome ?? null,
              descricao: item.descricao,
              statusTrabalho: trabalho?.status ?? null,
              quantidade: quantidadeParaCobrar, // Mostra apenas a quantidade que será cobrada
              quantidadeDevolvida: quantidadeDevolvida,
              quantidadeParaCobrar: quantidadeParaCobrar,
              valorUnitario: valorUnitario,
              valorTotal: valorTotalCalculado,
            };

            if (item.tipoCobranca === TipoCobranca.SERVICO) {
              const elementos = [...(servicoTrabalhoParaElementos?.elementos ?? [])].sort(
                (a, b) =>
                  (a.idElementoTrabalho ?? 0) - (b.idElementoTrabalho ?? 0),
              );
              const elementosNomes = elementos.length > 0
                ? elementos.map((el: any) => el.nome).filter(Boolean).join(', ')
                : null;

              const servicoInfo = {
                ...baseInfo,
                elementosNomes: elementosNomes,
              };
              servicos.push(servicoInfo);
              valorTotalServicos += valorTotalCalculado;
            } else if (item.tipoCobranca === TipoCobranca.COMPONENTE) {
              const qPendenteDev = (item.devolucoes ?? [])
                .filter((d) => d.status === StatusDevolucao.PENDENTE)
                .reduce((s, d) => s + Number(d.quantidadeDevolvida || 0), 0);
              const emProcessoDevolucao =
                item.status === StatusOrdemServicoItem.DEVOLUCAO_SOLICITADA ||
                qPendenteDev > 0;
              let descricaoComponente = item.descricao;
              if (quantidadeDevolvida > 0) {
                descricaoComponente = `${item.descricao} — ${quantidadeDevolvida} un. com devolução solicitada`;
              } else if (item.status === StatusOrdemServicoItem.DEVOLUCAO_SOLICITADA) {
                descricaoComponente = `${item.descricao} — devolução solicitada`;
              }
              const componenteInfo = {
                ...baseInfo,
                descricao: descricaoComponente,
                statusTrabalho: emProcessoDevolucao
                  ? StatusOrdemServicoItem.DEVOLUCAO_SOLICITADA
                  : item.status,
              };

              componentes.push(componenteInfo);
              valorTotalComponentes += valorTotalCalculado;
            }
          }
        }
      }
    }

    // Calcula o valor total bruto (antes do desconto)
    const valorTotalBruto = valorTotalServicos + valorTotalComponentes;
    
    // Aplica o desconto (valor fixo em reais)
    const desconto = Number(fatura.desconto || 0);
    const descontoDevolucao = Number(fatura.descontoDevolucao || 0);
    const valorTotalGeral = Math.max(0, valorTotalBruto - desconto - descontoDevolucao);
    
    const valorPago = Number(fatura.valorPago) || 0;
    const valorPendente = Math.max(0, valorTotalGeral - valorPago);
    const empresa = fatura.empresa as any;
    const nomeEmpresa =
      empresa?.nomeFantasia ?? empresa?.nome ?? `Empresa ${fatura.idEmpresa}`;
    const cnpj = empresa?.documento ?? empresa?.cnpj ?? '';
    const telefone = empresa?.telefone ? String(empresa.telefone) : '';
    const partesRestante: string[] = [];
    if (empresa?.email) partesRestante.push(empresa.email);
    if (empresa?.nomeResponsavel) partesRestante.push(empresa.nomeResponsavel);
    const contatoRestante = partesRestante.length > 0 ? partesRestante.join(' | ') : '';
    const contato = [telefone, ...partesRestante].filter(Boolean).length > 0
      ? [telefone, ...partesRestante].filter(Boolean).join(' | ')
      : '—';
    const telefoneParaWhatsApp = telefone
      ? '55' + telefone.replace(/\D/g, '').replace(/^0+/, '')
      : '';

    const telefoneFinanceiro = empresa?.telefoneFinanceiro ? String(empresa.telefoneFinanceiro) : '';
    const telefoneFinanceiroWhatsApp = telefoneFinanceiro
      ? '55' + telefoneFinanceiro.replace(/\D/g, '').replace(/^0+/, '')
      : '';

    const contatoFinanceiro = {
      nome: empresa?.nomeResponsavelFinanceiro ?? '',
      telefone: telefoneFinanceiro,
      email: empresa?.emailFinanceiro ?? '',
      telefoneWhatsApp: telefoneFinanceiroWhatsApp,
    };

    const componentesPendentesDevolucao = componentes.filter(
      (c) =>
        String(c.statusTrabalho).toUpperCase() ===
        StatusOrdemServicoItem.DEVOLUCAO_SOLICITADA,
    );
    const componentesLista = componentes.filter(
      (c) =>
        String(c.statusTrabalho).toUpperCase() !==
        StatusOrdemServicoItem.DEVOLUCAO_SOLICITADA,
    );

    const devolucoesComponentes = (fatura.devolucoesComponentes || []).map((dev) => ({
      idComponente: dev.idComponente,
      nomeComponente: dev.componente?.nome ?? `Componente #${dev.idComponente}`,
      quantidade: Number(dev.quantidade),
      valorUnitario: Number(dev.valorUnitario),
      valorTotal: Number(dev.quantidade) * Number(dev.valorUnitario),
      idPaciente: dev.idPaciente,
      nomePaciente: dev.nomePaciente || dev.paciente?.nome || null,
    }));

    return {
      nomeEmpresa,
      nomeFantasia: nomeEmpresa,
      cnpj,
      contato,
      telefone,
      contatoRestante,
      telefoneWhatsApp: telefoneParaWhatsApp,
      contatoFinanceiro,
      dataReferencia: fatura.dataFim,
      servicos,
      componentes: componentesLista,
      componentesPendentesDevolucao,
      valorTotalServicos,
      valorTotalComponentes,
      valorTotalBruto,
      desconto,
      descontoDevolucao: Number(fatura.descontoDevolucao || 0),
      devolucoesComponentes,
      valorTotalGeral,
      valorPago,
      valorPendente,
    };
  }

  /**
   * Obtém o resumo de impressão de todas as faturas de uma competência específica.
   * Retorna um array com os detalhes de cada fatura no mesmo formato de obterResumoImpressaoFatura.
   */
  async obterResumoImpressaoFaturasPorCompetencia(
    competencia: string,
    idEmpresa?: number
  ): Promise<Array<{
    nomeEmpresa: string;
    dataReferencia: Date;
    servicos: any[];
    componentes: any[];
    valorTotalServicos: number;
    valorTotalComponentes: number;
    valorTotalBruto: number;
    desconto: number;
    valorTotalGeral: number;
    valorPago: number;
    valorPendente: number;
  }>> {
    // Valida e parseia a competência
    const competenciaRegex = /^(\d{1,2})\/(\d{4})$/;
    const match = competencia.match(competenciaRegex);

    if (!match) {
      throw new BadRequestException(
        'Formato de competência inválido. Use o formato MM/YYYY (ex: 11/2025)'
      );
    }

    const mes = parseInt(match[1], 10);
    const ano = parseInt(match[2], 10);

    // Valida o mês (1-12)
    if (mes < 1 || mes > 12) {
      throw new BadRequestException('Mês inválido. O mês deve estar entre 1 e 12.');
    }

    // Calcula primeiro e último dia do mês
    const primeiroDiaMes = new Date(ano, mes - 1, 1);
    const ultimoDiaMes = new Date(ano, mes, 0);

    // Formata as datas no formato usado no banco
    const dataInicioStr = `${ano}-${String(mes).padStart(2, '0')}-01`;
    const dataFimStr = `${ano}-${String(mes).padStart(2, '0')}-${String(ultimoDiaMes.getDate()).padStart(2, '0')}`;
    
    const dataInicioDate = new Date(`${dataInicioStr}T00:00:00`);
    const dataFimDate = new Date(`${dataFimStr}T23:59:59`);

    // Busca faturas que se sobrepõem ao mês informado
    const queryBuilder = this.faturaRepository.createQueryBuilder('fatura');

    queryBuilder.where('fatura.dataInicio <= :dataFim', { dataFim: dataFimDate });
    queryBuilder.andWhere('fatura.dataFim >= :dataInicio', { dataInicio: dataInicioDate });

    if (idEmpresa) {
      queryBuilder.andWhere('fatura.idEmpresa = :idEmpresa', { idEmpresa });
    }

    queryBuilder.leftJoinAndSelect('fatura.empresa', 'empresa');
    queryBuilder.orderBy('fatura.dataFim', 'DESC');

    const faturas = await queryBuilder.getMany();

    // Processa cada fatura para obter o resumo de impressão no mesmo formato padrão
    const faturasResumo = await Promise.all(
      faturas.map(async (fatura) => {
        return await this.obterResumoImpressaoFatura(fatura.idFatura);
      })
    );

    return faturasResumo;
  }

  /**
   * Adiciona trabalhos com status ENVIADO ou ENVIADO_PROVA à fatura correspondente ao mês de conclusão.
   * Agrupa trabalhos por empresa e mês de conclusão (dataConclusao).
   * Se não houver fatura aberta para aquele mês, cria uma nova.
   */
  async adicionarTrabalhosEnviadosAFatura(idEmpresa?: number): Promise<{ adicionados: number; faturasAtualizadas: number }> {
    return this.dataSource.transaction(async (manager) => {
      const faturaRepo = manager.getRepository(Fatura);
      const osRepo = manager.getRepository(OrdemServico);
      const osItemRepo = manager.getRepository(OrdemServicoItem);
      const trabalhoRepo = manager.getRepository(Trabalho);

      // Busca trabalhos com status ENVIADO ou ENVIADO_PROVA que tenham dataConclusao
      // e cuja OrdemServico não está em nenhuma fatura
      const queryBuilder = trabalhoRepo.createQueryBuilder('trabalho');

      // Faz join com OrdemServico usando idTrabalho
      queryBuilder.innerJoin(
        'TbOrdemServico',
        'os',
        'os.idTrabalho = trabalho.idTrabalho'
      );
      
      queryBuilder.where('trabalho.status IN (:...status)', {
        status: [StatusTrabalho.ENVIADO, StatusTrabalho.ENVIADO_PROVA],
      });
      queryBuilder.andWhere('trabalho.dataConclusao IS NOT NULL');
      queryBuilder.andWhere('os.idFatura IS NULL'); // Apenas OS que não estão em nenhuma fatura
      queryBuilder.andWhere('os.status = :osStatus', { osStatus: StatusOrdemServico.RECEBER });
      queryBuilder.andWhere('os.concluido = :concluido', { concluido: true });

      if (idEmpresa) {
        queryBuilder.andWhere('trabalho.idEmpresa = :idEmpresa', { idEmpresa });
      }

      const trabalhosEnviados = await queryBuilder.getMany();

      // Filtra apenas trabalhos com dataConclusao (já filtrado no query, mas mantém por segurança)
      const trabalhosComDataConclusao = trabalhosEnviados.filter(t => t.dataConclusao);

      if (trabalhosComDataConclusao.length === 0) {
        this.logger.log('Nenhum trabalho enviado com dataConclusao encontrado para adicionar à fatura.');
        return { adicionados: 0, faturasAtualizadas: 0 };
      }

      // Agrupa trabalhos por fatura (mesma empresa e mesma fatura)
      const trabalhosPorFatura = new Map<number, { fatura: Fatura; trabalhos: Trabalho[] }>();
      let totalAdicionados = 0;
      let totalFaturasAtualizadas = 0;
      const faturasProcessadas = new Set<number>();

      // Processa cada trabalho individualmente
      for (const trabalho of trabalhosComDataConclusao) {
        const dataRef = trabalho.dataConclusao || trabalho.dataHoraEnvio || (trabalho as any).dataInclusao;
        const info = extrairAnoMesDia(dataRef);
        if (!info) continue;

        const ano = info.ano;
        const mes = info.mes; // 1-12

        // Obtém ou cria a fatura para o mês exato de conclusão do trabalho
        const fatura = await this.obterOuCriarFaturaParaMesAno(
          manager,
          trabalho.idEmpresa,
          ano,
          mes,
        );

        // Agrupa trabalhos por fatura para processar em lote
        if (fatura) {
          if (!trabalhosPorFatura.has(fatura.idFatura)) {
            trabalhosPorFatura.set(fatura.idFatura, { fatura, trabalhos: [] });
          }
          trabalhosPorFatura.get(fatura.idFatura)!.trabalhos.push(trabalho);
        }
      }

      // Processa cada fatura com seus trabalhos
      for (const [idFatura, { fatura, trabalhos }] of trabalhosPorFatura) {

        // Busca as OS dos trabalhos que ainda não estão em nenhuma fatura
        const idsTrabalhos = trabalhos.map(t => t.idTrabalho);
        const ordensServico = await osRepo.find({
          where: {
            idTrabalho: In(idsTrabalhos),
            fatura: IsNull(),
            status: StatusOrdemServico.RECEBER,
            concluido: true,
          },
          relations: ['itens'],
        });

        if (ordensServico.length === 0) {
          this.logger.log(
            `Nenhuma OS pendente encontrada para os trabalhos da fatura ${fatura.idFatura}`
          );
          continue;
        }

        // Adiciona as OS à fatura (aplica desconto após somar)
        const valorNovasOrdens = ordensServico.reduce((sum, os) => sum + Number(os.valorTotal), 0);
        const valorBruto = Number(fatura.valorTotalBruto || fatura.valorTotal) + valorNovasOrdens;
        const desconto = Number(fatura.desconto || 0);
        fatura.valorTotalBruto = valorBruto;
        fatura.valorTotal = Math.max(0, valorBruto - desconto);

        await osRepo.update(
          ordensServico.map(os => os.idOrdemServico),
          { fatura: fatura }
        );

        // Atualiza o status dos itens para FATURADO, mas preserva itens DEVOLVIDOS
        const idsItens = ordensServico.flatMap(os => 
          os.itens?.map(item => item.idOrdemServicoItem) || []
        );

        if (idsItens.length > 0) {
          // Buscar itens que não estão com status DEVOLVIDO para atualizar
          const itensParaAtualizar = await osItemRepo.find({
            where: {
              idOrdemServicoItem: In(idsItens),
              status: Not(StatusOrdemServicoItem.DEVOLVIDO)
            }
          });
          
          const idsParaAtualizar = itensParaAtualizar.map(item => item.idOrdemServicoItem);
          
          if (idsParaAtualizar.length > 0) {
            await osItemRepo.update(
              { idOrdemServicoItem: In(idsParaAtualizar) },
              { status: StatusOrdemServicoItem.FATURADO }
            );
          }
        }

        await faturaRepo.save(fatura);

        totalAdicionados += ordensServico.length;
        
        // Conta a fatura apenas uma vez se ainda não foi processada
        if (!faturasProcessadas.has(fatura.idFatura)) {
          faturasProcessadas.add(fatura.idFatura);
          totalFaturasAtualizadas += 1;
        }

        const dataInicioFormatada = new Date(fatura.dataInicio).toLocaleDateString('pt-BR');
        const dataFimFormatada = new Date(fatura.dataFim).toLocaleDateString('pt-BR');
        this.logger.log(
          `Adicionadas ${ordensServico.length} OS à fatura ${fatura.idFatura} da empresa ${fatura.idEmpresa} (período: ${dataInicioFormatada} a ${dataFimFormatada})`
        );
      }

      return {
        adicionados: totalAdicionados,
        faturasAtualizadas: totalFaturasAtualizadas,
      };
    });
  }

  /**
   * Adiciona um trabalho específico à próxima fatura (ou cria uma nova se necessário).
   * Usado quando o status do trabalho muda para ENVIADO ou ENVIADO_PROVA.
   */
  async adicionarTrabalhoAProximaFatura(idTrabalho: number): Promise<Fatura | null> {
    return this.dataSource.transaction(async (manager) => {
      const faturaRepo = manager.getRepository(Fatura);
      const osRepo = manager.getRepository(OrdemServico);
      const osItemRepo = manager.getRepository(OrdemServicoItem);
      const trabalhoRepo = manager.getRepository(Trabalho);

      // Busca o trabalho
      const trabalho = await trabalhoRepo.findOne({
        where: { idTrabalho },
      });

      if (!trabalho) {
        this.logger.warn(`Trabalho ${idTrabalho} não encontrado`);
        return null;
      }

      // Verifica se o status é ENVIADO ou ENVIADO_PROVA
      if (trabalho.status !== StatusTrabalho.ENVIADO && trabalho.status !== StatusTrabalho.ENVIADO_PROVA) {
        this.logger.log(`Trabalho ${idTrabalho} não está com status ENVIADO ou ENVIADO_PROVA. Status atual: ${trabalho.status}`);
        return null;
      }

      // Busca a OS do trabalho
      const ordemServico = await osRepo.findOne({
        where: {
          idTrabalho: idTrabalho,
          status: StatusOrdemServico.RECEBER,
          concluido: true,
        },
        relations: ['itens'],
      });

      if (!ordemServico) {
        this.logger.log(`Ordem de Serviço não encontrada ou não está pronta para o trabalho ${idTrabalho}`);
        return null;
      }

      // Se a OS já está em uma fatura, não faz nada
      if (ordemServico.idFatura) {
        this.logger.log(`Ordem de Serviço ${ordemServico.idOrdemServico} já está na fatura ${ordemServico.idFatura}`);
        return null;
      }

      // Determina a data de referência do trabalho/OS
      const dataRef = trabalho.dataConclusao || trabalho.dataHoraEnvio || ordemServico.dataConcluido;
      const info = extrairAnoMesDia(dataRef);
      if (!info) {
        this.logger.warn(`Trabalho ${idTrabalho} não possui data válida. Não é possível determinar a fatura correta.`);
        return null;
      }

      const ano = info.ano;
      const mes = info.mes; // 1-12

      // Obtém ou cria a fatura para o mês exato de conclusão do trabalho
      const fatura = await this.obterOuCriarFaturaParaMesAno(
        manager,
        trabalho.idEmpresa,
        ano,
        mes,
      );

      // Adiciona a OS à fatura (aplica desconto após somar)
      const valorBruto = Number(fatura.valorTotalBruto || fatura.valorTotal) + Number(ordemServico.valorTotal);
      const desconto = Number(fatura.desconto || 0);
      fatura.valorTotalBruto = valorBruto;
      fatura.valorTotal = Math.max(0, valorBruto - desconto);
      await osRepo.update(ordemServico.idOrdemServico, { fatura: fatura });

      // Atualiza o status dos itens para FATURADO, mas preserva itens DEVOLVIDOS
      if (ordemServico.itens && ordemServico.itens.length > 0) {
        const idsItens = ordemServico.itens.map(item => item.idOrdemServicoItem);
        const itensParaAtualizar = await osItemRepo.find({
          where: {
            idOrdemServicoItem: In(idsItens),
            status: Not(StatusOrdemServicoItem.DEVOLVIDO)
          }
        });
        const idsItensParaAtualizar = itensParaAtualizar.map(item => item.idOrdemServicoItem);
        if (idsItensParaAtualizar.length > 0) {
          await osItemRepo.update(
            { idOrdemServicoItem: In(idsItensParaAtualizar) },
            { status: StatusOrdemServicoItem.FATURADO }
          );
        }
      }

      await faturaRepo.save(fatura);

      this.logger.log(
        `Trabalho ${idTrabalho} (OS ${ordemServico.idOrdemServico}) adicionado à fatura ${fatura.idFatura}`
      );

      return fatura;
    });
  }

  async lancarValorFatura(idFatura: number, dto: LancarValorFaturaDto): Promise<Fatura> {
    return this.dataSource.transaction(async manager => {
      const faturaRepo = manager.getRepository(Fatura);
      const contaRepo = manager.getRepository(Conta);
      const movRepo = manager.getRepository(Movimentacao);

      // Buscar fatura com lock pessimista
      const fatura = await faturaRepo.findOne({
        where: { idFatura },
        lock: { mode: 'pessimistic_write' },
      });

      if (!fatura) {
        throw new NotFoundException(`Fatura com ID ${idFatura} não encontrada.`);
      }

      if (fatura.status === StatusFatura.PAGA || fatura.status === StatusFatura.CANCELADA) {
        throw new BadRequestException(`Fatura com status ${fatura.status} não pode receber pagamentos.`);
      }

      // Buscar conta com lock pessimista
      const conta = await contaRepo.findOne({
        where: { idConta: dto.idConta },
        lock: { mode: 'pessimistic_write' },
      });

      if (!conta) {
        throw new NotFoundException(`Conta com ID ${dto.idConta} não encontrada.`);
      }

      const valor = Number(dto.valor);
      const valorTotalFatura = Number(fatura.valorTotal);
      const valorPagoAtual = Number(fatura.valorPago || 0);
      const valorRestante = valorTotalFatura - valorPagoAtual;

      // Validar que o valor não excede o valor restante
      if (valor > valorRestante + 0.01) {
        throw new BadRequestException(
          `O valor a lançar (R$ ${valor}) não pode ser maior que o valor restante (R$ ${valorRestante}).`
        );
      }

      // Criar Lançamento vinculado à fatura
      const lancamentoRepo = manager.getRepository(Lancamento);
      const parcelaRepo = manager.getRepository(Parcela);
      const parcelasDto = dto.parcelas && dto.parcelas.length > 0
        ? dto.parcelas
        : [{ valor: valor, dataVencimento: dto.dataPagamento! }];

      const totalParcelas = parcelasDto.length;
      // A competência deve refletir a competência real da fatura (início da vigência), e não a data de vencimento da parcela
      const dataCompetenciaString =
        formatDataLocalYYYYMMDD(fatura.dataInicio) ||
        formatDataLocalYYYYMMDD(fatura.dataFim) ||
        parcelasDto[0].dataVencimento.split('T')[0];

      const lancamento = lancamentoRepo.create({
        descricao: `Pagamento da Fatura #${idFatura}${dto.meioPagamento ? ` - ${dto.meioPagamento}` : ''}${totalParcelas > 1 ? ` (${totalParcelas} parcelas)` : ''}`,
        tipo: TipoLancamento.RECEITA,
        valorTotal: valor,
        totalParcelas: totalParcelas,
        dataCompetencia: dataCompetenciaString,
        idFatura: fatura.idFatura,
        idClienteFornecedor: fatura.idEmpresa,
        idCategoria: 44,
        status: StatusLancamento.PENDENTE,
      });
      const lancamentoSalvo = await lancamentoRepo.save(lancamento);

      let todasPagas = true;
      const meioPagamentoNormalizado = (dto.meioPagamento || '').toLowerCase();
      const ehBoletoOuCheque =
        meioPagamentoNormalizado.includes('boleto') ||
        meioPagamentoNormalizado.includes('cheque');

      for (let i = 0; i < parcelasDto.length; i++) {
        const pDto = parcelasDto[i];
        
        const dataVencimentoString = pDto.dataVencimento.split('T')[0];
        const dataVencimentoDate = new Date(dataVencimentoString + 'T12:00:00');
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        const dataVencimentoComparacao = new Date(dataVencimentoDate);
        dataVencimentoComparacao.setHours(0, 0, 0, 0);
        
        const isDataFutura = dataVencimentoComparacao > hoje;
        
        const statusParcela = ehBoletoOuCheque
          ? StatusParcela.ABERTO
          : (isDataFutura ? StatusParcela.ABERTO : StatusParcela.PAGO);
        
        const valorPagoParcela = ehBoletoOuCheque || isDataFutura ? 0 : pDto.valor;
        const dataPagamentoParcela = ehBoletoOuCheque || isDataFutura ? null : dataVencimentoDate;

        if (statusParcela !== StatusParcela.PAGO) {
          todasPagas = false;
        }

        const parcela = parcelaRepo.create({
          idLancamento: lancamentoSalvo.idLancamento,
          numeroParcela: i + 1,
          valor: pDto.valor,
          dataVencimento: dataVencimentoString,
          meioPagamento: (dto.meioPagamento as MeioPagamento) || MeioPagamento.DINHEIRO,
          status: statusParcela,
          valorPago: valorPagoParcela,
          dataPagamento: dataPagamentoParcela,
        });
        const parcelaSalva = await parcelaRepo.save(parcela);

        if (!isDataFutura && !ehBoletoOuCheque) {
          try {
            const movimentacao = movRepo.create({
              idConta: conta.idConta,
              tipo: TipoMovimentacao.CREDITO,
              valor: Number(pDto.valor),
              descricao: `Pagamento da Fatura #${idFatura}${dto.meioPagamento ? ` - ${dto.meioPagamento}` : ''}${totalParcelas > 1 ? ` (Parcela ${i+1}/${totalParcelas})` : ''}`,
              dataMovimentacao: dataVencimentoDate,
              idParcelaOrigem: parcelaSalva.idParcela,
            });
            
            const movimentacaoSalva = await movRepo.save(movimentacao);
            
            if (!movimentacaoSalva || !movimentacaoSalva.idMovimentacao) {
              throw new Error('Movimentação não foi salva corretamente');
            }

            const saldoAnterior = Number(conta.saldoAtual || 0);
            conta.saldoAtual = saldoAnterior + Number(pDto.valor);
            await contaRepo.save(conta);
          } catch (error) {
            this.logger.error(`Erro ao criar movimentação: ${error.message}`, error.stack);
            throw error;
          }
        }
      }

      lancamentoSalvo.status = ehBoletoOuCheque ? StatusLancamento.PENDENTE : (todasPagas ? StatusLancamento.PAGO : StatusLancamento.PENDENTE);
      await lancamentoRepo.save(lancamentoSalvo);

      // Atualizar valor pago da fatura (sempre, mesmo com data futura)
      const novoValorPago = valorPagoAtual + valor;
      fatura.valorPago = novoValorPago;

      // Atualizar status da fatura baseado no valor pago (sempre, mesmo com data futura)
      const valorRestanteAposPagamento = valorTotalFatura - novoValorPago;
      const osItemRepo = manager.getRepository(OrdemServicoItem);
      const ordemServicoRepo = manager.getRepository(OrdemServico);
      const trabalhoRepo = manager.getRepository(Trabalho);

      if (valorRestanteAposPagamento < 0.01) {
        fatura.status = StatusFatura.PAGA;

        // Se a fatura foi totalmente paga, atualiza todos os itens e trabalhos relacionados
        // Buscar todas as OS da fatura
        const ordensDeServico = await ordemServicoRepo.find({
          where: { idFatura: fatura.idFatura },
          select: ['idOrdemServico', 'idTrabalho'],
        });

        if (ordensDeServico.length > 0) {
          const idsOs = ordensDeServico.map(os => os.idOrdemServico);
          const idsTrabalhos = new Set(ordensDeServico.map(os => os.idTrabalho));

          // Atualizar todos os itens das OS para PAGO
          await osItemRepo.update(
            { idOrdemServico: In(idsOs) },
            { status: StatusOrdemServicoItem.PAGO }
          );

          // Atualizar todos os trabalhos para PAGAMENTO_RECEBIDO
          if (idsTrabalhos.size > 0) {
            await trabalhoRepo.update(
              { idTrabalho: In(Array.from(idsTrabalhos)) },
              {
                finalizado: true,
              }
            );
          }
        }
      } else {
        fatura.status = StatusFatura.PAGA_PARCIALMENTE;
      }

      await faturaRepo.save(fatura);

      return this.buscarFaturaPorId(fatura.idFatura);
    });
  }

  /**
   * Reabre uma fatura paga (ou parcialmente paga), desfazendo os lançamentos no financeiro:
   * estorna as movimentações, cancela as parcelas dos lançamentos da fatura, zera valorPago da fatura
   * e reverte o status dos itens de OS e trabalhos para FATURADO/ENVIADO.
   */
  async reabrirFatura(idFatura: number): Promise<Fatura> {
    return this.dataSource.transaction(async (manager) => {
      const faturaRepo = manager.getRepository(Fatura);
      const ordemServicoRepo = manager.getRepository(OrdemServico);
      const osItemRepo = manager.getRepository(OrdemServicoItem);
      const trabalhoRepo = manager.getRepository(Trabalho);

      const fatura = await faturaRepo.findOne({
        where: { idFatura },
        lock: { mode: 'pessimistic_write' },
      });
      if (!fatura) {
        throw new NotFoundException(`Fatura com ID ${idFatura} não encontrada.`);
      }

      const statusPermitidos = [StatusFatura.PAGA, StatusFatura.PAGA_PARCIALMENTE];
      if (!statusPermitidos.includes(fatura.status)) {
        if (fatura.status === StatusFatura.CANCELADA) {
          throw new BadRequestException('Fatura cancelada não pode ser reaberta.');
        }
        if (fatura.status === StatusFatura.AGUARDANDO_DEVOLUCAO) {
          throw new BadRequestException('Fatura com devolução pendente não pode ser reaberta.');
        }
        throw new BadRequestException(
          `Apenas faturas pagas ou parcialmente pagas podem ser reabertas. Status atual: ${fatura.status}`,
        );
      }

      await this.cancelarLancamentosDaFatura(manager, idFatura);
      await this.estornarMovimentacoesPagamentoItensDaFatura(manager, idFatura);

      fatura.valorPago = 0;
      fatura.status = StatusFatura.ABERTA;
      await faturaRepo.save(fatura);

      const ordensDeServico = await ordemServicoRepo.find({
        where: { idFatura: fatura.idFatura },
        select: ['idOrdemServico', 'idTrabalho'],
      });
      if (ordensDeServico.length > 0) {
        const idsOs = ordensDeServico.map((os) => os.idOrdemServico);
        const idsTrabalhos = new Set(ordensDeServico.map((os) => os.idTrabalho));

        await osItemRepo.update(
          { idOrdemServico: In(idsOs) },
          { status: StatusOrdemServicoItem.FATURADO, valorPago: 0 },
        );

        if (idsTrabalhos.size > 0) {
          await trabalhoRepo.update(
            { idTrabalho: In(Array.from(idsTrabalhos)) },
            { status: StatusTrabalho.ENVIADO },
          );
        }
      }

      this.logger.log(`Fatura #${idFatura} reaberta com sucesso.`);
      return this.buscarFaturaPorId(fatura.idFatura);
    });
  }

  private async estornarMovimentacaoReabertura(
    manager: EntityManager,
    movOriginal: Movimentacao,
    descricaoEstorno: string,
    idParcelaOrigem?: number,
  ): Promise<void> {
    const movRepo = manager.getRepository(Movimentacao);
    const contaRepo = manager.getRepository(Conta);

    if (idParcelaOrigem) {
      const estornoExistente = await movRepo.count({
        where: { idParcelaOrigem, descricao: Like('Estorno - Reabertura%') },
      });
      if (estornoExistente > 0) {
        return;
      }
    }

    const conta = await contaRepo.findOne({
      where: { idConta: movOriginal.idConta },
      lock: { mode: 'pessimistic_write' },
    });
    if (!conta) {
      throw new NotFoundException(`Conta com ID ${movOriginal.idConta} não encontrada.`);
    }

    const acrescimoOrig = Number(movOriginal.valorAcrescimo ?? 0);
    const totalEstorno = Number(movOriginal.valor) + acrescimoOrig;
    const tipoEstorno = movOriginal.tipo === TipoMovimentacao.CREDITO
      ? TipoMovimentacao.DEBITO
      : TipoMovimentacao.CREDITO;

    const estorno = movRepo.create({
      idConta: conta.idConta,
      tipo: tipoEstorno,
      valor: movOriginal.valor,
      valorAcrescimo: acrescimoOrig,
      descricao: descricaoEstorno,
      dataMovimentacao: new Date(),
      idParcelaOrigem,
    });
    await movRepo.save(estorno);

    const saldoAtualNum = Number(conta.saldoAtual ?? 0);
    const novoSaldo = tipoEstorno === TipoMovimentacao.CREDITO
      ? saldoAtualNum + totalEstorno
      : saldoAtualNum - totalEstorno;
    await contaRepo.update(
      { idConta: conta.idConta },
      { saldoAtual: novoSaldo, dataAlteracao: new Date() },
    );
  }

  private async cancelarLancamentosDaFatura(
    manager: EntityManager,
    idFatura: number,
  ): Promise<void> {
    const lancamentoRepo = manager.getRepository(Lancamento);
    const parcelaRepo = manager.getRepository(Parcela);
    const movRepo = manager.getRepository(Movimentacao);

    const lancamentos = await lancamentoRepo.find({
      where: { idFatura },
      relations: ['parcelas', 'parcelas.movimentacao'],
    });

    for (const lancamento of lancamentos) {
      for (const parcela of lancamento.parcelas || []) {
        if (parcela.status === StatusParcela.CANCELADO) {
          continue;
        }

        if (parcela.status === StatusParcela.PAGO) {
          let movimentacoesOrigem = await movRepo.find({
            where: { idParcelaOrigem: parcela.idParcela },
          });
          if (movimentacoesOrigem.length === 0 && parcela.movimentacao) {
            movimentacoesOrigem = [parcela.movimentacao as Movimentacao];
          }

          for (const mov of movimentacoesOrigem) {
            await this.estornarMovimentacaoReabertura(
              manager,
              mov,
              `Estorno - Reabertura da Fatura #${idFatura} (lançamento #${lancamento.idLancamento})`,
              parcela.idParcela,
            );
          }
        }

        parcela.status = StatusParcela.CANCELADO;
        parcela.valorPago = 0;
        parcela.dataPagamento = null;
        parcela.movimentacao = null;
        await parcelaRepo.save(parcela);
      }

      lancamento.status = StatusLancamento.CANCELADO;
      await lancamentoRepo.save(lancamento);
    }
  }

  private async estornarMovimentacoesPagamentoItensDaFatura(
    manager: EntityManager,
    idFatura: number,
  ): Promise<void> {
    const movRepo = manager.getRepository(Movimentacao);

    const movimentacoes = await movRepo
      .createQueryBuilder('m')
      .where('m.descricao LIKE :itemPattern', { itemPattern: 'Pagamento do item #%' })
      .andWhere('m.descricao LIKE :faturaPattern', { faturaPattern: `%da Fatura #${idFatura}%` })
      .andWhere('m.tipo = :tipo', { tipo: TipoMovimentacao.CREDITO })
      .getMany();

    for (const mov of movimentacoes) {
      const estornoExistente = await movRepo
        .createQueryBuilder('e')
        .where('e.descricao LIKE :pattern', { pattern: `%movimentação #${mov.idMovimentacao}%` })
        .andWhere('e.descricao LIKE :reabertura', { reabertura: `Estorno - Reabertura da Fatura #${idFatura}%` })
        .getCount();
      if (estornoExistente > 0) {
        continue;
      }

      await this.estornarMovimentacaoReabertura(
        manager,
        mov,
        `Estorno - Reabertura da Fatura #${idFatura} (movimentação #${mov.idMovimentacao})`,
      );
    }
  }

  async dividirFatura(idFaturaOriginal: number, dto: DividirFaturaDto): Promise<{ original: Fatura; nova: Fatura }> {
    return this.dataSource.transaction(async (manager) => {
      const faturaRepo = manager.getRepository(Fatura);
      const osRepo = manager.getRepository(OrdemServico);

      // 1. Buscar a fatura original
      const faturaOriginal = await faturaRepo.findOne({
        where: { idFatura: idFaturaOriginal },
        relations: ['ordensDeServico'],
      });

      if (!faturaOriginal) {
        throw new NotFoundException(`Fatura de origem com ID ${idFaturaOriginal} não encontrada.`);
      }

      if (faturaOriginal.status !== StatusFatura.ABERTA) {
        throw new BadRequestException('Apenas faturas com status ABERTA podem ser divididas.');
      }

      // 2. Validar ordens de serviço fornecidas
      const idsOrdemServico = dto.idsOrdemServico || [];
      if (idsOrdemServico.length === 0) {
        throw new BadRequestException('Selecione pelo menos um trabalho para dividir a fatura.');
      }

      const osIdsOriginais = faturaOriginal.ordensDeServico.map(os => os.idOrdemServico);
      const invalidos = idsOrdemServico.filter(id => !osIdsOriginais.includes(id));
      if (invalidos.length > 0) {
        throw new BadRequestException(`As seguintes Ordens de Serviço não pertencem à fatura original: ${invalidos.join(', ')}`);
      }

      if (idsOrdemServico.length === faturaOriginal.ordensDeServico.length) {
        throw new BadRequestException('Não é possível mover todas as ordens de serviço. Pelo menos um trabalho deve permanecer na fatura original.');
      }

      // 3. Criar a nova fatura (bifurcada)
      const novaFatura = faturaRepo.create({
        idEmpresa: faturaOriginal.idEmpresa,
        dataInicio: faturaOriginal.dataInicio,
        dataFim: faturaOriginal.dataFim,
        dataVencimento: faturaOriginal.dataVencimento,
        valorTotalBruto: 0,
        desconto: 0,
        valorTotal: 0,
        valorPago: 0,
        status: StatusFatura.ABERTA,
        idFaturaOriginal: faturaOriginal.idFatura,
        descricao: dto.descricao,
      });

      const faturaSalva = await faturaRepo.save(novaFatura);

      // 4. Mover as OSs selecionadas para a nova fatura
      await osRepo.update(idsOrdemServico, { fatura: faturaSalva });

      // 5. Recalcular ambas as faturas
      await this.recalcularFaturaComManager(manager, faturaOriginal.idFatura);
      await this.recalcularFaturaComManager(manager, faturaSalva.idFatura);

      // 6. Carregar as faturas finais atualizadas
      const originalAtualizada = await this.buscarFaturaPorIdComManager(manager, faturaOriginal.idFatura);
      const novaAtualizada = await this.buscarFaturaPorIdComManager(manager, faturaSalva.idFatura);

      return {
        original: originalAtualizada,
        nova: novaAtualizada,
      };
    });
  }

  private async buscarFaturaPorIdComManager(manager: EntityManager, idFatura: number): Promise<Fatura> {
    const fatura = await manager.getRepository(Fatura).findOne({
      where: { idFatura },
      relations: [
        'empresa',
        'ordensDeServico',
        'ordensDeServico.trabalho',
        'ordensDeServico.itens.devolucoes',
      ],
      order: {
        ordensDeServico: {
          trabalho: {
            idTrabalho: 'ASC',
          },
        },
      },
    });
    if (!fatura) {
      throw new NotFoundException(`Fatura com ID ${idFatura} não encontrada.`);
    }
    return fatura;
  }

  async buscarDevolucoesComponentes(idFatura: number): Promise<FaturaDevolucaoItem[]> {
    return this.faturaDevolucaoItemRepository.find({
      where: { idFatura },
      relations: ['componente'],
    });
  }

  async salvarDevolucoesComponentes(
    idFatura: number,
    items: { idComponente: number; quantidade: number; idPaciente?: number; nomePaciente?: string }[],
  ): Promise<Fatura> {
    const fatura = await this.faturaRepository.findOne({
      where: { idFatura },
    });

    if (!fatura) {
      throw new NotFoundException(`Fatura com ID ${idFatura} não encontrada.`);
    }

    if (fatura.status === StatusFatura.PAGA) {
      throw new BadRequestException('Faturas pagas não podem ter suas devoluções alteradas.');
    }

    return this.dataSource.transaction(async (manager) => {
      const devItemRepo = manager.getRepository(FaturaDevolucaoItem);
      const compRepo = manager.getRepository(Componente);
      const faturaRepo = manager.getRepository(Fatura);
      const osItemRepo = manager.getRepository(OrdemServicoItem);
      const devolucaoRepo = manager.getRepository(DevolucaoComponente);

      // 1. Excluir devoluções anteriores de desconto financeiro
      await devItemRepo.delete({ idFatura });

      let totalDescontoDevolucao = 0;

      // 2. Para cada item do desconto financeiro, verificar e cancelar devolução física pendente
      if (items && items.length > 0) {
        for (const item of items) {
          const componente = await compRepo.findOne({
            where: { idComponente: item.idComponente },
          });

          if (!componente) {
            throw new NotFoundException(`Componente com ID ${item.idComponente} não encontrado.`);
          }

          // 2a. Buscar itens de OS vinculados a esta fatura com esse componente que estejam
          //     em processo de devolução física (solicitada OU já devolvida fisicamente)
          const osItemsParaReverter = await osItemRepo
            .createQueryBuilder('osItem')
            .innerJoinAndSelect('osItem.ordemServico', 'os')
            .leftJoinAndSelect('os.trabalho', 'trabalho')
            .where('os.idFatura = :idFatura', { idFatura })
            .andWhere('osItem.idReferencia = :idComponente', { idComponente: item.idComponente })
            .andWhere('osItem.tipoCobranca = :tipo', { tipo: TipoCobranca.COMPONENTE })
            .andWhere('osItem.status IN (:...statuses)', {
              statuses: [
                StatusOrdemServicoItem.DEVOLUCAO_SOLICITADA,
                StatusOrdemServicoItem.DEVOLVIDO,
              ],
            })
            .getMany();

          // Se foi especificado um paciente, filtra apenas os itens desse paciente
          const itensParaCancelar = osItemsParaReverter.filter(osItem => {
            if (item.idPaciente) {
              return osItem.ordemServico?.trabalho?.idPaciente === item.idPaciente;
            } else if (item.nomePaciente) {
              return osItem.ordemServico?.trabalho?.nomePaciente === item.nomePaciente;
            }
            return true; // Se não tem paciente especificado, aceita todos
          });

          let quantidadeParaDescontar = Number(item.quantidade);

          // 2b. Cancelar todas as devoluções físicas abertas e reverter o item de OS para FATURADO
          for (const osItem of itensParaCancelar) {
            if (quantidadeParaDescontar <= 0) break;

            // Cancela qualquer TbDevolucaoComponente ainda não cancelada vinculada a esse item
            await devolucaoRepo
              .createQueryBuilder()
              .update(DevolucaoComponente)
              .set({ status: StatusDevolucao.CANCELADO })
              .where('idOrdemServicoItem = :id', { id: osItem.idOrdemServicoItem })
              .andWhere('status != :cancelado', { cancelado: StatusDevolucao.CANCELADO })
              .execute();

            // Reverte o item de OS de volta para FATURADO, zerando a quantidade devolvida
            await osItemRepo.update(
              { idOrdemServicoItem: osItem.idOrdemServicoItem },
              {
                status: StatusOrdemServicoItem.FATURADO,
                quantidadeDevolvida: 0,
              },
            );

            quantidadeParaDescontar -= Number(osItem.quantidade || 0);
          }


          const valorUnitario = Number(componente.preco);
          const valorTotalItem = valorUnitario * Number(item.quantidade);
          totalDescontoDevolucao += valorTotalItem;

          const devItem = new FaturaDevolucaoItem();
          devItem.idFatura = idFatura;
          devItem.idComponente = item.idComponente;
          devItem.quantidade = item.quantidade;
          devItem.valorUnitario = valorUnitario;
          devItem.idPaciente = item.idPaciente || null;
          devItem.nomePaciente = item.nomePaciente || null;

          await devItemRepo.save(devItem);
        }
      }

      // 3. Atualizar descontoDevolucao
      fatura.descontoDevolucao = totalDescontoDevolucao;
      await faturaRepo.save(fatura);

      // 4. Recalcular fatura
      await this.recalcularFaturaComManager(manager, idFatura);

      return this.buscarFaturaPorIdComManager(manager, idFatura);
    });
  }

  async atualizarPeriodoFatura(
    idFatura: number,
    dto: AtualizarPeriodoFaturaDto,
  ): Promise<Fatura> {
    return this.dataSource.transaction(async manager => {
      const faturaRepo = manager.getRepository(Fatura);
      const lancamentoRepo = manager.getRepository(Lancamento);
      const parcelaRepo = manager.getRepository(Parcela);

      const fatura = await faturaRepo.findOne({
        where: { idFatura },
      });

      if (!fatura) {
        throw new NotFoundException(`Fatura com ID ${idFatura} não encontrada.`);
      }

      const novaDataInicio = new Date(`${dto.dataInicio}T00:00:00`);
      const novaDataFim = new Date(`${dto.dataFim}T00:00:00`);
      const novaDataVencimento = new Date(`${dto.dataVencimento}T00:00:00`);

      if (novaDataFim < novaDataInicio) {
        throw new BadRequestException('A data final não pode ser anterior à data inicial.');
      }

      fatura.dataInicio = novaDataInicio;
      fatura.dataFim = novaDataFim;
      fatura.dataVencimento = novaDataVencimento;

      if (dto.motivo) {
        const timestamp = new Date().toLocaleString('pt-BR');
        fatura.anotacoes = fatura.anotacoes
          ? `${fatura.anotacoes}\n[${timestamp}] Período alterado: ${dto.motivo}`
          : `[${timestamp}] Período alterado: ${dto.motivo}`;
      }

      await faturaRepo.save(fatura);

      // Atualiza lançamentos vinculados a esta fatura para a nova competência
      const lancamentos = await lancamentoRepo.find({
        where: { idFatura },
        relations: ['parcelas'],
      });

      for (const lancamento of lancamentos) {
        lancamento.dataCompetencia = novaDataInicio;
        await lancamentoRepo.save(lancamento);

        if (lancamento.parcelas) {
          for (const parcela of lancamento.parcelas) {
            if (parcela.status !== StatusParcela.PAGO) {
              parcela.dataVencimento = novaDataVencimento;
              await parcelaRepo.save(parcela);
            }
          }
        }
      }

      this.logger.log(
        `Período da fatura #${idFatura} atualizado para ${dto.dataInicio} até ${dto.dataFim} (Venc: ${dto.dataVencimento})`
      );

      return this.buscarFaturaPorIdComManager(manager, idFatura);
    });
  }

  async listarFaturasPorEmpresa(idEmpresa: number): Promise<Fatura[]> {
    return this.faturaRepository.find({
      where: { idEmpresa },
      relations: ['empresa', 'ordensDeServico'],
      order: { dataInicio: 'DESC', idFatura: 'DESC' },
    });
  }

  /**
   * Obtém fatura aberta existente para o mês/ano ou cria uma nova fatura (ou complementar) no mesmo mês.
   * Garante que os trabalhos permaneçam na competência real da conclusão.
   */
  async obterOuCriarFaturaParaMesAno(
    manager: EntityManager,
    idEmpresa: number,
    ano: number,
    mes: number, // 1 a 12
  ): Promise<Fatura> {
    const faturaRepo = manager.getRepository(Fatura);

    const ultimoDia = new Date(ano, mes, 0).getDate();
    const dataInicioStr = `${ano}-${String(mes).padStart(2, '0')}-01`;
    const dataFimStr = `${ano}-${String(mes).padStart(2, '0')}-${String(ultimoDia).padStart(2, '0')}`;
    const dataInicioNormalizada = parseDataParaDataLocal(dataInicioStr);
    const dataFimNormalizada = parseDataParaDataLocal(dataFimStr);
    const dataVencimento = new Date(ano, mes, 20); // Vencimento padrão: dia 20 do mês seguinte

    // Busca faturas existentes para esta empresa cuja competência seja o mês/ano informado
    const qb = faturaRepo.createQueryBuilder('fatura')
      .where('fatura.idEmpresa = :idEmpresa', { idEmpresa })
      .andWhere('fatura.status != :cancelada', { cancelada: StatusFatura.CANCELADA })
      .andWhere('EXTRACT(YEAR FROM fatura.dataInicio) = :ano', { ano })
      .andWhere('EXTRACT(MONTH FROM fatura.dataInicio) = :mes', { mes })
      .orderBy('fatura.idFatura', 'DESC');

    const faturas = await qb.getMany();

    const faturaAberta = faturas.find(
      (f) => f.status === StatusFatura.ABERTA || f.status === StatusFatura.AGUARDANDO_DEVOLUCAO,
    );

    if (faturaAberta) {
      return faturaAberta;
    }

    const novaFatura = faturaRepo.create({
      idEmpresa,
      dataInicio: dataInicioNormalizada,
      dataFim: dataFimNormalizada,
      dataVencimento,
      valorTotalBruto: 0,
      desconto: 0,
      valorTotal: 0,
      status: StatusFatura.ABERTA,
      descricao: faturas.length > 0 ? 'Fatura Complementar' : undefined,
    });

    return faturaRepo.save(novaFatura);
  }

  /**
   * Reorganiza Ordens de Serviço / Trabalhos nas faturas correspondentes ao mês real de conclusão.
   * Realiza auditoria e saneamento completo:
   * - Elimina faturas fantasmas abertas com 0 OSs e sem pagamentos.
   * - Consolida faturas abertas duplicadas no mesmo mês para a mesma clínica em uma única fatura canônica.
   * - Move OSs cujo trabalho foi concluído em mês diferente da fatura para a fatura do mês correto.
   * - Recalcula todas as faturas abertas diretamente dos itens das OSs.
   * - Sincroniza lançamentos financeiros e remove lançamentos de faturas canceladas.
   */
  async organizarFaturasNoMesCorreto(idEmpresa?: number): Promise<{
    faturasAjustadas: number;
    ordensMovidas: number;
    faturasVaziasRemovidas: number;
    faturasDuplicadasConsolidadas: number;
    detalhes: string[];
  }> {
    return this.dataSource.transaction(async (manager) => {
      const faturaRepo = manager.getRepository(Fatura);
      const osRepo = manager.getRepository(OrdemServico);
      const lancamentoRepo = manager.getRepository(Lancamento);
      const parcelaRepo = manager.getRepository(Parcela);

      const detalhes: string[] = [];
      let ordensMovidas = 0;
      let faturasVaziasRemovidas = 0;
      let faturasDuplicadasConsolidadas = 0;
      const faturasParaRecalcular = new Set<number>();

      // 1. Busca todas as faturas não canceladas
      const faturasQuery = faturaRepo
        .createQueryBuilder('fatura')
        .leftJoinAndSelect('fatura.ordensDeServico', 'os')
        .leftJoinAndSelect('os.trabalho', 'trabalho')
        .where('fatura.status != :statusCancelada', { statusCancelada: StatusFatura.CANCELADA });

      if (idEmpresa) {
        faturasQuery.andWhere('fatura.idEmpresa = :idEmpresa', { idEmpresa });
      }

      const todasFaturas = await faturasQuery.getMany();

      // 2. DETECÇÃO E CONSOLIDAÇÃO DE DUPLICATAS ABERTAS NO MESMO MÊS/EMPRESA
      const abertasPorEmpresaMes = new Map<string, Fatura[]>();
      for (const fat of todasFaturas) {
        if (fat.status === StatusFatura.ABERTA || fat.status === StatusFatura.AGUARDANDO_DEVOLUCAO) {
          const info = extrairAnoMesDia(fat.dataInicio);
          if (!info) continue;
          const key = `${fat.idEmpresa}_${info.ano}_${info.mes}`;
          if (!abertasPorEmpresaMes.has(key)) {
            abertasPorEmpresaMes.set(key, []);
          }
          abertasPorEmpresaMes.get(key)!.push(fat);
        }
      }

      for (const [, faturasGrupo] of abertasPorEmpresaMes.entries()) {
        if (faturasGrupo.length > 1) {
          // Ordena: prioriza a fatura que tiver mais OSs; desempate pelo maior ID
          faturasGrupo.sort((a, b) => {
            const countA = a.ordensDeServico?.length || 0;
            const countB = b.ordensDeServico?.length || 0;
            if (countB !== countA) return countB - countA;
            return b.idFatura - a.idFatura;
          });

          const faturaCanonica = faturasGrupo[0];
          const duplicatas = faturasGrupo.slice(1);

          for (const dup of duplicatas) {
            // Se a duplicata tinha OSs, move todas para a fatura canônica
            if (dup.ordensDeServico && dup.ordensDeServico.length > 0) {
              const idsOS = dup.ordensDeServico.map((os) => os.idOrdemServico);
              await osRepo.update(idsOS, { fatura: faturaCanonica });
              detalhes.push(
                `${idsOS.length} OS(s) da Fatura duplicada #${dup.idFatura} foram migradas para a Fatura canônica #${faturaCanonica.idFatura}.`,
              );
            }

            // Remove lançamentos e parcelas vinculadas à fatura duplicada
            const lancamentosDup = await lancamentoRepo.find({ where: { idFatura: dup.idFatura } });
            for (const lanc of lancamentosDup) {
              await parcelaRepo.delete({ idLancamento: lanc.idLancamento });
              await lancamentoRepo.delete(lanc.idLancamento);
            }

            try {
              await faturaRepo.delete(dup.idFatura);
            } catch {
              dup.status = StatusFatura.CANCELADA;
              dup.valorTotal = 0;
              dup.valorTotalBruto = 0;
              dup.desconto = 0;
              await faturaRepo.save(dup);
            }

            faturasDuplicadasConsolidadas++;
            detalhes.push(`Fatura duplicada fantasma #${dup.idFatura} removida/cancelada.`);
          }

          faturasParaRecalcular.add(faturaCanonica.idFatura);
        }
      }

      // 3. LIMPEZA DE QUALQUER FATURA ABERTA VAZIA (0 OSs e sem pagamentos)
      const faturasAbertasAtuais = await faturaRepo.find({
        where: { status: StatusFatura.ABERTA },
        relations: ['ordensDeServico'],
      });

      for (const fat of faturasAbertasAtuais) {
        const totalOs = fat.ordensDeServico ? fat.ordensDeServico.length : 0;
        const vPago = Number(fat.valorPago || 0);

        if (totalOs === 0 && vPago === 0) {
          const lancamentos = await lancamentoRepo.find({ where: { idFatura: fat.idFatura } });
          for (const lanc of lancamentos) {
            await parcelaRepo.delete({ idLancamento: lanc.idLancamento });
            await lancamentoRepo.delete(lanc.idLancamento);
          }

          try {
            await faturaRepo.delete(fat.idFatura);
          } catch {
            fat.status = StatusFatura.CANCELADA;
            fat.valorTotal = 0;
            fat.valorTotalBruto = 0;
            fat.desconto = 0;
            await faturaRepo.save(fat);
          }
          faturasVaziasRemovidas++;
          detalhes.push(`Fatura vazia sem trabalhos #${fat.idFatura} removida/cancelada.`);
        }
      }

      // 4. MOVIMENTAÇÃO DE OSs PARA O MÊS REAL DE CONCLUSÃO (apenas faturas abertas; faturas pagas/fechadas são intocáveis)
      const faturasRestantes = await faturaRepo
        .createQueryBuilder('fatura')
        .leftJoinAndSelect('fatura.ordensDeServico', 'os')
        .leftJoinAndSelect('os.trabalho', 'trabalho')
        .where('fatura.status IN (:...statusAbertos)', {
          statusAbertos: [StatusFatura.ABERTA, StatusFatura.AGUARDANDO_DEVOLUCAO],
        })
        .getMany();

      for (const fatura of faturasRestantes) {
        const fatInfo = extrairAnoMesDia(fatura.dataInicio);
        if (!fatInfo) continue;

        const fatAno = fatInfo.ano;
        const fatMes = fatInfo.mes;

        for (const os of fatura.ordensDeServico || []) {
          const dataRef =
            os.dataConcluido ||
            os.trabalho?.dataConclusao ||
            os.trabalho?.dataHoraEnvio ||
            (os as any).dataInclusao;
          if (!dataRef) continue;

          const osInfo = extrairAnoMesDia(dataRef);
          if (!osInfo) continue;

          const osAno = osInfo.ano;
          const osMes = osInfo.mes;

          if (osAno !== fatAno || osMes !== fatMes) {
            const faturaCorreta = await this.obterOuCriarFaturaParaMesAno(
              manager,
              fatura.idEmpresa,
              osAno,
              osMes,
            );

            if (faturaCorreta.idFatura !== fatura.idFatura) {
              await osRepo.update(os.idOrdemServico, { fatura: faturaCorreta });
              ordensMovidas++;
              faturasParaRecalcular.add(fatura.idFatura);
              faturasParaRecalcular.add(faturaCorreta.idFatura);

              detalhes.push(
                `OS #${os.idOrdemServico} (Trabalho #${os.idTrabalho}, concluído em ${osInfo.ymd}) movida da Fatura #${fatura.idFatura} (${fatMes}/${fatAno}) para Fatura #${faturaCorreta.idFatura} (${osMes}/${osAno}).`,
              );
            }
          }
        }
      }

      // 5. RECÁLCULO DE TODAS AS FATURAS ABERTAS AFETADAS
      const todasAbertas = await faturaRepo.find({
        where: { status: StatusFatura.ABERTA },
      });
      for (const fat of todasAbertas) {
        faturasParaRecalcular.add(fat.idFatura);
      }

      for (const idFat of faturasParaRecalcular) {
        const faturaExistente = await faturaRepo.findOneBy({ idFatura: idFat });
        if (faturaExistente && faturaExistente.status !== StatusFatura.CANCELADA) {
          await this.recalcularFaturaComManager(manager, idFat);
        }
      }

      // 6. SEGUNDA PASSAGEM: SE ALGUMA FATURA FICOU VAZIA APÓS MOVIMENTAÇÃO DE OSs
      for (const idFat of faturasParaRecalcular) {
        const fatCheck = await faturaRepo.findOne({
          where: { idFatura: idFat },
          relations: ['ordensDeServico'],
        });
        if (
          fatCheck &&
          fatCheck.status === StatusFatura.ABERTA &&
          (!fatCheck.ordensDeServico || fatCheck.ordensDeServico.length === 0) &&
          Number(fatCheck.valorPago || 0) === 0
        ) {
          const lancamentos = await lancamentoRepo.find({ where: { idFatura: idFat } });
          for (const lanc of lancamentos) {
            await parcelaRepo.delete({ idLancamento: lanc.idLancamento });
            await lancamentoRepo.delete(lanc.idLancamento);
          }
          try {
            await faturaRepo.delete(idFat);
          } catch {
            fatCheck.status = StatusFatura.CANCELADA;
            fatCheck.valorTotal = 0;
            fatCheck.valorTotalBruto = 0;
            await faturaRepo.save(fatCheck);
          }
          faturasVaziasRemovidas++;
          detalhes.push(`Fatura residual vazia #${idFat} removida/cancelada.`);
        }
      }

      // 7. SINCRONIZAÇÃO DE LANÇAMENTOS FINANCEIROS
      const lancamentosFatura = await lancamentoRepo.find({
        where: { idFatura: Not(IsNull()) },
      });
      for (const lanc of lancamentosFatura) {
        const faturaAtual = await faturaRepo.findOneBy({ idFatura: lanc.idFatura });
        if (!faturaAtual || faturaAtual.status === StatusFatura.CANCELADA) {
          await parcelaRepo.delete({ idLancamento: lanc.idLancamento });
          await lancamentoRepo.delete(lanc.idLancamento);
          detalhes.push(`Lançamento órfão #${lanc.idLancamento} removido.`);
          continue;
        }

        const compInfo = extrairAnoMesDia(faturaAtual.dataInicio);
        const lancInfo = extrairAnoMesDia(lanc.dataCompetencia);
        let precisaSalvar = false;

        if (compInfo && (!lancInfo || compInfo.ymd !== lancInfo.ymd)) {
          lanc.dataCompetencia = parseDataParaDataLocal(compInfo.ymd);
          precisaSalvar = true;
        }

        if (Number(lanc.valorTotal) !== Number(faturaAtual.valorTotal)) {
          lanc.valorTotal = Number(faturaAtual.valorTotal);
          precisaSalvar = true;

          const parcelas = await parcelaRepo.find({ where: { idLancamento: lanc.idLancamento } });
          if (parcelas.length === 1 && parcelas[0].status !== StatusParcela.PAGO) {
            parcelas[0].valor = Number(faturaAtual.valorTotal);
            await parcelaRepo.save(parcelas[0]);
          }
        }

        if (precisaSalvar) {
          await lancamentoRepo.save(lanc);
          detalhes.push(
            `Lançamento #${lanc.idLancamento} (Fatura #${faturaAtual.idFatura}) sincronizado para R$ ${faturaAtual.valorTotal} (competência ${compInfo?.ymd}).`,
          );
        }
      }

      this.logger.log(
        `Auditoria concluída: ${faturasDuplicadasConsolidadas} duplicadas consolidadas, ${faturasVaziasRemovidas} vazias removidas, ${ordensMovidas} OSs movidas, ${faturasParaRecalcular.size} faturas recalculadas.`,
      );

      return {
        faturasAjustadas: faturasParaRecalcular.size,
        ordensMovidas,
        faturasVaziasRemovidas,
        faturasDuplicadasConsolidadas,
        detalhes,
      };
    });
  }
}

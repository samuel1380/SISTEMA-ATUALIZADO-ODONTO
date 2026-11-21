import { Injectable, Logger, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, MoreThan, Not, Repository } from 'typeorm';
import { Estoque } from '../domain/estoque.entity';
import { Transferencia } from '../../transferencia/domain/transferencia.entity';
import { EstoqueHistoricoConsumo } from '../domain/estoque-historico-consumo.entity';
import { OnEvent } from '@nestjs/event-emitter';
import { TrabalhoCriadoEvent } from '../domain/events/trabalho-criado.events';
import { Almoxarifado } from '../../almoxarifado/domain/almoxarifado.entity';
import { Componente } from '../../../componente/domain/componente.entity';
import { CreateEstoqueDto } from '../domain/dto/create-estoque.dto';
import { UpdateEstoqueDto } from '../domain/dto/update-estoque.dto';


const ID_COMPONENTE_PARAFUSO = 0;

interface CreditarEstoqueDevolucaoPayload {
  idComponente: number;
  idEmpresa: number;
  quantidade: number;
  motivo: string;
  currentUser: any;
}

@Injectable()
export class EstoqueService {
  constructor(
    @InjectRepository(Estoque)
    private readonly estoqueRepository: Repository<Estoque>,
    @InjectRepository(Almoxarifado)
    private readonly almoxarifadoRepository: Repository<Almoxarifado>,
    @InjectRepository(EstoqueHistoricoConsumo)
    private readonly historicoConsumoRepository: Repository<EstoqueHistoricoConsumo>,
    private readonly dataSource: DataSource,
    private readonly logger: Logger = new Logger(EstoqueService.name),
  ) {}

  async create(currentUser: any, createEstoqueDto: CreateEstoqueDto): Promise<Estoque> {
    const usuarioNome = currentUser.user.nome;
    const idUsuario = currentUser.user.idUsuario;

    const almoxarifado = await this.almoxarifadoRepository.findOne({ where: { idAlmoxarifado: createEstoqueDto.idAlmoxarifado } });
    createEstoqueDto.idEmpresa = almoxarifado.idEmpresa;

    return this.dataSource.transaction(async (manager) => {
      const estoqueRepo = manager.getRepository(Estoque);
      const transferenciaRepo = manager.getRepository(Transferencia);
      const historicoConsumoRepo = manager.getRepository(EstoqueHistoricoConsumo);
      const componenteRepo = manager.getRepository(Componente);

      const { idAlmoxarifado, idComponente, quantidade: quantidadeEntrada, nome, descricao, quantidadeParafusos } = createEstoqueDto;

      const componenteResult = await componenteRepo.findOne({ where: { idComponente } });

      const transferenciasPendentes = await transferenciaRepo.find({
        where: {
          idAlmoxarifadoDestino: idAlmoxarifado,
          idComponente: idComponente,
          baixado: false,
        },
        order: {
          dataTransferencia: 'ASC',
        },
      });

      let quantidadeRestante = quantidadeEntrada;
      let quantidadeQuitada = 0;

      if (transferenciasPendentes.length > 0) {
        let saldoParaQuitar = quantidadeEntrada;
        for (const transferencia of transferenciasPendentes) {
          if (saldoParaQuitar <= 0) break;

          if (saldoParaQuitar >= transferencia.quantidade) {
            saldoParaQuitar -= transferencia.quantidade;
            quantidadeQuitada += transferencia.quantidade;
            transferencia.baixado = true;
            await transferenciaRepo.save(transferencia);
          } else {
            transferencia.quantidade -= saldoParaQuitar;
            quantidadeQuitada += saldoParaQuitar;
            saldoParaQuitar = 0;
            await transferenciaRepo.save(transferencia);
          }
        }
        quantidadeRestante = saldoParaQuitar;
      }

      if (quantidadeRestante > 0) {
        let estoque = await estoqueRepo.findOne({
          where: { idAlmoxarifado, idComponente },
        });

        if (estoque) {
          estoque.quantidade += quantidadeRestante;
        } else {
          estoque = estoqueRepo.create({
            ...createEstoqueDto,
            quantidade: quantidadeRestante,
          });
        }

        const estoqueResult = await estoqueRepo.save(estoque);

        if (quantidadeQuitada >= 0) {
          const historicoConsumoQuitado = {
            idEstoque: estoqueResult.idEstoque,
            quantidadeConsumida: quantidadeQuitada,
            motivo: `Saldo quitado de emprestimo através do usuário ${usuarioNome} (${idUsuario}) para o produto ${estoque.nome} com a quantidade de ${quantidadeQuitada}`,
          };
          await historicoConsumoRepo.save(historicoConsumoQuitado);
        }

        const historicoConsumo = {
          idEstoque: estoqueResult.idEstoque,
          quantidadeConsumida: estoque.quantidade,
          motivo: `Crédito manual através do usuário ${usuarioNome} (${idUsuario}) para o produto ${estoque.nome} com a quantidade de ${estoque.quantidade}`,
        };
        await historicoConsumoRepo.save(historicoConsumo);

        if (quantidadeParafusos !== undefined && quantidadeParafusos !== null && componenteResult.hasParafuso) {
          const diferenca = quantidadeParafusos - quantidadeEntrada;
          if (diferenca !== 0) {
            let estoqueParafuso = await estoqueRepo.findOne({
              where: { idAlmoxarifado, idComponente: ID_COMPONENTE_PARAFUSO },
            });

            if (!estoqueParafuso) {
              estoqueParafuso = estoqueRepo.create({
                nome: 'Parafuso',
                descricao: `Estoque de parafusos para o almoxarifado ${almoxarifado.nome}`,
                quantidade: 0,
                idComponente: ID_COMPONENTE_PARAFUSO,
                idAlmoxarifado: idAlmoxarifado,
                idEmpresa: createEstoqueDto.idEmpresa,
              });
            }

            if (diferenca > 0) {
              estoqueParafuso.quantidade += diferenca;
              const parafusoResult = await estoqueRepo.save(estoqueParafuso);
              const motivoAjuste = `Crédito de ${diferenca} parafusos excedentes na entrada do componente ${nome}.`;
              const historicoAjusteParafuso = historicoConsumoRepo.create({
                idEstoque: parafusoResult.idEstoque,
                quantidadeConsumida: diferenca * -1, // Negativo para crédito
                motivo: `${motivoAjuste} (Operação por ${usuarioNome} - ID: ${idUsuario})`,
              });
              await historicoConsumoRepo.save(historicoAjusteParafuso);
            } else {
              const quantidadeDebito = Math.abs(diferenca);
              const parafusoResult = await estoqueRepo.save(estoqueParafuso);
              await transferenciaRepo.save({
                idAlmoxarifadoDestino: idAlmoxarifado,
                idComponente: ID_COMPONENTE_PARAFUSO,
                quantidade: quantidadeDebito,
                baixado: false,
              });
              const motivoAjuste = `Débito de ${quantidadeDebito} parafusos faltantes na entrada do componente ${nome} gerou uma pendência de transferência.`;
              const historicoAjusteParafuso = historicoConsumoRepo.create({
                idEstoque: parafusoResult.idEstoque,
                quantidadeConsumida: 0,
                motivo: `${motivoAjuste} (Operação por ${usuarioNome} - ID: ${idUsuario})`,
              });
              await historicoConsumoRepo.save(historicoAjusteParafuso);
            }
          }
        }
        return estoqueResult;
      }
      return null;
    });
  }

  findAll(): Promise<Estoque[]> {
    return this.estoqueRepository.find({ relations: ['empresa', 'componente', 'almoxarifado'] });
  }

  async findOne(id: number): Promise<Estoque> {
    const estoque = await this.estoqueRepository.findOne({
      where: { idEstoque: id },
      relations: ['empresa', 'componente', 'almoxarifado'],
    });
    if (!estoque) {
      throw new NotFoundException(`Estoque item with ID "${id}" not found`);
    }
    return estoque;
  }

  async update(id: number, updateEstoqueDto: UpdateEstoqueDto): Promise<Estoque> {
    return this.dataSource.transaction(async (manager) => {
      const estoqueRepo = manager.getRepository(Estoque);
      const historicoRepo = manager.getRepository(EstoqueHistoricoConsumo);

      const estoque = await estoqueRepo.findOneBy({ idEstoque: id });
      if (!estoque) {
        throw new NotFoundException(`Item de estoque com ID "${id}" não encontrado.`);
      }

      const quantidadeAnterior = estoque.quantidade;
      const { quantidade: quantidadeNova, ...dadosUpdate } = updateEstoqueDto;

      if (quantidadeNova < quantidadeAnterior) {
        const quantidadeConsumida = quantidadeAnterior - quantidadeNova;
        const novoHistorico = historicoRepo.create({
          idEstoque: id,
          quantidadeConsumida: quantidadeConsumida,
          motivo: 'Consumo manual',
        });
        await historicoRepo.save(novoHistorico);
      }

      estoque.quantidade = quantidadeNova;
      Object.assign(estoque, dadosUpdate);

      const estoqueAtualizado = await estoqueRepo.save(estoque);
      return estoqueAtualizado;
    });
  }

  async hasGlobalStockForComponent(idsComponente: number[]): Promise<boolean> {
    const count = await this.estoqueRepository.count({
      where: {
        idComponente: In(idsComponente),
        quantidade: MoreThan(0),
      },
    });
    console.log("hasGlobalStockForComponent idsComponente: [", idsComponente, "] count: ", count);
    if (count === 0) {
      return false;
    }
    return true;
  }

  async remove(id: number): Promise<void> {
    const result = await this.estoqueRepository.softDelete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Estoque item with ID "${id}" not found`);
    }
  }

  findByEmpresa(idEmpresa: number): Promise<Estoque[]> {
    return this.estoqueRepository.find({
      where: { idEmpresa },
      relations: ['empresa', 'componente', 'almoxarifado'],
    });
  }

  async findByAlmoxarifado(idAlmoxarifado: number): Promise<any[]> {
    const query = this.estoqueRepository
      .createQueryBuilder('estoque')
      .select('SUM(estoque.quantidade)', 'quantidade')
      .addSelect('componente.idComponente', 'idComponente')
      .addSelect('componente.nome', 'nomeComponente')
      .addSelect('almoxarifado.idAlmoxarifado', 'idAlmoxarifado')
      .addSelect('almoxarifado.nome', 'nomeAlmoxarifado')
      .addSelect('empresa.idEmpresa', 'idEmpresa')
      .addSelect('empresa.nome', 'nomeEmpresa')
      .innerJoin('estoque.componente', 'componente')
      .innerJoin('estoque.almoxarifado', 'almoxarifado')
      .innerJoin('estoque.empresa', 'empresa')
      .where('estoque.idAlmoxarifado = :idAlmoxarifado', { idAlmoxarifado })
      .groupBy('componente.idComponente, componente.nome, almoxarifado.idAlmoxarifado, almoxarifado.nome, empresa.idEmpresa, empresa.nome');

    const resultadosAgregados = await query.getRawMany();

    return resultadosAgregados.map((item) => ({
      quantidade: parseInt(item.quantidade, 10) || 0,
      nome: item.nomeComponente,
      componente: {
        idComponente: item.idComponente,
        nome: item.nomeComponente,
      },
      almoxarifado: {
        idAlmoxarifado: item.idAlmoxarifado,
        nome: item.nomeAlmoxarifado,
      },
      empresa: {
        idEmpresa: item.idEmpresa,
        nome: item.nomeEmpresa,
      },
    }));
  }

  findByAlmoxarifadoAndComponenteId(idAlmoxarifado: number, idComponente: number): Promise<Estoque[]> {
    return this.estoqueRepository.find({
      where: { idAlmoxarifado, idComponente: idComponente },
      relations: ['empresa', 'componente', 'almoxarifado'],
    });
  }

  findStockForComponent(idComponente: number, idEmpresa: number): Promise<Estoque[]> {
    return this.estoqueRepository.find({
      where: {
        idComponente,
        idEmpresa,
        quantidade: MoreThan(0),
      },
      order: {
        quantidade: 'DESC',
      },
    });
  }

  findStockForComponentAllAlmoxarifados(idComponente: number, idEmpresa: number): Promise<Estoque[]> {
    return this.estoqueRepository.find({
      where: {
        idComponente,
        quantidade: MoreThan(0),
        idEmpresa: Not(In([0, idEmpresa])),
      },
      order: {
        quantidade: 'DESC',
      },
    });
  }

  findConsumoHistory(idAlmoxarifado?: number): Promise<EstoqueHistoricoConsumo[]> {
    const whereClause: any = {};
    if (idAlmoxarifado) {
      whereClause.estoque = { idAlmoxarifado };
    }

    return this.historicoConsumoRepository.find({
      where: whereClause,
      relations: {
        estoque: {
          componente: true,
          almoxarifado: true,
        },
      },
      order: {
        dataConsumo: 'DESC',
      },
    });
  }

  @OnEvent('trabalho.criado', { async: true })
  async handleTrabalhoCriadoEvent(payload: TrabalhoCriadoEvent): Promise<void> {
    this.logger.log(`Recebido evento 'trabalho.criado'. Consumindo ${payload.quantidadeConsumida} do produto ${payload.idComponente} no almoxarifado ${payload.idEmpresa}.`);

    return this.dataSource.transaction(async (manager) => {
      const estoqueRepo = manager.getRepository(Estoque);
      const historicoRepo = manager.getRepository(EstoqueHistoricoConsumo);
      const { idComponente, idEmpresa, quantidadeConsumida, idTrabalho } = payload;

      const estoque = await estoqueRepo.findOne({
        where: { idComponente, idEmpresa },
        lock: { mode: 'pessimistic_write' },
      });

      if (!estoque) {
        this.logger.error(`Estoque não encontrado para o componente ${idComponente} no almoxarifado ${idEmpresa}.`);
      }

      if (estoque.quantidade < quantidadeConsumida) {
        this.logger.error(`Estoque insuficiente para o componente ${idComponente}. Necessário: ${quantidadeConsumida}, Disponível: ${estoque.quantidade}.`);
        throw new UnprocessableEntityException(`Estoque insuficiente para o componente ${idComponente}.`);
      }

      estoque.quantidade -= quantidadeConsumida;
      await estoqueRepo.save(estoque);

      const novoHistorico = historicoRepo.create({
        idEstoque: estoque.idEstoque,
        quantidadeConsumida: quantidadeConsumida * -1,
        motivo: `Consumo automático para trabalho ID: ${idTrabalho || 'N/A'} de ${estoque.nome} na quantidade de ${quantidadeConsumida}`,
      });
      await historicoRepo.save(novoHistorico);

      this.logger.log(`Estoque do componente ${idComponente} (ID: ${estoque.idEstoque}) atualizado com sucesso.`);
    });
  }

  async creditarEstoqueDevolucao(payload: CreditarEstoqueDevolucaoPayload): Promise<Estoque> {
    this.logger.log(`Recebido evento de devolução. Creditando ${payload.quantidade} do componente ${payload.idComponente} para a empresa ${payload.idEmpresa}.`);
    return this.dataSource.transaction(async (manager) => {
        const estoqueRepo = manager.getRepository(Estoque);
        const historicoRepo = manager.getRepository(EstoqueHistoricoConsumo);
        const almoxarifadoRepo = manager.getRepository(Almoxarifado);
        const componenteRepo = manager.getRepository(Componente);

        const { idComponente, idEmpresa, quantidade, motivo, currentUser } = payload;

        const almoxarifado = await almoxarifadoRepo.findOne({ where: { idEmpresa: idEmpresa } });
        if (!almoxarifado) {
            throw new NotFoundException(`Almoxarifado para a empresa ID ${idEmpresa} não encontrado.`);
        }

        let estoque = await estoqueRepo.findOne({
            where: { idComponente, idAlmoxarifado: almoxarifado.idAlmoxarifado },
            lock: { mode: 'pessimistic_write' },
        });

        if (!estoque) {
            // Buscar informações do componente para criar o estoque
            const componente = await componenteRepo.findOne({ where: { idComponente } });
            if (!componente) {
                throw new NotFoundException(`Componente com ID ${idComponente} não encontrado.`);
            }

            // Criar estoque com quantidade 0
            this.logger.log(`Estoque não encontrado para o componente ${idComponente}. Criando novo estoque com quantidade 0.`);
            estoque = estoqueRepo.create({
                nome: componente.nome,
                descricao: `Estoque criado automaticamente para devolução de componente ${componente.nome}`,
                quantidade: 0,
                idComponente: idComponente,
                idAlmoxarifado: almoxarifado.idAlmoxarifado,
                idEmpresa: idEmpresa,
            });
            estoque = await estoqueRepo.save(estoque);
            this.logger.log(`Estoque criado com sucesso para o componente ${idComponente} (ID: ${estoque.idEstoque}).`);
        }

        estoque.quantidade += quantidade;
        await estoqueRepo.save(estoque);

        const novoHistorico = historicoRepo.create({
            idEstoque: estoque.idEstoque,
            quantidadeConsumida: quantidade * -1, // Crédito é um consumo negativo
            motivo: `${motivo} (Operação por ${currentUser.user.nome} - ID: ${currentUser.user.idUsuario})`,
        });
        await historicoRepo.save(novoHistorico);

        this.logger.log(`Estoque do componente ${idComponente} (ID: ${estoque.idEstoque}) creditado com sucesso devido à devolução.`);
        return estoque;
    });
  }
}

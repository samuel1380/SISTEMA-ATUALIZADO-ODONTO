"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var EstoqueService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EstoqueService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const estoque_entity_1 = require("../domain/estoque.entity");
const transferencia_entity_1 = require("../../transferencia/domain/transferencia.entity");
const estoque_historico_consumo_entity_1 = require("../domain/estoque-historico-consumo.entity");
const event_emitter_1 = require("@nestjs/event-emitter");
const trabalho_criado_events_1 = require("../domain/events/trabalho-criado.events");
const almoxarifado_entity_1 = require("../../almoxarifado/domain/almoxarifado.entity");
const componente_entity_1 = require("../../../componente/domain/componente.entity");
const ID_COMPONENTE_PARAFUSO = 0;
let EstoqueService = EstoqueService_1 = class EstoqueService {
    constructor(estoqueRepository, almoxarifadoRepository, historicoConsumoRepository, dataSource, logger = new common_1.Logger(EstoqueService_1.name)) {
        this.estoqueRepository = estoqueRepository;
        this.almoxarifadoRepository = almoxarifadoRepository;
        this.historicoConsumoRepository = historicoConsumoRepository;
        this.dataSource = dataSource;
        this.logger = logger;
    }
    async create(currentUser, createEstoqueDto) {
        const usuarioNome = currentUser.user.nome;
        const idUsuario = currentUser.user.idUsuario;
        const almoxarifado = await this.almoxarifadoRepository.findOne({ where: { idAlmoxarifado: createEstoqueDto.idAlmoxarifado } });
        createEstoqueDto.idEmpresa = almoxarifado.idEmpresa;
        return this.dataSource.transaction(async (manager) => {
            const estoqueRepo = manager.getRepository(estoque_entity_1.Estoque);
            const transferenciaRepo = manager.getRepository(transferencia_entity_1.Transferencia);
            const historicoConsumoRepo = manager.getRepository(estoque_historico_consumo_entity_1.EstoqueHistoricoConsumo);
            const componenteRepo = manager.getRepository(componente_entity_1.Componente);
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
                    if (saldoParaQuitar <= 0)
                        break;
                    if (saldoParaQuitar >= transferencia.quantidade) {
                        saldoParaQuitar -= transferencia.quantidade;
                        quantidadeQuitada += transferencia.quantidade;
                        transferencia.baixado = true;
                        await transferenciaRepo.save(transferencia);
                    }
                    else {
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
                }
                else {
                    estoque = estoqueRepo.create(Object.assign(Object.assign({}, createEstoqueDto), { quantidade: quantidadeRestante }));
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
                                quantidadeConsumida: diferenca * -1,
                                motivo: `${motivoAjuste} (Operação por ${usuarioNome} - ID: ${idUsuario})`,
                            });
                            await historicoConsumoRepo.save(historicoAjusteParafuso);
                        }
                        else {
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
    findAll() {
        return this.estoqueRepository.find({ relations: ['empresa', 'componente', 'almoxarifado'] });
    }
    async findOne(id) {
        const estoque = await this.estoqueRepository.findOne({
            where: { idEstoque: id },
            relations: ['empresa', 'componente', 'almoxarifado'],
        });
        if (!estoque) {
            throw new common_1.NotFoundException(`Estoque item with ID "${id}" not found`);
        }
        return estoque;
    }
    async update(id, updateEstoqueDto) {
        return this.dataSource.transaction(async (manager) => {
            const estoqueRepo = manager.getRepository(estoque_entity_1.Estoque);
            const historicoRepo = manager.getRepository(estoque_historico_consumo_entity_1.EstoqueHistoricoConsumo);
            const estoque = await estoqueRepo.findOneBy({ idEstoque: id });
            if (!estoque) {
                throw new common_1.NotFoundException(`Item de estoque com ID "${id}" não encontrado.`);
            }
            const quantidadeAnterior = estoque.quantidade;
            const { quantidade: quantidadeNova } = updateEstoqueDto, dadosUpdate = __rest(updateEstoqueDto, ["quantidade"]);
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
    async hasGlobalStockForComponent(idsComponente) {
        const count = await this.estoqueRepository.count({
            where: {
                idComponente: (0, typeorm_2.In)(idsComponente),
                quantidade: (0, typeorm_2.MoreThan)(0),
            },
        });
        console.log("hasGlobalStockForComponent idsComponente: [", idsComponente, "] count: ", count);
        if (count === 0) {
            return false;
        }
        return true;
    }
    async remove(id) {
        const result = await this.estoqueRepository.softDelete(id);
        if (result.affected === 0) {
            throw new common_1.NotFoundException(`Estoque item with ID "${id}" not found`);
        }
    }
    findByEmpresa(idEmpresa) {
        return this.estoqueRepository.find({
            where: { idEmpresa },
            relations: ['empresa', 'componente', 'almoxarifado'],
        });
    }
    async findByAlmoxarifado(idAlmoxarifado) {
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
    findByAlmoxarifadoAndComponenteId(idAlmoxarifado, idComponente) {
        return this.estoqueRepository.find({
            where: { idAlmoxarifado, idComponente: idComponente },
            relations: ['empresa', 'componente', 'almoxarifado'],
        });
    }
    findStockForComponent(idComponente, idEmpresa) {
        return this.estoqueRepository.find({
            where: {
                idComponente,
                idEmpresa,
                quantidade: (0, typeorm_2.MoreThan)(0),
            },
            order: {
                quantidade: 'DESC',
            },
        });
    }
    findStockForComponentAllAlmoxarifados(idComponente, idEmpresa) {
        return this.estoqueRepository.find({
            where: {
                idComponente,
                quantidade: (0, typeorm_2.MoreThan)(0),
                idEmpresa: (0, typeorm_2.Not)((0, typeorm_2.In)([0, idEmpresa])),
            },
            order: {
                quantidade: 'DESC',
            },
        });
    }
    findConsumoHistory(idAlmoxarifado) {
        const whereClause = {};
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
    async handleTrabalhoCriadoEvent(payload) {
        this.logger.log(`Recebido evento 'trabalho.criado'. Consumindo ${payload.quantidadeConsumida} do produto ${payload.idComponente} no almoxarifado ${payload.idEmpresa}.`);
        return this.dataSource.transaction(async (manager) => {
            const estoqueRepo = manager.getRepository(estoque_entity_1.Estoque);
            const historicoRepo = manager.getRepository(estoque_historico_consumo_entity_1.EstoqueHistoricoConsumo);
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
                throw new common_1.UnprocessableEntityException(`Estoque insuficiente para o componente ${idComponente}.`);
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
    async creditarEstoqueDevolucao(payload) {
        this.logger.log(`Recebido evento de devolução. Creditando ${payload.quantidade} do componente ${payload.idComponente} para a empresa ${payload.idEmpresa}.`);
        return this.dataSource.transaction(async (manager) => {
            const estoqueRepo = manager.getRepository(estoque_entity_1.Estoque);
            const historicoRepo = manager.getRepository(estoque_historico_consumo_entity_1.EstoqueHistoricoConsumo);
            const almoxarifadoRepo = manager.getRepository(almoxarifado_entity_1.Almoxarifado);
            const componenteRepo = manager.getRepository(componente_entity_1.Componente);
            const { idComponente, idEmpresa, quantidade, motivo, currentUser } = payload;
            const almoxarifado = await almoxarifadoRepo.findOne({ where: { idEmpresa: idEmpresa } });
            if (!almoxarifado) {
                throw new common_1.NotFoundException(`Almoxarifado para a empresa ID ${idEmpresa} não encontrado.`);
            }
            let estoque = await estoqueRepo.findOne({
                where: { idComponente, idAlmoxarifado: almoxarifado.idAlmoxarifado },
                lock: { mode: 'pessimistic_write' },
            });
            if (!estoque) {
                const componente = await componenteRepo.findOne({ where: { idComponente } });
                if (!componente) {
                    throw new common_1.NotFoundException(`Componente com ID ${idComponente} não encontrado.`);
                }
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
                quantidadeConsumida: quantidade * -1,
                motivo: `${motivo} (Operação por ${currentUser.user.nome} - ID: ${currentUser.user.idUsuario})`,
            });
            await historicoRepo.save(novoHistorico);
            this.logger.log(`Estoque do componente ${idComponente} (ID: ${estoque.idEstoque}) creditado com sucesso devido à devolução.`);
            return estoque;
        });
    }
};
exports.EstoqueService = EstoqueService;
__decorate([
    (0, event_emitter_1.OnEvent)('trabalho.criado', { async: true }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [trabalho_criado_events_1.TrabalhoCriadoEvent]),
    __metadata("design:returntype", Promise)
], EstoqueService.prototype, "handleTrabalhoCriadoEvent", null);
exports.EstoqueService = EstoqueService = EstoqueService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(estoque_entity_1.Estoque)),
    __param(1, (0, typeorm_1.InjectRepository)(almoxarifado_entity_1.Almoxarifado)),
    __param(2, (0, typeorm_1.InjectRepository)(estoque_historico_consumo_entity_1.EstoqueHistoricoConsumo)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource,
        common_1.Logger])
], EstoqueService);
//# sourceMappingURL=estoque.service.js.map
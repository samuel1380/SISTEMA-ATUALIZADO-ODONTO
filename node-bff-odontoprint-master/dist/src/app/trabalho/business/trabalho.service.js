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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var TrabalhoService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrabalhoService = void 0;
const common_1 = require("@nestjs/common");
const trabalho_entity_1 = require("../domain/trabalho.entity");
const trabalho_repository_1 = require("../repository/trabalho.repository");
const class_transformer_1 = require("class-transformer");
const componentesTrabalho_service_1 = require("./componentesTrabalho.service");
const historicoStatusTrabalho_service_1 = require("../../historicoStatusTrabalho/business/historicoStatusTrabalho.service");
const cadastroComplementarEmpresa_service_1 = require("../../cadastroComplementarEmpresa/business/cadastroComplementarEmpresa.service");
const tabelaPrecoProduto_service_1 = require("../../tabelaPrecoProduto/business/tabelaPrecoProduto.service");
const empresaTabelaPreco_service_1 = require("../../empresaTabelaPreco/business/empresaTabelaPreco.service");
const componentesTrabalho_entity_1 = require("../domain/componentesTrabalho.entity");
const elementosTrabalho_entity_1 = require("../domain/elementosTrabalho.entity");
const event_emitter_1 = require("@nestjs/event-emitter");
const estoque_service_1 = require("../../estoque/estoque/service/estoque.service");
const transferencia_service_1 = require("../../estoque/transferencia/service/transferencia.service");
const almoxarifado_service_1 = require("../../estoque/almoxarifado/service/almoxarifado.service");
const servicoTrabalho_entity_1 = require("../domain/servicoTrabalho.entity");
const ordemServico_service_1 = require("../../ordemServico/business/ordemServico.service");
const ordemServico_entity_1 = require("../../ordemServico/domain/ordemServico.entity");
const ordemServicoItem_entity_1 = require("../../ordemServico/domain/ordemServicoItem.entity");
const paciente_service_1 = require("../../paciente/business/paciente.service");
const fatura_service_1 = require("../../financeiro/business/fatura.service");
const devolucao_componente_service_1 = require("../../financeiro/business/devolucao-componente.service");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const trabalhoMotivo_entity_1 = require("../domain/trabalhoMotivo.entity");
const motivo_entity_1 = require("../../motivo/domain/motivo.entity");
const motivo_dto_1 = require("../../motivo/dto/motivo.dto");
let TrabalhoService = TrabalhoService_1 = class TrabalhoService {
    constructor(trabalhoRepository, componentesTrabalhoService, historicoStatusTrabalhoService, cadastroComplementarEmpresaService, tabelaPrecoProdutoService, empresaTabelaPrecoService, ordemServicoService, eventEmitter, estoqueService, logger = new common_1.Logger(TrabalhoService_1.name), transferenciaService, almoxarifadoService, pacienteService, faturaService, devolucaoComponenteService, osItemRepository, trabalhoMotivoRepository, motivoRepository) {
        this.trabalhoRepository = trabalhoRepository;
        this.componentesTrabalhoService = componentesTrabalhoService;
        this.historicoStatusTrabalhoService = historicoStatusTrabalhoService;
        this.cadastroComplementarEmpresaService = cadastroComplementarEmpresaService;
        this.tabelaPrecoProdutoService = tabelaPrecoProdutoService;
        this.empresaTabelaPrecoService = empresaTabelaPrecoService;
        this.ordemServicoService = ordemServicoService;
        this.eventEmitter = eventEmitter;
        this.estoqueService = estoqueService;
        this.logger = logger;
        this.transferenciaService = transferenciaService;
        this.almoxarifadoService = almoxarifadoService;
        this.pacienteService = pacienteService;
        this.faturaService = faturaService;
        this.devolucaoComponenteService = devolucaoComponenteService;
        this.osItemRepository = osItemRepository;
        this.trabalhoMotivoRepository = trabalhoMotivoRepository;
        this.motivoRepository = motivoRepository;
    }
    async emitirEventosTrabalhoEnviado() {
        const trabalhos = await this.trabalhoRepository.buscarTrabalhos([trabalho_entity_1.StatusTrabalho.ENVIADO, trabalho_entity_1.StatusTrabalho.ENVIADO_PROVA]);
        for (const trabalho of trabalhos) {
            this.logger.log(`Emitindo evento 'trabalho.criado' para o trabalho ID: ${trabalho.idTrabalho}`);
            await this.atualizaEstoque(trabalho.idTrabalho);
        }
    }
    async cadastrarTrabalho(currentUser, idEmpresa, nomeEmpresa, trabalhoCadastroDto) {
        const { servicos: servicosDto, componentes: componentesDto, idPaciente, motivosRetrabalhoIds, motivosBonificacaoIds } = trabalhoCadastroDto, dadosTrabalhoDto = __rest(trabalhoCadastroDto, ["servicos", "componentes", "idPaciente", "motivosRetrabalhoIds", "motivosBonificacaoIds"]);
        const trabalho = (0, class_transformer_1.plainToClass)(trabalho_entity_1.Trabalho, dadosTrabalhoDto);
        trabalho.idEmpresa = idEmpresa;
        trabalho.nomeEmpresa = nomeEmpresa;
        trabalho.ativo = true;
        trabalho.anotacoes = trabalhoCadastroDto.anotacoes;
        const paciente = await this.pacienteService.findOne(idPaciente, idEmpresa);
        trabalho.idPaciente = paciente.idPaciente;
        trabalho.nomePaciente = paciente.nome;
        trabalho.idUsuarioCadastro = currentUser.user.idUsuario;
        const cadastroComplementar = await this.cadastroComplementarEmpresaService.buscarCadastroComplementarEmpresa(idEmpresa);
        if (cadastroComplementar === null || cadastroComplementar === void 0 ? void 0 : cadastroComplementar.idTabelaPrecoProduto) {
            const dataInclusao = new Date();
            const tabelaPrecoVigente = await this.tabelaPrecoProdutoService.buscarTabelaPrecoVigentePorMatriz(cadastroComplementar.idTabelaPrecoProduto, dataInclusao);
            if (tabelaPrecoVigente) {
                trabalho.idTabelaPrecoProduto = tabelaPrecoVigente.idTabelaPrecoProduto;
                this.logger.log(`[Trabalho] Tabela de preço selecionada: ID ${tabelaPrecoVigente.idTabelaPrecoProduto}, Nome: "${tabelaPrecoVigente.nome}", Matriz: ${cadastroComplementar.idTabelaPrecoProduto}, Data: ${dataInclusao.toISOString()}`);
            }
            else {
                const tabelaMatriz = await this.tabelaPrecoProdutoService.buscaTabelaPrecoProdutosPorId(cadastroComplementar.idTabelaPrecoProduto);
                if (tabelaMatriz && tabelaMatriz.ativo === 1) {
                    trabalho.idTabelaPrecoProduto = tabelaMatriz.idTabelaPrecoProduto;
                    this.logger.warn(`[Trabalho] Nenhuma versão vigente encontrada para a matriz ${cadastroComplementar.idTabelaPrecoProduto}, usando a matriz diretamente: ID ${tabelaMatriz.idTabelaPrecoProduto}`);
                }
                else {
                    this.logger.error(`[Trabalho] Nenhuma tabela de preço válida encontrada para a matriz ${cadastroComplementar.idTabelaPrecoProduto}`);
                }
            }
        }
        else {
            this.logger.warn(`[Trabalho] Empresa ${idEmpresa} não possui tabela de preço configurada no cadastro complementar`);
        }
        if (servicosDto) {
            trabalho.servicos = await Promise.all(servicosDto.map(async (servicoDto) => {
                var _a;
                const servico = new servicoTrabalho_entity_1.ServicoTrabalho();
                servico.idProduto = servicoDto.idProduto;
                servico.elementos = await Promise.all(((_a = servicoDto.elementos) === null || _a === void 0 ? void 0 : _a.map(async (elDto) => {
                    if (elDto.idElementoTrabalho) {
                        return (0, class_transformer_1.plainToClass)(elementosTrabalho_entity_1.ElementosTrabalho, elDto);
                    }
                    else {
                        const novoElemento = new elementosTrabalho_entity_1.ElementosTrabalho();
                        novoElemento.nome = elDto.nome;
                        novoElemento.idUsuarioCadastro = currentUser.user.idUsuario;
                        return novoElemento;
                    }
                })) || []);
                return servico;
            }));
        }
        const nomesIgnorados = ['SEM COMPONENTE', 'INDEFINIDO'];
        const componentesParaValidarEstoque = componentesDto === null || componentesDto === void 0 ? void 0 : componentesDto.filter(c => !nomesIgnorados.includes(c.nome));
        const componenteIds = componentesParaValidarEstoque === null || componentesParaValidarEstoque === void 0 ? void 0 : componentesParaValidarEstoque.map(componente => componente.idComponente);
        trabalho.status = trabalho_entity_1.StatusTrabalho.MODELAGEM;
        const componentes = componentesDto === null || componentesDto === void 0 ? void 0 : componentesDto.reduce((previous, current) => {
            if (previous[current.idComponente]) {
                previous[current.idComponente].qtdItems = previous[current.idComponente].qtdItems + 1;
            }
            else {
                previous[current.idComponente] = current;
                previous[current.idComponente].qtdItems = 1;
            }
            return previous;
        }, {});
        const trabalhosalvo = await this.trabalhoRepository.salvaTrabalho(trabalho);
        if (componentes) {
            await this.componentesTrabalhoService.salvarComponentes(Object.values(componentes), trabalhosalvo.idTrabalho);
        }
        await this.validarESincronizarMotivosDoTrabalho(trabalhosalvo.idTrabalho, !!trabalhosalvo.retrabalho, !!trabalhosalvo.bonificacao, motivosRetrabalhoIds, motivosBonificacaoIds);
        await this.atualizaOrdemServico(currentUser, trabalhosalvo.idTrabalho);
        await this.historicoStatusTrabalhoService.cadastrarHistoricoStatusTrabalho(currentUser, trabalhosalvo.idTrabalho, trabalho_entity_1.StatusTrabalho.PENDENTE, trabalho_entity_1.StatusTrabalho.MODELAGEM);
        return this.buscarTrabalhoPorId(trabalhosalvo.idTrabalho);
    }
    async atualizaEstoque(idTrabalho) {
        const trabalho = await this.buscarTrabalhoPorId(idTrabalho);
        const componentesConsumo = trabalho.componentes;
        const idEmpresa = trabalho.idEmpresa;
        if (!componentesConsumo)
            return;
        for (const componente of Object.values(componentesConsumo)) {
            if (!componente.idComponente || !componente.qtdItems)
                continue;
            let quantidadeNecessaria = componente.qtdItems;
            const idComponente = componente.idComponente;
            const estoquesDisponiveis = await this.estoqueService.findStockForComponent(idComponente, idEmpresa);
            const estoquesDisponiveisLaboratorio = await this.estoqueService.findStockForComponent(idComponente, 0);
            let estoquesGlobalDisponiveis = await this.estoqueService.findStockForComponentAllAlmoxarifados(idComponente, idEmpresa);
            estoquesGlobalDisponiveis = estoquesGlobalDisponiveis.concat(estoquesDisponiveisLaboratorio);
            const totalDisponivel = estoquesDisponiveis.reduce((acc, e) => acc + e.quantidade, 0);
            if (totalDisponivel < quantidadeNecessaria) {
                this.logger.warn(`Estoque insuficiente para o componente ${idComponente}. Necessário: ${quantidadeNecessaria}, Disponível: ${totalDisponivel}. Adicionando Débito.`);
                if (false) {
                    throw new common_1.UnprocessableEntityException(`Estoque insuficiente para o componente ${idComponente}. Necessário: ${quantidadeNecessaria}, Disponível: ${totalDisponivel}`);
                }
            }
            if (totalDisponivel > 0) {
                for (const estoque of estoquesDisponiveis) {
                    if (quantidadeNecessaria <= 0)
                        break;
                    const quantidadeADebitar = Math.min(estoque.quantidade, quantidadeNecessaria);
                    if (quantidadeADebitar > 0) {
                        const eventoConsumo = {
                            idComponente: idComponente,
                            idEmpresa: idEmpresa,
                            quantidadeConsumida: quantidadeADebitar,
                            idTrabalho: idTrabalho,
                        };
                        this.eventEmitter.emit('trabalho.criado', eventoConsumo);
                        quantidadeNecessaria -= quantidadeADebitar;
                    }
                }
            }
            const almoxarifadoDestino = await this.almoxarifadoService.findOneByEmpresa(idEmpresa);
            if (quantidadeNecessaria > 0) {
                if (!almoxarifadoDestino) {
                    this.logger.error(`Almoxarifado de destino não encontrado para a empresa ${idEmpresa}.`);
                    throw new common_1.NotFoundException(`Almoxarifado de destino não encontrado para a empresa ${idEmpresa}.`);
                }
                for (const estoqueGlobal of estoquesGlobalDisponiveis) {
                    if (quantidadeNecessaria <= 0)
                        break;
                    const quantidadeADebitar = Math.min(estoqueGlobal.quantidade, quantidadeNecessaria);
                    if (quantidadeADebitar > 0) {
                        const eventoTransferenciaGlobal = {
                            idComponente: idComponente,
                            idAlmoxarifadoOrigem: estoqueGlobal.idAlmoxarifado,
                            idAlmoxarifadoDestino: almoxarifadoDestino.idAlmoxarifado,
                            quantidade: quantidadeADebitar,
                        };
                        await this.transferenciaService.create(eventoTransferenciaGlobal);
                        quantidadeNecessaria -= quantidadeADebitar;
                    }
                }
            }
            if (quantidadeNecessaria > 0) {
                const eventoTransferencia = {
                    idComponente: idComponente,
                    idAlmoxarifadoDestino: almoxarifadoDestino.idAlmoxarifado,
                    quantidade: quantidadeNecessaria,
                };
                await this.transferenciaService.create(eventoTransferencia);
                quantidadeNecessaria -= quantidadeNecessaria;
            }
            if (quantidadeNecessaria > 0) {
                throw new Error(`Falha na lógica de consumo de estoque para o componente ${idComponente}. Quantidade necessaria = ${quantidadeNecessaria}`);
            }
        }
    }
    async atualizarTrabalho(currentUser, idTrabalho, trabalhoCadastroDto, isAdmin = false) {
        var _a, _b, _c;
        const trabalhoDB = await this.buscarTrabalhoPorId(idTrabalho);
        if (!trabalhoDB) {
            throw new common_1.HttpException("Not Found", common_1.HttpStatus.NOT_FOUND);
        }
        if (trabalhoDB.finalizado) {
            throw new common_1.HttpException("Trabalho finalizado não pode ser alterado", common_1.HttpStatus.BAD_REQUEST);
        }
        const { servicos, componentes: componentesDto, idPaciente, motivosRetrabalhoIds, motivosBonificacaoIds } = trabalhoCadastroDto, dadosTrabalho = __rest(trabalhoCadastroDto, ["servicos", "componentes", "idPaciente", "motivosRetrabalhoIds", "motivosBonificacaoIds"]);
        if (idPaciente && idPaciente !== trabalhoDB.idPaciente) {
            const paciente = await this.pacienteService.findOne(idPaciente, trabalhoDB.idEmpresa);
            trabalhoDB.idPaciente = paciente.idPaciente;
            trabalhoDB.nomePaciente = paciente.nome;
        }
        Object.assign(trabalhoDB, dadosTrabalho);
        trabalhoDB.anotacoes = trabalhoCadastroDto.anotacoes;
        trabalhoDB.idTrabalho = idTrabalho;
        this.validarComponentesDtoIndefinidosProibidosNoStatus(trabalhoDB.status, trabalhoCadastroDto.componentes);
        if (trabalhoCadastroDto.servicos) {
            const mapaServicosAtuais = new Map((_a = trabalhoDB.servicos) === null || _a === void 0 ? void 0 : _a.map(s => [s.idServicoTrabalho, s]));
            trabalhoDB.servicos = await Promise.all(trabalhoCadastroDto.servicos.map(async (servicoDto) => {
                var _a;
                let servico;
                if (servicoDto.idServicoTrabalho && mapaServicosAtuais.has(servicoDto.idServicoTrabalho)) {
                    servico = mapaServicosAtuais.get(servicoDto.idServicoTrabalho);
                    servico.idProduto = servicoDto.idProduto;
                }
                else {
                    servico = new servicoTrabalho_entity_1.ServicoTrabalho();
                    servico.idProduto = servicoDto.idProduto;
                }
                servico.elementos = await Promise.all(((_a = servicoDto.elementos) === null || _a === void 0 ? void 0 : _a.map(async (elDto) => {
                    if (elDto.idElementoTrabalho) {
                        return (0, class_transformer_1.plainToClass)(elementosTrabalho_entity_1.ElementosTrabalho, elDto);
                    }
                    else {
                        const novoElemento = new elementosTrabalho_entity_1.ElementosTrabalho();
                        novoElemento.nome = elDto.nome;
                        novoElemento.idUsuarioCadastro = currentUser.user.idUsuario;
                        return novoElemento;
                    }
                })) || []);
                return servico;
            }));
        }
        else {
            trabalhoDB.servicos = [];
        }
        const componentes = trabalhoCadastroDto.componentes && trabalhoCadastroDto.componentes.reduce((previous, current) => {
            if (previous[current.idComponente]) {
                previous[current.idComponente].qtdItems = previous[current.idComponente].qtdItems + 1;
            }
            else {
                previous[current.idComponente] = current;
                previous[current.idComponente].qtdItems = 1;
            }
            previous[current.idComponente].idTrabalho = idTrabalho;
            return previous;
        }, {});
        const nomesIgnorados = ['SEM COMPONENTE', 'INDEFINIDO'];
        const componentesParaValidarEstoque = (_b = trabalhoCadastroDto.componentes) === null || _b === void 0 ? void 0 : _b.filter(c => !nomesIgnorados.includes(c.nome));
        const componenteIds = componentesParaValidarEstoque === null || componentesParaValidarEstoque === void 0 ? void 0 : componentesParaValidarEstoque.map(componente => componente.idComponente);
        (_c = trabalhoDB.servicos) === null || _c === void 0 ? void 0 : _c.forEach(servico => {
            var _a;
            servico.idTrabalho = idTrabalho;
            (_a = servico.elementos) === null || _a === void 0 ? void 0 : _a.forEach(elemento => {
                elemento.idUsuarioCadastro = currentUser.user.idUsuario;
            });
        });
        const trabalhosalvo = await this.trabalhoRepository.salvaTrabalho(trabalhoDB);
        await this.historicoStatusTrabalhoService.cadastrarHistoricoStatusTrabalho(currentUser, idTrabalho, trabalhoDB.status, trabalho_entity_1.StatusTrabalho.MODELAGEM);
        if (componentes !== undefined) {
            await this.componentesTrabalhoService.salvarComponentes(Object.values(componentes), trabalhosalvo.idTrabalho);
        }
        await this.validarESincronizarMotivosDoTrabalho(trabalhosalvo.idTrabalho, !!trabalhosalvo.retrabalho, !!trabalhosalvo.bonificacao, motivosRetrabalhoIds, motivosBonificacaoIds);
        await this.atualizaOrdemServico(currentUser, trabalhosalvo.idTrabalho);
        return this.buscarTrabalhoPorId(trabalhosalvo.idTrabalho);
    }
    async criarRetrabalho(currentUser, idTrabalhoOrigem, retrabalhoDto) {
        var _a, _b, _c;
        const trabalhoOrigem = await this.buscarTrabalhoPorId(idTrabalhoOrigem);
        if (!trabalhoOrigem) {
            throw new common_1.NotFoundException(`Trabalho de origem com ID ${idTrabalhoOrigem} não encontrado.`);
        }
        const novoTrabalho = new trabalho_entity_1.Trabalho();
        novoTrabalho.nomePaciente = trabalhoOrigem.nomePaciente;
        novoTrabalho.idEmpresa = trabalhoOrigem.idEmpresa;
        novoTrabalho.idPaciente = trabalhoOrigem.idPaciente;
        novoTrabalho.nomeEmpresa = trabalhoOrigem.nomeEmpresa;
        novoTrabalho.idProfissional = trabalhoOrigem.idProfissional;
        novoTrabalho.cor = retrabalhoDto.cor || trabalhoOrigem.cor;
        novoTrabalho.descricaoTrabalho = `Retrabalho do OS: ${trabalhoOrigem.idTrabalho}`;
        novoTrabalho.idTrabalhoOrigem = idTrabalhoOrigem;
        novoTrabalho.retrabalho = true;
        novoTrabalho.observacao = retrabalhoDto.observacao;
        novoTrabalho.anotacoes = retrabalhoDto.anotacoes;
        novoTrabalho.status = trabalho_entity_1.StatusTrabalho.MODELAGEM;
        novoTrabalho.idUsuarioCadastro = currentUser.user.idUsuario;
        novoTrabalho.ativo = true;
        novoTrabalho.servicos = (0, class_transformer_1.plainToClass)(servicoTrabalho_entity_1.ServicoTrabalho, retrabalhoDto.servicos);
        (_a = novoTrabalho.servicos) === null || _a === void 0 ? void 0 : _a.forEach(servico => {
            var _a;
            (_a = servico.elementos) === null || _a === void 0 ? void 0 : _a.forEach(elemento => {
                elemento.idUsuarioCadastro = currentUser.user.idUsuario;
            });
        });
        const retrabalhoSalvo = await this.trabalhoRepository.salvaTrabalho(novoTrabalho);
        const componentesAgrupadosParaRetrabalho = (_b = retrabalhoDto.componentes) === null || _b === void 0 ? void 0 : _b.reduce((acc, compDto) => {
            const id = compDto.idComponente;
            if (acc[id]) {
                acc[id].qtdItems += 1;
            }
            else {
                const novoComp = new componentesTrabalho_entity_1.ComponentesTrabalho();
                novoComp.idComponente = id;
                novoComp.qtdItems = 1;
                acc[id] = novoComp;
            }
            return acc;
        }, {});
        if (componentesAgrupadosParaRetrabalho) {
            await this.componentesTrabalhoService.salvarComponentes(Object.values(componentesAgrupadosParaRetrabalho), retrabalhoSalvo.idTrabalho);
        }
        const produtosEmRetrabalhoIds = ((_c = retrabalhoDto.servicos) === null || _c === void 0 ? void 0 : _c.map(s => s.idProduto)) || [];
        trabalhoOrigem.servicos = trabalhoOrigem.servicos.filter(s => !produtosEmRetrabalhoIds.includes(s.idProduto));
        if (componentesAgrupadosParaRetrabalho) {
            const componentesOriginais = await this.componentesTrabalhoService.buscarPorIdTrabalho(idTrabalhoOrigem);
            Object.values(componentesAgrupadosParaRetrabalho).forEach(compRetrabalho => {
                const compOriginal = componentesOriginais.find(c => c.idComponente === compRetrabalho.idComponente);
                if (compOriginal) {
                    compOriginal.qtdItems -= compRetrabalho.qtdItems;
                }
            });
            const componentesFinaisOrigem = componentesOriginais.filter(c => c.qtdItems > 0);
            await this.componentesTrabalhoService.salvarComponentes(componentesFinaisOrigem, idTrabalhoOrigem);
        }
        await this.trabalhoRepository.salvaTrabalho(trabalhoOrigem);
        await this.atualizaOrdemServico(currentUser, retrabalhoSalvo.idTrabalho);
        await this.atualizaOrdemServico(currentUser, idTrabalhoOrigem);
        await this.historicoStatusTrabalhoService.cadastrarHistoricoStatusTrabalho(currentUser, retrabalhoSalvo.idTrabalho, null, trabalho_entity_1.StatusTrabalho.MODELAGEM);
        await this.historicoStatusTrabalhoService.cadastrarHistoricoStatusTrabalho(currentUser, idTrabalhoOrigem, trabalhoOrigem.status, trabalhoOrigem.status);
        return this.buscarTrabalhoPorId(retrabalhoSalvo.idTrabalho);
    }
    async atualizarAnotacoesTrabalho(currentUser, idTrabalho, trabalhoCadastroDto) {
        const trabalhoDB = await this.buscarTrabalhoPorId(idTrabalho);
        if (!trabalhoDB) {
            throw new common_1.HttpException("Not Found", common_1.HttpStatus.NOT_FOUND);
        }
        if (trabalhoDB.finalizado) {
            throw new common_1.HttpException("Trabalho finalizado não pode ter anotações alteradas", common_1.HttpStatus.BAD_REQUEST);
        }
        const trabalho = {};
        trabalho.idTrabalho = idTrabalho;
        trabalho.anotacoes = trabalhoCadastroDto.anotacoes;
        trabalho.observacao = trabalhoCadastroDto.observacao;
        let recalcular = false;
        if (trabalho.retrabalho != trabalhoCadastroDto.retrabalho) {
            trabalho.retrabalho = trabalhoCadastroDto.retrabalho;
            recalcular = true;
        }
        const trabalhoAtualizado = await this.atualizarTrabalho(currentUser, idTrabalho, trabalhoCadastroDto, true);
        if (recalcular) {
            await this.atualizaOrdemServico(currentUser, idTrabalho);
        }
        return trabalhoAtualizado;
    }
    async atualizarStatusTrabalho(currentUser, idTrabalho, trabalhoStatusEditarDto) {
        const trabalhoDB = await this.trabalhoRepository.buscarProdutoPorIdComRelacoes(idTrabalho);
        if (!trabalhoDB) {
            throw new common_1.HttpException("Not Found", common_1.HttpStatus.NOT_FOUND);
        }
        if (trabalhoDB.finalizado) {
            throw new common_1.HttpException("Trabalho finalizado não pode ter status alterado", common_1.HttpStatus.BAD_REQUEST);
        }
        let novoStatus = trabalhoStatusEditarDto.status;
        if (trabalhoDB.status === trabalho_entity_1.StatusTrabalho.PENDENTE) {
            novoStatus = trabalho_entity_1.StatusTrabalho.MODELAGEM;
        }
        if (this.temComponenteIndefinidoNoTrabalho(trabalhoDB) &&
            this.statusExigeComponentesDefinidos(novoStatus)) {
            throw new common_1.HttpException('Existem componentes indefinidos neste trabalho. Defina os componentes no catálogo antes de avançar para AGUARDANDO_COMPONENTE, PACOTE, AGUARDANDO_COLETA, ENVIADO, ENVIADO_PROVA ou PAGAMENTO_RECEBIDO.', common_1.HttpStatus.UNPROCESSABLE_ENTITY);
        }
        const trabalho = {};
        trabalho.idTrabalho = idTrabalho;
        trabalho.status = novoStatus;
        const statusConcluidos = [trabalho_entity_1.StatusTrabalho.ENVIADO, trabalho_entity_1.StatusTrabalho.ENVIADO_PROVA, trabalho_entity_1.StatusTrabalho.PAGAMENTO_RECEBIDO];
        const novoStatusConcluido = statusConcluidos.includes(novoStatus);
        const anteriorStatusConcluido = statusConcluidos.includes(trabalhoDB.status);
        if (novoStatusConcluido && !anteriorStatusConcluido) {
            const agora = new Date();
            if (trabalhoDB.dataConclusao == null) {
                await this.atualizaEstoque(idTrabalho);
                trabalho.dataConclusao = agora;
            }
            if (trabalhoDB.dataHoraEnvio == null) {
                trabalho.dataHoraEnvio = agora;
            }
        }
        else if (novoStatusConcluido && anteriorStatusConcluido) {
            if (trabalhoDB.dataHoraEnvio == null) {
                trabalho.dataHoraEnvio = trabalhoDB.dataConclusao || new Date();
            }
        }
        else if (!novoStatusConcluido) {
            trabalho.dataConclusao = null;
            trabalho.dataHoraEnvio = null;
        }
        const historicoNovo = await this.historicoStatusTrabalhoService.cadastrarHistoricoStatusTrabalho(currentUser, idTrabalho, trabalhoDB.status, trabalhoStatusEditarDto.status);
        trabalhoDB.historicoStatusTrabalho.push(historicoNovo);
        const trabalhoAtualizado = Object.assign(trabalhoDB, trabalho);
        const trabalhoSalvo = await this.trabalhoRepository.salvaTrabalho(trabalhoAtualizado);
        if (novoStatus === trabalho_entity_1.StatusTrabalho.CANCELADO) {
            try {
                await this.zerarOrdemServicoCancelado(idTrabalho);
            }
            catch (error) {
                this.logger.error(`Erro ao zerar OS do trabalho cancelado ${idTrabalho}: ${error.message}`, error.stack);
            }
        }
        else {
            await this.atualizaOrdemServico(currentUser, idTrabalho);
        }
        if (novoStatus === trabalho_entity_1.StatusTrabalho.ENVIADO || novoStatus === trabalho_entity_1.StatusTrabalho.ENVIADO_PROVA) {
            try {
                await new Promise(resolve => setTimeout(resolve, 500));
                await this.faturaService.adicionarTrabalhoAProximaFatura(idTrabalho);
            }
            catch (error) {
                this.logger.error(`Erro ao adicionar trabalho ${idTrabalho} à fatura: ${error.message}`, error.stack);
            }
        }
        return trabalhoSalvo;
    }
    async enviarParaProducao(idTrabalho) {
        const trabalhoDB = await this.buscarTrabalhoPorId(idTrabalho);
        if (!trabalhoDB) {
            throw new common_1.HttpException("Not Found", common_1.HttpStatus.NOT_FOUND);
        }
        const trabalho = {};
        trabalho.idTrabalho = idTrabalho;
        trabalho.status = trabalho_entity_1.StatusTrabalho.MODELAGEM;
        if (!trabalhoDB.ordem && trabalhoDB.status != trabalho_entity_1.StatusTrabalho.MODELAGEM && trabalho.status === trabalho_entity_1.StatusTrabalho.MODELAGEM) {
            let busca = await this.trabalhoRepository.buscaUltimoId();
            busca = busca && busca[0];
            if (isNaN(busca.ordem)) {
                busca.idTrabalho = 0;
            }
            trabalho.ordem = parseInt(busca.ordem) + 1;
        }
        const trabalhoAtualizado = Object.assign(trabalhoDB, trabalho);
        return this.trabalhoRepository.salvaTrabalho(trabalhoAtualizado);
    }
    async buscarTrabalhoPorId(idTrabalho) {
        const trabalho = await this.trabalhoRepository.buscarProdutoPorId(idTrabalho);
        if (!trabalho)
            return trabalho;
        const trabalhoMotivos = await this.trabalhoMotivoRepository.find({ where: { idTrabalho } });
        const motivosRetrabalhoIds = trabalhoMotivos
            .filter((tm) => { var _a; return ((_a = tm.motivo) === null || _a === void 0 ? void 0 : _a.tipo) === motivo_dto_1.MotivoTipo.RETRABALHO; })
            .map((tm) => tm.idMotivo);
        const motivosBonificacaoIds = trabalhoMotivos
            .filter((tm) => { var _a; return ((_a = tm.motivo) === null || _a === void 0 ? void 0 : _a.tipo) === motivo_dto_1.MotivoTipo.BONIFICACAO; })
            .map((tm) => tm.idMotivo);
        return Object.assign(trabalho, {
            motivosRetrabalhoIds,
            motivosBonificacaoIds,
        });
    }
    async validarESincronizarMotivosDoTrabalho(idTrabalho, retrabalhoAtivo, bonificacaoAtiva, motivosRetrabalhoIds, motivosBonificacaoIds) {
        const retrabalhoIds = retrabalhoAtivo ? (motivosRetrabalhoIds !== null && motivosRetrabalhoIds !== void 0 ? motivosRetrabalhoIds : []) : [];
        const bonificacaoIds = bonificacaoAtiva ? (motivosBonificacaoIds !== null && motivosBonificacaoIds !== void 0 ? motivosBonificacaoIds : []) : [];
        if (retrabalhoAtivo && retrabalhoIds.length < 1) {
            throw new common_1.HttpException('Selecione pelo menos 1 motivo de retrabalho.', common_1.HttpStatus.UNPROCESSABLE_ENTITY);
        }
        if (bonificacaoAtiva && bonificacaoIds.length < 1) {
            throw new common_1.HttpException('Selecione pelo menos 1 motivo de bonificação.', common_1.HttpStatus.UNPROCESSABLE_ENTITY);
        }
        const allIds = Array.from(new Set([...(retrabalhoIds !== null && retrabalhoIds !== void 0 ? retrabalhoIds : []), ...(bonificacaoIds !== null && bonificacaoIds !== void 0 ? bonificacaoIds : [])]));
        await this.trabalhoMotivoRepository.delete({ idTrabalho });
        if (allIds.length === 0)
            return;
        const motivos = await this.motivoRepository.find({
            where: { idMotivo: (0, typeorm_2.In)(allIds), ativo: 1 },
        });
        if (motivos.length !== allIds.length) {
            throw new common_1.HttpException('Um ou mais motivos selecionados são inválidos/inativos.', common_1.HttpStatus.UNPROCESSABLE_ENTITY);
        }
        const mapa = new Map(motivos.map((m) => [m.idMotivo, m]));
        const tipoErradoRetrabalho = retrabalhoIds.find((id) => { var _a; return ((_a = mapa.get(id)) === null || _a === void 0 ? void 0 : _a.tipo) !== motivo_dto_1.MotivoTipo.RETRABALHO; });
        if (tipoErradoRetrabalho) {
            throw new common_1.HttpException('Há motivo selecionado com tipo diferente de RETRABALHO.', common_1.HttpStatus.UNPROCESSABLE_ENTITY);
        }
        const tipoErradoBonificacao = bonificacaoIds.find((id) => { var _a; return ((_a = mapa.get(id)) === null || _a === void 0 ? void 0 : _a.tipo) !== motivo_dto_1.MotivoTipo.BONIFICACAO; });
        if (tipoErradoBonificacao) {
            throw new common_1.HttpException('Há motivo selecionado com tipo diferente de BONIFICACAO.', common_1.HttpStatus.UNPROCESSABLE_ENTITY);
        }
        await this.trabalhoMotivoRepository.insert(allIds.map((idMotivo) => ({
            idTrabalho,
            idMotivo,
        })));
    }
    async buscarTrabalhos(statusTrabalho, idEmpresa, incluirOcultos = false) {
        if (idEmpresa) {
            return this.trabalhoRepository.buscarTrabalhosDaEmpresa(idEmpresa, statusTrabalho, incluirOcultos);
        }
        return this.trabalhoRepository.buscarTrabalhos(statusTrabalho, incluirOcultos);
    }
    async pesquisarTrabalhos(termo, idEmpresa) {
        return this.trabalhoRepository.pesquisarTrabalhos(termo, idEmpresa);
    }
    async buscarTrabalhosPendentes(idEmpresa) {
        if (idEmpresa) {
            return this.trabalhoRepository.buscarTrabalhosDaEmpresa(idEmpresa, [trabalho_entity_1.StatusTrabalho.PENDENTE]);
        }
        return this.trabalhoRepository.buscarTrabalhos([trabalho_entity_1.StatusTrabalho.PENDENTE]);
    }
    async buscarTrabalhosConcluidos(idEmpresa, dataInicio, dataFim, incluirOcultos = false) {
        return await this.trabalhoRepository.buscarTrabalhosConcluidos([trabalho_entity_1.StatusTrabalho.ENVIADO, trabalho_entity_1.StatusTrabalho.ENVIADO_PROVA, trabalho_entity_1.StatusTrabalho.PAGAMENTO_RECEBIDO], idEmpresa, dataInicio, dataFim, incluirOcultos);
    }
    async alternarOcultarConcluido(idTrabalho, ocultar) {
        const trabalhoDB = await this.trabalhoRepository.buscarProdutoPorId(idTrabalho);
        if (!trabalhoDB) {
            throw new common_1.HttpException("Trabalho não encontrado", common_1.HttpStatus.NOT_FOUND);
        }
        const novoValor = ocultar !== undefined ? !!ocultar : !trabalhoDB.ocultoConcluido;
        await this.trabalhoRepository.atualizaTrabalho(idTrabalho, { ocultoConcluido: novoValor });
        return { idTrabalho, ocultoConcluido: novoValor };
    }
    async buscarRelatorio(idEmpresa, statusTrabalho, dataInicio, dataFim) {
        var _a, e_1, _b, _c;
        if (statusTrabalho.length == 0) {
            statusTrabalho = [trabalho_entity_1.StatusTrabalho.ENVIADO, trabalho_entity_1.StatusTrabalho.ENVIADO_PROVA];
        }
        const trabalhos = await this.trabalhoRepository.buscarRelatorio(idEmpresa, statusTrabalho, dataInicio, dataFim);
        const faturados = [];
        const retrabalhos = [];
        const bonificados = [];
        try {
            for (var _d = true, trabalhos_1 = __asyncValues(trabalhos), trabalhos_1_1; trabalhos_1_1 = await trabalhos_1.next(), _a = trabalhos_1_1.done, !_a; _d = true) {
                _c = trabalhos_1_1.value;
                _d = false;
                const trabalho = _c;
                const ordemServico = await this.ordemServicoService.buscarPorIdTrabalho(trabalho.idTrabalho);
                trabalho.ordemServico = ordemServico;
                const isRetrabalho = !!trabalho.retrabalho;
                const isBonificacao = !!trabalho.bonificacao;
                const temMotivos = trabalho.trabalhoMotivos && trabalho.trabalhoMotivos.length > 0;
                const isRetrabalhoEfetivo = isRetrabalho || (temMotivos && !isBonificacao);
                if (isBonificacao) {
                    bonificados.push(trabalho);
                }
                else if (isRetrabalhoEfetivo) {
                    retrabalhos.push(trabalho);
                }
                else {
                    faturados.push(trabalho);
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (!_d && !_a && (_b = trabalhos_1.return)) await _b.call(trabalhos_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        const baixas = await this.devolucaoComponenteService.buscarHistoricoBaixas(idEmpresa, dataInicio, dataFim);
        return {
            faturados,
            retrabalhos,
            bonificados,
            baixas
        };
    }
    async ordenatrabalhos(idEmpresa, idtrabalhos) {
        var _a, e_2, _b, _c;
        const trabalhosPendente = await this.buscarTrabalhosPendentesPorIdEmpresa(idEmpresa);
        const ordemTrabalhoPendente = trabalhosPendente.map(trabalho => trabalho.ordem).sort();
        const trabalhosOrdenados = idtrabalhos.reduce((previosValue, currentValue, currentIndex) => {
            const ordem = {
                idTrabalho: currentValue,
                ordem: ordemTrabalhoPendente[currentIndex]
            };
            previosValue.push(ordem);
            return previosValue;
        }, []);
        try {
            for (var _d = true, trabalhosOrdenados_1 = __asyncValues(trabalhosOrdenados), trabalhosOrdenados_1_1; trabalhosOrdenados_1_1 = await trabalhosOrdenados_1.next(), _a = trabalhosOrdenados_1_1.done, !_a; _d = true) {
                _c = trabalhosOrdenados_1_1.value;
                _d = false;
                let trabalho = _c;
                await this.atualizaOrdem(trabalho.idTrabalho, trabalho.ordem);
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (!_d && !_a && (_b = trabalhosOrdenados_1.return)) await _b.call(trabalhosOrdenados_1);
            }
            finally { if (e_2) throw e_2.error; }
        }
        return await this.buscarTrabalhosPendentes(idEmpresa);
    }
    async buscarTrabalhosPendentesPorIdEmpresa(idEmpresa) {
        if (idEmpresa) {
            return await this.trabalhoRepository.buscarTrabalhosPendentesPorIdEmpresa(idEmpresa);
        }
        return await this.trabalhoRepository.buscarTrabalhosPendentes();
    }
    async atualizaOrdem(idTrabalho, ordem) {
        return this.trabalhoRepository.atualizaOrdem(idTrabalho, ordem);
    }
    async recalcularValorTrabalhosEnviados(currentUser) {
        var _a, e_3, _b, _c;
        const trabalhosEnviados = await this.trabalhoRepository.buscarTrabalhos([trabalho_entity_1.StatusTrabalho.ENVIADO, trabalho_entity_1.StatusTrabalho.ENVIADO_PROVA]);
        try {
            for (var _d = true, trabalhosEnviados_1 = __asyncValues(trabalhosEnviados), trabalhosEnviados_1_1; trabalhosEnviados_1_1 = await trabalhosEnviados_1.next(), _a = trabalhosEnviados_1_1.done, !_a; _d = true) {
                _c = trabalhosEnviados_1_1.value;
                _d = false;
                const trabalho = _c;
                await this.atualizaOrdemServico(currentUser, trabalho.idTrabalho);
            }
        }
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (!_d && !_a && (_b = trabalhosEnviados_1.return)) await _b.call(trabalhosEnviados_1);
            }
            finally { if (e_3) throw e_3.error; }
        }
    }
    async atualizarPrecosOrdemServico(currentUser, idTrabalho, emitirEvento = false) {
        const osBase = await this.ordemServicoService.buscarPorIdTrabalho(idTrabalho);
        const trabalho = await this.trabalhoRepository.buscarProdutoPorIdComRelacoes(idTrabalho);
        if (!trabalho) {
            throw new common_1.NotFoundException(`Trabalho com ID ${idTrabalho} não encontrado.`);
        }
        const cadastroComplementar = await this.cadastroComplementarEmpresaService.buscarCadastroComplementarEmpresa(trabalho.idEmpresa);
        const dataReferencia = trabalho.dataInclusao || new Date();
        let tabelaVigenteAssociacao = await this.empresaTabelaPrecoService.buscarTabelaPrecoVigentePorEmpresa(trabalho.idEmpresa, dataReferencia);
        if (tabelaVigenteAssociacao) {
            this.logger.log(`[Trabalho ${idTrabalho}] Tabela vigente (associação empresa-tabela): ID ${tabelaVigenteAssociacao.idTabelaPrecoProduto}, Nome: "${tabelaVigenteAssociacao.nome}"`);
        }
        if (!tabelaVigenteAssociacao && (cadastroComplementar === null || cadastroComplementar === void 0 ? void 0 : cadastroComplementar.idTabelaPrecoProduto)) {
            this.logger.log(`[Trabalho ${idTrabalho}] Nenhuma associação específica encontrada, usando tabela do cadastro complementar como fallback (matriz: ${cadastroComplementar.idTabelaPrecoProduto})`);
            tabelaVigenteAssociacao = await this.tabelaPrecoProdutoService.buscarTabelaPrecoVigentePorMatriz(cadastroComplementar.idTabelaPrecoProduto, dataReferencia);
            if (tabelaVigenteAssociacao) {
                this.logger.log(`[Trabalho ${idTrabalho}] Tabela encontrada via cadastro complementar (versão): ID ${tabelaVigenteAssociacao.idTabelaPrecoProduto}, Nome: "${tabelaVigenteAssociacao.nome}"`);
            }
        }
        if (!tabelaVigenteAssociacao && (cadastroComplementar === null || cadastroComplementar === void 0 ? void 0 : cadastroComplementar.idTabelaPrecoProduto)) {
            tabelaVigenteAssociacao = await this.tabelaPrecoProdutoService.buscaTabelaPrecoProdutosPorId(cadastroComplementar.idTabelaPrecoProduto);
            if (tabelaVigenteAssociacao) {
                this.logger.log(`[Trabalho ${idTrabalho}] Tabela encontrada via cadastro complementar (matriz direta): ID ${tabelaVigenteAssociacao.idTabelaPrecoProduto}, Nome: "${tabelaVigenteAssociacao.nome}"`);
            }
        }
        let tabelaPrecoProduto = null;
        if (trabalho.idTabelaPrecoProduto) {
            const tabelaDoTrabalho = await this.tabelaPrecoProdutoService.buscaTabelaPrecoProdutosPorId(trabalho.idTabelaPrecoProduto);
            const mesmaTabela = tabelaVigenteAssociacao &&
                tabelaDoTrabalho &&
                tabelaDoTrabalho.idTabelaPrecoProduto === tabelaVigenteAssociacao.idTabelaPrecoProduto;
            if (mesmaTabela) {
                tabelaPrecoProduto = tabelaDoTrabalho;
                this.logger.log(`[Trabalho ${idTrabalho}] Conferência OK: tabela do trabalho (ID ${trabalho.idTabelaPrecoProduto}) é a mesma da associação empresa-tabela; usando para cálculo.`);
            }
            else if (tabelaVigenteAssociacao) {
                tabelaPrecoProduto = tabelaVigenteAssociacao;
                this.logger.log(`[Trabalho ${idTrabalho}] Conferência: tabela do trabalho (ID ${trabalho.idTabelaPrecoProduto}) difere da vigente (ID ${tabelaVigenteAssociacao.idTabelaPrecoProduto}); usando tabela da associação empresa-tabela para cálculo.`);
            }
            else {
                tabelaPrecoProduto = tabelaDoTrabalho !== null && tabelaDoTrabalho !== void 0 ? tabelaDoTrabalho : null;
                if (tabelaPrecoProduto) {
                    this.logger.log(`[Trabalho ${idTrabalho}] Sem associação vigente; usando tabela do trabalho: ID ${trabalho.idTabelaPrecoProduto}`);
                }
            }
        }
        else {
            tabelaPrecoProduto = tabelaVigenteAssociacao;
        }
        if (!tabelaPrecoProduto) {
            this.logger.error(`Tabela de preço não encontrada para o trabalho ${idTrabalho}`);
            throw new common_1.NotFoundException(`Tabela de preço não encontrada para o trabalho ${idTrabalho}`);
        }
        const mesmaQueTrabalho = trabalho.idTabelaPrecoProduto && tabelaPrecoProduto.idTabelaPrecoProduto === trabalho.idTabelaPrecoProduto;
        const tipoTabela = mesmaQueTrabalho ? 'histórica (do trabalho - conferência OK)' : 'vigente (associação empresa-tabela)';
        const versaoInfo = tabelaPrecoProduto.numeroVersao ? `, Versão: ${tabelaPrecoProduto.numeroVersao}` : '';
        const origemInfo = tabelaPrecoProduto.idTabelaPrecoProdutoOrigem ? ` (versão da matriz ${tabelaPrecoProduto.idTabelaPrecoProdutoOrigem})` : ' (matriz)';
        this.logger.log(`[Cálculo Preço - Trabalho ${idTrabalho}] ` +
            `Tabela utilizada: ID ${tabelaPrecoProduto.idTabelaPrecoProduto}, ` +
            `Nome: "${tabelaPrecoProduto.nome}"${versaoInfo}${origemInfo}, ` +
            `Tipo: ${tipoTabela}, ` +
            `Empresa: ${trabalho.idEmpresa}, ` +
            `Data referência: ${(trabalho.dataInclusao || new Date()).toISOString()}`);
        let osData;
        if (osBase) {
            osData = osBase;
        }
        else {
            osData = new ordemServico_entity_1.OrdemServico();
        }
        osData.ativo = true;
        osData.idTrabalho = trabalho.idTrabalho;
        osData.idEmpresa = trabalho.idEmpresa;
        osData.idUsuarioCadastro = currentUser.user.idUsuario;
        const statusConcluidos = [trabalho_entity_1.StatusTrabalho.ENVIADO, trabalho_entity_1.StatusTrabalho.ENVIADO_PROVA, trabalho_entity_1.StatusTrabalho.PAGAMENTO_RECEBIDO];
        if (statusConcluidos.includes(trabalho.status)) {
            osData.status = ordemServico_entity_1.StatusOrdemServico.RECEBER;
            osData.concluido = true;
            if (!osData.dataConcluido) {
                osData.dataConcluido = trabalho.dataConclusao || trabalho.dataHoraEnvio || new Date();
            }
        }
        else {
            osData.status = ordemServico_entity_1.StatusOrdemServico.PENDENTE;
            osData.concluido = false;
            osData.dataConcluido = null;
        }
        const itens = this.calculaItensOrdemServico(currentUser.user.idUsuario, trabalho, cadastroComplementar, tabelaPrecoProduto, osData.itens, trabalho.status);
        osData.itens = itens;
        const valorTotal = osData.itens
            .filter((item) => item.status !== ordemServicoItem_entity_1.StatusOrdemServicoItem.DEVOLVIDO)
            .reduce((total, item) => total + item.valorTotal, 0);
        osData.valorTotal = valorTotal;
        const osSalva = await this.ordemServicoService.cadastrar(currentUser, [osData]);
        const osSalvaCompleta = osSalva[0];
        if (emitirEvento && (osSalvaCompleta === null || osSalvaCompleta === void 0 ? void 0 : osSalvaCompleta.idFatura)) {
            this.eventEmitter.emit('fatura.recalcular', { idFatura: osSalvaCompleta.idFatura });
        }
    }
    async atualizarPrecosOrdemServicoEmLote(currentUser, idFatura, idsTrabalhos) {
        var _a, _b;
        if (idsTrabalhos.length === 0)
            return;
        const [trabalhos, ordensServico] = await Promise.all([
            this.trabalhoRepository.buscarProdutosPorIdsComRelacoes(idsTrabalhos),
            this.ordemServicoService.buscarPorIdTrabalhos(idsTrabalhos),
        ]);
        const trabalhoPorId = new Map();
        for (const t of trabalhos)
            trabalhoPorId.set(t.idTrabalho, t);
        const osPorTrabalho = new Map();
        for (const os of ordensServico)
            osPorTrabalho.set(os.idTrabalho, os);
        const tabelasPorEmpresa = new Map();
        const cadastrosComplementaresPorEmpresa = new Map();
        const empresasUnicas = [...new Set(trabalhos.map(t => t.idEmpresa))];
        const cadastrosPromises = empresasUnicas.map(idEmpresa => this.cadastroComplementarEmpresaService.buscarCadastroComplementarEmpresa(idEmpresa)
            .then(cadastro => ({ idEmpresa, cadastro })));
        const cadastrosResultados = await Promise.all(cadastrosPromises);
        cadastrosResultados.forEach(({ idEmpresa, cadastro }) => {
            if (cadastro)
                cadastrosComplementaresPorEmpresa.set(idEmpresa, cadastro);
        });
        const ordensToSave = [];
        for (const trabalho of trabalhos) {
            const idTrabalho = trabalho.idTrabalho;
            const osBase = (_a = osPorTrabalho.get(idTrabalho)) !== null && _a !== void 0 ? _a : null;
            const cadastroComplementar = cadastrosComplementaresPorEmpresa.get(trabalho.idEmpresa);
            const dataReferencia = trabalho.dataInclusao || new Date();
            const dataKey = dataReferencia.toISOString().slice(0, 10);
            if (!tabelasPorEmpresa.has(trabalho.idEmpresa)) {
                tabelasPorEmpresa.set(trabalho.idEmpresa, new Map());
            }
            const cacheEmpresa = tabelasPorEmpresa.get(trabalho.idEmpresa);
            let tabelaVigenteAssociacao;
            if (cacheEmpresa.has(dataKey)) {
                tabelaVigenteAssociacao = cacheEmpresa.get(dataKey);
            }
            else {
                tabelaVigenteAssociacao = await this.empresaTabelaPrecoService.buscarTabelaPrecoVigentePorEmpresa(trabalho.idEmpresa, dataReferencia);
                if (!tabelaVigenteAssociacao && (cadastroComplementar === null || cadastroComplementar === void 0 ? void 0 : cadastroComplementar.idTabelaPrecoProduto)) {
                    tabelaVigenteAssociacao = await this.tabelaPrecoProdutoService.buscarTabelaPrecoVigentePorMatriz(cadastroComplementar.idTabelaPrecoProduto, dataReferencia);
                }
                if (!tabelaVigenteAssociacao && (cadastroComplementar === null || cadastroComplementar === void 0 ? void 0 : cadastroComplementar.idTabelaPrecoProduto)) {
                    tabelaVigenteAssociacao = await this.tabelaPrecoProdutoService.buscaTabelaPrecoProdutosPorId(cadastroComplementar.idTabelaPrecoProduto);
                }
                cacheEmpresa.set(dataKey, tabelaVigenteAssociacao);
            }
            let tabelaPrecoProduto = null;
            if (trabalho.idTabelaPrecoProduto) {
                const tabelaDoTrabalho = await this.tabelaPrecoProdutoService.buscaTabelaPrecoProdutosPorId(trabalho.idTabelaPrecoProduto);
                const mesmaTabela = tabelaVigenteAssociacao &&
                    tabelaDoTrabalho &&
                    tabelaDoTrabalho.idTabelaPrecoProduto === tabelaVigenteAssociacao.idTabelaPrecoProduto;
                if (mesmaTabela) {
                    tabelaPrecoProduto = tabelaDoTrabalho;
                    this.logger.log(`[Fatura ${idFatura} - Trabalho ${idTrabalho}] Conferência OK: tabela do trabalho (ID ${trabalho.idTabelaPrecoProduto}) é a mesma da associação; usando para cálculo.`);
                }
                else if (tabelaVigenteAssociacao) {
                    tabelaPrecoProduto = tabelaVigenteAssociacao;
                    this.logger.log(`[Fatura ${idFatura} - Trabalho ${idTrabalho}] Conferência: tabela do trabalho (ID ${trabalho.idTabelaPrecoProduto}) difere da vigente (ID ${tabelaVigenteAssociacao.idTabelaPrecoProduto}); usando tabela da associação empresa-tabela para cálculo.`);
                }
                else {
                    tabelaPrecoProduto = tabelaDoTrabalho !== null && tabelaDoTrabalho !== void 0 ? tabelaDoTrabalho : null;
                    if (tabelaPrecoProduto) {
                        this.logger.log(`[Fatura ${idFatura} - Trabalho ${idTrabalho}] Sem associação vigente; usando tabela do trabalho: ID ${trabalho.idTabelaPrecoProduto}`);
                    }
                }
            }
            else {
                tabelaPrecoProduto = tabelaVigenteAssociacao;
                if (tabelaPrecoProduto) {
                    this.logger.log(`[Fatura ${idFatura} - Trabalho ${idTrabalho}] Tabela vigente (associação empresa-tabela): ID ${tabelaPrecoProduto.idTabelaPrecoProduto}, Nome: "${tabelaPrecoProduto.nome}"`);
                }
            }
            if (!tabelaPrecoProduto) {
                this.logger.warn(`Tabela de preço não encontrada para trabalho ${idTrabalho} na fatura ${idFatura}; ignorando.`);
                continue;
            }
            const mesmaQueTrabalho = trabalho.idTabelaPrecoProduto && tabelaPrecoProduto.idTabelaPrecoProduto === trabalho.idTabelaPrecoProduto;
            const tipoTabela = mesmaQueTrabalho ? 'histórica (do trabalho - conferência OK)' : 'vigente (associação empresa-tabela)';
            const versaoInfo = tabelaPrecoProduto.numeroVersao ? `, Versão: ${tabelaPrecoProduto.numeroVersao}` : '';
            const origemInfo = tabelaPrecoProduto.idTabelaPrecoProdutoOrigem ? ` (versão da matriz ${tabelaPrecoProduto.idTabelaPrecoProdutoOrigem})` : ' (matriz)';
            this.logger.log(`[Cálculo Preço - Fatura ${idFatura} - Trabalho ${idTrabalho}] ` +
                `Tabela utilizada: ID ${tabelaPrecoProduto.idTabelaPrecoProduto}, ` +
                `Nome: "${tabelaPrecoProduto.nome}"${versaoInfo}${origemInfo}, ` +
                `Tipo: ${tipoTabela}, ` +
                `Empresa: ${trabalho.idEmpresa}, ` +
                `Data referência: ${(trabalho.dataInclusao || new Date()).toISOString()}`);
            let osData;
            if (osBase) {
                osData = osBase;
            }
            else {
                osData = new ordemServico_entity_1.OrdemServico();
            }
            osData.ativo = true;
            osData.idTrabalho = trabalho.idTrabalho;
            osData.idEmpresa = trabalho.idEmpresa;
            osData.idUsuarioCadastro = currentUser.user.idUsuario;
            const statusConcluidos = [trabalho_entity_1.StatusTrabalho.ENVIADO, trabalho_entity_1.StatusTrabalho.ENVIADO_PROVA, trabalho_entity_1.StatusTrabalho.PAGAMENTO_RECEBIDO];
            if (statusConcluidos.includes(trabalho.status)) {
                osData.status = ordemServico_entity_1.StatusOrdemServico.RECEBER;
                osData.concluido = true;
                if (!osData.dataConcluido) {
                    osData.dataConcluido = trabalho.dataConclusao || trabalho.dataHoraEnvio || new Date();
                }
            }
            else {
                osData.status = ordemServico_entity_1.StatusOrdemServico.PENDENTE;
                osData.concluido = false;
                osData.dataConcluido = null;
            }
            const itens = this.calculaItensOrdemServico(currentUser.user.idUsuario, trabalho, cadastroComplementar, tabelaPrecoProduto, (_b = osData.itens) !== null && _b !== void 0 ? _b : [], trabalho.status);
            osData.itens = itens;
            osData.valorTotal = itens
                .filter((item) => item.status !== ordemServicoItem_entity_1.StatusOrdemServicoItem.DEVOLVIDO)
                .reduce((total, item) => total + item.valorTotal, 0);
            ordensToSave.push(osData);
        }
        if (ordensToSave.length > 0) {
            await this.ordemServicoService.cadastrar(currentUser, ordensToSave);
        }
    }
    async atualizaOrdemServico(currentUser, idTrabalho) {
        await this.atualizarPrecosOrdemServico(currentUser, idTrabalho, true);
    }
    calculaItensOrdemServico(idUsuarioCadastro, trabalho, cadastroComplementar, tabelaPrecoProduto, itensBase, statusTrabalho) {
        let itens = [];
        const componentes = trabalho.componentes;
        const itensComponentes = this.calculaComponentes(idUsuarioCadastro, trabalho.retrabalho, !!(cadastroComplementar === null || cadastroComplementar === void 0 ? void 0 : cadastroComplementar.utilizaInterfaces), componentes, itensBase);
        itens = itens.concat(itensComponentes);
        const elementos = trabalho.servicos.reduce((previous, current) => {
            current.elementos;
            return previous.concat(current.elementos);
        }, []);
        const semCobrancaServico = !!trabalho.retrabalho || !!trabalho.bonificacao;
        const itensServicos = this.calculaServicos(idUsuarioCadastro, semCobrancaServico, trabalho.servicos, tabelaPrecoProduto, itensBase, statusTrabalho);
        itens = itens.concat(itensServicos);
        itens = itens.filter(item => item !== null);
        const itensDevolvidos = (itensBase !== null && itensBase !== void 0 ? itensBase : []).filter((item) => item.status === ordemServicoItem_entity_1.StatusOrdemServicoItem.DEVOLVIDO);
        for (const devolvido of itensDevolvidos) {
            const jaIncluso = itens.some((item) => item.idOrdemServicoItem === devolvido.idOrdemServicoItem);
            if (!jaIncluso) {
                itens.push(devolvido);
            }
        }
        return itens;
    }
    calculaComponentes(idUsuarioCadastro, retrabalho, utilizaInterfaces, componentesTrabalho, itensBase) {
        return (componentesTrabalho !== null && componentesTrabalho !== void 0 ? componentesTrabalho : []).map(componenteTrabalho => {
            let item;
            if (itensBase === null || itensBase === void 0 ? void 0 : itensBase.length) {
                const itemFiltrado = itensBase.filter((i) => componenteTrabalho.componente.idComponente === i.idReferencia && i.tipoCobranca === ordemServicoItem_entity_1.TipoCobranca.COMPONENTE);
                item = itemFiltrado.length ? itemFiltrado[0] : undefined;
            }
            if ((item === null || item === void 0 ? void 0 : item.status) === ordemServicoItem_entity_1.StatusOrdemServicoItem.DEVOLVIDO)
                return null;
            const componenteJaDevolvido = (itensBase !== null && itensBase !== void 0 ? itensBase : []).some((i) => i.tipoCobranca === ordemServicoItem_entity_1.TipoCobranca.COMPONENTE &&
                i.idReferencia === componenteTrabalho.componente.idComponente &&
                i.status === ordemServicoItem_entity_1.StatusOrdemServicoItem.DEVOLVIDO);
            if (componenteJaDevolvido)
                return null;
            const nomesIgnorados = ['SEM COMPONENTE', 'INDEFINIDO'];
            if (nomesIgnorados.includes(componenteTrabalho.componente.nome))
                return null;
            const valorTotal = componenteTrabalho.componente.preco * componenteTrabalho.qtdItems;
            return this.criarItemOrdemServico(ordemServicoItem_entity_1.TipoCobranca.COMPONENTE, item, idUsuarioCadastro, componenteTrabalho.componente.nome, componenteTrabalho.componente.preco, componenteTrabalho.qtdItems, componenteTrabalho.componente.idComponente, null, null);
        });
    }
    calculaServicos(idUsuarioCadastro, retrabalho, servicos, tabelaPrecoProduto, itensBase, statusTrabalho) {
        if (!(servicos === null || servicos === void 0 ? void 0 : servicos.length))
            return [];
        return servicos.map(servico => {
            var _a, _b, _c, _d, _e;
            const { idProduto, elementos } = servico;
            const precoProdutoArray = (_b = (_a = tabelaPrecoProduto.precoProduto) === null || _a === void 0 ? void 0 : _a.filter(p => p.idProduto === idProduto)) !== null && _b !== void 0 ? _b : [];
            if (!precoProdutoArray.length) {
                this.logger.warn(`Preço para produto ID ${idProduto} não encontrado na tabela ${tabelaPrecoProduto.idTabelaPrecoProduto}.`);
                return null;
            }
            const precoProduto = precoProdutoArray[0];
            let item;
            if (itensBase === null || itensBase === void 0 ? void 0 : itensBase.length) {
                const itemFiltrado = itensBase.filter(i => i.idReferencia === idProduto && i.tipoCobranca === ordemServicoItem_entity_1.TipoCobranca.SERVICO);
                item = itemFiltrado.length ? itemFiltrado[0] : undefined;
            }
            const quantidade = (_c = elementos === null || elementos === void 0 ? void 0 : elementos.length) !== null && _c !== void 0 ? _c : 0;
            const valorUnitario = (retrabalho || statusTrabalho === trabalho_entity_1.StatusTrabalho.ENVIADO_PROVA) ? 0 : Number(precoProduto.preco);
            const valorTotal = valorUnitario * quantidade;
            return this.criarItemOrdemServico(ordemServicoItem_entity_1.TipoCobranca.SERVICO, item, idUsuarioCadastro, (_e = (_d = precoProduto.produto) === null || _d === void 0 ? void 0 : _d.nome) !== null && _e !== void 0 ? _e : '', valorUnitario, quantidade, idProduto, null, null);
        }).filter(Boolean);
    }
    criarItemOrdemServico(tipoCobranca, item, idUsuarioCadastro, descricao, valor, quantidade, idReferencia, idProfissional, idPaciente) {
        if (!item) {
            item = new ordemServicoItem_entity_1.OrdemServicoItem();
        }
        const quantidadeDevolvidaExistente = item.quantidadeDevolvida || 0;
        const statusExistente = item.status;
        if (statusExistente === ordemServicoItem_entity_1.StatusOrdemServicoItem.DEVOLVIDO) {
            item.valor = 0;
            item.valorTotal = 0;
            item.quantidadeDevolvida = quantidadeDevolvidaExistente;
            item.status = statusExistente;
            return item;
        }
        item.descricao = descricao;
        item.valor = valor;
        item.quantidade = quantidade;
        item.valorTotal = valor * (quantidade - quantidadeDevolvidaExistente);
        item.idUsuarioCadastro = idUsuarioCadastro;
        item.idReferencia = idReferencia;
        item.tipoCobranca = tipoCobranca;
        item.idProfissional = idProfissional;
        item.idPaciente = idPaciente;
        if (quantidadeDevolvidaExistente > 0) {
            item.quantidadeDevolvida = quantidadeDevolvidaExistente;
        }
        if (statusExistente) {
            item.status = statusExistente;
        }
        return item;
    }
    async zerarOrdemServicoCancelado(idTrabalho) {
        const ordemServico = await this.ordemServicoService.buscarPorIdTrabalho(idTrabalho);
        if (!ordemServico) {
            this.logger.log(`Ordem de Serviço não encontrada para o trabalho ${idTrabalho}.`);
            return;
        }
        const itens = await this.osItemRepository.find({
            where: { idOrdemServico: ordemServico.idOrdemServico }
        });
        let itensZerados = 0;
        if (itens && itens.length > 0) {
            for (const item of itens) {
                item.valor = 0;
                item.valorTotal = 0;
                await this.osItemRepository.save(item);
                itensZerados++;
            }
            this.logger.log(`Zerados ${itensZerados} itens (serviços e componentes) da OS ${ordemServico.idOrdemServico}.`);
        }
        ordemServico.valorTotal = 0;
        await this.ordemServicoService.cadastrar({ user: { idUsuario: ordemServico.idUsuarioCadastro } }, [ordemServico]);
        this.logger.log(`OS ${ordemServico.idOrdemServico} zerada. Valor total: 0`);
        if (ordemServico.idFatura) {
            this.eventEmitter.emit('fatura.recalcular', { idFatura: ordemServico.idFatura });
            this.logger.log(`Fatura ${ordemServico.idFatura} será recalculada.`);
        }
    }
    validarComponentesDtoIndefinidosProibidosNoStatus(status, componentesDto) {
        if (!(componentesDto === null || componentesDto === void 0 ? void 0 : componentesDto.length)) {
            return;
        }
        if (!this.statusExigeComponentesDefinidos(status)) {
            return;
        }
        if (componentesDto.some((c) => this.componenteDtoEhIndefinido(c))) {
            throw new common_1.HttpException('Não é possível adicionar componente indefinido com o trabalho neste status. Selecione um componente válido do catálogo.', common_1.HttpStatus.UNPROCESSABLE_ENTITY);
        }
    }
    componenteDtoEhIndefinido(c) {
        var _a;
        const idNum = c.idComponente != null ? Number(c.idComponente) : NaN;
        const idOk = Number.isFinite(idNum) && idNum > 0;
        const nome = String((_a = c.nome) !== null && _a !== void 0 ? _a : '').trim();
        const nomeIndefinido = !nome || nome.toLowerCase() === 'indefinido';
        return !idOk || nomeIndefinido;
    }
    statusExigeComponentesDefinidos(status) {
        return [
            trabalho_entity_1.StatusTrabalho.AGUARDANDO_COMPONENTE,
            trabalho_entity_1.StatusTrabalho.PACOTE,
            trabalho_entity_1.StatusTrabalho.AGUARDANDO_COLETA,
            trabalho_entity_1.StatusTrabalho.ENVIADO,
            trabalho_entity_1.StatusTrabalho.ENVIADO_PROVA,
            trabalho_entity_1.StatusTrabalho.PAGAMENTO_RECEBIDO,
        ].includes(status);
    }
    temComponenteIndefinidoNoTrabalho(trabalho) {
        var _a, _b, _c;
        const lista = (_b = (_a = trabalho.componentes) === null || _a === void 0 ? void 0 : _a.filter((ct) => ct.dataExclusao == null)) !== null && _b !== void 0 ? _b : [];
        if (!lista.length) {
            return false;
        }
        for (const ct of lista) {
            const idNum = Number(ct.idComponente);
            const idFkOk = Number.isFinite(idNum) && idNum > 0;
            const comp = ct.componente;
            if (!idFkOk || comp == null) {
                return true;
            }
            const nome = String((_c = comp.nome) !== null && _c !== void 0 ? _c : '').trim();
            const nomeIndefinido = !nome || nome.toLowerCase() === 'indefinido';
            if (nomeIndefinido) {
                return true;
            }
        }
        return false;
    }
    async buscarDashboardStatus(dataInicio, dataFim) {
        const trabalhos = await this.trabalhoRepository.buscarTrabalhosDashboard(dataInicio, dataFim);
        const totalTrabalhos = trabalhos.length;
        let totalRetrabalhos = 0;
        let totalBonificacoes = 0;
        const statusGeral = {};
        const trabalhosPorData = {};
        const motivosGeraisRetrabalho = {};
        const motivosGeraisBonificacao = {};
        const clinicasMap = new Map();
        for (const t of trabalhos) {
            statusGeral[t.status] = (statusGeral[t.status] || 0) + 1;
            const dataIncStr = t.dataInclusao ? new Date(t.dataInclusao).toISOString().split('T')[0] : 'N/A';
            if (!trabalhosPorData[dataIncStr])
                trabalhosPorData[dataIncStr] = { total: 0, retrabalho: 0, bonificacao: 0 };
            trabalhosPorData[dataIncStr].total++;
            const isRetrabalho = !!t.retrabalho;
            const isBonificacao = !!t.bonificacao;
            const temMotivos = t.trabalhoMotivos && t.trabalhoMotivos.length > 0;
            const isRetrabalhoEfetivo = isRetrabalho || (temMotivos && !isBonificacao);
            if (isRetrabalhoEfetivo) {
                totalRetrabalhos++;
                trabalhosPorData[dataIncStr].retrabalho++;
            }
            if (isBonificacao) {
                totalBonificacoes++;
                trabalhosPorData[dataIncStr].bonificacao++;
            }
            if (!clinicasMap.has(t.idEmpresa)) {
                clinicasMap.set(t.idEmpresa, {
                    idEmpresa: t.idEmpresa,
                    nomeEmpresa: t.nomeEmpresa || (t.empresa ? t.empresa.nome : 'Sem Empresa'),
                    totalTrabalhos: 0,
                    totalRetrabalhos: 0,
                    totalBonificacoes: 0,
                    motivosRetrabalho: {},
                    motivosBonificacao: {},
                });
            }
            const clinicaData = clinicasMap.get(t.idEmpresa);
            clinicaData.totalTrabalhos++;
            if (isRetrabalhoEfetivo) {
                clinicaData.totalRetrabalhos++;
                if (t.trabalhoMotivos) {
                    for (const tm of t.trabalhoMotivos) {
                        const motivoNome = tm.motivo ? tm.motivo.nome : 'Motivo Desconhecido';
                        motivosGeraisRetrabalho[motivoNome] = (motivosGeraisRetrabalho[motivoNome] || 0) + 1;
                        clinicaData.motivosRetrabalho[motivoNome] = (clinicaData.motivosRetrabalho[motivoNome] || 0) + 1;
                    }
                }
            }
            if (isBonificacao) {
                clinicaData.totalBonificacoes++;
                if (t.trabalhoMotivos) {
                    for (const tm of t.trabalhoMotivos) {
                        const motivoNome = tm.motivo ? tm.motivo.nome : 'Motivo Desconhecido';
                        motivosGeraisBonificacao[motivoNome] = (motivosGeraisBonificacao[motivoNome] || 0) + 1;
                        clinicaData.motivosBonificacao[motivoNome] = (clinicaData.motivosBonificacao[motivoNome] || 0) + 1;
                    }
                }
            }
        }
        const toMotivosArray = (obj) => Object.entries(obj).map(([nome, count]) => ({ nome, count })).sort((a, b) => b.count - a.count);
        const clinicas = Array.from(clinicasMap.values()).map(c => (Object.assign(Object.assign({}, c), { motivosRetrabalhoArray: toMotivosArray(c.motivosRetrabalho), motivosBonificacaoArray: toMotivosArray(c.motivosBonificacao), motivosArray: toMotivosArray(c.motivosRetrabalho) }))).sort((a, b) => b.totalRetrabalhos - a.totalRetrabalhos);
        return {
            totalTrabalhos,
            totalRetrabalhos,
            totalBonificacoes,
            statusGeral,
            trabalhosPorData,
            motivosGeraisRetrabalho: toMotivosArray(motivosGeraisRetrabalho),
            motivosGeraisBonificacao: toMotivosArray(motivosGeraisBonificacao),
            motivosGerais: toMotivosArray(motivosGeraisRetrabalho),
            clinicas,
        };
    }
};
exports.TrabalhoService = TrabalhoService;
__decorate([
    (0, event_emitter_1.OnEvent)('preco.changed'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TrabalhoService.prototype, "recalcularValorTrabalhosEnviados", null);
exports.TrabalhoService = TrabalhoService = TrabalhoService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(15, (0, typeorm_1.InjectRepository)(ordemServicoItem_entity_1.OrdemServicoItem)),
    __param(16, (0, typeorm_1.InjectRepository)(trabalhoMotivo_entity_1.TrabalhoMotivo)),
    __param(17, (0, typeorm_1.InjectRepository)(motivo_entity_1.Motivo)),
    __metadata("design:paramtypes", [trabalho_repository_1.TrabalhoRepository,
        componentesTrabalho_service_1.ComponentesTrabalhoService,
        historicoStatusTrabalho_service_1.HistoricoStatusTrabalhoService,
        cadastroComplementarEmpresa_service_1.CadastroComplementarEmpresaService,
        tabelaPrecoProduto_service_1.TabelaPrecoProdutoService,
        empresaTabelaPreco_service_1.EmpresaTabelaPrecoService,
        ordemServico_service_1.OrdemServicoService,
        event_emitter_1.EventEmitter2,
        estoque_service_1.EstoqueService,
        common_1.Logger,
        transferencia_service_1.TransferenciaService,
        almoxarifado_service_1.AlmoxarifadoService,
        paciente_service_1.PacienteService,
        fatura_service_1.FaturaService,
        devolucao_componente_service_1.DevolucaoComponenteService,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], TrabalhoService);
//# sourceMappingURL=trabalho.service.js.map
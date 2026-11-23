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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CombustivelService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const veiculo_entity_1 = require("../domain/veiculo.entity");
const abastecimento_entity_1 = require("../domain/abastecimento.entity");
const configuracao_km_entity_1 = require("../domain/configuracao-km.entity");
const pagamento_km_entity_1 = require("../domain/pagamento-km.entity");
const financeiro_service_1 = require("./financeiro.service");
const tipo_lancamento_enum_1 = require("../domain/tipo-lancamento.enum");
const parcela_entity_1 = require("../domain/parcela.entity");
let CombustivelService = class CombustivelService {
    constructor(veiculoRepository, abastecimentoRepository, configuracaoKmRepository, pagamentoKmRepository, financeiroService) {
        this.veiculoRepository = veiculoRepository;
        this.abastecimentoRepository = abastecimentoRepository;
        this.configuracaoKmRepository = configuracaoKmRepository;
        this.pagamentoKmRepository = pagamentoKmRepository;
        this.financeiroService = financeiroService;
    }
    async criarVeiculo(dto) {
        const veiculo = this.veiculoRepository.create(dto);
        return this.veiculoRepository.save(veiculo);
    }
    async listarVeiculos() {
        const where = { ativo: true };
        return this.veiculoRepository.find({ where, order: { nome: 'ASC' } });
    }
    async buscarVeiculoPorId(idVeiculo) {
        const veiculo = await this.veiculoRepository.findOneBy({ idVeiculo });
        if (!veiculo) {
            throw new common_1.NotFoundException(`Veículo com ID ${idVeiculo} não encontrado.`);
        }
        return veiculo;
    }
    async atualizarVeiculo(idVeiculo, dto) {
        const veiculo = await this.buscarVeiculoPorId(idVeiculo);
        Object.assign(veiculo, dto);
        return this.veiculoRepository.save(veiculo);
    }
    async excluirVeiculo(idVeiculo) {
        const veiculo = await this.buscarVeiculoPorId(idVeiculo);
        veiculo.ativo = false;
        await this.veiculoRepository.save(veiculo);
    }
    async registrarAbastecimento(dto) {
        const veiculo = await this.buscarVeiculoPorId(dto.idVeiculo);
        const valorTotal = dto.litros * dto.valorLitro;
        const abastecimento = this.abastecimentoRepository.create({
            idVeiculo: dto.idVeiculo,
            idLancamento: null,
            dataAbastecimento: new Date(dto.dataAbastecimento),
            litros: dto.litros,
            valorLitro: dto.valorLitro,
            valorTotal,
            quilometragem: dto.quilometragem,
            local: dto.local,
            observacoes: dto.observacoes,
        });
        return this.abastecimentoRepository.save(abastecimento);
    }
    async listarAbastecimentos(idVeiculo, dataInicio, dataFim) {
        const queryBuilder = this.abastecimentoRepository
            .createQueryBuilder('abastecimento')
            .leftJoinAndSelect('abastecimento.veiculo', 'veiculo')
            .orderBy('abastecimento.dataAbastecimento', 'DESC');
        if (idVeiculo) {
            queryBuilder.where('abastecimento.idVeiculo = :idVeiculo', { idVeiculo });
        }
        if (dataInicio) {
            queryBuilder.andWhere('abastecimento.dataAbastecimento >= :dataInicio', { dataInicio });
        }
        if (dataFim) {
            queryBuilder.andWhere('abastecimento.dataAbastecimento <= :dataFim', { dataFim });
        }
        return queryBuilder.getMany();
    }
    async calcularConsumo(idVeiculo, dataInicio, dataFim) {
        const abastecimentos = await this.listarAbastecimentos(idVeiculo, dataInicio, dataFim);
        if (abastecimentos.length < 2) {
            return {
                consumoMedio: 0,
                totalLitros: 0,
                totalGasto: 0,
            };
        }
        const totalLitros = abastecimentos.reduce((acc, a) => acc + Number(a.litros), 0);
        const totalGasto = abastecimentos.reduce((acc, a) => acc + Number(a.valorTotal), 0);
        const abastecimentosComKm = abastecimentos.filter((a) => a.quilometragem);
        if (abastecimentosComKm.length >= 2) {
            const kmInicial = abastecimentosComKm[abastecimentosComKm.length - 1].quilometragem || 0;
            const kmFinal = abastecimentosComKm[0].quilometragem || 0;
            const totalKm = kmFinal - kmInicial;
            const consumoMedio = totalKm > 0 ? totalKm / totalLitros : 0;
            return {
                consumoMedio: Math.round(consumoMedio * 100) / 100,
                totalLitros,
                totalGasto,
                totalKm,
            };
        }
        return {
            consumoMedio: 0,
            totalLitros,
            totalGasto,
        };
    }
    async obterConfiguracaoKm() {
        const configs = await this.configuracaoKmRepository.find({
            order: { dataAlteracao: 'DESC' },
            take: 1,
        });
        return configs.length > 0 ? configs[0] : null;
    }
    async atualizarConfiguracaoKm(dto) {
        let config = await this.obterConfiguracaoKm();
        if (!config) {
            config = this.configuracaoKmRepository.create({
                valorPorKm: dto.valorPorKm,
            });
        }
        else {
            config.valorPorKm = dto.valorPorKm;
        }
        return this.configuracaoKmRepository.save(config);
    }
    async registrarPagamentoKm(dto) {
        const config = await this.obterConfiguracaoKm();
        if (!config) {
            throw new common_1.BadRequestException('Configuração de valor por KM não encontrada. Configure o valor por KM antes de registrar pagamentos.');
        }
        const valorPorKm = Number(config.valorPorKm);
        const quantidadeKm = Number(dto.quantidadeKm);
        const valorTotal = valorPorKm * quantidadeKm;
        const dataCompetencia = new Date(dto.dataPagamento);
        const dataVencimento = new Date(dto.dataPagamento);
        const lancamento = await this.financeiroService.criarLancamento({
            descricao: `Pagamento por KM rodado - ${dto.nomePessoa} (${quantidadeKm} km)`,
            tipo: tipo_lancamento_enum_1.TipoLancamento.DESPESA,
            valorTotal,
            dataCompetencia: dataCompetencia.toISOString().split('T')[0],
            idCategoria: dto.idCategoria,
            parcelas: [
                {
                    numeroParcela: 1,
                    valor: valorTotal,
                    dataVencimento: dataVencimento.toISOString().split('T')[0],
                    meioPagamento: dto.meioPagamento || parcela_entity_1.MeioPagamento.DINHEIRO,
                },
            ],
            pagamentoImediato: dto.idConta
                ? {
                    idConta: dto.idConta,
                    dataPagamento: dto.dataPagamento,
                }
                : undefined,
        });
        const pagamentoKm = this.pagamentoKmRepository.create({
            nomePessoa: dto.nomePessoa,
            quantidadeKm: quantidadeKm,
            valorPorKm: valorPorKm,
            valorTotal,
            dataPagamento: new Date(dto.dataPagamento),
            idLancamento: lancamento.idLancamento,
            observacoes: dto.observacoes,
        });
        return this.pagamentoKmRepository.save(pagamentoKm);
    }
    async listarPagamentosKm(dataInicio, dataFim) {
        const queryBuilder = this.pagamentoKmRepository
            .createQueryBuilder('pagamentoKm')
            .orderBy('pagamentoKm.dataPagamento', 'DESC');
        if (dataInicio) {
            queryBuilder.andWhere('pagamentoKm.dataPagamento >= :dataInicio', { dataInicio });
        }
        if (dataFim) {
            queryBuilder.andWhere('pagamentoKm.dataPagamento <= :dataFim', { dataFim });
        }
        return queryBuilder.getMany();
    }
    async buscarPagamentoKmPorId(idPagamentoKm) {
        const pagamento = await this.pagamentoKmRepository.findOneBy({ idPagamentoKm });
        if (!pagamento) {
            throw new common_1.NotFoundException(`Pagamento de KM com ID ${idPagamentoKm} não encontrado.`);
        }
        return pagamento;
    }
};
exports.CombustivelService = CombustivelService;
exports.CombustivelService = CombustivelService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(veiculo_entity_1.Veiculo)),
    __param(1, (0, typeorm_1.InjectRepository)(abastecimento_entity_1.Abastecimento)),
    __param(2, (0, typeorm_1.InjectRepository)(configuracao_km_entity_1.ConfiguracaoKm)),
    __param(3, (0, typeorm_1.InjectRepository)(pagamento_km_entity_1.PagamentoKm)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        financeiro_service_1.FinanceiroService])
], CombustivelService);
//# sourceMappingURL=combustivel.service.js.map
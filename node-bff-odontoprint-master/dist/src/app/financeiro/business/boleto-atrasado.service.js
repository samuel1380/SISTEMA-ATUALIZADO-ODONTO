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
var BoletoAtrasadoService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BoletoAtrasadoService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const schedule_1 = require("@nestjs/schedule");
const parcela_entity_1 = require("../domain/parcela.entity");
const lancamento_entity_1 = require("../domain/lancamento.entity");
const tipo_lancamento_enum_1 = require("../domain/tipo-lancamento.enum");
let BoletoAtrasadoService = BoletoAtrasadoService_1 = class BoletoAtrasadoService {
    constructor(parcelaRepository, lancamentoRepository) {
        this.parcelaRepository = parcelaRepository;
        this.lancamentoRepository = lancamentoRepository;
        this.logger = new common_1.Logger(BoletoAtrasadoService_1.name);
    }
    async listarBoletosAtrasados(idEmpresa, tipo) {
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        const queryBuilder = this.parcelaRepository
            .createQueryBuilder('parcela')
            .innerJoinAndSelect('parcela.lancamento', 'lancamento')
            .leftJoinAndSelect('lancamento.clienteEmpresa', 'clienteEmpresa')
            .leftJoinAndSelect('lancamento.fornecedor', 'fornecedor')
            .where('parcela.status IN (:...statuses)', {
            statuses: [parcela_entity_1.StatusParcela.ABERTO, parcela_entity_1.StatusParcela.VENCIDO],
        })
            .andWhere('parcela.dataVencimento < :hoje', { hoje })
            .andWhere('parcela.valorPago < parcela.valor');
        if (idEmpresa) {
            queryBuilder.andWhere('lancamento.idClienteFornecedor = :idEmpresa', { idEmpresa });
        }
        if (tipo) {
            queryBuilder.andWhere('lancamento.tipo = :tipo', { tipo });
        }
        const parcelas = await queryBuilder.getMany();
        return parcelas.map((parcela) => {
            var _a, _b, _c;
            const diasAtraso = this.calcularDiasAtraso(parcela.dataVencimento);
            const valorRestante = Number(parcela.valor) - Number(parcela.valorPago);
            const { juros, multa } = this.calcularJurosMulta(parcela, diasAtraso);
            const valorTotalComJuros = valorRestante + juros + multa;
            return {
                idParcela: parcela.idParcela,
                idLancamento: parcela.idLancamento,
                descricao: parcela.lancamento.descricao,
                tipo: parcela.lancamento.tipo,
                valor: Number(parcela.valor),
                valorPago: Number(parcela.valorPago),
                valorRestante,
                dataVencimento: parcela.dataVencimento,
                diasAtraso,
                numeroBoleto: parcela.numeroBoleto,
                codigoBarras: parcela.codigoBarras,
                juros,
                multa,
                valorTotalComJuros,
                gerarJuros: parcela.gerarJuros !== false,
                nomeEmpresa: parcela.lancamento.tipo === tipo_lancamento_enum_1.TipoLancamento.RECEITA
                    ? (_a = parcela.lancamento.clienteEmpresa) === null || _a === void 0 ? void 0 : _a.nome
                    : (((_b = parcela.lancamento.fornecedor) === null || _b === void 0 ? void 0 : _b.nomeFantasia) || ((_c = parcela.lancamento.fornecedor) === null || _c === void 0 ? void 0 : _c.razaoSocial)),
            };
        });
    }
    calcularDiasAtraso(dataVencimento) {
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        const vencimento = new Date(dataVencimento);
        vencimento.setHours(0, 0, 0, 0);
        const diffTime = hoje.getTime() - vencimento.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        return Math.max(0, diffDays);
    }
    calcularJurosMulta(parcela, diasAtraso) {
        if (diasAtraso <= 0) {
            return { juros: 0, multa: 0 };
        }
        if (parcela.gerarJuros === false) {
            return { juros: 0, multa: 0 };
        }
        const valorRestante = Number(parcela.valor) - Number(parcela.valorPago);
        const multaPercentual = 0.01;
        const jurosDiarioPercentual = 0.00033;
        const multa = valorRestante * multaPercentual;
        const juros = valorRestante * jurosDiarioPercentual * diasAtraso;
        return {
            juros: Math.round(juros * 100) / 100,
            multa: Math.round(multa * 100) / 100,
        };
    }
    async atualizarStatusVencidos() {
        this.logger.log('Iniciando atualização de status de parcelas vencidas...');
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        const parcelasVencidas = await this.parcelaRepository.find({
            where: {
                status: parcela_entity_1.StatusParcela.ABERTO,
                dataVencimento: (0, typeorm_2.LessThan)(hoje),
            },
        });
        let atualizadas = 0;
        for (const parcela of parcelasVencidas) {
            parcela.status = parcela_entity_1.StatusParcela.VENCIDO;
            await this.parcelaRepository.save(parcela);
            atualizadas++;
        }
        this.logger.log(`Atualização concluída. ${atualizadas} parcela(s) marcada(s) como vencida(s).`);
    }
    async obterResumoBoleto(idParcela) {
        var _a, _b, _c;
        const parcela = await this.parcelaRepository.findOne({
            where: { idParcela },
            relations: ['lancamento', 'lancamento.clienteEmpresa', 'lancamento.fornecedor'],
        });
        if (!parcela) {
            throw new Error(`Parcela com ID ${idParcela} não encontrada.`);
        }
        const diasAtraso = this.calcularDiasAtraso(parcela.dataVencimento);
        const valorRestante = Number(parcela.valor) - Number(parcela.valorPago);
        const { juros, multa } = this.calcularJurosMulta(parcela, diasAtraso);
        const valorTotalComJuros = valorRestante + juros + multa;
        return {
            idParcela: parcela.idParcela,
            idLancamento: parcela.idLancamento,
            descricao: parcela.lancamento.descricao,
            tipo: parcela.lancamento.tipo,
            valor: Number(parcela.valor),
            valorPago: Number(parcela.valorPago),
            valorRestante,
            dataVencimento: parcela.dataVencimento,
            diasAtraso,
            numeroBoleto: parcela.numeroBoleto,
            codigoBarras: parcela.codigoBarras,
            juros,
            multa,
            valorTotalComJuros,
            gerarJuros: parcela.gerarJuros !== false,
            nomeEmpresa: parcela.lancamento.tipo === tipo_lancamento_enum_1.TipoLancamento.RECEITA
                ? (_a = parcela.lancamento.clienteEmpresa) === null || _a === void 0 ? void 0 : _a.nome
                : (((_b = parcela.lancamento.fornecedor) === null || _b === void 0 ? void 0 : _b.nomeFantasia) || ((_c = parcela.lancamento.fornecedor) === null || _c === void 0 ? void 0 : _c.razaoSocial)),
        };
    }
};
exports.BoletoAtrasadoService = BoletoAtrasadoService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_MIDNIGHT),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BoletoAtrasadoService.prototype, "atualizarStatusVencidos", null);
exports.BoletoAtrasadoService = BoletoAtrasadoService = BoletoAtrasadoService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(parcela_entity_1.Parcela)),
    __param(1, (0, typeorm_1.InjectRepository)(lancamento_entity_1.Lancamento)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], BoletoAtrasadoService);
//# sourceMappingURL=boleto-atrasado.service.js.map
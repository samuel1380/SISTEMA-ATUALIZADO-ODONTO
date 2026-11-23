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
exports.RetiradaService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const retirada_entity_1 = require("../domain/retirada.entity");
const financeiro_service_1 = require("./financeiro.service");
const tipo_lancamento_enum_1 = require("../domain/tipo-lancamento.enum");
const parcela_entity_1 = require("../domain/parcela.entity");
let RetiradaService = class RetiradaService {
    constructor(retiradaRepository, financeiroService, dataSource) {
        this.retiradaRepository = retiradaRepository;
        this.financeiroService = financeiroService;
        this.dataSource = dataSource;
    }
    async registrarRetirada(dto) {
        return this.dataSource.transaction(async (manager) => {
            const retiradaRepo = manager.getRepository(retirada_entity_1.Retirada);
            const dataCompetencia = new Date(dto.dataRetirada);
            const dataVencimento = new Date(dto.dataRetirada);
            const tipoRetirada = dto.tipo;
            const descricao = tipoRetirada === retirada_entity_1.TipoRetirada.RETIRADA_CAPITAL
                ? `Retirada de Capital${dto.idSocio ? ` - Sócio ID ${dto.idSocio}` : ''}`
                : tipoRetirada === retirada_entity_1.TipoRetirada.DISTRIBUICAO_LUCROS
                    ? `Distribuição de Lucros${dto.idSocio ? ` - Sócio ID ${dto.idSocio}` : ''}`
                    : `Retirada${dto.idSocio ? ` - Sócio ID ${dto.idSocio}` : ''}`;
            const lancamento = await this.financeiroService.criarLancamento({
                descricao,
                tipo: tipo_lancamento_enum_1.TipoLancamento.DESPESA,
                valorTotal: dto.valor,
                dataCompetencia: dataCompetencia.toISOString().split('T')[0],
                idCategoria: dto.idCategoria,
                idClienteFornecedor: dto.idSocio,
                parcelas: [
                    {
                        numeroParcela: 1,
                        valor: dto.valor,
                        dataVencimento: dataVencimento.toISOString().split('T')[0],
                        meioPagamento: dto.meioPagamento || parcela_entity_1.MeioPagamento.TRANSFERENCIA,
                    },
                ],
                pagamentoImediato: dto.idConta
                    ? {
                        idConta: dto.idConta,
                        dataPagamento: dto.dataRetirada,
                    }
                    : undefined,
            });
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
    async listarRetiradas(idSocio, dataInicio, dataFim, tipo) {
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
    async buscarRetiradaPorId(id) {
        const retirada = await this.retiradaRepository.findOne({
            where: { idRetirada: id },
            relations: ['lancamento'],
        });
        if (!retirada) {
            throw new common_1.NotFoundException(`Retirada com ID ${id} não encontrada.`);
        }
        return retirada;
    }
};
exports.RetiradaService = RetiradaService;
exports.RetiradaService = RetiradaService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(retirada_entity_1.Retirada)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        financeiro_service_1.FinanceiroService,
        typeorm_2.DataSource])
], RetiradaService);
//# sourceMappingURL=retirada.service.js.map
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
exports.LogisticaService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const fornecedor_logistica_entity_1 = require("../domain/fornecedor-logistica.entity");
const entrega_entity_1 = require("../domain/entrega.entity");
const financeiro_service_1 = require("./financeiro.service");
const tipo_lancamento_enum_1 = require("../domain/tipo-lancamento.enum");
const parcela_entity_1 = require("../domain/parcela.entity");
let LogisticaService = class LogisticaService {
    constructor(fornecedorRepository, entregaRepository, financeiroService) {
        this.fornecedorRepository = fornecedorRepository;
        this.entregaRepository = entregaRepository;
        this.financeiroService = financeiroService;
    }
    async criarFornecedor(dto) {
        const fornecedor = this.fornecedorRepository.create(dto);
        return this.fornecedorRepository.save(fornecedor);
    }
    async listarFornecedores(idEmpresa) {
        const where = { ativo: true };
        if (idEmpresa) {
            where.idEmpresa = idEmpresa;
        }
        return this.fornecedorRepository.find({ where, order: { nome: 'ASC' } });
    }
    async buscarFornecedorPorId(idFornecedorLogistica) {
        const fornecedor = await this.fornecedorRepository.findOneBy({ idFornecedorLogistica });
        if (!fornecedor) {
            throw new common_1.NotFoundException(`Fornecedor de logística com ID ${idFornecedorLogistica} não encontrado.`);
        }
        return fornecedor;
    }
    async atualizarFornecedor(idFornecedorLogistica, dto) {
        const fornecedor = await this.buscarFornecedorPorId(idFornecedorLogistica);
        Object.assign(fornecedor, dto);
        return this.fornecedorRepository.save(fornecedor);
    }
    async excluirFornecedor(idFornecedorLogistica) {
        const fornecedor = await this.buscarFornecedorPorId(idFornecedorLogistica);
        fornecedor.ativo = false;
        await this.fornecedorRepository.save(fornecedor);
    }
    async registrarEntrega(dto) {
        const fornecedor = await this.buscarFornecedorPorId(dto.idFornecedorLogistica);
        const dataCompetencia = new Date(dto.dataEntrega);
        const dataVencimento = new Date(dto.dataEntrega);
        const lancamento = await this.financeiroService.criarLancamento({
            descricao: `Frete - ${fornecedor.nome} (${dto.origem} → ${dto.destino})`,
            tipo: tipo_lancamento_enum_1.TipoLancamento.DESPESA,
            valorTotal: dto.valorFrete,
            dataCompetencia: dataCompetencia.toISOString().split('T')[0],
            idCategoria: dto.idCategoria,
            parcelas: [
                {
                    numeroParcela: 1,
                    valor: dto.valorFrete,
                    dataVencimento: dataVencimento.toISOString().split('T')[0],
                    meioPagamento: dto.meioPagamento || parcela_entity_1.MeioPagamento.TRANSFERENCIA,
                },
            ],
            pagamentoImediato: dto.idConta
                ? {
                    idConta: dto.idConta,
                    dataPagamento: dto.dataEntrega,
                }
                : undefined,
        });
        const entrega = this.entregaRepository.create({
            idFornecedorLogistica: dto.idFornecedorLogistica,
            idLancamento: lancamento.idLancamento,
            dataEntrega: new Date(dto.dataEntrega),
            origem: dto.origem,
            destino: dto.destino,
            peso: dto.peso,
            valorFrete: dto.valorFrete,
            status: entrega_entity_1.StatusEntrega.PENDENTE,
            observacoes: dto.observacoes,
        });
        return this.entregaRepository.save(entrega);
    }
    async listarEntregas(idFornecedorLogistica, dataInicio, dataFim, status) {
        const queryBuilder = this.entregaRepository
            .createQueryBuilder('entrega')
            .leftJoinAndSelect('entrega.fornecedorLogistica', 'fornecedor')
            .orderBy('entrega.dataEntrega', 'DESC');
        if (idFornecedorLogistica) {
            queryBuilder.where('entrega.idFornecedorLogistica = :idFornecedorLogistica', { idFornecedorLogistica });
        }
        if (dataInicio) {
            queryBuilder.andWhere('entrega.dataEntrega >= :dataInicio', { dataInicio });
        }
        if (dataFim) {
            queryBuilder.andWhere('entrega.dataEntrega <= :dataFim', { dataFim });
        }
        if (status) {
            queryBuilder.andWhere('entrega.status = :status', { status });
        }
        return queryBuilder.getMany();
    }
    async atualizarStatusEntrega(idEntrega, status) {
        const entrega = await this.entregaRepository.findOneBy({ idEntrega });
        if (!entrega) {
            throw new common_1.NotFoundException(`Entrega com ID ${idEntrega} não encontrada.`);
        }
        entrega.status = status;
        return this.entregaRepository.save(entrega);
    }
};
exports.LogisticaService = LogisticaService;
exports.LogisticaService = LogisticaService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(fornecedor_logistica_entity_1.FornecedorLogistica)),
    __param(1, (0, typeorm_1.InjectRepository)(entrega_entity_1.Entrega)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        financeiro_service_1.FinanceiroService])
], LogisticaService);
//# sourceMappingURL=logistica.service.js.map
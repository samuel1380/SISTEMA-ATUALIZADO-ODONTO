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
exports.ConciliacaoService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const transacao_ofx_entity_1 = require("../domain/transacao-ofx.entity");
const conciliacao_transacao_entity_1 = require("../domain/conciliacao-transacao.entity");
const movimentacao_entity_1 = require("../domain/movimentacao.entity");
const aporte_entity_1 = require("../domain/aporte.entity");
const retirada_entity_1 = require("../domain/retirada.entity");
let ConciliacaoService = class ConciliacaoService {
    constructor(transacaoOfxRepository, conciliacaoRepository, movimentacaoRepository, aporteRepository, retiradaRepository, dataSource) {
        this.transacaoOfxRepository = transacaoOfxRepository;
        this.conciliacaoRepository = conciliacaoRepository;
        this.movimentacaoRepository = movimentacaoRepository;
        this.aporteRepository = aporteRepository;
        this.retiradaRepository = retiradaRepository;
        this.dataSource = dataSource;
    }
    async listarTransacoesNaoConciliadas(filtros) {
        const queryBuilder = this.transacaoOfxRepository
            .createQueryBuilder('transacao')
            .leftJoinAndSelect('transacao.conta', 'conta')
            .leftJoinAndSelect('transacao.arquivoOfx', 'arquivo')
            .where('transacao.statusConciliacao = :status', { status: transacao_ofx_entity_1.StatusConciliacao.PENDENTE });
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
    async listarMovimentacoesDisponiveis(filtros) {
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
            }
            else {
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
            const tipoMovimentacao = filtros.tipo === 'CREDITO' ? 'CREDITO' : filtros.tipo === 'DEBITO' ? 'DEBITO' : null;
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
    async buscarSugestoes(idTransacaoOfx) {
        const transacao = await this.transacaoOfxRepository.findOne({
            where: { idTransacaoOfx },
            relations: ['conta'],
        });
        if (!transacao) {
            throw new common_1.NotFoundException(`Transação OFX com ID ${idTransacaoOfx} não encontrada.`);
        }
        const valorMin = Number(transacao.valor) - 0.01;
        const valorMax = Number(transacao.valor) + 0.01;
        const dataInicio = new Date(transacao.dataTransacao);
        dataInicio.setDate(dataInicio.getDate() - 3);
        const dataFim = new Date(transacao.dataTransacao);
        dataFim.setDate(dataFim.getDate() + 3);
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
        return movimentacoes.map(mov => {
            const diffValor = Math.abs(Number(mov.valor) - Number(transacao.valor));
            const diffDias = Math.abs(Math.floor((new Date(mov.dataMovimentacao).getTime() -
                new Date(transacao.dataTransacao).getTime()) /
                (1000 * 60 * 60 * 24)));
            const score = 100 - diffValor * 10 - diffDias * 5;
            return Object.assign(Object.assign({}, mov), { tipoVinculo: conciliacao_transacao_entity_1.TipoVinculo.MOVIMENTACAO, score: Math.max(0, score), diffValor,
                diffDias });
        });
    }
    async vincularConciliacao(dto, idUsuario) {
        return this.dataSource.transaction(async (manager) => {
            const transacaoRepo = manager.getRepository(transacao_ofx_entity_1.TransacaoOfx);
            const conciliacaoRepo = manager.getRepository(conciliacao_transacao_entity_1.ConciliacaoTransacao);
            const movimentacaoRepo = manager.getRepository(movimentacao_entity_1.Movimentacao);
            const aporteRepo = manager.getRepository(aporte_entity_1.Aporte);
            const retiradaRepo = manager.getRepository(retirada_entity_1.Retirada);
            const transacao = await transacaoRepo.findOne({
                where: { idTransacaoOfx: dto.idTransacaoOfx },
                relations: ['conciliacao'],
            });
            if (!transacao) {
                throw new common_1.NotFoundException(`Transação OFX com ID ${dto.idTransacaoOfx} não encontrada.`);
            }
            if (transacao.statusConciliacao === transacao_ofx_entity_1.StatusConciliacao.CONCILIADO) {
                throw new common_1.BadRequestException('Esta transação já está conciliada.');
            }
            if (transacao.conciliacao) {
                throw new common_1.BadRequestException('Esta transação já possui uma conciliação.');
            }
            let idMovimentacao;
            let idAporte;
            let idRetirada;
            switch (dto.tipoVinculo) {
                case conciliacao_transacao_entity_1.TipoVinculo.MOVIMENTACAO:
                    if (!dto.idMovimentacao) {
                        throw new common_1.BadRequestException('ID da movimentação é obrigatório para este tipo de vínculo.');
                    }
                    const movimentacao = await movimentacaoRepo.findOneBy({
                        idMovimentacao: dto.idMovimentacao,
                    });
                    if (!movimentacao) {
                        throw new common_1.NotFoundException(`Movimentação com ID ${dto.idMovimentacao} não encontrada.`);
                    }
                    idMovimentacao = dto.idMovimentacao;
                    break;
                case conciliacao_transacao_entity_1.TipoVinculo.APORTE:
                    if (!dto.idAporte) {
                        throw new common_1.BadRequestException('ID do aporte é obrigatório para este tipo de vínculo.');
                    }
                    const aporte = await aporteRepo.findOneBy({ idAporte: dto.idAporte });
                    if (!aporte) {
                        throw new common_1.NotFoundException(`Aporte com ID ${dto.idAporte} não encontrado.`);
                    }
                    idAporte = dto.idAporte;
                    break;
                case conciliacao_transacao_entity_1.TipoVinculo.RETIRADA:
                    if (!dto.idRetirada) {
                        throw new common_1.BadRequestException('ID da retirada é obrigatório para este tipo de vínculo.');
                    }
                    const retirada = await retiradaRepo.findOneBy({ idRetirada: dto.idRetirada });
                    if (!retirada) {
                        throw new common_1.NotFoundException(`Retirada com ID ${dto.idRetirada} não encontrada.`);
                    }
                    idRetirada = dto.idRetirada;
                    break;
                default:
                    throw new common_1.BadRequestException(`Tipo de vínculo inválido: ${dto.tipoVinculo}`);
            }
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
            transacao.statusConciliacao = transacao_ofx_entity_1.StatusConciliacao.CONCILIADO;
            transacao.dataConciliacao = new Date();
            await transacaoRepo.save(transacao);
            return conciliacaoSalva;
        });
    }
    async desfazerConciliacao(idConciliacao) {
        return this.dataSource.transaction(async (manager) => {
            const conciliacaoRepo = manager.getRepository(conciliacao_transacao_entity_1.ConciliacaoTransacao);
            const transacaoRepo = manager.getRepository(transacao_ofx_entity_1.TransacaoOfx);
            const conciliacao = await conciliacaoRepo.findOne({
                where: { idConciliacao },
                relations: ['transacaoOfx'],
            });
            if (!conciliacao) {
                throw new common_1.NotFoundException(`Conciliação com ID ${idConciliacao} não encontrada.`);
            }
            if (conciliacao.transacaoOfx) {
                conciliacao.transacaoOfx.statusConciliacao = transacao_ofx_entity_1.StatusConciliacao.PENDENTE;
                conciliacao.transacaoOfx.dataConciliacao = null;
                await transacaoRepo.save(conciliacao.transacaoOfx);
            }
            await conciliacaoRepo.delete({ idConciliacao });
        });
    }
    async ignorarTransacao(idTransacaoOfx) {
        const transacao = await this.transacaoOfxRepository.findOneBy({ idTransacaoOfx });
        if (!transacao) {
            throw new common_1.NotFoundException(`Transação OFX com ID ${idTransacaoOfx} não encontrada.`);
        }
        if (transacao.statusConciliacao === transacao_ofx_entity_1.StatusConciliacao.CONCILIADO) {
            throw new common_1.BadRequestException('Não é possível ignorar uma transação já conciliada.');
        }
        transacao.statusConciliacao = transacao_ofx_entity_1.StatusConciliacao.IGNORADO;
        await this.transacaoOfxRepository.save(transacao);
    }
};
exports.ConciliacaoService = ConciliacaoService;
exports.ConciliacaoService = ConciliacaoService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(transacao_ofx_entity_1.TransacaoOfx)),
    __param(1, (0, typeorm_1.InjectRepository)(conciliacao_transacao_entity_1.ConciliacaoTransacao)),
    __param(2, (0, typeorm_1.InjectRepository)(movimentacao_entity_1.Movimentacao)),
    __param(3, (0, typeorm_1.InjectRepository)(aporte_entity_1.Aporte)),
    __param(4, (0, typeorm_1.InjectRepository)(retirada_entity_1.Retirada)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource])
], ConciliacaoService);
//# sourceMappingURL=conciliacao.service.js.map
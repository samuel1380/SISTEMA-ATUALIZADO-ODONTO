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
exports.TrabalhoRepository = void 0;
const typeorm_1 = require("typeorm");
const trabalho_entity_1 = require("../domain/trabalho.entity");
const typeorm_2 = require("@nestjs/typeorm");
let TrabalhoRepository = class TrabalhoRepository {
    constructor(trabalhoRepository) {
        this.trabalhoRepository = trabalhoRepository;
    }
    async buscarTrabalhosDaEmpresa(idEmpresa, status, incluirOcultos = false) {
        const where = {
            idEmpresa,
            ativo: true,
            status: (0, typeorm_1.In)(status)
        };
        if (!incluirOcultos) {
            where.ocultoConcluido = (0, typeorm_1.Raw)(alias => `(${alias} IS NULL OR ${alias} = 0)`);
        }
        return this.trabalhoRepository.find({
            where,
            order: {
                ordem: "ASC",
                idTrabalho: "ASC",
            }
        });
    }
    async pesquisarTrabalhos(termo, idEmpresa) {
        if (!termo || !termo.trim()) {
            return [];
        }
        const tLimpo = termo.trim();
        const termoLike = `%${tLimpo}%`;
        const numeroLimpo = tLimpo.replace(/[^0-9]/g, '');
        const isNumero = numeroLimpo.length > 0 && (tLimpo.startsWith('#') || /^\d+$/.test(tLimpo));
        const idNumero = isNumero ? parseInt(numeroLimpo, 10) : null;
        const qb = this.trabalhoRepository.createQueryBuilder('trabalho')
            .leftJoinAndSelect('trabalho.paciente', 'paciente')
            .leftJoinAndSelect('trabalho.empresa', 'empresa')
            .leftJoinAndSelect('trabalho.dentista', 'dentista')
            .where('trabalho.ativo = true');
        if (idEmpresa) {
            qb.andWhere('trabalho.idEmpresa = :idEmpresa', { idEmpresa });
        }
        if (idNumero) {
            qb.andWhere('(trabalho.idTrabalho = :idNumero OR trabalho.nomePaciente LIKE :termoLike OR paciente.nome LIKE :termoLike OR trabalho.nomeEmpresa LIKE :termoLike OR empresa.nome LIKE :termoLike OR empresa.razaoSocial LIKE :termoLike OR dentista.nome LIKE :termoLike OR trabalho.descricaoTrabalho LIKE :termoLike)', { idNumero, termoLike });
        }
        else {
            qb.andWhere('(trabalho.nomePaciente LIKE :termoLike OR paciente.nome LIKE :termoLike OR trabalho.nomeEmpresa LIKE :termoLike OR empresa.nome LIKE :termoLike OR empresa.razaoSocial LIKE :termoLike OR dentista.nome LIKE :termoLike OR trabalho.descricaoTrabalho LIKE :termoLike)', { termoLike });
        }
        qb.orderBy('trabalho.idTrabalho', 'DESC').take(25);
        return qb.getMany();
    }
    async buscarTrabalhosConcluidos(status, idEmpresa, dataInicio, dataFim, incluirOcultos = false) {
        const where = {
            ativo: true,
            status: (0, typeorm_1.In)(status),
        };
        if (!incluirOcultos) {
            where.ocultoConcluido = (0, typeorm_1.Raw)(alias => `(${alias} IS NULL OR ${alias} = 0)`);
        }
        return this.trabalhoRepository.find({
            where,
            order: {
                ordem: "ASC",
                idTrabalho: "ASC",
            }
        });
    }
    async buscarRelatorio(idEmpresa, status, dataInicio, dataFim) {
        let buscaDataInclusao;
        let buscaDataConclusao;
        if (status.includes(trabalho_entity_1.StatusTrabalho.ENVIADO) || status.includes(trabalho_entity_1.StatusTrabalho.ENVIADO_PROVA) || status.includes(trabalho_entity_1.StatusTrabalho.PAGAMENTO_RECEBIDO)) {
            buscaDataConclusao = true;
        }
        else if (!status.includes(trabalho_entity_1.StatusTrabalho.ENVIADO) && !status.includes(trabalho_entity_1.StatusTrabalho.ENVIADO_PROVA) && !status.includes(trabalho_entity_1.StatusTrabalho.PAGAMENTO_RECEBIDO)) {
            buscaDataInclusao = true;
        }
        else {
            buscaDataConclusao = true;
            buscaDataInclusao = true;
        }
        const dataInicioDate = this.getInicioDia(new Date(dataInicio));
        const dataFimDate = this.getFimDia(new Date(dataFim));
        const where = {
            ativo: 1,
            status: (0, typeorm_1.In)(status),
            dataConclusao: (0, typeorm_1.Between)(dataInicioDate, dataFimDate),
        };
        const where2 = {
            ativo: 1,
            status: (0, typeorm_1.In)(status),
            dataInclusao: (0, typeorm_1.Between)(dataInicioDate, dataFimDate),
        };
        if (idEmpresa != -1) {
            if (buscaDataConclusao) {
                where.idEmpresa = idEmpresa;
            }
            if (buscaDataInclusao) {
                where2.idEmpresa = idEmpresa;
            }
        }
        const whereBase = [];
        if (buscaDataConclusao) {
            whereBase.push(where);
        }
        if (buscaDataInclusao) {
            whereBase.push(where2);
        }
        return this.trabalhoRepository.find({
            where: whereBase,
            order: {
                ordem: "ASC",
                idTrabalho: "ASC",
            }
        });
    }
    getInicioDia(data) {
        const inicio = new Date(data);
        inicio.setHours(0, 0, 0, 0);
        return inicio;
    }
    getFimDia(data) {
        const fim = new Date(data);
        fim.setHours(23, 59, 59, 999);
        return fim;
    }
    async buscarTrabalhos(status, incluirOcultos = false) {
        const statusArray = Array.isArray(status) ? status : [status];
        const where = {
            ativo: true,
            status: (0, typeorm_1.In)(statusArray)
        };
        if (!incluirOcultos) {
            where.ocultoConcluido = (0, typeorm_1.Raw)(alias => `(${alias} IS NULL OR ${alias} = 0)`);
        }
        return this.trabalhoRepository.find({
            where,
            order: {
                ordem: "ASC",
                idTrabalho: "ASC",
            }
        });
    }
    async buscarProdutoPorId(idTrabalho) {
        return this.trabalhoRepository.findOne({
            where: { idTrabalho },
            relations: ['trabalhoMotivos', 'trabalhoMotivos.motivo'],
        });
    }
    async buscarProdutoPorIdComRelacoes(idTrabalho) {
        return this.trabalhoRepository.findOne({
            where: { idTrabalho },
            relations: [
                'servicos',
                'servicos.elementos',
                'componentes',
                'componentes.componente',
                'trabalhoMotivos',
                'trabalhoMotivos.motivo',
            ]
        });
    }
    async buscarProdutosPorIdsComRelacoes(idsTrabalhos) {
        if (idsTrabalhos.length === 0)
            return [];
        return this.trabalhoRepository.find({
            where: { idTrabalho: (0, typeorm_1.In)(idsTrabalhos) },
            relations: [
                'servicos',
                'servicos.elementos',
                'componentes',
                'componentes.componente',
                'trabalhoMotivos',
                'trabalhoMotivos.motivo',
            ]
        });
    }
    async salvaTrabalho(trabalho) {
        return this.trabalhoRepository.save(trabalho);
    }
    async atualizaTrabalho(trabalhoId, trabalho) {
        return this.trabalhoRepository.update(trabalhoId, trabalho);
    }
    async buscarTrabalhosPendentesPorIdEmpresa(idEmpresa) {
        return await this.trabalhoRepository.find({ where: { idEmpresa: idEmpresa, status: trabalho_entity_1.StatusTrabalho.PENDENTE }, order: { ordem: 'ASC' } });
    }
    async buscarTrabalhosPendentes() {
        return await this.trabalhoRepository.find({ where: { status: trabalho_entity_1.StatusTrabalho.PENDENTE } });
    }
    async atualizaOrdem(idTrabalho, ordem) {
        return this.trabalhoRepository.update(idTrabalho, { ordem });
    }
    async buscaUltimoId() {
        return await this.trabalhoRepository.query('select MAX(ordem) as ordem from TbTrabalho limit 1');
    }
    async buscarTrabalhosDashboard(dataInicio, dataFim) {
        const dataInicioDate = this.getInicioDia(new Date(dataInicio));
        const dataFimDate = this.getFimDia(new Date(dataFim));
        return this.trabalhoRepository.find({
            where: {
                ativo: true,
                dataInclusao: (0, typeorm_1.Between)(dataInicioDate, dataFimDate)
            },
            relations: ['empresa', 'trabalhoMotivos', 'trabalhoMotivos.motivo'],
        });
    }
};
exports.TrabalhoRepository = TrabalhoRepository;
exports.TrabalhoRepository = TrabalhoRepository = __decorate([
    __param(0, (0, typeorm_2.InjectRepository)(trabalho_entity_1.Trabalho)),
    __metadata("design:paramtypes", [typeorm_1.Repository])
], TrabalhoRepository);
//# sourceMappingURL=trabalho.repository.js.map
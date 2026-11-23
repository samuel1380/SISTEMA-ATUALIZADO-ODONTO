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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PacienteService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const paciente_entity_1 = require("../domain/paciente.entity");
const trabalho_service_1 = require("../../trabalho/business/trabalho.service");
const trabalho_entity_1 = require("../../trabalho/domain/trabalho.entity");
const motivo_dto_1 = require("../../motivo/dto/motivo.dto");
const node_arqt_base_gerenciador_usuarios_1 = require("@hunter-solucoes/node-arqt-base-gerenciador-usuarios");
let PacienteService = class PacienteService {
    constructor(pacienteRepository, trabalhoService, empresaService) {
        this.pacienteRepository = pacienteRepository;
        this.trabalhoService = trabalhoService;
        this.empresaService = empresaService;
    }
    async create(createPacienteDto, idUsuarioCadastro) {
        const { nome, idEmpresa, idProfissional } = createPacienteDto;
        const existingPaciente = await this.pacienteRepository.findOne({
            where: { nome: nome.toUpperCase().trim(), idEmpresa, idProfissional },
        });
        if (existingPaciente) {
            throw new common_1.ConflictException(`Paciente com o nome "${nome}" já existe para este dentista na empresa.`);
        }
        const paciente = this.pacienteRepository.create({
            nome: nome.toUpperCase().trim(),
            idEmpresa,
            idProfissional,
            idUsuarioCadastro,
        });
        return this.pacienteRepository.save(paciente);
    }
    async findAll(idEmpresa, idProfissional) {
        return this.pacienteRepository.find({
            where: { idEmpresa, idProfissional },
            order: { dataInclusao: 'DESC' },
        });
    }
    async findOne(idPaciente, idEmpresa) {
        var _a, _b;
        const where = { idPaciente };
        if (idEmpresa) {
            where.idEmpresa = idEmpresa;
        }
        const paciente = await this.pacienteRepository
            .createQueryBuilder('paciente')
            .where(where)
            .orderBy('trabalho.dataConclusao', 'DESC')
            .leftJoinAndSelect('paciente.trabalhos', 'trabalho')
            .leftJoinAndSelect('trabalho.servicos', 'servico')
            .leftJoinAndSelect('servico.elementos', 'elemento')
            .leftJoinAndSelect('trabalho.componentes', 'componenteTrabalho')
            .leftJoinAndSelect('componenteTrabalho.componente', 'componente')
            .leftJoinAndSelect('trabalho.ordemServico', 'ordemServico')
            .leftJoinAndSelect('trabalho.trabalhoMotivos', 'trabalhoMotivo')
            .leftJoinAndSelect('trabalhoMotivo.motivo', 'motivo');
        const result = await paciente.getOne();
        if (!result) {
            throw new common_1.NotFoundException(`Paciente com ID ${idPaciente} não encontrado.`);
        }
        if ((_a = result.trabalhos) === null || _a === void 0 ? void 0 : _a.length) {
            for (const t of result.trabalhos) {
                const tms = (_b = t.trabalhoMotivos) !== null && _b !== void 0 ? _b : [];
                t.motivosRetrabalhoIds = tms
                    .filter((tm) => { var _a; return ((_a = tm.motivo) === null || _a === void 0 ? void 0 : _a.tipo) === motivo_dto_1.MotivoTipo.RETRABALHO; })
                    .map((tm) => tm.idMotivo);
                t.motivosBonificacaoIds = tms
                    .filter((tm) => { var _a; return ((_a = tm.motivo) === null || _a === void 0 ? void 0 : _a.tipo) === motivo_dto_1.MotivoTipo.BONIFICACAO; })
                    .map((tm) => tm.idMotivo);
            }
        }
        return result;
    }
    async update(idPaciente, updatePacienteDto, idEmpresa) {
        var _a;
        const paciente = await this.findOne(idPaciente, idEmpresa);
        const nomeAtualizado = (_a = updatePacienteDto.nome) === null || _a === void 0 ? void 0 : _a.toUpperCase().trim();
        const idProfissionalAtualizado = updatePacienteDto.idProfissional || paciente.idProfissional;
        if (nomeAtualizado && (nomeAtualizado !== paciente.nome || idProfissionalAtualizado !== paciente.idProfissional)) {
            const existingPaciente = await this.pacienteRepository.findOne({
                where: {
                    nome: nomeAtualizado.toUpperCase().trim(),
                    idEmpresa,
                    idProfissional: idProfissionalAtualizado,
                },
            });
            if (existingPaciente && existingPaciente.idPaciente !== idPaciente) {
                throw new common_1.ConflictException(`Paciente com o nome "${updatePacienteDto.nome}" já existe para este dentista na empresa.`);
            }
        }
        Object.assign(paciente, updatePacienteDto);
        return this.pacienteRepository.save(paciente);
    }
    async updatePacienteETrabalhos(idPaciente, updateDto, currentUser) {
        const { trabalhos } = updateDto, pacienteData = __rest(updateDto, ["trabalhos"]);
        const idEmpresa = pacienteData.idEmpresa || currentUser.user.idEmpresa;
        if (!idEmpresa) {
            throw new common_1.BadRequestException('O ID da empresa não foi fornecido e não pôde ser determinado.');
        }
        const empresa = await this.empresaService.buscarEmpresasPorId(idEmpresa);
        const paciente = await this.update(idPaciente, Object.assign(Object.assign({}, pacienteData), { idEmpresa }), idEmpresa);
        if (trabalhos && trabalhos.length > 0) {
            for (const trabalhoDto of trabalhos) {
                trabalhoDto.idPaciente = paciente.idPaciente;
                trabalhoDto.idEmpresa = idEmpresa;
                if (!trabalhoDto.status) {
                    trabalhoDto.status = trabalho_entity_1.StatusTrabalho.PENDENTE;
                }
                if (trabalhoDto.idTrabalho) {
                    await this.trabalhoService.atualizarTrabalho(currentUser, trabalhoDto.idTrabalho, trabalhoDto);
                }
                else {
                    await this.trabalhoService.cadastrarTrabalho(currentUser, idEmpresa, empresa.nome, trabalhoDto);
                }
            }
        }
        return this.findOne(idPaciente, idEmpresa);
    }
    async remove(idPaciente, idEmpresa) {
        const paciente = await this.findOne(idPaciente, idEmpresa);
        if (paciente.trabalhos && paciente.trabalhos.length > 0) {
            throw new common_1.BadRequestException('Não é possível excluir um paciente que possui trabalhos associados.');
        }
        try {
            await this.pacienteRepository.softDelete(paciente.idPaciente);
        }
        catch (error) {
            throw new common_1.BadRequestException('Não é possível excluir um paciente que possui trabalhos associados.');
        }
    }
};
exports.PacienteService = PacienteService;
exports.PacienteService = PacienteService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(paciente_entity_1.Paciente)),
    __param(1, (0, common_1.Inject)((0, common_1.forwardRef)(() => trabalho_service_1.TrabalhoService))),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        trabalho_service_1.TrabalhoService,
        node_arqt_base_gerenciador_usuarios_1.EmpresaService])
], PacienteService);
//# sourceMappingURL=paciente.service.js.map
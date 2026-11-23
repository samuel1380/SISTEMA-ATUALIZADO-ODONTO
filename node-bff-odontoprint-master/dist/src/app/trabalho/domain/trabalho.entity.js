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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Trabalho = exports.StatusTrabalho = void 0;
const typeorm_1 = require("typeorm");
const empresa_entity_1 = require("@hunter-solucoes/node-arqt-base-gerenciador-usuarios/dist/src/app/empresa/domain/empresa.entity");
const componentesTrabalho_entity_1 = require("./componentesTrabalho.entity");
const dentista_entity_1 = require("../../dentista/domain/dentista.entity");
const historicoStatusTrabalho_entity_1 = require("../../historicoStatusTrabalho/domain/historicoStatusTrabalho.entity");
const ordemServico_entity_1 = require("../../ordemServico/domain/ordemServico.entity");
const servicoTrabalho_entity_1 = require("./servicoTrabalho.entity");
const paciente_entity_1 = require("../../paciente/domain/paciente.entity");
const tabelaPrecoProduto_entity_1 = require("../../tabelaPrecoProduto/domain/tabelaPrecoProduto.entity");
const trabalhoMotivo_entity_1 = require("./trabalhoMotivo.entity");
var StatusTrabalho;
(function (StatusTrabalho) {
    StatusTrabalho["PENDENTE"] = "PENDENTE";
    StatusTrabalho["MODELAGEM"] = "MODELAGEM";
    StatusTrabalho["IMPRESSAO_PROVA"] = "IMPRESSAO_PROVA";
    StatusTrabalho["IMPRESSAO_CARGA_CERAMICA"] = "IMPRESSAO_CARGA_CERAMICA";
    StatusTrabalho["IMPRESSAO_BIOSPLINT_PLACA"] = "IMPRESSAO_BIOSPLINT_PLACA";
    StatusTrabalho["FRESAGEM"] = "FRESAGEM";
    StatusTrabalho["SINTERIZACAO"] = "SINTERIZACAO";
    StatusTrabalho["MAQUIAGEM"] = "MAQUIAGEM";
    StatusTrabalho["AGUARDANDO_COMPONENTE"] = "AGUARDANDO_COMPONENTE";
    StatusTrabalho["PACOTE"] = "PACOTE";
    StatusTrabalho["AGUARDANDO_COLETA"] = "AGUARDANDO_COLETA";
    StatusTrabalho["ENVIADO"] = "ENVIADO";
    StatusTrabalho["ENVIADO_PROVA"] = "ENVIADO_PROVA";
    StatusTrabalho["PAGAMENTO_RECEBIDO"] = "PAGAMENTO_RECEBIDO";
    StatusTrabalho["CANCELADO"] = "CANCELADO";
})(StatusTrabalho || (exports.StatusTrabalho = StatusTrabalho = {}));
let Trabalho = class Trabalho {
};
exports.Trabalho = Trabalho;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Trabalho.prototype, "idTrabalho", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: false }),
    __metadata("design:type", String)
], Trabalho.prototype, "nomePaciente", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: false }),
    __metadata("design:type", Number)
], Trabalho.prototype, "idEmpresa", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], Trabalho.prototype, "nomeEmpresa", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], Trabalho.prototype, "idPaciente", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: false }),
    __metadata("design:type", Number)
], Trabalho.prototype, "idProfissional", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: false }),
    __metadata("design:type", String)
], Trabalho.prototype, "descricaoTrabalho", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: false }),
    __metadata("design:type", String)
], Trabalho.prototype, "cor", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: false }),
    __metadata("design:type", String)
], Trabalho.prototype, "descricaoComponente", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: false }),
    __metadata("design:type", String)
], Trabalho.prototype, "observacao", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], Trabalho.prototype, "anotacoes", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "boolean", default: false, nullable: true }),
    __metadata("design:type", Boolean)
], Trabalho.prototype, "retrabalho", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "boolean", default: false, nullable: true }),
    __metadata("design:type", Boolean)
], Trabalho.prototype, "bonificacao", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Trabalho.prototype, "idTrabalhoOrigem", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Trabalho.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Trabalho.prototype, "ordem", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'datetime', nullable: true }),
    __metadata("design:type", Date)
], Trabalho.prototype, "dataConclusao", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'datetime', nullable: true }),
    __metadata("design:type", Date)
], Trabalho.prototype, "dataHoraEnvio", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], Trabalho.prototype, "idTabelaPrecoProduto", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "boolean", default: true }),
    __metadata("design:type", Boolean)
], Trabalho.prototype, "ativo", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "boolean", default: false, nullable: true }),
    __metadata("design:type", Boolean)
], Trabalho.prototype, "finalizado", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "boolean", default: false, nullable: true }),
    __metadata("design:type", Boolean)
], Trabalho.prototype, "ocultoConcluido", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: false }),
    __metadata("design:type", Number)
], Trabalho.prototype, "idUsuarioCadastro", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Trabalho.prototype, "dataInclusao", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Trabalho.prototype, "dataAlteracao", void 0);
__decorate([
    (0, typeorm_1.DeleteDateColumn)(),
    __metadata("design:type", Date)
], Trabalho.prototype, "dataExclusao", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(type => dentista_entity_1.Dentista, { eager: true }),
    (0, typeorm_1.JoinColumn)({ name: 'idProfissional' }),
    __metadata("design:type", dentista_entity_1.Dentista)
], Trabalho.prototype, "dentista", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(type => empresa_entity_1.Empresa, { eager: true }),
    (0, typeorm_1.JoinColumn)({ name: 'idEmpresa' }),
    __metadata("design:type", empresa_entity_1.Empresa)
], Trabalho.prototype, "empresa", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => paciente_entity_1.Paciente, { eager: true }),
    (0, typeorm_1.JoinColumn)({ name: 'idPaciente' }),
    __metadata("design:type", paciente_entity_1.Paciente)
], Trabalho.prototype, "paciente", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(type => componentesTrabalho_entity_1.ComponentesTrabalho, (componenteTrabalho) => componenteTrabalho.trabalho, { eager: true }),
    __metadata("design:type", Array)
], Trabalho.prototype, "componentes", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => servicoTrabalho_entity_1.ServicoTrabalho, (servico) => servico.trabalho, { eager: true, cascade: true }),
    __metadata("design:type", Array)
], Trabalho.prototype, "servicos", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => trabalhoMotivo_entity_1.TrabalhoMotivo, (trabalhoMotivo) => trabalhoMotivo.trabalho, { eager: true }),
    __metadata("design:type", Array)
], Trabalho.prototype, "trabalhoMotivos", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(type => historicoStatusTrabalho_entity_1.HistoricoStatusTrabalho, (historicoStatusTrabalho) => historicoStatusTrabalho.trabalho, { eager: true }),
    __metadata("design:type", Array)
], Trabalho.prototype, "historicoStatusTrabalho", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => ordemServico_entity_1.OrdemServico, (ordemServico) => ordemServico.trabalho),
    __metadata("design:type", ordemServico_entity_1.OrdemServico)
], Trabalho.prototype, "ordemServico", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => tabelaPrecoProduto_entity_1.TabelaPrecoProduto, { eager: false }),
    (0, typeorm_1.JoinColumn)({ name: 'idTabelaPrecoProduto' }),
    __metadata("design:type", tabelaPrecoProduto_entity_1.TabelaPrecoProduto)
], Trabalho.prototype, "tabelaPrecoProduto", void 0);
exports.Trabalho = Trabalho = __decorate([
    (0, typeorm_1.Entity)('TbTrabalho')
], Trabalho);
//# sourceMappingURL=trabalho.entity.js.map
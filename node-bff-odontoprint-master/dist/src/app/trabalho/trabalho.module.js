"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrabalhoModule = void 0;
const common_1 = require("@nestjs/common");
const utils_1 = require("../../utils");
const httpClient_module_1 = require("../../libs/httpClient/httpClient.module");
const trabalho_repository_1 = require("./repository/trabalho.repository");
const trabalho_service_1 = require("./business/trabalho.service");
const trabalho_controller_1 = require("./controller/trabalho.controller");
const elementosTrabalho_controller_1 = require("./controller/elementosTrabalho.controller");
const elementosTrabalho_service_1 = require("./business/elementosTrabalho.service");
const componentesTrabalho_controller_1 = require("./controller/componentesTrabalho.controller");
const componentesTrabalho_service_1 = require("./business/componentesTrabalho.service");
const historicoStatusTrabalho_module_1 = require("../historicoStatusTrabalho/historicoStatusTrabalho.module");
const node_arqt_base_gerenciador_usuarios_1 = require("@hunter-solucoes/node-arqt-base-gerenciador-usuarios");
const tabelaPrecoProduto_module_1 = require("../tabelaPrecoProduto/tabelaPrecoProduto.module");
const empresaTabelaPreco_module_1 = require("../empresaTabelaPreco/empresaTabelaPreco.module");
const componente_module_1 = require("../componente/componente.module");
const cadastroComplementarEmpresa_module_1 = require("../cadastroComplementarEmpresa/cadastroComplementarEmpresa.module");
const typeorm_1 = require("@nestjs/typeorm");
const componentesTrabalho_entity_1 = require("./domain/componentesTrabalho.entity");
const elementosTrabalho_entity_1 = require("./domain/elementosTrabalho.entity");
const trabalho_entity_1 = require("./domain/trabalho.entity");
const ordemServicoItem_entity_1 = require("../ordemServico/domain/ordemServicoItem.entity");
const trabalhoMotivo_entity_1 = require("./domain/trabalhoMotivo.entity");
const motivo_entity_1 = require("../motivo/domain/motivo.entity");
const estoque_module_1 = require("../estoque/estoque/estoque.module");
const transferencia_module_1 = require("../estoque/transferencia/transferencia.module");
const almoxarifado_module_1 = require("../estoque/almoxarifado/almoxarifado.module");
const ordem_servico_module_1 = require("../ordemServico/ordem-servico.module");
const paciente_module_1 = require("../paciente/paciente.module");
const financeiro_module_1 = require("../financeiro/financeiro.module");
let TrabalhoModule = class TrabalhoModule {
};
exports.TrabalhoModule = TrabalhoModule;
exports.TrabalhoModule = TrabalhoModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([componentesTrabalho_entity_1.ComponentesTrabalho, elementosTrabalho_entity_1.ElementosTrabalho, trabalho_entity_1.Trabalho, ordemServicoItem_entity_1.OrdemServicoItem, trabalhoMotivo_entity_1.TrabalhoMotivo, motivo_entity_1.Motivo]),
            utils_1.UtilsModule,
            httpClient_module_1.HttpClienteModule,
            historicoStatusTrabalho_module_1.HistoricoStatusTrabalhoModule,
            node_arqt_base_gerenciador_usuarios_1.EmpresaModule,
            cadastroComplementarEmpresa_module_1.CadastroComplementarEmpresaModule,
            ordem_servico_module_1.OrdemServicoModule,
            tabelaPrecoProduto_module_1.TabelaPrecoProdutoModule,
            empresaTabelaPreco_module_1.EmpresaTabelaPrecoModule,
            componente_module_1.ComponenteModule,
            estoque_module_1.EstoqueModule,
            transferencia_module_1.TransferenciaModule,
            almoxarifado_module_1.AlmoxarifadoModule,
            (0, common_1.forwardRef)(() => paciente_module_1.PacienteModule),
            (0, common_1.forwardRef)(() => financeiro_module_1.FinanceiroModule)
        ],
        controllers: [
            trabalho_controller_1.TrabalhoController,
            elementosTrabalho_controller_1.ElementosTrabalhoController,
            componentesTrabalho_controller_1.ComponentesTrabalhoController
        ],
        providers: [
            trabalho_repository_1.TrabalhoRepository,
            trabalho_service_1.TrabalhoService,
            elementosTrabalho_service_1.ElementosTrabalhoService,
            componentesTrabalho_service_1.ComponentesTrabalhoService,
            common_1.Logger
        ],
        exports: [trabalho_service_1.TrabalhoService]
    })
], TrabalhoModule);
//# sourceMappingURL=trabalho.module.js.map
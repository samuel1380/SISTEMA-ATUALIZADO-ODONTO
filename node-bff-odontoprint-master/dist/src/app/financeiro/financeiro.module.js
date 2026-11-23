"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FinanceiroModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const financeiro_service_1 = require("./business/financeiro.service");
const conta_entity_1 = require("./domain/conta.entity");
const lancamento_entity_1 = require("./domain/lancamento.entity");
const parcela_entity_1 = require("./domain/parcela.entity");
const movimentacao_entity_1 = require("./domain/movimentacao.entity");
const financeiro_controller_1 = require("./controller/financeiro.controller");
const ordem_servico_module_1 = require("../ordemServico/ordem-servico.module");
const fatura_controller_1 = require("./controller/fatura.controller");
const fatura_service_1 = require("./business/fatura.service");
const fatura_entity_1 = require("./domain/fatura.entity");
const ordemServico_entity_1 = require("../ordemServico/domain/ordemServico.entity");
const schedule_1 = require("@nestjs/schedule");
const lancamento_recorrente_service_1 = require("./business/lancamento-recorrente.service");
const lancamento_recorrente_entity_1 = require("./domain/lancamento-recorrente.entity");
const fatura_recorrente_service_1 = require("./business/fatura-recorrente.service");
const categoria_entity_1 = require("./domain/categoria.entity");
const categoria_service_1 = require("./business/categoria.service");
const ordemServicoItem_entity_1 = require("../ordemServico/domain/ordemServicoItem.entity");
const devolucao_componente_controller_1 = require("./controller/devolucao-componente.controller");
const categoria_controller_1 = require("./controller/categoria.controller");
const devolucao_componente_entity_1 = require("./domain/devolucao-componente.entity");
const estoque_module_1 = require("../estoque/estoque/estoque.module");
const devolucao_componente_service_1 = require("./business/devolucao-componente.service");
const trabalho_entity_1 = require("../trabalho/domain/trabalho.entity");
const veiculo_entity_1 = require("./domain/veiculo.entity");
const abastecimento_entity_1 = require("./domain/abastecimento.entity");
const fornecedor_logistica_entity_1 = require("./domain/fornecedor-logistica.entity");
const entrega_entity_1 = require("./domain/entrega.entity");
const aporte_entity_1 = require("./domain/aporte.entity");
const emprestimo_entity_1 = require("./domain/emprestimo.entity");
const emprestimo_movimentacao_entity_1 = require("./domain/emprestimo-movimentacao.entity");
const socio_entity_1 = require("./domain/socio.entity");
const credor_entity_1 = require("./domain/credor.entity");
const configuracao_km_entity_1 = require("./domain/configuracao-km.entity");
const pagamento_km_entity_1 = require("./domain/pagamento-km.entity");
const arquivo_ofx_entity_1 = require("./domain/arquivo-ofx.entity");
const transacao_ofx_entity_1 = require("./domain/transacao-ofx.entity");
const conciliacao_transacao_entity_1 = require("./domain/conciliacao-transacao.entity");
const retirada_entity_1 = require("./domain/retirada.entity");
const fornecedor_entity_1 = require("./domain/fornecedor.entity");
const fornecedor_service_1 = require("./business/fornecedor.service");
const fatura_devolucao_item_entity_1 = require("./domain/fatura-devolucao-item.entity");
const componente_entity_1 = require("../componente/domain/componente.entity");
const fornecedor_controller_1 = require("./controller/fornecedor.controller");
const boleto_atrasado_service_1 = require("./business/boleto-atrasado.service");
const combustivel_service_1 = require("./business/combustivel.service");
const logistica_service_1 = require("./business/logistica.service");
const capital_service_1 = require("./business/capital.service");
const socio_credor_service_1 = require("./business/socio-credor.service");
const ofx_service_1 = require("./business/ofx.service");
const conciliacao_service_1 = require("./business/conciliacao.service");
const classificacao_lancamento_service_1 = require("./business/classificacao-lancamento.service");
const retirada_service_1 = require("./business/retirada.service");
const boleto_atrasado_controller_1 = require("./controller/boleto-atrasado.controller");
const combustivel_controller_1 = require("./controller/combustivel.controller");
const logistica_controller_1 = require("./controller/logistica.controller");
const capital_controller_1 = require("./controller/capital.controller");
const socio_credor_controller_1 = require("./controller/socio-credor.controller");
const ofx_controller_1 = require("./controller/ofx.controller");
const conciliacao_controller_1 = require("./controller/conciliacao.controller");
const retirada_controller_1 = require("./controller/retirada.controller");
const trabalho_module_1 = require("../trabalho/trabalho.module");
let FinanceiroModule = class FinanceiroModule {
};
exports.FinanceiroModule = FinanceiroModule;
exports.FinanceiroModule = FinanceiroModule = __decorate([
    (0, common_1.Module)({
        imports: [
            schedule_1.ScheduleModule.forRoot(),
            typeorm_1.TypeOrmModule.forFeature([
                conta_entity_1.Conta, lancamento_entity_1.Lancamento, parcela_entity_1.Parcela, movimentacao_entity_1.Movimentacao, fatura_entity_1.Fatura, ordemServico_entity_1.OrdemServico, categoria_entity_1.Categoria, lancamento_recorrente_entity_1.LancamentoRecorrente, ordemServicoItem_entity_1.OrdemServicoItem,
                devolucao_componente_entity_1.DevolucaoComponente, trabalho_entity_1.Trabalho, veiculo_entity_1.Veiculo, abastecimento_entity_1.Abastecimento, fornecedor_logistica_entity_1.FornecedorLogistica, fornecedor_entity_1.Fornecedor, entrega_entity_1.Entrega, aporte_entity_1.Aporte, emprestimo_entity_1.Emprestimo, emprestimo_movimentacao_entity_1.EmprestimoMovimentacao, socio_entity_1.Socio, credor_entity_1.Credor,
                configuracao_km_entity_1.ConfiguracaoKm, pagamento_km_entity_1.PagamentoKm, arquivo_ofx_entity_1.ArquivoOfx, transacao_ofx_entity_1.TransacaoOfx, conciliacao_transacao_entity_1.ConciliacaoTransacao, retirada_entity_1.Retirada, fatura_devolucao_item_entity_1.FaturaDevolucaoItem, componente_entity_1.Componente
            ]),
            ordem_servico_module_1.OrdemServicoModule,
            estoque_module_1.EstoqueModule,
            (0, common_1.forwardRef)(() => trabalho_module_1.TrabalhoModule),
        ],
        controllers: [
            financeiro_controller_1.FinanceiroController,
            fatura_controller_1.FaturaController,
            categoria_controller_1.CategoriaController,
            fornecedor_controller_1.FornecedorController,
            devolucao_componente_controller_1.DevolucaoComponenteController,
            boleto_atrasado_controller_1.BoletoAtrasadoController,
            combustivel_controller_1.CombustivelController,
            logistica_controller_1.LogisticaController,
            capital_controller_1.CapitalController,
            socio_credor_controller_1.SocioCredorController,
            ofx_controller_1.OfxController,
            conciliacao_controller_1.ConciliacaoController,
            retirada_controller_1.RetiradaController
        ],
        providers: [
            financeiro_service_1.FinanceiroService,
            fatura_service_1.FaturaService,
            lancamento_recorrente_service_1.LancamentoRecorrenteService,
            fatura_recorrente_service_1.FaturaRecorrenteService,
            categoria_service_1.CategoriaService,
            fornecedor_service_1.FornecedorService,
            devolucao_componente_service_1.DevolucaoComponenteService,
            boleto_atrasado_service_1.BoletoAtrasadoService,
            combustivel_service_1.CombustivelService,
            logistica_service_1.LogisticaService,
            capital_service_1.CapitalService,
            socio_credor_service_1.SocioCredorService,
            ofx_service_1.OfxService,
            conciliacao_service_1.ConciliacaoService,
            retirada_service_1.RetiradaService,
            classificacao_lancamento_service_1.ClassificacaoLancamentoService
        ],
        exports: [financeiro_service_1.FinanceiroService, fatura_service_1.FaturaService, devolucao_componente_service_1.DevolucaoComponenteService],
    })
], FinanceiroModule);
//# sourceMappingURL=financeiro.module.js.map
import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FinanceiroService } from './business/financeiro.service';
import { Conta } from './domain/conta.entity';
import { Lancamento } from './domain/lancamento.entity';
import { Parcela } from './domain/parcela.entity';
import { Movimentacao } from './domain/movimentacao.entity';
import { FinanceiroController } from './controller/financeiro.controller';
import { OrdemServicoModule } from '../ordemServico/ordem-servico.module';
import { FaturaController } from './controller/fatura.controller';
import { FaturaService } from './business/fatura.service';
import { Fatura } from './domain/fatura.entity';
import { OrdemServico } from '../ordemServico/domain/ordemServico.entity';
import { ScheduleModule } from '@nestjs/schedule';
import { LancamentoRecorrenteService } from './business/lancamento-recorrente.service';
import { LancamentoRecorrente } from './domain/lancamento-recorrente.entity';
import { FaturaRecorrenteService } from './business/fatura-recorrente.service';
import { Categoria } from './domain/categoria.entity';
import { CategoriaService } from './business/categoria.service';
import { OrdemServicoItem } from '../ordemServico/domain/ordemServicoItem.entity';
import { DevolucaoComponenteController } from './controller/devolucao-componente.controller';
import { CategoriaController } from './controller/categoria.controller';
import { DevolucaoComponente } from './domain/devolucao-componente.entity';
import { EstoqueModule } from '../estoque/estoque/estoque.module';
import { DevolucaoComponenteService } from './business/devolucao-componente.service';
import { Trabalho } from '../trabalho/domain/trabalho.entity';
import { Veiculo } from './domain/veiculo.entity';
import { Abastecimento } from './domain/abastecimento.entity';
import { FornecedorLogistica } from './domain/fornecedor-logistica.entity';
import { Entrega } from './domain/entrega.entity';
import { Aporte } from './domain/aporte.entity';
import { Emprestimo } from './domain/emprestimo.entity';
import { EmprestimoMovimentacao } from './domain/emprestimo-movimentacao.entity';
import { Socio } from './domain/socio.entity';
import { Credor } from './domain/credor.entity';
import { ConfiguracaoKm } from './domain/configuracao-km.entity';
import { PagamentoKm } from './domain/pagamento-km.entity';
import { ArquivoOfx } from './domain/arquivo-ofx.entity';
import { TransacaoOfx } from './domain/transacao-ofx.entity';
import { ConciliacaoTransacao } from './domain/conciliacao-transacao.entity';
import { Retirada } from './domain/retirada.entity';
import { Fornecedor } from './domain/fornecedor.entity';
import { FornecedorService } from './business/fornecedor.service';
import { FaturaDevolucaoItem } from './domain/fatura-devolucao-item.entity';
import { Componente } from '../componente/domain/componente.entity';
import { FornecedorController } from './controller/fornecedor.controller';
import { BoletoAtrasadoService } from './business/boleto-atrasado.service';
import { CombustivelService } from './business/combustivel.service';
import { LogisticaService } from './business/logistica.service';
import { CapitalService } from './business/capital.service';
import { SocioCredorService } from './business/socio-credor.service';
import { OfxService } from './business/ofx.service';
import { ConciliacaoService } from './business/conciliacao.service';
import { ClassificacaoLancamentoService } from './business/classificacao-lancamento.service';
import { RetiradaService } from './business/retirada.service';
import { BoletoAtrasadoController } from './controller/boleto-atrasado.controller';
import { CombustivelController } from './controller/combustivel.controller';
import { LogisticaController } from './controller/logistica.controller';
import { CapitalController } from './controller/capital.controller';
import { SocioCredorController } from './controller/socio-credor.controller';
import { OfxController } from './controller/ofx.controller';
import { ConciliacaoController } from './controller/conciliacao.controller';
import { RetiradaController } from './controller/retirada.controller';
import { TrabalhoModule } from '../trabalho/trabalho.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([
      Conta, Lancamento, Parcela, Movimentacao, Fatura, OrdemServico, Categoria, LancamentoRecorrente, OrdemServicoItem,
      DevolucaoComponente, Trabalho, Veiculo, Abastecimento, FornecedorLogistica, Fornecedor, Entrega, Aporte, Emprestimo, EmprestimoMovimentacao, Socio, Credor,
      ConfiguracaoKm, PagamentoKm, ArquivoOfx, TransacaoOfx, ConciliacaoTransacao, Retirada, FaturaDevolucaoItem, Componente
    ]),
    OrdemServicoModule,
    EstoqueModule,
    forwardRef(() => TrabalhoModule),
  ],
  controllers: [
    FinanceiroController, 
    FaturaController, 
    CategoriaController, 
    FornecedorController,
    DevolucaoComponenteController,
    BoletoAtrasadoController,
    CombustivelController,
    LogisticaController,
    CapitalController,
    SocioCredorController,
    OfxController,
    ConciliacaoController,
    RetiradaController
  ],
  providers: [
    FinanceiroService, 
    FaturaService, 
    LancamentoRecorrenteService, 
    FaturaRecorrenteService, 
    CategoriaService, 
    FornecedorService,
    DevolucaoComponenteService,
    BoletoAtrasadoService,
    CombustivelService,
    LogisticaService,
    CapitalService,
    SocioCredorService,
    OfxService,
    ConciliacaoService,
    RetiradaService,
    ClassificacaoLancamentoService
  ],
  exports: [FinanceiroService, FaturaService, DevolucaoComponenteService],
})
export class FinanceiroModule {}

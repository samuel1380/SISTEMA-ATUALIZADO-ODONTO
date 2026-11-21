import { forwardRef, Logger, Module } from '@nestjs/common';
import { UtilsModule } from 'src/utils';
import { HttpClienteModule } from 'src/libs/httpClient/httpClient.module';
import { TrabalhoRepository } from './repository/trabalho.repository';
import { TrabalhoService } from './business/trabalho.service';
import { TrabalhoController } from './controller/trabalho.controller';
import { ElementosTrabalhoController } from './controller/elementosTrabalho.controller';
import { ElementosTrabalhoService } from './business/elementosTrabalho.service';
import { ComponentesTrabalhoController } from './controller/componentesTrabalho.controller';
import { ComponentesTrabalhoService } from './business/componentesTrabalho.service';
import { HistoricoStatusTrabalhoModule } from '../historicoStatusTrabalho/historicoStatusTrabalho.module';
import { EmpresaModule } from '@hunter-solucoes/node-arqt-base-gerenciador-usuarios';
import { TabelaPrecoProdutoModule } from '../tabelaPrecoProduto/tabelaPrecoProduto.module';
import { EmpresaTabelaPrecoModule } from '../empresaTabelaPreco/empresaTabelaPreco.module';
import { ComponenteModule } from '../componente/componente.module';
import { CadastroComplementarEmpresaModule } from '../cadastroComplementarEmpresa/cadastroComplementarEmpresa.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ComponentesTrabalho } from './domain/componentesTrabalho.entity';
import { ElementosTrabalho } from './domain/elementosTrabalho.entity';
import { Trabalho } from './domain/trabalho.entity';
import { OrdemServicoItem } from '@src/app/ordemServico/domain/ordemServicoItem.entity';
import { TrabalhoMotivo } from './domain/trabalhoMotivo.entity';
import { Motivo } from '../motivo/domain/motivo.entity';
import { EstoqueModule } from '../estoque/estoque/estoque.module';
import { TransferenciaModule } from '../estoque/transferencia/transferencia.module';
import { AlmoxarifadoModule } from '../estoque/almoxarifado/almoxarifado.module';
import { OrdemServicoModule } from '../ordemServico/ordem-servico.module';
import { PacienteModule } from '../paciente/paciente.module';
import { FinanceiroModule } from '../financeiro/financeiro.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ComponentesTrabalho, ElementosTrabalho, Trabalho, OrdemServicoItem, TrabalhoMotivo, Motivo]),
    UtilsModule,
    HttpClienteModule,
    HistoricoStatusTrabalhoModule,
    EmpresaModule,
    CadastroComplementarEmpresaModule,
    OrdemServicoModule,
    TabelaPrecoProdutoModule,
    EmpresaTabelaPrecoModule,
    ComponenteModule,
    EstoqueModule,
    TransferenciaModule,
    AlmoxarifadoModule,
    forwardRef(() => PacienteModule),
    forwardRef(() => FinanceiroModule)
  ],
  controllers: [
    TrabalhoController,
    ElementosTrabalhoController,
    ComponentesTrabalhoController
  ],
  providers: [
    TrabalhoRepository,
    TrabalhoService,
    ElementosTrabalhoService,
    ComponentesTrabalhoService,
    Logger
  ],
  exports: [TrabalhoService]
})
export class TrabalhoModule { }

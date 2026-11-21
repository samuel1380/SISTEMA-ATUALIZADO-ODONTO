import { AuthModule, PedidoModule, CategoriaProdutoModule } from '@hunter-solucoes/node-arqt-base-gerenciador-usuarios/dist';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { TypeOrmCompatModule } from './typeorm-compat.module';
import { GerenciadorEmpresaModule } from './app/empresa/empresa.module';

import { databaseConfig } from './config/database.config';
import { HttpClienteModule } from './libs/httpClient/httpClient.module';
import { TrabalhoModule } from './app/trabalho/trabalho.module';
import { ArquivoTrabalhoModule } from './app/arquivoTrabalho/arquivoTrabalho.module';
import { FotoPacienteModule } from './app/fotoPaciente/fotoPaciente.module';
import { LocalidadeModule } from './app/localidade/localidade.module';
import { ProdutoEmpresaModule } from './app/produtosEmpresa/produtoEmpresa.module';
import { CadastroComplementarEmpresaModule } from './app/cadastroComplementarEmpresa/cadastroComplementarEmpresa.module';
import { MarcaComponenteModule } from './app/marcaComponente/marcaComponente.module';
import { CorModule } from './app/cor/cor.module';
import { DentistaModule } from './app/dentista/dentista.module';
import { TabelaPrecoProdutoModule } from './app/tabelaPrecoProduto/tabelaPrecoProduto.module';
import { EmpresaTabelaPrecoModule } from './app/empresaTabelaPreco/empresaTabelaPreco.module';
import { HistoricoStatusTrabalhoModule } from './app/historicoStatusTrabalho/historicoStatusTrabalho.module';
import { EstoqueModule } from './app/estoque/estoque/estoque.module';
import { TransferenciaModule } from './app/estoque/transferencia/transferencia.module';
import { AlmoxarifadoModule } from './app/estoque/almoxarifado/almoxarifado.module';
import { FinanceiroModule } from './app/financeiro/financeiro.module';
import { UsuarioModule } from './app/usuario/usuario.module';
import { ProdutoCustomModule } from './app/produto/produto.module';
import { MotivoModule } from './app/motivo/motivo.module';
import { LogsModule } from './app/logs/logs.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(databaseConfig),
    TypeOrmCompatModule,
    EventEmitterModule.forRoot(),
    HttpClienteModule,
    AuthModule,
    GerenciadorEmpresaModule,
    ProdutoCustomModule,
    PedidoModule,
    // AppModuleFinanceiro,
    TrabalhoModule,
    // ArquivoTrabalhoModule,
    // FotoPacienteModule,
    LocalidadeModule,
    ProdutoEmpresaModule,
    CadastroComplementarEmpresaModule,
    MarcaComponenteModule,
    CorModule,
    DentistaModule,
    CategoriaProdutoModule,
    TabelaPrecoProdutoModule,
    EmpresaTabelaPrecoModule,
    HistoricoStatusTrabalhoModule,
    EstoqueModule,
    TransferenciaModule,
    AlmoxarifadoModule,
    FinanceiroModule,
    UsuarioModule,
    MotivoModule,
    LogsModule,
  ],
  controllers: [],
  providers: [],
  exports: []
})
export class AppModule {}

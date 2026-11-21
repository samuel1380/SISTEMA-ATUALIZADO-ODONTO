import { Module } from '@nestjs/common';
import { UtilsModule } from 'src/utils';
import { HttpClienteModule } from 'src/libs/httpClient/httpClient.module';
import { CadastroComplementarEmpresaController } from './controller/cadastroComplementarEmpresa.controller';
import { CadastroComplementarEmpresaService } from './business/cadastroComplementarEmpresa.service';
import { CadastroComplementarEmpresaRepository } from './repository/cadastroComplementarEmpresa.repository';
import { ProdutoEmpresaModule } from '../produtosEmpresa/produtoEmpresa.module';
import { ComponenteEmpresaModule } from '../componenteEmpresa/componente.module';
import { CorEmpresaModule } from '../corEmpresa/cor.module';
import { DentistaModule } from '../dentista/dentista.module';
import { ProdutoCustomModule } from '../produto/produto.module';
import { ComponenteModule } from '../componente/componente.module';
import { CorModule } from '../cor/cor.module';
import { TabelaPrecoProdutoModule } from '../tabelaPrecoProduto/tabelaPrecoProduto.module';
import { CadastroComplementarEmpresa } from './domain/cadastroComplementarEmpresa.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forFeature([CadastroComplementarEmpresa]),
    UtilsModule,
    HttpClienteModule,
    ProdutoEmpresaModule,
    ComponenteEmpresaModule,
    CorEmpresaModule,
    DentistaModule,
    ProdutoCustomModule,
    ComponenteModule,
    CorModule,
    TabelaPrecoProdutoModule
  ],
  controllers: [CadastroComplementarEmpresaController],
  providers: [CadastroComplementarEmpresaService, CadastroComplementarEmpresaRepository],
  exports: [CadastroComplementarEmpresaService]
})
export class CadastroComplementarEmpresaModule { }

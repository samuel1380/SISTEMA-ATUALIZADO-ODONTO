import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsuarioModule } from '@hunter-solucoes/node-arqt-base-gerenciador-usuarios/dist';
import { EmpresaTabelaPreco } from './domain/empresaTabelaPreco.entity';
import { EmpresaTabelaPrecoService } from './business/empresaTabelaPreco.service';
import { EmpresaTabelaPrecoController } from './controller/empresaTabelaPreco.controller';
import { TabelaPrecoProdutoModule } from '../tabelaPrecoProduto/tabelaPrecoProduto.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([EmpresaTabelaPreco]),
    UsuarioModule,
    TabelaPrecoProdutoModule,
  ],
  controllers: [EmpresaTabelaPrecoController],
  providers: [EmpresaTabelaPrecoService],
  exports: [EmpresaTabelaPrecoService],
})
export class EmpresaTabelaPrecoModule {}

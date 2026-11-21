import { Module } from '@nestjs/common';
import { ProdutoEmpresaController } from './controller/produtosEmpresa.controller';
import { ProdutoEmpresaService } from './business/produtosEmpresa.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProdutoEmpresa } from './domain/produtosCategoriaEmpresa.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProdutoEmpresa])
  ],
  controllers: [ ProdutoEmpresaController ],
  providers: [ProdutoEmpresaService],
  exports: [ProdutoEmpresaService]
})
export class ProdutoEmpresaModule { }

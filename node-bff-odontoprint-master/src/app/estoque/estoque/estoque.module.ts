import { Logger, Module } from '@nestjs/common';
import { EstoqueController } from './controller/estoque.controller';
import { EstoqueService } from './service/estoque.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Estoque } from './domain/estoque.entity';
import { EstoqueHistoricoConsumo } from './domain/estoque-historico-consumo.entity';
import { Almoxarifado } from '../almoxarifado/domain/almoxarifado.entity';
import { Componente } from '@src/app/componente/domain/componente.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Estoque, EstoqueHistoricoConsumo, Almoxarifado, Componente])
  ],
  controllers: [EstoqueController],
  providers: [EstoqueService, Logger],
  exports: [EstoqueService]
})
export class EstoqueModule {}


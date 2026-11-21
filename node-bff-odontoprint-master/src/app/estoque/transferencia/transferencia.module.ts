import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransferenciaController } from './controller/transferencia.controller';
import { Transferencia } from './domain/transferencia.entity';
import { TransferenciaService } from './service/transferencia.service';
import { Estoque } from '../estoque/domain/estoque.entity';
import { EstoqueModule } from '../estoque/estoque.module';
import { AlmoxarifadoModule } from '../almoxarifado/almoxarifado.module';

@Module({
  imports: [TypeOrmModule.forFeature([Transferencia, Estoque, Transferencia]), EstoqueModule, AlmoxarifadoModule],
  controllers: [TransferenciaController],
  providers: [TransferenciaService],
  exports: [TransferenciaService]
})
export class TransferenciaModule {}

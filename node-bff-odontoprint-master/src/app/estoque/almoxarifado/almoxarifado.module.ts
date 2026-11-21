import { Logger, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Almoxarifado } from './domain/almoxarifado.entity';
import { AlmoxarifadoService } from './service/almoxarifado.service';
import { AlmoxarifadoController } from './controller/almoxarifado.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Almoxarifado])],
  controllers: [AlmoxarifadoController],
  providers: [AlmoxarifadoService, Logger],
  exports: [AlmoxarifadoService], // Exportar para usar em outros módulos (como Transferencia)
})
export class AlmoxarifadoModule {}

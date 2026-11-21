import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ComponenteEmpresa } from './domain/componenteEmpresa.entity';
import { ComponenteEmpresaService } from './business/componenteEmpresa.service';
import { ComponenteEmpresaController } from './controller/componenteEmpresa.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ComponenteEmpresa])],
  controllers: [ComponenteEmpresaController],
  providers: [ComponenteEmpresaService],
  exports: [ComponenteEmpresaService],
})
export class ComponenteEmpresaModule {}


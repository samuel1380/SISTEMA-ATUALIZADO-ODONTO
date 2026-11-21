import { Module } from '@nestjs/common';
import { CorEmpresaController } from './controller/corEmpresa.controller';
import { CorEmpresaService } from './business/corEmpresa.service';
import { CorEmpresa } from './domain/corEmpresa.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forFeature([CorEmpresa])
  ],
  controllers: [ CorEmpresaController ],
  providers: [CorEmpresaService],
  exports: [CorEmpresaService]
})
export class CorEmpresaModule { }

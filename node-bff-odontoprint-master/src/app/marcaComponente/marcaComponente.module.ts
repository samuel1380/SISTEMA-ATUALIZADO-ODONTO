import { Module } from '@nestjs/common';
import { UtilsModule } from 'src/utils';
import { HttpClienteModule } from 'src/libs/httpClient/httpClient.module';
import { MarcaComponenteController } from './controller/marcaComponente.controller';
import { MarcaComponenteService } from './business/marcaComponente.service';
import { ComponenteModule } from '../componente/componente.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MarcaComponente } from './domain/marcaComponente.entity';

@Module({
  imports: [
    UtilsModule,
    HttpClienteModule,
    ComponenteModule,
    TypeOrmModule.forFeature([MarcaComponente])
  ],
  controllers: [ MarcaComponenteController ],
  providers: [MarcaComponenteService],
  exports: [MarcaComponenteService]
})
export class MarcaComponenteModule { }

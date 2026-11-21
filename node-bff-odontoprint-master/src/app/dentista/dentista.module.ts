import { Module } from '@nestjs/common';
import { DentistaService } from './business/dentista.service';
import { DentistaController } from './controller/dentista.controller';
import { UsuarioModule } from '@hunter-solucoes/node-arqt-base-gerenciador-usuarios/dist';
import { Dentista } from './domain/dentista.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    UsuarioModule,
    TypeOrmModule.forFeature([Dentista])
  ],
  controllers: [ DentistaController ],
  providers: [DentistaService],
  exports: [DentistaService]
})
export class DentistaModule { }

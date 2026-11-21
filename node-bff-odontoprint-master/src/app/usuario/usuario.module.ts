import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsuarioModule as BaseUsuarioModule } from '@hunter-solucoes/node-arqt-base-gerenciador-usuarios/dist';
import { Usuario } from '@hunter-solucoes/node-arqt-base-gerenciador-usuarios/dist/src/app/usuario/domain/usuario.entity';
import { UsuarioController } from './controller/usuario.controller';
import { UsuarioService } from './business/usuario.service';

@Module({
  imports: [
    BaseUsuarioModule,
    TypeOrmModule.forFeature([Usuario]),
  ],
  controllers: [UsuarioController],
  providers: [UsuarioService],
  exports: [UsuarioService],
})
export class UsuarioModule {}

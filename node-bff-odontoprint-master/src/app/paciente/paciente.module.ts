import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PacienteService } from './business/paciente.service';
import {
  AuthModule,
  EmpresaModule,
} from '@hunter-solucoes/node-arqt-base-gerenciador-usuarios';
import { Trabalho } from '../trabalho/domain/trabalho.entity';
import { Paciente } from './domain/paciente.entity';
import { PacienteController } from './controller/paciente.controller';
import { TrabalhoModule } from '../trabalho/trabalho.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Paciente, Trabalho]),
    forwardRef(() => TrabalhoModule),
    AuthModule,
    EmpresaModule,
  ],
  controllers: [PacienteController],
  providers: [PacienteService],
  exports: [PacienteService],
})
export class PacienteModule {}

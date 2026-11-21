import { Module } from '@nestjs/common';
import { ComponenteService } from './business/componente.service';
import { ComponenteController } from './controller/componente.controller';
import { Componente } from './domain/componente.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forFeature([Componente])
  ],
  controllers: [ ComponenteController ],
  providers: [ComponenteService],
  exports: [ComponenteService]
})
export class ComponenteModule { }

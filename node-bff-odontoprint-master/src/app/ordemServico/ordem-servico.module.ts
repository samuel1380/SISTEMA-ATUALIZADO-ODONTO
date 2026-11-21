import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdemServico } from './domain/ordemServico.entity';
import { OrdemServicoItem } from './domain/ordemServicoItem.entity';
import { OrdemServicoController } from './controller/ordemServico.controller';
import { OrdemServicoService } from './business/ordemServico.service';


@Module({
imports: [TypeOrmModule.forFeature([OrdemServico, OrdemServicoItem])],
  controllers: [ OrdemServicoController ],
  providers: [OrdemServicoService],
  exports: [OrdemServicoService]
})
export class OrdemServicoModule { }

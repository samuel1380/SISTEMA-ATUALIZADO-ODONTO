import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { FaturaService } from './fatura.service';
import { InjectRepository } from '@nestjs/typeorm';
import { OrdemServico, StatusOrdemServico } from '@src/app/ordemServico/domain/ordemServico.entity';
import { Between, IsNull, Repository } from 'typeorm';

@Injectable()
export class FaturaRecorrenteService {
  private readonly logger = new Logger(FaturaRecorrenteService.name);
  private jaExecutadoEsteMes = false;

  constructor(
    private readonly faturaService: FaturaService,
    @InjectRepository(OrdemServico)
    private readonly osRepository: Repository<OrdemServico>,
  ) {}

  /**
   * JOB que roda todo dia às 2h da manhã.
   * Verifica se é dia 31 ou dia 01 e adiciona trabalhos enviados às faturas mais recentes abertas.
   */
  @Cron('0 2 * * *')
  async adicionarTrabalhosEnviadosAFaturas() {
    const hoje = new Date();
    const dia = hoje.getDate();

    this.logger.log(`Executando JOB para adicionar trabalhos enviados às faturas (dia ${dia})...`);

    try {
      const resultado = await this.faturaService.adicionarTrabalhosEnviadosAFatura();
      this.logger.log(
        `JOB concluído: ${resultado.adicionados} trabalhos adicionados a ${resultado.faturasAtualizadas} faturas.`
      );

      // Garante que faturas e OSs permaneçam organizadas no mês correto de competência
      const resultadoOrg = await this.faturaService.organizarFaturasNoMesCorreto();
      if (resultadoOrg.ordensMovidas > 0) {
        this.logger.log(
          `JOB organização de faturas: ${resultadoOrg.ordensMovidas} OS(s) reorganizada(s) para o mês correto.`
        );
      }
    } catch (error) {
      this.logger.error(`Erro ao executar JOB de adicionar trabalhos enviados às faturas: ${error.message}`, error.stack);
    }
  }
}

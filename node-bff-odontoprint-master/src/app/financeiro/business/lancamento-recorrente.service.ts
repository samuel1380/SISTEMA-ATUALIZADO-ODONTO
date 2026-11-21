import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { LancamentoRecorrente, Periodicidade } from '../domain/lancamento-recorrente.entity';
import { FinanceiroService } from './financeiro.service';
import { MeioPagamento } from '../domain/parcela.entity';

@Injectable()
export class LancamentoRecorrenteService {
  private readonly logger = new Logger(LancamentoRecorrenteService.name);

  constructor(
    @InjectRepository(LancamentoRecorrente)
    private readonly recorrenteRepo: Repository<LancamentoRecorrente>,
    private readonly financeiroService: FinanceiroService,
  ) {}

  // Este método rodará no primeiro dia de cada mês, à 1 da manhã.
  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
  async gerarLancamentosRecorrentes() {
    this.logger.log('Iniciando a geração de lançamentos recorrentes mensais...');

    const recorrentes = await this.recorrenteRepo.find({ where: { ativo: true, periodicidade: Periodicidade.MENSAL } });

    if (recorrentes.length === 0) {
      this.logger.log('Nenhum lançamento recorrente ativo para gerar.');
      return;
    }

    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = hoje.getMonth(); // 0-11

    for (const recorrente of recorrentes) {
      const dataCompetencia = new Date(ano, mes, 1);
      const dataVencimento = new Date(ano, mes, recorrente.diaVencimento);

      await this.financeiroService.criarLancamento({
        descricao: `${recorrente.descricao} - Competência ${String(mes + 1).padStart(2, '0')}/${ano}`,
        tipo: recorrente.tipo,
        valorTotal: recorrente.valorEstimado,
        dataCompetencia: dataCompetencia.toISOString().split('T')[0],
        idClienteFornecedor: recorrente.idClienteFornecedor,
        parcelas: [{
          numeroParcela: 1,
          valor: recorrente.valorEstimado,
          dataVencimento: dataVencimento.toISOString().split('T')[0],
          meioPagamento: MeioPagamento.BOLETO, // Padrão, pode ser ajustado
        }],
      });

      this.logger.log(`Lançamento gerado para: ${recorrente.descricao}`);
    }

    this.logger.log('Geração de lançamentos recorrentes concluída.');
  }
}

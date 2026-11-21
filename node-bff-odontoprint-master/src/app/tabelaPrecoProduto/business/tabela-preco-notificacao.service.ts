import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { TabelaPrecoProdutoService } from './tabelaPrecoProduto.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class TabelaPrecoNotificacaoService {
  private readonly logger = new Logger(TabelaPrecoNotificacaoService.name);

  constructor(
    private readonly tabelaPrecoProdutoService: TabelaPrecoProdutoService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * JOB que roda diariamente às 6h da manhã.
   * Verifica tabelas de preço próximas do vencimento e emite evento para notificação.
   */
  @Cron('0 6 * * *')
  async verificarTabelasProximasVencimento() {
    this.logger.log('Executando verificação de tabelas de preço próximas do vencimento...');

    try {
      // Verificar tabelas que vencem nos próximos 30 dias
      const tabelasProximasVencimento = await this.tabelaPrecoProdutoService.buscarTabelasProximasVencimento(30);

      if (tabelasProximasVencimento.length > 0) {
        this.logger.warn(
          `Encontradas ${tabelasProximasVencimento.length} tabela(s) de preço próxima(s) do vencimento.`
        );

        // Emitir evento para notificação de administradores
        this.eventEmitter.emit('tabela.preco.vencimento.proximo', {
          tabelas: tabelasProximasVencimento,
          quantidade: tabelasProximasVencimento.length,
        });
      } else {
        this.logger.log('Nenhuma tabela de preço próxima do vencimento encontrada.');
      }
    } catch (error) {
      this.logger.error(
        `Erro ao verificar tabelas próximas do vencimento: ${error.message}`,
        error.stack
      );
    }
  }
}

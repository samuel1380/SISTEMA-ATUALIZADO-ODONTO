-- Acréscimos (juros/multa) por parcela — espelha movimentações de recebimento (CREDITO + valorAcrescimo).

ALTER TABLE TbFinanceiroParcela
  ADD COLUMN valorAcrescimoAcumulado DECIMAL(15, 2) NOT NULL DEFAULT 0
  COMMENT 'Soma dos acréscimos (juros/multa) nos recebimentos desta parcela (RECEITA)'
  AFTER valorPago;

UPDATE TbFinanceiroParcela p
INNER JOIN TbFinanceiroLancamento l ON l.idLancamento = p.idLancamento
SET p.valorAcrescimoAcumulado = COALESCE(
  (
    SELECT SUM(m.valorAcrescimo)
    FROM TbFinanceiroMovimentacao m
    WHERE m.idParcelaOrigem = p.idParcela
      AND m.tipo = 'CREDITO'
  ),
  0
)
WHERE l.tipo = 'RECEITA';

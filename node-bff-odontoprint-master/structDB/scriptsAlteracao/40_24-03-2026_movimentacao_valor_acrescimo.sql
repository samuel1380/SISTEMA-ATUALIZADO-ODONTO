-- =====================================================================================
-- SCRIPT: Coluna valorAcrescimo em TbFinanceiroMovimentacao (juros/multa separados)
-- =====================================================================================
-- Execute UMA VEZ no banco (MySQL) antes de usar o BFF com acréscimo no pagamento.
--
-- Como aplicar:
--   mysql -h HOST -u USUARIO -p NOME_DO_BANCO < structDB/scriptsAlteracao/40_24-03-2026_movimentacao_valor_acrescimo.sql
-- =====================================================================================

START TRANSACTION;

ALTER TABLE `TbFinanceiroMovimentacao`
  ADD COLUMN `valorAcrescimo` DECIMAL(15, 2) NOT NULL DEFAULT 0.00
  COMMENT 'Juros/multa em recebimentos (separado do principal em valor)'
  AFTER `valor`;

COMMIT;

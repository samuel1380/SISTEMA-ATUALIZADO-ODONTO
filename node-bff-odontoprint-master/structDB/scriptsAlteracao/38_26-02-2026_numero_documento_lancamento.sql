-- =====================================================================================
-- SCRIPT: Número de documento no lançamento (contas a pagar / contas a receber)
-- =====================================================================================
--
-- OBJETIVO: Adicionar campo opcional numeroDocumento em TbFinanceiroLancamento
--           para identificar documento fiscal, nota, boleto etc.
--
-- =====================================================================================

START TRANSACTION;

ALTER TABLE `TbFinanceiroLancamento`
  ADD COLUMN `numeroDocumento` VARCHAR(100) NULL DEFAULT NULL
  COMMENT 'Número do documento (nota fiscal, boleto, recibo etc.) - opcional'
  AFTER `dataEmissao`;

COMMIT;

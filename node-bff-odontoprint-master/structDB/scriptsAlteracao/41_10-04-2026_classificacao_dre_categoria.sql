-- =====================================================================================
-- ALTERAÇÃO: CLASSIFICAÇÃO DRE EM CATEGORIAS FINANCEIRAS
-- =====================================================================================
--
-- OBJETIVO:
-- - Adicionar o campo `classificacaoDre` em `TbFinanceiroCategoria` para separar
--   classificações da DRE (Operacional / Investimento / Aporte / Saída de financiamento)
--   sem alterar o `tipo` existente (RECEITA / DESPESA).
--
-- OBS:
-- - Default/backfill: por compatibilidade, categorias existentes viram OPERACIONAL_RECEITA
--   ou OPERACIONAL_DESPESA de acordo com o `tipo`.
--
-- =====================================================================================

START TRANSACTION;

ALTER TABLE `TbFinanceiroCategoria`
  ADD COLUMN `classificacaoDre` ENUM(
    'OPERACIONAL_RECEITA',
    'OPERACIONAL_DESPESA',
    'INVESTIMENTO',
    'APORTE',
    'SAIDA_FINANCIAMENTO'
  ) NULL AFTER `tipo`;

UPDATE `TbFinanceiroCategoria`
SET `classificacaoDre` = CASE
  WHEN `classificacaoDre` IS NOT NULL THEN `classificacaoDre`
  WHEN `tipo` = 'RECEITA' THEN 'OPERACIONAL_RECEITA'
  ELSE 'OPERACIONAL_DESPESA'
END;

ALTER TABLE `TbFinanceiroCategoria`
  MODIFY COLUMN `classificacaoDre` ENUM(
    'OPERACIONAL_RECEITA',
    'OPERACIONAL_DESPESA',
    'INVESTIMENTO',
    'APORTE',
    'SAIDA_FINANCIAMENTO'
  ) NOT NULL;

COMMIT;


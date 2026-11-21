-- =====================================================================================
-- SCRIPT DE ATUALIZAÇÃO DA TABELA DE ORDEM DE SERVIÇO
-- =====================================================================================
-- OBJETIVO: Adicionar a coluna `dataConcluido` na tabela `TbOrdemServico` para
--           registrar a data e hora exatas em que uma OS é marcada como concluída.
-- =====================================================================================

START TRANSACTION;

ALTER TABLE `TbOrdemServico` ADD COLUMN `dataConcluido` DATETIME NULL DEFAULT NULL AFTER `concluido`;

COMMIT;

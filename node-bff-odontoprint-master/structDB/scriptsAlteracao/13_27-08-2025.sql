-- =====================================================================================
-- SCRIPT DE ALTERAÇÃO PARA ADICIONAR VÍNCULO DE RETRABALHO
-- =====================================================================================
--
-- OBJETIVO:
-- Adicionar a coluna `idTrabalhoOrigem` na tabela `TbTrabalho` para permitir
-- o rastreamento de trabalhos que são retrabalhos de outros.
--
-- =====================================================================================

ALTER TABLE `TbTrabalho`
ADD COLUMN `idTrabalhoOrigem` INT NULL DEFAULT NULL COMMENT 'Armazena o ID do trabalho original quando este é um retrabalho.'

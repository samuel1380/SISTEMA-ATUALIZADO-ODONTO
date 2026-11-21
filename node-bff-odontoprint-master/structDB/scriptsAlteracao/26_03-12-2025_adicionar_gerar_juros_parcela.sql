-- =====================================================================================
-- SCRIPT DE ALTERAÇÃO: Adicionar campo gerarJuros na tabela TbFinanceiroParcela
-- =====================================================================================
--
-- OBJETIVO:
-- Adicionar campo para controlar se a parcela gera juros ao atrasar
--
-- !!! IMPORTANTE: FAÇA UM BACKUP COMPLETO DO BANCO DE DADOS ANTES DE EXECUTAR !!!
--
-- =====================================================================================

START TRANSACTION;

-- Adicionar campo gerarJuros na tabela TbFinanceiroParcela
ALTER TABLE `TbFinanceiroParcela`
ADD COLUMN `gerarJuros` BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'Indica se a parcela gera juros ao atrasar';

COMMIT;


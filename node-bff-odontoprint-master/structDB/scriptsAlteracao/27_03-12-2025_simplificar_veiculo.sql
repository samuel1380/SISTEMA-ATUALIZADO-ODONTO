-- =====================================================================================
-- SCRIPT DE ALTERAÇÃO: Simplificar tabela TbVeiculo - manter apenas campo nome
-- =====================================================================================
--
-- OBJETIVO:
-- Simplificar a tabela de veículos, removendo campos desnecessários e mantendo
-- apenas o campo "nome" como obrigatório.
--
-- !!! IMPORTANTE: FAÇA UM BACKUP COMPLETO DO BANCO DE DADOS ANTES DE EXECUTAR !!!
--
-- NOTA: Este script verifica a existência das colunas antes de tentar removê-las,
-- pois MySQL não suporta DROP COLUMN IF EXISTS diretamente.
--
-- =====================================================================================

START TRANSACTION;

-- Adicionar coluna nome se não existir
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'TbVeiculo' 
  AND COLUMN_NAME = 'nome';

SET @sql = IF(@col_exists = 0, 
  'ALTER TABLE `TbVeiculo` ADD COLUMN `nome` VARCHAR(255) NOT NULL AFTER `idVeiculo`',
  'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Remover coluna placa se existir
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'TbVeiculo' 
  AND COLUMN_NAME = 'placa';
SET @sql = IF(@col_exists > 0, 'ALTER TABLE `TbVeiculo` DROP COLUMN `placa`', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Remover coluna marca se existir
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'TbVeiculo' 
  AND COLUMN_NAME = 'marca';
SET @sql = IF(@col_exists > 0, 'ALTER TABLE `TbVeiculo` DROP COLUMN `marca`', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Remover coluna modelo se existir
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'TbVeiculo' 
  AND COLUMN_NAME = 'modelo';
SET @sql = IF(@col_exists > 0, 'ALTER TABLE `TbVeiculo` DROP COLUMN `modelo`', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Remover coluna ano se existir
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'TbVeiculo' 
  AND COLUMN_NAME = 'ano';
SET @sql = IF(@col_exists > 0, 'ALTER TABLE `TbVeiculo` DROP COLUMN `ano`', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Remover coluna tipoCombustivel se existir
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'TbVeiculo' 
  AND COLUMN_NAME = 'tipoCombustivel';
SET @sql = IF(@col_exists > 0, 'ALTER TABLE `TbVeiculo` DROP COLUMN `tipoCombustivel`', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Remover coluna consumoMedio se existir
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'TbVeiculo' 
  AND COLUMN_NAME = 'consumoMedio';
SET @sql = IF(@col_exists > 0, 'ALTER TABLE `TbVeiculo` DROP COLUMN `consumoMedio`', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Remover coluna idEmpresa se existir
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'TbVeiculo' 
  AND COLUMN_NAME = 'idEmpresa';
SET @sql = IF(@col_exists > 0, 'ALTER TABLE `TbVeiculo` DROP COLUMN `idEmpresa`', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Garantir que a coluna nome seja NOT NULL
ALTER TABLE `TbVeiculo`
MODIFY COLUMN `nome` VARCHAR(255) NOT NULL;

COMMIT;


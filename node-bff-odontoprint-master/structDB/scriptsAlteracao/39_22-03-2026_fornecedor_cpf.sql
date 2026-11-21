-- =====================================================================================
-- SCRIPT: Coluna cpf em TbFinanceiroFornecedor + CNPJ opcional
-- =====================================================================================
-- Execute UMA VEZ no banco (MySQL) antes de usar o BFF com a entidade Fornecedor
-- contendo o campo `cpf`.
--
-- Sem esta migração ocorre:
--   Unknown column 'Lancamento__Lancamento_fornecedor.cpf' in 'field list'
--
-- Pré-requisito: tabela TbFinanceiroFornecedor com índice UK_Fornecedor_CNPJ (script 37).
-- Faça backup antes de executar.
--
-- Como aplicar (use o MESMO host/usuário/base do BFF):
--   mysql -h HOST -u USUARIO -p NOME_DO_BANCO < structDB/scriptsAlteracao/39_22-03-2026_fornecedor_cpf.sql
-- Ou cole o conteúdo no MySQL Workbench / DBeaver / phpMyAdmin (aba SQL).
--
-- Depois confira: verificar_fornecedor_cpf.sql (deve listar coluna cpf).
-- =====================================================================================

START TRANSACTION;

ALTER TABLE `TbFinanceiroFornecedor` DROP INDEX `UK_Fornecedor_CNPJ`;

ALTER TABLE `TbFinanceiroFornecedor`
  ADD COLUMN `cpf` VARCHAR(14) NULL DEFAULT NULL COMMENT 'CPF normalizado (11 dígitos)' AFTER `cnpj`,
  MODIFY COLUMN `cnpj` VARCHAR(18) NULL DEFAULT NULL COMMENT 'CNPJ normalizado (14 dígitos)';

CREATE UNIQUE INDEX `UK_Fornecedor_CNPJ` ON `TbFinanceiroFornecedor` (`cnpj`);
CREATE UNIQUE INDEX `UK_Fornecedor_CPF` ON `TbFinanceiroFornecedor` (`cpf`);

COMMIT;

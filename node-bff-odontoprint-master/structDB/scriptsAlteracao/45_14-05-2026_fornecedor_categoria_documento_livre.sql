-- =====================================================================================
-- SCRIPT: TbFinanceiroFornecedor — idCategoria (despesa padrão), CPF/CNPJ texto livre
-- =====================================================================================
-- 1. idCategoria opcional (FK TbFinanceiroCategoria) para classificação automática CAP.
-- 2. cpf/cnpj como VARCHAR(255) sem índice UNIQUE (documento livre, máscaras, etc.).
--
-- !!! FAÇA BACKUP ANTES DE EXECUTAR !!!
-- =====================================================================================

START TRANSACTION;

-- Remove unicidade literal em cpf/cnpj (permite qualquer string / duplicatas visuais)
ALTER TABLE `TbFinanceiroFornecedor` DROP INDEX `UK_Fornecedor_CPF`;
ALTER TABLE `TbFinanceiroFornecedor` DROP INDEX `UK_Fornecedor_CNPJ`;

ALTER TABLE `TbFinanceiroFornecedor`
  MODIFY COLUMN `cpf` VARCHAR(255) NULL DEFAULT NULL COMMENT 'CPF (texto livre)',
  MODIFY COLUMN `cnpj` VARCHAR(255) NULL DEFAULT NULL COMMENT 'CNPJ (texto livre)';

ALTER TABLE `TbFinanceiroFornecedor`
  ADD COLUMN `idCategoria` INT NULL DEFAULT NULL COMMENT 'Categoria de despesa padrão do fornecedor' AFTER `ativo`,
  ADD INDEX `IX_Fornecedor_Categoria` (`idCategoria` ASC);

ALTER TABLE `TbFinanceiroFornecedor`
  ADD CONSTRAINT `FK_Fornecedor_Categoria`
    FOREIGN KEY (`idCategoria`)
    REFERENCES `TbFinanceiroCategoria` (`idCategoria`)
    ON DELETE SET NULL
    ON UPDATE CASCADE;

COMMIT;

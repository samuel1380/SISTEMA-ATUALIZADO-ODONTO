-- =====================================================================================
-- SCRIPT DE CRIAÇÃO E ALTERAÇÃO PARA CATEGORIAS FINANCEIRAS
-- =====================================================================================
--
-- OBJETIVO:
-- 1. Criar a tabela `TbFinanceiroCategoria` para armazenar as categorias de lançamentos.
-- 2. Adicionar a chave estrangeira `idCategoria` na tabela `TbFinanceiroLancamento`.
--
-- =====================================================================================

START TRANSACTION;

-- Tabela 1: Categorias de Lançamentos (TbFinanceiroCategoria)
CREATE TABLE IF NOT EXISTS `TbFinanceiroCategoria` (
  `idCategoria` INT NOT NULL AUTO_INCREMENT,
  `nome` VARCHAR(100) NOT NULL,
  `tipo` ENUM('RECEITA', 'DESPESA') NOT NULL,
  `dataInclusao` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `dataAlteracao` DATETIME NULL ON UPDATE CURRENT_TIMESTAMP,
  `dataExclusao` DATETIME NULL,
  PRIMARY KEY (`idCategoria`)
) ENGINE=InnoDB;

-- Alteração 1: Adicionar coluna `idCategoria` na tabela de Lançamentos
ALTER TABLE `TbFinanceiroLancamento`
ADD COLUMN `idCategoria` INT NULL DEFAULT NULL AFTER `idClienteFornecedor`,
ADD INDEX `IX_Lancamento_Categoria` (`idCategoria` ASC),
ADD CONSTRAINT `FK_Lancamento_Categoria`
  FOREIGN KEY (`idCategoria`) REFERENCES `TbFinanceiroCategoria` (`idCategoria`) ON DELETE SET NULL ON UPDATE CASCADE;

COMMIT;

-- =====================================================================================
-- SCRIPT DE CRIAÇÃO DA TABELA DE LANÇAMENTOS RECORRENTES
-- =====================================================================================
--
-- OBJETIVO:
-- Criar uma tabela para armazenar "moldes" de despesas e receitas fixas (mensais,
-- anuais, etc.), permitindo a automação de sua criação.
--
-- =====================================================================================

START TRANSACTION;

CREATE TABLE IF NOT EXISTS `TbFinanceiroLancamentoRecorrente` (
  `idLancamentoRecorrente` INT NOT NULL AUTO_INCREMENT,
  `descricao` VARCHAR(255) NOT NULL,
  `tipo` ENUM('RECEITA', 'DESPESA') NOT NULL,
  `valorEstimado` DECIMAL(15, 2) NOT NULL,
  `diaVencimento` INT NOT NULL COMMENT 'Dia do mês para o vencimento (ex: 10)',
  `periodicidade` ENUM('MENSAL', 'ANUAL') NOT NULL DEFAULT 'MENSAL',
  `idClienteFornecedor` INT NULL,
  `ativo` BOOLEAN NOT NULL DEFAULT TRUE,
  PRIMARY KEY (`idLancamentoRecorrente`)
) ENGINE=InnoDB;

COMMIT;

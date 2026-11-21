-- =====================================================================================
-- SCRIPT DE ALTERAÇÃO PARA ADICIONAR VÍNCULO DE FATURA AO LANÇAMENTO
-- =====================================================================================
--
-- OBJETIVO:
-- Adicionar a coluna `idFatura` na tabela `TbFinanceiroLancamento` para criar um
-- relacionamento direto entre um lançamento financeiro e a fatura que o originou.
--
-- =====================================================================================

START TRANSACTION;

-- Adiciona a coluna `idFatura`, o índice e a chave estrangeira.
-- A coluna é adicionada após `idOrdemServico` por uma questão de organização.
ALTER TABLE `TbFinanceiroLancamento`
ADD COLUMN `idFatura` INT NULL DEFAULT NULL AFTER `idOrdemServico`,
ADD INDEX `IX_Lancamento_Fatura` (`idFatura` ASC),
ADD CONSTRAINT `FK_Lancamento_Fatura`
  FOREIGN KEY (`idFatura`)
  REFERENCES `TbFinanceiroFatura` (`idFatura`)
  ON DELETE SET NULL
  ON UPDATE CASCADE;

COMMIT;

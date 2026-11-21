-- Saldo devedor em empréstimos recebidos + histórico de pagamentos vinculados a lançamentos (saída financiamento).

START TRANSACTION;

ALTER TABLE `TbEmprestimo`
  ADD COLUMN `saldoRestante` DECIMAL(15, 2) NULL AFTER `valorPrincipal`;

UPDATE `TbEmprestimo`
SET `saldoRestante` = `valorPrincipal`
WHERE `saldoRestante` IS NULL;

CREATE TABLE IF NOT EXISTS `TbEmprestimoMovimentacao` (
  `idMovimentacao` INT NOT NULL AUTO_INCREMENT,
  `idEmprestimo` INT NOT NULL,
  `idLancamento` INT NOT NULL,
  `valor` DECIMAL(15, 2) NOT NULL,
  `dataMovimentacao` DATE NOT NULL,
  `dataInclusao` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`idMovimentacao`),
  UNIQUE KEY `UK_EmprestimoMov_Lancamento` (`idLancamento`),
  INDEX `IX_EmpMov_Emprestimo` (`idEmprestimo` ASC),
  INDEX `IX_EmpMov_Data` (`dataMovimentacao` ASC),
  CONSTRAINT `FK_EmpMov_Emprestimo`
    FOREIGN KEY (`idEmprestimo`)
    REFERENCES `TbEmprestimo` (`idEmprestimo`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `FK_EmpMov_Lancamento`
    FOREIGN KEY (`idLancamento`)
    REFERENCES `TbFinanceiroLancamento` (`idLancamento`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

COMMIT;

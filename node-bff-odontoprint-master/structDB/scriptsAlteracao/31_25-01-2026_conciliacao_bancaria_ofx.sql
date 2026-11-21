-- =====================================================================================
-- SCRIPT DE CRIAÇÃO DAS TABELAS DE CONCILIAÇÃO BANCÁRIA COM ARQUIVOS OFX
-- =====================================================================================
--
-- OBJETIVO:
-- Criar todas as tabelas necessárias para o sistema de conciliação bancária,
-- incluindo: Arquivos OFX, Transações OFX, Conciliações e Retiradas.
--
-- !!! IMPORTANTE: FAÇA UM BACKUP COMPLETO DO BANCO DE DADOS ANTES DE EXECUTAR !!!
--
-- =====================================================================================

START TRANSACTION;

-- =====================================================================================
-- TABELA 1: Arquivos OFX (TbArquivoOfx)
-- =====================================================================================
CREATE TABLE IF NOT EXISTS `TbArquivoOfx` (
  `idArquivoOfx` INT NOT NULL AUTO_INCREMENT,
  `idConta` INT NOT NULL COMMENT 'FK para TbFinanceiroConta',
  `nomeArquivo` VARCHAR(255) NOT NULL COMMENT 'Nome original do arquivo OFX',
  `dataImportacao` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `dataInicio` DATE NOT NULL COMMENT 'Data inicial do extrato',
  `dataFim` DATE NOT NULL COMMENT 'Data final do extrato',
  `saldoInicial` DECIMAL(15, 2) NOT NULL COMMENT 'Saldo inicial do extrato',
  `saldoFinal` DECIMAL(15, 2) NOT NULL COMMENT 'Saldo final do extrato',
  `totalTransacoes` INT NOT NULL DEFAULT 0 COMMENT 'Quantidade de transações no arquivo',
  `idUsuarioImportacao` INT NOT NULL COMMENT 'ID do usuário que importou o arquivo',
  PRIMARY KEY (`idArquivoOfx`),
  INDEX `IX_ArquivoOfx_Conta` (`idConta` ASC),
  INDEX `IX_ArquivoOfx_DataImportacao` (`dataImportacao` ASC),
  INDEX `IX_ArquivoOfx_DataInicio` (`dataInicio` ASC),
  INDEX `IX_ArquivoOfx_DataFim` (`dataFim` ASC),
  CONSTRAINT `FK_ArquivoOfx_Conta`
    FOREIGN KEY (`idConta`)
    REFERENCES `TbFinanceiroConta` (`idConta`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================================
-- TABELA 2: Transações OFX (TbTransacaoOfx)
-- =====================================================================================
CREATE TABLE IF NOT EXISTS `TbTransacaoOfx` (
  `idTransacaoOfx` INT NOT NULL AUTO_INCREMENT,
  `idConta` INT NOT NULL COMMENT 'FK para TbFinanceiroConta',
  `idArquivoOfx` INT NOT NULL COMMENT 'FK para TbArquivoOfx',
  `fitId` VARCHAR(100) NOT NULL COMMENT 'ID único da transação no OFX (FITID)',
  `tipo` ENUM('CREDITO', 'DEBITO') NOT NULL,
  `valor` DECIMAL(15, 2) NOT NULL,
  `dataTransacao` DATE NOT NULL COMMENT 'Data da transação',
  `dataPostagem` DATE NULL COMMENT 'Data de postagem (se diferente da transação)',
  `descricao` TEXT NULL COMMENT 'Descrição/memo da transação',
  `numeroCheque` VARCHAR(50) NULL COMMENT 'Número do cheque (se aplicável)',
  `statusConciliacao` ENUM('PENDENTE', 'CONCILIADO', 'IGNORADO') NOT NULL DEFAULT 'PENDENTE',
  `dataConciliacao` DATETIME NULL COMMENT 'Data da conciliação',
  `observacoes` TEXT NULL COMMENT 'Observações adicionais',
  `dataInclusao` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `dataAlteracao` DATETIME NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`idTransacaoOfx`),
  UNIQUE KEY `UK_TransacaoOfx_FitId_Conta` (`fitId`, `idConta`),
  INDEX `IX_TransacaoOfx_Conta` (`idConta` ASC),
  INDEX `IX_TransacaoOfx_Arquivo` (`idArquivoOfx` ASC),
  INDEX `IX_TransacaoOfx_DataTransacao` (`dataTransacao` ASC),
  INDEX `IX_TransacaoOfx_StatusConciliacao` (`statusConciliacao` ASC),
  INDEX `IX_TransacaoOfx_Tipo` (`tipo` ASC),
  INDEX `IX_TransacaoOfx_Valor` (`valor` ASC),
  CONSTRAINT `FK_TransacaoOfx_Conta`
    FOREIGN KEY (`idConta`)
    REFERENCES `TbFinanceiroConta` (`idConta`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,
  CONSTRAINT `FK_TransacaoOfx_Arquivo`
    FOREIGN KEY (`idArquivoOfx`)
    REFERENCES `TbArquivoOfx` (`idArquivoOfx`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================================
-- TABELA 3: Retiradas (TbRetirada)
-- =====================================================================================
CREATE TABLE IF NOT EXISTS `TbRetirada` (
  `idRetirada` INT NOT NULL AUTO_INCREMENT,
  `idLancamento` INT NOT NULL COMMENT 'FK para TbFinanceiroLancamento',
  `idSocio` INT NULL COMMENT 'ID do sócio (pode ser da tabela de usuários ou cliente/fornecedor)',
  `dataRetirada` DATE NOT NULL,
  `valor` DECIMAL(15, 2) NOT NULL,
  `tipo` ENUM('RETIRADA_CAPITAL', 'DISTRIBUICAO_LUCROS', 'OUTROS') NOT NULL,
  `observacoes` TEXT NULL,
  `dataInclusao` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `dataAlteracao` DATETIME NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`idRetirada`),
  INDEX `IX_Retirada_Lancamento` (`idLancamento` ASC),
  INDEX `IX_Retirada_Socio` (`idSocio` ASC),
  INDEX `IX_Retirada_Data` (`dataRetirada` ASC),
  INDEX `IX_Retirada_Tipo` (`tipo` ASC),
  CONSTRAINT `FK_Retirada_Lancamento`
    FOREIGN KEY (`idLancamento`)
    REFERENCES `TbFinanceiroLancamento` (`idLancamento`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================================
-- TABELA 4: Conciliações de Transações (TbConciliacaoTransacao)
-- =====================================================================================
CREATE TABLE IF NOT EXISTS `TbConciliacaoTransacao` (
  `idConciliacao` INT NOT NULL AUTO_INCREMENT,
  `idTransacaoOfx` INT NOT NULL COMMENT 'FK para TbTransacaoOfx',
  `idMovimentacao` INT NULL COMMENT 'FK para TbFinanceiroMovimentacao',
  `idAporte` INT NULL COMMENT 'FK para TbAporte',
  `idRetirada` INT NULL COMMENT 'FK para TbRetirada',
  `tipoVinculo` ENUM('MOVIMENTACAO', 'APORTE', 'RETIRADA') NOT NULL,
  `dataConciliacao` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `idUsuarioConciliacao` INT NOT NULL COMMENT 'ID do usuário que conciliou',
  `observacoes` TEXT NULL COMMENT 'Observações da conciliação',
  PRIMARY KEY (`idConciliacao`),
  UNIQUE KEY `UK_Conciliacao_TransacaoOfx` (`idTransacaoOfx`),
  INDEX `IX_Conciliacao_Movimentacao` (`idMovimentacao` ASC),
  INDEX `IX_Conciliacao_Aporte` (`idAporte` ASC),
  INDEX `IX_Conciliacao_Retirada` (`idRetirada` ASC),
  INDEX `IX_Conciliacao_TipoVinculo` (`tipoVinculo` ASC),
  INDEX `IX_Conciliacao_DataConciliacao` (`dataConciliacao` ASC),
  CONSTRAINT `FK_Conciliacao_TransacaoOfx`
    FOREIGN KEY (`idTransacaoOfx`)
    REFERENCES `TbTransacaoOfx` (`idTransacaoOfx`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `FK_Conciliacao_Movimentacao`
    FOREIGN KEY (`idMovimentacao`)
    REFERENCES `TbFinanceiroMovimentacao` (`idMovimentacao`)
    ON DELETE SET NULL
    ON UPDATE CASCADE,
  CONSTRAINT `FK_Conciliacao_Aporte`
    FOREIGN KEY (`idAporte`)
    REFERENCES `TbAporte` (`idAporte`)
    ON DELETE SET NULL
    ON UPDATE CASCADE,
  CONSTRAINT `FK_Conciliacao_Retirada`
    FOREIGN KEY (`idRetirada`)
    REFERENCES `TbRetirada` (`idRetirada`)
    ON DELETE SET NULL
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

COMMIT;

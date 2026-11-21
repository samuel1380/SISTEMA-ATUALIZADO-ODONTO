-- =====================================================================================
-- SCRIPT DE CRIAÇÃO DAS TABELAS DO SISTEMA FINANCEIRO COMPLETO
-- =====================================================================================
--
-- OBJETIVO:
-- Criar todas as tabelas necessárias para o sistema financeiro completo,
-- incluindo: Veículos, Abastecimentos, Fornecedores de Logística, Entregas,
-- Aportes e Empréstimos.
--
-- !!! IMPORTANTE: FAÇA UM BACKUP COMPLETO DO BANCO DE DADOS ANTES DE EXECUTAR !!!
--
-- =====================================================================================

START TRANSACTION;

-- =====================================================================================
-- TABELA 1: Veículos (TbVeiculo)
-- =====================================================================================
CREATE TABLE IF NOT EXISTS `TbVeiculo` (
  `idVeiculo` INT NOT NULL AUTO_INCREMENT,
  `placa` VARCHAR(10) NOT NULL,
  `marca` VARCHAR(50) NOT NULL,
  `modelo` VARCHAR(50) NOT NULL,
  `ano` INT NOT NULL,
  `tipoCombustivel` ENUM('GASOLINA', 'ETANOL', 'DIESEL', 'FLEX', 'ELETRICO') NOT NULL,
  `consumoMedio` DECIMAL(5, 2) NULL COMMENT 'Consumo médio em km/litro',
  `idEmpresa` INT NULL,
  `ativo` BOOLEAN NOT NULL DEFAULT TRUE,
  `dataInclusao` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `dataAlteracao` DATETIME NULL ON UPDATE CURRENT_TIMESTAMP,
  `dataExclusao` DATETIME NULL,
  PRIMARY KEY (`idVeiculo`),
  UNIQUE KEY `UK_Veiculo_Placa` (`placa`),
  INDEX `IX_Veiculo_Empresa` (`idEmpresa` ASC),
  INDEX `IX_Veiculo_Ativo` (`ativo` ASC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================================
-- TABELA 2: Abastecimentos (TbAbastecimento)
-- =====================================================================================
CREATE TABLE IF NOT EXISTS `TbAbastecimento` (
  `idAbastecimento` INT NOT NULL AUTO_INCREMENT,
  `idVeiculo` INT NOT NULL,
  `idLancamento` INT NULL COMMENT 'FK para TbFinanceiroLancamento',
  `dataAbastecimento` DATE NOT NULL,
  `litros` DECIMAL(10, 3) NOT NULL,
  `valorLitro` DECIMAL(10, 2) NOT NULL,
  `valorTotal` DECIMAL(15, 2) NOT NULL,
  `quilometragem` INT NULL COMMENT 'Quilometragem do veículo no momento do abastecimento',
  `local` VARCHAR(255) NULL COMMENT 'Local do abastecimento',
  `observacoes` TEXT NULL,
  `dataInclusao` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `dataAlteracao` DATETIME NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`idAbastecimento`),
  INDEX `IX_Abastecimento_Veiculo` (`idVeiculo` ASC),
  INDEX `IX_Abastecimento_Lancamento` (`idLancamento` ASC),
  INDEX `IX_Abastecimento_Data` (`dataAbastecimento` ASC),
  CONSTRAINT `FK_Abastecimento_Veiculo`
    FOREIGN KEY (`idVeiculo`)
    REFERENCES `TbVeiculo` (`idVeiculo`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,
  CONSTRAINT `FK_Abastecimento_Lancamento`
    FOREIGN KEY (`idLancamento`)
    REFERENCES `TbFinanceiroLancamento` (`idLancamento`)
    ON DELETE SET NULL
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================================
-- TABELA 3: Fornecedores de Logística (TbFornecedorLogistica)
-- =====================================================================================
CREATE TABLE IF NOT EXISTS `TbFornecedorLogistica` (
  `idFornecedorLogistica` INT NOT NULL AUTO_INCREMENT,
  `nome` VARCHAR(100) NOT NULL,
  `tipo` ENUM('TRANSPORTADORA', 'CORREIOS', 'ENTREGA_RAPIDA', 'OUTRO') NOT NULL,
  `contato` VARCHAR(255) NULL,
  `telefone` VARCHAR(100) NULL,
  `email` VARCHAR(100) NULL,
  `idEmpresa` INT NULL,
  `ativo` BOOLEAN NOT NULL DEFAULT TRUE,
  `dataInclusao` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `dataAlteracao` DATETIME NULL ON UPDATE CURRENT_TIMESTAMP,
  `dataExclusao` DATETIME NULL,
  PRIMARY KEY (`idFornecedorLogistica`),
  INDEX `IX_FornecedorLogistica_Empresa` (`idEmpresa` ASC),
  INDEX `IX_FornecedorLogistica_Ativo` (`ativo` ASC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================================
-- TABELA 4: Entregas (TbEntrega)
-- =====================================================================================
CREATE TABLE IF NOT EXISTS `TbEntrega` (
  `idEntrega` INT NOT NULL AUTO_INCREMENT,
  `idLancamento` INT NULL COMMENT 'FK para TbFinanceiroLancamento',
  `idFornecedorLogistica` INT NOT NULL,
  `dataEntrega` DATE NOT NULL,
  `origem` VARCHAR(255) NOT NULL,
  `destino` VARCHAR(255) NOT NULL,
  `peso` DECIMAL(10, 2) NULL COMMENT 'Peso em kg',
  `valorFrete` DECIMAL(15, 2) NOT NULL,
  `status` ENUM('PENDENTE', 'EM_TRANSITO', 'ENTREGUE', 'CANCELADA') NOT NULL DEFAULT 'PENDENTE',
  `observacoes` TEXT NULL,
  `dataInclusao` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `dataAlteracao` DATETIME NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`idEntrega`),
  INDEX `IX_Entrega_Lancamento` (`idLancamento` ASC),
  INDEX `IX_Entrega_Fornecedor` (`idFornecedorLogistica` ASC),
  INDEX `IX_Entrega_Data` (`dataEntrega` ASC),
  INDEX `IX_Entrega_Status` (`status` ASC),
  CONSTRAINT `FK_Entrega_Lancamento`
    FOREIGN KEY (`idLancamento`)
    REFERENCES `TbFinanceiroLancamento` (`idLancamento`)
    ON DELETE SET NULL
    ON UPDATE CASCADE,
  CONSTRAINT `FK_Entrega_FornecedorLogistica`
    FOREIGN KEY (`idFornecedorLogistica`)
    REFERENCES `TbFornecedorLogistica` (`idFornecedorLogistica`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================================
-- TABELA 5: Aportes (TbAporte)
-- =====================================================================================
CREATE TABLE IF NOT EXISTS `TbAporte` (
  `idAporte` INT NOT NULL AUTO_INCREMENT,
  `idLancamento` INT NOT NULL COMMENT 'FK para TbFinanceiroLancamento',
  `idSocio` INT NULL COMMENT 'ID do sócio (pode ser da tabela de usuários ou cliente/fornecedor)',
  `dataAporte` DATE NOT NULL,
  `valor` DECIMAL(15, 2) NOT NULL,
  `tipo` ENUM('APORTE_CAPITAL', 'DISTRIBUICAO_LUCROS') NOT NULL,
  `observacoes` TEXT NULL,
  `dataInclusao` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `dataAlteracao` DATETIME NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`idAporte`),
  INDEX `IX_Aporte_Lancamento` (`idLancamento` ASC),
  INDEX `IX_Aporte_Socio` (`idSocio` ASC),
  INDEX `IX_Aporte_Data` (`dataAporte` ASC),
  INDEX `IX_Aporte_Tipo` (`tipo` ASC),
  CONSTRAINT `FK_Aporte_Lancamento`
    FOREIGN KEY (`idLancamento`)
    REFERENCES `TbFinanceiroLancamento` (`idLancamento`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================================
-- TABELA 6: Empréstimos (TbEmprestimo)
-- =====================================================================================
CREATE TABLE IF NOT EXISTS `TbEmprestimo` (
  `idEmprestimo` INT NOT NULL AUTO_INCREMENT,
  `idLancamento` INT NOT NULL COMMENT 'FK para TbFinanceiroLancamento',
  `tipo` ENUM('RECEBIDO', 'CONCEDIDO') NOT NULL COMMENT 'RECEBIDO = empresa recebeu, CONCEDIDO = empresa concedeu',
  `valorPrincipal` DECIMAL(15, 2) NOT NULL,
  `taxaJuros` DECIMAL(5, 2) NULL COMMENT 'Taxa de juros mensal (%)',
  `dataContratacao` DATE NOT NULL,
  `dataVencimento` DATE NULL,
  `status` ENUM('ATIVO', 'QUITADO', 'CANCELADO') NOT NULL DEFAULT 'ATIVO',
  `idCredorDevedor` INT NULL COMMENT 'ID do credor ou devedor',
  `observacoes` TEXT NULL,
  `dataInclusao` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `dataAlteracao` DATETIME NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`idEmprestimo`),
  INDEX `IX_Emprestimo_Lancamento` (`idLancamento` ASC),
  INDEX `IX_Emprestimo_Tipo` (`tipo` ASC),
  INDEX `IX_Emprestimo_Status` (`status` ASC),
  INDEX `IX_Emprestimo_DataContratacao` (`dataContratacao` ASC),
  CONSTRAINT `FK_Emprestimo_Lancamento`
    FOREIGN KEY (`idLancamento`)
    REFERENCES `TbFinanceiroLancamento` (`idLancamento`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================================
-- VERIFICAÇÃO E ADIÇÃO DE CAMPOS NA TABELA TbFinanceiroParcela (se não existirem)
-- =====================================================================================

-- Verifica se a coluna numeroBoleto já existe antes de adicionar
SET @col_exists = (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'TbFinanceiroParcela' 
    AND COLUMN_NAME = 'numeroBoleto'
);

SET @sql = IF(@col_exists = 0,
  'ALTER TABLE `TbFinanceiroParcela` ADD COLUMN `numeroBoleto` VARCHAR(50) NULL COMMENT ''Número do boleto bancário'' AFTER `dadosAdicionais`',
  'SELECT ''Coluna numeroBoleto já existe'' AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Verifica se a coluna codigoBarras já existe antes de adicionar
SET @col_exists = (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'TbFinanceiroParcela' 
    AND COLUMN_NAME = 'codigoBarras'
);

SET @sql = IF(@col_exists = 0,
  'ALTER TABLE `TbFinanceiroParcela` ADD COLUMN `codigoBarras` VARCHAR(100) NULL COMMENT ''Código de barras do boleto'' AFTER `numeroBoleto`',
  'SELECT ''Coluna codigoBarras já existe'' AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- =====================================================================================
-- COMMIT
-- =====================================================================================

COMMIT;

-- =====================================================================================
-- FIM DO SCRIPT
-- =====================================================================================


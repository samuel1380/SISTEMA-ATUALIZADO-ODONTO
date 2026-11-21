-- Script para criar tabelas de configuração e pagamento de KM rodado
-- Data: 04/12/2025

-- Tabela de configuração de valor por KM
CREATE TABLE IF NOT EXISTS `TbConfiguracaoKm` (
  `idConfiguracaoKm` INT NOT NULL AUTO_INCREMENT,
  `valorPorKm` DECIMAL(10,2) NOT NULL,
  `dataInclusao` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `dataAlteracao` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`idConfiguracaoKm`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de pagamentos de KM rodado
CREATE TABLE IF NOT EXISTS `TbPagamentoKm` (
  `idPagamentoKm` INT NOT NULL AUTO_INCREMENT,
  `nomePessoa` VARCHAR(255) NOT NULL,
  `quantidadeKm` INT NOT NULL,
  `valorPorKm` DECIMAL(10,2) NOT NULL,
  `valorTotal` DECIMAL(15,2) NOT NULL,
  `dataPagamento` DATE NOT NULL,
  `idLancamento` INT NULL,
  `observacoes` TEXT NULL,
  `dataInclusao` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `dataAlteracao` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`idPagamentoKm`),
  INDEX `idx_idLancamento` (`idLancamento`),
  CONSTRAINT `fk_pagamento_km_lancamento` 
    FOREIGN KEY (`idLancamento`) 
    REFERENCES `TbFinanceiroLancamento` (`idLancamento`) 
    ON DELETE SET NULL 
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- Script de migração para criar tabelas de Sócios e Credores
-- Data: 03/12/2025

-- Criar tabela de Sócios
CREATE TABLE IF NOT EXISTS `TbSocio` (
  `idSocio` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(255) NOT NULL,
  `cpf` varchar(100) DEFAULT NULL,
  `cnpj` varchar(100) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `telefone` varchar(20) DEFAULT NULL,
  `endereco` text,
  `idEmpresa` int DEFAULT NULL,
  `idConta` int DEFAULT NULL,
  `ativo` tinyint(1) NOT NULL DEFAULT '1',
  `dataInclusao` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `dataAlteracao` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`idSocio`),
  KEY `FK_TbSocio_TbFinanceiroConta` (`idConta`),
  CONSTRAINT `FK_TbSocio_TbFinanceiroConta` FOREIGN KEY (`idConta`) REFERENCES `TbFinanceiroConta` (`idConta`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Criar tabela de Credores
CREATE TABLE IF NOT EXISTS `TbCredor` (
  `idCredor` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(255) NOT NULL,
  `cpf` varchar(100) DEFAULT NULL,
  `cnpj` varchar(100) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `telefone` varchar(20) DEFAULT NULL,
  `endereco` text,
  `idEmpresa` int DEFAULT NULL,
  `idConta` int DEFAULT NULL,
  `ativo` tinyint(1) NOT NULL DEFAULT '1',
  `dataInclusao` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `dataAlteracao` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`idCredor`),
  KEY `FK_TbCredor_TbFinanceiroConta` (`idConta`),
  CONSTRAINT `FK_TbCredor_TbFinanceiroConta` FOREIGN KEY (`idConta`) REFERENCES `TbFinanceiroConta` (`idConta`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


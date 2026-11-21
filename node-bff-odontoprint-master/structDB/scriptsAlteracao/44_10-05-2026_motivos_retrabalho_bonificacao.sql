-- =====================================================================================
-- SCRIPT: MOTIVOS (RETRABALHO / BONIFICACAO) + VINCULO COM TRABALHO + FLAG BONIFICACAO
-- =====================================================================================
--
-- OBJETIVO:
-- 1. Criar tabela `TbMotivo` para cadastro global de motivos.
-- 2. Criar tabela `TbTrabalhoMotivo` (N:N) para associar motivos aos trabalhos.
-- 3. Adicionar coluna `bonificacao` em `TbTrabalho`.
--
-- !!! IMPORTANTE: FAÇA UM BACKUP COMPLETO DO BANCO DE DADOS ANTES DE EXECUTAR !!!
--
-- =====================================================================================

START TRANSACTION;

-- ETAPA 1: CRIAÇÃO DA TABELA TbMotivo
-- -------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `TbMotivo` (
  `idMotivo` INT NOT NULL AUTO_INCREMENT,
  `nome` VARCHAR(255) NOT NULL,
  `tipo` VARCHAR(20) NOT NULL,
  `ativo` TINYINT(1) NOT NULL DEFAULT 1,
  `idUsuarioCadastro` INT NOT NULL,
  `dataInclusao` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `dataAlteracao` DATETIME NULL ON UPDATE CURRENT_TIMESTAMP,
  `dataExclusao` DATETIME NULL DEFAULT NULL,
  PRIMARY KEY (`idMotivo`),
  KEY `IDX_TbMotivo_tipo` (`tipo`),
  KEY `IDX_TbMotivo_ativo` (`ativo`)
) ENGINE=InnoDB;

-- ETAPA 2: CRIAÇÃO DA TABELA TbTrabalhoMotivo (N:N)
-- -------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `TbTrabalhoMotivo` (
  `idTrabalhoMotivo` INT NOT NULL AUTO_INCREMENT,
  `idTrabalho` INT NOT NULL,
  `idMotivo` INT NOT NULL,
  `dataInclusao` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`idTrabalhoMotivo`),
  UNIQUE KEY `UQ_Trabalho_Motivo` (`idTrabalho`, `idMotivo`),
  KEY `IDX_TbTrabalhoMotivo_idTrabalho` (`idTrabalho`),
  KEY `IDX_TbTrabalhoMotivo_idMotivo` (`idMotivo`),
  CONSTRAINT `FK_TrabalhoMotivo_Trabalho`
    FOREIGN KEY (`idTrabalho`)
    REFERENCES `TbTrabalho` (`idTrabalho`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `FK_TrabalhoMotivo_Motivo`
    FOREIGN KEY (`idMotivo`)
    REFERENCES `TbMotivo` (`idMotivo`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ETAPA 3: ALTERAÇÃO DA TABELA TbTrabalho (FLAG BONIFICACAO)
-- -------------------------------------------------------------------------------------
ALTER TABLE `TbTrabalho`
ADD COLUMN `bonificacao` TINYINT(1) NOT NULL DEFAULT 0 AFTER `retrabalho`;

COMMIT;


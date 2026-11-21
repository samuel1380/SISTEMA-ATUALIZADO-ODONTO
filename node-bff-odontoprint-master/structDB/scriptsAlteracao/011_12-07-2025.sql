-- -----------------------------------------------------
-- Table `TbAlmoxarifado`
-- -----------------------------------------------------
CREATE TABLE `TbAlmoxarifado` (
  `idAlmoxarifado` INT NOT NULL AUTO_INCREMENT,
  `nome` VARCHAR(255) NOT NULL,
  `descricao` TEXT NULL,
  `dataInclusao` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `dataAlteracao` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `dataExclusao` TIMESTAMP NULL,
  PRIMARY KEY (`idAlmoxarifado`)
) ENGINE=InnoDB;


-- -----------------------------------------------------
-- Table `TbTransferencia`
-- -----------------------------------------------------
CREATE TABLE `TbTransferencia` (
  `idTransferencia` INT NOT NULL AUTO_INCREMENT,
  `idAlmoxarifadoOrigem` INT NULL,
  `idAlmoxarifadoDestino` INT NOT NULL,
  `idComponente` INT NOT NULL,
  `quantidade` INT NOT NULL,
  `baixado` TINYINT(1) NOT NULL DEFAULT 0,
  `dataTransferencia` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`idTransferencia`),
  INDEX `FK_Transferencia_AlmoxarifadoOrigem_idx` (`idAlmoxarifadoOrigem` ASC) VISIBLE,
  INDEX `FK_Transferencia_AlmoxarifadoDestino_idx` (`idAlmoxarifadoDestino` ASC) VISIBLE,
  INDEX `FK_Transferencia_Produto_idx` (`idComponente` ASC) VISIBLE,
  CONSTRAINT `FK_Transferencia_AlmoxarifadoOrigem`
    FOREIGN KEY (`idAlmoxarifadoOrigem`)
    REFERENCES `TbAlmoxarifado` (`idAlmoxarifado`),
  CONSTRAINT `FK_Transferencia_AlmoxarifadoDestino`
    FOREIGN KEY (`idAlmoxarifadoDestino`)
    REFERENCES `TbAlmoxarifado` (`idAlmoxarifado`),
  CONSTRAINT `FK_Transferencia_Componente`
    FOREIGN KEY (`idComponente`)
    REFERENCES `TbComponente` (`idComponente`)
) ENGINE=InnoDB;


CREATE TABLE `TbEstoque` (
  `idEstoque` INT NOT NULL AUTO_INCREMENT,
  `nome` VARCHAR(255) NOT NULL,
  `descricao` TEXT NULL,
  `quantidade` INT NOT NULL,
  `idEmpresa` INT NOT NULL,
  `idComponente` INT NOT NULL,
  `idAlmoxarifado` INT NOT NULL,
  `dataInclusao` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `dataAlteracao` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `dataExclusao` TIMESTAMP NULL,
  PRIMARY KEY (`idEstoque`),
  INDEX `FK_Estoque_Empresa_idx` (`idEmpresa` ASC) VISIBLE,
  INDEX `FK_Estoque_Componente_idx` (`idComponente` ASC) VISIBLE,
  INDEX `FK_Estoque_Almoxarifado_idx` (`idAlmoxarifado` ASC) VISIBLE,
  CONSTRAINT `FK_Estoque_Empresa`
    FOREIGN KEY (`idEmpresa`)
    REFERENCES `TbEmpresa` (`idEmpresa`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `FK_Estoque_Produto`
    FOREIGN KEY (`idComponente`)
    REFERENCES `TbComponente` (`idComponente`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `FK_Estoque_Almoxarifado`
    FOREIGN KEY (`idAlmoxarifado`)
    REFERENCES `TbAlmoxarifado` (`idAlmoxarifado`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
) ENGINE=InnoDB;



ALTER TABLE `TbAlmoxarifado` 
ADD COLUMN `idEmpresa` INT NOT NULL AFTER `descricao`,
ADD INDEX `FK_Almoxarifado_Empresa_idx` (`idEmpresa` ASC) VISIBLE;

ALTER TABLE `TbAlmoxarifado` 
ADD CONSTRAINT `FK_Almoxarifado_Empresa`
  FOREIGN KEY (`idEmpresa`)
  REFERENCES `TbEmpresa` (`idEmpresa`)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION;

-- -----------------------------------------------------
-- Table `TbEstoqueHistoricoConsumo`
-- -----------------------------------------------------
CREATE TABLE `TbEstoqueHistoricoConsumo` (
  `idEstoqueHistoricoConsumo` INT NOT NULL AUTO_INCREMENT,
  `idEstoque` INT NOT NULL,
  `quantidadeConsumida` INT NOT NULL,
  `motivo` VARCHAR(255) NULL,
  `dataConsumo` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`idEstoqueHistoricoConsumo`),
  INDEX `FK_EstoqueHistoricoConsumo_Estoque_idx` (`idEstoque` ASC) VISIBLE,
  CONSTRAINT `FK_EstoqueHistoricoConsumo_Estoque`
    FOREIGN KEY (`idEstoque`)
    REFERENCES `TbEstoque` (`idEstoque`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
)
ENGINE = InnoDB;


ALTER TABLE `TbComponente` 
ADD COLUMN `hasParafuso` TINYINT(1) NOT NULL DEFAULT 0 CHECK (`hasParafuso` IN (0, 1));

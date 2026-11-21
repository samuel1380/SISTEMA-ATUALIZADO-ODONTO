ALTER TABLE `odontoprint_db`.`TbEmpresa` 
CHANGE COLUMN `endereco` `logradouro` VARCHAR(255) NULL DEFAULT NULL,
ADD COLUMN `cep` VARCHAR(10) NOT NULL AFTER `documento`,
ADD COLUMN `complemento` VARCHAR(255) NULL AFTER `logradouro`,
ADD COLUMN `bairro` VARCHAR(255) NOT NULL AFTER `complemento`,
ADD COLUMN `cidade` VARCHAR(255) NOT NULL AFTER `bairro`,
ADD COLUMN `uf` VARCHAR(10) NOT NULL AFTER `cidade`,
ADD COLUMN `numeroDocumentoResponsavelTecnico` VARCHAR(10) NOT NULL AFTER `responsavelTecnico`;


ALTER TABLE `odontoprint_db`.`TbEmpresa` 
CHANGE COLUMN `responsavelTecnico` `responsavelTecnico` VARCHAR(255) NULL DEFAULT NULL AFTER `uf`,
CHANGE COLUMN `numeroDocumentoResponsavelTecnico` `numeroDocumentoResponsavelTecnico` VARCHAR(10) NOT NULL AFTER `responsavelTecnico`;

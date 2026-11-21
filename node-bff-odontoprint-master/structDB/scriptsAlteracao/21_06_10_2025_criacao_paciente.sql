-- =====================================================================================
-- SCRIPT DE CRIAÇÃO DA ENTIDADE PACIENTE E MIGRAÇÃO DE DADOS
-- =====================================================================================
--
-- OBJETIVO:
-- 1. Criar a nova tabela `TbPaciente` para centralizar as informações dos pacientes.
-- 2. Adicionar a coluna `idPaciente` na tabela `TbTrabalho`.
-- 3. Migrar os dados existentes de `nomePaciente` e `idEmpresa` da `TbTrabalho`
--    para a nova tabela `TbPaciente`, criando um paciente para cada combinação única.
-- 4. Atualizar a `TbTrabalho` com o `idPaciente` correspondente.
-- 5. Adicionar as chaves estrangeiras necessárias.
--
-- !!! IMPORTANTE: FAÇA UM BACKUP COMPLETO DO BANCO DE DADOS ANTES DE EXECUTAR !!!
--
-- =====================================================================================

START TRANSACTION;

-- ETAPA 1: CRIAÇÃO DA TABELA TbPaciente
-- -------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `TbPaciente` (
  `idPaciente` INT NOT NULL AUTO_INCREMENT,
  `nome` VARCHAR(255) NOT NULL,
  `idEmpresa` INT NOT NULL,
  `idProfissional` INT NOT NULL,
  `idUsuarioCadastro` INT NOT NULL,
  `dataInclusao` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `dataAlteracao` DATETIME NULL ON UPDATE CURRENT_TIMESTAMP,
  `dataExclusao` DATETIME NULL,
  PRIMARY KEY (`idPaciente`),
  UNIQUE KEY `UQ_NOME_EMPRESA_PROFISSIONAL_PACIENTE` (`nome`, `idEmpresa`, `idProfissional`),
  CONSTRAINT `FK_Paciente_Empresa`
    FOREIGN KEY (`idEmpresa`)
    REFERENCES `TbEmpresa` (`idEmpresa`)
    ON DELETE CASCADE,
  CONSTRAINT `FK_Paciente_Profissional`
    FOREIGN KEY (`idProfissional`)
    REFERENCES `TbDentista` (`idDentista`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ETAPA 2: ALTERAÇÃO DA TABELA TbTrabalho
-- -------------------------------------------------------------------------------------
-- Adiciona a coluna que irá armazenar a chave estrangeira para o paciente.
-- É adicionada como NULL para permitir a migração dos dados.
ALTER TABLE `TbTrabalho`
ADD COLUMN `idPaciente` INT NULL DEFAULT NULL AFTER `nomeEmpresa`;

-- ETAPA 3: MIGRAÇÃO DOS DADOS
-- -------------------------------------------------------------------------------------
-- 3.1. Popula a tabela TbPaciente com base nos dados existentes em TbTrabalho.
--      Usa DISTINCT para garantir que cada combinação de nome de paciente e empresa
--      seja inserida apenas uma vez.
--      Usa MIN(idUsuarioCadastro) como um valor padrão para o usuário que criou o paciente.
INSERT IGNORE INTO TbPaciente (nome, idEmpresa, idProfissional, idUsuarioCadastro)
SELECT
    UPPER(REPLACE(REPLACE(TRIM(nomePaciente), '  ', ' '), '  ', ' ')),
    idEmpresa,
    idProfissional,
    MIN(idUsuarioCadastro)
FROM TbTrabalho
WHERE nomePaciente IS NOT NULL AND idEmpresa IS NOT NULL AND idProfissional IS NOT NULL AND idPaciente IS NULL
GROUP BY UPPER(REPLACE(REPLACE(TRIM(nomePaciente), '  ', ' '), '  ', ' ')), idEmpresa, idProfissional;

-- 3.2. Atualiza a coluna idPaciente na TbTrabalho.
--      Faz um JOIN entre TbTrabalho e TbPaciente para encontrar o idPaciente
--      correspondente para cada trabalho.
UPDATE TbTrabalho t
JOIN TbPaciente p ON UPPER(REPLACE(REPLACE(TRIM(t.nomePaciente), '  ', ' '), '  ', ' ')) = p.nome AND t.idEmpresa = p.idEmpresa AND t.idProfissional = p.idProfissional
SET t.idPaciente = p.idPaciente
WHERE t.idPaciente IS NULL;

-- ETAPA 4: ADIÇÃO DA CHAVE ESTRANGEIRA
-- -------------------------------------------------------------------------------------
-- Adiciona a constraint de chave estrangeira para garantir a integridade referencial.
-- ON DELETE RESTRICT impede que um paciente seja excluído se ele tiver trabalhos associados.
ALTER TABLE `TbTrabalho`
ADD CONSTRAINT `FK_Trabalho_Paciente`
  FOREIGN KEY (`idPaciente`)
  REFERENCES `TbPaciente` (`idPaciente`)
  ON DELETE RESTRICT
  ON UPDATE CASCADE;

COMMIT;

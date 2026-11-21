-- =====================================================================================
-- SCRIPT DE MIGRAÇÃO PARA A NOVA ESTRUTURA DE SERVIÇOS NO TRABALHO
-- =====================================================================================
--
-- OBJETIVO:
-- 1. Criar a nova tabela `TbServicoTrabalho` e sua tabela de junção.
-- 2. Migrar os dados da coluna `TbTrabalho.idProduto` e da tabela de junção
--    `TbElementosTrabalhoTbTrabalho` para a nova estrutura.
-- 3. Remover a coluna e a tabela de junção antigas.
--
-- !!! IMPORTANTE: FAÇA UM BACKUP COMPLETO DO BANCO DE DADOS ANTES DE EXECUTAR !!!
--
-- =====================================================================================

START TRANSACTION;

-- ETAPA 1: CRIAÇÃO DAS NOVAS TABELAS
-- -------------------------------------------------------------------------------------

-- Cria a tabela principal de serviços do trabalho
CREATE TABLE IF NOT EXISTS `TbServicoTrabalho` (
  `idServicoTrabalho` INT NOT NULL AUTO_INCREMENT,
  `idProduto` INT NOT NULL,
  `idTrabalho` INT NOT NULL,
  `ativo` BOOLEAN NOT NULL DEFAULT TRUE,
  `dataInclusao` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `dataAlteracao` DATETIME NULL ON UPDATE CURRENT_TIMESTAMP,
  `dataExclusao` DATETIME NULL DEFAULT NULL,
  PRIMARY KEY (`idServicoTrabalho`),
  INDEX `IX_ServicoTrabalho_Trabalho` (`idTrabalho` ASC),
  CONSTRAINT `FK_ServicoTrabalho_Trabalho`
    FOREIGN KEY (`idTrabalho`)
    REFERENCES `TbTrabalho` (`idTrabalho`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB;

-- Cria a tabela de junção entre ServicoTrabalho e ElementosTrabalho
create table if not exists TbServicoTrabalhoTbElementosTrabalho (
  idServicoTrabalho int(11) NOT NULL,
  idElementoTrabalho int(11) NOT NULL,
  FOREIGN KEY (idServicoTrabalho) REFERENCES TbServicoTrabalho(idServicoTrabalho),
  FOREIGN KEY (idElementoTrabalho) REFERENCES TbElementosTrabalho(idElementoTrabalho)
);

-- ETAPA 2: MIGRAÇÃO DOS DADOS
-- -------------------------------------------------------------------------------------
-- Este bloco usa um cursor para iterar sobre cada trabalho, criar o novo serviço
-- e mover a associação dos elementos.

DELIMITER $$

CREATE PROCEDURE `MigrateTrabalhoToServico`()
BEGIN
    -- Variáveis para armazenar os dados do trabalho durante a iteração
    DECLARE v_idTrabalho INT;
    DECLARE v_idProduto INT;
    DECLARE v_idServicoTrabalho INT;
    
    -- Variável de controle para o fim do cursor
    DECLARE done INT DEFAULT FALSE;

    -- Declaração do cursor para selecionar os trabalhos que precisam ser migrados
    -- (aqueles que possuem um idProduto)
    DECLARE cur_trabalho CURSOR FOR 
        SELECT idTrabalho, idProduto FROM TbTrabalho WHERE idProduto IS NOT NULL;

    -- Handler para sair do loop quando não houver mais registros
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

    OPEN cur_trabalho;

    read_loop: LOOP
        FETCH cur_trabalho INTO v_idTrabalho, v_idProduto;
        
        IF done THEN
            LEAVE read_loop;
        END IF;

        -- 1. Insere um novo registro na tabela `TbServicoTrabalho` com os dados do trabalho atual
        INSERT INTO TbServicoTrabalho (idTrabalho, idProduto, ativo, dataInclusao, dataAlteracao)
        VALUES (v_idTrabalho, v_idProduto, 1, NOW(), NOW());

        -- 2. Captura o ID do serviço que acabamos de criar
        SET v_idServicoTrabalho = LAST_INSERT_ID();

        -- 3. Migra os elementos associados ao trabalho antigo para o novo serviço
        --    (Copia os registros da tabela de junção antiga para a nova)
        INSERT INTO TbServicoTrabalhoTbElementosTrabalho (idServicoTrabalho, idElementoTrabalho)
        SELECT v_idServicoTrabalho, idElementoTrabalho
        FROM TbElementosTrabalhoTbTrabalho
        WHERE idTrabalho = v_idTrabalho;

    END LOOP;

    CLOSE cur_trabalho;
END$$

DELIMITER ;

-- Executa o procedimento de migração
CALL MigrateTrabalhoToServico();

-- Remove o procedimento após a execução
DROP PROCEDURE `MigrateTrabalhoToServico`;


-- ETAPA 3: LIMPEZA DA ESTRUTURA ANTIGA
-- -------------------------------------------------------------------------------------
-- ATENÇÃO: Esta parte é destrutiva. Execute apenas após confirmar que a migração
-- na ETAPA 2 foi bem-sucedida.

-- Remove a coluna `idProduto` da tabela `TbTrabalho`
ALTER TABLE `TbTrabalho` DROP COLUMN `idProduto`;

-- Remove a antiga tabela de junção.
-- Verifique se o nome 'TbElementosTrabalhoTbTrabalho' está correto para o seu schema.
DROP TABLE `TbElementosTrabalhoTbTrabalho`;


-- Finaliza a transação, aplicando todas as alterações
COMMIT;


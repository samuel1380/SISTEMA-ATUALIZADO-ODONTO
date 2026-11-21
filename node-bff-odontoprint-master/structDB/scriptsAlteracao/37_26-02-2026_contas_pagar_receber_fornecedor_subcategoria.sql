-- =====================================================================================
-- SCRIPT: Data de emissão, Fornecedor (contas a pagar), Subcategoria
-- =====================================================================================
--
-- OBJETIVO:
-- 1. Adicionar dataEmissao em TbFinanceiroLancamento e TbFinanceiroLancamentoRecorrente.
-- 2. Criar tabela TbFinanceiroFornecedor (CNPJ, razão social, endereço por CEP, etc.).
-- 3. Adicionar idFornecedor em TbFinanceiroLancamento para vincular despesas ao fornecedor.
-- 4. Adicionar idCategoriaPai em TbFinanceiroCategoria para subcategorias.
--
-- !!! IMPORTANTE: FAÇA UM BACKUP COMPLETO DO BANCO DE DADOS ANTES DE EXECUTAR !!!
--
-- =====================================================================================

START TRANSACTION;

-- =====================================================================================
-- 1. DATA DE EMISSÃO - Lancamento
-- =====================================================================================
ALTER TABLE `TbFinanceiroLancamento`
  ADD COLUMN `dataEmissao` DATE NULL DEFAULT NULL COMMENT 'Data de emissão do lançamento' AFTER `dataCompetencia`;

-- Atualizar registros existentes: usar dataInclusao como dataEmissao quando não preenchida (opcional)
-- UPDATE `TbFinanceiroLancamento` SET `dataEmissao` = DATE(`dataInclusao`) WHERE `dataEmissao` IS NULL;

-- =====================================================================================
-- 2. DATA DE EMISSÃO - Lancamento Recorrente
-- =====================================================================================
ALTER TABLE `TbFinanceiroLancamentoRecorrente`
  ADD COLUMN `dataEmissao` DATE NULL DEFAULT NULL COMMENT 'Data de emissão do lançamento recorrente' AFTER `diaVencimento`;

-- =====================================================================================
-- 3. TABELA FORNECEDOR (Contas a Pagar)
-- =====================================================================================
CREATE TABLE IF NOT EXISTS `TbFinanceiroFornecedor` (
  `idFornecedor` INT NOT NULL AUTO_INCREMENT,
  `cnpj` VARCHAR(18) NOT NULL COMMENT 'CNPJ (pode ser formatado ou só números)',
  `razaoSocial` VARCHAR(255) NOT NULL,
  `nomeFantasia` VARCHAR(255) NULL DEFAULT NULL,
  `telefone` VARCHAR(20) NULL DEFAULT NULL,
  `cep` VARCHAR(10) NULL DEFAULT NULL,
  `logradouro` VARCHAR(255) NULL DEFAULT NULL,
  `numero` VARCHAR(20) NULL DEFAULT NULL,
  `complemento` VARCHAR(100) NULL DEFAULT NULL,
  `bairro` VARCHAR(100) NULL DEFAULT NULL,
  `cidade` VARCHAR(100) NULL DEFAULT NULL,
  `uf` CHAR(2) NULL DEFAULT NULL,
  `ativo` TINYINT(1) NOT NULL DEFAULT 1,
  `dataInclusao` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `dataAlteracao` DATETIME NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`idFornecedor`),
  UNIQUE KEY `UK_Fornecedor_CNPJ` (`cnpj`),
  INDEX `IX_Fornecedor_Ativo` (`ativo` ASC),
  INDEX `IX_Fornecedor_RazaoSocial` (`razaoSocial`(100) ASC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Fornecedores para contas a pagar (vinculados a lançamentos de despesa)';

-- =====================================================================================
-- 4. ID FORNECEDOR NO LANÇAMENTO
-- =====================================================================================
ALTER TABLE `TbFinanceiroLancamento`
  ADD COLUMN `idFornecedor` INT NULL DEFAULT NULL AFTER `idClienteFornecedor`,
  ADD INDEX `IX_Lancamento_Fornecedor` (`idFornecedor` ASC);

ALTER TABLE `TbFinanceiroLancamento`
  ADD CONSTRAINT `FK_Lancamento_Fornecedor`
    FOREIGN KEY (`idFornecedor`)
    REFERENCES `TbFinanceiroFornecedor` (`idFornecedor`)
    ON DELETE SET NULL
    ON UPDATE CASCADE;

-- =====================================================================================
-- 5. SUBCATEGORIA - Categoria pai em Categoria
-- =====================================================================================
ALTER TABLE `TbFinanceiroCategoria`
  ADD COLUMN `idCategoriaPai` INT NULL DEFAULT NULL AFTER `tipo`,
  ADD INDEX `IX_Categoria_CategoriaPai` (`idCategoriaPai` ASC);

ALTER TABLE `TbFinanceiroCategoria`
  ADD CONSTRAINT `FK_Categoria_CategoriaPai`
    FOREIGN KEY (`idCategoriaPai`)
    REFERENCES `TbFinanceiroCategoria` (`idCategoria`)
    ON DELETE SET NULL
    ON UPDATE CASCADE;

COMMIT;

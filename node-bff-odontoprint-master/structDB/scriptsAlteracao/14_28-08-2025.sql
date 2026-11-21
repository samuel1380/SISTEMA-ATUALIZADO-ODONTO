-- =====================================================================================
-- SCRIPT DE MIGRAÇÃO: RENAME Financeiro -> OrdemServico
-- =====================================================================================
--
-- OBJETIVO:
-- Renomear as tabelas `TbFinanceiro` e `TbFinanceiroItem` para `TbOrdemServico` e
-- `TbOrdemServicoItem` respectivamente, alinhando o banco de dados com a
-- refatoração do código.
--
-- !!! IMPORTANTE: FAÇA UM BACKUP COMPLETO DO BANCO DE DADOS ANTES DE EXECUTAR !!!
--
-- =====================================================================================

START TRANSACTION;

-- ETAPA 1: Renomeia a tabela principal de 'Financeiro' para 'OrdemServico'
RENAME TABLE `TbFinanceiro` TO `TbOrdemServico`;

-- ETAPA 2: Renomeia a tabela de itens de 'FinanceiroItem' para 'OrdemServicoItem'
RENAME TABLE `TbFinanceiroItem` TO `TbOrdemServicoItem`;

-- ETAPA 3: Renomeia a coluna de chave estrangeira na tabela de itens
-- Isso é crucial para que o TypeORM continue a mapear a relação corretamente após a refatoração.
ALTER TABLE odontoprint_db.TbOrdemServicoItem CHANGE idFinanceiro idOrdemServico int(11) NULL;

ALTER TABLE odontoprint_db.TbOrdemServico CHANGE idFinanceiro idOrdemServico int(11) auto_increment NOT NULL;

ALTER TABLE odontoprint_db.TbOrdemServicoItem CHANGE idFinanceiroItem idOrdemServicoItem int(11) auto_increment NOT NULL;

COMMIT;

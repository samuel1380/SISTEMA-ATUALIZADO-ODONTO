-- ========================================================================================
-- ODONTOPRINT - SCRIPT DE MIGRAÇÃO SEGURO E IDEMPOTENTE PARA PRODUÇÃO (AWS RDS / AURORA)
-- ========================================================================================
-- Este script foi projetado para atualizar o banco de dados já existente na AWS (RDS / Aurora MySQL)
-- sem perder NENHUM dado existente e sem causar erros se partes do script já tiverem sido executadas.
--
-- CARACTERÍSTICAS:
-- 1. 100% IDEMPOTENTE: Pode ser executado 1 vez ou 100 vezes sem duplicar nem dar erro.
-- 2. NÃO-DESTRUTIVO: Não apaga tabelas, não apaga colunas, não trunca dados de produção.
-- 3. CASE-INSENSITIVE: Suporta MySQL no Linux (AWS RDS/Aurora) e Windows.
-- 4. BANCO SELECIONADO: Valida se o banco está selecionado antes de executar.
-- 5. ABRANGENTE:
--    - Tabela de Auditoria e Logs em tempo real (`TbLogAuditoria`) e seus índices
--    - Colunas de envio e ocultação em `TbTrabalho` (`dataHoraEnvio`, `ocultoConcluido`, `anotacoes`, etc.)
--    - Backfill inteligente de dados para trabalhos já enviados
--    - Todas as tabelas e colunas complementares do sistema financeiro, devoluções e almoxarifado
-- ========================================================================================

-- Se você estiver rodando em console sem seleção prévia, descomente a linha abaixo:
-- USE odontoprint_db;

DELIMITER $$

-- ----------------------------------------------------------------------------------------
-- PROCEDIMENTO AUXILIAR: Adicionar coluna caso não exista (Case-Insensitive)
-- ----------------------------------------------------------------------------------------
DROP PROCEDURE IF EXISTS AddColumnIfNotExists $$
CREATE PROCEDURE AddColumnIfNotExists(
    IN p_table_name VARCHAR(64),
    IN p_column_name VARCHAR(64),
    IN p_column_definition TEXT
)
BEGIN
    DECLARE col_count INT DEFAULT 0;

    IF DATABASE() IS NULL THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'ERRO: Nenhum banco de dados selecionado! Execute USE odontoprint_db; antes de executar a migracao.';
    END IF;

    SELECT COUNT(*) INTO col_count
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND LOWER(TABLE_NAME) = LOWER(p_table_name)
      AND LOWER(COLUMN_NAME) = LOWER(p_column_name);

    IF col_count = 0 THEN
        SET @sql_stmt = CONCAT('ALTER TABLE `', p_table_name, '` ADD COLUMN `', p_column_name, '` ', p_column_definition);
        PREPARE stmt FROM @sql_stmt;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
        SELECT CONCAT(' [OK] Coluna `', p_column_name, '` adicionada na tabela `', p_table_name, '`.') AS status_migracao;
    ELSE
        SELECT CONCAT(' [SKIP] Coluna `', p_column_name, '` ja existe na tabela `', p_table_name, '`.') AS status_migracao;
    END IF;
END $$

-- ----------------------------------------------------------------------------------------
-- PROCEDIMENTO AUXILIAR: Renomear coluna caso a antiga exista e a nova não
-- ----------------------------------------------------------------------------------------
DROP PROCEDURE IF EXISTS RenameColumnIfExists $$
CREATE PROCEDURE RenameColumnIfExists(
    IN p_table_name VARCHAR(64),
    IN p_old_column VARCHAR(64),
    IN p_new_column VARCHAR(64),
    IN p_column_definition TEXT
)
BEGIN
    DECLARE old_exists INT DEFAULT 0;
    DECLARE new_exists INT DEFAULT 0;

    IF DATABASE() IS NULL THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'ERRO: Nenhum banco de dados selecionado! Execute USE odontoprint_db; antes de executar a migracao.';
    END IF;

    SELECT COUNT(*) INTO old_exists
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND LOWER(TABLE_NAME) = LOWER(p_table_name)
      AND LOWER(COLUMN_NAME) = LOWER(p_old_column);

    SELECT COUNT(*) INTO new_exists
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND LOWER(TABLE_NAME) = LOWER(p_table_name)
      AND LOWER(COLUMN_NAME) = LOWER(p_new_column);

    IF old_exists > 0 AND new_exists = 0 THEN
        SET @sql_stmt = CONCAT('ALTER TABLE `', p_table_name, '` CHANGE COLUMN `', p_old_column, '` `', p_new_column, '` ', p_column_definition);
        PREPARE stmt FROM @sql_stmt;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
        SELECT CONCAT(' [OK] Coluna `', p_old_column, '` renomeada para `', p_new_column, '` na tabela `', p_table_name, '`.') AS status_migracao;
    ELSE
        SELECT CONCAT(' [SKIP] Renomeacao desnecessaria para `', p_table_name, '.', p_new_column, '`.') AS status_migracao;
    END IF;
END $$

-- ----------------------------------------------------------------------------------------
-- PROCEDIMENTO AUXILIAR: Renomear tabela caso a antiga exista e a nova não
-- ----------------------------------------------------------------------------------------
DROP PROCEDURE IF EXISTS RenameTableIfExists $$
CREATE PROCEDURE RenameTableIfExists(
    IN p_old_table VARCHAR(64),
    IN p_new_table VARCHAR(64)
)
BEGIN
    DECLARE old_exists INT DEFAULT 0;
    DECLARE new_exists INT DEFAULT 0;

    IF DATABASE() IS NULL THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'ERRO: Nenhum banco de dados selecionado! Execute USE odontoprint_db; antes de executar a migracao.';
    END IF;

    SELECT COUNT(*) INTO old_exists
    FROM information_schema.TABLES
    WHERE TABLE_SCHEMA = DATABASE()
      AND LOWER(TABLE_NAME) = LOWER(p_old_table);

    SELECT COUNT(*) INTO new_exists
    FROM information_schema.TABLES
    WHERE TABLE_SCHEMA = DATABASE()
      AND LOWER(TABLE_NAME) = LOWER(p_new_table);

    IF old_exists > 0 AND new_exists = 0 THEN
        SET @sql_stmt = CONCAT('RENAME TABLE `', p_old_table, '` TO `', p_new_table, '`');
        PREPARE stmt FROM @sql_stmt;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
        SELECT CONCAT(' [OK] Tabela `', p_old_table, '` renomeada para `', p_new_table, '`.') AS status_migracao;
    ELSE
        SELECT CONCAT(' [SKIP] Renomeacao de tabela desnecessaria para `', p_new_table, '`.') AS status_migracao;
    END IF;
END $$

-- ----------------------------------------------------------------------------------------
-- PROCEDIMENTO AUXILIAR: Adicionar índice caso não exista
-- ----------------------------------------------------------------------------------------
DROP PROCEDURE IF EXISTS AddIndexIfNotExists $$
CREATE PROCEDURE AddIndexIfNotExists(
    IN p_table_name VARCHAR(64),
    IN p_index_name VARCHAR(64),
    IN p_index_columns TEXT
)
BEGIN
    DECLARE idx_count INT DEFAULT 0;

    IF DATABASE() IS NULL THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'ERRO: Nenhum banco de dados selecionado! Execute USE odontoprint_db; antes de executar a migracao.';
    END IF;

    SELECT COUNT(*) INTO idx_count
    FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE()
      AND LOWER(TABLE_NAME) = LOWER(p_table_name)
      AND LOWER(INDEX_NAME) = LOWER(p_index_name);

    IF idx_count = 0 THEN
        SET @sql_stmt = CONCAT('ALTER TABLE `', p_table_name, '` ADD INDEX `', p_index_name, '` (', p_index_columns, ')');
        PREPARE stmt FROM @sql_stmt;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
        SELECT CONCAT(' [OK] Indice `', p_index_name, '` criado na tabela `', p_table_name, '`.') AS status_migracao;
    ELSE
        SELECT CONCAT(' [SKIP] Indice `', p_index_name, '` ja existe na tabela `', p_table_name, '`.') AS status_migracao;
    END IF;
END $$

DELIMITER ;

-- ========================================================================================
-- 1. CRIAÇÃO DE NOVAS TABELAS (SE NÃO EXISTIREM)
-- ========================================================================================

-- Tabela de Logs e Auditoria do Sistema em tempo real
CREATE TABLE IF NOT EXISTS `TbLogAuditoria` (
  `idLog` INT(11) NOT NULL AUTO_INCREMENT,
  `dataHora` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `idUsuario` INT(11) DEFAULT NULL,
  `nomeUsuario` VARCHAR(255) DEFAULT NULL,
  `emailUsuario` VARCHAR(255) DEFAULT NULL,
  `acao` VARCHAR(50) NOT NULL DEFAULT 'ACAO',
  `modulo` VARCHAR(100) NOT NULL DEFAULT 'GERAL',
  `entidade` VARCHAR(100) NOT NULL DEFAULT 'Sistema',
  `idRegistro` VARCHAR(100) DEFAULT NULL,
  `resumo` TEXT NOT NULL,
  `metodoHttp` VARCHAR(10) DEFAULT NULL,
  `rota` VARCHAR(255) DEFAULT NULL,
  `ip` VARCHAR(100) DEFAULT NULL,
  `dadosAnteriores` LONGTEXT DEFAULT NULL,
  `dadosNovos` LONGTEXT DEFAULT NULL,
  `camposAlterados` LONGTEXT DEFAULT NULL,
  `statusHttp` INT(11) DEFAULT 200,
  `idRequisicao` VARCHAR(100) DEFAULT NULL,
  PRIMARY KEY (`idLog`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CALL AddIndexIfNotExists('TbLogAuditoria', 'idx_log_datahora', '`dataHora`');
CALL AddIndexIfNotExists('TbLogAuditoria', 'idx_log_usuario', '`idUsuario`');
CALL AddIndexIfNotExists('TbLogAuditoria', 'idx_log_acao', '`acao`');
CALL AddIndexIfNotExists('TbLogAuditoria', 'idx_log_modulo', '`modulo`');
CALL AddIndexIfNotExists('TbLogAuditoria', 'idx_log_entidade', '`entidade`');

-- Tabela de Pacientes
CREATE TABLE IF NOT EXISTS `TbPaciente` (
  `idPaciente` INT(11) NOT NULL AUTO_INCREMENT,
  `nome` VARCHAR(255) NOT NULL,
  `idEmpresa` INT(11) NOT NULL,
  `idProfissional` INT(11) DEFAULT NULL,
  `idUsuarioCadastro` INT(11) NOT NULL,
  `dataInclusao` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `dataAlteracao` DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `dataExclusao` DATETIME DEFAULT NULL,
  PRIMARY KEY (`idPaciente`),
  KEY `idx_paciente_empresa` (`idEmpresa`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de Categorias de Produtos
CREATE TABLE IF NOT EXISTS `TbCategoriaProduto` (
  `idCategoriaProduto` INT(11) NOT NULL AUTO_INCREMENT,
  `nome` VARCHAR(255) NOT NULL,
  `ativo` TINYINT(1) NOT NULL DEFAULT 1,
  `idUsuarioCadastro` INT(11) NOT NULL DEFAULT 1,
  `dataInclusao` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `dataAlteracao` DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `dataExclusao` DATETIME DEFAULT NULL,
  PRIMARY KEY (`idCategoriaProduto`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CALL AddColumnIfNotExists('TbProduto', 'idCategoriaProduto', 'INT(11) NULL DEFAULT NULL');
CALL AddIndexIfNotExists('TbProduto', 'idx_produto_categoria', '`idCategoriaProduto`');

-- Módulo de Almoxarifado e Estoque
CREATE TABLE IF NOT EXISTS `TbAlmoxarifado` (
  `idAlmoxarifado` INT(11) NOT NULL AUTO_INCREMENT,
  `nome` VARCHAR(255) NOT NULL,
  `descricao` TEXT DEFAULT NULL,
  `idEmpresa` INT(11) DEFAULT NULL,
  `dataInclusao` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `dataAlteracao` DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `dataExclusao` DATETIME DEFAULT NULL,
  PRIMARY KEY (`idAlmoxarifado`),
  KEY `idx_almoxarifado_empresa` (`idEmpresa`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `TbEstoque` (
  `idEstoque` INT(11) NOT NULL AUTO_INCREMENT,
  `nome` VARCHAR(255) NOT NULL,
  `descricao` TEXT DEFAULT NULL,
  `quantidade` INT(11) NOT NULL DEFAULT 0,
  `idEmpresa` INT(11) NOT NULL,
  `idComponente` INT(11) NOT NULL,
  `idAlmoxarifado` INT(11) NOT NULL,
  `dataInclusao` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `dataAlteracao` DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `dataExclusao` DATETIME DEFAULT NULL,
  PRIMARY KEY (`idEstoque`),
  KEY `idx_estoque_empresa` (`idEmpresa`),
  KEY `idx_estoque_componente` (`idComponente`),
  KEY `idx_estoque_almoxarifado` (`idAlmoxarifado`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `TbTransferencia` (
  `idTransferencia` INT(11) NOT NULL AUTO_INCREMENT,
  `idAlmoxarifadoOrigem` INT(11) DEFAULT NULL,
  `idAlmoxarifadoDestino` INT(11) NOT NULL,
  `idComponente` INT(11) NOT NULL,
  `quantidade` INT(11) NOT NULL,
  `baixado` TINYINT(1) NOT NULL DEFAULT 0,
  `dataTransferencia` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`idTransferencia`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `TbEstoqueHistoricoConsumo` (
  `idEstoqueHistoricoConsumo` INT(11) NOT NULL AUTO_INCREMENT,
  `idEstoque` INT(11) NOT NULL,
  `quantidadeConsumida` INT(11) NOT NULL,
  `motivo` VARCHAR(255) DEFAULT NULL,
  `dataConsumo` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`idEstoqueHistoricoConsumo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabelas de Devolução de Componentes
CREATE TABLE IF NOT EXISTS `TbDevolucaoComponente` (
  `idDevolucao` INT(11) NOT NULL AUTO_INCREMENT,
  `idFatura` INT(11) NOT NULL,
  `idOrdemServicoItem` INT(11) NOT NULL,
  `quantidadeDevolvida` INT(11) NOT NULL,
  `status` ENUM('PENDENTE','CONFIRMADA','CANCELADA') NOT NULL DEFAULT 'PENDENTE',
  `observacao` VARCHAR(500) DEFAULT NULL,
  `dataSolicitacao` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `dataConferencia` DATETIME DEFAULT NULL,
  PRIMARY KEY (`idDevolucao`),
  KEY `idx_devolucao_fatura` (`idFatura`),
  KEY `idx_devolucao_os_item` (`idOrdemServicoItem`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `TbFaturaDevolucaoItem` (
  `idFaturaDevolucaoItem` INT(11) NOT NULL AUTO_INCREMENT,
  `idFatura` INT(11) NOT NULL,
  `idComponente` INT(11) NOT NULL,
  `idPaciente` INT(11) DEFAULT NULL,
  `nomePaciente` VARCHAR(255) DEFAULT NULL,
  `quantidade` INT(11) NOT NULL DEFAULT 1,
  `valorUnitario` DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  `dataInclusao` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`idFaturaDevolucaoItem`),
  KEY `idx_devolucao_fatura` (`idFatura`),
  KEY `idx_devolucao_componente` (`idComponente`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Motivos de Retrabalho / Bonificação
CREATE TABLE IF NOT EXISTS `TbMotivo` (
  `idMotivo` INT(11) NOT NULL AUTO_INCREMENT,
  `nome` VARCHAR(255) NOT NULL,
  `tipo` VARCHAR(50) NOT NULL DEFAULT 'RETRABALHO',
  `ativo` TINYINT(1) NOT NULL DEFAULT 1,
  `idUsuarioCadastro` INT(11) NOT NULL,
  `dataInclusao` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `dataAlteracao` DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `dataExclusao` DATETIME DEFAULT NULL,
  PRIMARY KEY (`idMotivo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `TbTrabalhoMotivo` (
  `idTrabalhoMotivo` INT(11) NOT NULL AUTO_INCREMENT,
  `idTrabalho` INT(11) NOT NULL,
  `idMotivo` INT(11) NOT NULL,
  `dataInclusao` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`idTrabalhoMotivo`),
  KEY `idx_trabalhomotivo_trabalho` (`idTrabalho`),
  KEY `idx_trabalhomotivo_motivo` (`idMotivo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de Tabela de Preço por Empresa (Vigência)
CREATE TABLE IF NOT EXISTS `TbEmpresaTabelaPreco` (
  `idEmpresaTabelaPreco` INT(11) NOT NULL AUTO_INCREMENT,
  `idEmpresa` INT(11) NOT NULL,
  `idTabelaPrecoProduto` INT(11) NOT NULL,
  `dataInicio` DATE NOT NULL,
  `dataFim` DATE DEFAULT NULL,
  `ativo` TINYINT(1) NOT NULL DEFAULT 1,
  `idUsuarioCadastro` INT(11) NOT NULL,
  `dataInclusao` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `dataAlteracao` DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `dataExclusao` DATETIME DEFAULT NULL,
  PRIMARY KEY (`idEmpresaTabelaPreco`),
  KEY `idx_empresa_tabela_vigencia` (`idEmpresa`,`dataInicio`,`dataFim`,`ativo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabelas Financeiras Complementares (Socios, Credores, Empréstimos, OFX, Veículos, Logística)
CREATE TABLE IF NOT EXISTS `TbFinanceiroFornecedor` (
  `idFornecedor` INT(11) NOT NULL AUTO_INCREMENT,
  `cnpj` VARCHAR(255) DEFAULT NULL,
  `cpf` VARCHAR(255) DEFAULT NULL,
  `razaoSocial` VARCHAR(255) NOT NULL,
  `nomeFantasia` VARCHAR(255) DEFAULT NULL,
  `telefone` VARCHAR(20) DEFAULT NULL,
  `cep` VARCHAR(10) DEFAULT NULL,
  `logradouro` VARCHAR(255) DEFAULT NULL,
  `numero` VARCHAR(20) DEFAULT NULL,
  `complemento` VARCHAR(100) DEFAULT NULL,
  `bairro` VARCHAR(100) DEFAULT NULL,
  `cidade` VARCHAR(100) DEFAULT NULL,
  `uf` CHAR(2) DEFAULT NULL,
  `ativo` TINYINT(1) NOT NULL DEFAULT 1,
  `idCategoria` INT(11) DEFAULT NULL,
  `idCategoriaPadrao` INT(11) DEFAULT NULL,
  `tipoDocumentoLivre` VARCHAR(50) DEFAULT NULL,
  `dataInclusao` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `dataAlteracao` DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`idFornecedor`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `TbFinanceiroLancamentoRecorrente` (
  `idLancamentoRecorrente` INT(11) NOT NULL AUTO_INCREMENT,
  `descricao` VARCHAR(255) NOT NULL,
  `tipo` ENUM('RECEITA','DESPESA') NOT NULL,
  `valorEstimado` DECIMAL(15,2) NOT NULL,
  `diaVencimento` INT(11) NOT NULL,
  `dataEmissao` DATE DEFAULT NULL,
  `periodicidade` ENUM('MENSAL','ANUAL') NOT NULL DEFAULT 'MENSAL',
  `idClienteFornecedor` INT(11) DEFAULT NULL,
  `ativo` TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`idLancamentoRecorrente`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `TbSocio` (
  `idSocio` INT(11) NOT NULL AUTO_INCREMENT,
  `nome` VARCHAR(255) NOT NULL,
  `cpf` VARCHAR(20) DEFAULT NULL,
  `cnpj` VARCHAR(20) DEFAULT NULL,
  `email` VARCHAR(255) DEFAULT NULL,
  `telefone` VARCHAR(50) DEFAULT NULL,
  `endereco` VARCHAR(255) DEFAULT NULL,
  `idEmpresa` INT(11) DEFAULT NULL,
  `idConta` INT(11) DEFAULT NULL,
  `ativo` TINYINT(1) NOT NULL DEFAULT 1,
  `dataInclusao` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `dataAlteracao` DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`idSocio`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `TbCredor` (
  `idCredor` INT(11) NOT NULL AUTO_INCREMENT,
  `nome` VARCHAR(255) NOT NULL,
  `cpf` VARCHAR(20) DEFAULT NULL,
  `cnpj` VARCHAR(20) DEFAULT NULL,
  `email` VARCHAR(255) DEFAULT NULL,
  `telefone` VARCHAR(50) DEFAULT NULL,
  `endereco` VARCHAR(255) DEFAULT NULL,
  `idEmpresa` INT(11) DEFAULT NULL,
  `idConta` INT(11) DEFAULT NULL,
  `ativo` TINYINT(1) NOT NULL DEFAULT 1,
  `dataInclusao` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `dataAlteracao` DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`idCredor`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `TbAporte` (
  `idAporte` INT(11) NOT NULL AUTO_INCREMENT,
  `idLancamento` INT(11) DEFAULT NULL,
  `idSocio` INT(11) NOT NULL,
  `dataAporte` DATE NOT NULL,
  `valor` DECIMAL(15,2) NOT NULL,
  `tipo` ENUM('CAPITAL_SOCIAL','MUTUO','ADIANTAMENTO_FUTURO_AUMENTO_CAPITAL','OUTROS') NOT NULL DEFAULT 'MUTUO',
  `observacoes` TEXT DEFAULT NULL,
  `dataInclusao` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `dataAlteracao` DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`idAporte`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `TbRetirada` (
  `idRetirada` INT(11) NOT NULL AUTO_INCREMENT,
  `idLancamento` INT(11) DEFAULT NULL,
  `idSocio` INT(11) NOT NULL,
  `dataRetirada` DATE NOT NULL,
  `valor` DECIMAL(15,2) NOT NULL,
  `tipo` ENUM('PRO_LABORE','DISTRIBUICAO_LUCROS','PAGAMENTO_EMPRESTIMO_MUTUO','REEMBOLSO_DESPESAS','OUTROS') NOT NULL DEFAULT 'DISTRIBUICAO_LUCROS',
  `observacoes` TEXT DEFAULT NULL,
  `dataInclusao` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `dataAlteracao` DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`idRetirada`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `TbEmprestimo` (
  `idEmprestimo` INT(11) NOT NULL AUTO_INCREMENT,
  `idLancamento` INT(11) DEFAULT NULL,
  `tipo` ENUM('CONCEDIDO','TOMADO') NOT NULL,
  `valorPrincipal` DECIMAL(15,2) NOT NULL,
  `saldoRestante` DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  `taxaJuros` DECIMAL(5,2) DEFAULT 0.00,
  `dataContratacao` DATE NOT NULL,
  `dataVencimento` DATE DEFAULT NULL,
  `status` ENUM('ATIVO','QUITADO','CANCELADO') NOT NULL DEFAULT 'ATIVO',
  `idCredorDevedor` INT(11) DEFAULT NULL,
  `observacoes` TEXT DEFAULT NULL,
  `dataInclusao` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `dataAlteracao` DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`idEmprestimo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `TbEmprestimoMovimentacao` (
  `idMovimentacao` INT(11) NOT NULL AUTO_INCREMENT,
  `idEmprestimo` INT(11) NOT NULL,
  `idLancamento` INT(11) DEFAULT NULL,
  `valor` DECIMAL(15,2) NOT NULL,
  `dataMovimentacao` DATE NOT NULL,
  `tipoMovimentacao` ENUM('PAGAMENTO','AMORTIZACAO','JUROS') NOT NULL,
  `observacoes` TEXT DEFAULT NULL,
  `dataInclusao` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`idMovimentacao`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `TbConfiguracaoKm` (
  `idConfiguracaoKm` INT(11) NOT NULL AUTO_INCREMENT,
  `valorPorKm` DECIMAL(10,2) NOT NULL DEFAULT 1.00,
  `dataInclusao` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `dataAlteracao` DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`idConfiguracaoKm`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `TbPagamentoKm` (
  `idPagamentoKm` INT(11) NOT NULL AUTO_INCREMENT,
  `nomePessoa` VARCHAR(255) NOT NULL,
  `quantidadeKm` DECIMAL(10,2) NOT NULL,
  `valorPorKm` DECIMAL(10,2) NOT NULL,
  `valorTotal` DECIMAL(15,2) NOT NULL,
  `dataPagamento` DATE NOT NULL,
  `idLancamento` INT(11) DEFAULT NULL,
  `observacoes` TEXT DEFAULT NULL,
  `dataInclusao` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `dataAlteracao` DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`idPagamentoKm`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `TbVeiculo` (
  `idVeiculo` INT(11) NOT NULL AUTO_INCREMENT,
  `modelo` VARCHAR(255) NOT NULL,
  `placa` VARCHAR(20) DEFAULT NULL,
  `ativo` TINYINT(1) NOT NULL DEFAULT 1,
  `dataInclusao` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `dataAlteracao` DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`idVeiculo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `TbAbastecimento` (
  `idAbastecimento` INT(11) NOT NULL AUTO_INCREMENT,
  `idVeiculo` INT(11) NOT NULL,
  `idLancamento` INT(11) DEFAULT NULL,
  `dataAbastecimento` DATE NOT NULL,
  `litros` DECIMAL(10,2) NOT NULL,
  `valorLitro` DECIMAL(10,2) NOT NULL,
  `valorTotal` DECIMAL(15,2) NOT NULL,
  `quilometragem` INT(11) DEFAULT NULL,
  `local` VARCHAR(255) DEFAULT NULL,
  `observacoes` TEXT DEFAULT NULL,
  `dataInclusao` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `dataAlteracao` DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`idAbastecimento`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `TbFornecedorLogistica` (
  `idFornecedorLogistica` INT(11) NOT NULL AUTO_INCREMENT,
  `nome` VARCHAR(255) NOT NULL,
  `tipo` ENUM('MOTOBOY_PROPRIO','MOTOBOY_TERCEIRO','TRANSPORTADORA','CORREIOS','OUTRO') NOT NULL,
  `contato` VARCHAR(255) DEFAULT NULL,
  `telefone` VARCHAR(50) DEFAULT NULL,
  `email` VARCHAR(255) DEFAULT NULL,
  `idEmpresa` INT(11) DEFAULT NULL,
  `ativo` TINYINT(1) NOT NULL DEFAULT 1,
  `dataInclusao` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `dataAlteracao` DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `dataExclusao` DATETIME DEFAULT NULL,
  PRIMARY KEY (`idFornecedorLogistica`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `TbEntrega` (
  `idEntrega` INT(11) NOT NULL AUTO_INCREMENT,
  `idLancamento` INT(11) DEFAULT NULL,
  `idFornecedorLogistica` INT(11) NOT NULL,
  `dataEntrega` DATE NOT NULL,
  `origem` VARCHAR(255) DEFAULT NULL,
  `destino` VARCHAR(255) DEFAULT NULL,
  `peso` DECIMAL(10,2) DEFAULT NULL,
  `valorFrete` DECIMAL(15,2) NOT NULL,
  `status` ENUM('PENDENTE','EM_TRANSITO','ENTREGUE','CANCELADO') NOT NULL DEFAULT 'PENDENTE',
  `observacoes` TEXT DEFAULT NULL,
  `dataInclusao` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `dataAlteracao` DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`idEntrega`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `TbArquivoOfx` (
  `idArquivoOfx` INT(11) NOT NULL AUTO_INCREMENT,
  `idConta` INT(11) NOT NULL,
  `nomeArquivo` VARCHAR(255) NOT NULL,
  `dataUpload` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `dataInicio` DATE DEFAULT NULL,
  `dataFim` DATE DEFAULT NULL,
  `totalTransacoes` INT(11) NOT NULL DEFAULT 0,
  `hashArquivo` VARCHAR(64) DEFAULT NULL,
  PRIMARY KEY (`idArquivoOfx`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `TbTransacaoOfx` (
  `idTransacaoOfx` INT(11) NOT NULL AUTO_INCREMENT,
  `idConta` INT(11) NOT NULL,
  `idArquivoOfx` INT(11) NOT NULL,
  `fitId` VARCHAR(255) NOT NULL,
  `tipo` ENUM('DEBITO','CREDITO','OUTROS') NOT NULL,
  `valor` DECIMAL(15,2) NOT NULL,
  `dataTransacao` DATE NOT NULL,
  `dataPostagem` DATE DEFAULT NULL,
  `descricao` VARCHAR(500) NOT NULL,
  `numeroCheque` VARCHAR(50) DEFAULT NULL,
  `statusConciliacao` ENUM('PENDENTE','CONCILIADO','IGNORADO') NOT NULL DEFAULT 'PENDENTE',
  `dataConciliacao` DATETIME DEFAULT NULL,
  `observacoes` TEXT DEFAULT NULL,
  `dataInclusao` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `dataAlteracao` DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`idTransacaoOfx`),
  UNIQUE KEY `UK_TransacaoOfx_FitId` (`fitId`,`idConta`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `TbConciliacaoTransacao` (
  `idConciliacao` INT(11) NOT NULL AUTO_INCREMENT,
  `idTransacaoOfx` INT(11) NOT NULL,
  `idMovimentacao` INT(11) DEFAULT NULL,
  `idAporte` INT(11) DEFAULT NULL,
  `idRetirada` INT(11) DEFAULT NULL,
  `tipoVinculo` ENUM('MOVIMENTACAO','APORTE','RETIRADA') NOT NULL,
  `dataConciliacao` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `idUsuarioConciliacao` INT(11) NOT NULL,
  `observacoes` TEXT DEFAULT NULL,
  PRIMARY KEY (`idConciliacao`),
  UNIQUE KEY `UK_Conciliacao_TransacaoOfx` (`idTransacaoOfx`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabelas de Grupo de Permissão (do pacote de autenticação)
CREATE TABLE IF NOT EXISTS `TbGrupoPermissao` (
  `idGrupoPermissao` INT(11) NOT NULL AUTO_INCREMENT,
  `nome` VARCHAR(70) NOT NULL,
  `ativo` TINYINT(1) NOT NULL DEFAULT 1,
  `idUsuarioCadastro` INT(11) NOT NULL,
  `dataInclusao` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `dataAlteracao` DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `dataExclusao` DATETIME DEFAULT NULL,
  PRIMARY KEY (`idGrupoPermissao`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `TbGrupoPermissaoTbPermissao` (
  `idGrupoPermissao` INT(11) NOT NULL,
  `idPermissao` INT(11) NOT NULL,
  PRIMARY KEY (`idGrupoPermissao`, `idPermissao`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================================================================
-- 2. RENOMEAÇÃO SEGURA DE TABELAS LEGADAS (CASO EXISTAM NOMES ANTIGOS)
-- ========================================================================================
CALL RenameTableIfExists('TbFinanceiro', 'TbOrdemServico');
CALL RenameTableIfExists('TbFinanceiroItem', 'TbOrdemServicoItem');

-- ========================================================================================
-- 3. ATUALIZAÇÃO SEGURA DAS COLUNAS DE TBTRABALHO (DATA/HORA ENVIO E OCULTO)
-- ========================================================================================

-- Coluna dataHoraEnvio: armazena exatamente quando o trabalho foi enviado/finalizado
CALL AddColumnIfNotExists('TbTrabalho', 'dataHoraEnvio', 'DATETIME NULL AFTER `dataConclusao`');

-- Coluna ocultoConcluido: permite arquivar/ocultar trabalhos concluídos da listagem principal
CALL AddColumnIfNotExists('TbTrabalho', 'ocultoConcluido', 'TINYINT(1) NOT NULL DEFAULT 0 AFTER `finalizado`');

-- Colunas complementares de TbTrabalho
CALL AddColumnIfNotExists('TbTrabalho', 'descricaoTrabalho', 'VARCHAR(255) NULL');
CALL AddColumnIfNotExists('TbTrabalho', 'cor', 'VARCHAR(255) NULL');
CALL AddColumnIfNotExists('TbTrabalho', 'descricaoComponente', 'VARCHAR(255) NULL');
CALL AddColumnIfNotExists('TbTrabalho', 'observacao', 'TEXT NULL');
CALL AddColumnIfNotExists('TbTrabalho', 'anotacoes', 'VARCHAR(4000) NULL');
CALL AddColumnIfNotExists('TbTrabalho', 'retrabalho', 'TINYINT(1) NULL DEFAULT 0');
CALL AddColumnIfNotExists('TbTrabalho', 'finalizado', 'TINYINT(1) NULL DEFAULT 0');
CALL AddColumnIfNotExists('TbTrabalho', 'bonificacao', 'TINYINT(1) NOT NULL DEFAULT 0');
CALL AddColumnIfNotExists('TbTrabalho', 'idTrabalhoOrigem', 'INT(11) NULL COMMENT \'Armazena o ID do trabalho original quando este e um retrabalho\'');
CALL AddColumnIfNotExists('TbTrabalho', 'idTabelaPrecoProduto', 'INT(11) NULL');
CALL AddColumnIfNotExists('TbTrabalho', 'idPaciente', 'INT(11) NULL AFTER `nomeEmpresa`');

-- Índices úteis para TbTrabalho
CALL AddIndexIfNotExists('TbTrabalho', 'idx_trabalho_datahoraenvio', '`dataHoraEnvio`');
CALL AddIndexIfNotExists('TbTrabalho', 'idx_trabalho_ocultoconcluido', '`ocultoConcluido`');
CALL AddIndexIfNotExists('TbTrabalho', 'idx_trabalho_status', '`status`');

-- ========================================================================================
-- 4. ATUALIZAÇÃO SEGURA DE TABELAS COMPLEMENTARES
-- ========================================================================================

-- TbComponente: preco e flag hasParafuso
CALL AddColumnIfNotExists('TbComponente', 'preco', 'DECIMAL(10,2) NOT NULL DEFAULT 0.00');
CALL AddColumnIfNotExists('TbComponente', 'hasParafuso', 'TINYINT(1) NOT NULL DEFAULT 0');

-- TbCadastroComplementarEmpresa: dados de pagamento/faturamento
CALL AddColumnIfNotExists('TbCadastroComplementarEmpresa', 'diaPagamento', 'INT(11) NULL');
CALL AddColumnIfNotExists('TbCadastroComplementarEmpresa', 'tipoPagamento', 'VARCHAR(50) NULL');
CALL AddColumnIfNotExists('TbCadastroComplementarEmpresa', 'quantidadeParcelas', 'INT(11) NULL');

-- TbAlmoxarifado: vinculo com empresa
CALL AddColumnIfNotExists('TbAlmoxarifado', 'idEmpresa', 'INT(11) NULL');

-- TbFinanceiroCategoria: classificacao de despesa para DRE
CALL AddColumnIfNotExists('TbFinanceiroCategoria', 'classificacaoDre', 'VARCHAR(50) NULL');
CALL AddColumnIfNotExists('TbFinanceiroCategoria', 'classificacaoDespesa', 'ENUM(\'CUSTO_VARIAVEL\',\'DESPESA_FIXA\',\'INVESTIMENTO\',\'OUTROS\') NULL');
CALL AddColumnIfNotExists('TbFinanceiroCategoria', 'idCategoriaPai', 'INT(11) NULL');

-- TbOrdemServico: padronização de PK se antiga
CALL RenameColumnIfExists('TbOrdemServico', 'idFinanceiro', 'idOrdemServico', 'INT(11) AUTO_INCREMENT NOT NULL');
CALL AddColumnIfNotExists('TbOrdemServico', 'dataConcluido', 'DATETIME NULL');

-- TbOrdemServicoItem: padronização e novos campos
CALL RenameColumnIfExists('TbOrdemServicoItem', 'idFinanceiroItem', 'idOrdemServicoItem', 'INT(11) AUTO_INCREMENT NOT NULL');
CALL RenameColumnIfExists('TbOrdemServicoItem', 'idFinanceiro', 'idOrdemServico', 'INT(11) NULL');
CALL AddColumnIfNotExists('TbOrdemServicoItem', 'idReferencia', 'INT(11) NULL');
CALL AddColumnIfNotExists('TbOrdemServicoItem', 'tipoCobranca', 'VARCHAR(100) NULL');
CALL AddColumnIfNotExists('TbOrdemServicoItem', 'idProfissional', 'INT(11) NULL');
CALL AddColumnIfNotExists('TbOrdemServicoItem', 'idPaciente', 'INT(11) NULL');
CALL AddColumnIfNotExists('TbOrdemServicoItem', 'valorPago', 'DECIMAL(15,2) NULL');
CALL AddColumnIfNotExists('TbOrdemServicoItem', 'quantidadeDevolvida', 'INT(11) NULL DEFAULT 0');
CALL AddColumnIfNotExists('TbOrdemServicoItem', 'status', 'VARCHAR(255) NULL');

-- TbFinanceiroFatura: campos de desconto, notas e split de faturas
CALL AddColumnIfNotExists('TbFinanceiroFatura', 'desconto', 'DECIMAL(15,2) NULL DEFAULT 0.00');
CALL AddColumnIfNotExists('TbFinanceiroFatura', 'descontoDevolucao', 'DECIMAL(15,2) NOT NULL DEFAULT 0.00');
CALL AddColumnIfNotExists('TbFinanceiroFatura', 'valorTotalBruto', 'DECIMAL(15,2) NULL DEFAULT 0.00');
CALL AddColumnIfNotExists('TbFinanceiroFatura', 'anotacoes', 'VARCHAR(4000) NULL');
CALL AddColumnIfNotExists('TbFinanceiroFatura', 'idFaturaOriginal', 'INT(11) NULL');
CALL AddColumnIfNotExists('TbFinanceiroFatura', 'descricao', 'VARCHAR(255) NULL');

-- TbFinanceiroLancamento: documento e vínculo com fornecedor/categoria
CALL AddColumnIfNotExists('TbFinanceiroLancamento', 'numeroDocumento', 'VARCHAR(100) NULL');
CALL AddColumnIfNotExists('TbFinanceiroLancamento', 'idFornecedor', 'INT(11) NULL');
CALL AddColumnIfNotExists('TbFinanceiroLancamento', 'idCategoria', 'INT(11) NULL');

-- TbFinanceiroParcela: juros e acréscimos
CALL AddColumnIfNotExists('TbFinanceiroParcela', 'valorAcrescimoAcumulado', 'DECIMAL(15,2) NULL DEFAULT 0.00');
CALL AddColumnIfNotExists('TbFinanceiroParcela', 'gerarJuros', 'TINYINT(1) NULL DEFAULT 0');

-- TbFinanceiroMovimentacao: acréscimos
CALL AddColumnIfNotExists('TbFinanceiroMovimentacao', 'valorAcrescimo', 'DECIMAL(15,2) NULL DEFAULT 0.00');

-- TbFinanceiroFornecedor: cpf e categoria padrão
CALL AddColumnIfNotExists('TbFinanceiroFornecedor', 'cpf', 'VARCHAR(255) NULL');
CALL AddColumnIfNotExists('TbFinanceiroFornecedor', 'idCategoriaPadrao', 'INT(11) NULL');
CALL AddColumnIfNotExists('TbFinanceiroFornecedor', 'tipoDocumentoLivre', 'VARCHAR(50) NULL');

-- TbTabelaPrecoProduto: versionamento
CALL AddColumnIfNotExists('TbTabelaPrecoProduto', 'idTabelaPrecoProdutoOrigem', 'INT(11) NULL');
CALL AddColumnIfNotExists('TbTabelaPrecoProduto', 'numeroVersao', 'INT(11) NULL DEFAULT 1');

-- TbFaturaDevolucaoItem: campos de paciente
CALL AddColumnIfNotExists('TbFaturaDevolucaoItem', 'idPaciente', 'INT(11) NULL');
CALL AddColumnIfNotExists('TbFaturaDevolucaoItem', 'nomePaciente', 'VARCHAR(255) NULL');

-- TbEmprestimo: saldo restante
CALL AddColumnIfNotExists('TbEmprestimo', 'saldoRestante', 'DECIMAL(15,2) NOT NULL DEFAULT 0.00');

-- ========================================================================================
-- 5. BACKFILL E REGULARIZAÇÃO SEGURA DE DADOS EXISTENTES
-- ========================================================================================

-- Atualiza trabalhos já enviados ou concluídos que não tinham dataHoraEnvio
-- Usa a dataConclusao ou a data atual (NOW) para garantir que não fiquem nulos
UPDATE `TbTrabalho`
SET `dataHoraEnvio` = COALESCE(`dataConclusao`, NOW()),
    `dataConclusao` = COALESCE(`dataConclusao`, NOW())
WHERE `status` IN ('ENVIADO', 'ENVIADO_PROVA', 'PAGAMENTO_RECEBIDO')
  AND `dataHoraEnvio` IS NULL;

-- Garante que nenhum trabalho fique com ocultoConcluido como NULL
UPDATE `TbTrabalho`
SET `ocultoConcluido` = 0
WHERE `ocultoConcluido` IS NULL;

-- Garante que nenhum trabalho fique com finalizado como NULL
UPDATE `TbTrabalho`
SET `finalizado` = 0
WHERE `finalizado` IS NULL;

-- Garante que nenhum trabalho fique com bonificacao como NULL
UPDATE `TbTrabalho`
SET `bonificacao` = 0
WHERE `bonificacao` IS NULL;

-- Garante que TbComponente não tenha preços nulos
UPDATE `TbComponente`
SET `preco` = 0.00
WHERE `preco` IS NULL;

-- Garante que TbFinanceiroFatura não tenha descontoDevolucao nulo
UPDATE `TbFinanceiroFatura`
SET `descontoDevolucao` = 0.00
WHERE `descontoDevolucao` IS NULL;

-- Garante pelo menos 1 Almoxarifado padrão caso a tabela esteja totalmente vazia
INSERT INTO `TbAlmoxarifado` (`nome`, `descricao`, `idEmpresa`, `dataInclusao`)
SELECT 'Almoxarifado Principal', 'Almoxarifado padrao do sistema', 1, NOW()
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `TbAlmoxarifado` LIMIT 1);

-- ========================================================================================
-- 6. LIMPEZA DOS PROCEDIMENTOS AUXILIARES TEMPORÁRIOS
-- ========================================================================================
DROP PROCEDURE IF EXISTS AddColumnIfNotExists;
DROP PROCEDURE IF EXISTS RenameColumnIfExists;
DROP PROCEDURE IF EXISTS RenameTableIfExists;
DROP PROCEDURE IF EXISTS AddIndexIfNotExists;

-- FIM DA MIGRAÇÃO
SELECT '================================================================' AS status;
SELECT '   MIGRACAO PARA AWS CONCLUIDA COM SUCESSO E SEM PERDA DE DADOS! ' AS status;
SELECT '================================================================' AS status;

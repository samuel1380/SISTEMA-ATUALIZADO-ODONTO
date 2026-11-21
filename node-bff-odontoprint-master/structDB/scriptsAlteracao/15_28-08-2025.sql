-- =====================================================================================
-- SCRIPT DE CRIAÇÃO DAS TABELAS DO MÓDULO FINANCEIRO
-- =====================================================================================
--
-- OBJETIVO:
-- Criar todas as tabelas necessárias para o funcionamento do novo módulo financeiro,
-- incluindo contas, lançamentos, parcelas e movimentações.
--
-- !!! IMPORTANTE: FAÇA UM BACKUP COMPLETO DO BANCO DE DADOS ANTES DE EXECUTAR !!!
--
-- =====================================================================================

START TRANSACTION;

-- Tabela 1: Contas Financeiras (TbFinanceiroConta)
-- Armazena as contas bancárias, caixas, etc.
CREATE TABLE IF NOT EXISTS `TbFinanceiroConta` (
  `idConta` INT NOT NULL AUTO_INCREMENT,
  `nome` VARCHAR(100) NOT NULL,
  `tipo` ENUM('CONTA_CORRENTE', 'POUPANCA', 'CAIXA_INTERNO', 'CARTEIRA_DIGITAL') NOT NULL,
  `saldoInicial` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
  `saldoAtual` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
  `idEmpresa` INT NULL,
  `ativo` BOOLEAN NOT NULL DEFAULT TRUE,
  `dataInclusao` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `dataAlteracao` DATETIME NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`idConta`)
) ENGINE=InnoDB;

-- Tabela 2: Lançamentos Financeiros (TbFinanceiroLancamento)
-- Registro mestre para contas a pagar e a receber.
-- NOTA: Assume que a tabela `TbOrdemServico` já existe para a chave estrangeira.
CREATE TABLE IF NOT EXISTS `TbFinanceiroLancamento` (
  `idLancamento` INT NOT NULL AUTO_INCREMENT,
  `descricao` VARCHAR(255) NOT NULL,
  `tipo` ENUM('RECEITA', 'DESPESA') NOT NULL,
  `valorTotal` DECIMAL(15, 2) NOT NULL,
  `dataCompetencia` DATE NOT NULL,
  `status` ENUM('PENDENTE', 'PARCIALMENTE_PAGO', 'PAGO', 'CANCELADO') NOT NULL DEFAULT 'PENDENTE',
  `idOrdemServico` INT NULL,
  `idClienteFornecedor` INT NULL,
  `dataInclusao` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`idLancamento`),
  INDEX `IX_Lancamento_OrdemServico` (`idOrdemServico` ASC),
  CONSTRAINT `FK_Lancamento_OrdemServico`
    FOREIGN KEY (`idOrdemServico`)
    REFERENCES `TbOrdemServico` (`idOrdemServico`)
    ON DELETE SET NULL
    ON UPDATE CASCADE
) ENGINE=InnoDB;

-- Tabela 3: Movimentações Financeiras (TbFinanceiroMovimentacao)
-- O "extrato" do sistema, registrando entradas e saídas consolidadas.
CREATE TABLE IF NOT EXISTS `TbFinanceiroMovimentacao` (
  `idMovimentacao` INT NOT NULL AUTO_INCREMENT,
  `idConta` INT NOT NULL,
  `tipo` ENUM('CREDITO', 'DEBITO') NOT NULL,
  `valor` DECIMAL(15, 2) NOT NULL,
  `descricao` VARCHAR(255) NOT NULL,
  `dataMovimentacao` DATETIME NOT NULL,
  `idParcelaOrigem` INT NULL,
  `idAgrupadorTransferencia` VARCHAR(36) NULL,
  PRIMARY KEY (`idMovimentacao`),
  INDEX `IX_Movimentacao_Conta` (`idConta` ASC),
  CONSTRAINT `FK_Movimentacao_Conta`
    FOREIGN KEY (`idConta`)
    REFERENCES `TbFinanceiroConta` (`idConta`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
) ENGINE=InnoDB;

-- Tabela 4: Parcelas dos Lançamentos (TbFinanceiroParcela)
-- Detalha cada parcela de um lançamento, com seu vencimento e status.
CREATE TABLE IF NOT EXISTS `TbFinanceiroParcela` (
  `idParcela` INT NOT NULL AUTO_INCREMENT,
  `idLancamento` INT NOT NULL,
  `numeroParcela` INT NOT NULL,
  `valor` DECIMAL(15, 2) NOT NULL,
  `dataVencimento` DATE NOT NULL,
  `dataPagamento` DATE NULL,
  `status` ENUM('ABERTO', 'PAGO', 'VENCIDO', 'CANCELADO') NOT NULL DEFAULT 'ABERTO',
  `meioPagamento` ENUM('DINHEIRO', 'CARTAO_CREDITO', 'CARTAO_DEBITO', 'CHEQUE', 'BOLETO', 'TRANSFERENCIA') NOT NULL,
  `dadosAdicionais` JSON NULL,
  `idMovimentacao` INT NULL,
  PRIMARY KEY (`idParcela`),
  INDEX `IX_Parcela_Lancamento` (`idLancamento` ASC),
  INDEX `IX_Parcela_Movimentacao` (`idMovimentacao` ASC),
  CONSTRAINT `FK_Parcela_Lancamento`
    FOREIGN KEY (`idLancamento`)
    REFERENCES `TbFinanceiroLancamento` (`idLancamento`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `FK_Parcela_Movimentacao`
    FOREIGN KEY (`idMovimentacao`)
    REFERENCES `TbFinanceiroMovimentacao` (`idMovimentacao`)
    ON DELETE SET NULL
    ON UPDATE CASCADE
) ENGINE=InnoDB;

COMMIT;






-- Nome do arquivo: 16_30-08-2025_cria_tabela_fatura.sql

START TRANSACTION;

-- Tabela 1: Faturas (TbFinanceiroFatura)
-- Armazena o agrupamento de Ordens de Serviço para cobrança.
CREATE TABLE IF NOT EXISTS `TbFinanceiroFatura` (
  `idFatura` INT NOT NULL AUTO_INCREMENT,
  `idEmpresa` INT NOT NULL,
  `dataInicio` DATE NOT NULL COMMENT 'Data de início do período da fatura',
  `dataFim` DATE NOT NULL COMMENT 'Data de fim do período da fatura',
  `dataVencimento` DATE NOT NULL COMMENT 'Data de vencimento da cobrança gerada',
  `valorTotal` DECIMAL(15, 2) NOT NULL,
  `status` ENUM('ABERTA', 'FECHADA', 'CANCELADA') NOT NULL DEFAULT 'ABERTA',
  `idLancamento` INT NULL COMMENT 'Link para o lançamento financeiro gerado',
  `dataInclusao` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `dataAlteracao` DATETIME NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`idFatura`),
  INDEX `IX_Fatura_Empresa` (`idEmpresa` ASC),
  INDEX `IX_Fatura_Lancamento` (`idLancamento` ASC),
  CONSTRAINT `FK_Fatura_Lancamento`
    FOREIGN KEY (`idLancamento`)
    REFERENCES `TbFinanceiroLancamento` (`idLancamento`)
    ON DELETE SET NULL
    ON UPDATE CASCADE
) ENGINE=InnoDB;

-- Alteração 1: Adicionar coluna `idFatura` na tabela de Ordem de Serviço
-- Esta coluna ligará uma OS a uma fatura específica.
ALTER TABLE `TbOrdemServico`
ADD COLUMN `idFatura` INT NULL DEFAULT NULL AFTER `idTrabalho`,
ADD INDEX `IX_OrdemServico_Fatura` (`idFatura` ASC);

-- Alteração 2: Adicionar a chave estrangeira
ALTER TABLE `TbOrdemServico`
ADD CONSTRAINT `FK_OrdemServico_Fatura`
  FOREIGN KEY (`idFatura`)
  REFERENCES `TbFinanceiroFatura` (`idFatura`)
  ON DELETE SET NULL
  ON UPDATE CASCADE;

-- Alteração 3: Adicionar coluna `totalParcelas` na tabela de Lançamentos
-- Esta coluna armazena o número total de parcelas de um lançamento.
-- Adicionada em 29/08/2025
ALTER TABLE `TbFinanceiroLancamento`
ADD COLUMN `totalParcelas` INT NOT NULL DEFAULT 1 AFTER `valorTotal`;




COMMIT;

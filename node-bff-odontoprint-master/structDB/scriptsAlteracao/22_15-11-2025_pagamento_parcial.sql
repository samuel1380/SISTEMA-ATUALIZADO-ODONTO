ALTER TABLE `TbFinanceiroParcela`
ADD COLUMN `valorPago` DECIMAL(15, 2) NOT NULL DEFAULT 0.00 COMMENT 'Valor total já pago para esta parcela';


ALTER TABLE `TbOrdemServicoItem`
ADD COLUMN `status` ENUM(
    'PENDENTE',
    'FATURADO',
    'DEVOLUCAO_SOLICITADA',
    'DEVOLVIDO',
    'DEVOLUCAO_CANCELADA',
    'PAGO',
    'CANCELADO'
) NOT NULL DEFAULT 'PENDENTE' COMMENT 'Status do item dentro da Ordem de Serviço';


-- Adiciona a coluna para o ID do Profissional
ALTER TABLE `TbOrdemServicoItem` 
ADD COLUMN `idProfissional` INT NULL COMMENT 'ID do profissional associado ao item';

-- Adiciona a coluna para o ID do Paciente
ALTER TABLE `TbOrdemServicoItem` 
ADD COLUMN `idPaciente` INT NULL COMMENT 'ID do paciente associado ao item';


ALTER TABLE `TbFinanceiroFatura` 
MODIFY COLUMN `status` ENUM(
    'ABERTA',
    'AGUARDANDO_DEVOLUCAO',
    'FECHADA',
    'PAGA',
    'PAGA_PARCIALMENTE',
    'CANCELADA'
) NOT NULL DEFAULT 'ABERTA';


-- Cria a tabela para armazenar as solicitações de devolução de componentes
CREATE TABLE IF NOT EXISTS `TbDevolucaoComponente` (
  `idDevolucao` INT NOT NULL AUTO_INCREMENT,
  `idFatura` INT NOT NULL,
  `idOrdemServicoItem` INT NOT NULL,
  `quantidadeDevolvida` INT NOT NULL,
  `status` ENUM('PENDENTE', 'CONFERIDO', 'CONCLUIDO', 'CANCELADO') NOT NULL DEFAULT 'PENDENTE',
  `observacao` TEXT NULL,
  `dataSolicitacao` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `dataConferencia` DATE NULL,
  PRIMARY KEY (`idDevolucao`),
  INDEX `IX_Devolucao_Fatura` (`idFatura` ASC),
  INDEX `IX_Devolucao_OrdemServicoItem` (`idOrdemServicoItem` ASC),
  CONSTRAINT `FK_Devolucao_Fatura`
    FOREIGN KEY (`idFatura`)
    REFERENCES `TbFinanceiroFatura` (`idFatura`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `FK_Devolucao_OrdemServicoItem`
    FOREIGN KEY (`idOrdemServicoItem`)
    REFERENCES `TbOrdemServicoItem` (`idOrdemServicoItem`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB;

-- Adiciona a coluna para rastrear o valor pago em uma fatura (pagamento por item)
ALTER TABLE `TbFinanceiroFatura`
ADD COLUMN `valorPago` DECIMAL(15, 2) NOT NULL DEFAULT 0.00 COMMENT 'Valor total já pago para esta fatura (soma dos pagamentos por item)';

-- Adiciona a coluna para rastrear o valor pago em um item de OS
ALTER TABLE `TbOrdemServicoItem`
ADD COLUMN `valorPago` DECIMAL(10, 2) NOT NULL DEFAULT 0.00 COMMENT 'Valor total já pago para este item';

-- Adiciona a coluna para rastrear a quantidade de itens em devolução
ALTER TABLE `TbOrdemServicoItem`
ADD COLUMN `quantidadeDevolvida` INT NOT NULL DEFAULT 0 COMMENT 'Quantidade de itens em processo de devolução';

-- Adiciona a coluna valorTotalBruto na tabela TbFinanceiroFatura
ALTER TABLE `TbFinanceiroFatura`
ADD COLUMN `valorTotalBruto` DECIMAL(15, 2) NOT NULL DEFAULT 0.00 COMMENT 'Valor total bruto da fatura antes de aplicar o desconto (soma de todas as ordens de serviço)';

-- Atualiza o valorTotalBruto com o valor atual do valorTotal para faturas existentes
UPDATE `TbFinanceiroFatura`
SET `valorTotalBruto` = `valorTotal`
WHERE `valorTotalBruto` = 0.00;


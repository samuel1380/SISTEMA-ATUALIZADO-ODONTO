-- Adiciona a coluna desconto na tabela TbFinanceiroFatura
ALTER TABLE `TbFinanceiroFatura`
ADD COLUMN `desconto` DECIMAL(15, 2) NOT NULL DEFAULT 0.00 COMMENT 'Valor de desconto aplicado na fatura (valor fixo em reais)';


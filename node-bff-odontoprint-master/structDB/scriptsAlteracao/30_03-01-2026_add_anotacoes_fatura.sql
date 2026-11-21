-- Adiciona a coluna anotacoes na tabela TbFinanceiroFatura
-- Esta coluna permite armazenar anotações sobre a fatura para lembretes nas interações com os dentistas
ALTER TABLE `TbFinanceiroFatura`
ADD COLUMN `anotacoes` TEXT NULL COMMENT 'Anotações sobre a fatura para lembretes nas interações com os dentistas';

-- Script de migração para alterar tipo de coluna de datetime para date
-- Data: 19-02-2026
-- Descrição: Altera as colunas dataInicio e dataFim de datetime para date, 
--             removendo a necessidade de considerar hora/minuto/segundo

-- Alterar coluna dataInicio de datetime para date
ALTER TABLE TbEmpresaTabelaPreco 
MODIFY COLUMN dataInicio DATE NOT NULL;

-- Alterar coluna dataFim de datetime para date
ALTER TABLE TbEmpresaTabelaPreco 
MODIFY COLUMN dataFim DATE NULL;

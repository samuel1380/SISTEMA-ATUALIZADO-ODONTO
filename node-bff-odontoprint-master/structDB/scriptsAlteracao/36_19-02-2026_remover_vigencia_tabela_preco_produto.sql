-- Script de migração: remover vigência da tabela de preço
-- Data: 19-02-2026
-- Descrição: Vigência passa a ser apenas em EmpresaTabelaPreco (associação empresa-tabela).
--            Remove colunas dataInicio e dataFim de TbTabelaPrecoProduto.

ALTER TABLE TbTabelaPrecoProduto
DROP COLUMN dataInicio;

ALTER TABLE TbTabelaPrecoProduto
DROP COLUMN dataFim;

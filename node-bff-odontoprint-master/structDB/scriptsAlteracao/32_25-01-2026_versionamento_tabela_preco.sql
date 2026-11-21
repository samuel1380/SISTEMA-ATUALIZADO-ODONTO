-- Script de migração para versionamento de tabelas de preço
-- Data: 25-01-2026
-- Descrição: Adiciona campos de validade (dataInicio e dataFim) na tabela de preço
-- e campo idTabelaPrecoProduto na tabela de trabalho para histórico

-- Adicionar campos de validade na tabela TbTabelaPrecoProduto
-- Primeiro adicionamos como nullable para poder migrar os dados
ALTER TABLE TbTabelaPrecoProduto 
ADD COLUMN dataInicio datetime NULL,
ADD COLUMN dataFim datetime NULL;

-- Migrar dados existentes: definir dataInicio como dataInclusao e dataFim como NULL (vigente indefinidamente)
UPDATE TbTabelaPrecoProduto 
SET dataInicio = COALESCE(dataInclusao, CURRENT_TIMESTAMP),
    dataFim = NULL
WHERE dataInicio IS NULL;

-- Agora tornamos dataInicio NOT NULL com default
ALTER TABLE TbTabelaPrecoProduto 
MODIFY COLUMN dataInicio datetime NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Adicionar campo idTabelaPrecoProduto na tabela TbTrabalho (nullable para migração)
ALTER TABLE TbTrabalho 
ADD COLUMN idTabelaPrecoProduto int(11) NULL;

-- Criar índice para busca eficiente por data de validade
CREATE INDEX idx_tabela_preco_validade ON TbTabelaPrecoProduto(dataInicio, dataFim, ativo);

-- Adicionar foreign key para garantir integridade referencial
-- A foreign key permite NULL, então não há problema com trabalhos antigos
ALTER TABLE TbTrabalho 
ADD CONSTRAINT fk_trabalho_tabela_preco 
FOREIGN KEY (idTabelaPrecoProduto) REFERENCES TbTabelaPrecoProduto(idTabelaPrecoProduto);

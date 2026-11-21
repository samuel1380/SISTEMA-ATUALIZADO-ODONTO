-- Script de migração para versionamento hierárquico de tabelas de preço
-- Data: 25-01-2026
-- Descrição: Adiciona campos para suportar hierarquia de versões (matriz e versões)

-- Adicionar campos de origem e versão na tabela TbTabelaPrecoProduto
ALTER TABLE TbTabelaPrecoProduto 
ADD COLUMN idTabelaPrecoProdutoOrigem int(11) NULL,
ADD COLUMN numeroVersao varchar(50) NULL;

-- Criar índice para buscas eficientes por origem
CREATE INDEX idx_tabela_preco_origem ON TbTabelaPrecoProduto(idTabelaPrecoProdutoOrigem, dataInicio, dataFim);

-- Adicionar foreign key para garantir integridade referencial
ALTER TABLE TbTabelaPrecoProduto 
ADD CONSTRAINT fk_tabela_preco_origem 
FOREIGN KEY (idTabelaPrecoProdutoOrigem) REFERENCES TbTabelaPrecoProduto(idTabelaPrecoProduto);

-- Migrar dados existentes: tabelas atuais viram tabelas matriz (origem = NULL)
-- Se já existirem dados, manter como estão (já serão matrizes)

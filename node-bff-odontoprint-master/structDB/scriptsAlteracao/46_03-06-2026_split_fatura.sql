-- Script de Alteração: Adicionar idFaturaOriginal e descricao na tabela TbFinanceiroFatura
ALTER TABLE TbFinanceiroFatura ADD COLUMN idFaturaOriginal INT NULL;
ALTER TABLE TbFinanceiroFatura ADD COLUMN descricao VARCHAR(255) NULL;

ALTER TABLE TbFinanceiroFatura ADD CONSTRAINT FK_FinanceiroFatura_Original FOREIGN KEY (idFaturaOriginal) REFERENCES TbFinanceiroFatura(idFatura) ON DELETE SET NULL;

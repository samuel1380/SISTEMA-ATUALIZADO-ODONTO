-- Script de migração para associação de tabelas de preço por empresa com vigência
-- Data: 19-02-2026
-- Descrição: Cria tabela para relacionar empresas com tabelas de preço (matriz ou versão) com datas de vigência específicas

-- Criar tabela TbEmpresaTabelaPreco
CREATE TABLE IF NOT EXISTS TbEmpresaTabelaPreco (
  idEmpresaTabelaPreco int(11) NOT NULL AUTO_INCREMENT,
  idEmpresa int(11) NOT NULL,
  idTabelaPrecoProduto int(11) NOT NULL,
  dataInicio datetime NOT NULL,
  dataFim datetime NULL,
  ativo TINYINT(1) NOT NULL DEFAULT 1 CHECK (ativo IN (0, 1)),
  idUsuarioCadastro int(11) NOT NULL,
  dataInclusao datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  dataAlteracao datetime NULL ON UPDATE CURRENT_TIMESTAMP,
  dataExclusao datetime NULL DEFAULT NULL,
  PRIMARY KEY (idEmpresaTabelaPreco),
  FOREIGN KEY (idEmpresa) REFERENCES TbEmpresa(idEmpresa),
  FOREIGN KEY (idTabelaPrecoProduto) REFERENCES TbTabelaPrecoProduto(idTabelaPrecoProduto)
);

-- Criar índices para otimizar buscas por empresa e vigência
CREATE INDEX idx_empresa_tabela_vigencia ON TbEmpresaTabelaPreco(idEmpresa, dataInicio, dataFim, ativo);
CREATE INDEX idx_empresa_tabela_data ON TbEmpresaTabelaPreco(idEmpresa, dataInicio DESC);

-- Migrar dados existentes: criar associação padrão para cada empresa
-- usando a tabela de preço do CadastroComplementarEmpresa
INSERT INTO TbEmpresaTabelaPreco (idEmpresa, idTabelaPrecoProduto, dataInicio, dataFim, ativo, idUsuarioCadastro, dataInclusao)
SELECT 
  cce.idEmpresa,
  cce.idTabelaPrecoProduto,
  COALESCE(cce.dataInclusao, CURRENT_TIMESTAMP) as dataInicio,
  NULL as dataFim,
  1 as ativo,
  cce.idUsuarioCadastro,
  CURRENT_TIMESTAMP as dataInclusao
FROM TbCadastroComplementarEmpresa cce
WHERE cce.idTabelaPrecoProduto IS NOT NULL
  AND cce.idTabelaPrecoProduto > 0
  AND NOT EXISTS (
    SELECT 1 FROM TbEmpresaTabelaPreco etp 
    WHERE etp.idEmpresa = cce.idEmpresa
  );

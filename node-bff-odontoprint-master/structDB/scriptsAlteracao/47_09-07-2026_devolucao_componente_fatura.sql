CREATE TABLE IF NOT EXISTS TbFaturaDevolucaoItem (
  idFaturaDevolucaoItem INT(11) NOT NULL AUTO_INCREMENT,
  idFatura INT(11) NOT NULL,
  idComponente INT(11) NOT NULL,
  quantidade INT(11) NOT NULL,
  valorUnitario DECIMAL(15,2) NOT NULL,
  dataInclusao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (idFaturaDevolucaoItem),
  FOREIGN KEY (idFatura) REFERENCES TbFinanceiroFatura(idFatura),
  FOREIGN KEY (idComponente) REFERENCES TbComponente(idComponente)
);

ALTER TABLE TbFinanceiroFatura ADD COLUMN descontoDevolucao DECIMAL(15,2) NOT NULL DEFAULT 0.00;

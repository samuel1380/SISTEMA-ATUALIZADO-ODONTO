create table if not exists TbComponentesTbTrabalho (
  idTrabalhoComponente int(11) NOT NULL AUTO_INCREMENT,
  idTrabalho int(11) NOT NULL,
  idComponente int(11) NOT NULL,
  qtItens int(11) NOT NULL,
  PRIMARY KEY (`idTrabalhoComponente`),
  FOREIGN KEY (idTrabalho) REFERENCES TbTrabalho(idTrabalho),
  FOREIGN KEY (idComponente) REFERENCES TbComponente(idComponente)
);

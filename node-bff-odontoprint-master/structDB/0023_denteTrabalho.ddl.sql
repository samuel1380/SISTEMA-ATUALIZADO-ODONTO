/*==============================================================*/
/* Table: TbDentesTrabalho                                      */
/*==============================================================*/
create table if not exists TbDentesTrabalho (
  idDenteTrabalho int(11) NOT NULL AUTO_INCREMENT,
  denteNumber int(11) NOT NULL,
  idComponente int(11) NULL,
  idTrabalho int(11) NULL,
  idMarca int(11) NULL,
  idProduto int(11) NOT NULL,
  idScanBody varchar(15) NOT NULL,
  ativo TINYINT(1) NOT NULL DEFAULT 1 check (ativo IN (0, 1)),
  idUsuarioCadastro int(11) NOT NULL,
  dataInclusao datetime NOT NULL default CURRENT_TIMESTAMP,
  dataAlteracao datetime null on update CURRENT_TIMESTAMP,
  dataExclusao datetime NULL DEFAULT NULL,
  PRIMARY KEY (`idDenteTrabalho`),
  FOREIGN KEY (idComponente) REFERENCES TbComponente(idComponente),
  FOREIGN KEY (idMarca) REFERENCES TbMarcaComponente(idMarcaComponente),
  FOREIGN KEY (idProduto) REFERENCES TbProduto(idProduto),
  FOREIGN KEY (idTrabalho) REFERENCES TbTrabalho(idTrabalho)
);

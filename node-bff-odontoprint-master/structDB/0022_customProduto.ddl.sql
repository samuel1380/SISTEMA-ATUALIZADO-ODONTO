/*==============================================================*/
/* Table: TbCustomProduto                                       */
/*==============================================================*/
create table if not exists TbCustomProduto (
  idCustomProduto int(11) NOT NULL AUTO_INCREMENT,
  idProduto int(11) NOT NULL,
  customName varchar(256) NOT NULL,
  customValue varchar(256) NOT NULL,
  ativo TINYINT(1) NOT NULL DEFAULT 1 check (ativo IN (0, 1)),
  idUsuarioCadastro int(11) NOT NULL,
  dataInclusao datetime NOT NULL default CURRENT_TIMESTAMP,
  dataAlteracao datetime null on update CURRENT_TIMESTAMP,
  dataExclusao datetime NULL DEFAULT NULL,
  PRIMARY KEY (`idCustomProduto`),
  FOREIGN KEY (idProduto) REFERENCES TbProduto(idProduto)
);

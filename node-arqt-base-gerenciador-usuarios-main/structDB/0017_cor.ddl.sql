/*==============================================================*/
/* Table: TbCor                                        */
/*==============================================================*/
create table if not exists TbCor (
  idCor int(11) NOT NULL AUTO_INCREMENT,
  nome varchar(255) NOT NULL,
  ativo TINYINT(1) NOT NULL DEFAULT 1 check (ativo IN (0, 1)),
  idUsuarioCadastro int(11) NOT NULL,
  dataInclusao datetime NOT NULL default CURRENT_TIMESTAMP,
  dataAlteracao datetime null on update CURRENT_TIMESTAMP,
  dataExclusao datetime NULL DEFAULT NULL,
  PRIMARY KEY (`idCor`)
);

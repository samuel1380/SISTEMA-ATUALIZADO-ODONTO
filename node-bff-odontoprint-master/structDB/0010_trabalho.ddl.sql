/*==============================================================*/
/* Table: TbTrabalho                                         */
/*==============================================================*/
create table if not exists TbTrabalho (
  idTrabalho int(11) NOT NULL AUTO_INCREMENT,
  nomePaciente varchar(255) NOT NULL,
  idProfissional int(11) NOT NULL,
  idProduto int(11) NOT NULL,
  idEmpresa int(11) NOT NULL,
  nomeEmpresa varchar(255) NOT NULL,
  cor varchar(15) NOT NULL,
  status varchar(255) NOT NULL,
  ordem int(11) NULL,
  ativo TINYINT(1) NOT NULL DEFAULT 1 check (ativo IN (0, 1)),
  idUsuarioCadastro int(11) NOT NULL,
  dataInclusao datetime NOT NULL default CURRENT_TIMESTAMP,
  dataAlteracao datetime null on update CURRENT_TIMESTAMP,
  dataExclusao datetime NULL DEFAULT NULL,
  PRIMARY KEY (`idTrabalho`)
);

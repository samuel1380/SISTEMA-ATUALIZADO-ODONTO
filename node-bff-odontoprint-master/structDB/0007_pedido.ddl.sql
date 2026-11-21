/*==============================================================*/
/* Table: TbPedido                                              */
/*==============================================================*/
create table if not exists TbPedido (
  idPedido int(11) NOT NULL AUTO_INCREMENT,
  idEmpresa int(11) NOT NULL,
  status varchar(255) NOT NULL,
  prazoEntrega datetime NULL,
  vigenciaInicial datetime NULL,
  vigenciaFinal datetime NULL,
  idUsuarioSolicitante int(11) NOT NULL,
  ativo TINYINT(1) NOT NULL DEFAULT 1 check (ativo IN (0, 1)),
  idUsuarioCadastro int(11) NOT NULL,
  dataInclusao datetime NOT NULL default CURRENT_TIMESTAMP,
  dataAlteracao datetime null on update CURRENT_TIMESTAMP,
  dataExclusao datetime NULL DEFAULT NULL,
  PRIMARY KEY (`idPedido`)
);

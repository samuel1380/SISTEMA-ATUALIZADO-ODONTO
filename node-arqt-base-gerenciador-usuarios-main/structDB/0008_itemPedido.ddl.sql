/*==============================================================*/
/* Table: TbItemPedido                                          */
/*==============================================================*/
create table if not exists TbItemPedido (
  idItemPedido int(11) NOT NULL AUTO_INCREMENT,
  idEmpresa int(11) NOT NULL,
  idPedido int(11) NOT NULL,
  idProduto int(11) NOT NULL,
  status varchar(255) NOT NULL,
  prazoEntrega datetime NOT NULL,
  vigenciaInicial datetime NULL,
  vigenciaFinal datetime NULL,
  idUsuarioSolicitante int(11) NOT NULL,
  quantidade int(11) NOT NULL,
  valor int(11) NOT NULL,
  ativo TINYINT(1) NOT NULL DEFAULT 1 check (ativo IN (0, 1)),
  idUsuarioCadastro int(11) NOT NULL,
  dataInclusao datetime NOT NULL default CURRENT_TIMESTAMP,
  dataAlteracao datetime null on update CURRENT_TIMESTAMP,
  dataExclusao datetime NULL DEFAULT NULL,
  PRIMARY KEY (`idItemPedido`)
);

/*==============================================================*/
/* Table: TbFotoPaciente                                        */
/*==============================================================*/
create table if not exists TbProdutoEmpresa (
  idProdutoEmpresa int(11) NOT NULL AUTO_INCREMENT,
  idProduto int(11) NOT NULL,
  idEmpresa int(11) NOT NULL,
  ativo TINYINT(1) NOT NULL DEFAULT 1 check (ativo IN (0, 1)),
  idUsuarioCadastro int(11) NOT NULL,
  dataInclusao datetime NOT NULL default CURRENT_TIMESTAMP,
  dataAlteracao datetime null on update CURRENT_TIMESTAMP,
  dataExclusao datetime NULL DEFAULT NULL,
  PRIMARY KEY (`idProdutoEmpresa`),
  FOREIGN KEY (idProduto) REFERENCES TbProduto(idProduto),
  FOREIGN KEY (idEmpresa) REFERENCES TbEmpresa(idEmpresa)
);

alter table TbProdutoEmpresa add constraint FkTbProdutoTbProdutoEmpresa foreign key (idProduto)
      references TbProduto (idProduto) on delete restrict on update restrict;

alter table TbProdutoEmpresa add constraint FkTbEmpresaTbProdutoEmpresa foreign key (idEmpresa)
      references TbEmpresa (idEmpresa) on delete restrict on update restrict;

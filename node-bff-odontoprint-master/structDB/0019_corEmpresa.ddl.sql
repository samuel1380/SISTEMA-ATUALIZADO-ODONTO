/*==============================================================*/
/* Table: TbCorEmpresa                                        */
/*==============================================================*/
create table if not exists TbCorEmpresa (
  idCorEmpresa int(11) NOT NULL AUTO_INCREMENT,
  idCor int(11) NOT NULL,
  idEmpresa int(11) NOT NULL,
  ativo TINYINT(1) NOT NULL DEFAULT 1 check (ativo IN (0, 1)),
  idUsuarioCadastro int(11) NOT NULL,
  dataInclusao datetime NOT NULL default CURRENT_TIMESTAMP,
  dataAlteracao datetime null on update CURRENT_TIMESTAMP,
  dataExclusao datetime NULL DEFAULT NULL,
  PRIMARY KEY (`idCorEmpresa`),
  FOREIGN KEY (idCor) REFERENCES TbCor(idCor),
  FOREIGN KEY (idEmpresa) REFERENCES TbEmpresa(idEmpresa)
);

alter table TbCorEmpresa add constraint FkTbCorTbCorEmpresa foreign key (idCor)
      references TbCor (idCor) on delete restrict on update restrict;

alter table TbCorEmpresa add constraint FkTbEmpresaTbCorEmpresa foreign key (idEmpresa)
      references TbEmpresa (idEmpresa) on delete restrict on update restrict;

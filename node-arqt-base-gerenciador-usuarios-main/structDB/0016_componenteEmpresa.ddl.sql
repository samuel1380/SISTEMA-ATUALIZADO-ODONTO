/*==============================================================*/
/* Table: TbComponenteEmpresa                                        */
/*==============================================================*/
create table if not exists TbComponenteEmpresa (
  idComponenteEmpresa int(11) NOT NULL AUTO_INCREMENT,
  idComponente int(11) NOT NULL,
  idEmpresa int(11) NOT NULL,
  ativo TINYINT(1) NOT NULL DEFAULT 1 check (ativo IN (0, 1)),
  idUsuarioCadastro int(11) NOT NULL,
  dataInclusao datetime NOT NULL default CURRENT_TIMESTAMP,
  dataAlteracao datetime null on update CURRENT_TIMESTAMP,
  dataExclusao datetime NULL DEFAULT NULL,
  PRIMARY KEY (`idComponenteEmpresa`),
  FOREIGN KEY (idComponente) REFERENCES TbComponente(idComponente),
  FOREIGN KEY (idEmpresa) REFERENCES TbEmpresa(idEmpresa)
);

alter table TbComponenteEmpresa add constraint FkTbComponenteTbComponenteEmpresa foreign key (idComponente)
      references TbComponente (idComponente) on delete restrict on update restrict;

alter table TbComponenteEmpresa add constraint FkTbEmpresaTbComponenteEmpresa foreign key (idEmpresa)
      references TbEmpresa (idEmpresa) on delete restrict on update restrict;

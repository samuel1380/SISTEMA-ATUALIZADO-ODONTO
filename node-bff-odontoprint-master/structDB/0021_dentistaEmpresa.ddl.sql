/*==============================================================*/
/* Table: TbDentistaEmpresa                                        */
/*==============================================================*/
create table if not exists TbDentistaEmpresa (
  idDentistaEmpresa int(11) NOT NULL AUTO_INCREMENT,
  idDentista int(11) NOT NULL,
  idEmpresa int(11) NOT NULL,
  ativo TINYINT(1) NOT NULL DEFAULT 1 check (ativo IN (0, 1)),
  idUsuarioCadastro int(11) NOT NULL,
  dataInclusao datetime NOT NULL default CURRENT_TIMESTAMP,
  dataAlteracao datetime null on update CURRENT_TIMESTAMP,
  dataExclusao datetime NULL DEFAULT NULL,
  PRIMARY KEY (`idDentistaEmpresa`),
  FOREIGN KEY (idDentista) REFERENCES TbDentista(idDentista),
  FOREIGN KEY (idEmpresa) REFERENCES TbEmpresa(idEmpresa)
);

alter table TbDentistaEmpresa add constraint FkTbDentistaTbDentistaEmpresa foreign key (idDentista)
      references TbDentista (idDentista) on delete restrict on update restrict;

alter table TbDentistaEmpresa add constraint FkTbEmpresaTbDentistaEmpresa foreign key (idEmpresa)
      references TbEmpresa (idEmpresa) on delete restrict on update restrict;

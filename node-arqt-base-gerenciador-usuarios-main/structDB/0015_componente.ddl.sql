/*==============================================================*/
/* Table: TbComponente                                        */
/*==============================================================*/
create table if not exists TbComponente (
  idComponente int(11) NOT NULL AUTO_INCREMENT,
  idMarcaComponente int(11) NOT NULL,
  nome varchar(255) NOT NULL,
  ativo TINYINT(1) NOT NULL DEFAULT 1 check (ativo IN (0, 1)),
  idUsuarioCadastro int(11) NOT NULL,
  dataInclusao datetime NOT NULL default CURRENT_TIMESTAMP,
  dataAlteracao datetime null on update CURRENT_TIMESTAMP,
  dataExclusao datetime NULL DEFAULT NULL,
  PRIMARY KEY (`idComponente`),
  FOREIGN KEY (idMarcaComponente) REFERENCES TbMarcaComponente(idMarcaComponente)
);


alter table TbComponente add constraint FkTbMarcaComponenteTbComponente foreign key (idMarcaComponente)
      references TbMarcaComponente (idMarcaComponente) on delete restrict on update restrict;

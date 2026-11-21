/*==============================================================*/
/* Table: TbFotoPaciente                                        */
/*==============================================================*/
create table if not exists TbCadastroComplementarEmpresa (
  idCadastroComplementarEmpresa int(11) NOT NULL AUTO_INCREMENT,
  porcentagemDesconto float NULL,
  utilizaInterfaces TINYINT(1) NOT NULL DEFAULT 1 check (utilizaInterfaces IN (0, 1)),
  scannerProprio TINYINT(1) NOT NULL DEFAULT 1 check (scannerProprio IN (0, 1)),
  idEmpresa int(11) NOT NULL,
  ativo TINYINT(1) NOT NULL DEFAULT 1 check (ativo IN (0, 1)),
  idUsuarioCadastro int(11) NOT NULL,
  dataInclusao datetime NOT NULL default CURRENT_TIMESTAMP,
  dataAlteracao datetime null on update CURRENT_TIMESTAMP,
  dataExclusao datetime NULL DEFAULT NULL,
  PRIMARY KEY (`idCadastroComplementarEmpresa`),
  FOREIGN KEY (idEmpresa) REFERENCES TbEmpresa(idEmpresa)
);

alter table TbCadastroComplementarEmpresa add constraint FkTbEmpresaTbCadastroComplementarEmpresa foreign key (idEmpresa)
      references TbEmpresa (idEmpresa) on delete restrict on update restrict;

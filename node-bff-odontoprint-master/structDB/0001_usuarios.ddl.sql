/*==============================================================*/
/* Table: TbUsuario                                             */
/*==============================================================*/
create table if not exists TbUsuario (
  idUsuario int(11) NOT NULL AUTO_INCREMENT,
  nome varchar(255) NOT NULL,
  email varchar(255) NOT NULL,
  senha varchar(64) NULL,
  token varchar(100) NULL,
  tipoUsuario varchar(100) NOT NULL DEFAULT 'externo' check (tipoUsuario IN ('externo', 'interno')),
  dataExpiracaoToken datetime,
  bloqueado TINYINT(1) NOT NULL DEFAULT 1 check (bloqueado IN (0, 1)),
  ativo TINYINT(1) NOT NULL DEFAULT 1 check (ativo IN (0, 1)),
  idUsuarioCadastro int(11) NOT NULL,
  dataInclusao datetime NOT NULL default CURRENT_TIMESTAMP,
  dataAlteracao datetime null on update CURRENT_TIMESTAMP,
  dataExclusao datetime NULL DEFAULT NULL,
  PRIMARY KEY (`idUsuario`)
);

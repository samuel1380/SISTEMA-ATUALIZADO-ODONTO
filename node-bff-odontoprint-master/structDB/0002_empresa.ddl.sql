/*==============================================================*/
/* Table: TbEmpresa                                             */
/*==============================================================*/
create table if not exists TbEmpresa (
  idEmpresa int(11) NOT NULL AUTO_INCREMENT,
  nome varchar(255) NOT NULL,
  razaoSocial varchar(255) NULL,
  documento varchar(255) NULL,
  tipoEmpresa varchar(255) NULL,
  logradouro varchar(255) NULL,
  cep varchar(10) NULL,
  complemento varchar(255) NULL,
  cidade varchar(255) NULL,
  uf varchar(2) NULL,
  numeroDocumentoResponsavelTecnico varchar(100) NULL,
  responsavelTecnico varchar(255) NOT NULL,
  nomeResponsavelFinanceiro varchar(255) NULL,
  telefoneFinanceiro varchar(255) NULL,
  emailFinanceiro varchar(255) NULL,
  nomeResponsavel varchar(255) NOT NULL,
  email varchar(255) NOT NULL,
  telefone varchar(50) NOT NULL,
  aprovada TINYINT(1) NOT NULL DEFAULT 0 check (aprovada IN (0, 1)),
  ativo TINYINT(1) NOT NULL DEFAULT 1 check (ativo IN (0, 1)),
  idUsuarioCadastro int(11) NOT NULL,
  dataInclusao datetime NOT NULL default CURRENT_TIMESTAMP,
  dataAlteracao datetime null on update CURRENT_TIMESTAMP,
  dataExclusao datetime NULL DEFAULT NULL,
  PRIMARY KEY (`idEmpresa`)
);

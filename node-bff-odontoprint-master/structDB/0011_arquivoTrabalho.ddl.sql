/*==============================================================*/
/* Table: TbArquivoTrabalho                                     */
/*==============================================================*/
create table if not exists TbArquivoTrabalho (
  idArquivoTrabalho int(11) NOT NULL AUTO_INCREMENT,
  nomeArquivo varchar(255) NOT NULL,
  nomeOriginal varchar(255) NOT NULL,
  path varchar(255) NOT NULL,
  bucket varchar(255) NOT NULL,
  tamanho int(11) NOT NULL,
  tipo varchar(255) NOT NULL,
  ordem int(11) NOT NULL,
  idTrabalho int(11) NOT NULL,
  idEmpresa int(11) NOT NULL,
  ativo TINYINT(1) NOT NULL DEFAULT 1 check (ativo IN (0, 1)),
  idUsuarioCadastro int(11) NOT NULL,
  dataInclusao datetime NOT NULL default CURRENT_TIMESTAMP,
  dataAlteracao datetime null on update CURRENT_TIMESTAMP,
  dataExclusao datetime NULL DEFAULT NULL,
  PRIMARY KEY (`idArquivoTrabalho`)
);

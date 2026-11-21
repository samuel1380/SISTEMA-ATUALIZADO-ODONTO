create table if not exists TbTabelaPrecoProduto (
  idTabelaPrecoProduto int(11) NOT NULL AUTO_INCREMENT,
  nome varchar(255) NOT NULL,
  ativo TINYINT(1) NOT NULL DEFAULT 1 check (ativo IN (0, 1)),
  idUsuarioCadastro int(11) NOT NULL,
  dataInclusao datetime NOT NULL default CURRENT_TIMESTAMP,
  dataAlteracao datetime null on update CURRENT_TIMESTAMP,
  dataExclusao datetime NULL DEFAULT NULL,
  PRIMARY KEY (`idTabelaPrecoProduto`)
);


create table if not exists TbPrecoProduto (
  idPrecoProduto int(11) NOT NULL AUTO_INCREMENT,
  preco decimal(11,2) NULL,
  idProduto int(11) NOT NULL,
  idTabelaPrecoProduto int(11) NOT NULL,
  ativo TINYINT(1) NOT NULL DEFAULT 1 check (ativo IN (0, 1)),
  idUsuarioCadastro int(11) NOT NULL,
  dataInclusao datetime NOT NULL default CURRENT_TIMESTAMP,
  dataAlteracao datetime null on update CURRENT_TIMESTAMP,
  dataExclusao datetime NULL DEFAULT NULL,
  PRIMARY KEY (`idPrecoProduto`),
  FOREIGN KEY (idProduto) REFERENCES TbProduto(idProduto),
  FOREIGN KEY (idTabelaPrecoProduto) REFERENCES TbTabelaPrecoProduto(idTabelaPrecoProduto)
);

ALTER TABLE TbCadastroComplementarEmpresa ADD idTabelaPrecoProduto int(11) NOT NULL;
ALTER TABLE TbCadastroComplementarEmpresa CHANGE idTabelaPrecoProduto idTabelaPrecoProduto int(11) NOT NULL AFTER scannerProprio;



ALTER TABLE TbTrabalho ADD idProduto int(11) NULL;
ALTER TABLE TbTrabalho CHANGE idProduto idProduto int(11) NULL AFTER status;


create table if not exists TbComponentesTrabalhoTbTrabalho (
  idComponenteTrabalho int(11) NOT NULL AUTO_INCREMENT,
  idTrabalho int(11) NOT NULL,
  idComponente int(11) NOT NULL,
  qtdItems int(11) NOT NULL,
  ativo TINYINT(1) NOT NULL DEFAULT 1 check (ativo IN (0, 1)),
  dataInclusao datetime NOT NULL default CURRENT_TIMESTAMP,
  dataAlteracao datetime null on update CURRENT_TIMESTAMP,
  dataExclusao datetime NULL DEFAULT NULL,
  PRIMARY KEY (`idComponenteTrabalho`),
  FOREIGN KEY (idTrabalho) REFERENCES TbTrabalho(idTrabalho),
  FOREIGN KEY (idComponente) REFERENCES TbComponente(idComponente)
);


create table if not exists TbHistoricoStatusTrabalho (
  idHistoricoStatusTrabalho int(11) NOT NULL AUTO_INCREMENT,
  nome varchar(255) NOT NULL,
  idTrabalho int(11) NOT NULL,
  statusAterior varchar(255) NOT NULL,
  statusAtual varchar(255) NOT NULL,
  ativo TINYINT(1) NOT NULL DEFAULT 1 check (ativo IN (0, 1)),
  idUsuarioCadastro int(11) NOT NULL,
  dataInclusao datetime NOT NULL default CURRENT_TIMESTAMP,
  dataAlteracao datetime null on update CURRENT_TIMESTAMP,
  dataExclusao datetime NULL DEFAULT NULL,
  PRIMARY KEY (`idHistoricoStatusTrabalho`)
);

create table if not exists TbFinanceiro (
  idFinanceiro int(11) NOT NULL AUTO_INCREMENT,
  idTrabalho int(11) NOT NULL,
  idEmpresa int(11) NOT NULL,
  status varchar(255) NOT NULL,
  valorTotal decimal(11,2) NULL,
  concluido TINYINT(1) NOT NULL DEFAULT 1 check (concluido IN (0, 1)),
  ativo TINYINT(1) NOT NULL DEFAULT 1 check (ativo IN (0, 1)),
  idUsuarioCadastro int(11) NOT NULL,
  dataInclusao datetime NOT NULL default CURRENT_TIMESTAMP,
  dataAlteracao datetime null on update CURRENT_TIMESTAMP,
  dataExclusao datetime NULL DEFAULT NULL,
  PRIMARY KEY (`idFinanceiro`),
  FOREIGN KEY (idTrabalho) REFERENCES TbTrabalho(idTrabalho),
  FOREIGN KEY (idEmpresa) REFERENCES TbEmpresa(idEmpresa)
);

create table if not exists TbFinanceiroItem (
  idFinanceiroItem int(11) NOT NULL AUTO_INCREMENT,
  idFinanceiro int(11) NOT NULL,
  descricao varchar(255) NOT NULL,
  valor decimal(11,2) NULL,
  quantidade int(11) NOT NULL,
  valorTotal decimal(11,2) NULL,
  ativo TINYINT(1) NOT NULL DEFAULT 1 check (ativo IN (0, 1)),
  idUsuarioCadastro int(11) NOT NULL,
  dataInclusao datetime NOT NULL default CURRENT_TIMESTAMP,
  dataAlteracao datetime null on update CURRENT_TIMESTAMP,
  dataExclusao datetime NULL DEFAULT NULL,
  PRIMARY KEY (`idFinanceiroItem`)
);

ALTER TABLE odontoprint_db.TbFinanceiroItem ADD idReferencia int(11) NOT NULL;
ALTER TABLE odontoprint_db.TbFinanceiroItem CHANGE idReferencia idReferencia int(11) NOT NULL AFTER valorTotal;

ALTER TABLE odontoprint_db.TbFinanceiroItem ADD tipoCobranca varchar(100) NOT NULL;
ALTER TABLE odontoprint_db.TbFinanceiroItem CHANGE tipoCobranca tipoCobranca varchar(100) NOT NULL AFTER idReferencia;

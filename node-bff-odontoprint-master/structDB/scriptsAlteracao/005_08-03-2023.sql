create table if not exists TbElementosTrabalho (
    idElementoTrabalho int(11) NOT NULL AUTO_INCREMENT,
    nome VARCHAR(255) NOT NULL,
    ativo BOOLEAN DEFAULT 1,
    idUsuarioCadastro int(11) NOT NULL,
    dataInclusao datetime NOT NULL default CURRENT_TIMESTAMP,
    dataAlteracao datetime null on update CURRENT_TIMESTAMP,
    dataExclusao datetime NULL DEFAULT NULL,
    PRIMARY KEY (idElementoTrabalho)
);

create table if not exists TbElementosTrabalhoTbTrabalho (
  idTrabalho int(11) NOT NULL,
  idElementoTrabalho int(11) NOT NULL,
  FOREIGN KEY (idTrabalho) REFERENCES TbTrabalho(idTrabalho),
  FOREIGN KEY (idElementoTrabalho) REFERENCES TbElementosTrabalho(idElementoTrabalho),
  FOREIGN KEY (idEmpresa) REFERENCES TbEmpresa(idEmpresa)
);

create table if not exists TbComponentesTrabalho (
    idComponenteTrabalho int(11) NOT NULL AUTO_INCREMENT,
    nome VARCHAR(255) NOT NULL,
    ativo BOOLEAN DEFAULT 1,
    idUsuarioCadastro int(11) NOT NULL,
    dataInclusao datetime NOT NULL default CURRENT_TIMESTAMP,
    dataAlteracao datetime null on update CURRENT_TIMESTAMP,
    dataExclusao datetime NULL DEFAULT NULL,
    PRIMARY KEY (idComponenteTrabalho)
);


ALTER TABLE TbDentista ADD COLUMN idUsuarioSistema int(11) NOT NULL AFTER idEmpresa;

ALTER TABLE TbTrabalho ADD COLUMN idEmpresa int(11) NOT NULL AFTER idProduto;
ALTER TABLE TbTrabalho ADD COLUMN nomeEmpresa varchar(255) NOT NULL AFTER idEmpresa;
ALTER TABLE TbTrabalho CHANGE cor idCor INT NOT NULL;
ALTER TABLE TbTrabalho MODIFY COLUMN idCor INT NOT NULL;

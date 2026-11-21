ALTER TABLE TbFaturaDevolucaoItem ADD COLUMN idPaciente INT(11) NULL DEFAULT NULL AFTER idComponente;
ALTER TABLE TbFaturaDevolucaoItem ADD COLUMN nomePaciente VARCHAR(255) NULL DEFAULT NULL AFTER idPaciente;
ALTER TABLE TbFaturaDevolucaoItem ADD CONSTRAINT FK_FaturaDevolucaoItem_Paciente FOREIGN KEY (idPaciente) REFERENCES TbPaciente(idPaciente);

ALTER TABLE odontoprint_db.TbTrabalho ADD dataConclusao DATE NULL;
ALTER TABLE odontoprint_db.TbTrabalho CHANGE dataConclusao dataConclusao DATE NULL AFTER ordem;

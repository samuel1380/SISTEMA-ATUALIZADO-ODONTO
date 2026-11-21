alter table TbProdutoEmpresa add constraint FkTbProdutoTbProdutoEmpresa foreign key (idProduto)
      references TbProduto (idProduto) on delete restrict on update restrict;

alter table TbProdutoEmpresa add constraint FkTbEmpresaTbProdutoEmpresa foreign key (idEmpresa)
      references TbEmpresa (idEmpresa) on delete restrict on update restrict;

alter table TbComponente add constraint FkTbMarcaComponenteTbComponente foreign key (idMarcaComponente)
      references TbMarcaComponente (idMarcaComponente) on delete restrict on update restrict;

alter table TbCadastroComplementarEmpresa add constraint FkTbEmpresaTbCadastroComplementarEmpresa foreign key (idEmpresa)
      references TbEmpresa (idEmpresa) on delete restrict on update restrict;

alter table TbComponenteEmpresa add constraint FkTbComponenteTbComponenteEmpresa foreign key (idComponente)
      references TbComponente (idComponente) on delete restrict on update restrict;

alter table TbComponenteEmpresa add constraint FkTbEmpresaTbComponenteEmpresa foreign key (idEmpresa)
      references TbEmpresa (idEmpresa) on delete restrict on update restrict;

alter table TbCorEmpresa add constraint FkTbCorTbCorEmpresa foreign key (idCor)
      references TbCor (idCor) on delete restrict on update restrict;

alter table TbCorEmpresa add constraint FkTbEmpresaTbCorEmpresa foreign key (idEmpresa)
      references TbEmpresa (idEmpresa) on delete restrict on update restrict;


ALTER TABLE TbProdutoEmpresa ADD FOREIGN KEY (idProduto) REFERENCES TbProduto(idProduto);
ALTER TABLE TbComponente ADD FOREIGN KEY (idMarcaComponente) REFERENCES TbMarcaComponente(idMarcaComponente);
ALTER TABLE TbCadastroComplementarEmpresa ADD FOREIGN KEY (idEmpresa) REFERENCES TbEmpresa(idEmpresa);
ALTER TABLE TbComponenteEmpresa ADD FOREIGN KEY (idComponente) REFERENCES TbComponente(idComponente);
ALTER TABLE TbComponenteEmpresa ADD FOREIGN KEY (idEmpresa) REFERENCES TbEmpresa(idEmpresa);
ALTER TABLE TbCorEmpresa ADD FOREIGN KEY (idCor) REFERENCES TbCor(idCor);
ALTER TABLE TbCorEmpresa ADD FOREIGN KEY (idEmpresa) REFERENCES TbEmpresa(idEmpresa);

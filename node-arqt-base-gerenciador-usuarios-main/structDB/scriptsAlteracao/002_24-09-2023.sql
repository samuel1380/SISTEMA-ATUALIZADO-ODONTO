ALTER TABLE `odontoprint_db`.`TbProduto` 
ADD COLUMN `idCategoriaProduto` int(11) NOT NULL AFTER `preco`,
ADD CONSTRAINT `fk_TbProduto_TbCategoriaProduto`
  FOREIGN KEY (idCategoriaProduto)
  REFERENCES `TbCategoriaProduto` (idCategoriaProduto)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION;


INSERT INTO `odontoprint_db`.`TbCategoriaProduto` (`idCategoriaProduto`, `nome`, `ativo`, `idUsuarioCadastro`, dataInclusao) VALUES
  (1, 'RESINA 3D', '1', '1', default),
  (2, 'PMMA', '1', '1', default);
  (3, 'ZIRCONIA', '1', '1', default);


INSERT INTO `odontoprint_db`.`TbProduto` (`idProduto`, `nome`, `prazoEntregaDias`, `precoCusto`, `preco`, `idCategoriaProduto`, `ativo`, `idUsuarioCadastro`, `dataInclusao`) VALUES 
  (1, 'ENCERAMENTO DIAGNOSTICO', '2', '10', '20', '1', '1', '1', default),
  (2, 'MODELO DE ESTUDO', '2', '10', '20', '1', '1', '1', default),
  (3, 'CIRURGIA GUIADA', '2', '10', '20', '1', '1', '1', default),

  (4, 'PLACA MIORRELAXANTE', '2', '10', '20', '2', '1', '1', default),
  (5, 'COROA SOBRE DENTE', '2', '10', '20', '2', '1', '1', default),
  (6, 'ONLAY/INLAY', '2', '10', '20', '2', '1', '1', default),
  (7, 'PROTOCOLO PROVISÓRIO', '2', '10', '20', '2', '1', '1', default),
  (8, 'FACETA', '2', '10', '20', '2', '1', '1', default),
  (9, 'PROVISORIO', '2', '10', '20', '2', '1', '1', default),
  (10, 'PROVISORIO CONDICIONADOR DE GENGIVA SOBRE IMPLANTE', '2', '10', '20', '2', '1', '1', default),

  (11, 'COROA SOBRE DENTE', '2', '10', '20', '3', '1', '1', default),
  (12, 'ONLAY/INLAY', '2', '10', '20', '3', '1', '1', default),
  (13, 'PROTOCOLO', '2', '10', '20', '3', '1', '1', default),
  (14, 'PROTOCOLO DENTOGENGIVAL', '2', '10', '20', '3', '1', '1', default),
  (15, 'COROA SOBRE IMPLANTE UNITARIA', '2', '10', '20', '3', '1', '1', default),
  (16, 'COROA SOBRE IMPLANTE DENTOGENGIVAL', '2', '10', '20', '3', '1', '1', default),
  (17, 'MULTIPLA SOBRE IMPLANTE', '2', '10', '20', '3', '1', '1', default),
  (18, 'MULTIPLA SOBRE IMPLANTE DENTOGENGIVAL', '2', '10', '20', '3', '1', '1', default),
  (19, 'FACETA', '2', '10', '20', '3', '1', '1', default),
  (20, 'COPPING SIMPLES', '2', '10', '20', '3', '1', '1', default);

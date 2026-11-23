-- Adiciona o componente: ref 101.099 munhao universal abutment 4.5x4 neodent
-- Marca Neodent: idMarcaComponente = 2

INSERT INTO `TbComponente` (
  `idMarcaComponente`,
  `nome`,
  `preco`,
  `ativo`,
  `idUsuarioCadastro`,
  `dataInclusao`,
  `hasParafuso`
)
SELECT 
  2,
  'MUNHAO UNIVERSAL ABUTMENT 4.5X4 NEODENT - 101.099',
  0.00,
  1,
  1,
  NOW(),
  0
WHERE NOT EXISTS (
  SELECT 1 FROM `TbComponente` WHERE `nome` LIKE '%101.099%'
);

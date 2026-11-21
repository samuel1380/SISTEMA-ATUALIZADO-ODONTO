-- Execute no MESMO banco/schema configurado no BFF (variáveis de ambiente / .env).
-- Se não retornar linha com COLUMN_NAME = 'cpf', rode 39_22-03-2026_fornecedor_cpf.sql

SELECT
  COLUMN_NAME,
  DATA_TYPE,
  CHARACTER_MAXIMUM_LENGTH,
  IS_NULLABLE,
  COLUMN_COMMENT
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'TbFinanceiroFornecedor'
  AND COLUMN_NAME IN ('cnpj', 'cpf')
ORDER BY ORDINAL_POSITION;

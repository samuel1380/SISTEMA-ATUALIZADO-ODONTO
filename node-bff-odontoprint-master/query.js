const mysql = require('mysql2/promise');
require('dotenv').config();
async function run() {
  const con = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
  });
  const [rows] = await con.execute(`SELECT idFornecedor, razaoSocial, cpf, cnpj FROM TbFinanceiroFornecedor WHERE cpf LIKE '%007%' OR cpf LIKE '%*%' OR cnpj LIKE '%*%' LIMIT 10`);
  console.log(rows);
  process.exit(0);
}
run();

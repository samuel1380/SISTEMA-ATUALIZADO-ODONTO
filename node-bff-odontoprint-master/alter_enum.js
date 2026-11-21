const mysql = require('mysql2/promise');

async function run() {
  const connection = await mysql.createConnection({
    host: 'db.labodontoprint.com.br',
    port: 3306,
    database: 'odontoprint_db',
    user: 'admin',
    password: 'FAZUFpLv5NX5XMRsTTxnbJXj624bvYuH'
  });

  console.log('Connected to DB!');
  await connection.query("ALTER TABLE TbEmprestimoMovimentacao MODIFY COLUMN tipoMovimentacao ENUM('JUROS', 'PAGAMENTO', 'ACRESCIMO') DEFAULT 'PAGAMENTO'");
  console.log('Table modified successfully!');
  await connection.end();
}

run().catch(err => { console.error(err); process.exit(1); });

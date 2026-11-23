const mysql = require('mysql2/promise');

async function checkDRE() {
  const connection = await mysql.createConnection({
    host: 'db.labodontoprint.com.br',
    user: 'admin',
    password: 'FAZUFpLv5NX5XMRsTTxnbJXj624bvYuH',
    database: 'odontoprint_db'
  });

  console.log('=== RESUMO DAS FATURAS POR MÊS DE COMPETÊNCIA (2026) ===');
  const [rows] = await connection.query(`
    SELECT 
      DATE_FORMAT(dataInicio, '%m/%Y') AS mes_competencia,
      COUNT(*) AS qtd_faturas,
      SUM(CASE WHEN status != 'CANCELADA' THEN valorTotal ELSE 0 END) AS total_dre,
      SUM(CASE WHEN status = 'PAGA' THEN valorTotal ELSE 0 END) AS total_pago,
      SUM(CASE WHEN status = 'ABERTA' THEN valorTotal ELSE 0 END) AS total_aberto
    FROM TbFinanceiroFatura
    WHERE YEAR(dataInicio) = 2026 AND status != 'CANCELADA'
    GROUP BY DATE_FORMAT(dataInicio, '%Y-%m'), DATE_FORMAT(dataInicio, '%m/%Y')
    ORDER BY DATE_FORMAT(dataInicio, '%Y-%m') ASC;
  `);

  console.table(rows);

  console.log('\n=== CHECANDO FATURAS DE DEZEMBRO/2026 ===');
  const [dezRows] = await connection.query(`
    SELECT idFatura, idEmpresa, dataInicio, dataFim, valorTotal, status, descricao
    FROM TbFinanceiroFatura
    WHERE dataInicio >= '2026-12-01' AND status != 'CANCELADA';
  `);
  if (dezRows.length === 0) {
    console.log('>> Nenhuma fatura em Dezembro/2026. (Perfeito: Dezembro = R$ 0,00)');
  } else {
    console.table(dezRows);
  }

  await connection.end();
}

checkDRE().catch(console.error);

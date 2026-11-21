const mysql = require('mysql2/promise');

async function check() {
    const conn = await mysql.createConnection({
        host: 'db.labodontoprint.com.br',
        user: 'admin',
        password: '',
        database: 'odontoprint_db'
    });

    const [rows] = await conn.execute(`
        SELECT idCategoria, nome, tipo, classificacaoDre, idCategoriaPai 
        FROM TbFinanceiroCategoria 
        WHERE classificacaoDre = 'INVESTIMENTO' OR idCategoriaPai IN (SELECT idCategoria FROM TbFinanceiroCategoria WHERE classificacaoDre = 'INVESTIMENTO')
        ORDER BY idCategoriaPai ASC, idCategoria
    `);

    console.table(rows);
    await conn.end();
}

check().catch(console.error);

let mysql;
try {
  mysql = require('mysql2/promise');
} catch {
  mysql = require('/home/ubuntu/node-bff-odontoprint/node_modules/mysql2/promise');
}

function fmt(v) {
  return Number(v || 0).toFixed(2);
}

async function run() {
  const conn = await mysql.createConnection({
    host: 'db.labodontoprint.com.br',
    user: 'admin',
    password: 'FAZUFpLv5NX5XMRsTTxnbJXj624bvYuH',
    database: 'odontoprint_db',
  });

  console.log('\n=== 1. RESUMO MENSAL 2026 (CONSOLIDADO <=739 vs >739) ===');
  const [resumo] = await conn.query(`
    SELECT
      DATE_FORMAT(f.dataInicio, '%Y-%m') AS mes,
      COUNT(*) AS qtd_tot,
      SUM(f.valorTotal) AS dre_hoje,
      SUM(CASE WHEN f.idFatura <= 739 THEN 1 ELSE 0 END) AS qtd_ate739,
      SUM(CASE WHEN f.idFatura <= 739 THEN f.valorTotal ELSE 0 END) AS val_ate739,
      SUM(CASE WHEN f.idFatura > 739 THEN 1 ELSE 0 END) AS qtd_gt739,
      SUM(CASE WHEN f.idFatura > 739 THEN f.valorTotal ELSE 0 END) AS val_gt739,
      COALESCE(SUM(CASE WHEN f.idFatura <= 739 THEN os_agg.soma_os ELSE 0 END), 0) AS os_ate739,
      COALESCE(SUM(CASE WHEN f.idFatura > 739 THEN os_agg.soma_os ELSE 0 END), 0) AS os_gt739
    FROM TbFinanceiroFatura f
    LEFT JOIN (
      SELECT idFatura, COUNT(*) AS qtd_os, COALESCE(SUM(valorTotal), 0) AS soma_os
      FROM TbOrdemServico
      WHERE idFatura IS NOT NULL
      GROUP BY idFatura
    ) os_agg ON os_agg.idFatura = f.idFatura
    WHERE YEAR(f.dataInicio) = 2026 AND f.status != 'CANCELADA'
    GROUP BY DATE_FORMAT(f.dataInicio, '%Y-%m')
    ORDER BY mes ASC;
  `);
  console.table(resumo.map((r) => ({
    mes: r.mes,
    qtd: r.qtd_tot,
    dre_hoje: fmt(r.dre_hoje),
    q739: r.qtd_ate739,
    v739: fmt(r.val_ate739),
    os739: fmt(r.os_ate739),
    q_gt739: r.qtd_gt739,
    v_gt739: fmt(r.val_gt739),
    os_gt739: fmt(r.os_gt739),
  })));

  console.log('\n=== 2. RESUMO DOS FANTASMAS idFatura > 739 (0 OS, valorPago=0, 0 lancamentos) ===');
  const [fantasmasResumo] = await conn.query(`
    SELECT
      DATE_FORMAT(f.dataInicio, '%Y-%m') AS mes,
      f.status,
      COUNT(*) AS qtd,
      COALESCE(SUM(f.valorTotal), 0) AS soma_valorTotal
    FROM TbFinanceiroFatura f
    WHERE f.idFatura > 739
      AND NOT EXISTS (SELECT 1 FROM TbOrdemServico os WHERE os.idFatura = f.idFatura)
      AND COALESCE(f.valorPago, 0) = 0
      AND NOT EXISTS (SELECT 1 FROM TbFinanceiroLancamento l WHERE l.idFatura = f.idFatura AND l.status != 'CANCELADO')
    GROUP BY DATE_FORMAT(f.dataInicio, '%Y-%m'), f.status
    ORDER BY mes ASC, f.status ASC;
  `);
  console.table(fantasmasResumo.map((r) => ({
    mes: r.mes,
    status: r.status,
    qtd: r.qtd,
    soma_valorTotal: fmt(r.soma_valorTotal),
  })));

  console.log('\n=== 3. FATURAS idFatura > 739 QUE TEM OS, PAGAMENTO OU LANCAMENTO ===');
  const [gt739ComDados] = await conn.query(`
    SELECT
      f.idFatura,
      f.idEmpresa,
      LEFT(COALESCE(e.nome, ''), 22) AS empresa,
      DATE_FORMAT(f.dataInicio, '%Y-%m-%d') AS di,
      f.status,
      f.valorTotal,
      f.valorPago,
      COALESCE(os_agg.qtd_os, 0) AS qtd_os,
      COALESCE(os_agg.soma_os, 0) AS soma_os,
      (SELECT COUNT(*) FROM TbFinanceiroLancamento l WHERE l.idFatura = f.idFatura AND l.status != 'CANCELADO') AS qtd_lanc
    FROM TbFinanceiroFatura f
    LEFT JOIN TbEmpresa e ON e.idEmpresa = f.idEmpresa
    LEFT JOIN (
      SELECT idFatura, COUNT(*) AS qtd_os, COALESCE(SUM(valorTotal), 0) AS soma_os
      FROM TbOrdemServico
      WHERE idFatura IS NOT NULL
      GROUP BY idFatura
    ) os_agg ON os_agg.idFatura = f.idFatura
    WHERE f.idFatura > 739
      AND (
        COALESCE(os_agg.qtd_os, 0) > 0
        OR COALESCE(f.valorPago, 0) > 0
        OR EXISTS (SELECT 1 FROM TbFinanceiroLancamento l WHERE l.idFatura = f.idFatura AND l.status != 'CANCELADO')
      )
    ORDER BY f.idFatura ASC;
  `);
  console.log(`Total >739 com OS/pagamento/lancamento: ${gt739ComDados.length}`);
  if (gt739ComDados.length > 0) console.table(gt739ComDados);

  console.log('\n=== 4. TODOS OS TRABALHOS ENVIADOS / CONCLUIDOS SEM FATURA OU COM OS PENDENTE ===');
  const [semFatura] = await conn.query(`
    SELECT
      t.idTrabalho,
      t.idEmpresa,
      LEFT(COALESCE(e.nome, ''), 20) AS empresa,
      t.status AS trab_st,
      DATE_FORMAT(t.dataInclusao, '%Y-%m-%d') AS dt_inc,
      DATE_FORMAT(t.dataConclusao, '%Y-%m-%d %H:%i') AS dt_conc,
      DATE_FORMAT(t.dataHoraEnvio, '%Y-%m-%d %H:%i') AS dt_env,
      os.idOrdemServico AS os_id,
      os.status AS os_st,
      os.concluido AS os_conc,
      os.valorTotal AS os_val,
      os.idFatura AS os_fat
    FROM TbTrabalho t
    LEFT JOIN TbEmpresa e ON e.idEmpresa = t.idEmpresa
    LEFT JOIN TbOrdemServico os ON os.idTrabalho = t.idTrabalho
    WHERE t.status IN ('ENVIADO', 'ENVIADO_PROVA')
      AND (os.idOrdemServico IS NULL OR os.idFatura IS NULL OR os.status != 'RECEBER' OR os.concluido = 0)
    ORDER BY t.idTrabalho ASC;
  `);
  console.log(`Total de trabalhos ENVIADO/PROVA sem fatura/OS pendente: ${semFatura.length}`);
  if (semFatura.length > 0) console.table(semFatura);

  console.log('\n=== 5. OUTUBRO E NOVEMBRO/2026: APENAS FATURAS COM DIVERGENCIA (valorTotal != itens ou 0 OS ou id>739) ===');
  const [outNovDiv] = await conn.query(`
    SELECT
      f.idFatura,
      f.idEmpresa,
      LEFT(COALESCE(MAX(e.nome), ''), 20) AS empresa,
      DATE_FORMAT(f.dataInicio, '%Y-%m') AS mes,
      f.status,
      f.valorTotal,
      f.desconto,
      f.descontoDevolucao,
      f.valorPago,
      COUNT(DISTINCT os.idOrdemServico) AS qtd_os,
      COALESCE(SUM(CASE WHEN t.status = 'CANCELADO' OR i.status = 'DEVOLVIDO' THEN 0 ELSE i.valor * GREATEST(0, i.quantidade - COALESCE(i.quantidadeDevolvida, 0)) END), 0) AS soma_cobravel
    FROM TbFinanceiroFatura f
    LEFT JOIN TbEmpresa e ON e.idEmpresa = f.idEmpresa
    LEFT JOIN TbOrdemServico os ON os.idFatura = f.idFatura
    LEFT JOIN TbTrabalho t ON t.idTrabalho = os.idTrabalho
    LEFT JOIN TbOrdemServicoItem i ON i.idOrdemServico = os.idOrdemServico
    WHERE f.dataInicio >= '2026-10-01' AND f.status != 'CANCELADA'
    GROUP BY f.idFatura, f.idEmpresa, DATE_FORMAT(f.dataInicio, '%Y-%m'), f.status, f.valorTotal, f.desconto, f.descontoDevolucao, f.valorPago
    HAVING f.idFatura > 739
      OR (COUNT(DISTINCT os.idOrdemServico) = 0 AND f.valorTotal > 0)
      OR ABS(f.valorTotal - GREATEST(0, COALESCE(SUM(CASE WHEN t.status = 'CANCELADO' OR i.status = 'DEVOLVIDO' THEN 0 ELSE i.valor * GREATEST(0, i.quantidade - COALESCE(i.quantidadeDevolvida, 0)) END), 0) - COALESCE(f.desconto, 0) - COALESCE(f.descontoDevolucao, 0))) > 0.05
    ORDER BY mes ASC, f.idFatura ASC;
  `);
  console.log(`Total divergentes Out/Nov/Dez: ${outNovDiv.length}`);
  if (outNovDiv.length > 0) console.table(outNovDiv);

  await conn.end();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});

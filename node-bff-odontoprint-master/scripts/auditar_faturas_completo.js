const fs = require('fs');
const path = require('path');

let mysql;
try {
  mysql = require('mysql2/promise');
} catch {
  mysql = require('/home/ubuntu/node-bff-odontoprint/node_modules/mysql2/promise');
}

function fmtMoney(v) {
  return Number(v || 0).toFixed(2);
}

function fmtDate(d) {
  if (!d) return 'NULL';
  if (d instanceof Date) return d.toISOString().slice(0, 10);
  return String(d).slice(0, 10);
}

async function auditar() {
  const connection = await mysql.createConnection({
    host: 'db.labodontoprint.com.br',
    user: 'admin',
    password: 'FAZUFpLv5NX5XMRsTTxnbJXj624bvYuH',
    database: 'odontoprint_db',
  });

  const lines = [];
  const log = (...args) => {
    const s = args.map((a) => (typeof a === 'string' ? a : JSON.stringify(a))).join(' ');
    lines.push(s);
    console.log(s);
  };

  log('====================================================================');
  log('AUDITORIA COMPLETA DO FINANCEIRO / FATURAS 2026 (SOMENTE LEITURA)');
  log('====================================================================');
  log('Node TZ env:', String(process.env.TZ || '(nao definido)'));
  log('Node Intl TZ:', Intl.DateTimeFormat().resolvedOptions().timeZone);
  log('Node Offset (min):', String(new Date().getTimezoneOffset()));
  log('Node Now:', new Date().toISOString());

  const [tzRows] = await connection.query(`
    SELECT @@global.time_zone AS global_tz, @@session.time_zone AS session_tz, NOW() AS db_now, UTC_TIMESTAMP() AS db_utc;
  `);
  log('MySQL TZ:', JSON.stringify(tzRows[0]));

  const [maxRows] = await connection.query(`
    SELECT
      (SELECT MAX(idFatura) FROM TbFinanceiroFatura) AS max_fatura,
      (SELECT COUNT(*) FROM TbFinanceiroFatura WHERE idFatura > 739) AS qtd_faturas_gt_739,
      (SELECT MAX(idOrdemServico) FROM TbOrdemServico) AS max_os,
      (SELECT COUNT(*) FROM TbOrdemServico WHERE idOrdemServico > 5804) AS qtd_os_gt_5804,
      (SELECT MAX(idTrabalho) FROM TbTrabalho) AS max_trabalho,
      (SELECT COUNT(*) FROM TbTrabalho WHERE idTrabalho > 5842) AS qtd_trab_gt_5842,
      (SELECT MAX(idLancamento) FROM TbFinanceiroLancamento) AS max_lancamento
  `);
  log('IDs Maximos:', JSON.stringify(maxRows[0]));

  log('\n=== 1. RESUMO MENSAL 2026 (COMO O DRE CALCULA HOJE) ===');
  const [resumoMes] = await connection.query(`
    SELECT
      DATE_FORMAT(f.dataInicio, '%Y-%m') AS mes,
      COUNT(*) AS qtd_total,
      SUM(f.valorTotal) AS total_dre,
      SUM(CASE WHEN f.idFatura <= 739 THEN 1 ELSE 0 END) AS qtd_ate_739,
      SUM(CASE WHEN f.idFatura <= 739 THEN f.valorTotal ELSE 0 END) AS val_ate_739,
      SUM(CASE WHEN f.idFatura > 739 THEN 1 ELSE 0 END) AS qtd_gt_739,
      SUM(CASE WHEN f.idFatura > 739 THEN f.valorTotal ELSE 0 END) AS val_gt_739,
      COALESCE(SUM(os_agg.soma_os), 0) AS soma_os_reais
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
  console.table(resumoMes.map((r) => ({
    mes: r.mes,
    qtd: r.qtd_total,
    total_dre: fmtMoney(r.total_dre),
    qtd_739: r.qtd_ate_739,
    val_739: fmtMoney(r.val_ate_739),
    qtd_gt739: r.qtd_gt_739,
    val_gt739: fmtMoney(r.val_gt_739),
    soma_os_reais: fmtMoney(r.soma_os_reais),
  })));
  lines.push(JSON.stringify(resumoMes, null, 2));

  log('\n=== 2. TODAS AS FATURAS COM idFatura > 739 ===');
  const [faturasGt739] = await connection.query(`
    SELECT
      f.idFatura,
      f.idEmpresa,
      LEFT(COALESCE(e.nome, ''), 24) AS empresa,
      DATE_FORMAT(f.dataInicio, '%Y-%m-%d') AS di,
      DATE_FORMAT(f.dataFim, '%Y-%m-%d') AS df,
      f.status,
      f.valorTotal,
      f.valorPago,
      COALESCE(os_agg.qtd_os, 0) AS qtd_os,
      COALESCE(os_agg.soma_os, 0) AS soma_os,
      DATE_FORMAT(os_agg.min_trab_inc, '%Y-%m-%d') AS min_inc,
      DATE_FORMAT(os_agg.max_trab_inc, '%Y-%m-%d') AS max_inc,
      DATE_FORMAT(os_agg.min_trab_conc, '%Y-%m-%d') AS min_conc,
      DATE_FORMAT(os_agg.max_trab_conc, '%Y-%m-%d') AS max_conc,
      LEFT(COALESCE(f.descricao, ''), 22) AS descr
    FROM TbFinanceiroFatura f
    LEFT JOIN TbEmpresa e ON e.idEmpresa = f.idEmpresa
    LEFT JOIN (
      SELECT
        os.idFatura,
        COUNT(*) AS qtd_os,
        SUM(os.valorTotal) AS soma_os,
        MIN(t.dataInclusao) AS min_trab_inc,
        MAX(t.dataInclusao) AS max_trab_inc,
        MIN(COALESCE(t.dataConclusao, t.dataHoraEnvio, os.dataConcluido)) AS min_trab_conc,
        MAX(COALESCE(t.dataConclusao, t.dataHoraEnvio, os.dataConcluido)) AS max_trab_conc
      FROM TbOrdemServico os
      LEFT JOIN TbTrabalho t ON t.idTrabalho = os.idTrabalho
      WHERE os.idFatura IS NOT NULL
      GROUP BY os.idFatura
    ) os_agg ON os_agg.idFatura = f.idFatura
    WHERE f.idFatura > 739
    ORDER BY f.idFatura ASC;
  `);
  log(`Total de faturas idFatura > 739: ${faturasGt739.length}`);
  if (faturasGt739.length > 0) {
    console.table(faturasGt739.slice(0, 120).map((r) => ({
      id: r.idFatura,
      emp: r.idEmpresa,
      nome: r.empresa,
      comp: r.di.slice(0, 7),
      st: r.status,
      val: fmtMoney(r.valorTotal),
      pago: fmtMoney(r.valorPago),
      os: r.qtd_os,
      soma_os: fmtMoney(r.soma_os),
      conc: `${fmtDate(r.min_conc)}..${fmtDate(r.max_conc)}`,
      desc: r.descr,
    })));
    if (faturasGt739.length > 120) {
      log(`... (+ ${faturasGt739.length - 120} faturas gravadas no arquivo completo)`);
    }
    lines.push(JSON.stringify(faturasGt739, null, 2));
  }

  log('\n=== 3. FATURAS 2026 DUPLICADAS (MESMA EMPRESA + MESMA COMPETENCIA, != CANCELADA) ===');
  const [dups] = await connection.query(`
    SELECT
      f.idEmpresa,
      LEFT(COALESCE(MAX(e.nome), ''), 26) AS empresa,
      DATE_FORMAT(f.dataInicio, '%Y-%m') AS mes,
      COUNT(*) AS qtd,
      GROUP_CONCAT(CONCAT('#', f.idFatura, '(', f.status, ',R$', ROUND(f.valorTotal,2), ')') ORDER BY f.idFatura SEPARATOR ' | ') AS faturas,
      SUM(f.valorTotal) AS soma_valores
    FROM TbFinanceiroFatura f
    LEFT JOIN TbEmpresa e ON e.idEmpresa = f.idEmpresa
    WHERE YEAR(f.dataInicio) = 2026 AND f.status != 'CANCELADA'
    GROUP BY f.idEmpresa, DATE_FORMAT(f.dataInicio, '%Y-%m')
    HAVING COUNT(*) > 1
    ORDER BY mes ASC, f.idEmpresa ASC;
  `);
  log(`Grupos duplicados em 2026: ${dups.length}`);
  if (dups.length > 0) {
    console.table(dups);
    lines.push(JSON.stringify(dups, null, 2));
  }

  log('\n=== 4. FATURAS 2026 COM VALOR DIVERGENTE OU FANTASMA (0 OS e valorTotal > 0) ===');
  const [diverg] = await connection.query(`
    SELECT
      f.idFatura,
      f.idEmpresa,
      LEFT(COALESCE(e.nome, ''), 22) AS empresa,
      DATE_FORMAT(f.dataInicio, '%Y-%m') AS mes,
      f.status,
      f.valorTotal,
      f.valorTotalBruto,
      f.desconto,
      f.descontoDevolucao,
      COALESCE(os_agg.qtd_os, 0) AS qtd_os,
      COALESCE(os_agg.soma_os, 0) AS soma_os,
      COALESCE(item_agg.soma_itens, 0) AS soma_itens_cobraveis
    FROM TbFinanceiroFatura f
    LEFT JOIN TbEmpresa e ON e.idEmpresa = f.idEmpresa
    LEFT JOIN (
      SELECT idFatura, COUNT(*) AS qtd_os, COALESCE(SUM(valorTotal), 0) AS soma_os
      FROM TbOrdemServico
      WHERE idFatura IS NOT NULL
      GROUP BY idFatura
    ) os_agg ON os_agg.idFatura = f.idFatura
    LEFT JOIN (
      SELECT
        os.idFatura,
        COALESCE(SUM(
          CASE
            WHEN t.status = 'CANCELADO' OR i.status = 'DEVOLVIDO' THEN 0
            ELSE i.valor * GREATEST(0, i.quantidade - COALESCE(i.quantidadeDevolvida, 0))
          END
        ), 0) AS soma_itens
      FROM TbOrdemServico os
      INNER JOIN TbOrdemServicoItem i ON i.idOrdemServico = os.idOrdemServico
      INNER JOIN TbTrabalho t ON t.idTrabalho = os.idTrabalho
      WHERE os.idFatura IS NOT NULL
      GROUP BY os.idFatura
    ) item_agg ON item_agg.idFatura = f.idFatura
    WHERE YEAR(f.dataInicio) = 2026
      AND f.status != 'CANCELADA'
      AND (
        (COALESCE(os_agg.qtd_os, 0) = 0 AND f.valorTotal > 0)
        OR ABS(f.valorTotal - GREATEST(0, COALESCE(item_agg.soma_itens, 0) - COALESCE(f.desconto, 0) - COALESCE(f.descontoDevolucao, 0))) > 0.05
      )
    ORDER BY mes ASC, f.idFatura ASC;
  `);
  log(`Faturas com valor divergente ou 0 OSs: ${diverg.length}`);
  if (diverg.length > 0) {
    console.table(diverg.slice(0, 120));
    lines.push(JSON.stringify(diverg, null, 2));
  }

  log('\n=== 5. TRABALHOS ENVIADOS SEM FATURA OU RECENTES (> 5842) / SHIFT UTC 00h-03h ===');
  const [semFatura] = await connection.query(`
    SELECT
      t.idTrabalho, t.idEmpresa, t.status,
      DATE_FORMAT(t.dataInclusao, '%Y-%m-%d %H:%i') AS dt_inc,
      DATE_FORMAT(t.dataConclusao, '%Y-%m-%d %H:%i') AS dt_conc,
      DATE_FORMAT(t.dataHoraEnvio, '%Y-%m-%d %H:%i') AS dt_env,
      os.idOrdemServico, os.idFatura, os.status AS os_status, os.valorTotal
    FROM TbTrabalho t
    LEFT JOIN TbOrdemServico os ON os.idTrabalho = t.idTrabalho
    WHERE t.status IN ('ENVIADO', 'ENVIADO_PROVA')
      AND (os.idFatura IS NULL OR t.idTrabalho > 5842)
    ORDER BY t.idTrabalho DESC
    LIMIT 100;
  `);
  log(`Trabalhos ENVIADO/PROVA sem fatura ou recentes (>5842): ${semFatura.length}`);
  if (semFatura.length > 0) {
    console.table(semFatura.slice(0, 60));
    lines.push(JSON.stringify(semFatura, null, 2));
  }

  const [utcShift] = await connection.query(`
    SELECT
      f.idFatura, f.idEmpresa, DATE_FORMAT(f.dataInicio, '%Y-%m') AS fat_mes,
      t.idTrabalho, t.status,
      DATE_FORMAT(t.dataConclusao, '%Y-%m-%d %H:%i:%s') AS dt_conc_utc,
      DATE_FORMAT(t.dataHoraEnvio, '%Y-%m-%d %H:%i:%s') AS dt_env_utc,
      os.idOrdemServico, os.valorTotal
    FROM TbTrabalho t
    INNER JOIN TbOrdemServico os ON os.idTrabalho = t.idTrabalho
    INNER JOIN TbFinanceiroFatura f ON f.idFatura = os.idFatura
    WHERE YEAR(f.dataInicio) = 2026
      AND DAY(COALESCE(t.dataConclusao, t.dataHoraEnvio)) = 1
      AND TIME(COALESCE(t.dataConclusao, t.dataHoraEnvio)) BETWEEN '00:00:00' AND '02:59:59'
    ORDER BY t.idTrabalho ASC;
  `);
  log(`Trabalhos faturados concluidos dia 01 entre 00:00-02:59 UTC (21:00-23:59 BRT do mes anterior): ${utcShift.length}`);
  if (utcShift.length > 0) {
    console.table(utcShift);
    lines.push(JSON.stringify(utcShift, null, 2));
  }

  log('\n=== 6. TODAS AS FATURAS DE OUT/NOV/DEZ 2026 (ATIVAS) ===');
  const [faturasOutNovDez] = await connection.query(`
    SELECT
      f.idFatura, f.idEmpresa,
      LEFT(COALESCE(e.nome, ''), 24) AS empresa,
      DATE_FORMAT(f.dataInicio, '%Y-%m-%d') AS di,
      DATE_FORMAT(f.dataFim, '%Y-%m-%d') AS df,
      f.status, f.valorTotal, f.valorPago,
      COALESCE(os_agg.qtd_os, 0) AS qtd_os,
      COALESCE(os_agg.soma_os, 0) AS soma_os,
      DATE_FORMAT(os_agg.min_conc, '%Y-%m-%d') AS min_conc,
      DATE_FORMAT(os_agg.max_conc, '%Y-%m-%d') AS max_conc,
      LEFT(COALESCE(f.descricao, ''), 20) AS descr
    FROM TbFinanceiroFatura f
    LEFT JOIN TbEmpresa e ON e.idEmpresa = f.idEmpresa
    LEFT JOIN (
      SELECT
        os.idFatura,
        COUNT(*) AS qtd_os,
        SUM(os.valorTotal) AS soma_os,
        MIN(COALESCE(t.dataConclusao, t.dataHoraEnvio, os.dataConcluido)) AS min_conc,
        MAX(COALESCE(t.dataConclusao, t.dataHoraEnvio, os.dataConcluido)) AS max_conc
      FROM TbOrdemServico os
      LEFT JOIN TbTrabalho t ON t.idTrabalho = os.idTrabalho
      WHERE os.idFatura IS NOT NULL
      GROUP BY os.idFatura
    ) os_agg ON os_agg.idFatura = f.idFatura
    WHERE f.dataInicio >= '2026-10-01' AND f.status != 'CANCELADA'
    ORDER BY f.dataInicio ASC, f.idEmpresa ASC, f.idFatura ASC;
  `);
  log(`Total Out/Nov/Dez 2026: ${faturasOutNovDez.length}`);
  if (faturasOutNovDez.length > 0) {
    console.table(faturasOutNovDez);
    lines.push(JSON.stringify(faturasOutNovDez, null, 2));
  }

  log('\n=== 7. LANCAMENTOS LIGADOS A FATURAS DIVERGENTES OU CANCELADAS ===');
  const [lancDiv] = await connection.query(`
    SELECT
      l.idLancamento, l.idFatura, l.status AS lanc_status,
      DATE_FORMAT(l.dataCompetencia, '%Y-%m-%d') AS lanc_comp,
      l.valorTotal AS lanc_val,
      f.status AS fat_status,
      DATE_FORMAT(f.dataInicio, '%Y-%m-%d') AS fat_di,
      f.valorTotal AS fat_val
    FROM TbFinanceiroLancamento l
    LEFT JOIN TbFinanceiroFatura f ON f.idFatura = l.idFatura
    WHERE l.idFatura IS NOT NULL
      AND l.status != 'CANCELADO'
      AND (
        f.idFatura IS NULL
        OR f.status = 'CANCELADA'
        OR DATE_FORMAT(l.dataCompetencia, '%Y-%m') != DATE_FORMAT(f.dataInicio, '%Y-%m')
      )
    ORDER BY l.idLancamento ASC;
  `);
  log(`Lancamentos de faturas divergentes/canceladas: ${lancDiv.length}`);
  if (lancDiv.length > 0) {
    console.table(lancDiv.slice(0, 60));
    lines.push(JSON.stringify(lancDiv, null, 2));
  }

  log('\n=== 8. FATURAS 2026 COM TRABALHOS CUJA CONCLUSAO/ENVIO DIVERGE DO MES DA FATURA ===');
  const [trabMesDiff] = await connection.query(`
    SELECT
      f.idFatura,
      f.idEmpresa,
      LEFT(COALESCE(MAX(e.nome), ''), 22) AS empresa,
      DATE_FORMAT(f.dataInicio, '%Y-%m') AS fat_mes,
      f.status,
      f.valorTotal,
      COUNT(os.idOrdemServico) AS qtd_os_diff,
      COALESCE(SUM(os.valorTotal), 0) AS valor_os_diff,
      GROUP_CONCAT(DISTINCT DATE_FORMAT(COALESCE(t.dataConclusao, t.dataHoraEnvio), '%Y-%m') ORDER BY COALESCE(t.dataConclusao, t.dataHoraEnvio) SEPARATOR ', ') AS meses_trabalhos,
      GROUP_CONCAT(DISTINCT DATE_FORMAT(t.dataInclusao, '%Y-%m') ORDER BY t.dataInclusao SEPARATOR ', ') AS meses_inclusao
    FROM TbFinanceiroFatura f
    INNER JOIN TbOrdemServico os ON os.idFatura = f.idFatura
    INNER JOIN TbTrabalho t ON t.idTrabalho = os.idTrabalho
    LEFT JOIN TbEmpresa e ON e.idEmpresa = f.idEmpresa
    WHERE YEAR(f.dataInicio) = 2026
      AND f.status != 'CANCELADA'
      AND COALESCE(t.dataConclusao, t.dataHoraEnvio) IS NOT NULL
      AND DATE_FORMAT(COALESCE(t.dataConclusao, t.dataHoraEnvio), '%Y-%m') != DATE_FORMAT(f.dataInicio, '%Y-%m')
    GROUP BY f.idFatura, f.idEmpresa, DATE_FORMAT(f.dataInicio, '%Y-%m'), f.status, f.valorTotal
    ORDER BY fat_mes ASC, f.idFatura ASC;
  `);
  log(`Faturas 2026 com trabalhos concluidos em mes diferente: ${trabMesDiff.length}`);
  if (trabMesDiff.length > 0) {
    console.table(trabMesDiff.slice(0, 100));
    lines.push(JSON.stringify(trabMesDiff, null, 2));
  }

  const outPath = '/tmp/auditoria_faturas_2026.txt';
  try {
    fs.writeFileSync(outPath, lines.join('\n'), 'utf8');
    log(`\nRelatorio completo salvo em: ${outPath}`);
  } catch (e) {
    const localOut = path.join(process.cwd(), 'auditoria_faturas_2026.txt');
    fs.writeFileSync(localOut, lines.join('\n'), 'utf8');
    log(`\nRelatorio completo salvo em: ${localOut}`);
  }

  await connection.end();
}

auditar().catch((err) => {
  console.error('Erro na auditoria:', err);
  process.exit(1);
});

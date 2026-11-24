'use strict';

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const LOG_LINES = [];
function log(msg = '') {
  const s = typeof msg === 'string' ? msg : JSON.stringify(msg, null, 2);
  LOG_LINES.push(s);
  console.log(s);
}

function logTable(rows) {
  if (!rows || rows.length === 0) return;
  console.table(rows);
  const cols = Object.keys(rows[0]);
  const widths = cols.map((c) =>
    Math.max(c.length, ...rows.map((r) => String(r[c] ?? '').length)),
  );
  const sep = widths.map((w) => '-'.repeat(w)).join(' | ');
  LOG_LINES.push(cols.map((c, i) => c.padEnd(widths[i])).join(' | '));
  LOG_LINES.push(sep);
  for (const r of rows) {
    LOG_LINES.push(cols.map((c, i) => String(r[c] ?? '').padEnd(widths[i])).join(' | '));
  }
}

function fmtMoney(v) {
  return Number(v || 0).toFixed(2);
}

function pad2(n) {
  return String(n).padStart(2, '0');
}

/**
 * Formata data sem deslocar colunas DATE (00:00:00 UTC) nem errar timestamps após 21h BRT.
 */
function formatDataBRTYMD(d) {
  if (!d) return '';
  if (typeof d === 'string') {
    const s = d.trim();
    const mDate = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (mDate) return `${mDate[1]}-${mDate[2]}-${mDate[3]}`;
    const mMidnight = s.match(/^(\d{4})-(\d{2})-(\d{2})[ T]00:00:00/);
    if (mMidnight) return `${mMidnight[1]}-${mMidnight[2]}-${mMidnight[3]}`;
  }
  const dt = d instanceof Date ? d : new Date(d);
  if (isNaN(dt.getTime())) return '';
  if (
    dt.getUTCHours() === 0 &&
    dt.getUTCMinutes() === 0 &&
    dt.getUTCSeconds() === 0 &&
    dt.getUTCMilliseconds() === 0
  ) {
    return `${dt.getUTCFullYear()}-${pad2(dt.getUTCMonth() + 1)}-${pad2(dt.getUTCDate())}`;
  }
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(dt);
  const y = parts.find((p) => p.type === 'year')?.value;
  const m = parts.find((p) => p.type === 'month')?.value;
  const day = parts.find((p) => p.type === 'day')?.value;
  return y && m && day ? `${y}-${m}-${day}` : dt.toISOString().slice(0, 10);
}

function resolveBffRoot() {
  const ec2DeployDir = '/home/ubuntu/node-bff-odontoprint';
  if (fs.existsSync(path.join(ec2DeployDir, 'dist/src/app.module.js'))) {
    return ec2DeployDir;
  }
  return path.resolve(__dirname, '..');
}

function requireFromBff(bffRoot, pkg) {
  const resolved = require.resolve(pkg, {
    paths: [bffRoot, path.join(bffRoot, 'node_modules'), __dirname],
  });
  return require(resolved);
}

function parseDotEnvFile(envPath) {
  if (!fs.existsSync(envPath)) return {};
  const out = {};
  const content = fs.readFileSync(envPath, 'utf8');
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let val = line.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    out[key] = val;
  }
  return out;
}

function loadDbConfig(bffRoot) {
  const repoEnv = parseDotEnvFile(path.resolve(__dirname, '../.env'));
  const localEnv = parseDotEnvFile(path.join(bffRoot, '.env'));
  const distEnv = parseDotEnvFile(path.join(bffRoot, 'dist/src/.env'));
  const deployEnv = parseDotEnvFile('/home/ubuntu/node-bff-odontoprint/.env');
  const merged = { ...repoEnv, ...localEnv, ...distEnv, ...deployEnv };

  for (const [k, v] of Object.entries(merged)) {
    if (!process.env[k] || process.env[k] === 'localhost') {
      process.env[k] = v;
    }
  }

  const host =
    process.env.DATABASE_HOST && process.env.DATABASE_HOST !== 'localhost'
      ? process.env.DATABASE_HOST
      : 'db.labodontoprint.com.br';
  const port = parseInt(process.env.DATABASE_PORT || '3306', 10);
  const user =
    process.env.DATABASE_USERNAME && process.env.DATABASE_USERNAME !== 'odontoprint'
      ? process.env.DATABASE_USERNAME
      : merged.DATABASE_USERNAME || 'admin';
  const password =
    process.env.DATABASE_PASSWORD && process.env.DATABASE_PASSWORD !== '123456'
      ? process.env.DATABASE_PASSWORD
      : merged.DATABASE_PASSWORD || 'FAZUFpLv5NX5XMRsTTxnbJXj624bvYuH';
  const database = process.env.DATABASE_NAME || merged.DATABASE_NAME || 'odontoprint_db';

  process.env.DATABASE_HOST = host;
  process.env.DATABASE_PORT = String(port);
  process.env.DATABASE_USERNAME = user;
  process.env.DATABASE_PASSWORD = password;
  process.env.DATABASE_NAME = database;

  if (!process.env.CHAVE_SECRETA) {
    process.env.CHAVE_SECRETA = 'cli-manutencao-secret';
  }
  if (!process.env.CHAVE_SECRETA_JWT) {
    process.env.CHAVE_SECRETA_JWT = 'cli-manutencao-jwt-secret';
  }

  return { host, port, user, password, database };
}

function createBackupDump(dbConfig) {
  const now = new Date();
  const stamp = [
    now.getFullYear(),
    pad2(now.getMonth() + 1),
    pad2(now.getDate()),
    '_',
    pad2(now.getHours()),
    pad2(now.getMinutes()),
    pad2(now.getSeconds()),
  ].join('');

  const backupDirs = ['/home/ubuntu/backups', '/tmp', process.cwd()];
  let targetDir = '/tmp';
  for (const d of backupDirs) {
    try {
      fs.mkdirSync(d, { recursive: true });
      fs.accessSync(d, fs.constants.W_OK);
      targetDir = d;
      break;
    } catch (_) {
      // fallback
    }
  }

  const backupPath = path.join(targetDir, `backup_pre_correcao_${stamp}.sql`);
  const tables = [
    'TbFinanceiroFatura',
    'TbOrdemServico',
    'TbOrdemServicoItem',
    'TbTrabalho',
    'TbFinanceiroLancamento',
    'TbFinanceiroParcela',
    'TbFinanceiroMovimentacao',
    'TbDevolucaoComponente',
    'TbFaturaDevolucaoItem',
  ];

  log(`Executando mysqldump de segurança para: ${backupPath}`);
  const sqlDump = execFileSync(
    'mysqldump',
    [
      '-h',
      dbConfig.host,
      '-P',
      String(dbConfig.port),
      '-u',
      dbConfig.user,
      '--single-transaction',
      '--quick',
      '--routines',
      '--triggers',
      '--set-gtid-purged=OFF',
      dbConfig.database,
      ...tables,
    ],
    {
      env: { ...process.env, MYSQL_PWD: dbConfig.password },
      maxBuffer: 200 * 1024 * 1024,
    },
  );

  fs.writeFileSync(backupPath, sqlDump);
  const stat = fs.statSync(backupPath);
  if (!stat.size || stat.size < 10000) {
    throw new Error(`Backup gerado suspeito (tamanho ${stat.size} bytes). Abortando.`);
  }
  log(`Backup concluído com sucesso (${(stat.size / (1024 * 1024)).toFixed(2)} MB): ${backupPath}`);
  return backupPath;
}

async function safeDeleteEmptyFaturas(conn, candidateIds) {
  if (!candidateIds || candidateIds.length === 0) return 0;
  const [verified] = await conn.query(
    `SELECT f.idFatura
     FROM TbFinanceiroFatura f
     WHERE f.idFatura IN (?)
       AND NOT EXISTS (SELECT 1 FROM TbOrdemServico os WHERE os.idFatura = f.idFatura)
       AND COALESCE(f.valorPago, 0) = 0
       AND NOT EXISTS (
         SELECT 1 FROM TbFinanceiroLancamento l
         WHERE l.idFatura = f.idFatura AND l.status != 'CANCELADO'
       )
       AND NOT EXISTS (SELECT 1 FROM TbDevolucaoComponente d WHERE d.idFatura = f.idFatura)
       AND NOT EXISTS (SELECT 1 FROM TbFaturaDevolucaoItem di WHERE di.idFatura = f.idFatura)`,
    [candidateIds],
  );
  const safeIds = verified.map((r) => r.idFatura);
  if (safeIds.length === 0) return 0;

  await conn.beginTransaction();
  try {
    await conn.query(
      `UPDATE TbFinanceiroLancamento SET idFatura = NULL WHERE idFatura IN (?) AND status = 'CANCELADO'`,
      [safeIds],
    );
    await conn.query(
      `UPDATE TbFinanceiroFatura SET idFaturaOriginal = NULL WHERE idFaturaOriginal IN (?)`,
      [safeIds],
    );
    const [delRes] = await conn.query(`DELETE FROM TbFinanceiroFatura WHERE idFatura IN (?)`, [safeIds]);
    await conn.commit();
    return delRes.affectedRows;
  } catch (err) {
    await conn.rollback();
    throw err;
  }
}

async function fetchMonthlyDreSnapshot(conn) {
  const [rows] = await conn.query(`
    SELECT
      DATE_FORMAT(f.dataInicio, '%Y-%m') AS mes,
      COUNT(*) AS qtd,
      COALESCE(SUM(f.valorTotal), 0) AS dre_total,
      SUM(CASE WHEN f.status = 'PAGA' THEN f.valorTotal ELSE 0 END) AS total_paga,
      SUM(CASE WHEN f.status = 'FECHADA' THEN f.valorTotal ELSE 0 END) AS total_fechada,
      SUM(CASE WHEN f.status IN ('ABERTA', 'AGUARDANDO_DEVOLUCAO', 'PAGA_PARCIALMENTE') THEN f.valorTotal ELSE 0 END) AS total_aberta
    FROM TbFinanceiroFatura f
    WHERE YEAR(f.dataInicio) = 2026 AND f.status != 'CANCELADA'
    GROUP BY DATE_FORMAT(f.dataInicio, '%Y-%m')
    ORDER BY mes ASC;
  `);
  return rows.map((r) => ({
    mes: r.mes,
    qtd: Number(r.qtd),
    dre_total: Number(r.dre_total || 0),
    total_paga: Number(r.total_paga || 0),
    total_fechada: Number(r.total_fechada || 0),
    total_aberta: Number(r.total_aberta || 0),
  }));
}

async function findEtapa1Ghosts(conn) {
  const [rows] = await conn.query(`
    SELECT
      f.idFatura,
      f.idEmpresa,
      DATE_FORMAT(f.dataInicio, '%Y-%m-%d') AS di,
      DATE_FORMAT(f.dataInicio, '%Y-%m') AS mes,
      f.status,
      f.valorTotal,
      f.valorPago
    FROM TbFinanceiroFatura f
    WHERE f.idFatura > 739
      AND NOT EXISTS (SELECT 1 FROM TbOrdemServico os WHERE os.idFatura = f.idFatura)
      AND COALESCE(f.valorPago, 0) = 0
      AND NOT EXISTS (
        SELECT 1 FROM TbFinanceiroLancamento l
        WHERE l.idFatura = f.idFatura AND l.status != 'CANCELADO'
      )
      AND NOT EXISTS (SELECT 1 FROM TbDevolucaoComponente d WHERE d.idFatura = f.idFatura)
      AND NOT EXISTS (SELECT 1 FROM TbFaturaDevolucaoItem di WHERE di.idFatura = f.idFatura)
      AND (
        YEAR(f.dataInicio) <= 2025
        OR (YEAR(f.dataInicio) = 2026 AND MONTH(f.dataInicio) <= 10)
        OR YEAR(f.dataInicio) >= 2027
        OR (YEAR(f.dataInicio) = 2026 AND MONTH(f.dataInicio) = 12 AND COALESCE(f.valorTotal, 0) = 0)
      )
    ORDER BY f.dataInicio ASC, f.idFatura ASC;
  `);
  return rows;
}

async function inspectOutubroNovembroPlan(conn) {
  const [novFaturas] = await conn.query(`
    SELECT
      f.idFatura,
      f.idEmpresa,
      LEFT(COALESCE(e.nome, ''), 26) AS empresa,
      DATE_FORMAT(f.dataInicio, '%Y-%m-%d') AS di,
      DATE_FORMAT(f.dataFim, '%Y-%m-%d') AS df,
      DATE_FORMAT(f.dataVencimento, '%Y-%m-%d') AS dv,
      f.status,
      f.valorTotalBruto,
      f.desconto,
      f.descontoDevolucao,
      f.valorTotal,
      f.valorPago,
      f.descricao
    FROM TbFinanceiroFatura f
    LEFT JOIN TbEmpresa e ON e.idEmpresa = f.idEmpresa
    WHERE DATE_FORMAT(f.dataInicio, '%Y-%m') = '2026-11'
      AND f.status != 'CANCELADA'
    ORDER BY f.idEmpresa ASC, f.idFatura ASC;
  `);

  const [novOsRows] = await conn.query(`
    SELECT
      os.idOrdemServico,
      os.idFatura,
      os.idEmpresa,
      os.idTrabalho,
      os.valorTotal AS os_valor,
      os.dataConcluido AS os_dt_conc,
      t.status AS trab_st,
      t.dataConclusao AS trab_dt_conc,
      t.dataHoraEnvio AS trab_dt_env
    FROM TbOrdemServico os
    INNER JOIN TbFinanceiroFatura f ON f.idFatura = os.idFatura
    LEFT JOIN TbTrabalho t ON t.idTrabalho = os.idTrabalho
    WHERE DATE_FORMAT(f.dataInicio, '%Y-%m') = '2026-11'
      AND f.status != 'CANCELADA'
    ORDER BY os.idFatura ASC, os.idOrdemServico ASC;
  `);

  const [octAllFaturas] = await conn.query(`
    SELECT
      f.idFatura,
      f.idEmpresa,
      f.status,
      DATE_FORMAT(f.dataInicio, '%Y-%m-%d') AS di,
      f.valorTotal
    FROM TbFinanceiroFatura f
    WHERE DATE_FORMAT(f.dataInicio, '%Y-%m') = '2026-10'
      AND f.status != 'CANCELADA'
    ORDER BY f.idEmpresa ASC, f.idFatura ASC;
  `);

  const octByEmp = new Map();
  for (const row of octAllFaturas) {
    if (!octByEmp.has(row.idEmpresa)) octByEmp.set(row.idEmpresa, []);
    octByEmp.get(row.idEmpresa).push(row);
  }

  const osByFat = new Map();
  for (const os of novOsRows) {
    const dtRef = os.trab_dt_conc || os.trab_dt_env || os.os_dt_conc;
    const ymd = formatDataBRTYMD(dtRef);
    const mesOs = ymd ? ymd.slice(0, 7) : null;
    if (!osByFat.has(os.idFatura)) osByFat.set(os.idFatura, []);
    osByFat.get(os.idFatura).push({ ...os, ymd, mesOs });
  }

  const pureOctInNov = [];
  const mixedOctInNov = [];
  const mixedReadOnlyOctInNov = [];

  for (const fat of novFaturas) {
    const list = osByFat.get(fat.idFatura) || [];
    if (list.length === 0) continue;
    const octOs = list.filter((x) => x.mesOs === '2026-10');
    const nonOctOs = list.filter((x) => x.mesOs !== '2026-10');
    if (octOs.length > 0 && nonOctOs.length === 0) {
      pureOctInNov.push({
        fatura: fat,
        osList: list,
        existingOct: octByEmp.get(fat.idEmpresa) || [],
      });
    } else if (octOs.length > 0 && nonOctOs.length > 0) {
      const target = {
        fatura: fat,
        octOs,
        otherOs: nonOctOs,
        existingOct: octByEmp.get(fat.idEmpresa) || [],
      };
      if (fat.status === 'ABERTA' || fat.status === 'PAGA_PARCIALMENTE') {
        mixedOctInNov.push(target);
      } else {
        mixedReadOnlyOctInNov.push(target);
      }
    }
  }

  for (const entry of pureOctInNov) {
    const idFat = entry.fatura.idFatura;
    const [lancs] = await conn.query(
      `SELECT idLancamento, status, DATE_FORMAT(dataCompetencia, '%Y-%m-%d') AS comp, valorTotal
       FROM TbFinanceiroLancamento WHERE idFatura = ? AND status != 'CANCELADO'`,
      [idFat],
    );
    const [parc] = await conn.query(
      `SELECT p.idParcela, p.status, DATE_FORMAT(p.dataVencimento, '%Y-%m-%d') AS venc, p.valor, p.valorPago
       FROM TbFinanceiroParcela p
       INNER JOIN TbFinanceiroLancamento l ON l.idLancamento = p.idLancamento
       WHERE l.idFatura = ? AND l.status != 'CANCELADO'`,
      [idFat],
    );
    entry.lancamentos = lancs;
    entry.parcelas = parc;
  }

  return { pureOctInNov, mixedOctInNov, mixedReadOnlyOctInNov };
}

async function inspectOutubroSpecialCases(conn) {
  const divergentIds = [644, 652, 699];
  const [divHeaders] = await conn.query(
    `SELECT f.idFatura, f.idEmpresa, LEFT(COALESCE(e.nome, ''), 26) AS empresa,
            DATE_FORMAT(f.dataInicio, '%Y-%m-%d') AS di, f.status,
            f.valorTotalBruto, f.desconto, f.descontoDevolucao, f.valorTotal, f.valorPago
     FROM TbFinanceiroFatura f
     LEFT JOIN TbEmpresa e ON e.idEmpresa = f.idEmpresa
     WHERE f.idFatura IN (?)
     ORDER BY f.idFatura ASC`,
    [divergentIds],
  );

  const [divItems] = await conn.query(
    `SELECT
       os.idFatura,
       os.idOrdemServico,
       os.idTrabalho,
       os.status AS os_status,
       os.valorTotal AS os_valorTotal,
       t.status AS trab_status,
       t.retrabalho,
       t.bonificacao,
       DATE_FORMAT(t.dataInclusao, '%Y-%m-%d') AS dt_inc,
       DATE_FORMAT(COALESCE(t.dataConclusao, t.dataHoraEnvio), '%Y-%m-%d') AS dt_conc,
       i.idOrdemServicoItem,
       i.tipoCobranca,
       i.descricao,
       i.status AS item_status,
       i.valor,
       i.quantidade,
       i.quantidadeDevolvida,
       i.valorTotal AS item_valorTotal
     FROM TbOrdemServico os
     LEFT JOIN TbTrabalho t ON t.idTrabalho = os.idTrabalho
     LEFT JOIN TbOrdemServicoItem i ON i.idOrdemServico = os.idOrdemServico
     WHERE os.idFatura IN (?)
     ORDER BY os.idFatura ASC, os.idOrdemServico ASC, i.idOrdemServicoItem ASC`,
    [divergentIds],
  );

  const [revRows] = await conn.query(
    `SELECT
       f.idFatura,
       f.idEmpresa,
       LEFT(COALESCE(e.nome, ''), 26) AS empresa,
       DATE_FORMAT(f.dataInicio, '%Y-%m-%d') AS di,
       f.status,
       f.valorTotal,
       f.valorPago,
       (SELECT COUNT(*) FROM TbOrdemServico os WHERE os.idFatura = f.idFatura) AS qtd_os,
       l.idLancamento,
       l.status AS lanc_status,
       DATE_FORMAT(l.dataCompetencia, '%Y-%m-%d') AS lanc_comp,
       l.valorTotal AS lanc_val,
       (SELECT COUNT(*) FROM TbFinanceiroParcela p WHERE p.idLancamento = l.idLancamento) AS qtd_parc,
       (SELECT COALESCE(SUM(p.valorPago), 0) FROM TbFinanceiroParcela p WHERE p.idLancamento = l.idLancamento) AS soma_parc_paga
     FROM TbFinanceiroFatura f
     LEFT JOIN TbEmpresa e ON e.idEmpresa = f.idEmpresa
     INNER JOIN TbFinanceiroLancamento l ON l.idFatura = f.idFatura AND l.status != 'CANCELADO'
     WHERE f.status = 'ABERTA'
       AND f.dataInicio >= '2026-10-01'
     ORDER BY f.idFatura ASC`,
  );

  return { divHeaders, divItems, revRows };
}

async function findTrabalhosParaRecuperar(conn) {
  const [rows] = await conn.query(`
    SELECT
      t.idTrabalho,
      t.idEmpresa,
      LEFT(COALESCE(e.nome, ''), 24) AS empresa,
      t.status AS trab_st,
      t.retrabalho,
      t.bonificacao,
      t.ativo AS trab_ativo,
      DATE_FORMAT(t.dataInclusao, '%Y-%m-%d') AS dt_inc,
      t.dataConclusao,
      t.dataHoraEnvio,
      os.idOrdemServico,
      os.status AS os_st,
      os.concluido AS os_conc,
      os.valorTotal AS os_val,
      os.idFatura AS os_fat,
      os.dataConcluido AS os_dt_conc,
      COALESCE(SUM(CASE WHEN i.status = 'DEVOLVIDO' THEN 0 ELSE i.valor * GREATEST(0, i.quantidade - COALESCE(i.quantidadeDevolvida, 0)) END), 0) AS soma_itens_atuais
    FROM TbTrabalho t
    LEFT JOIN TbEmpresa e ON e.idEmpresa = t.idEmpresa
    LEFT JOIN TbOrdemServico os ON os.idTrabalho = t.idTrabalho
    LEFT JOIN TbOrdemServicoItem i ON i.idOrdemServico = os.idOrdemServico
    WHERE t.ativo = 1
      AND t.status IN ('ENVIADO', 'ENVIADO_PROVA')
      AND COALESCE(t.dataConclusao, t.dataHoraEnvio, os.dataConcluido) >= '2026-10-01'
      AND (os.idOrdemServico IS NULL OR os.idFatura IS NULL OR os.status != 'RECEBER' OR os.concluido = 0)
    GROUP BY
      t.idTrabalho, t.idEmpresa, e.nome, t.status, t.retrabalho, t.bonificacao, t.ativo,
      t.dataInclusao, t.dataConclusao, t.dataHoraEnvio, os.idOrdemServico, os.status,
      os.concluido, os.valorTotal, os.idFatura, os.dataConcluido
    ORDER BY t.idTrabalho ASC;
  `);
  return rows.map((r) => {
    const dtRef = r.dataConclusao || r.dataHoraEnvio || r.os_dt_conc;
    const ymd = formatDataBRTYMD(dtRef);
    return {
      ...r,
      ymd_conc: ymd,
      mes_conc: ymd ? ymd.slice(0, 7) : null,
      estimativa_cobranca:
        r.trab_st === 'ENVIADO_PROVA' || r.retrabalho || r.bonificacao
          ? 'PROVA/SEM_SERVICO (recalculo real no apply)'
          : fmtMoney(r.soma_itens_atuais),
    };
  });
}

async function findNovDuplicatesPlan(conn) {
  const [novRows] = await conn.query(`
    SELECT
      f.idFatura,
      f.idEmpresa,
      LEFT(COALESCE(e.nome, ''), 24) AS empresa,
      f.status,
      f.valorTotal,
      f.desconto,
      f.descontoDevolucao,
      f.valorPago,
      (SELECT COUNT(*) FROM TbOrdemServico os WHERE os.idFatura = f.idFatura) AS qtd_os,
      (SELECT COALESCE(SUM(os.valorTotal), 0) FROM TbOrdemServico os WHERE os.idFatura = f.idFatura) AS soma_os,
      (SELECT COUNT(*) FROM TbFinanceiroLancamento l WHERE l.idFatura = f.idFatura AND l.status != 'CANCELADO') AS qtd_lanc,
      (SELECT COUNT(*) FROM TbDevolucaoComponente d WHERE d.idFatura = f.idFatura) AS qtd_dev,
      (SELECT COUNT(*) FROM TbFaturaDevolucaoItem di WHERE di.idFatura = f.idFatura) AS qtd_dev_item
    FROM TbFinanceiroFatura f
    LEFT JOIN TbEmpresa e ON e.idEmpresa = f.idEmpresa
    WHERE DATE_FORMAT(f.dataInicio, '%Y-%m') = '2026-11'
      AND f.status != 'CANCELADA'
    ORDER BY f.idEmpresa ASC, f.idFatura ASC;
  `);

  const byEmp = new Map();
  for (const row of novRows) {
    if (!byEmp.has(row.idEmpresa)) byEmp.set(row.idEmpresa, []);
    byEmp.get(row.idEmpresa).push(row);
  }

  const consolidatePairs = [];
  for (const [idEmpresa, list] of byEmp.entries()) {
    if (list.length < 2) continue;
    const abertas = list.filter((f) => f.status === 'ABERTA' || f.status === 'AGUARDANDO_DEVOLUCAO');
    if (abertas.length >= 2) {
      // Prefere <= 739 ou com OSs, menor idFatura primeiro
      const sorted = [...abertas].sort((a, b) => a.idFatura - b.idFatura);
      const keeper = sorted[0];
      for (let i = 1; i < sorted.length; i++) {
        const dup = sorted[i];
        if (
          Number(dup.valorPago || 0) === 0 &&
          Number(dup.qtd_lanc || 0) === 0 &&
          Number(dup.qtd_dev || 0) === 0 &&
          Number(dup.qtd_dev_item || 0) === 0
        ) {
          consolidatePairs.push({ idEmpresa, empresa: dup.empresa, keeper, dup });
        }
      }
    }
  }

  const emptyNovGt739 = novRows.filter(
    (f) =>
      f.idFatura > 739 &&
      Number(f.qtd_os) === 0 &&
      Number(f.valorPago || 0) === 0 &&
      Number(f.qtd_lanc || 0) === 0 &&
      Number(f.qtd_dev || 0) === 0 &&
      Number(f.qtd_dev_item || 0) === 0,
  );

  return { allNov: novRows, byEmp, consolidatePairs, emptyNovGt739 };
}

async function buildDryRunReport(conn) {
  log('=========================================================================');
  log('PLANO DE CORREÇÃO FINANCEIRA — MODO SIMULAÇÃO (--dry-run / SOMENTE LEITURA)');
  log('=========================================================================');

  const beforeDre = await fetchMonthlyDreSnapshot(conn);
  log('\n=== 0. DRE ATUAL 2026 (ANTES DA CORREÇÃO) ===');
  logTable(
    beforeDre.map((r) => ({
      mes: r.mes,
      qtd: r.qtd,
      dre_total: fmtMoney(r.dre_total),
      total_paga: fmtMoney(r.total_paga),
      total_fechada: fmtMoney(r.total_fechada),
      total_aberta: fmtMoney(r.total_aberta),
    })),
  );
  log(`Total DRE 2026 hoje: R$ ${fmtMoney(beforeDre.reduce((s, r) => s + r.dre_total, 0))}`);

  // Etapa 1
  const ghosts1 = await findEtapa1Ghosts(conn);
  const ghostsByMes = new Map();
  for (const g of ghosts1) {
    const cur = ghostsByMes.get(g.mes) || { mes: g.mes, qtd: 0, valor: 0 };
    cur.qtd += 1;
    cur.valor += Number(g.valorTotal || 0);
    ghostsByMes.set(g.mes, cur);
  }
  log('\n=== 1. ETAPA 1 — FANTASMAS idFatura > 739 SEM OS / SEM PAGAMENTO / SEM LANCAMENTO ===');
  log(`Total de faturas fantasmas elegíveis para exclusão segura: ${ghosts1.length}`);
  if (ghosts1.length > 0) {
    logTable(
      Array.from(ghostsByMes.values()).map((x) => ({
        mes: x.mes,
        qtd: x.qtd,
        valor_removido: fmtMoney(x.valor),
      })),
    );
    const total2025 = ghosts1.filter((g) => g.mes.startsWith('2025')).reduce((s, g) => s + Number(g.valorTotal || 0), 0);
    const total2026 = ghosts1.filter((g) => g.mes.startsWith('2026')).reduce((s, g) => s + Number(g.valorTotal || 0), 0);
    log(`Impacto 2025: -R$ ${fmtMoney(total2025)} | Impacto Jan-Out/Dez 2026: -R$ ${fmtMoney(total2026)}`);
  }

  const ghostIdSet = new Set(ghosts1.map((g) => g.idFatura));
  const formatOutrasOut = (list) =>
    list
      .filter((o) => !ghostIdSet.has(o.idFatura))
      .map((o) => `#${o.idFatura}(${o.status},R$${fmtMoney(o.valorTotal)})`)
      .join(', ') || 'nenhuma (após limpeza Etapa 1)';

  // Etapa 2
  const { pureOctInNov, mixedOctInNov, mixedReadOnlyOctInNov } = await inspectOutubroNovembroPlan(conn);
  log('\n=== 2. ETAPA 2 — AJUSTES DE OUTUBRO/2026 QUE ESTÃO EM NOVEMBRO/2026 ===');
  log(`2A. Faturas 100% de Outubro alocadas em Novembro: ${pureOctInNov.length}`);
  if (pureOctInNov.length > 0) {
    logTable(
      pureOctInNov.map((x) => ({
        idFatura: x.fatura.idFatura,
        emp: x.fatura.idEmpresa,
        empresa: x.fatura.empresa,
        status: x.fatura.status,
        valorTotal: fmtMoney(x.fatura.valorTotal),
        qtd_os: x.osList.length,
        outras_out: formatOutrasOut(x.existingOct),
        lancamentos: x.lancamentos.length,
        parcelas: x.parcelas.map((p) => `#${p.idParcela}(${p.status},venc=${p.venc})`).join(', ') || 'nenhuma',
      })),
    );
  }

  log(`2B. Faturas ABERTA mistas (Outubro + Novembro) em Novembro: ${mixedOctInNov.length}`);
  if (mixedOctInNov.length > 0) {
    logTable(
      mixedOctInNov.map((x) => ({
        idFatura: x.fatura.idFatura,
        emp: x.fatura.idEmpresa,
        empresa: x.fatura.empresa,
        status: x.fatura.status,
        valorAtual: fmtMoney(x.fatura.valorTotal),
        os_outubro_mover: x.octOs.length,
        val_os_outubro: fmtMoney(x.octOs.reduce((s, o) => s + Number(o.os_valor || 0), 0)),
        os_nov_ficam: x.otherOs.length,
        outras_out: formatOutrasOut(x.existingOct),
      })),
    );
  }

  if (mixedReadOnlyOctInNov.length > 0) {
    log(`2B-ALERTA. Faturas FECHADA/PAGA mistas encontradas em Novembro: ${mixedReadOnlyOctInNov.length}`);
    logTable(mixedReadOnlyOctInNov.map((x) => ({ idFatura: x.fatura.idFatura, emp: x.fatura.idEmpresa, status: x.fatura.status, os_out: x.octOs.length, os_nov: x.otherOs.length })));
  }

  // Casos pontuais Outubro
  const { divHeaders, divItems, revRows } = await inspectOutubroSpecialCases(conn);
  log('\n=== 2C. INSPEÇÃO PONTUAL DE OUTUBRO/2026 (#644, #652, #699 e #676,#688,#694,#696,#697) ===');
  log('Faturas com divergência de valor (#644, #652, #699) — NÃO alteradas no --apply padrão sem flag explícita:');
  logTable(
    divHeaders.map((h) => ({
      idFatura: h.idFatura,
      emp: h.idEmpresa,
      empresa: h.empresa,
      status: h.status,
      bruto: fmtMoney(h.valorTotalBruto),
      desc: fmtMoney(h.desconto),
      descDev: fmtMoney(h.descontoDevolucao),
      valorTotal: fmtMoney(h.valorTotal),
      valorPago: fmtMoney(h.valorPago),
    })),
  );
  log('Itens detalhados das faturas divergentes (#644, #652, #699):');
  logTable(
    divItems.map((i) => ({
      fat: i.idFatura,
      os: i.idOrdemServico,
      trab: i.idTrabalho,
      trab_st: i.trab_status,
      retrab: i.retrabalho ? 1 : 0,
      bonif: i.bonificacao ? 1 : 0,
      dt_conc: i.dt_conc,
      tipo: i.tipoCobranca,
      descr: (i.descricao || '').slice(0, 26),
      item_st: i.item_status,
      qtd: i.quantidade,
      dev: i.quantidadeDevolvida,
      v_unit: fmtMoney(i.valor),
      v_tot: fmtMoney(i.item_valorTotal),
    })),
  );
  log('Faturas de Outubro que apareceram FECHADA em 16/11 e estão ABERTA após o restore de 13/11:');
  logTable(
    revRows.map((r) => ({
      idFatura: r.idFatura,
      emp: r.idEmpresa,
      empresa: r.empresa,
      status_atual: r.status,
      valorTotal: fmtMoney(r.valorTotal),
      valorPago: fmtMoney(r.valorPago),
      qtd_os: r.qtd_os,
      idLanc: r.idLancamento || 'NENHUM',
      lanc_st: r.lanc_status || '-',
      lanc_comp: r.lanc_comp || '-',
      lanc_val: r.lanc_val != null ? fmtMoney(r.lanc_val) : '-',
      qtd_parc: r.qtd_parc || 0,
    })),
  );

  // Etapa 3
  const trabs = await findTrabalhosParaRecuperar(conn);
  const empsNovPendentes = new Set(trabs.filter((t) => t.mes_conc === '2026-11').map((t) => t.idEmpresa));
  const { consolidatePairs, emptyNovGt739 } = await findNovDuplicatesPlan(conn);
  log('\n=== 3. ETAPA 3 — RECUPERAÇÃO DE NOVEMBRO/2026 ===');
  log(`3A. Trabalhos ENVIADO / ENVIADO_PROVA (>= 2026-10-01) a reativar/vincular: ${trabs.length}`);
  const byStatus = {
    ENVIADO: trabs.filter((t) => t.trab_st === 'ENVIADO').length,
    ENVIADO_PROVA: trabs.filter((t) => t.trab_st === 'ENVIADO_PROVA').length,
    sem_os: trabs.filter((t) => !t.idOrdemServico).length,
    os_pendente: trabs.filter((t) => t.idOrdemServico && (t.os_st !== 'RECEBER' || !t.os_conc)).length,
    sem_fatura: trabs.filter((t) => !t.os_fat).length,
  };
  log(`Resumo: ENVIADO=${byStatus.ENVIADO}, ENVIADO_PROVA=${byStatus.ENVIADO_PROVA}, sem_os=${byStatus.sem_os}, os_pendente=${byStatus.os_pendente}, os_sem_fatura=${byStatus.sem_fatura}`);
  if (trabs.length > 0) {
    logTable(
      trabs.slice(0, 40).map((t) => ({
        trab: t.idTrabalho,
        emp: t.idEmpresa,
        empresa: t.empresa,
        st: t.trab_st,
        conc: t.ymd_conc,
        os: t.idOrdemServico || 'NEW',
        os_st: t.os_st || '-',
        os_fat: t.os_fat || 'NULL',
        est_atual: t.estimativa_cobranca,
      })),
    );
    if (trabs.length > 40) {
      log(`... (+ ${trabs.length - 40} trabalhos omitidos da prévia; total=${trabs.length})`);
    }
  }

  log(`3B. Duplicidades ABERTA em Novembro/2026 a consolidar e limpar ANTES de vincular: ${consolidatePairs.length}`);
  if (consolidatePairs.length > 0) {
    logTable(
      consolidatePairs.map((p) => ({
        emp: p.idEmpresa,
        empresa: p.empresa,
        manter: `#${p.keeper.idFatura}(${p.keeper.status},R$${fmtMoney(p.keeper.valorTotal)},${p.keeper.qtd_os}os)`,
        absorver_e_remover: `#${p.dup.idFatura}(${p.dup.status},R$${fmtMoney(p.dup.valorTotal)},${p.dup.qtd_os}os)`,
      })),
    );
  }

  log(`3C. Faturas Novembro >739 hoje com 0 OS (recuperam OS vs removidas se sobrarem vazias): ${emptyNovGt739.length}`);
  if (emptyNovGt739.length > 0) {
    logTable(
      emptyNovGt739.map((f) => ({
        idFatura: f.idFatura,
        emp: f.idEmpresa,
        empresa: f.empresa,
        status: f.status,
        valorAtual: fmtMoney(f.valorTotal),
        destino_previsto:
          f.status !== 'ABERTA'
            ? 'remover_pos_3C (duplicata vazia nao aberta)'
            : empsNovPendentes.has(f.idEmpresa)
              ? 'recupera OSs em 3C (ou absorvida em 3B se dup)'
              : 'remover_pos_3C (vazia sem OS pendente)',
      })),
    );
  }

  const impactByMes = new Map();
  for (const g of ghosts1) {
    if (g.mes.startsWith('2026')) {
      impactByMes.set(g.mes, (impactByMes.get(g.mes) || 0) - Number(g.valorTotal || 0));
    }
  }
  for (const x of pureOctInNov) {
    const val = Number(x.fatura.valorTotal || 0);
    impactByMes.set('2026-11', (impactByMes.get('2026-11') || 0) - val);
    impactByMes.set('2026-10', (impactByMes.get('2026-10') || 0) + val);
  }
  for (const x of mixedOctInNov) {
    const valOct = x.octOs.reduce((s, o) => s + Number(o.os_valor || 0), 0);
    impactByMes.set('2026-11', (impactByMes.get('2026-11') || 0) - valOct);
    impactByMes.set('2026-10', (impactByMes.get('2026-10') || 0) + valOct);
  }

  log('\n=== 4. PROJEÇÃO MENSAL 2026 (ANTES vs APÓS ETAPAS 1+2; NOVEMBRO SOMARÁ OS 127 TRABALHOS NA ETAPA 3) ===');
  logTable(
    beforeDre.map((r) => {
      const delta = impactByMes.get(r.mes) || 0;
      return {
        mes: r.mes,
        dre_antes: fmtMoney(r.dre_total),
        ajuste_etapas_1_2: fmtMoney(delta),
        dre_pos_1_2: fmtMoney(r.dre_total + delta),
        observacao:
          r.mes === '2026-11'
            ? '+ soma real dos 127 trabalhos e limpeza duplicadas'
            : r.mes === '2026-10'
              ? '+ revisao pontual #644/#699/#676..#697'
              : '',
      };
    }),
  );

  log('\nPara executar a correção com backup automático + transação:');
  log('  node node-bff-odontoprint-master/scripts/corrigir_financeiro_completo.js --apply');
  log('Flags opcionais adicionais:');
  log('  --fechar-outubro-com-lancamento  (fecha #676/#688/#694/#696/#697 que tenham lancamento ativo)');
  log('  --recalcular-outubro-divergentes (recalcula #644 e #699 pelos itens atuais)');
  log('  --skip-backup                    (pula mysqldump automático apenas se já fez dump manual antes)');
}

async function applyEtapa1(conn) {
  log('\n>>> EXECUTANDO ETAPA 1 — Remoção segura de fantasmas >739 (0 OS, 0 pago, 0 lanc, 0 dev)...');
  const ghosts = await findEtapa1Ghosts(conn);
  if (ghosts.length === 0) {
    log('Nenhum fantasma elegível encontrado.');
    return { removed: 0 };
  }
  const removed = await safeDeleteEmptyFaturas(conn, ghosts.map((g) => g.idFatura));
  log(`Etapa 1 concluída: ${removed} faturas fantasmas removidas.`);
  return { removed };
}

async function applyEtapa2And3(conn, bffRoot, flags) {
  const { pureOctInNov, mixedOctInNov } = await inspectOutubroNovembroPlan(conn);
  const drainedCandidateIds = new Set();

  log('\n>>> Inicializando contexto NestJS (Servicos Oficiais) com Crons desativados...');
  process.chdir(bffRoot);
  requireFromBff(bffRoot, path.join(bffRoot, 'dist/src/typeorm-patch'));
  requireFromBff(bffRoot, 'reflect-metadata');
  const { NestFactory } = requireFromBff(bffRoot, '@nestjs/core');
  const { SchedulerRegistry } = requireFromBff(bffRoot, '@nestjs/schedule');
  const {
    initializeTransactionalContext,
    patchTypeORMRepositoryWithBaseRepository,
  } = requireFromBff(bffRoot, 'typeorm-transactional-cls-hooked');
  const { AppModule } = require(path.join(bffRoot, 'dist/src/app.module'));
  const { TrabalhoService } = require(path.join(bffRoot, 'dist/src/app/trabalho/business/trabalho.service'));
  const { FaturaService } = require(path.join(bffRoot, 'dist/src/app/financeiro/business/fatura.service'));

  initializeTransactionalContext();
  patchTypeORMRepositoryWithBaseRepository();

  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn'],
  });

  try {
    try {
      const schedulerRegistry = app.get(SchedulerRegistry);
      const crons = schedulerRegistry.getCronJobs();
      crons.forEach((job, name) => {
        job.stop();
        log(`Cron pausado durante manutenção: ${name}`);
      });
    } catch (_) {
      // ignora se SchedulerRegistry não estiver ativo
    }

    const trabalhoService = app.get(TrabalhoService);
    const faturaService = app.get(FaturaService);

    // --- ETAPA 2A: Faturas 100% Outubro em Novembro ---
    log('\n>>> EXECUTANDO ETAPA 2A — Movendo faturas 100% Outubro de Nov -> Out...');
    for (const entry of pureOctInNov) {
      const f = entry.fatura;
      const abertaOut = entry.existingOct.find(
        (o) => o.status === 'ABERTA' || o.status === 'AGUARDANDO_DEVOLUCAO',
      );
      const podeAbsorver =
        abertaOut &&
        f.status === 'ABERTA' &&
        Number(f.valorPago || 0) === 0 &&
        entry.lancamentos.length === 0;

      if (podeAbsorver) {
        log(`Movendo ${entry.osList.length} OS(s) da fatura #${f.idFatura} (emp ${f.idEmpresa}) -> Outubro (#${abertaOut.idFatura})...`);
        for (const os of entry.osList) {
          await faturaService.moverOrdemServicoFatura({
            idOrdemServico: os.idOrdemServico,
            idEmpresa: f.idEmpresa,
            idFaturaDestino: abertaOut.idFatura,
          });
        }
        drainedCandidateIds.add(f.idFatura);
      } else {
        const temOutraOut = entry.existingOct.length > 0;
        await conn.beginTransaction();
        try {
          await conn.query(
            `UPDATE TbFinanceiroFatura
             SET dataInicio = '2026-10-01',
                 dataFim = '2026-10-31',
                 descricao = CASE
                   WHEN ? > 0 AND (descricao IS NULL OR TRIM(descricao) = '') THEN 'Fatura Complementar'
                   ELSE descricao
                 END
             WHERE idFatura = ?`,
            [temOutraOut ? 1 : 0, f.idFatura],
          );
          if (entry.lancamentos.length > 0) {
            await conn.query(
              `UPDATE TbFinanceiroLancamento
               SET dataCompetencia = '2026-10-01'
               WHERE idFatura = ? AND status != 'CANCELADO'`,
              [f.idFatura],
            );
          }
          await conn.commit();
          log(`Fatura #${f.idFatura} (emp ${f.idEmpresa}, ${f.status}, R$ ${fmtMoney(f.valorTotal)}) movida para competência 2026-10 (vencimentos preservados).`);
        } catch (err) {
          await conn.rollback();
          throw err;
        }
      }
    }

    // --- ETAPA 2B: Faturas mistas Outubro + Novembro ---
    log('\n>>> EXECUTANDO ETAPA 2B — Separando OSs de Outubro em faturas ABERTA mistas de Novembro...');
    for (const entry of mixedOctInNov) {
      log(`Fatura #${entry.fatura.idFatura} (emp ${entry.fatura.idEmpresa}): movendo ${entry.octOs.length} OS(s) de Outubro para 2026-10...`);
      for (const os of entry.octOs) {
        await faturaService.moverOrdemServicoFatura({
          idOrdemServico: os.idOrdemServico,
          idEmpresa: entry.fatura.idEmpresa,
          anoDestino: 2026,
          mesDestino: 10,
        });
      }
    }

    // --- ETAPA 2C (Opcional explícito): Casos pontuais Outubro ---
    if (flags.fecharOutubroComLancamento) {
      log('\n>>> EXECUTANDO ETAPA 2C (flag --fechar-outubro-com-lancamento)...');
      const { revRows } = await inspectOutubroSpecialCases(conn);
      for (const r of revRows) {
        if (r.status !== 'ABERTA' || !r.idLancamento || r.lanc_status === 'CANCELADO') continue;
        const vTotal = Number(r.valorTotal || 0);
        const vPagoParc = Number(r.soma_parc_paga || 0);
        const vPagoLanc = r.lanc_status === 'PAGO' ? (vPagoParc > 0 ? vPagoParc : Number(r.lanc_val || 0)) : vPagoParc;

        if (r.lanc_status === 'PAGO' && vPagoLanc >= vTotal - 0.01) {
          const pagoFinal = Math.min(vTotal, vPagoLanc);
          await conn.beginTransaction();
          try {
            await conn.query(
              `UPDATE TbFinanceiroFatura SET status = 'PAGA', valorPago = ? WHERE idFatura = ? AND status = 'ABERTA'`,
              [pagoFinal, r.idFatura],
            );
            await conn.query(
              `UPDATE TbOrdemServicoItem i
               INNER JOIN TbOrdemServico os ON os.idOrdemServico = i.idOrdemServico
               SET i.status = 'PAGO'
               WHERE os.idFatura = ? AND i.status != 'DEVOLVIDO'`,
              [r.idFatura],
            );
            await conn.commit();
            log(`Fatura #${r.idFatura} restaurada para PAGA (valorPago=R$ ${fmtMoney(pagoFinal)}, lanc #${r.idLancamento} já estava PAGO).`);
          } catch (err) {
            await conn.rollback();
            throw err;
          }
        } else if (vPagoLanc > 0 && vPagoLanc < vTotal - 0.01) {
          await conn.query(
            `UPDATE TbFinanceiroFatura SET status = 'PAGA_PARCIALMENTE', valorPago = ? WHERE idFatura = ? AND status = 'ABERTA'`,
            [vPagoLanc, r.idFatura],
          );
          log(`Fatura #${r.idFatura} restaurada para PAGA_PARCIALMENTE (valorPago=R$ ${fmtMoney(vPagoLanc)}, lanc #${r.idLancamento}).`);
        } else {
          await conn.query(
            `UPDATE TbFinanceiroFatura SET status = 'FECHADA' WHERE idFatura = ? AND status = 'ABERTA'`,
            [r.idFatura],
          );
          log(`Fatura #${r.idFatura} restaurada para FECHADA (lançamento ativo #${r.idLancamento} ${r.lanc_status}).`);
        }
      }
    }

    if (flags.recalcularOutubroDivergentes) {
      log('\n>>> EXECUTANDO ETAPA 2C (flag --recalcular-outubro-divergentes para #644 e #699)...');
      for (const idFat of [644, 699]) {
        const atualizada = await faturaService.recalcularFatura(idFat);
        log(`Fatura #${idFat} recalculada: novo valorTotal = R$ ${fmtMoney(atualizada?.valorTotal)}`);
      }
    }

    // --- ETAPA 3A: Reativar OS e recalcular preços dos trabalhos recuperados ---
    log('\n>>> EXECUTANDO ETAPA 3A — Recalculando OS e preços dos trabalhos enviados (>= 2026-10-01)...');
    const trabsParaRecuperar = await findTrabalhosParaRecuperar(conn);
    log(`Total de trabalhos para preparar/recalcular OS: ${trabsParaRecuperar.length}`);

    if (trabsParaRecuperar.length > 0) {
      for (const t of trabsParaRecuperar) {
        if (t.idOrdemServico && !t.os_dt_conc && (t.dataConclusao || t.dataHoraEnvio)) {
          await conn.query(
            `UPDATE TbOrdemServico SET dataConcluido = ? WHERE idOrdemServico = ? AND dataConcluido IS NULL`,
            [t.dataConclusao || t.dataHoraEnvio, t.idOrdemServico],
          );
        }
      }

      const currentUser = { user: { idUsuario: 1 } };
      const batchSize = 25;
      const idsTrabs = trabsParaRecuperar.map((t) => t.idTrabalho);
      for (let i = 0; i < idsTrabs.length; i += batchSize) {
        const slice = idsTrabs.slice(i, i + batchSize);
        await trabalhoService.atualizarPrecosOrdemServicoEmLote(currentUser, 0, slice);
        log(`Lote ${Math.floor(i / batchSize) + 1}: ${slice.length} trabalhos recalculados (OS RECEBER + preços atualizados).`);
      }
    }

    // --- ETAPA 3B: Consolidar E REMOVER duplicidades ABERTA em 2026-11 ANTES de vincular (3C) ---
    // Crítico: obterOuCriarFaturaParaMesAno busca ORDER BY idFatura DESC; se #1399/#1403/#1404/#1405
    // continuassem no banco, receberiam os trabalhos novos no lugar de #693/#733/#735/#736!
    log('\n>>> EXECUTANDO ETAPA 3B — Consolidando e removendo duplicadas ABERTA de Nov/2026 antes do vínculo...');
    const { consolidatePairs } = await findNovDuplicatesPlan(conn);
    const dupRemovedIds = [];
    for (const p of consolidatePairs) {
      log(`Consolidando emp ${p.idEmpresa}: #${p.dup.idFatura} -> #${p.keeper.idFatura}...`);
      const [dupOsList] = await conn.query(
        `SELECT idOrdemServico FROM TbOrdemServico WHERE idFatura = ? ORDER BY idOrdemServico ASC`,
        [p.dup.idFatura],
      );
      for (const osRow of dupOsList) {
        await faturaService.moverOrdemServicoFatura({
          idOrdemServico: osRow.idOrdemServico,
          idEmpresa: p.idEmpresa,
          idFaturaDestino: p.keeper.idFatura,
        });
      }
      if (Number(p.dup.desconto || 0) > 0 && Number(p.keeper.desconto || 0) === 0) {
        await faturaService.atualizarDescontoFatura(p.keeper.idFatura, Number(p.dup.desconto));
      }
      dupRemovedIds.push(p.dup.idFatura);
    }
    if (dupRemovedIds.length > 0) {
      const remDup = await safeDeleteEmptyFaturas(conn, dupRemovedIds);
      log(`Etapa 3B concluiu remoção imediata de ${remDup} duplicata(s) ABERTA vazia(s): [${dupRemovedIds.join(', ')}]`);
    }

    // --- ETAPA 3C: Vincular OSs concluídas sem fatura às faturas do mês de conclusão ---
    log('\n>>> EXECUTANDO ETAPA 3C — Vinculando OSs concluídas sem fatura...');
    const [osSemFatura] = await conn.query(`
      SELECT
        t.idTrabalho,
        t.idEmpresa,
        t.status AS trab_st,
        os.idOrdemServico,
        os.valorTotal
      FROM TbTrabalho t
      INNER JOIN TbOrdemServico os ON os.idTrabalho = t.idTrabalho
      WHERE t.ativo = 1
        AND t.status IN ('ENVIADO', 'ENVIADO_PROVA')
        AND os.status = 'RECEBER'
        AND os.concluido = 1
        AND os.idFatura IS NULL
        AND COALESCE(t.dataConclusao, t.dataHoraEnvio, os.dataConcluido) >= '2026-10-01'
      ORDER BY t.idTrabalho ASC;
    `);
    let vinculados = 0;
    let falhasVinculo = 0;
    for (const row of osSemFatura) {
      try {
        const res = await faturaService.adicionarTrabalhoAProximaFatura(row.idTrabalho);
        if (res) {
          vinculados += 1;
        } else {
          falhasVinculo += 1;
          log(`AVISO: trabalho #${row.idTrabalho} retornou null ao vincular na fatura.`);
        }
      } catch (err) {
        falhasVinculo += 1;
        log(`ERRO ao vincular trabalho #${row.idTrabalho}: ${err.message}`);
      }
    }
    log(`Etapa 3C concluída: ${vinculados} trabalhos vinculados, ${falhasVinculo} avisos/falhas.`);

    // --- ETAPA 3D: Limpar duplicadas/vazias >739 (e faturas explicitamente drenadas na Etapa 2A) que ficaram sem OS ---
    log('\n>>> EXECUTANDO ETAPA 3D — Limpando faturas >739 e drenadas de Nov/2026 ainda com 0 OS...');
    const [sobrasNov] = await conn.query(`
      SELECT f.idFatura
      FROM TbFinanceiroFatura f
      WHERE DATE_FORMAT(f.dataInicio, '%Y-%m') = '2026-11'
        AND f.idFatura > 739
        AND f.status != 'CANCELADA'
        AND NOT EXISTS (SELECT 1 FROM TbOrdemServico os WHERE os.idFatura = f.idFatura)
        AND COALESCE(f.valorPago, 0) = 0
        AND NOT EXISTS (SELECT 1 FROM TbFinanceiroLancamento l WHERE l.idFatura = f.idFatura AND l.status != 'CANCELADO')
        AND NOT EXISTS (SELECT 1 FROM TbDevolucaoComponente d WHERE d.idFatura = f.idFatura)
        AND NOT EXISTS (SELECT 1 FROM TbFaturaDevolucaoItem di WHERE di.idFatura = f.idFatura)
      ORDER BY f.idFatura ASC;
    `);
    const toClean3D = Array.from(
      new Set([...sobrasNov.map((s) => s.idFatura), ...drainedCandidateIds]),
    );
    if (toClean3D.length > 0) {
      const rem3D = await safeDeleteEmptyFaturas(conn, toClean3D);
      log(`Removidas ${rem3D} faturas vazias restantes em Novembro: [${toClean3D.join(', ')}]`);
    } else {
      log('Nenhuma sobra vazia restante em Novembro/2026.');
    }

    // --- ETAPA 3E: Recalcular todas as faturas abertas de 2026-11 ---
    log('\n>>> EXECUTANDO ETAPA 3E — Recalculando todas as faturas ABERTAS/PARCIAIS de Novembro/2026...');
    const [abertasNov] = await conn.query(`
      SELECT idFatura, idEmpresa, status
      FROM TbFinanceiroFatura
      WHERE DATE_FORMAT(dataInicio, '%Y-%m') = '2026-11'
        AND status IN ('ABERTA', 'AGUARDANDO_DEVOLUCAO', 'PAGA_PARCIALMENTE')
      ORDER BY idFatura ASC;
    `);
    for (const fat of abertasNov) {
      await faturaService.recalcularFatura(fat.idFatura);
    }
    log(`Etapa 3E concluída: ${abertasNov.length} faturas abertas de Novembro/2026 recalculadas com sucesso.`);
  } finally {
    await app.close();
  }
}

async function main() {
  const args = new Set(process.argv.slice(2));
  const applyMode = args.has('--apply');
  const flags = {
    apply: applyMode,
    skipBackup: args.has('--skip-backup'),
    fecharOutubroComLancamento: args.has('--fechar-outubro-com-lancamento'),
    recalcularOutubroDivergentes: args.has('--recalcular-outubro-divergentes'),
  };

  const bffRoot = resolveBffRoot();
  const dbConfig = loadDbConfig(bffRoot);
  const mysql = requireFromBff(bffRoot, 'mysql2/promise');

  const conn = await mysql.createConnection({
    host: dbConfig.host,
    port: dbConfig.port,
    user: dbConfig.user,
    password: dbConfig.password,
    database: dbConfig.database,
    charset: 'utf8mb4',
  });

  try {
    if (!flags.apply) {
      await buildDryRunReport(conn);
    } else {
      log('=========================================================================');
      log('EXECUÇÃO REAL DE CORREÇÃO FINANCEIRA (--apply)');
      log('=========================================================================');
      const beforeDre = await fetchMonthlyDreSnapshot(conn);
      if (!flags.skipBackup) {
        createBackupDump(dbConfig);
      } else {
        log('AVISO: --skip-backup informado, pulando mysqldump.');
      }

      await applyEtapa1(conn);
      await applyEtapa2And3(conn, bffRoot, flags);

      const afterDre = await fetchMonthlyDreSnapshot(conn);
      log('\n=== ETAPA 4 — COMPARATIVO FINAL DRE 2026 (ANTES vs DEPOIS) ===');
      const beforeMap = new Map(beforeDre.map((r) => [r.mes, r]));
      const afterMap = new Map(afterDre.map((r) => [r.mes, r]));
      const allMeses = Array.from(new Set([...beforeMap.keys(), ...afterMap.keys()])).sort();
      logTable(
        allMeses.map((mes) => {
          const b = beforeMap.get(mes) || { qtd: 0, dre_total: 0 };
          const a = afterMap.get(mes) || { qtd: 0, dre_total: 0, total_paga: 0, total_fechada: 0, total_aberta: 0 };
          return {
            mes,
            qtd_antes: b.qtd,
            dre_antes: fmtMoney(b.dre_total),
            qtd_depois: a.qtd,
            dre_depois: fmtMoney(a.dre_total),
            paga: fmtMoney(a.total_paga),
            fechada: fmtMoney(a.total_fechada),
            aberta: fmtMoney(a.total_aberta),
          };
        }),
      );
      log(`Total DRE 2026 ANTES: R$ ${fmtMoney(beforeDre.reduce((s, r) => s + r.dre_total, 0))}`);
      log(`Total DRE 2026 DEPOIS: R$ ${fmtMoney(afterDre.reduce((s, r) => s + r.dre_total, 0))}`);

      const restantes = await findTrabalhosParaRecuperar(conn);
      log(`Trabalhos >= 2026-10-01 ainda sem fatura/pendentes após execução: ${restantes.length}`);
      if (restantes.length > 0) {
        logTable(
          restantes.slice(0, 30).map((t) => ({
            trab: t.idTrabalho,
            emp: t.idEmpresa,
            st: t.trab_st,
            conc: t.ymd_conc,
            os_st: t.os_st || '-',
            os_fat: t.os_fat || 'NULL',
          })),
        );
      }
    }

    const outPath = '/tmp/correcao_financeiro_relatorio.txt';
    try {
      fs.writeFileSync(outPath, LOG_LINES.join('\n'), 'utf8');
      log(`\nRelatório salvo em: ${outPath}`);
    } catch (_) {
      const localPath = path.join(process.cwd(), 'correcao_financeiro_relatorio.txt');
      fs.writeFileSync(localPath, LOG_LINES.join('\n'), 'utf8');
      log(`\nRelatório salvo em: ${localPath}`);
    }
  } finally {
    await conn.end();
  }
}

main().catch((err) => {
  console.error('ERRO FATAL na correção financeira:', err);
  process.exit(1);
});

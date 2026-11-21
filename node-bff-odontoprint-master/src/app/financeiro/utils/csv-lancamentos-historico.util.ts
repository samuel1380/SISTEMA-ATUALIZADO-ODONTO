import { BadRequestException } from '@nestjs/common';
import { TipoLancamento } from '../domain/tipo-lancamento.enum';

export interface LinhaCsvHistorico {
  linhaNumero: number;
  dataIso: string;
  descricao: string;
  valor: number;
  tipo: TipoLancamento;
}

type ColRole = 'data' | 'descricao' | 'valor' | 'tipo' | 'valor_credito' | 'valor_debito';

const HEADER_ALIASES: Record<string, ColRole> = {
  data: 'data',
  data_lancamento: 'data',
  data_de_lancamento: 'data',
  dt: 'data',
  date: 'data',
  descricao: 'descricao',
  desc: 'descricao',
  valor: 'valor',
  value: 'valor',
  amount: 'valor',
  tipo: 'tipo',
  credito_debito: 'tipo',
  natureza: 'tipo',
  c_d: 'tipo',
  dc: 'tipo',
  valor_credito: 'valor_credito',
  v_credito: 'valor_credito',
  credito: 'valor_credito',
  valor_debito: 'valor_debito',
  v_debito: 'valor_debito',
  debito: 'valor_debito',
};

type ParsedHeader = {
  data?: number;
  descricao?: number;
  valor?: number;
  tipo?: number;
  valorCredito?: number;
  valorDebito?: number;
};

function normalizarHeader(h: string): string {
  return h
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '_');
}

/** Divide linha CSV respeitando aspas duplas. */
function splitCsvLine(line: string, delim: string): string[] {
  const out: string[] = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (!inQuotes && c === delim) {
      out.push(cur.trim());
      cur = '';
      continue;
    }
    if (!inQuotes && (c === '\r' || c === '\n')) break;
    cur += c;
  }
  out.push(cur.trim());
  return out;
}

function detectarDelimitador(primeiraLinha: string): string {
  const count = (d: string) => {
    if (d === '\t') return (primeiraLinha.match(/\t/g) || []).length;
    const esc = d.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return (primeiraLinha.match(new RegExp(esc, 'g')) || []).length;
  };
  const semi = count(';');
  const comma = count(',');
  const tab = count('\t');
  if (tab >= semi && tab >= comma && tab > 0) return '\t';
  if (semi >= comma) return ';';
  return ',';
}

export function parseDataFlexivel(s: string): string {
  const t = s.trim();
  if (!t) throw new BadRequestException('Data vazia.');
  const br = /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/.exec(t);
  if (br) {
    const day = parseInt(br[1], 10);
    const month = parseInt(br[2], 10);
    let year = parseInt(br[3], 10);
    if (year < 100) year += 2000;
    if (month < 1 || month > 12 || day < 1 || day > 31) {
      throw new BadRequestException(`Data inválida: ${t}`);
    }
    const dt = new Date(year, month - 1, day);
    if (isNaN(dt.getTime())) throw new BadRequestException(`Data inválida: ${t}`);
    const mm = String(dt.getMonth() + 1).padStart(2, '0');
    const dd = String(dt.getDate()).padStart(2, '0');
    return `${dt.getFullYear()}-${mm}-${dd}`;
  }
  if (/^\d{4}-\d{2}-\d{2}/.test(t)) {
    const d = new Date(t);
    if (isNaN(d.getTime())) throw new BadRequestException(`Data inválida: ${t}`);
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${mm}-${dd}`;
  }
  throw new BadRequestException(`Formato de data não reconhecido: ${t}. Use DD/MM/AA, DD/MM/AAAA ou AAAA-MM-DD.`);
}

/** Interpreta número decimal em formato BR ou simples (mesma regra de parseValorBr). */
export function parseValorNumericoBr(s: string): number {
  const t = s.trim().replace(/\s/g, '').replace(/R\$\s*/i, '');
  if (!t) return NaN;
  let n: number;
  if (t.includes(',') && t.lastIndexOf(',') > t.lastIndexOf('.')) {
    n = parseFloat(t.replace(/\./g, '').replace(',', '.'));
  } else {
    n = parseFloat(t.replace(/,/g, ''));
  }
  return n;
}

export function parseValorBr(s: string): number {
  const n = parseValorNumericoBr(s);
  if (isNaN(n) || n <= 0) throw new BadRequestException(`Valor inválido: ${s}`);
  return Math.round(n * 100) / 100;
}

/**
 * Para colunas valor_credito / valor_debito: vazio ou zero não gera lançamento nesse lado.
 */
export function parseValorCreditoDebitoOpcional(s: string): number | null {
  const t = s.trim();
  if (!t) return null;
  const n = parseValorNumericoBr(s);
  if (isNaN(n)) throw new BadRequestException(`Valor inválido: ${s}`);
  if (n === 0) return null;
  if (n < 0) throw new BadRequestException(`Valor não pode ser negativo: ${s}`);
  return Math.round(n * 100) / 100;
}

export function parseTipoCreditoDebito(s: string): TipoLancamento {
  const x = s
    .trim()
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  if (['C', 'CREDITO', 'CR', 'R', 'RECEITA', '+', '1', 'POSITIVO'].includes(x)) {
    return TipoLancamento.RECEITA;
  }
  if (['D', 'DEBITO', 'DB', 'DESPESA', '-', '2', 'NEGATIVO'].includes(x)) {
    return TipoLancamento.DESPESA;
  }
  throw new BadRequestException(`Tipo de linha não reconhecido: "${s}". Use C/CRÉDITO ou D/DÉBITO.`);
}

export interface ResultadoParseCsvHistorico {
  linhas: LinhaCsvHistorico[];
  errosParse: { linha: number; mensagem: string }[];
}

export function parseCsvLancamentosHistorico(conteudo: string): ResultadoParseCsvHistorico {
  const raw = conteudo.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
  const lines = raw.split('\n').filter((l) => l.trim().length > 0);
  if (lines.length < 2) {
    throw new BadRequestException('CSV deve ter cabeçalho e ao menos uma linha de dados.');
  }

  const delim = detectarDelimitador(lines[0]);
  const headerCells = splitCsvLine(lines[0], delim).map((c) => c.replace(/^"|"$/g, ''));
  const idx: ParsedHeader = {};

  headerCells.forEach((cell, i) => {
    const norm = normalizarHeader(cell);
    const key = HEADER_ALIASES[norm];
    if (key === 'data') idx.data = i;
    else if (key === 'descricao') idx.descricao = i;
    else if (key === 'valor') idx.valor = i;
    else if (key === 'tipo') idx.tipo = i;
    else if (key === 'valor_credito') idx.valorCredito = i;
    else if (key === 'valor_debito') idx.valorDebito = i;
  });

  const formatoCreditoDebito =
    idx.data !== undefined &&
    idx.descricao !== undefined &&
    idx.valorCredito !== undefined &&
    idx.valorDebito !== undefined;

  const formatoLegado =
    idx.data !== undefined &&
    idx.descricao !== undefined &&
    idx.valor !== undefined &&
    idx.tipo !== undefined;

  if (!formatoCreditoDebito && !formatoLegado) {
    throw new BadRequestException(
      'Cabeçalho do CSV: informe (data_lancamento, descricao, valor_credito, valor_debito) ou o formato antigo (data, descricao, valor, tipo).',
    );
  }

  const linhas: LinhaCsvHistorico[] = [];
  const errosParse: { linha: number; mensagem: string }[] = [];

  if (formatoCreditoDebito) {
    for (let r = 1; r < lines.length; r++) {
      const cells = splitCsvLine(lines[r], delim).map((c) => c.replace(/^"|"$/g, ''));
      const linhaNumero = r + 1;
      try {
        const dataIso = parseDataFlexivel(cells[idx.data!] || '');
        const descricao = (cells[idx.descricao!] || '').trim();
        if (!descricao) continue;
        const vc = parseValorCreditoDebitoOpcional(cells[idx.valorCredito!] ?? '');
        const vd = parseValorCreditoDebitoOpcional(cells[idx.valorDebito!] ?? '');
        if (vc === null && vd === null) continue;
        if (vc !== null) {
          linhas.push({ linhaNumero, dataIso, descricao, valor: vc, tipo: TipoLancamento.RECEITA });
        }
        if (vd !== null) {
          linhas.push({ linhaNumero, dataIso, descricao, valor: vd, tipo: TipoLancamento.DESPESA });
        }
      } catch (e: any) {
        errosParse.push({ linha: linhaNumero, mensagem: e?.message || String(e) });
      }
    }
    return { linhas, errosParse };
  }

  for (let r = 1; r < lines.length; r++) {
    const cells = splitCsvLine(lines[r], delim).map((c) => c.replace(/^"|"$/g, ''));
    const linhaNumero = r + 1;
    try {
      const dataIso = parseDataFlexivel(cells[idx.data!] || '');
      const descricao = (cells[idx.descricao!] || '').trim();
      if (!descricao) continue;
      const valor = parseValorBr(cells[idx.valor!] || '');
      const tipo = parseTipoCreditoDebito(cells[idx.tipo!] || '');
      linhas.push({ linhaNumero, dataIso, descricao, valor, tipo });
    } catch (e: any) {
      errosParse.push({ linha: linhaNumero, mensagem: e?.message || String(e) });
    }
  }

  return { linhas, errosParse };
}

/**
 * Utilitários para tratamento seguro de datas no módulo financeiro.
 * Evita o deslocamento de dia/mês causado pelo fuso horário (UTC vs Horário de Brasília UTC-3).
 */

/**
 * Formata qualquer data (Date ou string ISO/MySQL) em 'YYYY-MM-DD' sem deslocamento de dia/mês por fuso horário.
 */
export function formatDataYYYYMMDD(d: Date | string | null | undefined): string {
  if (!d) return '';
  if (typeof d === 'string') {
    const s = d.trim();
    const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (m) {
      return `${m[1]}-${m[2]}-${m[3]}`;
    }
  }
  const dateObj = d instanceof Date ? d : new Date(d);
  if (isNaN(dateObj.getTime())) return '';

  // Se o horário for exatamente meia-noite UTC (00:00:00.000Z),
  // indica valor vindo de uma coluna DATE pura do banco de dados (MySQL/Postgres)
  if (
    dateObj.getUTCHours() === 0 &&
    dateObj.getUTCMinutes() === 0 &&
    dateObj.getUTCSeconds() === 0 &&
    dateObj.getUTCMilliseconds() === 0
  ) {
    const y = dateObj.getUTCFullYear();
    const m = String(dateObj.getUTCMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getUTCDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  // Para outros casos (horário local do servidor ou data criada localmente)
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Extrai ano, mês (1 a 12), dia e string 'YYYY-MM-DD' de forma segura e sem deslocamento de fuso.
 */
export function extrairAnoMesDia(
  d: Date | string | null | undefined,
): { ano: number; mes: number; dia: number; ymd: string } | null {
  const ymd = formatDataYYYYMMDD(d);
  if (!ymd) return null;
  const [y, m, day] = ymd.split('-');
  return { ano: Number(y), mes: Number(m), dia: Number(day), ymd };
}

/**
 * Converte 'YYYY-MM-DD' ou Date para um objeto Date à meia-noite local.
 * Garante que a data persista corretamente em colunas DATE no TypeORM/MySQL sem voltar 1 dia.
 */
export function parseDataParaDataLocal(d: Date | string | null | undefined): Date {
  const info = extrairAnoMesDia(d);
  if (!info) return new Date();
  return new Date(info.ano, info.mes - 1, info.dia);
}

import { somenteDigitos, validarCpf, validarCnpj } from './documento-brasil.util';

export function extrairCpfOuCnpjDoTexto(
  texto: string,
): { tipo: 'CPF' | 'CNPJ'; digitos: string; restoNome: string } | null {
  const raw = (texto || '').trim();
  if (!raw) return null;

  const mCnpjFmt = raw.match(/\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}/);
  if (mCnpjFmt) {
    const d = somenteDigitos(mCnpjFmt[0]);
    if (d.length === 14 && validarCnpj(d)) {
      return {
        tipo: 'CNPJ',
        digitos: d,
        restoNome: raw.replace(mCnpjFmt[0], ' ').replace(/\s+/g, ' ').trim(),
      };
    }
  }

  const mCpfFmt = raw.match(/\d{3}\.\d{3}\.\d{3}-\d{2}/);
  if (mCpfFmt) {
    const d = somenteDigitos(mCpfFmt[0]);
    if (d.length === 11 && validarCpf(d)) {
      return {
        tipo: 'CPF',
        digitos: d,
        restoNome: raw.replace(mCpfFmt[0], ' ').replace(/\s+/g, ' ').trim(),
      };
    }
  }

  const candidatos = raw.match(/\d{11,14}/g) || [];
  for (const block of candidatos) {
    if (block.length === 14 && validarCnpj(block)) {
      return {
        tipo: 'CNPJ',
        digitos: block,
        restoNome: raw.replace(block, ' ').replace(/\s+/g, ' ').trim(),
      };
    }
  }
  for (const block of candidatos) {
    if (block.length === 11 && validarCpf(block)) {
      return {
        tipo: 'CPF',
        digitos: block,
        restoNome: raw.replace(block, ' ').replace(/\s+/g, ' ').trim(),
      };
    }
  }

  return null;
}

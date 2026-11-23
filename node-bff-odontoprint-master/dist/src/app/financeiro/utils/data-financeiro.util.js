"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatDataYYYYMMDD = formatDataYYYYMMDD;
exports.extrairAnoMesDia = extrairAnoMesDia;
exports.parseDataParaDataLocal = parseDataParaDataLocal;
function formatDataYYYYMMDD(d) {
    if (!d)
        return '';
    if (typeof d === 'string') {
        const s = d.trim();
        const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
        if (m) {
            return `${m[1]}-${m[2]}-${m[3]}`;
        }
    }
    const dateObj = d instanceof Date ? d : new Date(d);
    if (isNaN(dateObj.getTime()))
        return '';
    if (dateObj.getUTCHours() === 0 &&
        dateObj.getUTCMinutes() === 0 &&
        dateObj.getUTCSeconds() === 0 &&
        dateObj.getUTCMilliseconds() === 0) {
        const y = dateObj.getUTCFullYear();
        const m = String(dateObj.getUTCMonth() + 1).padStart(2, '0');
        const day = String(dateObj.getUTCDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
    }
    const y = dateObj.getFullYear();
    const m = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}
function extrairAnoMesDia(d) {
    const ymd = formatDataYYYYMMDD(d);
    if (!ymd)
        return null;
    const [y, m, day] = ymd.split('-');
    return { ano: Number(y), mes: Number(m), dia: Number(day), ymd };
}
function parseDataParaDataLocal(d) {
    const info = extrairAnoMesDia(d);
    if (!info)
        return new Date();
    return new Date(info.ano, info.mes - 1, info.dia);
}
//# sourceMappingURL=data-financeiro.util.js.map
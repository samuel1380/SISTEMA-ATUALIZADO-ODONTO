"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatDataYYYYMMDD = formatDataYYYYMMDD;
exports.extrairAnoMesDia = extrairAnoMesDia;
exports.parseDataParaDataLocal = parseDataParaDataLocal;
function formatDataYYYYMMDD(d) {
    var _a, _b, _c;
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
    const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/Sao_Paulo',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).formatToParts(dateObj);
    const y = (_a = parts.find((p) => p.type === 'year')) === null || _a === void 0 ? void 0 : _a.value;
    const m = (_b = parts.find((p) => p.type === 'month')) === null || _b === void 0 ? void 0 : _b.value;
    const day = (_c = parts.find((p) => p.type === 'day')) === null || _c === void 0 ? void 0 : _c.value;
    if (y && m && day) {
        return `${y}-${m}-${day}`;
    }
    const yf = dateObj.getFullYear();
    const mf = String(dateObj.getMonth() + 1).padStart(2, '0');
    const dayf = String(dateObj.getDate()).padStart(2, '0');
    return `${yf}-${mf}-${dayf}`;
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
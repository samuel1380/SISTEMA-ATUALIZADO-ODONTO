"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.somenteDigitos = somenteDigitos;
exports.validarCpf = validarCpf;
exports.validarCnpj = validarCnpj;
function somenteDigitos(s) {
    return (s || '').replace(/\D/g, '');
}
function validarCpf(d) {
    if (!d || d.length !== 11 || /^(\d)\1{10}$/.test(d))
        return false;
    let s = 0;
    for (let i = 0; i < 9; i++)
        s += parseInt(d[i], 10) * (10 - i);
    let r = (s * 10) % 11;
    if (r === 10)
        r = 0;
    if (r !== parseInt(d[9], 10))
        return false;
    s = 0;
    for (let i = 0; i < 10; i++)
        s += parseInt(d[i], 10) * (11 - i);
    r = (s * 10) % 11;
    if (r === 10)
        r = 0;
    return r === parseInt(d[10], 10);
}
function validarCnpj(d) {
    if (!d || d.length !== 14 || /^(\d)\1{13}$/.test(d))
        return false;
    const pesos1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const pesos2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    let s = 0;
    for (let i = 0; i < 12; i++)
        s += parseInt(d[i], 10) * pesos1[i];
    let r = s % 11;
    const d1 = r < 2 ? 0 : 11 - r;
    if (d1 !== parseInt(d[12], 10))
        return false;
    s = 0;
    for (let i = 0; i < 13; i++)
        s += parseInt(d[i], 10) * pesos2[i];
    r = s % 11;
    const d2 = r < 2 ? 0 : 11 - r;
    return d2 === parseInt(d[13], 10);
}
//# sourceMappingURL=documento-brasil.util.js.map
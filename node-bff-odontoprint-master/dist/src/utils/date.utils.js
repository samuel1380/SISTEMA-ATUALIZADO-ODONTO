"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateDate = exports.newDateMonthDayYear = exports.transformString2Date = exports.fimDoDia = exports.inicioDoDia = void 0;
const inicioDoDia = data => {
    const r = new Date(data.getTime());
    r.setMilliseconds(0);
    r.setSeconds(0);
    r.setMinutes(0);
    r.setHours(0);
    return r;
};
exports.inicioDoDia = inicioDoDia;
const fimDoDia = data => {
    const r = new Date(data.getTime());
    r.setMilliseconds(999);
    r.setSeconds(59);
    r.setMinutes(59);
    r.setHours(23);
    return r;
};
exports.fimDoDia = fimDoDia;
const transformString2Date = (date) => {
    if (typeof date !== 'string') {
        return date;
    }
    return new Date(date);
};
exports.transformString2Date = transformString2Date;
const newDateMonthDayYear = () => {
    const date = new Date();
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const dateFormated = `${month}/${day}/${year}`;
    return dateFormated;
};
exports.newDateMonthDayYear = newDateMonthDayYear;
const validateDate = (date) => {
    const dateValue = new Date(date);
    if (dateValue instanceof Date && !isNaN(dateValue.getTime())) {
        return true;
    }
    return false;
};
exports.validateDate = validateDate;
//# sourceMappingURL=date.utils.js.map
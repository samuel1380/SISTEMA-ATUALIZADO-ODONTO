export const inicioDoDia = data => {
  const r = new Date(data.getTime());
  r.setMilliseconds(0);
  r.setSeconds(0);
  r.setMinutes(0);
  r.setHours(0);
  return r;
};

export const fimDoDia = data => {
  const r = new Date(data.getTime());
  r.setMilliseconds(999);
  r.setSeconds(59);
  r.setMinutes(59);
  r.setHours(23);
  return r;
};

export const transformString2Date = (date: string): Date => {
  if (typeof date !== 'string') {
    return date;
  }
  return new Date(date);
};

export const addDays = (date: Date, days: number): Date => {
  date.setDate(date.getDate() + days);
  return date;
}

export const validateDate = (date: string | Date) => {
  const dateValue = new Date(date);
    if (dateValue instanceof Date && !isNaN(dateValue.getTime())) {
      return true
      }
    return false
}

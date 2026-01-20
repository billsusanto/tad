export function getTodayUTC(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
}

export function toUTCMidnight(date: Date): Date {
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
}

export function isSameDayUTC(date1: Date, date2: Date): boolean {
  const d1 = toUTCMidnight(date1);
  const d2 = toUTCMidnight(date2);
  return d1.getTime() === d2.getTime();
}

export function addDaysUTC(date: Date, days: number): Date {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

export function getStartOfWeekUTC(date: Date): Date {
  const d = toUTCMidnight(date);
  const day = d.getUTCDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setUTCDate(d.getUTCDate() + diff);
  return d;
}

export function getDayOfWeekUTC(date: Date): number {
  const day = date.getUTCDay();
  return day === 0 ? 6 : day - 1;
}

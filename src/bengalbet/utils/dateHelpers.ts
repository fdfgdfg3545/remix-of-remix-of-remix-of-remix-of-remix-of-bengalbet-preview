// @ts-nocheck
/**
 * Dynamic Date & Currency Helpers for Bengali Betting, Account, and Profit/Loss Records
 */

export const formatDateYYYYMMDD = (d: Date): string => {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

export const getTodayStr = (): string => {
  return formatDateYYYYMMDD(new Date());
};

export const getYesterdayStr = (): string => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return formatDateYYYYMMDD(d);
};

export const getDaysAgoStr = (days: number): string => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return formatDateYYYYMMDD(d);
};

export const formatRangeDisplay = (startDate: string, endDate: string): string => {
  if (!startDate || !endDate) return '';
  const startMMDD = startDate.length >= 10 ? startDate.substring(5).replace('-', '/') : startDate;
  const endMMDD = endDate.length >= 10 ? endDate.substring(5).replace('-', '/') : endDate;
  return `${startMMDD}- ${endMMDD}`;
};

export const formatCurrency = (val: number, showDecimal: boolean = true): string => {
  if (isNaN(val)) return '0.00';
  if (showDecimal) {
    return Math.abs(val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  return Math.abs(Math.round(val)).toLocaleString('en-US');
};

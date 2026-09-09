/**
 * Formatters for Numbers, Currencies, and Dates in Bangla & English
 */
import { Language } from '../types';

const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];

export function toBanglaDigits(numStr: string | number): string {
  return String(numStr).replace(/\d/g, (d) => bnDigits[parseInt(d, 10)]);
}

export function formatCurrency(amount: number, lang: Language = 'en'): string {
  const isNegative = typeof amount === 'number' && amount < 0;
  const absAmount = Math.abs(amount || 0);
  const formatted = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(absAmount);

  if (lang === 'bn') {
    return isNegative ? `-৳ ${toBanglaDigits(formatted)}` : `৳ ${toBanglaDigits(formatted)}`;
  }
  return isNegative ? `-৳ ${formatted}` : `৳ ${formatted}`;
}

export function formatDate(dateString: string, lang: Language = 'en'): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  const formatted = `${day}-${month}-${year}`;
  return lang === 'bn' ? toBanglaDigits(formatted) : formatted;
}

export function formatDisplayDate(dateString: string, lang: Language = 'en'): string {
  return formatDate(dateString, lang);
}

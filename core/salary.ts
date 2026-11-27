// One salary line for every job card. The feed and the Duda "Jobs" collection send salaryText as the recruiter's
// extra wording only ("+ super", "per hour + super", "base + $180,000 OTE"); the amount lives in salaryFrom and
// salaryTo. Showing salaryText on its own is how cards ended up reading "+ super" with no figure (Demo 3, 27 Nov 2026).

type Row = Record<string, unknown> | null | undefined;

const SYMBOLS: Record<string, string> = { AUD: '$', USD: '$', NZD: '$', CAD: '$', SGD: '$', HKD: '$', GBP: '£', EUR: '€', INR: '₹', JPY: '¥', ZAR: 'R' };

/** Hours, days, weeks and months in a working year, to compare pay types when sorting. */
const PER_YEAR: Record<string, number> = { hourly: 1976, daily: 230, weekly: 52, monthly: 12 };
const UNIT: Record<string, string> = { hourly: 'per hour', daily: 'per day', weekly: 'per week', monthly: 'per month' };

/** Wording that only makes sense after an amount: "+ super", "per hour", "plus bonus", "base + OTE", "pro rata". */
const SUFFIX_RE = /^(\+|&|per\b|plus\b|pro[\s-]?rata\b|base\b|p\.?\s?[ahdw]\.?(\s|$)|inc\.?\b|incl\.?\b|including\b|ote\b|\()/i;

function str(v: unknown): string {
  if (typeof v === 'string') return v.trim();
  if (typeof v === 'number' && Number.isFinite(v)) return String(v);
  return '';
}

/** The feed uses -1 or null for "no amount", so zero and below are no amount. */
function amount(v: unknown): number {
  const n = parseFloat(str(v).replace(/[^0-9.-]/g, ''));
  return Number.isFinite(n) && n > 0 ? n : 0;
}

function isHidden(f: Record<string, unknown>): boolean {
  return f.isDisplaySalary === false || str(f.isDisplaySalary).toLowerCase() === 'false';
}

function ends(f: Record<string, unknown>): { from: number; to: number } {
  return { from: amount(f.salaryFrom) || amount(f.realSalaryFrom), to: amount(f.salaryTo) || amount(f.realSalaryTo) };
}

function symbolFor(f: Record<string, unknown>): string {
  const code = (str(f.currencyCode) || str(f.salaryCurrency) || str(f.currency)).toUpperCase();
  if (SYMBOLS[code]) return SYMBOLS[code];
  const given = str(f.currencySymbol);
  if (given && !/^[A-Za-z]{3}$/.test(given)) return given;
  if (/^[A-Z]{3}$/.test(code)) return `${code} `;
  return '';
}

function money(n: number, symbol: string): string {
  const cents = Math.round(n * 100) % 100 !== 0;
  const digits = cents ? 2 : 0;
  return `${symbol}${n.toLocaleString('en-AU', { minimumFractionDigits: digits, maximumFractionDigits: digits })}`;
}

/** "$150,000 – $170,000", one figure when only one end is set or both match, "" when there is no amount. */
export function salaryRange(row: Row): string {
  if (!row || typeof row !== 'object') return '';
  const { from, to } = ends(row);
  const symbol = symbolFor(row);
  if (from && to && from !== to) return `${money(Math.min(from, to), symbol)} – ${money(Math.max(from, to), symbol)}`;
  const one = from || to;
  return one ? money(one, symbol) : '';
}

/** Figures written in the wording, with "150k" read as 150000. */
function figuresIn(wording: string): number[] {
  return [...wording.matchAll(/(\d[\d,]*(?:\.\d+)?)\s*(k\b)?/gi)].map((m) => parseFloat(m[1].replace(/,/g, '')) * (m[2] ? 1000 : 1));
}

/** The salary line for a card: amount plus the recruiter's wording, the wording alone when it already states the amount, or "". */
export function payLine(row: Row): string {
  if (!row || typeof row !== 'object' || isHidden(row)) return '';
  const wording = str(row.salaryText);
  const range = salaryRange(row);
  if (!range) return wording && !SUFFIX_RE.test(wording) ? wording : '';
  if (!wording) {
    const unit = UNIT[str(row.salaryType).toLowerCase()];
    return unit ? `${range} ${unit}` : range;
  }
  const { from, to } = ends(row);
  if (figuresIn(wording).some((n) => n === from || n === to)) return wording;
  return `${range} ${wording}`;
}

/** Top of the pay range as a yearly figure, for sorting by salary. 0 when there is no amount or it is hidden. */
export function annualPay(row: Row): number {
  if (!row || typeof row !== 'object' || isHidden(row)) return 0;
  const { from, to } = ends(row);
  const top = Math.max(from, to);
  return top * (PER_YEAR[str(row.salaryType).toLowerCase()] ?? 1);
}

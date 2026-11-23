// Content Editor settings for the UK Salary Calculator. Duda hands every value over as a string
// (its docs say toggles arrive as booleans), so each reader accepts both and falls back to a default.
// A blank text field is not sent at all, so a missing or blank label uses its default wording.

import type { DudaData } from '../../core/config';
import { clampNum, PAY_PERIODS, TAX_CONFIG, type PayPeriod } from './tax';

export const DEFAULT_LABELS = {
  title: 'UK Salary Calculator',
  intro: 'Work out your take-home pay. Rates are for the {taxYear} tax year.',
  payHeading: 'Your pay',
  payAmountLabel: 'Pay amount (£)',
  payPeriodLabel: 'Pay period',
  periodHourly: 'Hourly',
  periodDaily: 'Daily',
  periodWeekly: 'Weekly',
  periodMonthly: 'Monthly',
  periodAnnual: 'Annual',
  hoursLabel: 'Hours per week',
  daysLabel: 'Days per week',
  taxOptionsTitle: 'Tax options',
  scottishLabel: 'I pay Scottish income tax',
  studentLoanLabel: 'Student loan',
  loanNone: 'None',
  loanPlan1: 'Plan 1',
  loanPlan2: 'Plan 2',
  loanPlan4: 'Plan 4',
  loanPlan5: 'Plan 5',
  loanPostgrad: 'Postgraduate',
  loanPlan1Pg: 'Plan 1 and Postgraduate',
  loanPlan2Pg: 'Plan 2 and Postgraduate',
  loanPlan4Pg: 'Plan 4 and Postgraduate',
  loanPlan5Pg: 'Plan 5 and Postgraduate',
  pensionLabel: 'Pension contribution (% of salary)',
  pensionHelp: 'Taken from your pay before tax and National Insurance (salary sacrifice).',
  calcButton: 'Calculate',
  resultsHeading: 'Your estimated pay',
  tilesHeading: 'Take-home pay',
  colYear: 'Year',
  colMonth: 'Month',
  colWeek: 'Week',
  colDay: 'Day',
  rowGross: 'Gross pay',
  rowPension: 'Pension',
  rowIncomeTax: 'Income tax',
  rowNI: 'National Insurance',
  rowStudentLoan: 'Student loan',
  rowTakeHome: 'Take-home pay',
  errorAmount: 'Enter a pay amount greater than zero.',
  errorHours: 'Enter hours per week between 1 and 168.',
  errorDays: 'Enter days per week between 1 and 7.',
  taxYearNote: 'Based on {taxYear} tax rates.',
  disclaimerText:
    'This calculator is a guide only. It estimates take-home pay from the standard {taxYear} UK rates and does not allow for your tax code, other income, benefits or other deductions. Your actual pay may differ. It is not tax or financial advice.',
} as const;

export type LabelKey = keyof typeof DEFAULT_LABELS;

export const MAX_AMOUNT = 1e9;
const MIN_HOURS = 1;
const MAX_HOURS = 168;
const MIN_DAYS = 1;
const MAX_DAYS = 7;
const DEFAULT_HOURS = 37.5;
const DEFAULT_DAYS = 5;

export interface Settings {
  labels: Readonly<Record<LabelKey, string>>;
  showGroup: boolean;
  showScottish: boolean;
  showLoan: boolean;
  showPension: boolean;
  showBreakdown: boolean;
  defaultPeriod: PayPeriod;
  defaultHours: number;
  defaultDays: number;
  defaultAmount: number;
}

type Config = Record<string, unknown>;

function toBool(value: unknown, fallback: boolean): boolean {
  if (value === true || value === 'true') return true;
  if (value === false || value === 'false') return false;
  return fallback;
}

function toNum(value: unknown, fallback: number, min: number, max: number): number {
  const n = typeof value === 'number' ? value : parseFloat(String(value));
  return Number.isNaN(n) ? fallback : clampNum(n, min, max);
}

function label(config: Config, key: LabelKey): string {
  const value = config[key];
  const text = typeof value === 'string' && value.trim() ? value : DEFAULT_LABELS[key];
  return text.split('{taxYear}').join(TAX_CONFIG.taxYear);
}

export function readSettings(data: DudaData | undefined): Settings {
  const config: Config = data?.config ?? {};
  const labels = {} as Record<LabelKey, string>;
  for (const key of Object.keys(DEFAULT_LABELS) as LabelKey[]) labels[key] = label(config, key);
  const period = String(config.defaultPeriod ?? '').toLowerCase();
  return {
    labels,
    showGroup: toBool(config.showTaxOptions, true),
    showScottish: toBool(config.showScottish, true),
    showLoan: toBool(config.showStudentLoan, true),
    showPension: toBool(config.showPension, true),
    showBreakdown: toBool(config.showTaxBreakdown, true),
    defaultPeriod: (PAY_PERIODS as readonly string[]).includes(period) ? (period as PayPeriod) : 'annual',
    defaultHours: toNum(config.defaultHours, DEFAULT_HOURS, MIN_HOURS, MAX_HOURS),
    defaultDays: toNum(config.defaultDays, DEFAULT_DAYS, MIN_DAYS, MAX_DAYS),
    defaultAmount: toNum(config.defaultAmount, 0, 0, MAX_AMOUNT),
  };
}

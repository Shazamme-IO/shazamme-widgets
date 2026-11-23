// Content Editor settings for the AU Salary Calculator. Duda hands every value over as a string
// (its docs say toggles arrive as booleans), so each reader accepts both and falls back to a default.
// A blank text field is not sent at all, so a missing or blank label uses its default wording.

import type { DudaData } from '../../core/config';
import { clampNum, PAY_PERIODS, TAX_CONFIG, type PayPeriod } from './tax';

export const DEFAULT_LABELS = {
  title: 'AU Salary Calculator',
  intro: 'Work out your take-home pay. Rates are for the {taxYear} financial year.',
  payHeading: 'Your pay',
  payAmountLabel: 'Pay amount ($)',
  payPeriodLabel: 'Pay period',
  periodHourly: 'Hourly',
  periodDaily: 'Daily',
  periodWeekly: 'Weekly',
  periodMonthly: 'Monthly',
  periodAnnual: 'Annual',
  hoursLabel: 'Hours per week',
  daysLabel: 'Days per week',
  taxOptionsTitle: 'Tax options',
  residencyLabel: 'Tax residency',
  residencyResident: 'Australian resident',
  residencyForeign: 'Foreign resident',
  residencyWhm: 'Working holiday maker',
  helpLabel: 'I have a HELP or study loan',
  superIncludedLabel: 'My package includes super',
  superIncludedHelp: 'The amount I entered already includes employer super. It is taken out before tax.',
  calcButton: 'Calculate',
  resultsHeading: 'Your estimated pay',
  tilesHeading: 'Take-home pay',
  colYear: 'Year',
  colMonth: 'Month',
  colFortnight: 'Fortnight',
  colDay: 'Day',
  rowGross: 'Gross salary',
  rowIncomeTax: 'Income tax',
  rowMedicare: 'Medicare levy',
  rowHelp: 'HELP or study loan repayment',
  rowTakeHome: 'Take-home pay',
  rowSuper: 'Employer super ({superRate}, paid on top)',
  rowPackage: 'Total package (including super)',
  errorAmount: 'Enter a pay amount greater than zero.',
  errorHours: 'Enter hours per week between 1 and 168.',
  errorDays: 'Enter days per week between 1 and 7.',
  taxYearNote: 'Based on {taxYear} tax rates.',
  disclaimerText:
    'This calculator is a guide only. It estimates take-home pay from the standard {taxYear} Australian rates and does not allow for the Medicare levy surcharge, family or senior thresholds, other offsets, salary sacrifice, bonuses or other income. Your actual pay may differ. Some {taxYear} thresholds are still awaiting final legislation. It is not tax or financial advice.',
} as const;

export type LabelKey = keyof typeof DEFAULT_LABELS;

export const MAX_AMOUNT = 1e9;
const MIN_HOURS = 1;
const MAX_HOURS = 168;
const MIN_DAYS = 1;
const MAX_DAYS = 7;
const DEFAULT_HOURS = 38;
const DEFAULT_DAYS = 5;

export interface Settings {
  labels: Readonly<Record<LabelKey, string>>;
  showGroup: boolean;
  showResidency: boolean;
  showHelp: boolean;
  showSuperIncluded: boolean;
  showSuper: boolean;
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
  return text.split('{taxYear}').join(TAX_CONFIG.taxYear).split('{superRate}').join(`${Math.round(TAX_CONFIG.superRate * 10000) / 100}%`);
}

export function readSettings(data: DudaData | undefined): Settings {
  const config: Config = data?.config ?? {};
  const labels = {} as Record<LabelKey, string>;
  for (const key of Object.keys(DEFAULT_LABELS) as LabelKey[]) labels[key] = label(config, key);
  const period = String(config.defaultPeriod ?? '').toLowerCase();
  return {
    labels,
    showGroup: toBool(config.showTaxOptions, true),
    showResidency: toBool(config.showResidency, true),
    showHelp: toBool(config.showHelp, true),
    showSuperIncluded: toBool(config.showSuperIncluded, true),
    showSuper: toBool(config.showSuper, true),
    showBreakdown: toBool(config.showTaxBreakdown, true),
    defaultPeriod: (PAY_PERIODS as readonly string[]).includes(period) ? (period as PayPeriod) : 'annual',
    defaultHours: toNum(config.defaultHours, DEFAULT_HOURS, MIN_HOURS, MAX_HOURS),
    defaultDays: toNum(config.defaultDays, DEFAULT_DAYS, MIN_DAYS, MAX_DAYS),
    defaultAmount: toNum(config.defaultAmount, 0, 0, MAX_AMOUNT),
  };
}

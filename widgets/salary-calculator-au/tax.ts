// AU take-home pay maths: pure functions and one yearly TAX_CONFIG, no DOM, no Shazamme SDK.
// Update TAX_CONFIG every 1 July (tax.test.ts pins the worked examples and fails until the new
// figures and their hand-checked results are entered). Two 2026-27 figures are still UNCONFIRMED, flagged below.

export interface TaxBand {
  readonly upTo: number;
  readonly rate: number;
}

export const TAX_CONFIG = {
  taxYear: '2026-27',
  currency: 'AUD',
  locale: 'en-AU',
  weeksPerYear: 52,
  fortnightsPerYear: 26,
  monthsPerYear: 12,
  // Resident rates 2026-27 (0 to 18,200 nil; 15c to 45,000; 30c to 135,000; 37c to 190,000; 45c over).
  // https://www.ato.gov.au/tax-rates-and-codes/tax-rates-australian-residents (updated 13 Aug 2026)
  residentBands: [
    { upTo: 18200, rate: 0 },
    { upTo: 45000, rate: 0.15 },
    { upTo: 135000, rate: 0.3 },
    { upTo: 190000, rate: 0.37 },
    { upTo: Infinity, rate: 0.45 }
  ],
  // UNCONFIRMED for 2026-27 (rechecked 16 Nov 2026): the ATO annual foreign resident table still ends at 2025-26
  // (0 to 135,000 at 30c, 37c to 190,000, 45c over). The 1 July 2026 cut applies only to the resident first band, and
  // the 2026-27 weekly withholding table keeps the same 30c first band.
  // https://www.ato.gov.au/tax-rates-and-codes/tax-rates-foreign-residents
  // https://www.ato.gov.au/tax-rates-and-codes/tax-table-weekly
  foreignResidentBands: [
    { upTo: 135000, rate: 0.3 },
    { upTo: 190000, rate: 0.37 },
    { upTo: Infinity, rate: 0.45 }
  ],
  // Working holiday makers 2026-27 (Schedule 15 Table A: 15c to 45,000; 30c to 135,000; 37c to 190,000; 45c over).
  // https://www.ato.gov.au/tax-rates-and-codes/schedule-15-tax-table-for-working-holiday-makers
  workingHolidayBands: [
    { upTo: 45000, rate: 0.15 },
    { upTo: 135000, rate: 0.3 },
    { upTo: 190000, rate: 0.37 },
    { upTo: Infinity, rate: 0.45 }
  ],
  // Low income tax offset, residents only, not refundable. The ATO page names no income year.
  // https://www.ato.gov.au/individuals-and-families/income-deductions-offsets-and-records/tax-offsets/low-income-tax-offset
  lito: { max: 700, firstEnd: 37500, firstRate: 0.05, midStart: 45000, midValue: 325, midRate: 0.015, end: 66667 },
  // Medicare levy 2%: https://www.ato.gov.au/tax-rates-and-codes/tax-rates-australian-residents
  // Foreign residents do not pay it: https://www.ato.gov.au/tax-rates-and-codes/tax-rates-foreign-residents
  // UNCONFIRMED for 2026-27 (rechecked 16 Nov 2026): 28,011 is the singles threshold announced in the 12 May 2026
  // Budget; the ATO notes the measure was not yet law when it published the figure. Update if the final figure differs.
  // https://www.ato.gov.au/individuals-and-families/medicare-and-private-health-insurance/medicare-levy/medicare-levy-reduction/medicare-levy-reduction-for-low-income-earners
  // The 10c phase-in rate is the ATO's published shade-in (not on the fetched page; consistent with upper = lower x 1.25).
  medicare: { rate: 0.02, lowerThreshold: 28011, upperThreshold: 35013, phaseInRate: 0.1 },
  // HELP and other study loans, marginal repayments from 2025-26, 2026-27 thresholds.
  // https://www.ato.gov.au/tax-rates-and-codes/study-and-training-support-loans-rates-and-repayment-thresholds
  help: {
    minThreshold: 69528,
    firstRate: 0.15, // 15c per $1 over 69,528 up to 129,717
    secondStart: 129717,
    secondBase: 9028,
    secondRate: 0.17, // 9,028 plus 17c per $1 over 129,717 up to 186,050
    topStart: 186050,
    topRate: 0.1 // 10% of total repayment income above 186,050
  },
  // Super guarantee 12% from 1 July 2025 (still 12.00 for 1 July 2026 to 30 June 2027).
  // https://www.ato.gov.au/tax-rates-and-codes/key-superannuation-rates-and-thresholds/super-guarantee
  superRate: 0.12,
  maxSuperBase: 270830 // maximum contribution base 2026-27, annual. Same page, Table 23.
};

export type TaxConfig = typeof TAX_CONFIG;

export const RESIDENCIES = ['resident', 'foreign', 'whm'] as const;
export type Residency = (typeof RESIDENCIES)[number];

export const PAY_PERIODS = ['hourly', 'daily', 'weekly', 'monthly', 'annual'] as const;
export type PayPeriod = (typeof PAY_PERIODS)[number];

export interface AuTaxInput {
  annualAmount: number;
  packageIncludesSuper: boolean;
  residency: string;
  help: boolean;
}

export interface AuTaxResult {
  gross: number;
  totalPackage: number;
  superAmount: number;
  incomeTax: number;
  medicare: number;
  help: number;
  net: number;
}

export interface PeriodAmounts {
  year: number;
  month: number;
  fortnight: number;
  day: number;
}

export function round2(n: number): number {
  return Math.round((n + 1e-9) * 100) / 100;
}

export function clampNum(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

function applyBands(taxable: number, bands: readonly TaxBand[]): number {
  let tax = 0;
  let lower = 0;
  for (let i = 0; i < bands.length && taxable > lower; i++) {
    tax += (Math.min(taxable, bands[i].upTo) - lower) * bands[i].rate;
    lower = bands[i].upTo;
  }
  return tax;
}

export function annualFromPay(amount: number, period: string, hoursPerWeek: number, daysPerWeek: number, config: TaxConfig): number {
  const a = Math.max(0, Number(amount) || 0);
  const weeks = config.weeksPerYear;
  if (period === 'hourly') return a * hoursPerWeek * weeks;
  if (period === 'daily') return a * daysPerWeek * weeks;
  if (period === 'weekly') return a * weeks;
  if (period === 'monthly') return a * config.monthsPerYear;
  return a;
}

export function perPeriod(annual: number, daysPerWeek: number, config: TaxConfig): PeriodAmounts {
  return {
    year: annual,
    month: annual / config.monthsPerYear,
    fortnight: annual / config.fortnightsPerYear,
    day: annual / (config.weeksPerYear * daysPerWeek),
  };
}

export function litoFor(income: number, c: TaxConfig): number {
  const l = c.lito;
  if (income <= l.firstEnd) return l.max;
  if (income <= l.midStart) return l.max - (income - l.firstEnd) * l.firstRate;
  if (income <= l.end) return l.midValue - (income - l.midStart) * l.midRate;
  return 0;
}

export function medicareFor(income: number, c: TaxConfig): number {
  const m = c.medicare;
  if (income <= m.lowerThreshold) return 0;
  return Math.min(income * m.rate, (income - m.lowerThreshold) * m.phaseInRate);
}

export function helpFor(income: number, c: TaxConfig): number {
  const h = c.help;
  if (income <= h.minThreshold) return 0;
  if (income <= h.secondStart) return (income - h.minThreshold) * h.firstRate;
  if (income <= h.topStart) return h.secondBase + (income - h.secondStart) * h.secondRate;
  return income * h.topRate;
}

export function calculateAuTax(input: AuTaxInput, config: TaxConfig = TAX_CONFIG): AuTaxResult {
  const amount = Math.max(0, Number(input.annualAmount) || 0);
  const rate = config.superRate;
  const cap = config.maxSuperBase;
  let salary = amount;
  if (input.packageIncludesSuper) {
    salary = amount / (1 + rate);
    if (salary > cap) salary = amount - rate * cap;
  }
  const superAmount = round2(Math.min(salary, cap) * rate);
  const residency: Residency = input.residency === 'foreign' || input.residency === 'whm' ? input.residency : 'resident';
  const bands = residency === 'foreign' ? config.foreignResidentBands : residency === 'whm' ? config.workingHolidayBands : config.residentBands;
  let tax = applyBands(salary, bands);
  if (residency === 'resident') tax = Math.max(0, tax - litoFor(salary, config));
  const incomeTax = round2(tax);
  const medicare = residency === 'resident' ? round2(medicareFor(salary, config)) : 0;
  const help = input.help ? round2(helpFor(salary, config)) : 0;
  return {
    gross: round2(salary),
    totalPackage: round2(salary + superAmount),
    superAmount,
    incomeTax,
    medicare,
    help,
    net: round2(salary - incomeTax - medicare - help),
  };
}

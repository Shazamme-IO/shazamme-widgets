// UK take-home pay maths: pure functions and one yearly TAX_CONFIG, no DOM, no Shazamme SDK.
// Update TAX_CONFIG every 6 April (tax.test.ts pins the worked examples and fails until the new
// figures and their hand-checked results are entered).

export interface TaxBand {
  readonly upTo: number;
  readonly rate: number;
}

export interface StudentLoanPlan {
  readonly threshold: number;
  readonly rate: number;
}

export const TAX_CONFIG = {
  taxYear: '2026/27',
  currency: 'GBP',
  locale: 'en-GB',
  weeksPerYear: 52,
  monthsPerYear: 12,
  // Sources, all fetched 16 Nov 2026:
  //   Income tax rates and PA taper: https://www.gov.uk/income-tax-rates
  //   Scottish bands: https://www.mygov.scot/scottish-income-tax/current-income-tax-rates
  //     (limits there include the 12,570 allowance; the bands below are on taxable income, so each is that limit minus 12,570,
  //      matching https://www.gov.scot/publications/scottish-rate-resolution-2026-2027-draft-motion-explanatory-note/pages/2/)
  //   NI and student loans: https://www.gov.uk/guidance/rates-and-thresholds-for-employers-2026-to-2027
  personalAllowance: 12570, // https://www.gov.uk/income-tax-rates
  taperStart: 100000, // PA drops GBP 1 for every GBP 2 above this; zero at 125,140. https://www.gov.uk/income-tax-rates
  taperRate: 0.5,
  // England, Wales and Northern Ireland. upTo is taxable income (after the allowance). https://www.gov.uk/income-tax-rates
  rUKBands: [
    { upTo: 37700, rate: 0.2 }, // basic 12,571 to 50,270
    { upTo: 125140, rate: 0.4 }, // higher 50,271 to 125,140
    { upTo: Infinity, rate: 0.45 }, // additional over 125,140
  ] as readonly TaxBand[],
  // Scotland. https://www.mygov.scot/scottish-income-tax/current-income-tax-rates
  scotlandBands: [
    { upTo: 3967, rate: 0.19 }, // starter, to 16,537
    { upTo: 16956, rate: 0.2 }, // basic, to 29,526
    { upTo: 31092, rate: 0.21 }, // intermediate, to 43,662
    { upTo: 62430, rate: 0.42 }, // higher, to 75,000
    { upTo: 125140, rate: 0.45 }, // advanced, to 125,140
    { upTo: Infinity, rate: 0.48 }, // top
  ] as readonly TaxBand[],
  // Employee Class 1 NI, category A. https://www.gov.uk/guidance/rates-and-thresholds-for-employers-2026-to-2027
  ni: { primaryThreshold: 12570, upperEarningsLimit: 50270, mainRate: 0.08, upperRate: 0.02 },
  // https://www.gov.uk/guidance/rates-and-thresholds-for-employers-2026-to-2027
  studentLoans: {
    plan1: { threshold: 26900, rate: 0.09 },
    plan2: { threshold: 29385, rate: 0.09 },
    plan4: { threshold: 33795, rate: 0.09 },
    plan5: { threshold: 25000, rate: 0.09 },
    postgrad: { threshold: 21000, rate: 0.06 },
  } as Readonly<Record<string, StudentLoanPlan>>,
  // An undergraduate plan repaid alongside a Postgraduate loan: each is worked out on its own and added.
  combinedLoans: {
    plan1pg: ['plan1', 'postgrad'],
    plan2pg: ['plan2', 'postgrad'],
    plan4pg: ['plan4', 'postgrad'],
    plan5pg: ['plan5', 'postgrad'],
  } as Readonly<Record<string, readonly string[]>>,
};

export type TaxConfig = typeof TAX_CONFIG;

export const LOAN_CHOICES = ['none', 'plan1', 'plan2', 'plan4', 'plan5', 'postgrad', 'plan1pg', 'plan2pg', 'plan4pg', 'plan5pg'] as const;
export type LoanChoice = (typeof LOAN_CHOICES)[number];

export const PAY_PERIODS = ['hourly', 'daily', 'weekly', 'monthly', 'annual'] as const;
export type PayPeriod = (typeof PAY_PERIODS)[number];

export interface UkTaxInput {
  annualGross: number;
  scottish: boolean;
  loan: string;
  pensionPercent: number;
}

export interface UkTaxResult {
  gross: number;
  pension: number;
  incomeTax: number;
  ni: number;
  studentLoan: number;
  net: number;
  personalAllowance: number;
}

export interface PeriodAmounts {
  year: number;
  month: number;
  week: number;
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
    week: annual / config.weeksPerYear,
    day: annual / (config.weeksPerYear * daysPerWeek),
  };
}

function loanPlans(loan: string, config: TaxConfig): readonly string[] {
  return Object.prototype.hasOwnProperty.call(config.combinedLoans, loan) ? config.combinedLoans[loan] : [loan];
}

export function calculateUkTax(input: UkTaxInput, config: TaxConfig = TAX_CONFIG): UkTaxResult {
  const gross = Math.max(0, Number(input.annualGross) || 0);
  const pensionPct = clampNum(Number(input.pensionPercent) || 0, 0, 100);
  const pension = round2((gross * pensionPct) / 100);
  const pay = gross - pension;
  let allowance = config.personalAllowance;
  if (pay > config.taperStart) allowance = Math.max(0, allowance - (pay - config.taperStart) * config.taperRate);
  const taxable = Math.max(0, pay - allowance);
  const incomeTax = round2(applyBands(taxable, input.scottish ? config.scotlandBands : config.rUKBands));
  const n = config.ni;
  const ni = round2(
    Math.max(0, Math.min(pay, n.upperEarningsLimit) - n.primaryThreshold) * n.mainRate +
      Math.max(0, pay - n.upperEarningsLimit) * n.upperRate,
  );
  let studentLoan = 0;
  for (const name of loanPlans(String(input.loan || 'none'), config)) {
    const plan = Object.prototype.hasOwnProperty.call(config.studentLoans, name) ? config.studentLoans[name] : null;
    if (plan) studentLoan += round2(Math.max(0, pay - plan.threshold) * plan.rate);
  }
  studentLoan = round2(studentLoan);
  return {
    gross: round2(gross),
    pension,
    incomeTax,
    ni,
    studentLoan,
    net: round2(gross - pension - incomeTax - ni - studentLoan),
    personalAllowance: round2(allowance),
  };
}

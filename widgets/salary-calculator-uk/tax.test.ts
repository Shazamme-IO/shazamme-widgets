// UK tax module: worked examples checked by hand against the published rate tables.

import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it, expect } from 'vitest';
import { TAX_CONFIG, calculateUkTax, annualFromPay, perPeriod } from './tax';

const SOURCE = readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'tax.ts'), 'utf8');
const tax = { TAX_CONFIG, calculateUkTax, annualFromPay, perPeriod };
const calc = (annualGross: number, extra: Record<string, unknown> = {}) =>
  tax.calculateUkTax({ annualGross, scottish: false, loan: 'none', pensionPercent: 0, ...extra }, tax.TAX_CONFIG);

describe('uk tax module, worked examples (2026/27, hand calculated from the rate tables)', () => {
  it('30,000: tax 20% over 12,570, NI 8% over 12,570', () => {
    const r = calc(30000);
    expect(r.incomeTax).toBe(3486); // (30000-12570) x 20%
    expect(r.ni).toBe(1394.4); // (30000-12570) x 8%
    expect(r.net).toBe(25119.6);
  });

  it('60,000: higher rate over 50,270, NI 2% over 50,270', () => {
    const r = calc(60000);
    expect(r.incomeTax).toBe(11432); // 37,700 x 20% + 9,730 x 40%
    expect(r.ni).toBe(3210.6); // 37,700 x 8% + 9,730 x 2%
    expect(r.net).toBe(45357.4);
  });

  it('125,000: allowance tapers to 70', () => {
    const r = calc(125000);
    expect(r.personalAllowance).toBe(70); // 12,570 - 12,500
    expect(r.incomeTax).toBe(42432); // 37,700 x 20% + 87,230 x 40%
    expect(r.ni).toBe(4510.6); // 3,016 + 74,730 x 2%
    expect(r.net).toBe(78057.4);
  });

  it('Scottish 45,000: six-band income tax', () => {
    const r = calc(45000, { scottish: true });
    expect(r.incomeTax).toBe(6882.05); // 3,967x19% + 12,989x20% + 14,136x21% + 1,338x42%
    expect(r.ni).toBe(2594.4);
    expect(r.net).toBe(35523.55);
  });

  it('Plan 2 at 35,000: 9% over 29,385', () => {
    const r = calc(35000, { loan: 'plan2' });
    expect(r.studentLoan).toBe(505.35);
    expect(r.incomeTax).toBe(4486);
    expect(r.ni).toBe(1794.4);
    expect(r.net).toBe(28214.25);
  });

  it('no allowance taper at exactly 100,000, and full taper at 125,140', () => {
    expect(calc(100000).incomeTax).toBe(27432);
    expect(calc(110000).personalAllowance).toBe(7570);
    expect(calc(110000).incomeTax).toBe(33432);
    expect(calc(125140).personalAllowance).toBe(0);
  });

  it('Postgraduate loan is 6% over 21,000 and Plan 1, 4 and 5 use their own thresholds', () => {
    expect(calc(40000, { loan: 'postgrad' }).studentLoan).toBe(1140);
    expect(calc(40000, { loan: 'plan1' }).studentLoan).toBe(1179);
    expect(calc(40000, { loan: 'plan4' }).studentLoan).toBe(558.45);
    expect(calc(40000, { loan: 'plan5' }).studentLoan).toBe(1350);
  });

  it('an undergraduate plan with a Postgraduate loan repays both', () => {
    // Plan 2: (40,000 - 29,385) x 9% = 955.35; Postgraduate: (40,000 - 21,000) x 6% = 1,140
    expect(calc(40000, { loan: 'plan2pg' }).studentLoan).toBe(2095.35);
    expect(calc(20000, { loan: 'plan1pg' }).studentLoan).toBe(0);
  });

  it('pension is a salary sacrifice taken before tax, NI and the student loan', () => {
    const r = calc(40000, { pensionPercent: 5 });
    expect(r.pension).toBe(2000);
    expect(r.incomeTax).toBe(5086);
    expect(r.ni).toBe(2034.4);
    expect(r.net).toBe(30879.6);
  });

  it('pays nothing below the allowance, and ignores bad input', () => {
    expect(calc(12000).incomeTax).toBe(0);
    expect(calc(12000).ni).toBe(0);
    expect(calc(-5).net).toBe(0);
    expect(calc(30000, { pensionPercent: 500 }).pension).toBe(30000);
  });

  it('turns every pay period into an annual figure and splits the year', () => {
    const c = tax.TAX_CONFIG;
    expect(tax.annualFromPay(20, 'hourly', 40, 5, c)).toBe(41600);
    expect(tax.annualFromPay(200, 'daily', 40, 5, c)).toBe(52000);
    expect(tax.annualFromPay(500, 'weekly', 40, 5, c)).toBe(26000);
    expect(tax.annualFromPay(3000, 'monthly', 40, 5, c)).toBe(36000);
    expect(tax.annualFromPay(36000, 'annual', 40, 5, c)).toBe(36000);
    expect(tax.perPeriod(52000, 5, c)).toEqual({ year: 52000, month: 52000 / 12, week: 1000, day: 200 });
  });

  it('keeps the tax year, the Scottish limits and the sources in TAX_CONFIG', () => {
    expect(tax.TAX_CONFIG.taxYear).toBe('2026/27');
    expect(tax.TAX_CONFIG.scotlandBands.map((b: any) => b.upTo + tax.TAX_CONFIG.personalAllowance).slice(0, 4)).toEqual([16537, 29526, 43662, 75000]);
    expect(SOURCE).toContain('https://www.mygov.scot/scottish-income-tax/current-income-tax-rates');
    expect(SOURCE).toContain('https://www.gov.uk/income-tax-rates');
  });
});


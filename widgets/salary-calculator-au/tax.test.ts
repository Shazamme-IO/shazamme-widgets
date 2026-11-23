// AU tax module: worked examples checked by hand against the published rate tables.

import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it, expect } from 'vitest';
import { TAX_CONFIG, calculateAuTax, annualFromPay, perPeriod, helpFor, medicareFor, litoFor } from './tax';

const SOURCE = readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'tax.ts'), 'utf8');
const tax = { TAX_CONFIG, calculateAuTax, annualFromPay, perPeriod, helpFor, medicareFor, litoFor };
const calc = (annualAmount: number, extra: Record<string, unknown> = {}) =>
  tax.calculateAuTax({ annualAmount, residency: 'resident', help: false, packageIncludesSuper: false, ...extra }, tax.TAX_CONFIG);

describe('au tax module, worked examples (2026-27, hand calculated from the ATO rate tables)', () => {
  it('resident 60,000: 4,020 + 30c over 45,000, less 100 LITO, plus 2% Medicare', () => {
    const r = calc(60000);
    expect(r.incomeTax).toBe(8420); // 8,520 - (325 - 1.5% x 15,000)
    expect(r.medicare).toBe(1200);
    expect(r.superAmount).toBe(7200);
    expect(r.net).toBe(50380);
  });

  it('resident 120,000: no LITO', () => {
    const r = calc(120000);
    expect(r.incomeTax).toBe(26520); // 4,020 + 75,000 x 30%
    expect(r.medicare).toBe(2400);
    expect(r.net).toBe(91080);
    expect(r.superAmount).toBe(14400);
  });

  it('resident 200,000: top bracket', () => {
    const r = calc(200000);
    expect(r.incomeTax).toBe(55870); // 51,370 + 10,000 x 45%
    expect(r.medicare).toBe(4000);
    expect(r.net).toBe(140130);
  });

  it('120,000 package including super backs the 12% out of the entered amount', () => {
    const r = calc(120000, { packageIncludesSuper: true });
    expect(r.gross).toBe(107142.86); // 120,000 / 1.12
    expect(r.superAmount).toBe(12857.14);
    expect(r.totalPackage).toBe(120000);
    expect(r.incomeTax).toBe(22662.86); // 4,020 + 62,142.86 x 30%
    expect(r.medicare).toBe(2142.86);
    expect(r.net).toBe(82337.14);
  });

  it('HELP on at 120,000: 15c over 69,528', () => {
    const r = calc(120000, { help: true });
    expect(r.help).toBe(7570.8);
    expect(r.net).toBe(83509.2);
  });

  it('HELP matches the three examples the ATO publishes for 2026-27', () => {
    expect(calc(86380, { help: true }).help).toBe(2527.8);
    expect(calc(137064, { help: true }).help).toBe(10276.99);
    expect(calc(254780, { help: true }).help).toBe(25478);
    expect(calc(69528, { help: true }).help).toBe(0);
  });

  it('working holiday maker 50,000: 15c to 45,000 then 30c, no Medicare, no LITO', () => {
    const r = calc(50000, { residency: 'whm' });
    expect(r.incomeTax).toBe(8250); // 6,750 + 5,000 x 30%
    expect(r.medicare).toBe(0);
    expect(r.net).toBe(41750);
  });

  it('foreign resident 90,000: 30c from the first dollar, no Medicare', () => {
    const r = calc(90000, { residency: 'foreign' });
    expect(r.incomeTax).toBe(27000);
    expect(r.medicare).toBe(0);
    expect(r.net).toBe(63000);
    expect(calc(200000, { residency: 'foreign' }).incomeTax).toBe(60850 + 4500);
  });

  it('Medicare levy phases in over the low-income thresholds and LITO tapers', () => {
    expect(tax.medicareFor(28011, tax.TAX_CONFIG)).toBe(0);
    expect(tax.medicareFor(30000, tax.TAX_CONFIG)).toBeCloseTo(198.9, 6);
    expect(tax.medicareFor(35013, tax.TAX_CONFIG)).toBeCloseTo(700.2, 6);
    expect(tax.medicareFor(36000, tax.TAX_CONFIG)).toBe(720);
    const r = calc(30000);
    expect(r.incomeTax).toBe(1070); // 1,770 - 700 LITO
    expect(r.medicare).toBe(198.9);
    expect(r.net).toBe(28731.1);
    expect(tax.litoFor(40000, tax.TAX_CONFIG)).toBe(575);
    expect(tax.litoFor(50000, tax.TAX_CONFIG)).toBe(250);
    expect(calc(50000).incomeTax).toBe(5270);
    expect(calc(18200).incomeTax).toBe(0);
    expect(calc(10000).net).toBe(10000);
  });

  it('caps employer super at the maximum contribution base', () => {
    expect(calc(300000).superAmount).toBe(32499.6); // 270,830 x 12%
    const r = calc(400000, { packageIncludesSuper: true });
    expect(r.superAmount).toBe(32499.6);
    expect(r.gross).toBe(367500.4);
  });

  it('ignores bad input and unknown residency', () => {
    expect(calc(-1).net).toBe(0);
    expect(calc(60000, { residency: 'nonsense' }).net).toBe(50380);
  });

  it('turns every pay period into an annual figure and splits the year', () => {
    const c = tax.TAX_CONFIG;
    expect(tax.annualFromPay(40, 'hourly', 38, 5, c)).toBe(79040);
    expect(tax.annualFromPay(300, 'daily', 38, 5, c)).toBe(78000);
    expect(tax.annualFromPay(1500, 'weekly', 38, 5, c)).toBe(78000);
    expect(tax.annualFromPay(6500, 'monthly', 38, 5, c)).toBe(78000);
    expect(tax.perPeriod(78000, 5, c)).toEqual({ year: 78000, month: 6500, fortnight: 3000, day: 300 });
  });

  it('keeps the tax year, the sources and the unconfirmed flags in TAX_CONFIG', () => {
    expect(tax.TAX_CONFIG.taxYear).toBe('2026-27');
    expect(tax.TAX_CONFIG.superRate).toBe(0.12);
    expect(SOURCE).toContain('https://www.ato.gov.au/tax-rates-and-codes/study-and-training-support-loans-rates-and-repayment-thresholds');
    expect(SOURCE).toContain('https://www.ato.gov.au/tax-rates-and-codes/schedule-15-tax-table-for-working-holiday-makers');
    expect(SOURCE.match(/UNCONFIRMED for 2026-27/g)!.length).toBe(2);
  });
});


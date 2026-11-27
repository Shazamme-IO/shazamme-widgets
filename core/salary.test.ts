import { describe, it, expect } from 'vitest';
import { annualPay, payLine, salaryRange } from './salary';

// Rows as the Shazamme feed and the Duda "Jobs" collection send them (Demo 2, 27 Nov 2026): salaryText is only the
// recruiter's extra wording after the amount, currencySymbol holds the code, and -1 or null means "no amount".
const demo = (extra: Record<string, unknown>) => ({ salaryFrom: '150000', salaryTo: '170000', realSalaryFrom: 150000, realSalaryTo: 170000, currencyCode: 'AUD', currencySymbol: 'AUD', salaryType: 'Annual', isDisplaySalary: true, ...extra });

describe('payLine', () => {
  it('puts the amount in front of extra wording such as "+ super"', () => {
    expect(payLine(demo({ salaryText: '+ super' }))).toBe('$150,000 – $170,000 + super');
  });

  it('keeps hourly and daily wording after the range', () => {
    expect(payLine(demo({ salaryFrom: '55', salaryTo: '65', salaryType: 'Hourly', salaryText: 'per hour + super' }))).toBe('$55 – $65 per hour + super');
    expect(payLine(demo({ salaryFrom: '550', salaryTo: '650', currencyCode: 'GBP', salaryText: 'per day (outside IR35)' }))).toBe('£550 – £650 per day (outside IR35)');
  });

  it('does not mistake another figure in the wording for the salary', () => {
    expect(payLine(demo({ salaryFrom: '90000', salaryTo: '110000', currencyCode: 'USD', salaryText: 'base + $180,000 OTE' }))).toBe('$90,000 – $110,000 base + $180,000 OTE');
  });

  it('sets off wording that stands on its own with a comma', () => {
    expect(payLine(demo({ salaryText: 'Super included' }))).toBe('$150,000 – $170,000, Super included');
    expect(payLine(demo({ salaryText: 'Up to $20k bonus' }))).toBe('$150,000 – $170,000, Up to $20k bonus');
  });

  it('uses the wording alone when it already states the amount', () => {
    expect(payLine(demo({ salaryText: '$150,000 – $170,000 + super' }))).toBe('$150,000 – $170,000 + super');
    expect(payLine(demo({ salaryText: '$150k - $170k plus super' }))).toBe('$150k - $170k plus super');
  });

  it('formats the range alone when there is no wording, adding the unit for hourly and daily pay', () => {
    expect(payLine(demo({ salaryText: '' }))).toBe('$150,000 – $170,000');
    expect(payLine(demo({ salaryText: null, salaryFrom: '14', salaryTo: '16', currencyCode: 'GBP', salaryType: 'Hourly' }))).toBe('£14 – £16 per hour');
    expect(payLine(demo({ salaryText: '', salaryFrom: '420', salaryTo: '480', salaryType: 'Daily' }))).toBe('$420 – $480 per day');
  });

  it('shows one figure when only one end is set or both ends match', () => {
    expect(payLine(demo({ salaryTo: '-1', realSalaryTo: -1, salaryText: '+ super' }))).toBe('$150,000 + super');
    expect(payLine(demo({ salaryTo: '150000', realSalaryTo: 150000, salaryText: '' }))).toBe('$150,000');
  });

  it('falls back to the real salary fields, then shows cents only when there are cents', () => {
    expect(payLine(demo({ salaryFrom: null, salaryTo: null, realSalaryFrom: 32.5, realSalaryTo: 40, salaryText: 'per hour' }))).toBe('$32.50 – $40 per hour');
  });

  it('keeps wording that stands on its own when there is no amount, and drops a bare suffix', () => {
    const none = { salaryFrom: null, salaryTo: null, realSalaryFrom: -1, realSalaryTo: -1, currencyCode: 'AUD' };
    expect(payLine({ ...none, salaryText: 'Competitive' })).toBe('Competitive');
    expect(payLine({ ...none, salaryText: '$90k + super' })).toBe('$90k + super');
    expect(payLine({ ...none, salaryText: '+ super' })).toBe('');
    expect(payLine({ ...none, salaryText: 'per hour + super' })).toBe('');
  });

  it('shows nothing when the advert hides its salary', () => {
    expect(payLine(demo({ isDisplaySalary: false, salaryText: '+ super' }))).toBe('');
    expect(payLine(demo({ isDisplaySalary: 'false', salaryText: '+ super' }))).toBe('');
  });

  it('uses a currency symbol the feed sends as a symbol, and writes an unknown code in front', () => {
    expect(payLine({ salaryFrom: 100, salaryTo: 200, currencySymbol: '€', salaryText: '' })).toBe('€100 – €200');
    expect(payLine({ salaryFrom: 100, salaryTo: 200, currencyCode: 'chf', salaryText: '' })).toBe('CHF 100 – CHF 200');
    expect(payLine({ salaryFrom: 100, salaryTo: 200, salaryText: '' })).toBe('100 – 200');
  });

  it('copes with a missing row', () => {
    expect(payLine(undefined)).toBe('');
    expect(payLine(null)).toBe('');
  });
});

describe('salaryRange', () => {
  it('formats the range without the wording', () => {
    expect(salaryRange(demo({ salaryText: '+ super' }))).toBe('$150,000 – $170,000');
  });
});

describe('annualPay', () => {
  it('turns hourly, daily, weekly and monthly pay into a yearly figure for sorting, top of the range first', () => {
    expect(annualPay(demo({}))).toBe(170000);
    expect(annualPay(demo({ salaryFrom: '50', salaryTo: '60', salaryType: 'Hourly' }))).toBe(60 * 1976);
    expect(annualPay(demo({ salaryFrom: '500', salaryTo: '', realSalaryTo: -1, salaryType: 'Daily' }))).toBe(500 * 230);
    expect(annualPay(demo({ salaryFrom: '1000', salaryTo: '1000', salaryType: 'Weekly' }))).toBe(52000);
    expect(annualPay(demo({ salaryFrom: '8000', salaryTo: '9000', salaryType: 'Monthly' }))).toBe(108000);
  });

  it('is 0 when there is no amount or the salary is hidden', () => {
    expect(annualPay({ salaryFrom: null, salaryTo: null })).toBe(0);
    expect(annualPay(demo({ isDisplaySalary: false }))).toBe(0);
  });
});

import { describe, it, expect } from 'vitest';
import { annualPay, hasCurrency, payLine, salaryRange } from './salary';

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

  it('(b) shows wording that already has a currency-symbol amount as written, with no second range', () => {
    expect(payLine(demo({ salaryFrom: '90000', salaryTo: '110000', currencyCode: 'USD', salaryText: 'base + $180,000 OTE' }))).toBe('base + $180,000 OTE');
    expect(payLine(demo({ salaryText: 'Up to $20k bonus' }))).toBe('Up to $20k bonus');
    expect(payLine(demo({ salaryText: '+ A$10,000 sign-on' }))).toBe('+ A$10,000 sign-on');
    expect(payLine(demo({ salaryText: '£ 550 per day' }))).toBe('£ 550 per day');
  });

  it('(a) shows wording that stands on its own as written, as before core/salary', () => {
    expect(payLine(demo({ salaryText: 'Competitive' }))).toBe('Competitive');
    expect(payLine(demo({ salaryText: 'Negotiable depending on experience' }))).toBe('Negotiable depending on experience');
    expect(payLine(demo({ salaryText: 'Super included' }))).toBe('Super included');
  });

  it('(a) prepends the range to every suffix form', () => {
    for (const w of ['+ super', '& super', 'per annum', 'plus bonus', 'pro rata', 'pro-rata', 'base + OTE', 'p.a.', 'pa + super', 'inc. super', 'incl super', 'including super', 'OTE', '(negotiable)']) {
      expect(payLine(demo({ salaryText: w })), w).toBe(`$150,000 – $170,000 ${w}`);
    }
  });

  it('uses the wording alone when it already states the amount', () => {
    expect(payLine(demo({ salaryText: '$150,000 – $170,000 + super' }))).toBe('$150,000 – $170,000 + super');
    expect(payLine(demo({ salaryText: '$150k - $170k plus super' }))).toBe('$150k - $170k plus super');
    expect(payLine(demo({ salaryText: '150k - 170k plus super' }))).toBe('150k - 170k plus super');
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

  it('(e) falls back to the real salary fields and rounds to whole units, as before core/salary', () => {
    expect(payLine(demo({ salaryFrom: null, salaryTo: null, realSalaryFrom: 32.5, realSalaryTo: 40.4, salaryText: 'per hour' }))).toBe('$33 – $40 per hour');
    expect(salaryRange(demo({ salaryFrom: '149999.99', salaryTo: '170000.49' }))).toBe('$150,000 – $170,000');
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

  it('(f) isDisplaySalary false hides standalone wording too (intended change: it used to show)', () => {
    expect(payLine(demo({ isDisplaySalary: false, salaryText: 'Competitive' }))).toBe('');
    expect(payLine(demo({ isDisplaySalary: 'False', salaryText: '$90k + super' }))).toBe('');
    expect(payLine(demo({ isDisplaySalary: true, salaryText: 'Competitive' }))).toBe('Competitive');
  });

  it('uses a currency symbol the feed sends as a symbol, and writes an unknown code in front', () => {
    expect(payLine({ salaryFrom: 100, salaryTo: 200, currencySymbol: '€', salaryText: '' })).toBe('€100 – €200');
    expect(payLine({ salaryFrom: 100, salaryTo: 200, currencyCode: 'chf', salaryText: '' })).toBe('CHF 100 – CHF 200');
    expect(payLine({ salaryFrom: 100, salaryTo: 200, salaryText: '' })).toBe('100 – 200');
  });

  it('(d) reads a 3-letter currencySymbol as the code when there is no currencyCode', () => {
    expect(salaryRange({ salaryFrom: 100, salaryTo: 200, currencySymbol: 'AUD' })).toBe('$100 – $200');
    expect(salaryRange({ salaryFrom: 100, salaryTo: 200, currencySymbol: 'gbp' })).toBe('£100 – £200');
    expect(salaryRange({ salaryFrom: 100, salaryTo: 200, currencySymbol: 'CHF' })).toBe('CHF 100 – CHF 200');
    expect(salaryRange({ salaryFrom: 100, salaryTo: 200, currencyCode: 'EUR', currencySymbol: 'AUD' })).toBe('€100 – €200');
  });

  it('hasCurrency is true for a code, a 3-letter symbol or a symbol, and false with none', () => {
    expect(hasCurrency({ currencyCode: 'NZD' })).toBe(true);
    expect(hasCurrency({ currencySymbol: 'AUD' })).toBe(true);
    expect(hasCurrency({ currencySymbol: '€' })).toBe(true);
    expect(hasCurrency({ salaryFrom: 1 })).toBe(false);
    expect(hasCurrency(null)).toBe(false);
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

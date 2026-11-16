// @vitest-environment jsdom
// AU Salary Calculator. Two layers: the pure tax module (the block between the TAX MODULE markers
// in legacy.js, extracted and run on its own) checked against worked examples done by hand from the
// 2026-27 rate tables and the ATO HELP examples, and the built bundle running in jsdom against the Handlebars-rendered shell.

import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it, expect } from 'vitest';

const here = dirname(fileURLToPath(import.meta.url));
const NAME = 'salary-calculator-au';
const VERSION = JSON.parse(readFileSync(join(here, '..', '..', 'package.json'), 'utf8')).version as string;
const BUNDLE = readFileSync(join(here, '..', '..', 'dist', NAME, VERSION, 'widget.min.js'), 'utf8');
const SOURCE = readFileSync(join(here, 'legacy.js'), 'utf8');
const HBS = readFileSync(join(here, 'content.hbs'), 'utf8');

type Win = Record<string, any>;
type Dict = Record<string, string>;

const tax = new Function(
  SOURCE.match(/\/\/ ---- TAX MODULE START ----([\s\S]*?)\/\/ ---- TAX MODULE END ----/)![1] +
    '; return { TAX_CONFIG, calculateAuTax, annualFromPay, perPeriod, helpFor, medicareFor, litoFor };',
)() as { TAX_CONFIG: any; calculateAuTax: (i: any, c: any) => Record<string, number>; annualFromPay: (...a: any[]) => number; perPeriod: (...a: any[]) => Record<string, number>; helpFor: (...a: any[]) => number; medicareFor: (...a: any[]) => number; litoFor: (...a: any[]) => number };
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

// What Duda's Handlebars renders from content.hbs: {{key}} becomes the (escaped) setting, or nothing.
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const render = (config: Dict) => HBS.replace(/\{\{(\w+)\}\}/g, (_m, k) => esc(config[k] ?? ''));

function load() {
  const win = window as unknown as Win;
  delete win.ShazammeWidget;
  win.eval(BUNDLE);
  return win;
}

function mountOne(host: HTMLElement, config: Dict | null) {
  host.innerHTML = render(config ?? {});
  const win = window as unknown as Win;
  if (!win.ShazammeWidget) load();
  win.ShazammeWidget[NAME]({ element: host, data: config === null ? undefined : { config, inEditor: false }, $: undefined, shazamme: undefined });
  return host;
}

function mount(config: Dict | null = {}) {
  document.body.innerHTML = '<div id="widget"></div>';
  load();
  return mountOne(document.getElementById('widget')!, config);
}

const f = (el: HTMLElement, name: string) => el.querySelector(`[data-f="${name}"]`) as HTMLInputElement & HTMLSelectElement;
const cell = (el: HTMLElement, row: string, col: string) => el.querySelector(`[data-row="${row}"] [data-col="${col}"]`)!.textContent;
const isHidden = (el: Element | null) => {
  for (let n: Element | null = el; n; n = n.parentElement) if ((n as HTMLElement).hidden) return true;
  return false;
};
const visibleRows = (el: HTMLElement) => [...el.querySelectorAll('[data-row]')].filter((r) => !isHidden(r)).map((r) => r.getAttribute('data-row'));

function enter(el: HTMLElement, values: Record<string, string | boolean>) {
  for (const [name, v] of Object.entries(values)) {
    const input = f(el, name);
    if (typeof v === 'boolean') input.checked = v;
    else input.value = v;
    input.dispatchEvent(new Event(typeof v === 'boolean' || input.tagName === 'SELECT' ? 'change' : 'input', { bubbles: true }));
  }
}
const calculate = (el: HTMLElement) => (el.querySelector('[data-shm-calc]') as HTMLButtonElement).click();

describe('au salary calculator bundle', () => {
  it('calculates 120,000 a year and shows year, month, fortnight and day with super on its own line', () => {
    const el = mount();
    enter(el, { amount: '120000', period: 'annual' });
    calculate(el);
    expect(cell(el, 'gross', 'year')).toBe('$120,000.00');
    expect(cell(el, 'incomeTax', 'year')).toBe('$26,520.00');
    expect(cell(el, 'medicare', 'year')).toBe('$2,400.00');
    expect(cell(el, 'net', 'year')).toBe('$91,080.00');
    expect(cell(el, 'net', 'month')).toBe('$7,590.00');
    expect(cell(el, 'net', 'fortnight')).toBe('$3,503.08');
    expect(cell(el, 'net', 'day')).toBe('$350.31');
    expect(cell(el, 'superAmount', 'year')).toBe('$14,400.00');
    expect(el.querySelector('[data-tile="year"]')!.textContent).toBe('$91,080.00');
    expect(visibleRows(el)).toEqual(['gross', 'incomeTax', 'medicare', 'net', 'superAmount']);
    expect(el.querySelector('[data-row="superAmount"] th')!.textContent).toBe('Employer super (12%, paid on top)');
  });

  it('converts hourly, daily, weekly and monthly pay using hours and days per week', () => {
    const el = mount();
    enter(el, { amount: '40', period: 'hourly', hours: '38', days: '5' });
    calculate(el);
    expect(cell(el, 'gross', 'year')).toBe('$79,040.00');
    enter(el, { amount: '300', period: 'daily' });
    expect(cell(el, 'gross', 'year')).toBe('$78,000.00');
    expect(cell(el, 'gross', 'day')).toBe('$300.00');
    enter(el, { amount: '1500', period: 'weekly' });
    expect(cell(el, 'gross', 'year')).toBe('$78,000.00');
    enter(el, { amount: '6500', period: 'monthly' });
    expect(cell(el, 'gross', 'fortnight')).toBe('$3,000.00');
  });

  it('applies residency, HELP and package-includes-super, and shows only the rows that apply', () => {
    const el = mount();
    enter(el, { amount: '50000', residency: 'whm' });
    calculate(el);
    expect(cell(el, 'incomeTax', 'year')).toBe('$8,250.00');
    expect(cell(el, 'net', 'year')).toBe('$41,750.00');
    expect(visibleRows(el)).toEqual(['gross', 'incomeTax', 'net', 'superAmount']);
    enter(el, { amount: '90000', residency: 'foreign' });
    expect(cell(el, 'net', 'year')).toBe('$63,000.00');
    enter(el, { amount: '120000', residency: 'resident', help: true });
    expect(cell(el, 'help', 'year')).toBe('$7,570.80');
    expect(cell(el, 'net', 'year')).toBe('$83,509.20');
    expect(visibleRows(el)).toContain('help');
    enter(el, { help: false, superIncluded: true });
    expect(cell(el, 'totalPackage', 'year')).toBe('$120,000.00');
    expect(cell(el, 'gross', 'year')).toBe('$107,142.86');
    expect(cell(el, 'superAmount', 'year')).toBe('$12,857.14');
    expect(cell(el, 'net', 'year')).toBe('$82,337.14');
    expect(visibleRows(el)).toEqual(['totalPackage', 'gross', 'incomeTax', 'medicare', 'net', 'superAmount']);
  });

  it('keeps the guide-only statement visible whenever results show, whatever the toggles say', () => {
    const configs: Dict[] = [
      {},
      { showTaxOptions: 'false' },
      { showTaxBreakdown: 'false' },
      { showTaxOptions: 'false', showResidency: 'false', showHelp: 'false', showSuperIncluded: 'false', showSuper: 'false', showTaxBreakdown: 'false', disclaimerText: '   ' },
      { disclaimerText: 'Guide only, see the ATO.' },
    ];
    for (const config of configs) {
      const el = mount(config);
      const d = el.querySelector('[data-shm-disclaimer]') as HTMLElement;
      expect(isHidden(d)).toBe(false);
      expect(d.textContent!.trim().length).toBeGreaterThan(20);
      enter(el, { amount: '60000' });
      calculate(el);
      expect(isHidden(el.querySelector('[data-shm-results]'))).toBe(false);
      expect(isHidden(d)).toBe(false);
    }
    expect((mount({ disclaimerText: 'Guide only, see the ATO.' }).querySelector('[data-shm-disclaimer]') as HTMLElement).textContent).toBe('Guide only, see the ATO.');
    expect((mount({ disclaimerText: '' }).querySelector('[data-shm-disclaimer]') as HTMLElement).textContent).toContain('guide only');
    expect((mount().querySelector('[data-shm-disclaimer]') as HTMLElement).textContent).toContain('2026-27');
  });

  it('hides the tax options group with one toggle and ignores values left in it', () => {
    const el = mount({ showTaxOptions: 'false' });
    expect(isHidden(f(el, 'residency'))).toBe(true);
    enter(el, { amount: '120000', residency: 'foreign', help: true, superIncluded: true });
    calculate(el);
    expect(cell(el, 'net', 'year')).toBe('$91,080.00');
    expect(cell(el, 'gross', 'year')).toBe('$120,000.00');
    expect(visibleRows(el)).toEqual(['gross', 'incomeTax', 'medicare', 'net', 'superAmount']);
  });

  it('hides each option on its own and ignores a hidden option', () => {
    const el = mount({ showResidency: 'false', showHelp: 'false' });
    expect(isHidden(f(el, 'residency'))).toBe(true);
    expect(isHidden(f(el, 'help'))).toBe(true);
    expect(isHidden(f(el, 'superIncluded'))).toBe(false);
    expect(isHidden(el.querySelector('[data-shm-options]'))).toBe(false);
    enter(el, { amount: '120000', residency: 'foreign', help: true });
    calculate(el);
    expect(cell(el, 'net', 'year')).toBe('$91,080.00');
    expect(isHidden(el.querySelector('[data-shm-options]'))).toBe(false);
    const none = mount({ showResidency: 'false', showHelp: 'false', showSuperIncluded: 'false' });
    expect(isHidden(none.querySelector('[data-shm-options]'))).toBe(true);
  });

  it('shows only gross and take-home pay when the tax breakdown is off', () => {
    const el = mount({ showTaxBreakdown: 'false' });
    enter(el, { amount: '120000', help: true, superIncluded: true });
    calculate(el);
    expect(visibleRows(el)).toEqual(['gross', 'net']);
    expect(cell(el, 'net', 'year')).not.toBe('');
  });

  it('can hide the employer super line on its own', () => {
    const el = mount({ showSuper: 'false' });
    enter(el, { amount: '120000' });
    calculate(el);
    expect(visibleRows(el)).toEqual(['gross', 'incomeTax', 'medicare', 'net']);
  });

  it('shows an error and no results for bad input', () => {
    const el = mount();
    calculate(el);
    expect(el.querySelector('[data-shm-error]')!.textContent).toBe('Enter a pay amount greater than zero.');
    expect(isHidden(el.querySelector('[data-shm-results]'))).toBe(true);
    enter(el, { amount: '40', period: 'hourly', hours: '0' });
    calculate(el);
    expect(el.querySelector('[data-shm-error]')!.textContent).toBe('Enter hours per week between 1 and 168.');
    enter(el, { period: 'annual', amount: '60000', days: '0' });
    calculate(el);
    expect(el.querySelector('[data-shm-error]')!.textContent).toBe('Enter days per week between 1 and 7.');
    enter(el, { days: '5' });
    calculate(el);
    expect(isHidden(el.querySelector('[data-shm-error]'))).toBe(true);
    expect(cell(el, 'net', 'year')).toBe('$50,380.00');
  });

  it('uses the editable labels, with tokens for the tax year and super rate, and falls back to defaults', () => {
    const el = mount({ title: 'Pay checker', calcButton: 'Work it out', rowMedicare: 'Medicare', intro: 'Rates for {taxYear}', rowSuper: 'Super at {superRate}', helpLabel: '', colFortnight: 'Fn' });
    expect(el.querySelector('.shm-sc-title')!.textContent).toBe('Pay checker');
    expect(el.querySelector('[data-shm-calc]')!.textContent).toBe('Work it out');
    expect(el.querySelector('[data-row="medicare"] th')!.textContent).toBe('Medicare');
    expect(el.querySelector('.shm-sc-intro')!.textContent).toBe('Rates for 2026-27');
    expect(el.querySelector('[data-row="superAmount"] th')!.textContent).toBe('Super at 12%');
    expect(el.querySelector('[data-opt="help"] [data-t]')!.textContent).toBe('I have a HELP or study loan');
    expect(el.querySelector('thead th[data-t="colFortnight"]')!.textContent).toBe('Fn');
  });

  it('escapes text instead of building markup from it', () => {
    const evil = '<img src=x onerror="window.pwned=1"><script>window.pwned=2</script>';
    const el = mount({ title: evil, disclaimerText: evil, calcButton: evil, rowGross: evil, errorAmount: evil });
    expect(el.querySelector('img')).toBeNull();
    expect(el.querySelector('script')).toBeNull();
    expect(el.querySelector('.shm-sc-title')!.textContent).toBe(evil);
    expect(el.querySelector('[data-shm-disclaimer]')!.textContent).toBe(evil);
    calculate(el);
    expect(el.querySelector('[data-shm-error]')!.textContent).toBe(evil);
    expect(el.querySelector('img')).toBeNull();
    expect((window as unknown as Win).pwned).toBeUndefined();
  });

  it('renders with an empty or missing config and with bad setting values', () => {
    for (const config of [{}, null, { defaultPeriod: 'fortnightly', defaultHours: 'abc', defaultDays: '99', defaultAmount: '-4', showTaxOptions: 'maybe' } as Dict]) {
      const el = mount(config);
      expect(el.querySelector('.shm-sc-title')!.textContent).toBe('AU Salary Calculator');
      expect(el.querySelector('[data-shm-calc]')!.textContent).toBe('Calculate');
      expect(f(el, 'period').value).toBe('annual');
      expect(f(el, 'hours').value).toBe('38');
      expect(f(el, 'days').value).toBe(config?.defaultDays ? '7' : '5');
      enter(el, { amount: '60000' });
      calculate(el);
      expect(cell(el, 'net', 'year')).toBe('$50,380.00');
    }
  });

  it('does nothing when the shell is missing', () => {
    document.body.innerHTML = '<div id="widget"></div>';
    load();
    expect(() => (window as unknown as Win).ShazammeWidget[NAME]({ element: document.getElementById('widget'), data: { config: {} } })).not.toThrow();
  });

  it('starts with a default amount and period from the settings', () => {
    const el = mount({ defaultAmount: '40', defaultPeriod: 'hourly', defaultHours: '38' });
    expect(f(el, 'period').value).toBe('hourly');
    expect(cell(el, 'gross', 'year')).toBe('$79,040.00');
  });

  it('survives a re-run on the same markup without stacking handlers', () => {
    const el = mount({});
    const win = window as unknown as Win;
    win.ShazammeWidget[NAME]({ element: el, data: { config: {} } });
    win.ShazammeWidget[NAME]({ element: el, data: { config: { calcButton: 'Go' } } });
    expect(el.querySelector('[data-shm-calc]')!.textContent).toBe('Go');
    enter(el, { amount: '60000' });
    let renders = 0;
    const net = el.querySelector('[data-tile="year"]')!;
    new MutationObserver((records) => { renders += records.length; }).observe(net, { childList: true });
    calculate(el);
    return Promise.resolve().then(() => {
      expect(renders).toBe(1);
      expect(cell(el, 'net', 'year')).toBe('$50,380.00');
    });
  });

  it('runs two copies on one page independently', () => {
    document.body.innerHTML = '<div id="a"></div><div id="b"></div>';
    load();
    const a = mountOne(document.getElementById('a')!, { title: 'First', showTaxBreakdown: 'false' });
    const b = mountOne(document.getElementById('b')!, { title: 'Second' });
    enter(a, { amount: '60000' });
    enter(b, { amount: '90000', residency: 'foreign' });
    calculate(a);
    calculate(b);
    expect(a.querySelector('.shm-sc-title')!.textContent).toBe('First');
    expect(b.querySelector('.shm-sc-title')!.textContent).toBe('Second');
    expect(cell(a, 'net', 'year')).toBe('$50,380.00');
    expect(cell(b, 'net', 'year')).toBe('$63,000.00');
    expect(visibleRows(a)).toEqual(['gross', 'net']);
    expect(visibleRows(b)).toEqual(['gross', 'incomeTax', 'net', 'superAmount']);
  });
});

describe('au salary calculator settings', () => {
  const prompts = ['1-content-labels', '2-content-results', '3-content-options'].map((n) => readFileSync(join(here, `duda-ai-prompt-${n}.md`), 'utf8')).join('\n');
  const promptKeys = new Set([...prompts.matchAll(/\| key: (\w+)/g)].map((m) => m[1]));

  it('lists in the Content Editor prompts every key the JS and the HTML read, and no others', () => {
    const jsKeys = new Set<string>([...SOURCE.matchAll(/cfg\.(\w+)/g)].map((m) => m[1]));
    const defaults = SOURCE.match(/var DEFAULTS = \{([\s\S]*?)\n\};/)![1];
    for (const m of defaults.matchAll(/^\s{2}(\w+):/gm)) jsKeys.add(m[1]);
    for (const m of HBS.matchAll(/\{\{(\w+)\}\}/g)) jsKeys.add(m[1]);
    expect([...jsKeys].sort()).toEqual([...promptKeys].sort());
  });

  it('uses root Handlebars keys only, no blocks and no config prefix', () => {
    expect(HBS).not.toMatch(/config\./);
    expect(HBS).not.toMatch(/\{\{[#/^>]/);
  });
});

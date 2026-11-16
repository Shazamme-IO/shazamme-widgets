// @vitest-environment jsdom
// UK Salary Calculator. Two layers: the pure tax module (the block between the TAX MODULE markers
// in legacy.js, extracted and run on its own) checked against worked examples done by hand from the
// 2026/27 rate tables, and the built bundle running in jsdom against the Handlebars-rendered shell.

import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it, expect, vi } from 'vitest';

const here = dirname(fileURLToPath(import.meta.url));
const NAME = 'salary-calculator-uk';
const VERSION = JSON.parse(readFileSync(join(here, '..', '..', 'package.json'), 'utf8')).version as string;
const BUNDLE = readFileSync(join(here, '..', '..', 'dist', NAME, VERSION, 'widget.min.js'), 'utf8');
const SOURCE = readFileSync(join(here, 'legacy.js'), 'utf8');
const HBS = readFileSync(join(here, 'content.hbs'), 'utf8');

type Win = Record<string, any>;
type Dict = Record<string, string>;

const tax = new Function(
  SOURCE.match(/\/\/ ---- TAX MODULE START ----([\s\S]*?)\/\/ ---- TAX MODULE END ----/)![1] +
    '; return { TAX_CONFIG, calculateUkTax, annualFromPay, perPeriod };',
)() as { TAX_CONFIG: any; calculateUkTax: (i: any, c: any) => Record<string, number>; annualFromPay: (...a: any[]) => number; perPeriod: (...a: any[]) => Record<string, number> };
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
    const isTextBox = typeof v !== 'boolean' && input.tagName !== 'SELECT';
    if (isTextBox) input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }
}
const calculate = (el: HTMLElement) => (el.querySelector('[data-shm-calc]') as HTMLButtonElement).click();

describe('uk salary calculator bundle', () => {
  it('calculates 30,000 a year and shows year, month, week and day', () => {
    const el = mount();
    enter(el, { amount: '30000', period: 'annual' });
    calculate(el);
    expect(cell(el, 'gross', 'year')).toBe('£30,000.00');
    expect(cell(el, 'incomeTax', 'year')).toBe('£3,486.00');
    expect(cell(el, 'ni', 'year')).toBe('£1,394.40');
    expect(cell(el, 'net', 'year')).toBe('£25,119.60');
    expect(cell(el, 'net', 'month')).toBe('£2,093.30');
    expect(cell(el, 'net', 'week')).toBe('£483.07');
    expect(cell(el, 'net', 'day')).toBe('£96.61');
    expect(el.querySelector('[data-tile="year"]')!.textContent).toBe('£25,119.60');
    expect(isHidden(el.querySelector('[data-shm-results]'))).toBe(false);
  });

  it('converts hourly, daily, weekly and monthly pay using hours and days per week', () => {
    const el = mount();
    enter(el, { amount: '20', period: 'hourly', hours: '40', days: '5' });
    calculate(el);
    expect(cell(el, 'gross', 'year')).toBe('£41,600.00');
    enter(el, { amount: '200', period: 'daily', days: '4' });
    expect(cell(el, 'gross', 'year')).toBe('£41,600.00');
    expect(cell(el, 'gross', 'day')).toBe('£200.00');
    enter(el, { amount: '500', period: 'weekly' });
    expect(cell(el, 'gross', 'year')).toBe('£26,000.00');
    enter(el, { amount: '3000', period: 'monthly' });
    expect(cell(el, 'gross', 'year')).toBe('£36,000.00');
  });

  it('applies the Scottish, student loan and pension options, and shows only the rows that apply', () => {
    const el = mount();
    enter(el, { amount: '45000', period: 'annual', scottish: true });
    calculate(el);
    expect(cell(el, 'incomeTax', 'year')).toBe('£6,882.05');
    expect(visibleRows(el)).toEqual(['gross', 'incomeTax', 'ni', 'net']);
    enter(el, { scottish: false, amount: '35000', loan: 'plan2' });
    expect(cell(el, 'studentLoan', 'year')).toBe('£505.35');
    expect(cell(el, 'net', 'year')).toBe('£28,214.25');
    expect(visibleRows(el)).toContain('studentLoan');
    enter(el, { loan: 'none', amount: '40000', pension: '5' });
    expect(cell(el, 'pension', 'year')).toBe('£2,000.00');
    expect(cell(el, 'net', 'year')).toBe('£30,879.60');
    expect(visibleRows(el)).toContain('pension');
  });

  it('keeps the guide-only statement visible whenever results show, whatever the toggles say', () => {
    const configs: Dict[] = [
      {},
      { showTaxOptions: 'false' },
      { showTaxBreakdown: 'false' },
      { showTaxOptions: 'false', showScottish: 'false', showStudentLoan: 'false', showPension: 'false', showTaxBreakdown: 'false', disclaimerText: '   ' },
      { disclaimerText: 'Guide only, see HMRC.' },
    ];
    for (const config of configs) {
      const el = mount(config);
      const d = el.querySelector('[data-shm-disclaimer]') as HTMLElement;
      expect(isHidden(d)).toBe(false);
      expect(d.textContent!.trim().length).toBeGreaterThan(20);
      enter(el, { amount: '30000' });
      calculate(el);
      expect(isHidden(el.querySelector('[data-shm-results]'))).toBe(false);
      expect(isHidden(d)).toBe(false);
    }
    expect((mount({ disclaimerText: 'Guide only, see HMRC.' }).querySelector('[data-shm-disclaimer]') as HTMLElement).textContent).toBe('Guide only, see HMRC.');
    expect((mount({ disclaimerText: '' }).querySelector('[data-shm-disclaimer]') as HTMLElement).textContent).toContain('guide only');
    expect((mount().querySelector('[data-shm-disclaimer]') as HTMLElement).textContent).toContain('2026/27');
  });

  it('hides the tax options group with one toggle and ignores values left in it', () => {
    const el = mount({ showTaxOptions: 'false' });
    expect(isHidden(f(el, 'scottish'))).toBe(true);
    enter(el, { amount: '45000', scottish: true, loan: 'plan2', pension: '10' });
    calculate(el);
    expect(cell(el, 'incomeTax', 'year')).toBe('£6,486.00'); // rUK, no loan, no pension: (45,000-12,570) x 20%
    expect(visibleRows(el)).toEqual(['gross', 'incomeTax', 'ni', 'net']);
  });

  it('hides each option on its own and ignores a hidden option', () => {
    const el = mount({ showScottish: 'false', showStudentLoan: 'false' });
    expect(isHidden(f(el, 'scottish'))).toBe(true);
    expect(isHidden(f(el, 'loan'))).toBe(true);
    expect(isHidden(f(el, 'pension'))).toBe(false);
    expect(isHidden(el.querySelector('[data-shm-options]'))).toBe(false);
    enter(el, { amount: '35000', scottish: true, loan: 'plan2' });
    calculate(el);
    expect(cell(el, 'net', 'year')).toBe('£28,719.60'); // 35,000 - 4,486 - 1,794.40, no loan
    const none = mount({ showScottish: 'false', showStudentLoan: 'false', showPension: 'false' });
    expect(isHidden(none.querySelector('[data-shm-options]'))).toBe(true);
    const pensionOnly = mount({ showScottish: 'false', showStudentLoan: 'false' });
    expect(isHidden(pensionOnly.querySelector('[data-opt="pension"]'))).toBe(false);
  });

  it('shows only gross and take-home pay when the tax breakdown is off', () => {
    const el = mount({ showTaxBreakdown: 'false' });
    enter(el, { amount: '45000', scottish: true, loan: 'plan2', pension: '5' });
    calculate(el);
    expect(visibleRows(el)).toEqual(['gross', 'net']);
    expect(cell(el, 'gross', 'year')).toBe('£45,000.00');
    expect(cell(el, 'net', 'year')).not.toBe('');
  });

  it('shows an error and no results for bad input', () => {
    const el = mount();
    calculate(el);
    expect(isHidden(el.querySelector('[data-shm-error]'))).toBe(false);
    expect(el.querySelector('[data-shm-error]')!.textContent).toBe('Enter a pay amount greater than zero.');
    expect(isHidden(el.querySelector('[data-shm-results]'))).toBe(true);
    enter(el, { amount: '20', period: 'hourly', hours: '0' });
    calculate(el);
    expect(el.querySelector('[data-shm-error]')!.textContent).toBe('Enter hours per week between 1 and 168.');
    enter(el, { period: 'annual', amount: '30000', days: '9' });
    calculate(el);
    expect(isHidden(el.querySelector('[data-shm-error]'))).toBe(true); // days only matter to the day column, which uses the default
    expect(isHidden(el.querySelector('[data-shm-results]'))).toBe(false);
    enter(el, { period: 'daily', amount: '200', days: '9' });
    calculate(el);
    expect(el.querySelector('[data-shm-error]')!.textContent).toBe('Enter days per week between 1 and 7.');
    enter(el, { days: '5' });
    calculate(el);
    expect(isHidden(el.querySelector('[data-shm-error]'))).toBe(true);
    expect(isHidden(el.querySelector('[data-shm-results]'))).toBe(false);
  });

  it('recalculates when an input changes after the first calculation', () => {
    const el = mount();
    enter(el, { amount: '30000' });
    calculate(el);
    const input = f(el, 'amount');
    input.value = '60000';
    vi.useFakeTimers();
    input.dispatchEvent(new Event('input', { bubbles: true }));
    vi.advanceTimersByTime(300);
    vi.useRealTimers();
    expect(cell(el, 'net', 'year')).toBe('£45,357.40');
  });

  it('uses the editable labels, with a token for the tax year, and falls back to defaults', () => {
    const el = mount({ title: 'Pay checker', calcButton: 'Work it out', rowNI: 'NI', intro: 'Rates for {taxYear}', scottishLabel: '', colWeek: 'Wk' });
    expect(el.querySelector('.shm-sc-title')!.textContent).toBe('Pay checker');
    expect(el.querySelector('[data-shm-calc]')!.textContent).toBe('Work it out');
    expect(el.querySelector('[data-row="ni"] th')!.textContent).toBe('NI');
    expect(el.querySelector('.shm-sc-intro')!.textContent).toBe('Rates for 2026/27');
    expect(el.querySelector('[data-opt="scottish"] [data-t]')!.textContent).toBe('I pay Scottish income tax');
    expect(el.querySelector('thead th[data-t="colWeek"]')!.textContent).toBe('Wk');
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
      expect(el.querySelector('.shm-sc-title')!.textContent).toBe('UK Salary Calculator');
      expect(el.querySelector('[data-shm-calc]')!.textContent).toBe('Calculate');
      expect(f(el, 'period').value).toBe('annual');
      expect(f(el, 'days').value).toBe(config?.defaultDays ? '7' : '5');
      enter(el, { amount: '30000' });
      calculate(el);
      expect(cell(el, 'net', 'year')).toBe('£25,119.60');
    }
  });

  it('does nothing when the shell is missing', () => {
    document.body.innerHTML = '<div id="widget"></div>';
    load();
    expect(() => (window as unknown as Win).ShazammeWidget[NAME]({ element: document.getElementById('widget'), data: { config: {} } })).not.toThrow();
  });

  it('starts with a default amount and period from the settings', () => {
    const el = mount({ defaultAmount: '20', defaultPeriod: 'hourly', defaultHours: '40' });
    expect(f(el, 'period').value).toBe('hourly');
    expect(cell(el, 'gross', 'year')).toBe('£41,600.00');
  });

  it('survives a re-run on the same markup without stacking handlers', () => {
    const el = mount({});
    const win = window as unknown as Win;
    win.ShazammeWidget[NAME]({ element: el, data: { config: {} } });
    win.ShazammeWidget[NAME]({ element: el, data: { config: { calcButton: 'Go' } } });
    expect(el.querySelector('[data-shm-calc]')!.textContent).toBe('Go');
    enter(el, { amount: '30000' });
    let renders = 0;
    const net = el.querySelector('[data-tile="year"]')!;
    new MutationObserver((records) => { renders += records.length; }).observe(net, { childList: true });
    calculate(el);
    return Promise.resolve().then(() => {
      expect(renders).toBe(1);
      expect(cell(el, 'net', 'year')).toBe('£25,119.60');
    });
  });

  it('runs two copies on one page independently', () => {
    document.body.innerHTML = '<div id="a"></div><div id="b"></div>';
    load();
    const a = mountOne(document.getElementById('a')!, { title: 'First', showTaxBreakdown: 'false' });
    const b = mountOne(document.getElementById('b')!, { title: 'Second' });
    enter(a, { amount: '30000' });
    enter(b, { amount: '60000', scottish: true });
    calculate(a);
    calculate(b);
    expect(a.querySelector('.shm-sc-title')!.textContent).toBe('First');
    expect(b.querySelector('.shm-sc-title')!.textContent).toBe('Second');
    expect(cell(a, 'net', 'year')).toBe('£25,119.60');
    expect(visibleRows(a)).toEqual(['gross', 'net']);
    expect(visibleRows(b)).toEqual(['gross', 'incomeTax', 'ni', 'net']);
    expect(cell(b, 'incomeTax', 'year')).not.toBe(cell(a, 'incomeTax', 'year'));
    expect(cell(a, 'gross', 'year')).toBe('£30,000.00');
  });
});

describe('uk salary calculator settings', () => {
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

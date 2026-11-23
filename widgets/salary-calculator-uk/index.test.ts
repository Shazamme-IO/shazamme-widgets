// @vitest-environment jsdom
// UK Salary Calculator: the built bundle (dist) running in jsdom against the Handlebars-rendered shell,
// the way Duda's loader stub runs it. The tax maths is covered on its own in tax.test.ts.

import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it, expect, vi } from 'vitest';

const here = dirname(fileURLToPath(import.meta.url));
const NAME = 'salary-calculator-uk';
const VERSION = JSON.parse(readFileSync(join(here, '..', '..', 'package.json'), 'utf8')).version as string;
const BUNDLE = readFileSync(join(here, '..', '..', 'dist', NAME, VERSION, 'widget.min.js'), 'utf8');
const SETTINGS_SRC = readFileSync(join(here, 'settings.ts'), 'utf8');
const HBS = readFileSync(join(here, 'content.hbs'), 'utf8');

// A classic <script> makes the bundle's top-level `var` global; strict-mode eval keeps it local.
// Assign it to window instead, leaving the bundle strict.
const GLOBAL_BUNDLE = BUNDLE.replace('"use strict";var __shazWidgetExport=', '"use strict";window.__shazWidgetExport=');
if (GLOBAL_BUNDLE === BUNDLE) throw new Error('bundle prologue changed: update GLOBAL_BUNDLE in this test');

type Win = Record<string, any>;
type Dict = Record<string, unknown>;

// What Duda's Handlebars renders from content.hbs: {{key}} becomes the (escaped) setting, or nothing.
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const render = (config: Dict) => HBS.replace(/\{\{(\w+)\}\}/g, (_m, k) => esc(String(config[k] ?? '')));

function load() {
  const win = window as unknown as Win;
  delete win.ShazammeWidget;
  win.eval(GLOBAL_BUNDLE);
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

  it('keeps updating live after an error once the visitor has pressed Calculate', () => {
    const el = mount();
    calculate(el);
    expect(isHidden(el.querySelector('[data-shm-error]'))).toBe(false);
    enter(el, { amount: '30000' });
    expect(isHidden(el.querySelector('[data-shm-error]'))).toBe(true);
    expect(isHidden(el.querySelector('[data-shm-results]'))).toBe(false);
  });

  it('recalculates a value changed without typing (autofill), and blanks the day column for bad days', () => {
    const el = mount();
    enter(el, { amount: '30000' });
    calculate(el);
    const before = cell(el, 'net', 'year');
    const days = f(el, 'days');
    days.value = '0';
    days.dispatchEvent(new Event('change', { bubbles: true }));
    expect(cell(el, 'net', 'year')).toBe(before);
    expect(cell(el, 'net', 'day')).toBe('\u2013');
    expect(el.querySelector('[data-tile="day"]')!.textContent).toBe('\u2013');
  });

  it('rejects pay that annualises above the cap', () => {
    const el = mount();
    enter(el, { amount: '1000000000', period: 'hourly', hours: '40' });
    calculate(el);
    expect(isHidden(el.querySelector('[data-shm-error]'))).toBe(false);
    expect(isHidden(el.querySelector('[data-shm-results]'))).toBe(true);
  });

  it('Calculate runs a waiting recalculation once and cancels its timer', () => {
    vi.useFakeTimers();
    const el = mount();
    enter(el, { amount: '30000' });
    calculate(el);
    const results = el.querySelector('[data-shm-results]')!;
    const amount = f(el, 'amount');
    amount.value = '1';
    amount.dispatchEvent(new Event('input', { bubbles: true }));
    calculate(el);
    const after = cell(el, 'gross', 'year');
    results.querySelector('[data-row="gross"] [data-col="year"]')!.textContent = 'untouched';
    vi.advanceTimersByTime(1000);
    vi.useRealTimers();
    expect(after).toBe('£1.00');
    expect(cell(el, 'gross', 'year')).toBe('untouched');
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


describe('uk salary calculator, modern runtime', () => {
  it('needs no Shazamme SDK: no shazamme global, no SDK url, no loader in the bundle', () => {
    expect((window as unknown as Win).shazamme).toBeUndefined();
    expect(BUNDLE).not.toContain('sdk.shazamme.io');
    expect(BUNDLE).not.toContain('__shazSDKPromise');
    const el = mount();
    enter(el, { amount: '30000' });
    calculate(el);
    expect(cell(el, 'net', 'year')).toBe('£25,119.60');
  });

  it('accepts real booleans and numbers as Duda sends them, as well as strings', () => {
    const el = mount({ showTaxBreakdown: false, defaultAmount: 30000, showTaxOptions: false });
    expect(visibleRows(el)).toEqual(['gross', 'net']);
    expect(isHidden(el.querySelector('[data-shm-options]'))).toBe(true);
    expect(cell(el, 'net', 'year')).toBe('£25,119.60');
  });

  it('announces the take-home pay in a polite live region and keeps the results table out of it', () => {
    const el = mount();
    const live = el.querySelector('[data-shm-live]') as HTMLElement;
    expect(live.getAttribute('role')).toBe('status');
    expect(live.getAttribute('aria-live')).toBe('polite');
    expect(el.querySelector('[data-shm-results]')!.closest('[aria-live]')).toBeNull();
    expect(live.textContent).toBe('');
    enter(el, { amount: '30000' });
    calculate(el);
    expect(live.textContent).toContain('£25,119.60');
    expect(live.textContent).toContain('Take-home pay');
    calculate(el);
    enter(el, { amount: '' });
    calculate(el);
    expect(live.textContent).toBe('');
  });

  it('marks the field behind an error and links it to the message', () => {
    const el = mount();
    calculate(el);
    const err = el.querySelector('[data-shm-error]') as HTMLElement;
    expect(err.getAttribute('role')).toBe('alert');
    expect(f(el, 'amount').getAttribute('aria-invalid')).toBe('true');
    expect(f(el, 'amount').getAttribute('aria-describedby')).toBe(err.id);
    enter(el, { amount: '30000' });
    expect(f(el, 'amount').hasAttribute('aria-invalid')).toBe(false);
    expect(f(el, 'amount').hasAttribute('aria-describedby')).toBe(false);
    enter(el, { amount: '20', period: 'hourly', hours: '0' });
    calculate(el);
    expect(f(el, 'hours').getAttribute('aria-invalid')).toBe('true');
    expect(f(el, 'amount').hasAttribute('aria-invalid')).toBe(false);
  });

  it('gives every input a visible label wrapping it, and no two copies share an error id', () => {
    document.body.innerHTML = '<div id="a"></div><div id="b"></div>';
    load();
    const a = mountOne(document.getElementById('a')!, {});
    const b = mountOne(document.getElementById('b')!, {});
    for (const input of a.querySelectorAll('[data-f]')) {
      const wrapper = input.closest('label');
      expect(wrapper, input.getAttribute('data-f')!).not.toBeNull();
      expect(wrapper!.textContent!.trim().length).toBeGreaterThan(0);
    }
    expect(a.querySelector('[data-shm-error]')!.id).not.toBe(b.querySelector('[data-shm-error]')!.id);
  });

  it('a re-run on the same element cancels the previous run: no stacked handlers, no stray timer', () => {
    vi.useFakeTimers();
    const el = mount();
    enter(el, { amount: '30000' });
    calculate(el);
    const input = f(el, 'amount');
    input.value = '1';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    (window as unknown as Win).ShazammeWidget[NAME]({ element: el, data: { config: { calcButton: 'Go' } } });
    const before = cell(el, 'gross', 'year');
    vi.advanceTimersByTime(1000);
    vi.useRealTimers();
    expect(cell(el, 'gross', 'year')).toBe(before);
    expect(el.querySelector('[data-shm-calc]')!.textContent).toBe('Go');
  });

  it('announces again when Calculate is pressed twice with the same values, and stays quiet on the first load', () => {
    const quiet = mount({ defaultAmount: 30000 });
    expect((quiet.querySelector('[data-shm-live]') as HTMLElement).textContent).toBe('');
    expect(cell(quiet, 'net', 'year')).not.toBe('');
    const el = mount();
    const live = el.querySelector('[data-shm-live]') as HTMLElement;
    enter(el, { amount: '30000' });
    calculate(el);
    const first = live.textContent;
    calculate(el);
    expect(live.textContent).not.toBe(first);
    expect(live.textContent!.trim()).toBe(first!.trim());
  });

  it('removes its listeners itself on a re-run, without relying on AbortSignal support', () => {
    const el = mount();
    const root = el.querySelector('[data-shm-salary]') as HTMLElement;
    const added: string[] = [];
    const removed: string[] = [];
    const add = root.addEventListener.bind(root);
    const remove = root.removeEventListener.bind(root);
    root.addEventListener = ((t: string, h: any, o?: any) => { added.push(t); return add(t, h, o); }) as typeof root.addEventListener;
    root.removeEventListener = ((t: string, h: any, o?: any) => { removed.push(t); return remove(t, h, o); }) as typeof root.removeEventListener;
    (window as unknown as Win).ShazammeWidget[NAME]({ element: el, data: { config: {} } });
    expect(removed.sort()).toEqual(['change', 'click', 'input', 'keydown']);
    expect(added.sort()).toEqual(['change', 'click', 'input', 'keydown']);
  });

  it('re-running after the editor replaces the markup binds the new markup once', () => {
    const el = mount();
    const win = window as unknown as Win;
    el.innerHTML = render({ title: 'Edited' });
    win.ShazammeWidget[NAME]({ element: el, data: { config: { title: 'Edited' }, inEditor: true } });
    expect(el.querySelector('.shm-sc-title')!.textContent).toBe('Edited');
    enter(el, { amount: '30000' });
    calculate(el);
    expect(cell(el, 'net', 'year')).toBe('£25,119.60');
  });
});

describe('uk salary calculator settings', () => {
  const prompts = ['1-content-labels', '2-content-results', '3-content-options'].map((n) => readFileSync(join(here, `duda-ai-prompt-${n}.md`), 'utf8')).join('\n');
  const promptKeys = new Set([...prompts.matchAll(/\| key: (\w+)/g)].map((m) => m[1]));

  it('lists in the Content Editor prompts every key the code and the HTML read, and no others', () => {
    const keys = new Set<string>([...SETTINGS_SRC.matchAll(/config\.(\w+)/g)].map((m) => m[1]));
    const defaults = SETTINGS_SRC.match(/DEFAULT_LABELS = \{([\s\S]*?)\n\} as const/)![1];
    for (const m of defaults.matchAll(/^\s{2}(\w+):/gm)) keys.add(m[1]);
    for (const m of HBS.matchAll(/\{\{(\w+)\}\}/g)) keys.add(m[1]);
    expect([...keys].sort()).toEqual([...promptKeys].sort());
  });

  it('keeps settings.json in step with the prompts and declares that no SDK is needed', () => {
    const manifest = JSON.parse(readFileSync(join(here, 'settings.json'), 'utf8')) as { sdk: boolean; fields: { key: string }[] };
    expect(manifest.sdk).toBe(false);
    expect(manifest.fields.map((x) => x.key).sort()).toEqual([...promptKeys].sort());
  });

  it('uses root Handlebars keys only, no blocks and no config prefix', () => {
    expect(HBS).not.toMatch(/config\./);
    expect(HBS).not.toMatch(/\{\{[#/^>]/);
  });
});

// @vitest-environment jsdom
// jobs-by-industry runs the built bundle (index.ts) against the markup Duda renders from content.hbs. Tabs follow the ARIA tabs
// pattern, each tab counts its live roles, the panel shows the profession's blurb, picture and newest job cards, and text and
// links are escaped and guarded.

import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it, expect, beforeEach } from 'vitest';
import { payFor } from './index';

const here = dirname(fileURLToPath(import.meta.url));
const VERSION = JSON.parse(readFileSync(join(here, '..', '..', 'package.json'), 'utf8')).version as string;
const BUNDLE = readFileSync(join(here, '..', '..', 'dist', 'jobs-by-industry', VERSION, 'widget.min.js'), 'utf8');
const read = (f: string) => readFileSync(join(here, f), 'utf8');
const SHELL = read('content.hbs').replace(/\{\{#each industries\}\}[\s\S]*?\{\{\/each\}\}/, '');

type Win = Record<string, any>;
type Row = Record<string, unknown>;

const job = (jobName: string, category: string, extra: Row = {}): Row => ({
  jobName, category, city: 'Perth', state: 'WA', country: 'Australia', workType: 'Permanent', workModel: 'Onsite',
  salaryText: '$160,000 + super', addedOnUTC: '2026-11-01T00:00:00', ...extra,
});

const JOBS: Row[] = [
  job('Marketing Manager', 'Marketing', { addedOnUTC: '2026-11-05T00:00:00' }),
  job('Brand Lead', 'Marketing', { addedOnUTC: '2026-11-09T00:00:00' }),
  job('Site Manager', 'Construction'),
  job('Project Engineer', 'Construction', { addedOnUTC: '2026-11-03T00:00:00' }),
  job('Estimator', 'Construction', { addedOnUTC: '2026-11-02T00:00:00' }),
  job('Nurse', 'Healthcare'),
  job('Closed Role', 'Healthcare', { activeStatus: false }),
  job('No Category', ''),
];

function sdk(rows: Row[] | Error = JOBS) {
  const calls: Array<Record<string, unknown>> = [];
  return {
    calls,
    site: async () => ({ siteID: 'site-1' }),
    fetch: async (d: Record<string, unknown>) => {
      calls.push(d);
      if (rows instanceof Error) throw rows;
      return rows.map((r, i) => ({ page_item_url: `role-${i}-slug`, data: { activeStatus: true, ...r } }));
    },
  };
}

async function mount(config: Record<string, unknown>, opts: { inEditor?: boolean; shazamme?: unknown; html?: string } = {}) {
  const win = window as unknown as Win;
  win.document.body.innerHTML = `<div id="widget">${opts.html ?? SHELL}</div>`;
  delete win.ShazammeWidget;
  delete win.__shmSiteJobs;
  win.eval(BUNDLE.replace('"use strict";', ''));
  const element = win.document.getElementById('widget')!;
  await win.ShazammeWidget['jobs-by-industry']({ element, data: { config, inEditor: !!opts.inEditor }, $: undefined, shazamme: 'shazamme' in opts ? opts.shazamme : sdk() });
  return element;
}
const tabs = (el: Element) => [...el.querySelectorAll('[role="tab"]')] as HTMLButtonElement[];
const names = (el: Element) => tabs(el).map((t) => t.querySelector('.shm-jbi-tab-name')!.textContent);
const cards = (el: Element) => [...el.querySelectorAll('.shm-jbi-card-title')].map((c) => c.textContent);
const key = (t: Element, k: string) => t.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true }));
const selected = (el: Element) => tabs(el).findIndex((t) => t.getAttribute('aria-selected') === 'true');

describe('jobs-by-industry bundle', () => {
  beforeEach(() => { document.body.innerHTML = ''; });

  it('lists professions with live jobs, most roles first then A to Z, each with its count', async () => {
    const el = await mount({});
    expect(names(el)).toEqual(['Construction', 'Marketing', 'Healthcare']);
    expect([...el.querySelectorAll('.shm-jbi-tab-count')].map((c) => c.textContent)).toEqual(['3 live roles', '2 live roles', '1 live role']);
  });

  it('reads the site feed from the site id path', async () => {
    const s = sdk();
    await mount({}, { shazamme: s });
    expect(s.calls[0]).toMatchObject({ path: '/job-results/site-1', isExternal: true });
  });

  it('shows the first industry in the panel with its newest jobs, newest first', async () => {
    const el = await mount({});
    expect(el.querySelector('.shm-jbi-title')!.textContent).toBe('Construction');
    expect(cards(el)).toEqual(['Project Engineer', 'Estimator', 'Site Manager']);
    expect(el.querySelector('.shm-jbi-panel')!.getAttribute('aria-labelledby')).toBe(tabs(el)[0].id);
  });

  it('does not encode an already encoded job address twice', async () => {
    const rows = [job('Odd', 'Data')];
    const s = sdk(rows);
    const wrapped = { ...s, fetch: async () => [{ page_item_url: 'senior%20dev-1', data: { ...rows[0], activeStatus: true } }] };
    const el = await mount({}, { shazamme: wrapped });
    expect(el.querySelector('.shm-jbi-card')!.getAttribute('href')).toBe('/job-details/senior%20dev-1');
  });

  it('keeps the old tabs working until new content is ready', async () => {
    const win = window as unknown as Win;
    const el = await mount({});
    const pending = win.ShazammeWidget['jobs-by-industry']({ element: el, data: { config: {}, inEditor: true }, shazamme: { site: () => new Promise(() => {}), fetch: async () => [] } });
    tabs(el)[1].click();
    expect(selected(el)).toBe(1);
    void pending;
  });

  it('gives each job card its location, chips, salary and a link to the job page', async () => {
    const el = await mount({ detailsPage: '/jobs/' });
    const card = el.querySelector('.shm-jbi-card') as HTMLAnchorElement;
    expect(card.querySelector('.shm-jbi-card-where')!.textContent).toBe('Perth, WA');
    expect(card.querySelector('.is-type')!.textContent).toBe('Permanent');
    expect(card.querySelector('.is-model')!.textContent).toBe('Onsite');
    expect(card.querySelector('.shm-jbi-card-pay')!.textContent).toBe('$160,000 + super');
    expect(card.getAttribute('href')).toMatch(/^\/jobs\/role-\d-slug$/);
  });

  it('follows the ARIA tabs pattern: roles, selected state, roving tabindex, linked panel', async () => {
    const el = await mount({});
    const list = el.querySelector('[role="tablist"]')!;
    expect(list.getAttribute('aria-label')).toBe('Industries');
    expect(tabs(el).map((t) => [t.getAttribute('aria-selected'), t.tabIndex])).toEqual([['true', 0], ['false', -1], ['false', -1]]);
    const panel = el.querySelector('[role="tabpanel"]')!;
    expect(tabs(el).every((t) => t.getAttribute('aria-controls') === panel.id)).toBe(true);
  });

  it('switches panel on click', async () => {
    const el = await mount({});
    tabs(el)[1].click();
    expect(selected(el)).toBe(1);
    expect(el.querySelector('.shm-jbi-title')!.textContent).toBe('Marketing');
    expect(cards(el)).toEqual(['Brand Lead', 'Marketing Manager']);
  });

  it('moves with the arrow keys, wraps around, and jumps with Home and End', async () => {
    const el = await mount({});
    key(tabs(el)[0], 'ArrowDown');
    expect(selected(el)).toBe(1);
    expect(document.activeElement).toBe(tabs(el)[1]);
    key(tabs(el)[1], 'ArrowDown');
    key(tabs(el)[2], 'ArrowDown');
    expect(selected(el)).toBe(0);
    key(tabs(el)[0], 'ArrowUp');
    expect(selected(el)).toBe(2);
    key(tabs(el)[2], 'Home');
    expect(selected(el)).toBe(0);
    key(tabs(el)[0], 'End');
    expect(selected(el)).toBe(2);
    key(tabs(el)[2], 'ArrowLeft');
    expect(selected(el)).toBe(1);
    key(tabs(el)[1], 'ArrowRight');
    expect(selected(el)).toBe(2);
  });

  it('ignores other keys', async () => {
    const el = await mount({});
    key(tabs(el)[0], 'a');
    expect(selected(el)).toBe(0);
  });

  it('limits industries and jobs per industry, and clamps garbage settings', async () => {
    const el = await mount({ maxProfessions: '2', maxJobs: '1' });
    expect(names(el)).toEqual(['Construction', 'Marketing']);
    expect(cards(el)).toHaveLength(1);
    const bad = await mount({ maxProfessions: 'lots', maxJobs: '-3' });
    expect(names(bad)).toHaveLength(3);
    expect(cards(bad).length).toBeGreaterThanOrEqual(1);
  });

  it('the count under a tab is every live role, not only the ones shown as cards', async () => {
    const el = await mount({ maxJobs: '1' });
    expect(tabs(el)[0].querySelector('.shm-jbi-tab-count')!.textContent).toBe('3 live roles');
  });

  it('shows the blurb and picture set for a profession, matched without regard to case', async () => {
    const el = await mount({ industries: [{ name: ' CONSTRUCTION ', blurb: 'Builders & engineers.', image: 'https://example.com/a.jpg' }] });
    expect(el.querySelector('.shm-jbi-blurb')!.textContent).toBe('Builders & engineers.');
    expect(el.querySelector('img.shm-jbi-bg')!.getAttribute('src')).toBe('https://example.com/a.jpg');
    expect(el.querySelector('img.shm-jbi-bg')!.getAttribute('alt')).toBe('');
    tabs(el)[2].click();
    expect(el.querySelector('.shm-jbi-blurb')).toBeNull();
    expect(el.querySelector('img.shm-jbi-bg')).toBeNull();
  });

  it('uses the fallback picture, and refuses an unsafe picture address', async () => {
    const el = await mount({ defaultImage: 'https://example.com/d.jpg', industries: [{ name: 'Construction', image: 'javascript:alert(1)' }] });
    expect(el.querySelector('img.shm-jbi-bg')!.getAttribute('src')).toBe('https://example.com/d.jpg');
  });

  it('reads industry details from the rendered source markup when the setting is not an array', async () => {
    const html = SHELL.replace('<div class="shm-jbi-sources">', '<div class="shm-jbi-sources"><div class="shm-jbi-src"><span data-f="name">Construction</span><span data-f="blurb">From HTML</span><span data-f="image"></span></div>');
    const el = await mount({}, { html });
    expect(el.querySelector('.shm-jbi-blurb')!.textContent).toBe('From HTML');
  });

  it('draws the See all button with the live total, and hides it when switched off', async () => {
    const el = await mount({});
    const all = el.querySelector('a.shm-jbi-all') as HTMLAnchorElement;
    expect(all.textContent).toBe('See all 7 roles');
    expect(all.getAttribute('href')).toBe('/job-results');
    const custom = await mount({ seeAllText: 'All {count} jobs', seeAllUrl: 'javascript:alert(1)' });
    expect(custom.querySelector('.shm-jbi-all')!.textContent).toBe('All 7 jobs');
    expect(custom.querySelector('.shm-jbi-all')!.getAttribute('href')).toBe('/job-results');
    const off = await mount({ showSeeAll: 'false' });
    expect(off.querySelector('.shm-jbi-all')).toBeNull();
  });

  it('formats location three ways', async () => {
    const f = async (locationFormat: string) => (await mount({ locationFormat })).querySelector('.shm-jbi-card-where')!.textContent;
    expect(await f('city-state')).toBe('Perth, WA');
    expect(await f('city-country')).toBe('Perth, Australia');
    expect(await f('city-state-country')).toBe('Perth, WA, Australia');
  });

  it('falls back to a formatted salary range when there is no salary text, and hides salary on request', async () => {
    const rows = [job('Analyst', 'Data', { salaryText: null, isDisplaySalary: true, salaryFrom: 90000, salaryTo: 110000, currencyCode: 'AUD' })];
    const el = await mount({}, { shazamme: sdk(rows) });
    expect(el.querySelector('.shm-jbi-card-pay')!.textContent).toMatch(/90,000.*–.*110,000/);
    const hidden = await mount({ showSalary: 'false' }, { shazamme: sdk(rows) });
    expect(hidden.querySelector('.shm-jbi-card-pay')).toBeNull();
    const undisclosed = await mount({}, { shazamme: sdk([job('X', 'Data', { salaryText: null, isDisplaySalary: false, salaryFrom: 1, salaryTo: 2 })]) });
    expect(undisclosed.querySelector('.shm-jbi-card-pay')).toBeNull();
  });

  it('puts the amount in front of the advert wording, as the live feed sends it ("+ super" only)', async () => {
    const rows = [job('Financial Controller', 'Finance', { salaryText: '+ super', isDisplaySalary: true, salaryFrom: '150000', salaryTo: '170000', currencyCode: 'AUD', currencySymbol: 'AUD' })];
    const el = await mount({}, { shazamme: sdk(rows) });
    expect(el.querySelector('.shm-jbi-card-pay')!.textContent).toBe('$150,000 – $170,000 + super');
  });

  it('leaves out jobs whose activeStatus is the string "false" (intended change in core/site-jobs)', async () => {
    const rows = [job('Nurse', 'Healthcare'), job('Closed Text', 'Healthcare', { activeStatus: 'false' }), job('Open Text', 'Healthcare', { activeStatus: 'true' })];
    const el = await mount({}, { shazamme: sdk(rows) });
    expect(cards(el)).toEqual(expect.arrayContaining(['Nurse', 'Open Text']));
    expect(cards(el)).not.toContain('Closed Text');
    expect(el.querySelector('.shm-jbi-tab-count')!.textContent).toBe('2 live roles');
  });

  it('salary (3a) shows standalone wording as written even when there is a range', async () => {
    const rows = [job('Analyst', 'Data', { salaryText: 'Negotiable depending on experience', isDisplaySalary: true, salaryFrom: 90000, salaryTo: 110000, currencyCode: 'AUD' })];
    const el = await mount({}, { shazamme: sdk(rows) });
    expect(el.querySelector('.shm-jbi-card-pay')!.textContent).toBe('Negotiable depending on experience');
  });

  it('salary (3c) falls back to the salary field, and reads a row with no currency as AUD, as before', () => {
    expect(payFor({ salaryText: '', salary: '$95,000 + super', salaryFrom: 95000 })).toBe('$95,000 + super');
    expect(payFor({ salary: 'per annum + super', salaryFrom: 95000, salaryTo: 105000 })).toBe('$95,000 – $105,000 per annum + super');
    expect(payFor({ salaryText: null, salaryFrom: 90000, salaryTo: 110000 })).toBe('$90,000 – $110,000');
    expect(payFor({ salaryFrom: 90000, salaryTo: 110000, currencySymbol: '£' })).toBe('£90,000 – £110,000');
    expect(payFor({ salaryFrom: 90000, salaryTo: 110000, currencySymbol: 'NZD' })).toBe('$90,000 – $110,000');
    expect(payFor({ salaryFrom: 90000, salaryTo: 110000, currencyCode: 'GBP' })).toBe('£90,000 – £110,000');
  });

  it('salary (3f) hides the wording when the advert hides its salary (intended change: it used to show)', () => {
    expect(payFor({ salaryText: 'Competitive', isDisplaySalary: false })).toBe('');
    expect(payFor({ salary: '$95,000', isDisplaySalary: 'false' })).toBe('');
  });

  it('escapes job and industry text instead of rendering it as HTML', async () => {
    const rows = [job('<img src=x onerror=alert(1)>', '<b>Evil</b>', { city: '"><script>', salaryText: '<i>$</i>' })];
    const el = await mount({ industries: [{ name: '<b>Evil</b>', blurb: '<u>hi</u>' }] }, { shazamme: sdk(rows) });
    expect(el.querySelector('img')).toBeNull();
    expect(el.querySelector('b, i, u, script')).toBeNull();
    expect(el.querySelector('.shm-jbi-title')!.textContent).toBe('<b>Evil</b>');
    expect(el.querySelector('.shm-jbi-blurb')!.textContent).toBe('<u>hi</u>');
  });

  it('uses the chosen heading level for the industry name', async () => {
    const el = await mount({ headingTag: 'h2' });
    expect(el.querySelector('h2.shm-jbi-title')).not.toBeNull();
    const bad = await mount({ headingTag: 'script' });
    expect(bad.querySelector('h3.shm-jbi-title')).not.toBeNull();
  });

  it('shows an editor message with no jobs, and nothing on the live site', async () => {
    const editor = await mount({}, { inEditor: true, shazamme: sdk([]) });
    expect(editor.querySelector('.shm-jbi-empty')!.textContent).toContain('no live jobs');
    const live = await mount({}, { shazamme: sdk([]) });
    expect(live.querySelector('.shm-jbi-stage')!.innerHTML).toBe('');
  });

  it('does not crash when the SDK is missing or the feed fails', async () => {
    const none = await mount({}, { inEditor: true, shazamme: undefined });
    expect(none.querySelector('.shm-jbi-empty')).not.toBeNull();
    const failing = await mount({}, { inEditor: true, shazamme: sdk(new Error('boom')) });
    expect(failing.querySelector('.shm-jbi-empty')).not.toBeNull();
  });

  it('re-running does not stack listeners: one click selects once, and two copies stay independent', async () => {
    const win = window as unknown as Win;
    win.document.body.innerHTML = `<div id="a">${SHELL}</div><div id="b">${SHELL}</div>`;
    delete win.ShazammeWidget;
    delete win.__shmSiteJobs;
    win.eval(BUNDLE.replace('"use strict";', ''));
    const [a, b] = ['a', 'b'].map((id) => win.document.getElementById(id)!);
    const run = (element: Element, config: Row) => win.ShazammeWidget['jobs-by-industry']({ element, data: { config, inEditor: true }, shazamme: sdk() });
    await run(a, {});
    await run(a, { maxProfessions: '2' });
    await run(b, { maxProfessions: '1' });
    expect(names(a)).toHaveLength(2);
    expect(names(b)).toHaveLength(1);
    let renders = 0;
    new MutationObserver(() => { renders += 1; }).observe(a.querySelector('.shm-jbi-panel')!, { childList: true });
    tabs(a)[1].click();
    await Promise.resolve();
    expect(renders).toBeLessThanOrEqual(2);
    expect(selected(a)).toBe(1);
    expect(selected(b)).toBe(0);
  });
});

describe('jobs-by-industry settings', () => {
  const manifest = JSON.parse(read('settings.json')) as { fields: Array<{ key: string }>; itemKeys: Array<{ key: string }> };
  const promptKeys = ['duda-ai-prompt-1-content.md', 'duda-ai-prompt-2-industries.md'].flatMap((f) => [...read(f).matchAll(/key: (\w+)/g)].map((m) => m[1]));
  const codeKeys = [...read('index.ts').matchAll(/config\.(\w+)/g)].map((m) => m[1]);

  it('has the same keys in the code, settings.json, the HTML source markup and the Content editor prompts', () => {
    const all = [...manifest.fields, ...manifest.itemKeys].map((f) => f.key).sort();
    expect([...new Set(promptKeys)].sort()).toEqual(all);
    expect([...new Set(codeKeys)].sort()).toEqual(manifest.fields.map((f) => f.key).sort());
    const hbsKeys = [...read('content.hbs').matchAll(/data-f="(\w+)"/g)].map((m) => m[1]).sort();
    expect(hbsKeys).toEqual(manifest.itemKeys.map((f) => f.key).sort());
  });
});

// @vitest-environment jsdom
// job-board runs the built bundle (index.ts) against the markup Duda renders from content.hbs: the Jobs collection
// first and the job feed as fallback, filters with live counts, the page address, sort, pages, the mobile sheet's
// keyboard handling, escaping, and the settings, prompts and code agreeing on every key.

import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it, expect, beforeEach } from 'vitest';

const here = dirname(fileURLToPath(import.meta.url));
const VERSION = JSON.parse(readFileSync(join(here, '..', '..', 'package.json'), 'utf8')).version as string;
const BUNDLE = readFileSync(join(here, '..', '..', 'dist', 'job-board', VERSION, 'widget.min.js'), 'utf8');
const SHELL = readFileSync(join(here, 'content.hbs'), 'utf8');

type Win = Record<string, any>;
type Row = Record<string, unknown>;

const row = (n: number, f: Row): Row => ({ jobName: `Job ${n}`, activeStatus: true, addedOnUTC: `2026-11-${String(10 + n).padStart(2, '0')}T00:00:00`, ...f });
const ROWS: Row[] = [
  row(1, { category: 'Finance', workType: 'Permanent', workModel: 'Hybrid', city: 'Sydney', state: 'NSW', country: 'Australia', salaryFrom: '150000', salaryTo: '170000', salaryText: '+ super', currencyCode: 'AUD', currencySymbol: 'AUD', salaryType: 'Annual', isDisplaySalary: true }),
  row(2, { category: 'Finance', workType: 'Contract', workModel: 'Onsite', city: 'Brisbane', state: 'QLD', country: 'Australia', salaryFrom: '55', salaryTo: '65', salaryText: 'per hour + super', currencyCode: 'AUD', salaryType: 'Hourly', isDisplaySalary: true }),
  row(3, { category: 'IT', workType: 'Permanent', workModel: 'Remote', city: 'London', country: 'United Kingdom', jobName: 'Cloud Engineer' }),
  row(4, { category: 'IT', workType: 'Contract', workModel: 'Remote', city: 'Melbourne', state: 'VIC', country: 'Australia' }),
  row(5, { category: 'Mining', workType: 'Permanent', workModel: 'Onsite', city: 'Perth', state: 'WA', country: 'Australia' }),
  row(6, { category: 'Closed', activeStatus: false }),
];

function sdk(rows: Row[] | Error = ROWS) {
  const calls: Row[] = [];
  return {
    calls,
    site: async () => ({ siteID: 'site-1' }),
    fetch: async (d: Row) => {
      calls.push(d);
      if (rows instanceof Error) throw rows;
      return rows.map((r, i) => ({ page_item_url: `job-${i + 1}`, data: r }));
    },
  };
}

/** Duda's Collections API: data(name).pageSize(n).pageNumber(p).get(), 100 rows a page at most. */
function dmApi(rows: Row[] | Error, size = 2) {
  const asked: Array<{ name: string; page: number }> = [];
  const query = (name: string) => {
    let page = 0;
    const q = {
      pageSize: () => q,
      pageNumber: (p: number) => ((page = p), q),
      get: async () => {
        asked.push({ name, page });
        if (rows instanceof Error) throw rows;
        const values = rows.slice(page * size, page * size + size).map((r, i) => ({ page_item_url: `c-${page * size + i + 1}`, data: r }));
        return { values, page: { totalPages: Math.ceil(rows.length / size) } };
      },
    };
    return q;
  };
  return { asked, loadCollectionsAPI: async () => ({ data: query }) };
}

const tick = () => new Promise((r) => setTimeout(r, 0));

async function mount(config: Row = {}, opts: { inEditor?: boolean; shazamme?: unknown; dm?: unknown; url?: string; id?: string; keep?: boolean } = {}) {
  const win = window as unknown as Win;
  if (!opts.keep) {
    win.document.body.innerHTML = '';
    delete win.ShazammeWidget;
    delete win.__shmSiteJobs;
    win.eval(BUNDLE.replace('"use strict";', ''));
  }
  if ('dm' in opts) win.dmAPI = opts.dm;
  else delete win.dmAPI;
  win.history.replaceState(null, '', opts.url ?? '/jobs');
  const host = win.document.createElement('div');
  host.id = opts.id ?? 'widget';
  host.innerHTML = SHELL;
  win.document.body.appendChild(host);
  await win.ShazammeWidget['job-board']({ element: host, data: { config, inEditor: !!opts.inEditor }, $: undefined, shazamme: 'shazamme' in opts ? opts.shazamme : sdk() });
  return host as HTMLElement;
}

const titles = (el: Element) => [...el.querySelectorAll('.shm-jb-card-title')].map((t) => t.textContent);
const checkbox = (el: Element, group: string, value: string) =>
  [...el.querySelectorAll<HTMLInputElement>(`.shm-jb-check[data-group="${group}"]`)].find((c) => c.value === value)!;
const option = (el: Element, group: string) =>
  [...el.querySelectorAll(`.shm-jb-group[data-group="${group}"] .shm-jb-option`)].map((o) => `${o.querySelector('.shm-jb-option-name')!.textContent} ${o.querySelector('.shm-jb-option-count')!.textContent}`);
const tickBox = (box: HTMLInputElement) => { box.checked = !box.checked; box.dispatchEvent(new Event('change', { bubbles: true })); };
const press = (key: string, shiftKey = false) => document.dispatchEvent(new KeyboardEvent('keydown', { key, shiftKey, bubbles: true, cancelable: true }));

describe('job-board bundle', () => {
  beforeEach(() => { document.body.innerHTML = ''; document.body.style.overflow = ''; });

  it('shows the live jobs as cards, newest first, with the salary amount before its wording', async () => {
    const el = await mount();
    expect(titles(el)).toEqual(['Job 5', 'Job 4', 'Cloud Engineer', 'Job 2', 'Job 1']);
    const first = [...el.querySelectorAll('.shm-jb-card')].find((c) => c.textContent!.includes('Job 1'))!;
    expect(first.querySelector('.shm-jb-card-pay')!.textContent).toBe('$150,000 – $170,000 + super');
    expect(first.querySelector('.shm-jb-card-label')!.textContent).toBe('Finance');
    expect(first.getAttribute('href')).toBe('/job-details/job-1');
    expect(el.querySelector('.shm-jb-count')!.textContent).toBe('5 jobs');
    expect(el.querySelector('.shm-jb')!.classList.contains('is-ready')).toBe(true);
  });

  it('reads every page of the Jobs collection when it is on the page, and says so in the editor', async () => {
    const dm = dmApi(ROWS, 2);
    const s = sdk();
    const el = await mount({}, { dm, shazamme: s, inEditor: true });
    expect(dm.asked).toEqual([{ name: 'Jobs', page: 0 }, { name: 'Jobs', page: 1 }, { name: 'Jobs', page: 2 }]);
    expect(s.calls).toHaveLength(0);
    expect(titles(el)).toHaveLength(5);
    expect(el.querySelector('.shm-jb-card')!.getAttribute('href')).toMatch(/^\/job-details\/c-\d$/);
    expect(el.querySelector('.shm-jb-note')!.textContent).toBe('Connected to the "Jobs" collection: 5 live jobs.');
  });

  it('falls back to the job feed when the collection cannot be read or is empty, and when the name is cleared', async () => {
    const s1 = sdk();
    const el = await mount({ jobsCollection: 'Vacancies' }, { dm: dmApi(new Error('No collection')), shazamme: s1, inEditor: true });
    expect(s1.calls[0]).toMatchObject({ path: '/job-results/site-1' });
    expect(el.querySelector('.shm-jb-note')!.textContent).toContain('job feed (the "Vacancies" collection could not be read');
    const s2 = sdk();
    await mount({}, { dm: dmApi([]), shazamme: s2 });
    expect(s2.calls).toHaveLength(1);
    const dm = dmApi(ROWS);
    await mount({ jobsCollection: '' }, { dm, shazamme: sdk() });
    expect(dm.asked).toHaveLength(0);
  });

  it('renders with no settings and no data source without crashing, with a note in the editor', async () => {
    const el = await mount({}, { shazamme: undefined, inEditor: true });
    expect(el.querySelector('.shm-jb-note')!.textContent).toMatch(/could not read any jobs/);
    expect(el.querySelector('.shm-jb-empty-title')!.textContent).toBe('There are no live jobs right now. Check back soon.');
    const live = await mount({}, { shazamme: undefined });
    expect(live.querySelector('.shm-jb-note')!.hasAttribute('hidden')).toBe(true);
  });

  it('shows the no-jobs message when the site has no live jobs', async () => {
    const el = await mount({ noJobsText: 'Nothing open' }, { shazamme: sdk([]) });
    expect(el.querySelector('.shm-jb-empty-title')!.textContent).toBe('Nothing open');
    expect(el.querySelector('.shm-jb-count')!.textContent).toBe('0 jobs');
  });

  it('filters with ticks, recounts the other groups, and puts the filters in the address', async () => {
    const el = await mount();
    expect(option(el, 'workType')).toEqual(['Permanent 3', 'Contract 2']);
    tickBox(checkbox(el, 'profession', 'Finance'));
    expect(titles(el)).toEqual(['Job 2', 'Job 1']);
    expect(option(el, 'workType')).toEqual(['Permanent 1', 'Contract 1']);
    expect(option(el, 'profession')).toEqual(['Finance 2', 'IT 2', 'Mining 1']);
    tickBox(checkbox(el, 'profession', 'Mining'));
    tickBox(checkbox(el, 'workType', 'Permanent'));
    expect(titles(el)).toEqual(['Job 5', 'Job 1']);
    expect(window.location.search).toBe('?profession=Finance&profession=Mining&workType=Permanent');
    expect(document.activeElement).toBe(checkbox(el, 'workType', 'Permanent'));
    expect(el.querySelector('.shm-jb-open-count')!.textContent).toBe('(3)');
  });

  it('greys out an option no job would match, and keeps it tickable once ticked', async () => {
    const el = await mount();
    tickBox(checkbox(el, 'workModel', 'Hybrid'));
    expect(checkbox(el, 'city', 'Perth').disabled).toBe(true);
    expect(checkbox(el, 'workModel', 'Hybrid').disabled).toBe(false);
  });

  it('starts from the address Job Search Hero sends, and Back restores the earlier search', async () => {
    const el = await mount({}, { url: '/jobs?keyword=job&workType=Contract' });
    expect(titles(el)).toEqual(['Job 4', 'Job 2']);
    expect(el.querySelector<HTMLInputElement>('[name=keyword]')!.value).toBe('job');
    expect(checkbox(el, 'workType', 'Contract').checked).toBe(true);
    tickBox(checkbox(el, 'workType', 'Contract'));
    expect(titles(el)).toHaveLength(4);
    window.history.replaceState(null, '', '/jobs?keyword=job&workType=Contract');
    window.dispatchEvent(new PopStateEvent('popstate'));
    expect(titles(el)).toEqual(['Job 4', 'Job 2']);
    expect(checkbox(el, 'workType', 'Contract').checked).toBe(true);
  });

  it('searches by keyword and location when the form is sent', async () => {
    const el = await mount();
    el.querySelector<HTMLInputElement>('[name=keyword]')!.value = 'cloud';
    el.querySelector('form')!.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    expect(titles(el)).toEqual(['Cloud Engineer']);
    el.querySelector<HTMLInputElement>('[name=keyword]')!.value = '';
    el.querySelector<HTMLInputElement>('[name=location]')!.value = 'qld';
    el.querySelector('form')!.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    expect(titles(el)).toEqual(['Job 2']);
    expect(window.location.search).toBe('?location=qld');
  });

  it('shows the empty message with a clear button when nothing matches, and clearing brings every job back', async () => {
    const el = await mount({}, { url: '/jobs?keyword=zzzz' });
    expect(el.querySelector('.shm-jb-grid')!.hasAttribute('hidden')).toBe(true);
    expect(el.querySelector('.shm-jb-empty-title')!.textContent).toBe('No jobs match your search');
    (el.querySelector('.shm-jb-empty .shm-jb-clear') as HTMLButtonElement).click();
    expect(titles(el)).toHaveLength(5);
    expect(el.querySelector<HTMLInputElement>('[name=keyword]')!.value).toBe('');
    expect(window.location.search).toBe('');
  });

  it('sorts by salary from the sort menu', async () => {
    const el = await mount();
    const sort = el.querySelector<HTMLSelectElement>('[name=sort]')!;
    sort.value = 'salary-high';
    sort.dispatchEvent(new Event('change', { bubbles: true }));
    expect(titles(el).slice(0, 2)).toEqual(['Job 1', 'Job 2']);
    expect(window.location.search).toBe('?sort=salary-high');
  });

  it('pages with numbered buttons, or adds jobs with load more', async () => {
    const el = await mount({ pageSize: '3' });
    expect(titles(el)).toHaveLength(3);
    expect(el.querySelector('.shm-jb-prev')!.hasAttribute('disabled')).toBe(true);
    (el.querySelector('.shm-jb-page[data-page="2"]') as HTMLButtonElement).click();
    expect(titles(el)).toEqual(['Job 2', 'Job 1']);
    expect(el.querySelector('.shm-jb-page.is-current')!.getAttribute('aria-current')).toBe('page');
    expect(window.location.search).toBe('?page=2');
    const more = await mount({ pageSize: '3', paging: 'loadmore' });
    (more.querySelector('.shm-jb-loadmore') as HTMLButtonElement).click();
    expect(titles(more)).toHaveLength(5);
    expect(more.querySelector('.shm-jb-loadmore')).toBeNull();
  });

  it('collapses a group and shows more options on request', async () => {
    const el = await mount({ optionsShown: '2', groupsOpen: 'first' });
    expect(el.querySelector('.shm-jb-group[data-group="workType"] .shm-jb-group-body')!.hasAttribute('hidden')).toBe(true);
    const toggle = el.querySelector<HTMLButtonElement>('.shm-jb-group[data-group="workType"] .shm-jb-toggle')!;
    toggle.click();
    expect(el.querySelector('.shm-jb-group[data-group="workType"] .shm-jb-toggle')!.getAttribute('aria-expanded')).toBe('true');
    const cityBody = () => el.querySelector('.shm-jb-group[data-group="city"] .shm-jb-group-body')!;
    expect(cityBody().hasAttribute('hidden')).toBe(true);
    el.querySelector<HTMLButtonElement>('.shm-jb-group[data-group="city"] .shm-jb-toggle')!.click();
    expect(cityBody().hasAttribute('hidden')).toBe(false);
    expect(option(el, 'city')).toEqual(['Brisbane 1', 'London 1']);
    el.querySelector<HTMLButtonElement>('.shm-jb-more[data-group="city"]')!.click();
    expect(option(el, 'city')).toHaveLength(5);
    expect(el.querySelector('.shm-jb-more[data-group="city"]')!.textContent).toBe('Show less');
  });

  it('opens the mobile sheet as a modal dialog: focus inside, Tab wraps, Esc closes and returns focus', async () => {
    const el = await mount();
    const opener = el.querySelector<HTMLButtonElement>('.shm-jb-open')!;
    const side = el.querySelector<HTMLElement>('.shm-jb-side')!;
    opener.click();
    expect(side.getAttribute('role')).toBe('dialog');
    expect(side.getAttribute('aria-modal')).toBe('true');
    expect(opener.getAttribute('aria-expanded')).toBe('true');
    expect(document.activeElement).toBe(el.querySelector('.shm-jb-close'));
    expect(document.body.style.overflow).toBe('hidden');
    expect(el.querySelector('.shm-jb-apply')!.textContent).toBe('Show 5 jobs');
    el.querySelector<HTMLButtonElement>('.shm-jb-apply')!.focus();
    press('Tab');
    expect(document.activeElement).toBe(el.querySelector('.shm-jb-close'));
    press('Tab', true);
    expect(document.activeElement).toBe(el.querySelector('.shm-jb-apply'));
    press('Escape');
    expect(side.hasAttribute('role')).toBe(false);
    expect(opener.getAttribute('aria-expanded')).toBe('false');
    expect(document.activeElement).toBe(opener);
    expect(document.body.style.overflow).toBe('');
  });

  it('the apply button and the backdrop close the sheet', async () => {
    const el = await mount();
    el.querySelector<HTMLButtonElement>('.shm-jb-open')!.click();
    tickBox(checkbox(el, 'profession', 'IT'));
    expect(el.querySelector('.shm-jb-apply')!.textContent).toBe('Show 2 jobs');
    el.querySelector<HTMLButtonElement>('.shm-jb-apply')!.click();
    expect(el.querySelector('.shm-jb-side')!.classList.contains('is-open')).toBe(false);
    el.querySelector<HTMLButtonElement>('.shm-jb-open')!.click();
    (el.querySelector('.shm-jb-backdrop') as HTMLElement).click();
    expect(el.querySelector('.shm-jb-side')!.classList.contains('is-open')).toBe(false);
  });

  it('escapes job text and refuses unsafe job page addresses', async () => {
    const evil = [row(1, { jobName: '<img src=x onerror=alert(1)>', category: '<b>x</b>', city: '"><script>', workType: '" onmouseover="x' })];
    const el = await mount({ detailsPage: 'javascript:alert(1)' }, { shazamme: sdk(evil) });
    expect(el.querySelector('img, script, b')).toBeNull();
    expect(el.querySelector('.shm-jb-card-title')!.textContent).toBe('<img src=x onerror=alert(1)>');
    expect(el.querySelector('.shm-jb-card')!.getAttribute('href')).toBe('/job-details/job-1');
    expect(checkbox(el, 'workType', '" onmouseover="x')).toBeTruthy();
  });

  it('hides the search, filters and sort when turned off', async () => {
    const el = await mount({ showSearch: 'false', showFilters: false, showSort: 'false' });
    expect(el.querySelector('.shm-jb-search, .shm-jb-side, .shm-jb-open, .shm-jb-sort')).toBeNull();
    expect(el.querySelector('.shm-jb-layout')!.classList.contains('is-wide')).toBe(true);
  });

  it('two copies on one page work on their own, and a re-run does not stack listeners', async () => {
    const a = await mount({ syncAddress: 'false' }, { id: 'a' });
    const b = await mount({ syncAddress: 'false' }, { id: 'b', keep: true });
    tickBox(checkbox(a, 'profession', 'Mining'));
    expect(titles(a)).toEqual(['Job 5']);
    expect(titles(b)).toHaveLength(5);
    expect(window.location.search).toBe('');
    const win = window as unknown as Win;
    await win.ShazammeWidget['job-board']({ element: b, data: { config: { syncAddress: 'false' } }, shazamme: sdk() });
    let pushes = 0;
    const real = window.history.pushState.bind(window.history);
    window.history.pushState = (...args: Parameters<History['pushState']>) => { pushes += 1; real(...args); };
    const c = await mount({}, { id: 'c', keep: true });
    await win.ShazammeWidget['job-board']({ element: c, data: { config: {} }, shazamme: sdk() });
    tickBox(checkbox(c, 'profession', 'IT'));
    window.history.pushState = real;
    expect(pushes).toBe(1);
    expect(titles(c)).toHaveLength(2);
  });

  it('does not write the address in the editor', async () => {
    const el = await mount({}, { inEditor: true });
    tickBox(checkbox(el, 'profession', 'IT'));
    expect(window.location.search).toBe('');
  });
});

describe('job-board settings, prompts and code agree', () => {
  const fields = (JSON.parse(readFileSync(join(here, 'settings.json'), 'utf8')) as { fields: Array<{ key: string; type: string; default: unknown; options?: string[] }> }).fields;
  const prompts = readdirSync(here).filter((f) => /^duda-ai-prompt-\d-.+\.md$/.test(f));
  const content = prompts.filter((f) => !f.includes('design')).map((f) => readFileSync(join(here, f), 'utf8')).join('\n');
  const promptKeys = [...content.matchAll(/\| key: ([A-Za-z0-9]+) \|/g)].map((m) => m[1]);
  const code = readFileSync(join(here, 'settings.ts'), 'utf8');
  const codeKeys = new Set([...code.matchAll(/config\.([A-Za-z0-9]+)|t\('([A-Za-z0-9]+)'/g)].map((m) => m[1] ?? m[2]));
  for (const m of code.matchAll(/(\w+): '(label[A-Za-z]+)'/g)) codeKeys.add(m[2]);

  it('every key the code reads is in settings.json and a Content prompt, once', () => {
    const keys = fields.map((f) => f.key);
    expect([...codeKeys].sort()).toEqual([...keys].sort());
    expect([...promptKeys].sort()).toEqual([...keys].sort());
  });

  it('the prompts carry the same defaults and options as settings.json', () => {
    for (const f of fields) {
      const line = content.split('\n').find((l) => l.includes(`| key: ${f.key} |`))!;
      const shown = typeof f.default === 'boolean' ? String(f.default) : String(f.default);
      expect(line, f.key).toContain(`| default: ${shown}`);
      if (f.options) expect(line, f.key).toContain(`| options: ${f.options.join(', ')}`);
    }
  });

  it('every Design prompt selector exists in the CSS', () => {
    const css = ['duda-css.reference.css', 'duda-css.desktop.reference.css', 'duda-css.mobile.reference.css'].map((f) => readFileSync(join(here, f), 'utf8')).join('\n');
    const design = prompts.filter((f) => f.includes('design')).map((f) => readFileSync(join(here, f), 'utf8')).join('\n');
    const selectors = [...design.matchAll(/\| selector: ([^|]+) \|/g)].map((m) => m[1].trim());
    expect(selectors.length).toBeGreaterThan(60);
    for (const sel of selectors) expect(css, sel).toContain(sel.split(':')[0]);
  });
});

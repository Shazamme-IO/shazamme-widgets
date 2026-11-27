// @vitest-environment jsdom
// live-stats runs the built bundle (index.ts) against the markup Duda renders from content.hbs. Typed tiles render as given,
// live tiles count the site's own data, a live tile with nothing to count is left out, and text and links are escaped and guarded.

import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it, expect, beforeEach } from 'vitest';

const here = dirname(fileURLToPath(import.meta.url));
const VERSION = JSON.parse(readFileSync(join(here, '..', '..', 'package.json'), 'utf8')).version as string;
const BUNDLE = readFileSync(join(here, '..', '..', 'dist', 'live-stats', VERSION, 'widget.min.js'), 'utf8');
const read = (f: string) => readFileSync(join(here, f), 'utf8');
const SHELL = read('content.hbs').replace(/\{\{#each tiles\}\}[\s\S]*?\{\{\/each\}\}/, '');

type Win = Record<string, any>;
type Row = Record<string, unknown>;

const JOBS: Row[] = [
  { category: 'Marketing', country: 'Australia' },
  { category: 'Marketing', country: 'United Kingdom' },
  { category: 'Healthcare', country: 'Australia' },
  { category: 'Mining', country: 'United States', activeStatus: false },
  { category: '', country: null },
];
const CONSULTANTS: Row[] = [{ isVisible: true }, { isVisible: true }, { isVisible: false }];

function sdk(opts: { jobs?: Row[] | Error; consultants?: Row[] | Error } = {}) {
  const calls: Array<Record<string, unknown>> = [];
  return {
    calls,
    site: async () => ({ siteID: 'site-1' }),
    fetch: async (d: Record<string, any>) => {
      calls.push(d);
      const src = d.name === 'Consultants' ? opts.consultants : opts.jobs;
      if (src instanceof Error) throw src;
      return (src ?? []).map((r, i) => ({ page_item_url: `row-${i}`, data: { activeStatus: true, ...r } }));
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
  await win.ShazammeWidget['live-stats']({ element, data: { config, inEditor: !!opts.inEditor }, $: undefined, shazamme: opts.shazamme });
  return element;
}
const tilesOf = (el: Element) => [...el.querySelectorAll('.shm-ls-tile')] as HTMLElement[];
const num = (t: Element) => t.querySelector('.shm-ls-number')?.textContent ?? null;

describe('live-stats bundle', () => {
  beforeEach(() => { document.body.innerHTML = ''; });

  it('renders a typed tile with number, label and line of text', async () => {
    const el = await mount({ tiles: [{ source: 'custom', value: '24', suffix: '.', label: 'Open', text: 'Roles today.' }] });
    const [t] = tilesOf(el);
    expect(num(t)).toBe('24.');
    expect(t.querySelector('.shm-ls-suffix')!.textContent).toBe('.');
    expect(t.querySelector('.shm-ls-label')!.textContent).toBe('Open');
    expect(t.querySelector('.shm-ls-text')!.textContent).toBe('Roles today.');
    expect(t.classList.contains('is-dark')).toBe(true);
    expect(t.classList.contains('is-wide')).toBe(false);
    expect(el.querySelector('.shm-ls')!.classList.contains('is-ready')).toBe(true);
  });

  it('counts open roles, industries and countries from the live feed, ignoring closed jobs and blanks', async () => {
    const el = await mount(
      { tiles: [{ source: 'jobs' }, { source: 'industries' }, { source: 'countries' }] },
      { shazamme: sdk({ jobs: JOBS }) },
    );
    expect(tilesOf(el).map(num)).toEqual(['4', '2', '2']);
  });

  it('does not count a job whose activeStatus is the string "false" (intended change in core/site-jobs)', async () => {
    const jobs = [...JOBS, { category: 'Legal', country: 'Canada', activeStatus: 'false' }, { category: 'Retail', country: 'Australia', activeStatus: 'true' }];
    const el = await mount({ tiles: [{ source: 'jobs' }, { source: 'industries' }, { source: 'countries' }] }, { shazamme: sdk({ jobs }) });
    expect(tilesOf(el).map(num)).toEqual(['5', '3', '2']);
  });

  it('counts only visible consultants', async () => {
    const el = await mount({ tiles: [{ source: 'consultants', label: 'Consultants' }] }, { shazamme: sdk({ consultants: CONSULTANTS }) });
    expect(tilesOf(el).map(num)).toEqual(['2']);
  });

  it('leaves out a live tile with no data, and keeps the typed ones', async () => {
    const tiles = [{ source: 'jobs' }, { source: 'consultants' }, { source: 'custom', value: '3', label: 'Offices' }];
    const el = await mount({ tiles }, { shazamme: sdk({ jobs: [], consultants: new Error('no collection') }) });
    expect(tilesOf(el).map(num)).toEqual(['3']);
  });

  it('leaves out live tiles when there is no SDK, but still shows typed tiles', async () => {
    const el = await mount({ tiles: [{ source: 'jobs' }, { source: 'custom', value: '8' }] });
    expect(tilesOf(el).map(num)).toEqual(['8']);
  });

  it('puts a wide dark tile label above the number as an eyebrow, and a narrow one under it', async () => {
    const el = await mount({ tiles: [
      { source: 'custom', value: '1', label: 'Wide', size: '2' },
      { source: 'custom', value: '2', label: 'Narrow' },
    ] });
    const [wide, narrow] = tilesOf(el);
    expect(wide.classList.contains('is-wide')).toBe(true);
    expect((wide.firstElementChild as HTMLElement).className).toBe('shm-ls-label');
    expect([...narrow.querySelector('.shm-ls-main')!.children].map((c) => c.className)).toEqual(['shm-ls-number', 'shm-ls-label']);
  });

  it('styles accent tiles and draws the button only with both text and a safe address', async () => {
    const el = await mount({ tiles: [
      { source: 'custom', value: 'London', style: 'accent', size: '2', linkText: 'Visit us', linkUrl: '/about' },
      { source: 'custom', value: 'B', linkText: 'Bad', linkUrl: 'javascript:alert(1)' },
      { source: 'custom', value: 'C', linkText: 'No address' },
    ] });
    const [a, b, c] = tilesOf(el);
    expect(a.classList.contains('is-accent')).toBe(true);
    expect(a.querySelector('a.shm-ls-link')!.getAttribute('href')).toBe('/about');
    expect(b.querySelector('a')).toBeNull();
    expect(c.querySelector('a')).toBeNull();
  });

  it('escapes typed text instead of rendering it as HTML', async () => {
    const el = await mount({ tiles: [{ source: 'custom', value: '<b>1</b>', label: '<img src=x onerror=alert(1)>', text: '"quoted" & <i>' }] });
    expect(el.querySelector('img')).toBeNull();
    expect(el.querySelector('b')).toBeNull();
    expect(el.querySelector('.shm-ls-text')!.textContent).toBe('"quoted" & <i>');
  });

  it('formats big numbers with a thousands separator', async () => {
    const many = Array.from({ length: 1234 }, () => ({ category: 'A', country: 'AU' }));
    const el = await mount({ tiles: [{ source: 'jobs' }] }, { shazamme: sdk({ jobs: many }) });
    expect(tilesOf(el).map(num)).toEqual(['1,234']);
  });

  it('reads tiles from the rendered source markup when the setting is not an array', async () => {
    const html = SHELL.replace('<div class="shm-ls-sources">', '<div class="shm-ls-sources"><div class="shm-ls-src"><span data-f="source">custom</span><span data-f="value">7</span><span data-f="label">From HTML</span><span data-f="size">2</span></div>');
    const el = await mount({}, { html });
    const [t] = tilesOf(el);
    expect(num(t)).toBe('7');
    expect(t.classList.contains('is-wide')).toBe(true);
  });

  it('caps the grid at 12 tiles and falls back to safe values for garbage settings', async () => {
    const tiles = Array.from({ length: 20 }, (_, i) => ({ source: 'moon', value: String(i), size: '9', style: 'neon' }));
    const el = await mount({ tiles });
    const found = tilesOf(el);
    expect(found).toHaveLength(12);
    expect(found[0].classList.contains('is-dark')).toBe(true);
    expect(found[0].classList.contains('is-wide')).toBe(true);
  });

  it('shows an editor message with no tiles, and nothing on the live site', async () => {
    const editor = await mount({}, { inEditor: true });
    expect(editor.querySelector('.shm-ls-empty')!.textContent).toContain('add at least one tile');
    const live = await mount({});
    expect(live.querySelector('.shm-ls-grid')!.innerHTML).toBe('');
  });

  it('re-running replaces the tiles instead of stacking them, and two copies stay independent', async () => {
    const win = window as unknown as Win;
    win.document.body.innerHTML = `<div id="a">${SHELL}</div><div id="b">${SHELL}</div>`;
    delete win.ShazammeWidget;
    win.eval(BUNDLE.replace('"use strict";', ''));
    const [a, b] = ['a', 'b'].map((id) => win.document.getElementById(id)!);
    const run = (element: Element, value: string) => win.ShazammeWidget['live-stats']({ element, data: { config: { tiles: [{ source: 'custom', value }] } } });
    await run(a, '1');
    await run(b, '2');
    await run(a, '3');
    expect(tilesOf(a).map(num)).toEqual(['3']);
    expect(tilesOf(b).map(num)).toEqual(['2']);
  });
});

describe('live-stats settings', () => {
  const manifest = JSON.parse(read('settings.json')) as { fields: Array<{ key: string }>; itemKeys: Array<{ key: string }> };
  const prompt = read('duda-ai-prompt-1-content.md');
  const promptKeys = [...prompt.matchAll(/key: (\w+)/g)].map((m) => m[1]);
  const hbsItemKeys = [...read('content.hbs').matchAll(/data-f="(\w+)"/g)].map((m) => m[1]);

  it('has the same keys in settings.json, the HTML source markup and the Content editor prompt', () => {
    const all = [...manifest.fields, ...manifest.itemKeys].map((f) => f.key).sort();
    expect([...new Set(promptKeys)].sort()).toEqual(all);
    expect([...hbsItemKeys].sort()).toEqual(manifest.itemKeys.map((f) => f.key).sort());
  });

  it('reads the tiles list from data.config', () => {
    expect(read('index.ts')).toContain('config.tiles');
  });
});

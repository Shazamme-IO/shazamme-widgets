// @vitest-environment jsdom
// keyword-ticker runs the built bundle (index.ts, bundled by build/build.mjs) against the markup Duda renders from content.hbs.
// It must build an aria-hidden moving track plus one static copy, take typed words or the site's professions, escape text,
// hide on the live site when empty and keep the Content editor prompt, settings.json and the code reading the same keys.

import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it, expect, beforeEach } from 'vitest';

const here = dirname(fileURLToPath(import.meta.url));
const VERSION = JSON.parse(readFileSync(join(here, '..', '..', 'package.json'), 'utf8')).version as string;
const BUNDLE = readFileSync(join(here, '..', '..', 'dist', 'keyword-ticker', VERSION, 'widget.min.js'), 'utf8');
const read = (f: string) => readFileSync(join(here, f), 'utf8');
const SHELL = read('content.hbs');

type Win = Record<string, any>;
type Job = Record<string, unknown>;

function feed(jobs: Job[]) {
  return jobs.map((j, i) => ({ page_item_url: `job-${i}`, data: { activeStatus: true, ...j } }));
}
function sdkWith(jobs: Job[] | Error) {
  const calls: Array<Record<string, unknown>> = [];
  return {
    calls,
    site: async () => ({ siteID: 'site-1' }),
    fetch: async (d: Record<string, unknown>) => {
      calls.push(d);
      if (jobs instanceof Error) throw jobs;
      return feed(jobs);
    },
  };
}

async function mount(config: Record<string, unknown>, opts: { inEditor?: boolean; shazamme?: unknown } = {}) {
  const win = window as unknown as Win;
  win.document.body.innerHTML = `<div id="widget">${SHELL}</div>`;
  delete win.ShazammeWidget;
  delete win.__shmSiteJobs;
  win.eval(BUNDLE.replace('"use strict";', ''));
  const element = win.document.getElementById('widget')!;
  await win.ShazammeWidget['keyword-ticker']({ element, data: { config, inEditor: !!opts.inEditor }, $: undefined, shazamme: opts.shazamme });
  return element;
}
const words = (el: Element, sel: string) => [...el.querySelectorAll(sel)].map((n) => n.textContent);

describe('keyword-ticker bundle', () => {
  beforeEach(() => { document.body.innerHTML = ''; });

  it('renders typed words in a hidden moving track and once as static text', async () => {
    const el = await mount({ words: 'Accounting & Finance\n\n  Technology  \nHealthcare' });
    const viewport = el.querySelector('.shm-kt-viewport')!;
    expect(viewport.getAttribute('aria-hidden')).toBe('true');
    expect(words(el.querySelector('.shm-kt-static')!, '.shm-kt-word')).toEqual(['Accounting & Finance', 'Technology', 'Healthcare']);
    expect(el.querySelectorAll('.shm-kt-track .shm-kt-group')).toHaveLength(2);
    expect(el.querySelector('.shm-kt')!.classList.contains('is-ready')).toBe(true);
  });

  it('puts a dot after every word, or none when the separator is off', async () => {
    const on = await mount({ words: 'A\nB' });
    expect(on.querySelectorAll('.shm-kt-static .shm-kt-dot')).toHaveLength(2);
    const off = await mount({ words: 'A\nB', showSeparator: 'false' });
    expect(off.querySelector('.shm-kt-dot')).toBeNull();
  });

  it('sets the loop time and direction, and pause on hover', async () => {
    const el = await mount({ words: 'A', speed: '25', direction: 'ltr', pauseOnHover: 'false' });
    const root = el.querySelector('.shm-kt') as HTMLElement;
    expect(root.style.getPropertyValue('--shm-kt-duration')).toBe('25s');
    expect(root.classList.contains('is-ltr')).toBe(true);
    expect(root.classList.contains('is-pausable')).toBe(false);
    const dflt = await mount({ words: 'A' });
    const r2 = dflt.querySelector('.shm-kt') as HTMLElement;
    expect(r2.style.getPropertyValue('--shm-kt-duration')).toBe('40s');
    expect(r2.classList.contains('is-rtl') && r2.classList.contains('is-pausable')).toBe(true);
  });

  it('falls back to safe values for garbage settings', async () => {
    const el = await mount({ words: 'A', speed: 'fast', direction: 'sideways', source: 'moon' });
    const root = el.querySelector('.shm-kt') as HTMLElement;
    expect(root.style.getPropertyValue('--shm-kt-duration')).toBe('40s');
    expect(root.classList.contains('is-rtl')).toBe(true);
    expect(el.querySelectorAll('.shm-kt-static-item')).toHaveLength(1);
  });

  it('escapes word text instead of rendering it as HTML', async () => {
    const el = await mount({ words: '<img src=x onerror=alert(1)>' });
    expect(el.querySelector('img')).toBeNull();
    expect(el.querySelector('.shm-kt-static .shm-kt-word')!.textContent).toBe('<img src=x onerror=alert(1)>');
  });

  it('shows an editor message with no words, and nothing on the live site', async () => {
    const editor = await mount({}, { inEditor: true });
    expect(editor.querySelector('.shm-kt-empty')!.textContent).toContain('add some words');
    const live = await mount({});
    expect(live.querySelector('.shm-kt')!.innerHTML).toBe('');
  });

  it('re-running on rendered markup replaces it instead of stacking copies', async () => {
    const el = await mount({ words: 'A\nB' });
    const win = window as unknown as Win;
    await win.ShazammeWidget['keyword-ticker']({ element: el, data: { config: { words: 'C' }, inEditor: true } });
    expect(words(el.querySelector('.shm-kt-static')!, '.shm-kt-word')).toEqual(['C']);
    expect(el.querySelectorAll('.shm-kt-static')).toHaveLength(1);
  });

  it('two copies on one page stay independent', async () => {
    const win = window as unknown as Win;
    win.document.body.innerHTML = `<div id="a">${SHELL}</div><div id="b">${SHELL}</div>`;
    delete win.ShazammeWidget;
    win.eval(BUNDLE.replace('"use strict";', ''));
    const [a, b] = ['a', 'b'].map((id) => win.document.getElementById(id)!);
    await win.ShazammeWidget['keyword-ticker']({ element: a, data: { config: { words: 'One' } } });
    await win.ShazammeWidget['keyword-ticker']({ element: b, data: { config: { words: 'Two', speed: '10' } } });
    expect(words(a, '.shm-kt-static .shm-kt-word')).toEqual(['One']);
    expect(words(b, '.shm-kt-static .shm-kt-word')).toEqual(['Two']);
  });

  describe('professions source', () => {
    const jobs: Job[] = [
      { category: 'Marketing' }, { category: 'IT & Telecomms' }, { category: 'IT & Telecomms' },
      { category: 'Healthcare' }, { category: 'Marketing' }, { category: 'IT & Telecomms' }, { category: '  ' }, { category: null },
      { category: 'Mining', activeStatus: false },
    ];

    it('lists professions with live jobs, most roles first then A to Z, capped by maxWords', async () => {
      const sdk = sdkWith(jobs);
      const el = await mount({ source: 'professions', maxWords: '2' }, { shazamme: sdk });
      expect(words(el.querySelector('.shm-kt-static')!, '.shm-kt-word')).toEqual(['IT & Telecomms', 'Marketing']);
      expect(sdk.calls[0]).toMatchObject({ path: '/job-results/site-1', isExternal: true });
    });

    it('ignores the typed words when the source is professions', async () => {
      const el = await mount({ source: 'professions', words: 'Typed' }, { shazamme: sdkWith(jobs) });
      expect(words(el.querySelector('.shm-kt-static')!, '.shm-kt-word')).not.toContain('Typed');
    });

    it('says so in the editor when the site has no live jobs, and hides on the live site', async () => {
      const editor = await mount({ source: 'professions' }, { inEditor: true, shazamme: sdkWith([]) });
      expect(editor.querySelector('.shm-kt-empty')!.textContent).toContain('no live jobs');
      const live = await mount({ source: 'professions' }, { shazamme: sdkWith([]) });
      expect(live.querySelector('.shm-kt')!.innerHTML).toBe('');
    });

    it('does not crash when the SDK is missing or the feed fails', async () => {
      const noSdk = await mount({ source: 'professions' }, { inEditor: true });
      expect(noSdk.querySelector('.shm-kt-empty')).not.toBeNull();
      const failing = await mount({ source: 'professions' }, { inEditor: true, shazamme: sdkWith(new Error('boom')) });
      expect(failing.querySelector('.shm-kt-empty')).not.toBeNull();
    });
  });
});

describe('keyword-ticker settings', () => {
  const manifest = JSON.parse(read('settings.json')) as { fields: Array<{ key: string }> };
  const promptKeys = [...read('duda-ai-prompt-1-content.md').matchAll(/key: (\w+)/g)].map((m) => m[1]);
  const codeKeys = [...read('index.ts').matchAll(/config\.(\w+)/g)].map((m) => m[1]);

  it('has the same keys in the code, settings.json and the Content editor prompt', () => {
    const fromManifest = manifest.fields.map((f) => f.key).sort();
    expect([...new Set(codeKeys)].sort()).toEqual(fromManifest);
    expect([...new Set(promptKeys)].sort()).toEqual(fromManifest);
  });

  it('ships a loader stub that only loads the SDK for the professions source', () => {
    for (const f of ['duda-paste.js', 'duda-paste-jsdelivr.js']) {
      const src = read(f);
      expect(src).toContain('shazamme-1.0.3.min.js');
      expect(src).toContain('=== "professions"');
    }
  });
});

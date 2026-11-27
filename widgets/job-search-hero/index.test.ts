// @vitest-environment jsdom
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, describe, expect, it } from 'vitest';
import { fakeSdk, mount, resetPage, resetRows, useUrl } from '../_job-page/harness';
import jobSearchHero from './index';
import { DEFAULTS, SETTING_KEYS, buildResultsUrl, countLabel, readSettings } from './settings';

const here = dirname(fileURLToPath(import.meta.url));
const SHELL = readFileSync(join(here, 'content.hbs'), 'utf8').replace(/\{\{\w+\}\}/g, '');
const run = (element: HTMLElement, config: Record<string, unknown>, extra: Record<string, unknown> = {}, sdk = fakeSdk()) =>
  (resetRows(), jobSearchHero)({ element, data: { config, siteId: 'd1', ...extra }, shazamme: sdk });
const btn = (el: HTMLElement) => el.querySelector('.shm-jh-button-text')?.textContent;
const opts = (el: HTMLElement) => Array.from(el.querySelectorAll('select option')).map((o) => o.textContent);

afterEach(resetPage);

describe('job-search-hero', () => {
  it('renders the labelled boxes and the live count with only the defaults', async () => {
    const el = mount(SHELL);
    await run(el, {});
    expect(Array.from(el.querySelectorAll('.shm-jh-label')).map((l) => l.textContent)).toEqual(['Keyword', 'Location', 'Work type']);
    expect(btn(el)).toBe('Search 3 roles');
    expect(opts(el)).toEqual(['All types', 'Contract', 'Permanent']);
    expect((el.querySelector('[name=keyword]') as HTMLInputElement).placeholder).toBe('Job title, skill or company');
    expect(el.querySelector('form')?.getAttribute('role')).toBe('search');
  });

  it('works with no HTML tab shell at all and with no SDK', async () => {
    const el = mount('');
    await jobSearchHero({ element: el, data: { config: {} } });
    expect(el.querySelector('form.shm-jh')).not.toBeNull();
    expect(btn(el)).toBe('Search roles');
    const bare = mount('');
    await expect(jobSearchHero({ element: bare, data: undefined })).resolves.toBeUndefined();
  });

  it('uses the one-role and no-count wording, and a custom template', async () => {
    const el = mount(SHELL);
    await run(el, { buttonText: 'Browse {count} jobs' }, {}, fakeSdk([{ data: { workType: 'Permanent' } }, { data: {} }]));
    expect(btn(el)).toBe('Browse 2 jobs');
    const one = mount(SHELL);
    await run(one, {}, {}, fakeSdk([{ data: { workType: 'Permanent' } }]));
    expect(btn(one)).toBe('Search 1 role');
    const none = mount(SHELL);
    await run(none, {}, {}, fakeSdk([]));
    expect(btn(none)).toBe('Search roles');
    expect(none.querySelector<HTMLElement>('.shm-jh-field-worktype')?.hidden).toBe(true);
  });

  it('hides boxes by toggle (strings or booleans) and keeps custom labels', async () => {
    const el = mount(SHELL);
    await run(el, { showLocation: 'false', showWorkType: false, keywordLabel: 'Find', workTypeAllLabel: 'Any' });
    expect(el.querySelector<HTMLElement>('.shm-jh-field-location')?.hidden).toBe(true);
    expect(el.querySelector<HTMLElement>('.shm-jh-field-worktype')?.hidden).toBe(true);
    expect(el.querySelector('.shm-jh-label')?.textContent).toBe('Find');
  });

  it('prefills from the address and survives a failing fetch', async () => {
    useUrl('/job-results?keyword=nurse&location=Perth');
    const el = mount(SHELL);
    await run(el, {});
    expect((el.querySelector('[name=keyword]') as HTMLInputElement).value).toBe('nurse');
    expect((el.querySelector('[name=location]') as HTMLInputElement).value).toBe('Perth');
    const bad = mount(SHELL);
    await expect(run(bad, {}, {}, { ...fakeSdk(), fetch: () => Promise.reject(new Error('down')) } as never)).resolves.toBeUndefined();
    expect(btn(bad)).toBe('Search roles');
  });

  it('submit is stopped in the editor, and a re-run does not stack listeners', async () => {
    const el = mount(SHELL);
    await run(el, {}, { inEditor: true });
    await run(el, {}, { inEditor: true });
    const evt = new Event('submit', { cancelable: true, bubbles: true });
    el.querySelector('form')?.dispatchEvent(evt);
    expect(evt.defaultPrevented).toBe(true);
  });
});

describe('buildResultsUrl', () => {
  it('builds a site-relative results address with only the filled boxes', () => {
    expect(buildResultsUrl('job-results', { keyword: ' nurse ', location: '', workType: 'Part time' })).toBe('/job-results?keyword=nurse&workType=Part%20time');
    expect(buildResultsUrl('/job-results', { keyword: '', location: '', workType: '' })).toBe('/job-results');
  });
  it('keeps an absolute address, a query it already has and a fragment, and refuses other schemes', () => {
    expect(buildResultsUrl('https://careers.example.com/jobs?x=1#top', { keyword: 'a' })).toBe('https://careers.example.com/jobs?x=1&keyword=a#top');
    expect(buildResultsUrl('javascript:alert(1)', { keyword: 'a' })).toBe('/job-results?keyword=a');
  });
});

describe('job-search-hero settings', () => {
  const prompt = readFileSync(join(here, 'duda-ai-prompt-1-content.md'), 'utf8');
  it('the Content Editor prompt lists exactly the keys the widget reads, with the same defaults', () => {
    const promptKeys = [...prompt.matchAll(/key: ([A-Za-z0-9]+)/g)].map((m) => m[1]).sort();
    expect(promptKeys).toEqual([...SETTING_KEYS].sort());
    for (const k of SETTING_KEYS) expect(prompt).toContain(`key: ${k} | type: ${typeof DEFAULTS[k] === 'boolean' ? 'toggle' : 'text'} | default: ${DEFAULTS[k]}`);
  });
  it('empty or odd settings give the defaults', () => {
    expect(readSettings(undefined)).toMatchObject({ resultsPage: 'job-results', showLocation: true, buttonText: 'Search {count} roles' });
    expect(readSettings({ resultsPage: 42, keywordLabel: '  ' }).keywordLabel).toBe('Keyword');
    expect(countLabel(readSettings({}), 1234)).toBe('Search 1,234 roles');
  });
  it('ships every piece', () => {
    const files = readdirSync(here);
    for (const f of ['content.hbs', 'duda-css.reference.css', 'duda-css.desktop.reference.css', 'duda-css.mobile.reference.css', 'duda-paste.js', 'duda-paste-jsdelivr.js', 'SETUP.md']) expect(files).toContain(f);
  });
});

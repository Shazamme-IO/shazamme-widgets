// @vitest-environment jsdom
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, describe, expect, it } from 'vitest';
import { fakeSdk, mount, resetPage, useUrl } from '../_job-page/harness';
import { SLOT_DEFAULTS, SLOT_KEYS, buildChips } from './chips';
import jobHeroChips from './index';

const here = dirname(fileURLToPath(import.meta.url));
const SHELL = readFileSync(join(here, 'content.hbs'), 'utf8');
const run = (element: HTMLElement, config: Record<string, unknown>, extra: Record<string, unknown> = {}, sdk = fakeSdk()) =>
  jobHeroChips({ element, data: { config, siteId: 'd1', ...extra }, shazamme: sdk });
const texts = (el: HTMLElement) => Array.from(el.querySelectorAll('.shm-jc-chip')).map((c) => c.textContent);

afterEach(resetPage);

describe('job-hero-chips', () => {
  it('shows location, work type, work model and a highlighted salary by default', async () => {
    const el = mount(SHELL);
    await run(el, { jobID: 'job-1' });
    expect(texts(el)).toEqual(['Sydney, NSW, Australia', 'Permanent', 'Hybrid', '$150,000 – $170,000 + super']);
    expect(el.querySelectorAll('.is-highlight').length).toBe(1);
    expect(el.querySelector('.is-highlight')?.classList.contains('shm-jc-chip-salary')).toBe(true);
    expect(el.querySelector('.shm-jc-chip-location svg')?.getAttribute('aria-hidden')).toBe('true');
  });

  it('formats the salary from the amounts when there is no pay text', async () => {
    const el = mount(SHELL);
    await run(el, { jobID: 'job-3', chip1: 'salary' });
    expect(texts(el)).toEqual(['£80,000']);
  });

  it('follows the order and choices in the settings, skips none and repeats, and skips facts the job lacks', async () => {
    const el = mount(SHELL);
    await run(el, { jobID: 'job-1', chip1: 'salary', chip2: 'none', chip3: 'workType', chip4: 'workType', highlightSalary: 'false', showLocationIcon: false });
    expect(texts(el)).toEqual(['$150,000 – $170,000 + super', 'Permanent']);
    expect(el.querySelector('.is-highlight')).toBeNull();
    const el2 = mount(SHELL);
    await run(el2, { jobID: 'job-2' });
    expect(texts(el2)).toEqual(['Perth', 'Contract']);
  });

  it('escapes job text', async () => {
    const el = mount(SHELL);
    await run(el, { jobID: 'job-2', chip1: 'profession', chip2: 'none', chip3: 'none', chip4: 'none' });
    expect(el.querySelector('.shm-jc-text')?.innerHTML).toBe('Health');
    expect(el.innerHTML).not.toContain('<img');
  });

  it('finds the job from the page address, hides on a live page with no job, shows a sample in the editor', async () => {
    useUrl('/job-details/analyst-3');
    const el = mount(SHELL);
    await run(el, {});
    expect(texts(el)).toEqual(['£80,000']);
    useUrl('/some-other-page');
    const live = mount(SHELL);
    await run(live, { jobID: 'nope' });
    expect((live.querySelector('.shm-jc') as HTMLElement).hidden).toBe(true);
    const editor = mount(SHELL);
    await run(editor, {}, { inEditor: true });
    expect(texts(editor).length).toBe(4);
    expect(editor.querySelector('.shm-jc-note')?.textContent).toContain('Sample job');
  });

  it('copes with empty settings, no SDK and a failing fetch; re-runs and two copies behave', async () => {
    const el = mount(SHELL);
    await expect(jobHeroChips({ element: el, data: {} })).resolves.toBeUndefined();
    const bad = mount(SHELL);
    await expect(run(bad, { jobID: 'job-1' }, {}, { ...fakeSdk(), fetch: () => Promise.reject(new Error('down')) } as never)).resolves.toBeUndefined();
    expect((bad.querySelector('.shm-jc') as HTMLElement).hidden).toBe(true);
    const again = mount(SHELL);
    await run(again, { jobID: 'job-1' });
    await run(again, { jobID: 'job-1', chip2: 'none' });
    expect(texts(again).length).toBe(3);
    resetPage();
    const sdk = fakeSdk();
    const a = mount(SHELL);
    const b = document.createElement('div');
    b.innerHTML = SHELL;
    document.body.appendChild(b);
    await Promise.all([run(a, { jobID: 'job-1' }, {}, sdk), run(b, { jobID: 'job-3', chip1: 'salary' }, {}, sdk)]);
    expect(texts(a)[0]).toBe('Sydney, NSW, Australia');
    expect(texts(b)).toEqual(['£80,000']);
    expect(sdk.calls.length).toBe(1);
  });

  it('puts the amount in front of the advert wording, as the live feed sends it ("+ super" only)', () => {
    const job = { salaryText: '+ super', salaryFrom: '150000', salaryTo: '170000', currencyCode: 'AUD', currencySymbol: 'AUD', isDisplaySalary: true };
    expect(buildChips(job, { chip1: 'salary', chip2: 'none', chip3: 'none', chip4: 'none' })[0].value).toBe('$150,000 – $170,000 + super');
  });

  it('salary (3e) rounds amounts to whole units, and (3d) reads a 3-letter currencySymbol as the code', () => {
    const one = (job: Record<string, unknown>) => buildChips(job, { chip1: 'salary', chip2: 'none', chip3: 'none', chip4: 'none' })[0].value;
    expect(one({ salaryFrom: '32.5', salaryTo: '40.4', currencyCode: 'AUD', salaryText: 'per hour' })).toBe('$33 – $40 per hour');
    expect(one({ salaryFrom: '80000', salaryTo: '', currencySymbol: 'GBP' })).toBe('£80,000');
  });

  it('salary (3a) shows standalone wording as written', () => {
    const one = (job: Record<string, unknown>) => buildChips(job, { chip1: 'salary', chip2: 'none', chip3: 'none', chip4: 'none' })[0].value;
    expect(one({ salaryFrom: '150000', salaryTo: '170000', currencyCode: 'AUD', salaryText: 'Competitive' })).toBe('Competitive');
  });

  it('buildChips defaults match the prompt', () => {
    expect(buildChips({ city: 'X', workType: 'W', workModel: 'M', salaryText: 'S' }, {}).map((c) => c.kind)).toEqual(['location', 'workType', 'workModel', 'salary']);
  });
});

describe('job-hero-chips settings match the Duda AI prompts', () => {
  const prompt = readFileSync(join(here, 'duda-ai-prompt-1-content.md'), 'utf8');
  const promptKeys = [...prompt.matchAll(/key: ([A-Za-z0-9]+)/g)].map((m) => m[1]).sort();
  it('lists exactly the keys the widget reads', () => {
    expect(promptKeys).toEqual(['jobID', ...SLOT_KEYS, 'highlightSalary', 'showLocationIcon'].sort());
  });
  it('slot defaults in the prompt equal the code', () => {
    for (const k of SLOT_KEYS) expect(prompt).toContain(`key: ${k} | type: dropdown | default: ${SLOT_DEFAULTS[k]}`);
  });
  it('ships every piece', () => {
    const files = readdirSync(here);
    for (const f of ['content.hbs', 'duda-css.reference.css', 'duda-css.desktop.reference.css', 'duda-css.mobile.reference.css', 'duda-paste.js', 'duda-paste-jsdelivr.js', 'SETUP.md']) expect(files).toContain(f);
  });
});

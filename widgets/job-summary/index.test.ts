// @vitest-environment jsdom
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, describe, expect, it } from 'vitest';
import { fakeSdk, mount, resetPage, useUrl } from '../_job-page/harness';
import { ROW_DEFS, buildRows, labelKey, showKey } from './rows';
import jobSummary from './index';

const here = dirname(fileURLToPath(import.meta.url));
const SHELL = readFileSync(join(here, 'content.hbs'), 'utf8').replace(/\{\{heading\}\}/, 'At a glance');
const run = (element: HTMLElement, config: Record<string, unknown>, extra: Record<string, unknown> = {}, sdk = fakeSdk()) =>
  jobSummary({ element, data: { config, siteId: 'd1', ...extra }, shazamme: sdk });
const values = (el: HTMLElement) => Object.fromEntries(Array.from(el.querySelectorAll('.shm-js-label')).map((l) => [l.textContent, l.nextElementSibling?.textContent]));

afterEach(resetPage);

describe('job-summary', () => {
  it('lists every row for a job, found by the bound jobID', async () => {
    const el = mount(SHELL);
    await run(el, { jobID: 'job-1' });
    expect(values(el)).toEqual({
      Profession: 'Accounting & Finance', Role: 'Controller', 'Work type': 'Permanent', 'Work model': 'Hybrid',
      Location: 'Sydney, NSW, Australia', 'Salary type': 'Annual', Salary: '$150,000 – $170,000',
      Package: '$150,000 – $170,000 + super', Currency: 'AUD', Reference: '236',
    });
    expect(el.querySelector('.shm-js')?.classList.contains('is-ready')).toBe(true);
    expect(el.querySelector('.shm-js-heading')?.textContent).toBe('At a glance');
  });

  it('finds the job from the page address when nothing is bound', async () => {
    useUrl('/job-details/nurse-2');
    const el = mount(SHELL);
    await run(el, {});
    expect(values(el)).toEqual({ Profession: 'Health', 'Work type': 'Contract', Location: 'Perth' });
  });

  it('hides empty rows, escapes job text and drops a Package that repeats the Salary', async () => {
    const el = mount(SHELL);
    await run(el, { jobID: 'job-3' });
    expect(values(el)).toEqual({ Salary: '£80,000', Currency: 'GBP' });
    const el2 = mount(SHELL);
    await run(el2, { jobID: 'job-2', labelProfession: '<b>Field</b>' });
    expect(el2.querySelector('.shm-js-label')?.innerHTML).toBe('&lt;b&gt;Field&lt;/b&gt;');
    expect(buildRows({ salaryFrom: '10', salaryTo: '20', salaryText: '$10 – $20', currencyCode: 'AUD' }, {}).map((r) => r.key)).toEqual(['salary', 'currency']);
  });

  it('salary (3e) rounds the Salary row to whole units, and (3d) reads a 3-letter currencySymbol as the code', () => {
    const salary = (job: Record<string, unknown>) => buildRows(job, {}).find((r) => r.key === 'salary')?.value;
    expect(salary({ salaryFrom: '149999.6', salaryTo: '170000.2', currencyCode: 'AUD' })).toBe('$150,000 – $170,000');
    expect(salary({ salaryFrom: '55.5', salaryTo: '65', currencySymbol: 'NZD' })).toBe('$56 – $65');
  });

  it('honours row toggles and custom labels, given as strings or booleans', async () => {
    const el = mount(SHELL);
    await run(el, { jobID: 'job-1', showProfession: false, showRole: 'false', labelWorkType: 'Contract type' });
    const v = values(el);
    expect(v).not.toHaveProperty('Profession');
    expect(v).not.toHaveProperty('Role');
    expect(v['Contract type']).toBe('Permanent');
  });

  it('renders nothing on a live page with no job, and the editor gets a sample plus a note', async () => {
    const live = mount(SHELL);
    await run(live, { jobID: 'nope' });
    expect((live.querySelector('.shm-js') as HTMLElement).hidden).toBe(true);
    expect(live.querySelectorAll('dd').length).toBe(0);

    const editor = mount(SHELL);
    await run(editor, {}, { inEditor: true });
    expect(values(editor).Profession).toBe('Accounting & Finance');
    expect(editor.querySelector('.shm-js-note')?.textContent).toContain('Sample job');
  });

  it('copes with empty settings, a missing SDK and a failing fetch', async () => {
    const el = mount(SHELL);
    await expect(jobSummary({ element: el, data: {} })).resolves.toBeUndefined();
    await expect(jobSummary({ element: el, data: { config: undefined, inEditor: true } })).resolves.toBeUndefined();
    const bad = mount(SHELL);
    const sdk = { ...fakeSdk(), fetch: () => Promise.reject(new Error('down')) };
    await expect(run(bad, { jobID: 'job-1' }, {}, sdk as never)).resolves.toBeUndefined();
    expect((bad.querySelector('.shm-js') as HTMLElement).hidden).toBe(true);
  });

  it('two copies on one page work independently and read the Jobs list once', async () => {
    const sdk = fakeSdk();
    const a = mount(SHELL);
    const b = document.createElement('div');
    b.innerHTML = SHELL;
    document.body.appendChild(b);
    await Promise.all([run(a, { jobID: 'job-1' }, {}, sdk), run(b, { jobID: 'job-3', showCurrency: false }, {}, sdk)]);
    expect(values(a).Profession).toBe('Accounting & Finance');
    expect(values(b)).toEqual({ Salary: '£80,000' });
    expect(sdk.calls.length).toBe(1);
  });

  it('a re-run (the editor changes a setting) replaces the rows instead of stacking them', async () => {
    const el = mount(SHELL);
    await run(el, { jobID: 'job-1' });
    await run(el, { jobID: 'job-1', showReference: false });
    expect(el.querySelectorAll('dt').length).toBe(9);
  });
});

describe('job-summary settings match the Duda AI prompts', () => {
  const promptKeys = [...readFileSync(join(here, 'duda-ai-prompt-1-content.md'), 'utf8').matchAll(/key: ([A-Za-z0-9]+)/g)].map((m) => m[1]).sort();
  const codeKeys = ['jobID', 'heading', ...ROW_DEFS.flatMap((d) => [showKey(d.key), labelKey(d.key)])].sort();

  it('the Content Editor prompt lists exactly the keys the widget reads', () => {
    expect(promptKeys).toEqual(codeKeys);
  });

  it('the defaults in the prompt are what the widget does with empty settings', () => {
    const rows = buildRows({ ...JSON.parse('{"profession":"P","role":"R","workType":"W","workModel":"M","city":"C","salaryType":"T","salaryFrom":"1","salaryTo":"2","salaryText":"X","currencyCode":"AUD","referenceNumber":"9"}') }, {});
    expect(rows.map((r) => r.label)).toEqual(ROW_DEFS.map((d) => d.label));
  });

  it('ships every piece', () => {
    const files = readdirSync(here);
    for (const f of ['content.hbs', 'duda-css.reference.css', 'duda-css.desktop.reference.css', 'duda-css.mobile.reference.css', 'duda-paste.js', 'duda-paste-jsdelivr.js', 'SETUP.md']) expect(files).toContain(f);
  });
});

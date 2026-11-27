// @vitest-environment jsdom
// Runs the BUILT bundle (dist/consultant-card) in jsdom against a fake SDK, the way Duda's loader
// stub does. Covers team and job modes, live roles (and when they stay hidden), escaping, empty
// settings, and that the Duda AI prompts and the CSS agree with the code.

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const here = dirname(fileURLToPath(import.meta.url));
const VERSION = JSON.parse(readFileSync(join(here, '..', '..', 'package.json'), 'utf8')).version as string;
const BUNDLE = readFileSync(join(here, '..', '..', 'dist', 'consultant-card', VERSION, 'widget.min.js'), 'utf8');
const SHELL = readFileSync(join(here, 'content.hbs'), 'utf8').replace(/\{\{\w+\}\}/g, '');
const read = (f: string) => readFileSync(join(here, f), 'utf8');

type Win = Record<string, any>;
const win = window as unknown as Win;
win.eval(BUNDLE.replace('"use strict";', ''));

type Row = Record<string, unknown>;
const consultant = (over: Row = {}) => ({
  data: {
    consultantID: `c-${Math.random().toString(36).slice(2)}`,
    firstName: 'Priya', lastName: 'Shah', positionTitle: 'Senior Consultant, Finance',
    eMail: 'priya@example.com', phone: '+61 2 0000 0000', mobile: '0400 000 000',
    consultantURL: 'https://demo.example.com/consultant/priya-shah', photoURL: 'https://cdn.example.com/p.jpg',
    isVisible: true, sortOrder: 1, classification: null, ...over,
  },
});
const job = (over: Row = {}) => ({ data: { jobID: `j-${Math.random().toString(36).slice(2)}`, activeStatus: true, contactEmail: '', consultantURL: '', contactName: '', ...over } });

const TEAM = [
  consultant({ consultantID: 'a', firstName: 'Priya', lastName: 'Shah', eMail: 'priya@example.com', sortOrder: 2 }),
  consultant({ consultantID: 'b', firstName: 'Tom', lastName: 'Reilly', eMail: 'tom@example.com', consultantURL: 'https://demo.example.com/consultant/tom-reilly', positionTitle: 'Consultant, Technology', classification: 'Technology', sortOrder: 1 }),
  consultant({ consultantID: 'c', firstName: 'Ana', lastName: 'Costa', eMail: 'ana@example.com', consultantURL: 'https://demo.example.com/consultant/ana-costa', sortOrder: 3 }),
];

function fakeSdk(collections: Record<string, unknown>, extra: Record<string, unknown> = {}) {
  const fetch = vi.fn(async ({ name }: { name: string }) => {
    const v = collections[name];
    if (v instanceof Error) throw v;
    return v ?? [];
  });
  return { ready: vi.fn(async () => undefined), register: vi.fn(), fetch, ...extra };
}

async function mount(collections: Record<string, unknown>, config: Record<string, string> = {}, opts: { inEditor?: boolean; sdk?: unknown } = {}) {
  const element: HTMLElement = document.createElement('div');
  element.innerHTML = SHELL;
  document.body.appendChild(element);
  delete win.__shmCcFetch;
  const sdk = opts.sdk ?? fakeSdk(collections);
  await win.ShazammeWidget['consultant-card']({ element, data: { config, inEditor: Boolean(opts.inEditor), siteId: 'site-1' }, $: undefined, shazamme: sdk });
  return { element, sdk: sdk as ReturnType<typeof fakeSdk> };
}

const names = (el: HTMLElement) => [...el.querySelectorAll('.shm-cc-name')].map((n) => n.textContent);
const lives = (el: HTMLElement) => [...el.querySelectorAll('.shm-cc-live')].map((n) => n.textContent);

beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => undefined);
  document.body.innerHTML = '';
});

describe('team mode', () => {
  it('renders one initials card per consultant, in the console order, never a photo', async () => {
    const { element } = await mount({ Consultants: TEAM, Jobs: [] });
    expect(names(element)).toEqual(['Tom Reilly', 'Priya Shah', 'Ana Costa']);
    expect([...element.querySelectorAll('.shm-cc-badge')].map((b) => b.textContent)).toEqual(['TR', 'PS', 'AC']);
    expect(element.querySelector('img')).toBeNull();
    expect(element.querySelector('.shm-cc-badge')!.getAttribute('aria-hidden')).toBe('true');
    expect(element.querySelector('.shm-cc')!.classList.contains('is-mode-team')).toBe(true);
  });

  it('shows the job title and links the name to the profile path', async () => {
    const { element } = await mount({ Consultants: TEAM });
    const first = element.querySelector('.shm-cc-card')!;
    expect(first.querySelector('.shm-cc-role')!.textContent).toBe('Consultant, Technology');
    expect(first.querySelector('a.shm-cc-name')!.getAttribute('href')).toBe('/consultant/tom-reilly');
  });

  it('keeps the case of the profile link but matches on any case', async () => {
    const rows = [consultant({ consultantURL: 'https://demo.example.com/Consultant/Priya-Shah?ref=A' })];
    const { element } = await mount({ Consultants: rows, Jobs: [job({ consultantURL: '/consultant/priya-shah/' })] });
    expect(element.querySelector('a.shm-cc-name')!.getAttribute('href')).toBe('/Consultant/Priya-Shah?ref=A');
    expect(lives(element)).toEqual(['1 live role']);
  });

  it('keeps the name as plain text when linking is off', async () => {
    const { element } = await mount({ Consultants: TEAM }, { linkProfile: 'false' });
    expect(element.querySelector('a.shm-cc-name')).toBeNull();
    expect(element.querySelectorAll('span.shm-cc-name')).toHaveLength(3);
  });

  it('sorts by name, filters by classification and limits', async () => {
    expect(names((await mount({ Consultants: TEAM }, { sortBy: 'name' })).element)).toEqual(['Ana Costa', 'Priya Shah', 'Tom Reilly']);
    expect(names((await mount({ Consultants: TEAM }, { classification: ' technology ' })).element)).toEqual(['Tom Reilly']);
    expect(names((await mount({ Consultants: TEAM }, { maxConsultants: '2' })).element)).toHaveLength(2);
  });

  it('hides consultants marked not visible', async () => {
    const rows = [...TEAM, consultant({ firstName: 'Hidden', lastName: 'One', isVisible: false })];
    expect(names((await mount({ Consultants: rows })).element)).not.toContain('Hidden One');
  });

  it('sets the column variables from the settings', async () => {
    const { element } = await mount({ Consultants: TEAM }, { columnsDesktop: '3', columnsTablet: '1', columnsMobile: '2' });
    const root = element.querySelector<HTMLElement>('.shm-cc')!;
    expect([root.style.getPropertyValue('--shm-cc-cols-d'), root.style.getPropertyValue('--shm-cc-cols-t'), root.style.getPropertyValue('--shm-cc-cols-m')]).toEqual(['3', '1', '2']);
  });

  it('escapes everything it loads', async () => {
    const rows = [consultant({ firstName: '<img src=x onerror=alert(1)>', lastName: 'Q', positionTitle: '<script>x</script>Boss', consultantURL: 'javascript:alert(1)' })];
    const { element } = await mount({ Consultants: rows });
    expect(element.querySelector('.shm-cc-stage img')).toBeNull();
    expect(element.querySelector('script')).toBeNull();
    expect(element.querySelector('a.shm-cc-name')).toBeNull();
    expect(element.querySelector('.shm-cc-role')!.textContent).toBe('Boss');
  });

  it('keeps two copies on one page independent', async () => {
    const a = await mount({ Consultants: TEAM }, { maxConsultants: '1' });
    const b = await mount({ Consultants: TEAM }, { maxConsultants: '3' });
    expect(names(a.element)).toHaveLength(1);
    expect(names(b.element)).toHaveLength(3);
  });

  it('re-running on the same element replaces the cards, not stacks them', async () => {
    const element: HTMLElement = document.createElement('div');
    element.innerHTML = SHELL;
    document.body.appendChild(element);
    const run = (config: Record<string, string>) => win.ShazammeWidget['consultant-card']({ element, data: { config, siteId: 's' }, shazamme: fakeSdk({ Consultants: TEAM }) });
    await run({});
    await run({ maxConsultants: '1' });
    expect(element.querySelectorAll('.shm-cc-card')).toHaveLength(1);
  });
});

describe('live roles', () => {
  const linked = [
    job({ contactEmail: 'Priya@Example.com' }),
    job({ contactEmail: 'priya@example.com' }),
    job({ contactEmail: 'tom@example.com' }),
    job({ consultantURL: 'https://other.example.com/consultant/ana-costa/' }),
    job({ contactEmail: 'tom@example.com', activeStatus: false }),
    job({ contactEmail: 'someone-else@example.com' }),
  ];

  it('counts live jobs by contact email or consultant page, ignoring case and inactive jobs', async () => {
    const { element } = await mount({ Consultants: TEAM, Jobs: linked });
    expect(lives(element)).toEqual(['1 live role', '2 live roles', '1 live role']);
  });

  it('uses the site builder wording', async () => {
    const { element } = await mount({ Consultants: TEAM, Jobs: linked }, { liveRolesOne: '{n} open job', liveRolesMany: '{n} open jobs' });
    expect(lives(element)).toEqual(['1 open job', '2 open jobs', '1 open job']);
  });

  it('hides a zero count, and shows it only when asked', async () => {
    const jobs = [job({ contactEmail: 'priya@example.com' })];
    expect(lives((await mount({ Consultants: TEAM, Jobs: jobs })).element)).toEqual(['1 live role']);
    expect(lives((await mount({ Consultants: TEAM, Jobs: jobs }, { showZeroRoles: 'true' })).element)).toEqual(['0 live roles', '1 live role', '0 live roles']);
  });

  it('shows no count at all when no job says who owns it (never an invented number)', async () => {
    const unlinked = [job(), job(), job()];
    const { element } = await mount({ Consultants: TEAM, Jobs: unlinked }, { showZeroRoles: 'true' });
    expect(names(element)).toHaveLength(3);
    expect(lives(element)).toEqual([]);
  });

  it('hides the line when the jobs name people who are not on the list (no false "0 live roles")', async () => {
    const strangers = [job({ contactEmail: 'someone-else@example.com' }), job({ consultantURL: 'https://x.example.com/consultant/nobody' })];
    const { element } = await mount({ Consultants: TEAM, Jobs: strangers }, { showZeroRoles: 'true' });
    expect(lives(element)).toEqual([]);
  });

  it('gives no count to a consultant who has neither an email nor a page to match on', async () => {
    const team = [...TEAM, consultant({ consultantID: 'd', firstName: 'No', lastName: 'Contact', eMail: null, consultantURL: null, sortOrder: 9 })];
    const { element } = await mount({ Consultants: team, Jobs: [job({ contactEmail: 'priya@example.com' })] }, { showZeroRoles: 'true' });
    expect(lives(element)).toEqual(['0 live roles', '1 live role', '0 live roles']);
  });

  it('still shows the cards when the jobs cannot be loaded', async () => {
    const { element } = await mount({ Consultants: TEAM, Jobs: new Error('boom') });
    expect(names(element)).toHaveLength(3);
    expect(lives(element)).toEqual([]);
  });

  it('does not fetch jobs when the line is switched off', async () => {
    const { sdk } = await mount({ Consultants: TEAM }, { showLiveRoles: 'hide' });
    expect(sdk.fetch.mock.calls.map((c) => (c[0] as { name: string }).name)).toEqual(['Consultants']);
  });
});

describe('job mode', () => {
  const jobs = [job({ jobID: 'J1', contactEmail: 'priya@example.com' }), job({ jobID: 'J2', contactName: 'Sam Contact', contactEmail: 'sam@example.com', contactPhone: '0411 222 333' }), job({ jobID: 'J3' })];

  it('shows the consultant who owns the job, with the small heading, phone and email', async () => {
    const { element } = await mount({ Consultants: TEAM, Jobs: jobs }, { mode: 'job', jobID: 'j1' });
    expect(element.querySelector('.shm-cc')!.classList.contains('is-mode-job')).toBe(true);
    expect(element.querySelector('.shm-cc-eyebrow')!.textContent).toBe('Your consultant');
    expect(names(element)).toEqual(['Priya Shah']);
    expect(element.querySelector('.shm-cc-phone')!.getAttribute('href')).toBe('tel:+61200000000');
    expect(element.querySelector('.shm-cc-email')!.getAttribute('href')).toBe('mailto:priya@example.com');
    expect(element.querySelector('.shm-cc-live')).toBeNull();
    expect(element.querySelector('img')).toBeNull();
  });

  it('falls back to the job\'s own contact when the consultant is not in the collection', async () => {
    const { element } = await mount({ Consultants: TEAM, Jobs: jobs }, { mode: 'job', jobID: 'J2' });
    expect(names(element)).toEqual(['Sam Contact']);
    expect(element.querySelector('.shm-cc-badge')!.textContent).toBe('SC');
    expect(element.querySelector('.shm-cc-phone')!.getAttribute('href')).toBe('tel:0411222333');
  });

  it('asks the API when the job is not in the Jobs collection', async () => {
    const submit = vi.fn(async () => ({ response: { items: [consultant({ firstName: 'Api', lastName: 'Person' }).data] } }));
    const sdk = fakeSdk({ Consultants: [], Jobs: [] }, { site: async () => ({ siteID: 'S1' }), submit });
    const { element } = await mount({}, { mode: 'job', jobID: 'ZZ' }, { sdk });
    expect(submit).toHaveBeenCalledWith({ action: 'Get Consultant By Job', jobID: 'ZZ', siteID: 'S1' });
    expect(names(element)).toEqual(['Api Person']);
  });

  it('does not dial an extension, and refuses an email that carries mailto headers', async () => {
    const rows = [consultant({ consultantID: 'x', phone: '+61 2 9999 8888 ext 12', eMail: 'a@b.co?bcc=x@y.com' })];
    const { element } = await mount({ Consultants: rows, Jobs: [job({ jobID: 'J9', consultantURL: '/consultant/priya-shah' })] }, { mode: 'job', jobID: 'J9' });
    expect(element.querySelector('.shm-cc-phone')!.getAttribute('href')).toBe('tel:+61299998888');
    expect(element.querySelector('.shm-cc-email')).toBeNull();
  });

  it('asks the API when the Jobs collection cannot be loaded', async () => {
    const submit = vi.fn(async () => ({ response: { items: [consultant({ firstName: 'Api', lastName: 'Person' }).data] } }));
    const sdk = fakeSdk({ Consultants: [], Jobs: new Error('down') }, { site: async () => ({ siteID: 'S1' }), submit });
    const { element } = await mount({}, { mode: 'job', jobID: 'ZZ' }, { sdk });
    expect(names(element)).toEqual(['Api Person']);
  });

  it('can show the live roles line on a job page when asked', async () => {
    const withMore = [...jobs, job({ contactEmail: 'priya@example.com' })];
    const { element } = await mount({ Consultants: TEAM, Jobs: withMore }, { mode: 'job', jobID: 'J1', showLiveRoles: 'show' });
    expect(lives(element)).toEqual(['2 live roles']);
  });

  it('shows nothing live without a job, or its message when one is set', async () => {
    const none = await mount({ Consultants: TEAM, Jobs: jobs }, { mode: 'job' });
    expect(none.element.querySelector('.shm-cc')!.hasAttribute('hidden')).toBe(true);
    expect(none.element.querySelector('.shm-cc-stage')!.innerHTML).toBe('');
    const msg = await mount({ Consultants: TEAM, Jobs: jobs }, { mode: 'job', jobID: 'J3', noConsultantMessage: 'No consultant yet.' });
    expect(msg.element.querySelector('.shm-cc-empty')!.textContent).toBe('No consultant yet.');
  });
});

describe('empty settings and the editor', () => {
  it('renders nothing on the live site with no data, and without crashing', async () => {
    const { element } = await mount({});
    expect(element.querySelector('.shm-cc')!.hasAttribute('hidden')).toBe(true);
    expect(element.querySelector('.shm-cc-stage')!.innerHTML).toBe('');
  });

  it('explains what is missing in the editor', async () => {
    const empty = await mount({}, {}, { inEditor: true });
    expect(empty.element.querySelector('.shm-cc-editor-note')!.textContent).toContain('no visible rows');
    const noJob = await mount({ Consultants: TEAM }, { mode: 'job' }, { inEditor: true });
    expect(noJob.element.querySelector('.shm-cc-editor-note')!.textContent).toContain('Job ID');
    const filtered = await mount({ Consultants: TEAM }, { classification: 'Nope' }, { inEditor: true });
    expect(filtered.element.querySelector('.shm-cc-editor-note')!.textContent).toContain('nope');
  });

  it('survives a missing SDK with an editor note and no throw', async () => {
    const el: HTMLElement = document.createElement('div');
    el.innerHTML = SHELL;
    await win.ShazammeWidget['consultant-card']({ element: el, data: { config: {}, inEditor: true }, shazamme: undefined });
    expect(el.querySelector('.shm-cc-editor-note')!.textContent).toContain('SDK');
  });

  it('survives garbage settings', async () => {
    const { element } = await mount({ Consultants: TEAM }, { mode: 'nope', columnsDesktop: 'x', maxConsultants: '-4', sortBy: '??', showEmail: 'maybe' });
    expect(names(element)).toHaveLength(3);
  });
});

describe('Duda AI prompts and CSS', () => {
  it('lists every setting the code reads, once, and nothing else', () => {
    const prompts = ['1-content', '2-card'].map((n) => read(`duda-ai-prompt-${n}.md`)).join('\n');
    const promptKeys = [...prompts.matchAll(/\| key: (\w+) \|/g)].map((m) => m[1]);
    const readKeys = [...new Set([...read('settings.ts').matchAll(/\bc\.(\w+)/g)].map((m) => m[1]))];
    expect([...promptKeys].sort()).toEqual([...readKeys].sort());
    expect(new Set(promptKeys).size).toBe(promptKeys.length);
  });

  it('backs every Design Editor line with its selector and default in the shared CSS', () => {
    const css = read('duda-css.reference.css');
    const lines = [...read('duda-ai-prompt-3-design.md').matchAll(/selector: (.+?) \| property: ([\w-]+) \| default: (.+)$/gm)];
    expect(lines.length).toBeGreaterThan(30);
    for (const [, selector, property, def] of lines) {
      const rules = css.split('\n').filter((l) => l.startsWith(`${selector.trim()} {`) || l.includes(`${selector.trim()},`));
      expect(rules.length, selector).toBeGreaterThan(0);
      expect(rules.join('\n'), `${selector} ${property}`).toContain(`${property}: ${def.trim()}`);
    }
  });

  it('never ships a photo style or an img rule', () => {
    expect(read('duda-css.reference.css')).not.toMatch(/\bimg\b/);
    expect(read('render.ts')).not.toMatch(/<img|photoURL/);
  });

  it('has a root Handlebars template with no config. prefix', () => {
    expect(read('content.hbs')).not.toContain('config.');
  });
});

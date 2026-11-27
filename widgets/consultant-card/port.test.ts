// @vitest-environment jsdom
// Runs the BUILT bundle (dist/consultant-card) in jsdom against a fake SDK, the way Duda's loader
// stub does. Covers team and job modes, live roles (and when they stay hidden), escaping, empty
// settings, and that the Duda AI prompts and the CSS agree with the code.

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { hrefPath, localPath, profileHref } from './data';

const here = dirname(fileURLToPath(import.meta.url));
const VERSION = JSON.parse(readFileSync(join(here, '..', '..', 'package.json'), 'utf8')).version as string;
const BUNDLE = readFileSync(join(here, '..', '..', 'dist', 'consultant-card', VERSION, 'widget.min.js'), 'utf8');
const SHELL = readFileSync(join(here, 'content.hbs'), 'utf8').replace(/\{\{\w+\}\}/g, '');
const read = (f: string) => readFileSync(join(here, f), 'utf8');
const CONTENT_PROMPTS = ['1-content', '2-card', '4-details', '5-contact', '6-social', '7-layout', '8-filters'];

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
const SEARCH_WAIT_MS = 170;
/** Types into the search box and waits out the debounce (real timers). */
async function typeSearch(input: HTMLInputElement, value: string) {
  input.value = value;
  input.dispatchEvent(new Event('input'));
  await new Promise((r) => setTimeout(r, SEARCH_WAIT_MS));
}
function sized(track: HTMLElement, scrollWidth = 1000, clientWidth = 400) {
  Object.defineProperty(track, 'scrollWidth', { value: scrollWidth, configurable: true });
  Object.defineProperty(track, 'clientWidth', { value: clientWidth, configurable: true });
}
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

  it('does not link a consultant whose page is just the site root', async () => {
    const { element } = await mount({ Consultants: [consultant({ consultantURL: 'https://demo.example.com/' })] });
    expect(element.querySelector('a.shm-cc-name')).toBeNull();
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
    const vanity = await mount({ Consultants: [consultant({ phone: '1300 EXCEL 99' })] }, { showPhone: 'show' });
    expect(vanity.element.querySelector('.shm-cc-phone')!.getAttribute('href')).toBe('tel:130099');
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
    const prompts = CONTENT_PROMPTS.map((n) => read(`duda-ai-prompt-${n}.md`)).join('\n');
    const promptKeys = [...prompts.matchAll(/\| key: (\w+) \|/g)].map((m) => m[1]);
    const readKeys = [...new Set([...read('settings.ts').matchAll(/\bc\.(\w+)/g)].map((m) => m[1]))];
    expect([...promptKeys].sort()).toEqual([...readKeys].sort());
    expect(new Set(promptKeys).size).toBe(promptKeys.length);
  });

  it('backs every Design Editor line with its selector and default in the shared CSS', () => {
    const css = read('duda-css.reference.css');
    const lines = [...['3-design', '9-design-more'].map((n) => read(`duda-ai-prompt-${n}.md`)).join('\n').matchAll(/selector: (.+?) \| property: ([\w-]+) \| default: (.+)$/gm)];
    expect(lines.length).toBeGreaterThan(90);
    for (const [, selector, property, def] of lines) {
      const rules = css.split('\n').filter((l) => l.startsWith(`${selector.trim()} {`) || l.includes(`${selector.trim()},`));
      expect(rules.length, selector).toBeGreaterThan(0);
      expect(rules.join('\n'), `${selector} ${property}`).toContain(`${property}: ${def.trim()}`);
    }
  });

  it('keeps one Duda AI prompt per Content Editor tab, each a short list', () => {
    for (const n of CONTENT_PROMPTS) {
      const fields = [...read(`duda-ai-prompt-${n}.md`).matchAll(/\| key: (\w+) \|/g)];
      expect(fields.length, n).toBeGreaterThan(0);
      expect(fields.length, n).toBeLessThanOrEqual(24);
    }
  });

  it('styles photos only through the classes the photo setting adds', () => {
    expect(read('duda-css.reference.css')).not.toMatch(/(^|[\s,])img\b/m);
  });

  it('has a root Handlebars template with no config. prefix', () => {
    expect(read('content.hbs')).not.toContain('config.');
  });
});

describe('photos', () => {
  it('shows the photoURL photo as a decorative image of a fixed size', async () => {
    const { element } = await mount({ Consultants: TEAM }, { avatar: 'photo' });
    const imgs = [...element.querySelectorAll<HTMLImageElement>('img.shm-cc-photo-img')];
    expect(imgs).toHaveLength(3);
    expect(imgs[0].getAttribute('src')).toBe('https://cdn.example.com/p.jpg');
    expect(imgs[0].getAttribute('alt')).toBe('');
    expect([imgs[0].getAttribute('width'), imgs[0].getAttribute('height'), imgs[0].getAttribute('loading')]).toEqual(['64', '64', 'lazy']);
    expect(imgs[0].parentElement!.getAttribute('aria-hidden')).toBe('true');
    expect(element.querySelector('.shm-cc-badge')).toBeNull();
  });

  it('falls back to externalPhotoURL, and refuses an address that is not http(s)', async () => {
    const rows = [
      consultant({ consultantID: 'x', photoURL: null, externalPhotoURL: 'https://cdn.example.com/ext.jpg', sortOrder: 1 }),
      consultant({ consultantID: 'y', firstName: 'Bad', lastName: 'Url', photoURL: 'javascript:alert(1)', externalPhotoURL: null, sortOrder: 2 }),
    ];
    const { element } = await mount({ Consultants: rows }, { avatar: 'photo-with-initials-fallback' });
    expect(element.querySelector('img')!.getAttribute('src')).toBe('https://cdn.example.com/ext.jpg');
    expect([...element.querySelectorAll('.shm-cc-badge')].map((b) => b.textContent)).toEqual(['BU']);
  });

  it('shows a plain placeholder for a consultant with no photo (photo), or the initials (fallback)', async () => {
    const rows = [consultant({ photoURL: '', externalPhotoURL: '' })];
    const photo = await mount({ Consultants: rows }, { avatar: 'photo' });
    expect(photo.element.querySelector('.shm-cc-photo.is-missing svg')).not.toBeNull();
    expect(photo.element.querySelector('img')).toBeNull();
    const fallback = await mount({ Consultants: rows }, { avatar: 'photo-with-initials-fallback' });
    expect(fallback.element.querySelector('.shm-cc-badge')!.textContent).toBe('PS');
  });

  it('swaps a photo that fails to load for the initials or the placeholder', async () => {
    const fallback = await mount({ Consultants: TEAM }, { avatar: 'photo-with-initials-fallback' });
    fallback.element.querySelector('img')!.dispatchEvent(new Event('error'));
    expect(fallback.element.querySelector('.shm-cc-card .shm-cc-badge')!.textContent).toBe('TR');
    expect(fallback.element.querySelectorAll('img')).toHaveLength(2);
    const photo = await mount({ Consultants: TEAM }, { avatar: 'photo' });
    photo.element.querySelector('img')!.dispatchEvent(new Event('error'));
    expect(photo.element.querySelector('.shm-cc-photo.is-missing svg')).not.toBeNull();
  });

  it('escapes the photo address', async () => {
    const { element } = await mount({ Consultants: [consultant({ photoURL: 'https://x.example.com/a.jpg" onerror="alert(1)' })] }, { avatar: 'photo' });
    const img = element.querySelector('img')!;
    expect(img.getAttribute('onerror')).toBeNull();
    expect(img.getAttribute('src')).toContain('onerror');
  });
});

describe('contact lines', () => {
  it('shows the mobile as its own line, and then the phone line shows only the phone', async () => {
    const rows = [consultant({ phone: '', mobile: '0400 111 222' }), consultant({ consultantID: 'z', firstName: 'Both', phone: '02 9999 0000', mobile: '0411 000 111', sortOrder: 2 })];
    const off = await mount({ Consultants: rows }, { showPhone: 'show' });
    expect([...off.element.querySelectorAll('.shm-cc-phone')].map((a) => a.textContent)).toEqual(['0400 111 222', '02 9999 0000']);
    const on = await mount({ Consultants: rows }, { showPhone: 'show', showMobile: 'true' });
    expect([...on.element.querySelectorAll('.shm-cc-phone')].map((a) => a.textContent)).toEqual(['02 9999 0000']);
    expect([...on.element.querySelectorAll('.shm-cc-mobile')].map((a) => a.getAttribute('href'))).toEqual(['tel:0400111222', 'tel:0411000111']);
  });

  it('adds an icon before the text, or shows the icon alone with the number as its name', async () => {
    const both = await mount({ Consultants: TEAM }, { showPhone: 'show', showPhoneIcon: 'true', showEmail: 'show', showEmailIcon: 'true' });
    const phone = both.element.querySelector('.shm-cc-phone')!;
    expect(phone.classList.contains('has-icon')).toBe(true);
    expect(phone.querySelector('svg[aria-hidden="true"]')).not.toBeNull();
    expect(phone.querySelector('.shm-cc-text')!.textContent).toBe('+61 2 0000 0000');
    const iconOnly = await mount({ Consultants: TEAM }, { showEmail: 'show', showEmailIcon: 'true', showEmailLabel: 'false' });
    const email = iconOnly.element.querySelector('.shm-cc-email')!;
    expect(email.classList.contains('is-icon-only')).toBe(true);
    expect(email.getAttribute('aria-label')).toBe('Email: tom@example.com');
    expect(email.textContent).toBe('');
    expect(iconOnly.element.querySelector('.shm-cc-contact')!.classList.contains('is-icons')).toBe(true);
  });

  it('hides a line with both its icon and its text switched off', async () => {
    const { element } = await mount({ Consultants: TEAM }, { showPhone: 'show', showPhoneLabel: 'false' });
    expect(element.querySelector('.shm-cc-phone')).toBeNull();
    expect(element.querySelector('.shm-cc-contact')).toBeNull();
  });
});

describe('social links', () => {
  const social = consultant({
    linkedInURL: 'https://www.linkedin.com/in/priya', facebookURL: 'https://facebook.com/priya', twitterURL: 'https://x.com/priya',
    googleURL: 'https://g.page/priya', weChatURL: 'weixin://dl/chat?priya',
  });

  it('shows only the networks switched on, as icon links that open in a new tab', async () => {
    const { element } = await mount({ Consultants: [social] }, { showLinkedin: 'true', showTwitter: 'true' });
    const links = [...element.querySelectorAll<HTMLAnchorElement>('.shm-cc-social-link')];
    expect(links.map((a) => a.getAttribute('href'))).toEqual(['https://www.linkedin.com/in/priya', 'https://x.com/priya']);
    expect(links.map((a) => a.getAttribute('aria-label'))).toEqual(['LinkedIn: Priya Shah', 'X: Priya Shah']);
    expect(links.every((a) => a.target === '_blank' && a.rel === 'noopener noreferrer' && a.querySelector('svg'))).toBe(true);
    expect(links.every((a) => a.classList.contains('is-icon-only'))).toBe(true);
  });

  it('shows the words when asked, and lets the site builder rename them', async () => {
    const { element } = await mount({ Consultants: [social] }, { showFacebook: 'true', showFacebookLabel: 'true', showFacebookIcon: 'false', facebookText: 'Facebook page' });
    const link = element.querySelector('.shm-cc-facebook')!;
    expect(link.querySelector('svg')).toBeNull();
    expect(link.textContent).toBe('Facebook page');
    expect(link.getAttribute('aria-label')).toBe('Facebook page: Priya Shah');
  });

  it('never links a social address that is not http(s), and skips a consultant without one', async () => {
    const rows = [social, consultant({ consultantID: 'n', firstName: 'No', lastName: 'Links', linkedInURL: null, sortOrder: 2 })];
    const { element } = await mount({ Consultants: rows }, { showWeChat: 'true', showLinkedin: 'true', showGoogle: 'true' });
    expect(element.querySelector('.shm-cc-wechat')).toBeNull();
    expect(element.querySelectorAll('.shm-cc-social')).toHaveLength(1);
    expect(element.querySelectorAll('.shm-cc-social-link')).toHaveLength(2);
  });

  it('escapes a social link and the consultant name in its label', async () => {
    const rows = [consultant({ firstName: '"><img src=x>', linkedInURL: 'https://x.example.com/"><script>1</script>' })];
    const { element } = await mount({ Consultants: rows }, { showLinkedin: 'true' });
    expect(element.querySelector('.shm-cc-stage img, .shm-cc-stage script')).toBeNull();
    expect(element.querySelector('.shm-cc-linkedin')!.getAttribute('aria-label')).toBe('LinkedIn: "> Shah');
    expect(element.querySelector('.shm-cc-linkedin')!.getAttribute('href')).toBe('https://x.example.com/"><script>1</script>');
  });
});

describe('location, sector, description and button', () => {
  const rich = consultant({
    businessLocation: '[{"LocationName":"Sydney"},{"LocationName":"Melbourne"}]', classification: '[{"Profession":"Accounting"},{"Profession":"Finance"}]',
    shortDescription: '<p>Twenty years in <b>finance</b> recruitment.</p>',
  });

  it('reads the console lists and shows them on request', async () => {
    const { element } = await mount({ Consultants: [rich] }, { showLocation: 'true', showLocationIcon: 'true', showSector: 'true', showDescription: 'true' });
    expect(element.querySelector('.shm-cc-location')!.textContent).toBe('Sydney, Melbourne');
    expect(element.querySelector('.shm-cc-location svg')).not.toBeNull();
    expect(element.querySelector('.shm-cc-sector')!.textContent).toBe('Accounting, Finance');
    const desc = element.querySelector<HTMLElement>('.shm-cc-desc')!;
    expect(desc.textContent).toBe('Twenty years in finance recruitment.');
    expect(desc.classList.contains('is-clamped')).toBe(true);
    expect(desc.style.getPropertyValue('--shm-cc-lines')).toBe('3');
  });

  it('uses the plain-text location and sector fields when the lists are empty', async () => {
    const rows = [consultant({ businessLocation: null, businessLocation2: 'Perth, Darwin', classification: null, classification2: 'Mining' })];
    const { element } = await mount({ Consultants: rows }, { showLocation: 'true', showSector: 'true', descriptionLines: '0', showDescription: 'true' });
    expect(element.querySelector('.shm-cc-location')!.textContent).toBe('Perth, Darwin');
    expect(element.querySelector('.shm-cc-sector')!.textContent).toBe('Mining');
  });

  it('draws the profile button to the consultant page, or the chosen profile page, in a new tab when asked', async () => {
    const own = await mount({ Consultants: TEAM }, { showButton: 'true' });
    const button = own.element.querySelector<HTMLAnchorElement>('.shm-cc-button')!;
    expect(button.textContent).toBe('View profile');
    expect(button.getAttribute('href')).toBe('/consultant/tom-reilly');
    expect(button.hasAttribute('target')).toBe(false);
    const page = await mount({ Consultants: TEAM }, { showButton: 'true', buttonText: 'Meet Tom', profilePage: '/our-team/', newTab: 'true' });
    const b = page.element.querySelector<HTMLAnchorElement>('.shm-cc-button')!;
    expect([b.textContent, b.getAttribute('href'), b.target, b.rel]).toEqual(['Meet Tom', '/our-team/tom-reilly', '_blank', 'noopener']);
    expect(page.element.querySelector('a.shm-cc-name')!.getAttribute('href')).toBe('/our-team/tom-reilly');
  });

  it('draws no button for a consultant without a page', async () => {
    const { element } = await mount({ Consultants: [consultant({ consultantURL: null })] }, { showButton: 'true' });
    expect(element.querySelector('.shm-cc-button')).toBeNull();
  });

  it('filters by a JSON classification and by location from the settings', async () => {
    const rows = [rich, consultant({ consultantID: 'q', firstName: 'Other', classification: '[{"Profession":"Legal"}]', businessLocation: '[{"LocationName":"Perth"}]', sortOrder: 2 })];
    expect(names((await mount({ Consultants: rows }, { classification: 'finance' })).element)).toEqual(['Priya Shah']);
    expect(names((await mount({ Consultants: rows }, { location: 'perth, hobart' })).element)).toEqual(['Other Shah']);
    const none = await mount({ Consultants: rows }, { location: 'Hobart' }, { inEditor: true });
    expect(none.element.querySelector('.shm-cc-editor-note')!.textContent).toContain('Location "hobart"');
  });
});

describe('card layout options', () => {
  it('adds a root class only for a choice that is not the default', async () => {
    const plain = await mount({ Consultants: TEAM });
    expect(plain.element.querySelector('.shm-cc')!.className).toBe('shm-cc is-mode-team is-ready');
    const set = await mount({ Consultants: TEAM }, { itemLayout: 'portrait', align: 'center', layout: 'slider', filterAlign: 'right' });
    expect(set.element.querySelector('.shm-cc')!.className).toBe('shm-cc is-mode-team is-item-portrait is-align-center is-layout-slider is-filters-right is-ready');
    const back = await mount({ Consultants: TEAM }, { itemLayout: 'side' });
    expect(back.element.querySelector('.shm-cc')!.classList.contains('is-item-side')).toBe(true);
  });
});

describe('slider', () => {
  beforeEach(() => {
    (HTMLElement.prototype as any).scrollBy = vi.fn();
    (HTMLElement.prototype as any).scrollTo = vi.fn();
  });

  it('draws a labelled, keyboard-scrollable row with real buttons, sized by slides to show', async () => {
    const { element } = await mount({ Consultants: TEAM }, { layout: 'slider', slidesToShow: '2', columnsTablet: '3' });
    const region = element.querySelector('.shm-cc-slider')!;
    expect(region.getAttribute('role')).toBe('region');
    expect(region.getAttribute('aria-roledescription')).toBe('carousel');
    expect([...element.querySelectorAll('button.shm-cc-arrow')].map((b) => b.getAttribute('aria-label'))).toEqual(['Previous consultants', 'Next consultants']);
    const root = element.querySelector<HTMLElement>('.shm-cc')!;
    expect([root.style.getPropertyValue('--shm-cc-cols-d'), root.style.getPropertyValue('--shm-cc-cols-t'), root.style.getPropertyValue('--shm-cc-cols-m')]).toEqual(['2', '2', '1']);
  });

  it('moves with the arrows and the arrow keys', async () => {
    const { element } = await mount({ Consultants: TEAM }, { layout: 'slider' });
    const track = element.querySelector<HTMLElement>('.shm-cc-track')!;
    expect(track.hasAttribute('tabindex')).toBe(false);
    Object.defineProperty(track, 'scrollWidth', { value: 1000, configurable: true });
    Object.defineProperty(track, 'clientWidth', { value: 400, configurable: true });
    track.dispatchEvent(new Event('scroll'));
    await new Promise((r) => setTimeout(r, 40));
    expect(track.getAttribute('tabindex')).toBe('0');
    element.querySelector<HTMLButtonElement>('[data-shm-cc-next]')!.click();
    expect(track.scrollBy).toHaveBeenCalledTimes(1);
    track.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    expect(track.scrollBy).toHaveBeenCalledTimes(2);
    element.querySelector<HTMLButtonElement>('[data-shm-cc-prev]')!.click();
    expect(track.scrollTo).toHaveBeenCalledWith({ left: 600, behavior: 'smooth' });
  });

  it('marks the ends when it does not loop, and has no buttons when arrows are off', async () => {
    const stop = await mount({ Consultants: TEAM }, { layout: 'slider', infinite: 'false' });
    expect(stop.element.querySelector('[data-shm-cc-prev]')!.getAttribute('aria-disabled')).toBe('true');
    const none = await mount({ Consultants: TEAM }, { layout: 'slider', arrows: 'false' });
    expect(none.element.querySelector('.shm-cc-controls')).toBeNull();
  });

  it('autoplays with a pause button, and stops the timer when the editor re-runs', async () => {
    vi.useFakeTimers();
    try {
      const element: HTMLElement = document.createElement('div');
      element.innerHTML = SHELL;
      document.body.appendChild(element);
      const run = (config: Record<string, string>) => win.ShazammeWidget['consultant-card']({ element, data: { config, siteId: 's' }, shazamme: fakeSdk({ Consultants: TEAM }) });
      await run({ layout: 'slider', autoplay: 'true', sliderSpeed: '3000' });
      const track = element.querySelector<HTMLElement>('.shm-cc-track')!;
      Object.defineProperty(track, 'scrollWidth', { value: 1000, configurable: true });
      Object.defineProperty(track, 'clientWidth', { value: 400, configurable: true });
      vi.advanceTimersByTime(3000);
      expect(track.scrollBy).toHaveBeenCalledTimes(1);
      const pause = element.querySelector<HTMLButtonElement>('[data-shm-cc-pause]')!;
      pause.click();
      expect(pause.getAttribute('aria-label')).toBe('Play');
      vi.advanceTimersByTime(9000);
      expect(track.scrollBy).toHaveBeenCalledTimes(1);
      pause.click();
      await run({});
      vi.advanceTimersByTime(9000);
      expect(track.scrollBy).toHaveBeenCalledTimes(1);
    } finally {
      vi.useRealTimers();
    }
  });

  it('starts paused for visitors who turned off motion', async () => {
    const original = window.matchMedia;
    (window as any).matchMedia = (q: string) => ({ matches: q.includes('reduce'), media: q, addEventListener() {}, removeEventListener() {} });
    try {
      const { element } = await mount({ Consultants: TEAM }, { layout: 'slider', autoplay: 'true' });
      expect(element.querySelector('[data-shm-cc-pause]')!.getAttribute('aria-label')).toBe('Play');
    } finally {
      (window as any).matchMedia = original;
    }
  });
});

describe('filter bar', () => {
  const rows = [
    consultant({ consultantID: 'a', firstName: 'Priya', lastName: 'Shah', classification: '[{"Profession":"Finance"}]', businessLocation: '[{"LocationName":"Sydney"}]', sortOrder: 1 }),
    consultant({ consultantID: 'b', firstName: 'Tom', lastName: 'Reilly', positionTitle: 'Tech lead', classification: '[{"Profession":"Technology"}]', businessLocation: '[{"LocationName":"Melbourne"}]', sortOrder: 2 }),
    consultant({ consultantID: 'c', firstName: 'Ana', lastName: 'Costa', classification: '[{"Profession":"Finance"},{"Profession":"Legal"}]', businessLocation: '[{"LocationName":"Melbourne"}]', sortOrder: 3 }),
  ];
  const pressed = (el: HTMLElement, group: string) => [...el.querySelectorAll(`[data-shm-cc-group="${group}"] [aria-pressed="true"]`)].map((b) => b.textContent);

  it('draws one button per sector and location, A to Z, after All', async () => {
    const { element } = await mount({ Consultants: rows }, { showClassificationFilter: 'true', showLocationFilter: 'true' });
    const groups = [...element.querySelectorAll<HTMLElement>('.shm-cc-filters')];
    expect(groups.map((g) => g.getAttribute('aria-label'))).toEqual(['Filter by sector', 'Filter by location']);
    expect([...groups[0].querySelectorAll('button')].map((b) => b.textContent)).toEqual(['All', 'Finance', 'Legal', 'Technology']);
    expect([...groups[1].querySelectorAll('button')].map((b) => b.textContent)).toEqual(['All', 'Melbourne', 'Sydney']);
    expect(pressed(element, 'sector')).toEqual(['All']);
  });

  it('filters by a sector and a location together, and All clears one', async () => {
    const { element } = await mount({ Consultants: rows }, { showClassificationFilter: 'true', showLocationFilter: 'true' });
    const click = (group: string, text: string) =>
      [...element.querySelectorAll<HTMLButtonElement>(`[data-shm-cc-group="${group}"] button`)].find((b) => b.textContent === text)!.click();
    click('sector', 'Finance');
    expect(names(element)).toEqual(['Priya Shah', 'Ana Costa']);
    expect(pressed(element, 'sector')).toEqual(['Finance']);
    click('location', 'Melbourne');
    expect(names(element)).toEqual(['Ana Costa']);
    click('sector', 'All');
    expect(names(element)).toEqual(['Tom Reilly', 'Ana Costa']);
  });

  it('searches names and job titles, and says so when nothing matches', async () => {
    const { element } = await mount({ Consultants: rows }, { showSearch: 'true' });
    const input = element.querySelector<HTMLInputElement>('input[type="search"]')!;
    expect(element.querySelector(`label[for="${input.id}"]`)!.textContent).toBe('Search by name');
    await typeSearch(input, 'tech');
    expect(names(element)).toEqual(['Tom Reilly']);
    await typeSearch(input, 'zzz');
    expect(names(element)).toEqual([]);
    const nomatch = element.querySelector('.shm-cc-nomatch')!;
    expect(nomatch.textContent).toBe('No consultants match your search.');
    expect(nomatch.getAttribute('aria-hidden')).toBe('true');
    expect(element.querySelector('[role="status"]')!.textContent).toBe('No consultants match your search.');
  });

  it('filters inside the slider too', async () => {
    (HTMLElement.prototype as any).scrollBy = vi.fn();
    const { element } = await mount({ Consultants: rows }, { showSearch: 'true', layout: 'slider' });
    const input = element.querySelector<HTMLInputElement>('input[type="search"]')!;
    await typeSearch(input, 'ana');
    expect(element.querySelectorAll('.shm-cc-track .shm-cc-card')).toHaveLength(1);
  });

  it('tells the site builder why a filter row is missing, and gives each copy its own ids', async () => {
    const plain = [consultant(), consultant({ consultantID: 'z', firstName: 'Zed', sortOrder: 3 })];
    const { element } = await mount({ Consultants: plain }, { showClassificationFilter: 'true', showSearch: 'true' }, { inEditor: true });
    expect(element.querySelector('.shm-cc-editor-note')!.textContent).toContain('sector');
    expect(element.querySelector('.shm-cc-filters')).toBeNull();
    const other = await mount({ Consultants: plain }, { showSearch: 'true' });
    expect(other.element.querySelector('input')!.id).not.toBe(element.querySelector('input')!.id);
  });
});

describe('job page with the new options', () => {
  it('gets the same mobile, social, photo and button options', async () => {
    const rows = [consultant({ consultantID: 'a', linkedInURL: 'https://www.linkedin.com/in/priya' })];
    const jobs = [job({ jobID: 'J1', contactEmail: 'priya@example.com' })];
    const { element } = await mount({ Consultants: rows, Jobs: jobs }, { mode: 'job', jobID: 'J1', showMobile: 'true', showLinkedin: 'true', avatar: 'photo', showButton: 'true', layout: 'slider', showSearch: 'true' });
    const panel = element.querySelector('.shm-cc-job')!;
    expect(panel.querySelector('.shm-cc-mobile')!.getAttribute('href')).toBe('tel:0400000000');
    expect(panel.querySelector('.shm-cc-linkedin')).not.toBeNull();
    expect(panel.querySelector('img.shm-cc-photo-img')).not.toBeNull();
    expect(panel.querySelector('.shm-cc-button')!.getAttribute('href')).toBe('/consultant/priya-shah');
    expect(element.querySelector('.shm-cc-slider, .shm-cc-tools')).toBeNull();
    expect(element.querySelector('.shm-cc')!.classList.contains('is-layout-slider')).toBe(false);
    const portrait = await mount({ Consultants: rows, Jobs: jobs }, { mode: 'job', jobID: 'J1', itemLayout: 'portrait' });
    expect(portrait.element.querySelector('.shm-cc')!.classList.contains('is-item-portrait')).toBe(false);
  });
});

describe('review fixes: links stay on the site', () => {
  it('collapses leading slashes so an address never becomes a link to another host', () => {
    expect(hrefPath('https://x.com//evil.com/p')).toBe('/evil.com/p');
    expect(hrefPath('https://x.com///evil.com/p?q=1')).toBe('/evil.com/p?q=1');
    expect(hrefPath('/\\evil')).toBe('');
    expect(hrefPath('https://x.com/\\evil')).toBe('');
    expect(hrefPath('//evil.com/p')).toBe('');
    expect(localPath('/\\/\\evil.com')).toBe('/evil.com');
    expect(profileHref({ path: '/evil.com/p' }, '\\\\evil')).toBe('/%5C%5Cevil/p');
  });

  it('renders no name link or button whose href starts with // or /\\', async () => {
    const rows = [
      consultant({ consultantID: 'a', consultantURL: 'https://x.com//evil.com/p', sortOrder: 1 }),
      consultant({ consultantID: 'b', firstName: 'Back', consultantURL: '/\\evil', sortOrder: 2 }),
      consultant({ consultantID: 'c', firstName: 'Triple', consultantURL: 'https://x.com///evil.com', sortOrder: 3 }),
    ];
    const configs: Record<string, string>[] = [{ showButton: 'true' }, { showButton: 'true', profilePage: 'team' }];
    for (const config of configs) {
      const { element } = await mount({ Consultants: rows }, config);
      const hrefs = [...element.querySelectorAll('.shm-cc-stage a[href]')].map((a) => a.getAttribute('href')!);
      expect(hrefs.length, JSON.stringify(config)).toBeGreaterThan(0);
      expect(hrefs.filter((h) => /^[/\\][/\\]/.test(h)), JSON.stringify(config)).toEqual([]);
    }
    const own = await mount({ Consultants: rows }, { showButton: 'true' });
    expect(own.element.querySelector('a.shm-cc-name')!.getAttribute('href')).toBe('/evil.com/p');
    expect(own.element.querySelector('.shm-cc-button')!.getAttribute('href')).toBe('/evil.com/p');
  });
});

describe('review fixes: filter bar status and search', () => {
  const rows = [
    consultant({ consultantID: 'a', firstName: 'Priya', classification: '[{"Profession":"Finance"}]', sortOrder: 1 }),
    consultant({ consultantID: 'b', firstName: 'Tom', classification: '[{"Profession":"Technology"}]', sortOrder: 2 }),
    consultant({ consultantID: 'c', firstName: 'Ana', classification: '[{"Profession":"Finance"}]', sortOrder: 3 }),
  ];
  const click = (el: HTMLElement, text: string) =>
    [...el.querySelectorAll<HTMLButtonElement>('.shm-cc-filter')].find((b) => b.textContent === text)!.click();

  it('announces how many consultants are shown after every filter change', async () => {
    const { element } = await mount({ Consultants: rows }, { showClassificationFilter: 'true' });
    const status = element.querySelector('[role="status"]')!;
    expect(status.textContent).toBe('');
    click(element, 'Finance');
    expect(status.textContent).toBe('2 consultants shown');
    click(element, 'Technology');
    expect(status.textContent).toBe('1 consultant shown');
    click(element, 'All');
    expect(status.textContent).toBe('3 consultants shown');
  });

  it('uses the site builder wording for the count', async () => {
    const { element } = await mount({ Consultants: rows }, { showClassificationFilter: 'true', resultsCountOne: 'Eén ({n})', resultsCountMany: '{n} people' });
    click(element, 'Finance');
    expect(element.querySelector('[role="status"]')!.textContent).toBe('2 people');
    click(element, 'Technology');
    expect(element.querySelector('[role="status"]')!.textContent).toBe('Eén (1)');
  });

  it('waits for the visitor to stop typing before it redraws the list', async () => {
    vi.useFakeTimers();
    try {
      const { element } = await mount({ Consultants: rows }, { showSearch: 'true' });
      const input = element.querySelector<HTMLInputElement>('input[type="search"]')!;
      for (const v of ['a', 'an', 'ana']) {
        input.value = v;
        input.dispatchEvent(new Event('input'));
        vi.advanceTimersByTime(100);
      }
      expect(names(element)).toHaveLength(3);
      vi.advanceTimersByTime(150);
      expect(names(element)).toEqual(['Ana Shah']);
      expect(element.querySelector('[role="status"]')!.textContent).toBe('1 consultant shown');
    } finally {
      vi.useRealTimers();
    }
  });

  it('does not restart the slider timer on every key', async () => {
    vi.useFakeTimers();
    (HTMLElement.prototype as any).scrollBy = vi.fn();
    const setIntervalSpy = vi.spyOn(window, 'setInterval');
    try {
      const { element } = await mount({ Consultants: rows }, { showSearch: 'true', layout: 'slider', autoplay: 'true' });
      expect(setIntervalSpy).toHaveBeenCalledTimes(1);
      const input = element.querySelector<HTMLInputElement>('input[type="search"]')!;
      for (const v of ['p', 'pr', 'pri', 'priy']) {
        input.value = v;
        input.dispatchEvent(new Event('input'));
        vi.advanceTimersByTime(50);
      }
      vi.advanceTimersByTime(200);
      expect(setIntervalSpy).toHaveBeenCalledTimes(2);
    } finally {
      setIntervalSpy.mockRestore();
      vi.useRealTimers();
    }
  });

  it('leaves no stray timers or listeners after filter changes redraw the slider', async () => {
    vi.useFakeTimers();
    (HTMLElement.prototype as any).scrollBy = vi.fn();
    const clearSpy = vi.spyOn(window, 'clearInterval');
    try {
      const { element } = await mount({ Consultants: rows }, { showClassificationFilter: 'true', layout: 'slider', autoplay: 'true', sliderSpeed: '3000' });
      const before = vi.getTimerCount();
      for (const text of ['Finance', 'Technology', 'All', 'Finance']) click(element, text);
      expect(clearSpy).toHaveBeenCalledTimes(4);
      expect(vi.getTimerCount()).toBe(before);
      const track = element.querySelector<HTMLElement>('.shm-cc-track')!;
      sized(track);
      const scrollBy = vi.fn();
      track.scrollBy = scrollBy;
      vi.advanceTimersByTime(3000);
      expect(scrollBy).toHaveBeenCalledTimes(1);
    } finally {
      clearSpy.mockRestore();
      vi.useRealTimers();
    }
  });
});

describe('review fixes: slider keys, direction and autoplay', () => {
  beforeEach(() => {
    (HTMLElement.prototype as any).scrollBy = vi.fn();
    (HTMLElement.prototype as any).scrollTo = vi.fn();
  });
  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('ignores the arrow keys with Alt, Ctrl, Cmd or Shift held, so browser shortcuts still work', async () => {
    const { element } = await mount({ Consultants: TEAM }, { layout: 'slider' });
    const track = element.querySelector<HTMLElement>('.shm-cc-track')!;
    sized(track);
    for (const mod of ['altKey', 'ctrlKey', 'metaKey', 'shiftKey']) {
      const e = new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true, [mod]: true });
      track.dispatchEvent(e);
      expect(e.defaultPrevented, mod).toBe(false);
    }
    expect(track.scrollBy).not.toHaveBeenCalled();
    track.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    expect(track.scrollBy).toHaveBeenCalledTimes(1);
  });

  it('follows the reading direction on a right to left page', async () => {
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({ width: 200, height: 100, top: 0, left: 0, right: 200, bottom: 100, x: 0, y: 0, toJSON: () => ({}) } as DOMRect);
    const { element } = await mount({ Consultants: TEAM }, { layout: 'slider', infinite: 'false' });
    const track = element.querySelector<HTMLElement>('.shm-cc-track')!;
    track.style.direction = 'rtl';
    sized(track);
    track.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    expect(track.scrollBy).not.toHaveBeenCalled();
    track.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
    expect(track.scrollBy).toHaveBeenCalledWith({ left: -200, behavior: 'smooth' });
    element.querySelector<HTMLButtonElement>('[data-shm-cc-next]')!.click();
    expect(track.scrollBy).toHaveBeenLastCalledWith({ left: -200, behavior: 'smooth' });
    track.style.direction = 'ltr';
    track.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    expect(track.scrollBy).toHaveBeenLastCalledWith({ left: 200, behavior: 'smooth' });
  });

  it('stops at the last card when it does not loop, and Play starts it again from the first', async () => {
    vi.useFakeTimers();
    const { element } = await mount({ Consultants: TEAM }, { layout: 'slider', autoplay: 'true', infinite: 'false', sliderSpeed: '3000' });
    const track = element.querySelector<HTMLElement>('.shm-cc-track')!;
    sized(track);
    Object.defineProperty(track, 'scrollLeft', { value: 600, configurable: true, writable: true });
    vi.advanceTimersByTime(3000);
    expect(track.scrollBy).not.toHaveBeenCalled();
    expect(track.scrollTo).not.toHaveBeenCalled();
    const pause = element.querySelector<HTMLButtonElement>('[data-shm-cc-pause]')!;
    expect(pause.getAttribute('aria-label')).toBe('Play');
    expect(element.querySelector('.shm-cc-slider')!.classList.contains('is-paused')).toBe(true);
    pause.click();
    expect(track.scrollTo).toHaveBeenCalledWith({ left: 0, behavior: 'smooth' });
    expect(pause.getAttribute('aria-label')).toBe('Pause');
  });

  it('still loops back to the first card on its own when infinite is on', async () => {
    vi.useFakeTimers();
    const { element } = await mount({ Consultants: TEAM }, { layout: 'slider', autoplay: 'true', sliderSpeed: '3000' });
    const track = element.querySelector<HTMLElement>('.shm-cc-track')!;
    sized(track);
    Object.defineProperty(track, 'scrollLeft', { value: 600, configurable: true, writable: true });
    vi.advanceTimersByTime(3000);
    expect(track.scrollTo).toHaveBeenCalledWith({ left: 0, behavior: 'smooth' });
    expect(element.querySelector('[data-shm-cc-pause]')!.getAttribute('aria-label')).toBe('Pause');
  });

  it('pauses while pointed at, while focus is in the row, and in a hidden tab', async () => {
    vi.useFakeTimers();
    const { element } = await mount({ Consultants: TEAM }, { layout: 'slider', autoplay: 'true', sliderSpeed: '3000' });
    const slider = element.querySelector<HTMLElement>('.shm-cc-slider')!;
    const track = element.querySelector<HTMLElement>('.shm-cc-track')!;
    sized(track);
    slider.dispatchEvent(new MouseEvent('mouseenter'));
    vi.advanceTimersByTime(3000);
    expect(track.scrollBy).toHaveBeenCalledTimes(0);
    slider.dispatchEvent(new MouseEvent('mouseleave'));
    vi.advanceTimersByTime(3000);
    expect(track.scrollBy).toHaveBeenCalledTimes(1);
    track.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
    vi.advanceTimersByTime(3000);
    expect(track.scrollBy).toHaveBeenCalledTimes(1);
    track.dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: null }));
    vi.advanceTimersByTime(3000);
    expect(track.scrollBy).toHaveBeenCalledTimes(2);
    Object.defineProperty(document, 'visibilityState', { value: 'hidden', configurable: true });
    try {
      vi.advanceTimersByTime(3000);
      expect(track.scrollBy).toHaveBeenCalledTimes(2);
    } finally {
      delete (document as any).visibilityState;
    }
    vi.advanceTimersByTime(3000);
    expect(track.scrollBy).toHaveBeenCalledTimes(3);
  });

  it('names the slider once: the region, not the list inside it', async () => {
    const { element } = await mount({ Consultants: TEAM }, { layout: 'slider', ariaLabel: 'Meet the team' });
    expect(element.querySelector('.shm-cc-slider')!.getAttribute('aria-label')).toBe('Meet the team');
    expect(element.querySelector('.shm-cc-track')!.hasAttribute('aria-label')).toBe(false);
  });
});

describe('review fixes: contact names, social networks, photos and ids', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('names an icon-only contact link by what it is, in the site builder wording', async () => {
    const config = { showPhone: 'show', showPhoneIcon: 'true', showPhoneLabel: 'false', showMobile: 'true', showMobileIcon: 'true', showMobileLabel: 'false', showEmail: 'show', showEmailIcon: 'true', showEmailLabel: 'false' };
    const plain = await mount({ Consultants: [consultant()] }, config);
    expect(['.shm-cc-phone', '.shm-cc-mobile', '.shm-cc-email'].map((c) => plain.element.querySelector(c)!.getAttribute('aria-label')))
      .toEqual(['Phone: +61 2 0000 0000', 'Mobile: 0400 000 000', 'Email: priya@example.com']);
    const worded = await mount({ Consultants: [consultant()] }, { ...config, phoneText: 'Tel', mobileText: 'Cell', emailText: 'E-mail' });
    expect(['.shm-cc-phone', '.shm-cc-mobile', '.shm-cc-email'].map((c) => worded.element.querySelector(c)!.getAttribute('aria-label')))
      .toEqual(['Tel: +61 2 0000 0000', 'Cell: 0400 000 000', 'E-mail: priya@example.com']);
    const texted = await mount({ Consultants: [consultant()] }, { showPhone: 'show', showPhoneIcon: 'true' });
    expect(texted.element.querySelector('.shm-cc-phone')!.hasAttribute('aria-label')).toBe(false);
  });

  it('draws Facebook, Google and WeChat in order, each with its logo, address and name', async () => {
    const row = consultant({ facebookURL: 'https://facebook.com/priya', googleURL: 'https://g.page/priya', weChatURL: 'https://u.wechat.com/priya' });
    const { element } = await mount({ Consultants: [row] }, { showFacebook: 'true', showGoogle: 'true', showWeChat: 'true', showGoogleLabel: 'true', googleText: 'Google profile' });
    const links = [...element.querySelectorAll<HTMLAnchorElement>('.shm-cc-social-link')];
    expect(links.map((a) => [...a.classList].find((c) => /^shm-cc-(facebook|google|wechat)$/.test(c)))).toEqual(['shm-cc-facebook', 'shm-cc-google', 'shm-cc-wechat']);
    expect(links.map((a) => a.getAttribute('href'))).toEqual(['https://facebook.com/priya', 'https://g.page/priya', 'https://u.wechat.com/priya']);
    expect(links.map((a) => a.getAttribute('aria-label'))).toEqual(['Facebook: Priya Shah', 'Google profile: Priya Shah', 'WeChat: Priya Shah']);
    expect(links.every((a) => a.querySelector('svg'))).toBe(true);
    expect(links[1].textContent).toBe('Google profile');
    expect(links[1].classList.contains('is-icon-only')).toBe(false);
    expect(links[0].classList.contains('is-icon-only')).toBe(true);
  });

  it('loads photos over https with no referrer, keeping the fallback', async () => {
    const rows = [consultant({ photoURL: 'http://cdn.example.com/p.jpg' })];
    const { element } = await mount({ Consultants: rows }, { avatar: 'photo-with-initials-fallback' });
    const img = element.querySelector('img')!;
    expect(img.getAttribute('src')).toBe('https://cdn.example.com/p.jpg');
    expect(img.getAttribute('referrerpolicy')).toBe('no-referrer');
    img.dispatchEvent(new Event('error'));
    expect(element.querySelector('.shm-cc-badge')!.textContent).toBe('PS');
  });

  it('gives each copy its own ids from crypto.randomUUID, with a fallback without it', async () => {
    vi.stubGlobal('crypto', { randomUUID: () => 'fixed-uuid' });
    const a = await mount({ Consultants: TEAM }, { showSearch: 'true' });
    expect(a.element.querySelector('input')!.id).toBe('shm-cc-fixed-uuid-q');
    vi.stubGlobal('crypto', undefined);
    const b = await mount({ Consultants: TEAM }, { showSearch: 'true' });
    const c = await mount({ Consultants: TEAM }, { showSearch: 'true' });
    const [idB, idC] = [b, c].map((m) => m.element.querySelector('input')!.id);
    expect(idB).toMatch(/^shm-cc-[a-z0-9]+-[a-z0-9]+-q$/);
    expect(idB).not.toBe(idC);
    expect(b.element.querySelector(`label[for="${idB}"]`)).not.toBeNull();
  });
});

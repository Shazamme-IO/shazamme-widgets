// @vitest-environment jsdom
// Runs the BUILT bundle (dist/testimonials-2026) in jsdom against a fake SDK, the way
// Duda's loader stub does. Covers the settings coercion, the tag filter, limit and sort,
// empty config, empty data, escaping, the carousel, read more and the schema toggle.

import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const here = dirname(fileURLToPath(import.meta.url));
const VERSION = JSON.parse(readFileSync(join(here, '..', '..', 'package.json'), 'utf8')).version as string;
const BUNDLE = readFileSync(join(here, '..', '..', 'dist', 'testimonials-2026', VERSION, 'widget.min.js'), 'utf8');
const SHELL = readFileSync(join(here, 'content.hbs'), 'utf8').replace(/\{\{\w+\}\}/g, '');

// A classic <script> makes the bundle's top-level `var` global; strict-mode eval keeps it local.
// Assign it to window instead, leaving the bundle strict.
const GLOBAL_BUNDLE = BUNDLE.replace('"use strict";var __shazWidgetExport=', '"use strict";window.__shazWidgetExport=');
if (GLOBAL_BUNDLE === BUNDLE) throw new Error('bundle prologue changed: update GLOBAL_BUNDLE in this test');

type Row = Record<string, unknown>;
type Win = Record<string, any>;

const row = (over: Row = {}): { data: Row; page_item_url: string } => ({
  data: {
    testimonialID: `id-${Math.random().toString(36).slice(2)}`,
    content: 'Great people to work with.',
    who: 'Steve Jobs',
    position: 'CEO',
    company: 'Apple',
    photoURL: 'https://cdn.example.com/steve.jpg',
    testimonialDate: '2023-05-04T00:00:00',
    tags: 'Candidate',
    consultantID: 'c1',
    ...over,
  },
  page_item_url: 'x',
});

function fakeSdk(testimonials: unknown, consultants: unknown = []) {
  const fetch = vi.fn(async ({ name }: { name: string }) => (name === 'Testimonials' ? testimonials : consultants));
  return { ready: vi.fn(async () => undefined), register: vi.fn(), fetch };
}

async function mount(rows: unknown, config: Record<string, string> = {}, opts: { inEditor?: boolean; consultants?: unknown; sdk?: unknown } = {}) {
  const win = window as unknown as Win;
  const element: HTMLElement = win.document.createElement('div');
  element.innerHTML = SHELL;
  win.document.body.appendChild(element);
  if (opts.sdk === undefined) delete win.__shmTmFetch;
  const sdk = opts.sdk === undefined ? fakeSdk(rows, opts.consultants) : opts.sdk;
  const ctx = { element, data: { config, inEditor: Boolean(opts.inEditor), siteId: 'site-1' }, $: undefined, shazamme: sdk };
  await win.ShazammeWidget['testimonials-2026'](ctx);
  return { element: element as HTMLElement, sdk: sdk as ReturnType<typeof fakeSdk>, ctx };
}

const names = (el: HTMLElement) => [...el.querySelectorAll('.shm-tm-card .shm-tm-name')].map((n) => n.textContent);

beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => undefined);
  const win = window as unknown as Win;
  win.document.body.innerHTML = '';
  win.document.body.removeAttribute('style');
  delete win.ShazammeWidget;
  delete win.__shmTmFetch;
  win.eval(GLOBAL_BUNDLE);
});

afterEach(() => {
  delete (window as unknown as Win).matchMedia;
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('tag filter', () => {
  const rows = [row({ who: 'A', tags: 'Candidate' }), row({ who: 'B', tags: 'Client' }), row({ who: 'C', tags: 'candidate, Perm' }), row({ who: 'D', tags: null })];

  it('shows everything when the tags setting is missing', async () => {
    expect(names((await mount(rows, { testimonialLayout: 'grid' })).element)).toHaveLength(4);
  });

  it('shows everything when the tags setting is empty, blank or only commas', async () => {
    for (const tags of ['', '   ', ' , ,, ']) {
      expect(names((await mount(rows, { testimonialLayout: 'grid', tags })).element)).toHaveLength(4);
    }
  });

  it('matches case-insensitively, trimmed, with several comma separated tags', async () => {
    const { element } = await mount(rows, { testimonialLayout: 'grid', tags: '  CANDIDATE ,  client ', sortOrder: 'manual' });
    expect(names(element)).toEqual(['A', 'B', 'C']);
  });

  it('matches a whole tag, not part of one', async () => {
    const { element } = await mount(rows, { testimonialLayout: 'grid', tags: 'cand' });
    expect(names(element)).toEqual([]);
  });
});

describe('limit and sort', () => {
  const rows = [
    row({ who: 'Old', testimonialDate: '2020-01-01T00:00:00' }),
    row({ who: 'New', testimonialDate: '2024-01-01T00:00:00' }),
    row({ who: 'Mid', testimonialDate: '2022-01-01T00:00:00' }),
    row({ who: 'Undated', testimonialDate: null }),
  ];

  it('defaults to newest first with undated last', async () => {
    expect(names((await mount(rows, { testimonialLayout: 'grid' })).element)).toEqual(['New', 'Mid', 'Old', 'Undated']);
  });

  it('sorts oldest first and in collection order (manual)', async () => {
    expect(names((await mount(rows, { testimonialLayout: 'grid', sortOrder: 'oldest' })).element)).toEqual(['Old', 'Mid', 'New', 'Undated']);
    expect(names((await mount(rows, { testimonialLayout: 'grid', sortOrder: 'manual' })).element)).toEqual(['Old', 'New', 'Mid', 'Undated']);
  });

  it('random keeps every testimonial', async () => {
    expect(names((await mount(rows, { testimonialLayout: 'grid', sortOrder: 'random' })).element).sort()).toEqual(['Mid', 'New', 'Old', 'Undated']);
  });

  it('caps the count after sorting, and 0 or junk means no cap', async () => {
    expect(names((await mount(rows, { testimonialLayout: 'grid', maxTestimonials: '2' })).element)).toEqual(['New', 'Mid']);
    for (const maxTestimonials of ['0', '', 'many', '-3']) {
      expect(names((await mount(rows, { testimonialLayout: 'grid', maxTestimonials })).element)).toHaveLength(4);
    }
  });
});

describe('empty config and bad input', () => {
  it('renders a slider with nothing configured', async () => {
    const { element } = await mount([row(), row()]);
    expect(element.querySelector('[role="region"][aria-roledescription="carousel"]')).not.toBeNull();
    expect(element.querySelectorAll('.shm-tm-slide')).toHaveLength(2);
    expect(element.querySelector('.shm-tm')!.classList.contains('is-ready')).toBe(true);
  });

  it('does not throw with no data object, no config, a null element or a missing SDK', async () => {
    const win = window as unknown as Win;
    const run = win.ShazammeWidget['testimonials-2026'];
    const el = win.document.createElement('div');
    await expect(run({ element: el })).resolves.toBeUndefined();
    await expect(run({ element: el, data: {} })).resolves.toBeUndefined();
    await expect(run({ element: el, data: { config: null }, shazamme: fakeSdk([row()]) })).resolves.toBeUndefined();
    await expect(run({ element: null })).resolves.toBeUndefined();
    await expect(run(undefined)).resolves.toBeUndefined();
  });

  it('falls back to defaults for unknown dropdown values and junk numbers', async () => {
    const { element } = await mount([row()], { testimonialLayout: 'carousel3d', columnsDesktop: 'lots', quoteLines: 'x', readMore: 'popup' });
    expect(element.querySelector('.shm-tm')!.classList.contains('is-layout-slider')).toBe(true);
    expect(element.querySelector<HTMLElement>('.shm-tm')!.style.getPropertyValue('--shm-tm-cols-d')).toBe('3');
  });

  it('survives rows that are not objects or have no quote', async () => {
    const { element } = await mount([null, 'x', 5, { data: null }, row({ content: '' , metaDescription: ''}), row({ who: 'Kept' })], { testimonialLayout: 'grid' });
    expect(names(element)).toEqual(['Kept']);
  });
});

describe('empty data', () => {
  it('shows a clear note in the editor', async () => {
    const { element } = await mount([], {}, { inEditor: true });
    expect(element.querySelector('.shm-tm-editor-note')!.textContent).toMatch(/no rows yet/);
    expect(element.querySelector<HTMLElement>('.shm-tm')!.hidden).toBe(false);
  });

  it('names the filter when rows exist but none match', async () => {
    const { element } = await mount([row()], { tags: 'Client' }, { inEditor: true });
    expect(element.querySelector('.shm-tm-editor-note')!.textContent).toMatch(/client/);
  });

  it('shows visitors nothing and hides the whole widget', async () => {
    for (const rows of [[], null, undefined, 'oops']) {
      const { element } = await mount(rows, { heading: 'Kind words' });
      expect(element.querySelector('.shm-tm-editor-note')).toBeNull();
      expect(element.querySelector('.shm-tm-stage')!.innerHTML).toBe('');
      expect(element.querySelector<HTMLElement>('.shm-tm')!.hidden).toBe(true);
    }
  });

  it('tells the editor when the SDK is missing, and hides it from visitors', async () => {
    const editor = await mount([], {}, { inEditor: true, sdk: null });
    expect(editor.element.querySelector('.shm-tm-editor-note')!.textContent).toMatch(/SDK/);
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const visitor = await mount([], {}, { sdk: null });
    expect(visitor.element.querySelector('.shm-tm-editor-note')).toBeNull();
    expect(visitor.element.querySelector<HTMLElement>('.shm-tm')!.hidden).toBe(true);
  });

  it('shows the editor the error when the fetch fails', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const sdk = { ready: async () => undefined, register: () => undefined, fetch: async () => { throw new Error('collection missing'); } };
    const { element } = await mount(null, {}, { inEditor: true, sdk });
    expect(element.querySelector('.shm-tm-editor-note')!.textContent).toMatch(/collection missing/);
  });
});

describe('escaping', () => {
  const evil = row({
    content: '<img src=x onerror=alert(1)><script>alert(2)</script> & more',
    who: '<b onmouseover=alert(3)>Eve</b>',
    position: '"><svg onload=alert(4)>',
    company: "'; DROP TABLE x;--",
    photoURL: 'javascript:alert(5)',
    tags: '<i>t</i>',
  });

  it('never turns data into elements or attributes', async () => {
    for (const layout of ['slider', 'grid', 'list', 'featured']) {
      const { element } = await mount([evil], { testimonialLayout: layout, showTagFilter: 'true' });
      expect(element.querySelector('img[onerror], script:not([type]), .shm-tm-card svg, .shm-tm-card b, .shm-tm-card i')).toBeNull();
      expect(element.querySelector('.shm-tm-text')!.textContent).toBe('& more');
      expect(element.querySelector('.shm-tm-name')!.textContent).toBe('Eve');
      expect(element.querySelector('[onmouseover], [onload], [onerror]')).toBeNull();
    }
  });

  it('refuses javascript: photo URLs and uses initials instead', async () => {
    const { element } = await mount([evil], { testimonialLayout: 'grid' });
    expect(element.querySelector('.shm-tm-photo img')).toBeNull();
    expect(element.querySelector('.shm-tm-initials')!.textContent).toBe('E');
  });

  it('escapes markup in the plain-text settings', async () => {
    const { element } = await mount([row()], { testimonialLayout: 'grid', ariaLabel: '"><script>x</script>', readMoreText: '<b>More</b>' });
    expect(element.querySelector('script:not([type])')).toBeNull();
    expect(element.querySelector('.shm-tm-list')!.getAttribute('aria-label')).toBe('"><script>x</script>');
  });

  it('escapes a closing script tag inside the JSON-LD', async () => {
    const { element } = await mount([row({ content: 'Fine </script><script>alert(1)</script>', rating: 5 })], { schemaEnabled: 'true', schemaBusinessName: 'Acme </script>' });
    const ld = element.querySelectorAll('script[type="application/ld+json"]');
    expect(ld).toHaveLength(1);
    expect(element.querySelectorAll('script')).toHaveLength(1);
    expect(JSON.parse(ld[0].textContent!).name).toBe('Acme </script>');
  });
});

describe('card content', () => {
  it('strips rich text from the quote and keeps paragraph breaks', async () => {
    const { element } = await mount([row({ content: '<p>One</p><p>Two &amp; three</p>' })], { testimonialLayout: 'grid' });
    expect(element.querySelector('.shm-tm-text')!.textContent).toBe('One\n\nTwo & three');
  });

  it('shows photo, role, company and date by their switches, with an initials fallback', async () => {
    const rows = [row({ who: 'Jane Wisdom', photoURL: '' })];
    const on = (await mount(rows, { testimonialLayout: 'grid', showDate: 'true', dateFormat: 'long' })).element;
    expect(on.querySelector('.shm-tm-initials')!.textContent).toBe('JW');
    expect(on.querySelector('.shm-tm-role')!.textContent).toBe('CEO');
    expect(on.querySelector('.shm-tm-company')!.textContent).toBe('Apple');
    expect(on.querySelector('time')!.getAttribute('datetime')).toBe('2023-05-04');
    const off = (await mount(rows, { testimonialLayout: 'grid', showPhoto: 'false', showPosition: 'false', showCompany: 'false', showQuoteMark: 'false' })).element;
    expect(off.querySelector('.shm-tm-photo, .shm-tm-role, .shm-tm-company, .shm-tm-mark, time')).toBeNull();
  });

  it('lazy loads photos with dimensions and swaps a broken photo for initials', async () => {
    const { element } = await mount([row({ who: 'Roy Hill' })], { testimonialLayout: 'grid' });
    const img = element.querySelector('.shm-tm-photo img') as HTMLImageElement;
    expect(img.getAttribute('loading')).toBe('lazy');
    expect(img.getAttribute('width')).toBe('64');
    img.dispatchEvent(new Event('error'));
    expect(element.querySelector('.shm-tm-photo img')).toBeNull();
    expect(element.querySelector('.shm-tm-initials')!.textContent).toBe('RH');
  });

  it('shows stars only when the data has a real rating', async () => {
    const { element } = await mount([row({ rating: '4.5', who: 'Rated' }), row({ who: 'Unrated' }), row({ rating: 9, who: 'Silly' })], { testimonialLayout: 'grid', sortOrder: 'manual' });
    const stars = [...element.querySelectorAll('.shm-tm-stars')];
    expect(stars).toHaveLength(1);
    expect(stars[0].getAttribute('aria-label')).toBe('Rated 4.5 out of 5');
    expect((stars[0].querySelector('.shm-tm-stars-on') as HTMLElement).style.width).toBe('90%');
    const hidden = (await mount([row({ rating: 5 })], { testimonialLayout: 'grid', showRating: 'false' })).element;
    expect(hidden.querySelector('.shm-tm-stars')).toBeNull();
  });

  it('adds the consultant, linked by path, only when switched on and found', async () => {
    const consultants = [{ data: { consultantID: 'C1', firstName: 'Jane', lastName: 'Wisdom', consultantURL: 'https://www.demo1.shazamme.com/consultant/jane-wisdom' } }];
    const off = await mount([row()], { testimonialLayout: 'grid' }, { consultants });
    expect(off.element.querySelector('.shm-tm-consultant')).toBeNull();
    expect(off.sdk.fetch).toHaveBeenCalledTimes(1);
    const on = await mount([row()], { testimonialLayout: 'grid', showConsultant: 'true' }, { consultants });
    expect(on.element.querySelector('.shm-tm-consultant')!.textContent).toBe('Consultant: Jane Wisdom');
    expect(on.element.querySelector('a.shm-tm-consultant-link')!.getAttribute('href')).toBe('/consultant/jane-wisdom');
  });

  it('writes the heading and intro tag level for the site builder', async () => {
    const win = window as unknown as Win;
    const element: HTMLElement = win.document.createElement('div');
    element.innerHTML = SHELL.replace('<h2 class="shm-tm-heading"></h2>', '<h2 class="shm-tm-heading">Kind words</h2>');
    win.document.body.appendChild(element);
    await win.ShazammeWidget['testimonials-2026']({ element, data: { config: { headingLevel: '3' } }, shazamme: fakeSdk([row()]) });
    expect(element.querySelector('h3.shm-tm-heading')!.textContent).toBe('Kind words');
    expect(element.querySelector('h2')).toBeNull();
  });
});

describe('layouts', () => {
  it('builds grid and list as real lists of cards', async () => {
    for (const layout of ['grid', 'list']) {
      const { element } = await mount([row(), row(), row()], { testimonialLayout: layout, pageSize: '0' });
      expect(element.querySelectorAll('ul.shm-tm-grid > li')).toHaveLength(3);
      expect(element.querySelector('.shm-tm')!.classList.contains(`is-layout-${layout}`)).toBe(true);
    }
  });

  it('keeps every card in the page but shows a page at a time with a show more button', async () => {
    const rows = Array.from({ length: 5 }, (_, i) => row({ who: `P${i}`, testimonialDate: `2024-01-0${i + 1}T00:00:00` }));
    const { element } = await mount(rows, { testimonialLayout: 'grid', pageSize: '2' });
    const items = () => [...element.querySelectorAll<HTMLElement>('.shm-tm-item')];
    expect(items()).toHaveLength(5);
    expect(items().filter((i) => !i.hidden)).toHaveLength(2);
    const more = element.querySelector<HTMLButtonElement>('.shm-tm-loadmore')!;
    expect(more.hidden).toBe(false);
    more.click();
    more.click();
    expect(items().filter((i) => !i.hidden)).toHaveLength(5);
    expect(more.hidden).toBe(true);
  });

  it('filters by tag chips on grid and list', async () => {
    const rows = [row({ who: 'A', tags: 'Candidate' }), row({ who: 'B', tags: 'Client' })];
    const { element } = await mount(rows, { testimonialLayout: 'list', showTagFilter: 'true', pageSize: '0', sortOrder: 'manual' });
    const chips = [...element.querySelectorAll<HTMLButtonElement>('.shm-tm-chip')];
    expect(chips.map((c) => c.textContent)).toEqual(['All', 'Candidate', 'Client']);
    chips[2].click();
    expect([...element.querySelectorAll<HTMLElement>('.shm-tm-item')].map((i) => i.hidden)).toEqual([true, false]);
    expect(chips[2].getAttribute('aria-pressed')).toBe('true');
    chips[0].click();
    expect([...element.querySelectorAll<HTMLElement>('.shm-tm-item')].map((i) => i.hidden)).toEqual([false, false]);
  });

  it('builds the featured layout as a one-up carousel with avatar pagination', async () => {
    const { element } = await mount([row({ who: 'A' }), row({ who: 'B' })], { testimonialLayout: 'featured', pagination: 'avatars' });
    expect(element.querySelector('.shm-tm')!.classList.contains('is-layout-featured')).toBe(true);
    expect(element.querySelectorAll('.shm-tm-dot.is-avatar')).toHaveLength(2);
  });
});

describe('carousel', () => {
  const rows = ['A', 'B', 'C'].map((who, i) => row({ who, testimonialDate: `2024-01-0${3 - i}T00:00:00` }));
  const active = (el: HTMLElement) => [...el.querySelectorAll<HTMLElement>('.shm-tm-slide')].map((s) => !s.hasAttribute('inert'));
  const current = (el: HTMLElement) => [...el.querySelectorAll('.shm-tm-dot')].findIndex((d) => d.getAttribute('aria-current') === 'true');

  it('uses carousel semantics', async () => {
    const { element } = await mount(rows);
    const region = element.querySelector('.shm-tm-carousel')!;
    expect(region.getAttribute('role')).toBe('region');
    expect(region.getAttribute('aria-roledescription')).toBe('carousel');
    expect(region.getAttribute('aria-label')).toBe('Client testimonials');
    const slides = [...element.querySelectorAll('.shm-tm-slide')];
    expect(slides.map((s) => s.getAttribute('aria-label'))).toEqual(['1 of 3', '2 of 3', '3 of 3']);
    expect(slides.every((s) => s.getAttribute('role') === 'group' && s.getAttribute('aria-roledescription') === 'slide')).toBe(true);
    expect(element.querySelector('.shm-tm-prev')!.getAttribute('aria-label')).toBe('Previous testimonial');
    expect(element.querySelector('.shm-tm-next')!.getAttribute('aria-label')).toBe('Next testimonial');
  });

  it('moves with the buttons, hides off-screen slides from tab and screen readers, and wraps', async () => {
    const { element } = await mount(rows);
    const next = element.querySelector<HTMLElement>('.shm-tm-next')!;
    const prev = element.querySelector<HTMLElement>('.shm-tm-prev')!;
    expect(active(element)).toEqual([true, false, false]);
    next.click();
    expect(active(element)).toEqual([false, true, false]);
    expect(current(element)).toBe(1);
    next.click();
    next.click();
    expect(current(element)).toBe(0);
    prev.click();
    expect(current(element)).toBe(2);
    expect(element.querySelectorAll('.shm-tm-slide[aria-hidden="true"]')).toHaveLength(2);
  });

  it('stops at the ends when loop is off', async () => {
    const { element } = await mount(rows, { loop: 'false' });
    const next = element.querySelector<HTMLElement>('.shm-tm-next')!;
    const prev = element.querySelector<HTMLElement>('.shm-tm-prev')!;
    expect(prev.getAttribute('aria-disabled')).toBe('true');
    next.click(); next.click(); next.click();
    expect(current(element)).toBe(2);
    expect(next.getAttribute('aria-disabled')).toBe('true');
  });

  it('jumps with the dots and responds to the arrow keys on the track', async () => {
    const { element } = await mount(rows);
    element.querySelectorAll<HTMLElement>('.shm-tm-dot')[2].click();
    expect(current(element)).toBe(2);
    const track = element.querySelector<HTMLElement>('.shm-tm-track')!;
    track.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
    expect(current(element)).toBe(1);
    track.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }));
    expect(current(element)).toBe(0);
    track.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
    expect(current(element)).toBe(2);
  });

  it('autoplays only when asked, pauses on hover and focus, and has a pause button', async () => {
    vi.useFakeTimers();
    const off = await mount(rows);
    expect(off.element.querySelector('.shm-tm-pause')).toBeNull();
    const many = ['A', 'B', 'C', 'D', 'E', 'F'].map((who, i) => row({ who, testimonialDate: `2024-01-0${6 - i}T00:00:00` }));
    const { element } = await mount(many, { autoplay: 'true', autoplaySeconds: '3' });
    expect(current(element)).toBe(0);
    vi.advanceTimersByTime(3100);
    expect(current(element)).toBe(1);
    const carousel = element.querySelector<HTMLElement>('.shm-tm-carousel')!;
    expect(element.querySelector('.shm-tm-track')!.getAttribute('aria-live')).toBe('off');
    carousel.dispatchEvent(new Event('pointerenter'));
    expect(element.querySelector('.shm-tm-track')!.getAttribute('aria-live')).toBe('polite');
    vi.advanceTimersByTime(10000);
    expect(current(element)).toBe(1);
    carousel.dispatchEvent(new Event('pointerleave'));
    vi.advanceTimersByTime(3100);
    expect(current(element)).toBe(2);
    const pause = element.querySelector<HTMLElement>('.shm-tm-pause')!;
    expect(pause.getAttribute('aria-label')).toBe('Pause testimonials');
    expect(pause.hasAttribute('aria-pressed')).toBe(false);
    pause.click();
    expect(pause.getAttribute('aria-label')).toBe('Play testimonials');
    expect(pause.classList.contains('is-paused')).toBe(true);
    vi.advanceTimersByTime(20000);
    expect(current(element)).toBe(2);
    pause.click();
    vi.advanceTimersByTime(3100);
    expect(current(element)).toBe(3);
  });

  it('ignores touch hover, so a tap does not hold autoplay still', async () => {
    vi.useFakeTimers();
    const many = ['A', 'B', 'C'].map((who) => row({ who }));
    const { element } = await mount(many, { autoplay: 'true', autoplaySeconds: '2' });
    const touch = new Event('pointerenter');
    Object.defineProperty(touch, 'pointerType', { value: 'touch' });
    element.querySelector('.shm-tm-carousel')!.dispatchEvent(touch);
    vi.advanceTimersByTime(2100);
    expect(current(element)).toBe(1);
  });

  it('stops autoplaying and drops its listeners once its widget is removed from the page', async () => {
    vi.useFakeTimers();
    const many = ['A', 'B', 'C'].map((who) => row({ who }));
    const { element } = await mount(many, { autoplay: 'true', autoplaySeconds: '2' });
    expect(vi.getTimerCount()).toBeGreaterThan(0);
    element.remove();
    vi.advanceTimersByTime(2100);
    expect(vi.getTimerCount()).toBe(0);
    const hidden = new Event('visibilitychange');
    document.dispatchEvent(hidden);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('never autoplays when the visitor prefers reduced motion', async () => {
    vi.useFakeTimers();
    const win = window as unknown as Win;
    win.matchMedia = vi.fn().mockImplementation((q: string) => ({ matches: q.includes('reduce'), media: q, addEventListener() {}, removeEventListener() {} }));
    const { element } = await mount(rows, { autoplay: 'true', autoplaySeconds: '2' });
    vi.advanceTimersByTime(30000);
    expect(current(element)).toBe(0);
    expect(element.querySelector('.shm-tm-pause')).toBeNull();
    delete win.matchMedia;
  });

  it('hides the controls when everything fits', async () => {
    const { element } = await mount([row()]);
    expect(element.querySelector<HTMLElement>('.shm-tm-controls')!.hidden).toBe(true);
  });
});

describe('read more', () => {
  const long = 'Word '.repeat(200).trim();

  it('shows no button for a short quote and one for a long quote', async () => {
    const { element } = await mount([row({ content: 'Short.' }), row({ content: long })], { testimonialLayout: 'grid', sortOrder: 'manual' });
    const buttons = [...element.querySelectorAll<HTMLElement>('.shm-tm-more')];
    expect(buttons.map((b) => b.hidden)).toEqual([true, false]);
  });

  it('expands in place and collapses again', async () => {
    const { element } = await mount([row({ content: long })], { testimonialLayout: 'grid', readMore: 'expand' });
    const btn = element.querySelector<HTMLElement>('.shm-tm-more')!;
    expect(btn.hasAttribute('aria-expanded')).toBe(false);
    btn.click();
    expect(btn.textContent).toBe('Read less from Steve Jobs');
    expect(btn.querySelector('.shm-tm-sr')).not.toBeNull();
    expect(element.querySelector('.shm-tm-card')!.classList.contains('is-expanded')).toBe(true);
    btn.click();
    expect(btn.textContent).toBe('Read more from Steve Jobs');
  });

  it('shows the full text and no button when read more is off', async () => {
    const { element } = await mount([row({ content: long })], { testimonialLayout: 'grid', readMore: 'off' });
    expect(element.querySelector('.shm-tm-more')).toBeNull();
    expect(element.querySelector<HTMLElement>('.shm-tm')!.style.getPropertyValue('--shm-tm-lines')).toBe('none');
  });

  describe('dialog', () => {
    it('opens an accessible dialog, traps focus, closes on Esc and returns focus', async () => {
      const { element } = await mount([row({ content: long, who: 'Dee' })], { testimonialLayout: 'grid' });
      const btn = element.querySelector<HTMLElement>('.shm-tm-more')!;
      btn.focus();
      btn.click();
      const panel = document.querySelector('.shm-tm-dialog-panel')!;
      expect(panel.getAttribute('role')).toBe('dialog');
      expect(panel.getAttribute('aria-modal')).toBe('true');
      const labelledBy = panel.getAttribute('aria-labelledby')!;
      expect(document.getElementById(labelledBy)!.textContent).toBe('Testimonial from Dee');
      expect(document.getElementById(panel.getAttribute('aria-describedby')!)!.textContent).toBe(long);
      expect(btn.getAttribute('aria-haspopup')).toBe('dialog');
      expect(btn.hasAttribute('aria-expanded')).toBe(false);
      expect(document.body.style.overflow).toBe('hidden');
      const close = document.querySelector<HTMLElement>('.shm-tm-dialog-close')!;
      expect(document.activeElement).toBe(close);

      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));
      expect(document.activeElement).toBe(close);
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true }));
      expect(document.activeElement).toBe(close);
      btn.focus();
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));
      expect(document.querySelector('.shm-tm-dialog')!.contains(document.activeElement)).toBe(true);

      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      expect(document.querySelector('.shm-tm-dialog')).toBeNull();
      expect(document.body.style.overflow).toBe('');
      expect(document.activeElement).toBe(btn);
    });

    it('closes from the close button and the backdrop', async () => {
      const { element } = await mount([row({ content: long })], { testimonialLayout: 'grid' });
      const btn = element.querySelector<HTMLElement>('.shm-tm-more')!;
      btn.click();
      document.querySelector<HTMLElement>('.shm-tm-dialog-close')!.click();
      expect(document.querySelector('.shm-tm-dialog')).toBeNull();
      btn.click();
      document.querySelector<HTMLElement>('[data-close]')!.click();
      expect(document.querySelector('.shm-tm-dialog')).toBeNull();
    });
  });
});

describe('schema.org JSON-LD', () => {
  const rated = [row({ who: 'A', rating: 5 }), row({ who: 'B', rating: 4 }), row({ who: 'C' })];
  const ld = (el: HTMLElement) => el.querySelector('script[type="application/ld+json"]');

  it('is off by default', async () => {
    expect(ld((await mount(rated)).element)).toBeNull();
  });

  it('emits Review and AggregateRating from real ratings only', async () => {
    const { element } = await mount(rated, { schemaEnabled: 'true', schemaBusinessName: 'Acme Recruitment', schemaBusinessType: 'EmploymentAgency' });
    const json = JSON.parse(ld(element)!.textContent!);
    expect(json['@type']).toBe('EmploymentAgency');
    expect(json.aggregateRating).toMatchObject({ ratingValue: 4.5, reviewCount: 2, bestRating: 5 });
    expect(json.review.map((r: any) => r.author.name).sort()).toEqual(['A', 'B']);
  });

  it('emits nothing when nobody has a rating or the business name is missing', async () => {
    expect(ld((await mount([row()], { schemaEnabled: 'true', schemaBusinessName: 'Acme' })).element)).toBeNull();
    expect(ld((await mount(rated, { schemaEnabled: 'true' })).element)).toBeNull();
  });

  it('follows the filters: only visible testimonials are described', async () => {
    const { element } = await mount([row({ who: 'A', rating: 5, tags: 'x' }), row({ who: 'B', rating: 1, tags: 'y' })], { schemaEnabled: 'true', schemaBusinessName: 'Acme', tags: 'x' });
    expect(JSON.parse(ld(element)!.textContent!).aggregateRating.ratingValue).toBe(5);
  });
});

describe('re-runs and copies', () => {
  it('replaces the previous render instead of stacking, and closes a dialog left open', async () => {
    const win = window as unknown as Win;
    const long = 'Word '.repeat(200).trim();
    const element: HTMLElement = win.document.createElement('div');
    element.innerHTML = SHELL;
    win.document.body.appendChild(element);
    const sdk = fakeSdk([row({ content: long }), row()]);
    const run = (config: Record<string, string>) => win.ShazammeWidget['testimonials-2026']({ element, data: { config, inEditor: true }, shazamme: sdk });
    await run({ testimonialLayout: 'grid' });
    element.querySelector<HTMLElement>('.shm-tm-more')!.click();
    expect(document.querySelector('.shm-tm-dialog')).not.toBeNull();
    await run({ testimonialLayout: 'slider' });
    expect(document.querySelector('.shm-tm-dialog')).toBeNull();
    await run({ testimonialLayout: 'slider' });
    expect(element.querySelectorAll('.shm-tm-carousel')).toHaveLength(1);
    expect(element.querySelectorAll('.shm-tm-slide')).toHaveLength(2);
  });

  it('keeps a stale answer from overwriting a newer run', async () => {
    const win = window as unknown as Win;
    const element: HTMLElement = win.document.createElement('div');
    element.innerHTML = SHELL;
    win.document.body.appendChild(element);
    let release!: (v: unknown) => void;
    const slow = { ready: async () => undefined, register() {}, fetch: () => new Promise((res) => { release = res; }) };
    const first = win.ShazammeWidget['testimonials-2026']({ element, data: { config: { testimonialLayout: 'grid' }, inEditor: true }, shazamme: slow });
    await Promise.resolve();
    await win.ShazammeWidget['testimonials-2026']({ element, data: { config: { testimonialLayout: 'list' }, inEditor: true }, shazamme: fakeSdk([row()]) });
    release([row(), row()]);
    await first;
    expect(element.querySelector('.shm-tm')!.classList.contains('is-layout-list')).toBe(true);
    expect(element.querySelectorAll('.shm-tm-card')).toHaveLength(1);
  });

  it('two copies on one page work independently and share one fetch', async () => {
    const sdk = fakeSdk([row({ who: 'A' }), row({ who: 'B' })]);
    const a = await mount(null, { testimonialLayout: 'grid', tags: 'candidate' }, { sdk });
    const b = await mount(null, { testimonialLayout: 'slider', maxTestimonials: '1' }, { sdk });
    expect(a.element.querySelectorAll('.shm-tm-card')).toHaveLength(2);
    expect(b.element.querySelectorAll('.shm-tm-card')).toHaveLength(1);
    expect(a.element.querySelector('.shm-tm-carousel')).toBeNull();
    expect(b.element.querySelector('.shm-tm-list')).toBeNull();
    expect(sdk.fetch).toHaveBeenCalledTimes(1);
    const ids = [...document.querySelectorAll('.shm-tm-text')].map((n) => n.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('asks the SDK to register itself and refetches in the editor', async () => {
    const sdk = fakeSdk([row()]);
    await mount(null, {}, { sdk, inEditor: true });
    await mount(null, {}, { sdk, inEditor: true });
    expect(sdk.register).toHaveBeenCalledWith('testimonials-2026', expect.anything());
    expect(sdk.fetch).toHaveBeenCalledTimes(2);
  });
});

describe('Duda AI prompts', () => {
  const read = (f: string) => readFileSync(join(here, f), 'utf8');
  const prompts = ['1-content', '2-layout', '3-card', '4-slider', '5-seo'].map((n) => read(`duda-ai-prompt-${n}.md`)).join('\n');
  const promptKeys = [...prompts.matchAll(/\| key: (\w+) \|/g)].map((m) => m[1]);

  it('lists every setting the code reads, once, and nothing else', () => {
    const code = read('settings.ts');
    const readKeys = [...new Set([...code.matchAll(/\bc\.(\w+)/g)].map((m) => m[1]))];
    expect([...promptKeys].sort()).toEqual([...readKeys].sort());
    expect(new Set(promptKeys).size).toBe(promptKeys.length);
  });

  it('gives each design line a selector and a property that exist in the shared CSS', () => {
    const css = read('duda-css.reference.css');
    const design = [read('duda-ai-prompt-6-design-cards.md'), read('duda-ai-prompt-7-design-people.md')].join('\n');
    const lines = [...design.matchAll(/selector: (.+?) \| property: ([\w-]+) \|/g)];
    expect(lines.length).toBeGreaterThan(60);
    for (const [, selector, property] of lines) {
      const classes = [...selector.matchAll(/\.(shm-tm[\w-]*)/g)].map((m) => m[1]);
      for (const cls of classes) expect(css, `${cls} (${property})`).toContain(`.${cls}`);
    }
  });
});

describe('review fixes', () => {
  const five = ['A', 'B', 'C', 'D', 'E'].map((who, i) => row({ who, testimonialDate: `2024-01-0${5 - i}T00:00:00` }));
  const dotsOn = (el: HTMLElement) => [...el.querySelectorAll<HTMLElement>('.shm-tm-dot')].filter((d) => !d.hidden);
  const currentDot = (el: HTMLElement) => [...el.querySelectorAll('.shm-tm-dot')].findIndex((d) => d.getAttribute('aria-current') === 'true');
  const slideState = (el: HTMLElement) => [...el.querySelectorAll<HTMLElement>('.shm-tm-slide')].map((s) => (s.hasAttribute('inert') ? 0 : 1)).join('');

  // jsdom has no layout: give each slide a width and the track a width, so three are visible at once.
  function withLayout(perView: number): () => void {
    const proto = HTMLElement.prototype;
    const widthDesc = Object.getOwnPropertyDescriptor(proto, 'offsetWidth');
    const clientDesc = Object.getOwnPropertyDescriptor(proto, 'clientWidth');
    const leftDesc = Object.getOwnPropertyDescriptor(proto, 'offsetLeft');
    Object.defineProperty(proto, 'offsetWidth', { configurable: true, get(this: HTMLElement) { return this.classList.contains('shm-tm-slide') ? 100 : 0; } });
    Object.defineProperty(proto, 'clientWidth', { configurable: true, get(this: HTMLElement) { return this.classList.contains('shm-tm-track') ? 100 * perView : 0; } });
    Object.defineProperty(proto, 'offsetLeft', { configurable: true, get(this: HTMLElement) { return this.classList.contains('shm-tm-slide') ? Number(this.dataset.index) * 100 : 0; } });
    return () => {
      for (const [k, d] of [['offsetWidth', widthDesc], ['clientWidth', clientDesc], ['offsetLeft', leftDesc]] as const) {
        if (d) Object.defineProperty(proto, k, d);
        else delete (proto as unknown as Record<string, unknown>)[k];
      }
    };
  }

  it('pages by the number of slides in view: 5 slides, 3 in view', async () => {
    const restore = withLayout(3);
    try {
      const { element } = await mount(five, { columnsDesktop: '3' });
      expect(dotsOn(element)).toHaveLength(2);
      expect(slideState(element)).toBe('11100');
      expect(dotsOn(element).map((d) => d.getAttribute('aria-label'))).toEqual(['Show testimonials 1 to 3', 'Show testimonials 4 to 5']);
      element.querySelector<HTMLElement>('.shm-tm-next')!.click();
      expect(slideState(element)).toBe('01110');
      expect(currentDot(element)).toBe(0);
      element.querySelector<HTMLElement>('.shm-tm-next')!.click();
      expect(slideState(element)).toBe('00111');
      expect(currentDot(element)).toBe(1);
      element.querySelectorAll<HTMLElement>('.shm-tm-dot')[0]!.click();
      expect(slideState(element)).toBe('11100');
      element.querySelectorAll<HTMLElement>('.shm-tm-dot')[1]!.click();
      expect(slideState(element)).toBe('00111');
    } finally {
      restore();
    }
  });

  it('hides the controls and the tab stop when every slide is in view', async () => {
    const restore = withLayout(3);
    try {
      const { element } = await mount(five.slice(0, 2));
      expect(element.querySelector<HTMLElement>('.shm-tm-controls')!.hidden).toBe(true);
      expect(element.querySelector('.shm-tm-track')!.hasAttribute('tabindex')).toBe(false);
      expect(slideState(element)).toBe('11');
    } finally {
      restore();
    }
  });

  it('does not let a scroll event from its own animation undo the button press', async () => {
    const restore = withLayout(1);
    try {
      const { element } = await mount(five);
      const track = element.querySelector<HTMLElement>('.shm-tm-track')!;
      const scrolls: number[] = [];
      track.scrollTo = ((o: ScrollToOptions) => { scrolls.push(Number(o.left)); }) as typeof track.scrollTo;
      const next = element.querySelector<HTMLElement>('.shm-tm-next')!;
      next.click();
      expect(scrolls).toEqual([100]);
      track.scrollLeft = 10;
      track.dispatchEvent(new Event('scroll'));
      await new Promise((r) => requestAnimationFrame(() => r(null)));
      expect(currentDot(element)).toBe(1);
      next.click();
      expect(currentDot(element)).toBe(2);
      expect(scrolls).toEqual([100, 200]);
      track.dispatchEvent(new Event('wheel'));
      track.scrollLeft = 400;
      track.dispatchEvent(new Event('scroll'));
      await new Promise((r) => requestAnimationFrame(() => r(null)));
      expect(currentDot(element)).toBe(4);
    } finally {
      restore();
    }
  });

  it('keeps the arrows when both arrows and pagination are switched off', async () => {
    const { element } = await mount(five, { arrows: 'false', pagination: 'none' });
    expect(element.querySelector('.shm-tm-prev')).not.toBeNull();
    expect(element.querySelector('.shm-tm-dots')).toBeNull();
  });

  it('names the dots, the dot group and the slide track', async () => {
    const { element } = await mount(five.slice(0, 2), { pagination: 'avatars', testimonialLayout: 'featured' });
    expect(element.querySelector('.shm-tm-dots')!.getAttribute('role')).toBe('group');
    expect(element.querySelector('.shm-tm-track')!.getAttribute('role')).toBe('group');
    expect(element.querySelector('.shm-tm-track')!.getAttribute('aria-label')).toMatch(/arrow keys/);
    expect(element.querySelector('.shm-tm-dot')!.getAttribute('aria-label')).toBe('Show testimonial 1: A');
  });

  it('tells the live region to announce while autoplay is not moving it', async () => {
    const { element } = await mount(five);
    expect(element.querySelector('.shm-tm-track')!.getAttribute('aria-live')).toBe('polite');
  });

  it('gives every read more button the person name, and keeps it constant in text', async () => {
    const long = 'Word '.repeat(200).trim();
    const { element } = await mount([row({ content: long, who: 'Dee' }), row({ content: long, who: 'Eve' })], { testimonialLayout: 'grid', sortOrder: 'manual' });
    expect([...element.querySelectorAll('.shm-tm-more')].map((b) => b.textContent)).toEqual(['Read more from Dee', 'Read more from Eve']);
  });

  it('moves focus to the first newly shown card and announces the count after Show more', async () => {
    const rows = Array.from({ length: 5 }, (_, i) => row({ who: `P${i}`, testimonialDate: `2024-01-0${5 - i}T00:00:00` }));
    const { element } = await mount(rows, { testimonialLayout: 'grid', pageSize: '2' });
    const status = element.querySelector('.shm-tm-status')!;
    expect(status.getAttribute('role')).toBe('status');
    expect(status.textContent).toBe('');
    const more = element.querySelector<HTMLButtonElement>('.shm-tm-loadmore')!;
    more.focus();
    more.click();
    expect(status.textContent).toBe('Showing 4 of 5 testimonials');
    const cards = [...element.querySelectorAll<HTMLElement>('.shm-tm-card')];
    expect(document.activeElement).toBe(cards[2]);
    more.click();
    expect(status.textContent).toBe('Showing 5 of 5 testimonials');
    expect(document.activeElement).toBe(cards[4]);
    expect(more.hidden).toBe(true);
  });

  it('announces the count when a tag filter changes', async () => {
    const rows = [row({ who: 'A', tags: 'Candidate' }), row({ who: 'B', tags: 'Client' }), row({ who: 'C', tags: 'Client' })];
    const { element } = await mount(rows, { testimonialLayout: 'grid', showTagFilter: 'true', pageSize: '0' });
    [...element.querySelectorAll<HTMLButtonElement>('.shm-tm-chip')][2].click();
    expect(element.querySelector('.shm-tm-status')!.textContent).toBe('Showing 2 of 2 testimonials');
  });

  describe('dialog', () => {
    const long = 'Word '.repeat(200).trim();

    it('makes the page behind inert while open and restores it, including pre-existing inert', async () => {
      const outside = document.createElement('main');
      const alreadyInert = document.createElement('aside');
      alreadyInert.setAttribute('inert', '');
      document.body.append(outside, alreadyInert);
      const { element } = await mount([row({ content: long })], { testimonialLayout: 'grid' });
      element.querySelector<HTMLElement>('.shm-tm-more')!.click();
      expect(outside.hasAttribute('inert')).toBe(true);
      expect(element.hasAttribute('inert')).toBe(true);
      expect(document.querySelector('.shm-tm-dialog')!.hasAttribute('inert')).toBe(false);
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      expect(outside.hasAttribute('inert')).toBe(false);
      expect(element.hasAttribute('inert')).toBe(false);
      expect(alreadyInert.hasAttribute('inert')).toBe(true);
    });

    it('keeps Shift+Tab inside the dialog when the panel itself has focus', async () => {
      const { element } = await mount([row({ content: long })], { testimonialLayout: 'grid' });
      element.querySelector<HTMLElement>('.shm-tm-more')!.click();
      const panel = document.querySelector<HTMLElement>('.shm-tm-dialog-panel')!;
      panel.focus();
      const e = new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true, cancelable: true });
      document.dispatchEvent(e);
      expect(e.defaultPrevented).toBe(true);
      expect(document.activeElement).toBe(document.querySelector('.shm-tm-dialog-close'));
    });

    it('returns focus to the widget when the opening button was hidden meanwhile', async () => {
      const { element } = await mount([row({ content: long })], { testimonialLayout: 'grid' });
      const btn = element.querySelector<HTMLElement>('.shm-tm-more')!;
      btn.click();
      btn.hidden = true;
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      expect(document.activeElement).toBe(element.querySelector('.shm-tm-stage'));
    });

    it('closes an earlier dialog before opening another', async () => {
      const { element } = await mount([row({ content: long, who: 'A' }), row({ content: long, who: 'B' })], { testimonialLayout: 'grid' });
      const [a, b] = [...element.querySelectorAll<HTMLElement>('.shm-tm-more')];
      a.click();
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      b.click();
      expect(document.querySelectorAll('.shm-tm-dialog')).toHaveLength(1);
    });
  });

  it('refuses backslash and control-character paths that browsers treat as protocol-relative', async () => {
    const { element } = await mount(
      [row({ photoURL: '/\\evil.example/p.jpg', who: 'A' }), row({ photoURL: '/\t/evil.example/p.jpg', who: 'B' }), row({ photoURL: '/img/ok.jpg', who: 'C' })],
      { testimonialLayout: 'grid', sortOrder: 'manual' },
    );
    expect([...element.querySelectorAll('.shm-tm-photo img')].map((i) => i.getAttribute('src'))).toEqual(['/img/ok.jpg']);
  });

  it('does not give the consultant link a path that escapes the site', async () => {
    const consultants = [{ data: { consultantID: 'c1', firstName: 'J', lastName: 'W', consultantURL: '/\\evil.example' } }];
    const { element } = await mount([row()], { testimonialLayout: 'grid', showConsultant: 'true' }, { consultants });
    expect(element.querySelector('a.shm-tm-consultant-link')).toBeNull();
    expect(element.querySelector('.shm-tm-consultant')!.textContent).toBe('Consultant: J W');
  });
});

describe('second review fixes', () => {
  const many = ['A', 'B', 'C', 'D'].map((who, i) => row({ who, content: 'Word '.repeat(200).trim(), testimonialDate: `2024-01-0${4 - i}T00:00:00` }));
  const cur = (el: HTMLElement) => [...el.querySelectorAll('.shm-tm-dot')].findIndex((d) => d.getAttribute('aria-current') === 'true');

  it('holds autoplay still while a dialog is open and resumes when it closes', async () => {
    vi.useFakeTimers();
    const { element } = await mount(many, { autoplay: 'true', autoplaySeconds: '2' });
    element.querySelector<HTMLElement>('.shm-tm-more')!.click();
    vi.advanceTimersByTime(10000);
    expect(cur(element)).toBe(0);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    (document.activeElement as HTMLElement).blur();
    vi.advanceTimersByTime(2100);
    expect(cur(element)).toBe(1);
  });

  it('holds autoplay still during a touch and resumes after it', async () => {
    vi.useFakeTimers();
    const { element } = await mount(many, { autoplay: 'true', autoplaySeconds: '2' });
    const track = element.querySelector<HTMLElement>('.shm-tm-track')!;
    track.dispatchEvent(new Event('touchstart'));
    vi.advanceTimersByTime(9000);
    expect(cur(element)).toBe(0);
    track.dispatchEvent(new Event('touchend'));
    vi.advanceTimersByTime(2100);
    expect(cur(element)).toBe(1);
  });

  it('brings the opening slide back into view so focus can return to its button', async () => {
    const { element } = await mount(many, { loop: 'true' });
    const firstBtn = element.querySelector<HTMLElement>('.shm-tm-more')!;
    firstBtn.focus();
    firstBtn.click();
    element.querySelector<HTMLElement>('.shm-tm-next')!.click();
    expect(firstBtn.closest('.shm-tm-slide')!.hasAttribute('inert')).toBe(true);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(cur(element)).toBe(0);
    expect(document.activeElement).toBe(firstBtn);
  });

  it('keeps the page locked until the last of two open dialogs closes', async () => {
    const outside = document.createElement('main');
    document.body.append(outside);
    const a = await mount(many.slice(0, 1), { testimonialLayout: 'grid' });
    const b = await mount(many.slice(1, 2), { testimonialLayout: 'grid' }, { sdk: fakeSdk(many.slice(1, 2)) });
    a.element.querySelector<HTMLElement>('.shm-tm-more')!.click();
    b.element.querySelector<HTMLElement>('.shm-tm-more')!.click();
    expect(document.querySelectorAll('.shm-tm-dialog')).toHaveLength(2);
    document.querySelector<HTMLElement>('.shm-tm-dialog .shm-tm-dialog-close')!.click();
    expect(outside.hasAttribute('inert')).toBe(true);
    expect(document.body.style.overflow).toBe('hidden');
    document.querySelector<HTMLElement>('.shm-tm-dialog .shm-tm-dialog-close')!.click();
    expect(outside.hasAttribute('inert')).toBe(false);
    expect(document.body.style.overflow).toBe('');
  });

  it('answers Esc in the newest dialog only', async () => {
    const a = await mount(many.slice(0, 1), { testimonialLayout: 'grid' });
    const b = await mount(many.slice(1, 2), { testimonialLayout: 'grid' }, { sdk: fakeSdk(many.slice(1, 2)) });
    a.element.querySelector<HTMLElement>('.shm-tm-more')!.click();
    b.element.querySelector<HTMLElement>('.shm-tm-more')!.click();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(document.querySelectorAll('.shm-tm-dialog')).toHaveLength(1);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(document.querySelectorAll('.shm-tm-dialog')).toHaveLength(0);
  });

  it('resyncs the dots from the scroll position after its own scroll gave up waiting', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'requestAnimationFrame', 'cancelAnimationFrame'] });
    const proto = HTMLElement.prototype;
    const wDesc = Object.getOwnPropertyDescriptor(proto, 'offsetWidth');
    const cDesc = Object.getOwnPropertyDescriptor(proto, 'clientWidth');
    Object.defineProperty(proto, 'offsetWidth', { configurable: true, get(this: HTMLElement) { return this.classList.contains('shm-tm-slide') ? 100 : 0; } });
    Object.defineProperty(proto, 'clientWidth', { configurable: true, get(this: HTMLElement) { return this.classList.contains('shm-tm-track') ? 100 : 0; } });
    try {
      const { element } = await mount(many);
      const track = element.querySelector<HTMLElement>('.shm-tm-track')!;
      track.scrollTo = (() => undefined) as typeof track.scrollTo;
      element.querySelector<HTMLElement>('.shm-tm-next')!.click();
      track.scrollLeft = 240;
      track.dispatchEvent(new Event('scroll'));
      vi.advanceTimersByTime(50);
      expect(cur(element)).toBe(1);
      vi.advanceTimersByTime(1000);
      expect(cur(element)).toBe(2);
    } finally {
      if (wDesc) Object.defineProperty(proto, 'offsetWidth', wDesc); else delete (proto as unknown as Record<string, unknown>).offsetWidth;
      if (cDesc) Object.defineProperty(proto, 'clientWidth', cDesc); else delete (proto as unknown as Record<string, unknown>).clientWidth;
    }
  });

  it('falls back to plain dots when avatars would label a page of several slides', async () => {
    const { element } = await mount(many, { pagination: 'avatars' });
    expect(element.querySelectorAll('.shm-tm-dot.is-avatar')).toHaveLength(4);
    expect(element.querySelector('.shm-tm-carousel')!.classList.contains('is-multi')).toBe(false);
  });

  it('cleans up if a render step throws', async () => {
    const win = window as unknown as Win;
    const element: HTMLElement = win.document.createElement('div');
    element.innerHTML = SHELL;
    win.document.body.appendChild(element);
    const spy = vi.spyOn(Element.prototype, 'querySelectorAll').mockImplementationOnce(() => { throw new Error('boom'); });
    await win.ShazammeWidget['testimonials-2026']({ element, data: { config: { testimonialLayout: 'grid' }, inEditor: true }, shazamme: fakeSdk([row()]) });
    spy.mockRestore();
    expect(element.querySelector('.shm-tm-editor-note')!.textContent).toMatch(/boom/);
    await win.ShazammeWidget['testimonials-2026']({ element, data: { config: { testimonialLayout: 'grid' }, inEditor: true }, shazamme: fakeSdk([row()]) });
    expect(element.querySelectorAll('.shm-tm-card')).toHaveLength(1);
  });
});

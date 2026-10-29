// @vitest-environment jsdom
// Runs the real job-search legacy.js against a stubbed SDK and job feed, drives the
// keyword box the way a candidate does (type, then leave the field) and reads back the
// location dropdowns the widget rendered.

import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { describe, it, expect } from 'vitest';

const here = dirname(fileURLToPath(import.meta.url));
const src = readFileSync(join(here, 'legacy.js'), 'utf8');

type JQuery = ((sel: unknown) => { val(v: string): JQueryChain }) & {
  getScript: (url: string, ok: () => void) => void;
};
type JQueryChain = { trigger(e: string): unknown };

const $ = createRequire(import.meta.url)('jquery') as JQuery;
$.getScript = (_url, ok) => ok();

interface Job { data: Record<string, string> }

const JOBS: Job[] = [
  { data: { jobName: 'Registered Nurse', state: 'NSW', city: 'Sydney', country: 'Australia' } },
  { data: { jobName: 'Truck Driver', state: 'VIC', city: 'Melbourne', country: 'Australia' } },
];

// fetchValues debounces 80ms and the keyword blur waits 250ms
const SETTLE_MS = 400;
const settle = (): Promise<void> => new Promise((r) => setTimeout(r, SETTLE_MS));

async function mount(jobs: Job[], config: Record<string, unknown> = {}) {
  document.body.innerHTML = `
    <div id="w" class="job-search-root">
      <input data-autocomplete="keyword">
      <select data-filter="state"></select>
      <select data-filter="city"></select>
      <select data-filter="country"></select>
      <select data-filter="workTypeID"></select>
    </div>`;

  const widget = { log: () => widget, sub: () => widget, pub: () => undefined };
  Object.assign(globalThis, {
    $,
    Fuse: function Fuse(this: { search: () => [] }) { this.search = () => []; },
    shazamme: {
      ready: () => Promise.resolve(),
      site: () => Promise.resolve({ siteID: 'site1' }),
      fetch: () => Promise.resolve(jobs.map((j) => ({ data: { ...j.data } }))),
      bag: () => ({}),
      register: () => widget,
    },
  });

  const data = { config: { toggleJobName: true, LocationsPlaceholder: 'Search location', ...config }, siteId: 'site1' };
  new Function('element', 'data', `var f; ${src}`)(document.getElementById('w'), data);
  await settle();

  const options = (filter: string): string[] =>
    [...document.querySelectorAll(`[data-filter=${filter}] option`)].map((o) => o.textContent ?? '');

  const searchKeyword = async (keyword: string): Promise<void> => {
    $('[data-autocomplete=keyword]').val(keyword).trigger('change');
    await settle();
  };

  return { options, searchKeyword };
}

describe('job-search keyword with no matching jobs', () => {
  it('shows "No jobs available" in every location dropdown', async () => {
    const w = await mount(JOBS);
    await w.searchKeyword('zzzz');

    expect(w.options('state')).toEqual(['No jobs available']);
    expect(w.options('city')).toEqual(['No jobs available']);
    expect(w.options('country')).toEqual(['No jobs available']);
  });

  it('leaves non-location dropdowns on their normal placeholder', async () => {
    const w = await mount(JOBS);
    await w.searchKeyword('zzzz');

    expect(w.options('workTypeID')).toEqual(['All Work Types']);
  });

  it('uses NoJobsPlaceholder when the site configures one', async () => {
    const w = await mount(JOBS, { NoJobsPlaceholder: 'Nothing here' });
    await w.searchKeyword('zzzz');

    expect(w.options('state')).toEqual(['Nothing here']);
  });

  it('keeps the normal placeholder when the keyword matches jobs', async () => {
    const w = await mount(JOBS);
    await w.searchKeyword('nurse');

    expect(w.options('state')).toEqual(['Search location', 'NSW (1)']);
  });

  it('keeps the normal placeholder with no keyword', async () => {
    const w = await mount(JOBS);
    await w.searchKeyword('');

    expect(w.options('state')).toEqual(['Search location', 'NSW (1)', 'VIC (1)']);
  });
});

describe('job-search keyword matching', () => {
  it('matches a partial word inside the job title', async () => {
    const w = await mount(JOBS);
    await w.searchKeyword('nur');

    expect(w.options('state')).toEqual(['Search location', 'NSW (1)']);
  });

  it('ignores case', async () => {
    const w = await mount(JOBS);
    await w.searchKeyword('NURSE');

    expect(w.options('state')).toEqual(['Search location', 'NSW (1)']);
  });

  it('matches any of several comma-separated keywords', async () => {
    const w = await mount(JOBS);
    await w.searchKeyword('driver, nurse');

    expect(w.options('state')).toEqual(['Search location', 'NSW (1)', 'VIC (1)']);
  });

  it('does not match every keyword to a job with an empty field', async () => {
    const w = await mount([
      ...JOBS,
      { data: { jobName: 'Chef', tags: '', state: 'QLD', city: 'Brisbane', country: 'Australia' } },
    ]);
    await w.searchKeyword('zzzz');

    expect(w.options('state')).toEqual(['No jobs available']);
  });
});

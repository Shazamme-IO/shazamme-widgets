// @vitest-environment jsdom
// Reading a Duda collection page by page (core/site-jobs readAllPages, loadCollectionJobs, loadJobsFrom).
// The real contract, checked live on Demo 2 (27 Nov 2026): pageNumber is 0-based, pageSize is capped at 100 and get()
// resolves { values, page: { pageSize, pageNumber, totalPages, totalItems } }. The other mocks cover APIs that page
// from 1, leave out totalPages, or never answer.

import { afterEach, describe, expect, it, vi } from 'vitest';
import { COLLECTION_CONCURRENCY, COLLECTION_MAX_PAGES, COLLECTION_PAGE_SIZE, DMAPI_WAIT_MS, loadCollectionJobs, loadJobsFrom, readAllPages } from './site-jobs';

type Row = Record<string, unknown>;
const rows = (n: number, from = 0): Row[] => Array.from({ length: n }, (_, i) => ({ jobName: `Job ${from + i + 1}`, activeStatus: true }));
const item = (r: Row, i: number) => ({ page_item_url: `job-${i + 1}`, data: r });

interface MockOpts { base?: 0 | 1; totalPages?: boolean; echo?: boolean; arrayOnly?: boolean }

/** A Collections API over `all` rows, 100 a page. base 0 is Duda's real contract. */
function api(all: Row[], opts: MockOpts = {}) {
  const { base = 0, totalPages = true, echo = true, arrayOnly = false } = opts;
  const asked: number[] = [];
  const get = async (n: number) => {
    asked.push(n);
    const p = base === 1 ? Math.max(1, n) - 1 : n;
    const values = all.slice(p * COLLECTION_PAGE_SIZE, (p + 1) * COLLECTION_PAGE_SIZE).map((r, i) => item(r, p * COLLECTION_PAGE_SIZE + i));
    if (arrayOnly) return values;
    const page: Row = { pageSize: COLLECTION_PAGE_SIZE, totalItems: all.length };
    if (echo) page.pageNumber = base === 1 ? Math.max(1, n) : n;
    if (totalPages) page.totalPages = Math.ceil(all.length / COLLECTION_PAGE_SIZE);
    return { values, page };
  };
  return { asked, get };
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
  delete (window as unknown as Row).dmAPI;
  delete (window as unknown as Row).__shmSiteJobs;
});

describe('readAllPages', () => {
  it('reads Duda\'s real contract (0-based, totalPages) with pages 2..n in parallel', async () => {
    const m = api(rows(250));
    const out = await readAllPages('Jobs', m.get);
    expect(out).toHaveLength(250);
    expect(m.asked).toEqual([0, 1, 2]);
  });

  it('has pages 2..n in flight together once the total is known', async () => {
    const m = api(rows(450));
    let live = 0;
    let most = 0;
    const out = await readAllPages('Jobs', async (n) => {
      live += 1;
      most = Math.max(most, live);
      await new Promise((r) => setTimeout(r, 5));
      live -= 1;
      return m.get(n);
    });
    expect(out).toHaveLength(450);
    expect(most).toBe(4);
  });

  it('stops on a short page when there is no totalPages', async () => {
    const m = api(rows(230), { totalPages: false });
    const out = await readAllPages('Jobs', m.get);
    expect(out).toHaveLength(230);
    expect(m.asked).toEqual([0, 1, 2]);
  });

  it('stops on a short page even when totalPages over-counts', async () => {
    const m = api(rows(40));
    const out = await readAllPages('Jobs', async (n) => ({ ...(await m.get(n)) as Row, page: { pageNumber: n, totalPages: 5 } }));
    expect(out).toHaveLength(40);
    expect(m.asked.length).toBeLessThanOrEqual(5);
  });

  it('reads an API that pages from 1 and says so', async () => {
    const m = api(rows(250), { base: 1 });
    const out = await readAllPages('Jobs', m.get);
    expect(out.map((r) => r.fields.jobName)).toEqual(rows(250).map((r) => r.jobName));
    expect(m.asked).toEqual([0, 2, 3]);
  });

  it('reads an API that pages from 1 without echoing the page number, dropping the repeated first page', async () => {
    const m = api(rows(250), { base: 1, echo: false });
    const out = await readAllPages('Jobs', m.get);
    expect(out).toHaveLength(250);
    expect(new Set(out.map((r) => r.pageItemUrl)).size).toBe(250);
  });

  it('reads an API that pages from 1 and answers page 0 with nothing', async () => {
    const all = rows(150);
    const out = await readAllPages('Jobs', async (n) => (n === 0 ? { values: [] } : api(all, { base: 1, totalPages: false, echo: false }).get(n)));
    expect(out).toHaveLength(150);
  });

  it('accepts a bare array of items, as the docs example shows', async () => {
    const out = await readAllPages('Jobs', api(rows(120), { arrayOnly: true }).get);
    expect(out).toHaveLength(120);
  });

  it('dedupes rows by page_item_url', async () => {
    const out = await readAllPages('Jobs', async () => ({ values: [item(rows(1)[0], 0), item(rows(1)[0], 0), { page_item_url: 'b', data: { jobName: 'B' } }] }));
    expect(out.map((r) => r.pageItemUrl)).toEqual(['job-1', 'b']);
  });

  it('stops at 20 pages and warns', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const m = api(rows(COLLECTION_PAGE_SIZE * (COLLECTION_MAX_PAGES + 3)), { totalPages: false });
    const out = await readAllPages('Jobs', m.get);
    expect(out).toHaveLength(COLLECTION_PAGE_SIZE * COLLECTION_MAX_PAGES);
    // totalItems (2300) answers whether rows were left out, so no 21st page is read.
    expect(m.asked).toHaveLength(COLLECTION_MAX_PAGES);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('more than 2000 rows'));
  });

  it('does not warn below the cap', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    await readAllPages('Jobs', api(rows(COLLECTION_PAGE_SIZE * 3)).get);
    expect(warn).not.toHaveBeenCalled();
  });

  it('drops rows whose activeStatus is false, as a boolean or the string "false" (intended change)', async () => {
    const out = await readAllPages('Jobs', async () => ({ values: [item({ jobName: 'Open', activeStatus: true }, 0), item({ jobName: 'Closed', activeStatus: 'false' }, 1), item({ jobName: 'Shut', activeStatus: false }, 2), item({ jobName: 'Text open', activeStatus: 'true' }, 3)] }));
    expect(out.map((r) => r.fields.jobName)).toEqual(['Open', 'Text open']);
  });
});

describe('loadJobsFrom', () => {
  const feed = (n: number) => ({ site: async () => ({ siteID: 's1' }), fetch: vi.fn(async () => rows(n).map(item)) });
  const dm = (get: (n: number) => Promise<unknown>) => ({ loadCollectionsAPI: async () => ({ data: () => { let p = 0; const q = { pageSize: () => q, pageNumber: (n: number) => ((p = n), q), get: () => get(p) }; return q; } }) });

  it('uses the collection when it answers in time', async () => {
    (window as unknown as Row).dmAPI = dm(api(rows(3)).get as (n: number) => Promise<unknown>);
    const sdk = feed(9);
    const out = await loadJobsFrom('Jobs', sdk, {}, false);
    expect(out).toMatchObject({ source: 'collection' });
    expect(out.jobs).toHaveLength(3);
    expect(sdk.fetch).not.toHaveBeenCalled();
  });

  it('falls back to the job feed when the collection takes longer than the timeout', async () => {
    vi.useFakeTimers();
    (window as unknown as Row).dmAPI = dm(() => new Promise(() => undefined));
    const sdk = feed(2);
    const pending = loadJobsFrom('Jobs', sdk, {}, false);
    await vi.advanceTimersByTimeAsync(4000);
    const out = await pending;
    expect(out.source).toBe('feed');
    expect(out.jobs).toHaveLength(2);
  });

  it('waits up to about 4 seconds by default', async () => {
    vi.useFakeTimers();
    (window as unknown as Row).dmAPI = dm(() => new Promise(() => undefined));
    let done = false;
    const pending = loadJobsFrom('Jobs', feed(1), {}, false).then((r) => { done = true; return r; });
    await vi.advanceTimersByTimeAsync(3900);
    expect(done).toBe(false);
    await vi.advanceTimersByTimeAsync(200);
    expect((await pending).source).toBe('feed');
  });
});

describe('review 3 fix #1: waiting for dmAPI', () => {
  const loader = (n: number) => ({ loadCollectionsAPI: async () => ({ data: () => { let p = 0; const q = { pageSize: () => q, pageNumber: (x: number) => ((p = x), q), get: () => api(rows(n)).get(p) }; return q; } }) });

  it('waits for dmAPI.loadCollectionsAPI that Duda adds after the widget runs', async () => {
    vi.useFakeTimers();
    const sdk = { site: async () => ({ siteID: 's1' }), fetch: vi.fn(async () => []) };
    const pending = loadJobsFrom('Jobs', sdk, {}, false);
    await vi.advanceTimersByTimeAsync(600);
    (window as unknown as Row).dmAPI = loader(4);
    await vi.advanceTimersByTimeAsync(100);
    const out = await pending;
    expect(out.source).toBe('collection');
    expect(out.jobs).toHaveLength(4);
    expect(sdk.fetch).not.toHaveBeenCalled();
  });

  it('gives up after about 1.5 seconds when dmAPI never appears', async () => {
    vi.useFakeTimers();
    let failed: unknown;
    const pending = loadCollectionJobs('Jobs', false).catch((e) => { failed = e; });
    await vi.advanceTimersByTimeAsync(DMAPI_WAIT_MS - 100);
    expect(failed).toBeUndefined();
    await vi.advanceTimersByTimeAsync(200);
    await pending;
    expect(String(failed)).toContain('collections API is not on this page');
  });
});

describe('review 3 fix #2: an empty collection is an answer', () => {
  const sdk = () => ({ site: async () => ({ siteID: 's1' }), fetch: vi.fn(async () => rows(3).map(item)) });
  const dmWith = (get: () => Promise<unknown>) => ({ loadCollectionsAPI: async () => ({ data: () => { const q = { pageSize: () => q, pageNumber: () => q, get }; return q; } }) });

  it('uses an empty collection as it is and does not read the job feed', async () => {
    (window as unknown as Row).dmAPI = dmWith(async () => ({ values: [], page: { pageNumber: 0, totalPages: 0, totalItems: 0 } }));
    const feed = sdk();
    const out = await loadJobsFrom('Jobs', feed, {}, false);
    expect(out).toEqual({ jobs: [], source: 'collection' });
    expect(feed.fetch).not.toHaveBeenCalled();
  });

  it('falls back to the feed only when the read fails', async () => {
    (window as unknown as Row).dmAPI = dmWith(async () => { throw new Error('read failed'); });
    const feed = sdk();
    const out = await loadJobsFrom('Jobs', feed, {}, false);
    expect(out.source).toBe('feed');
    expect(out.jobs).toHaveLength(3);
  });
});

describe('review 3 fix #7: bounded, stoppable paging', () => {
  it('reads at most 5 pages at the same time', async () => {
    const m = api(rows(COLLECTION_PAGE_SIZE * 15));
    let live = 0;
    let most = 0;
    const out = await readAllPages('Jobs', async (n) => {
      live += 1;
      most = Math.max(most, live);
      await new Promise((r) => setTimeout(r, 2));
      live -= 1;
      return m.get(n);
    });
    expect(out).toHaveLength(COLLECTION_PAGE_SIZE * 15);
    expect(most).toBe(COLLECTION_CONCURRENCY);
  });

  it('stops asking for pages once the signal is aborted', async () => {
    const m = api(rows(COLLECTION_PAGE_SIZE * 12));
    const signal = { aborted: false };
    const get = async (n: number) => {
      if (n === 2) signal.aborted = true;
      return m.get(n);
    };
    await expect(readAllPages('Jobs', get, signal)).rejects.toThrow('stopped');
    expect(m.asked.length).toBeLessThan(8);
  });

  it('stops the read after the timeout, so a slow collection does not keep paging', async () => {
    vi.useFakeTimers();
    const asked: number[] = [];
    (window as unknown as Row).dmAPI = { loadCollectionsAPI: async () => ({ data: () => { let p = 0; const q = { pageSize: () => q, pageNumber: (x: number) => ((p = x), q), get: () => { const n = p; asked.push(n); return new Promise((r) => setTimeout(() => r({ values: rows(100).map((x, i) => item(x, n * 100 + i)) }), 1000)); } }; return q; } }) };
    const sdk = { site: async () => ({ siteID: 's1' }), fetch: async () => [] };
    const pending = loadJobsFrom('Jobs', sdk, {}, false, 2500);
    await vi.advanceTimersByTimeAsync(2600);
    expect((await pending).source).toBe('feed');
    const seen = asked.length;
    await vi.advanceTimersByTimeAsync(10000);
    expect(asked.length).toBe(seen);
    expect(seen).toBeLessThanOrEqual(4);
  });

  it('a newer run stops the older read through the caller\'s signal', async () => {
    const signal = { aborted: true };
    (window as unknown as Row).dmAPI = { loadCollectionsAPI: async () => ({ data: () => { const q = { pageSize: () => q, pageNumber: () => q, get: vi.fn(async () => ({ values: [] })) }; return q; } }) };
    const sdk = { site: async () => ({ siteID: 's1' }), fetch: async () => rows(2).map(item) };
    const out = await loadJobsFrom('Jobs', sdk, {}, true, 4000, signal);
    expect(out.source).toBe('feed');
  });

  it('does not warn for exactly 2000 rows when totalItems says that is all', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const m = api(rows(COLLECTION_PAGE_SIZE * COLLECTION_MAX_PAGES));
    const out = await readAllPages('Jobs', m.get);
    expect(out).toHaveLength(2000);
    expect(m.asked).toHaveLength(COLLECTION_MAX_PAGES);
    expect(warn).not.toHaveBeenCalled();
  });

  it('warns when totalItems says a 21st page is needed', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const m = api(rows(COLLECTION_PAGE_SIZE * COLLECTION_MAX_PAGES + 1));
    await readAllPages('Jobs', m.get);
    expect(m.asked).toHaveLength(COLLECTION_MAX_PAGES);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('more than 2000 rows'));
  });

  it('with no totals and exactly 2000 rows, reads page 21, finds it empty and does not warn', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const m = api(rows(COLLECTION_PAGE_SIZE * COLLECTION_MAX_PAGES), { totalPages: false });
    await readAllPages('Jobs', async (n) => { const r = (await m.get(n)) as { page: Row }; delete r.page.totalItems; return r; });
    expect(m.asked).toHaveLength(COLLECTION_MAX_PAGES + 1);
    expect(warn).not.toHaveBeenCalled();
  });

  it('with no totals and more than 2000 rows, reads page 21, finds rows and warns', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const m = api(rows(COLLECTION_PAGE_SIZE * COLLECTION_MAX_PAGES + 50), { totalPages: false });
    const out = await readAllPages('Jobs', async (n) => { const r = (await m.get(n)) as { page: Row }; delete r.page.totalItems; return r; });
    expect(out).toHaveLength(2000);
    expect(m.asked).toHaveLength(COLLECTION_MAX_PAGES + 1);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('more than 2000 rows'));
  });
});

import { describe, it, expect, vi } from 'vitest';
import { buildModel, loadJobs, type FilterFn } from './jobs';
import { applyFilters } from './filters';
import { readConfig } from './config';
import { wrapSdk, type ShazammeClient } from './sdk';
import type { Job, SortSpec } from './types';

const cfg = readConfig({ config: { pageSize: '2' } });
const sort: SortSpec = { field: 'changedOnUTC', direction: 'desc' };

function makeJobs(n: number): Job[] {
  return Array.from({ length: n }, (_, i) => ({
    jobName: `Job ${i}`,
    jobTypeID: i % 2 === 0 ? 'JT1' : 'JT2',
    professionID: `P${i}`,
    changedOnUTC: `2026-07-${String(28 - i).padStart(2, '0')}`,
  }));
}

describe('buildModel — memoized query', () => {
  it('does NOT re-filter when only the page changes', () => {
    const spy: FilterFn = vi.fn((jobs, state, opts) => applyFilters(jobs, state, opts));
    const model = buildModel(makeJobs(10), cfg, { filterFn: spy });

    const p0 = model.query({ jobTypeID: ['JT1'] }, sort, 0, 2);
    const p1 = model.query({ jobTypeID: ['JT1'] }, sort, 1, 2);
    const p2 = model.query({ jobTypeID: ['JT1'] }, sort, 2, 2);

    expect(spy).toHaveBeenCalledTimes(1); // filtered once, paged three times
    expect(p0.total).toBe(p1.total);
    expect(p0.page).toHaveLength(2);
    expect(p1.page).toHaveLength(2);
    expect(p0.page[0]).not.toEqual(p1.page[0]);
    void p2;
  });

  it('re-filters when the filter state changes', () => {
    const spy: FilterFn = vi.fn((jobs, state, opts) => applyFilters(jobs, state, opts));
    const model = buildModel(makeJobs(10), cfg, { filterFn: spy });

    model.query({ jobTypeID: ['JT1'] }, sort, 0, 2);
    model.query({ jobTypeID: ['JT2'] }, sort, 0, 2);
    expect(spy).toHaveBeenCalledTimes(2);
  });

  it('returns totals and facets from the filtered set', () => {
    const model = buildModel(makeJobs(10), cfg);
    const res = model.query({ jobTypeID: ['JT1'] }, sort, 0, 2);
    expect(res.total).toBe(5); // even indices -> JT1
    expect(res.facets.index.jobTypeID.map((n) => n.id)).toEqual(['JT1']);
  });

  it('sorts descending by the sort field', () => {
    const model = buildModel(makeJobs(3), cfg);
    const res = model.query({}, sort, 0, 10);
    // changedOnUTC: Job0=07-28, Job1=07-27, Job2=07-26 -> desc keeps that order
    expect(res.page.map((j) => j.jobName)).toEqual(['Job 0', 'Job 1', 'Job 2']);
  });
});

describe('loadJobs', () => {
  function client(fetchImpl: ShazammeClient['fetch']): ShazammeClient {
    return {
      fetch: fetchImpl,
      submit: vi.fn(),
      site: vi.fn().mockResolvedValue({ siteID: 'SITE1' }),
      pub: vi.fn(),
      sub: vi.fn(),
    };
  }

  it('fetches the collection once and NEVER passes limit', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({ values: makeJobs(4).map((data) => ({ data })) });
    const sdk = wrapSdk(client(fetchImpl));
    const model = await loadJobs(sdk, cfg);

    expect(fetchImpl).toHaveBeenCalledOnce();
    const desc = fetchImpl.mock.calls[0][0];
    expect('limit' in desc).toBe(false);
    expect(desc.path).toBe('/job-results/SITE1');
    expect(model.all()).toHaveLength(4);
  });

  it('tolerates a bare array collection shape', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(makeJobs(3).map((data) => ({ data })));
    const sdk = wrapSdk(client(fetchImpl));
    const model = await loadJobs(sdk, cfg);
    expect(model.all()).toHaveLength(3);
  });
});

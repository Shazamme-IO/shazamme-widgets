// The data spine that kills the slow legacy patterns:
//   #1 download-and-filter-in-JS  -> fetch the cached collection ONCE.
//   #2 limit:10000 nesco trap     -> the fetch descriptor never carries `limit`.
//   #3 re-filter on every render   -> query() memoizes the filtered+sorted set,
//                                     so a page change re-slices instead of
//                                     re-filtering the whole array.

import type { Sdk } from './sdk';
import type { WidgetConfig } from './config';
import type {
  Job,
  JobValue,
  FacetLevel,
  SortSpec,
  QueryResult,
  JobsModel,
  FilterOptions,
} from './types';
import { buildHierarchy } from './hierarchy';
import { applyFilters, type FilterInput } from './filters';

/** Default 3-level classification hierarchy: jobType -> profession -> role. */
export const DEFAULT_LEVELS: FacetLevel[] = [
  { field: 'jobTypeID', labelKey: 'jobType', idKey: 'jobTypeID' },
  { field: 'professionID', labelKey: 'category', idKey: 'professionID', seoKey: 'professionSeo', parentField: 'jobTypeID' },
  { field: 'roleID', labelKey: 'subCategory', idKey: 'roleID', seoKey: 'roleSeo', parentField: 'professionID' },
];

export type FilterFn = (jobs: readonly Job[], state: FilterInput, opts: FilterOptions) => Job[];

export interface BuildModelOptions {
  levels?: FacetLevel[];
  /** Injectable for testing memoization; defaults to the pure applyFilters. */
  filterFn?: FilterFn;
}

/** Extract the raw job rows from whatever shape the SDK returned. */
function extractJobs(raw: unknown): Job[] {
  if (Array.isArray(raw)) {
    return (raw as JobValue[]).map((v) => v?.data ?? (v as unknown as Job));
  }
  const values = (raw as { values?: JobValue[] })?.values;
  if (Array.isArray(values)) return values.map((v) => v.data);
  return [];
}

function sortJobs(jobs: readonly Job[], sort: SortSpec): Job[] {
  const dir = sort.direction === 'asc' ? 1 : -1;
  return jobs.slice().sort((x, y) => {
    const a = (x as Record<string, unknown>)[sort.field] as string | number | undefined;
    const b = (y as Record<string, unknown>)[sort.field] as string | number | undefined;
    if (a === b) return 0;
    if (a == null) return 1;
    if (b == null) return -1;
    return a > b ? dir : -dir;
  });
}

function memoKey(state: FilterInput, sort: SortSpec): string {
  const parts = Object.keys(state)
    .sort()
    .map((k) => `${k}=${JSON.stringify(state[k])}`);
  return `${parts.join('&')}::${sort.field}:${sort.direction}`;
}

/** Build the indexed, memoized JobsModel from raw job rows. */
export function buildModel(
  jobs: readonly Job[],
  cfg: WidgetConfig,
  opts: BuildModelOptions = {},
): JobsModel {
  const levels = opts.levels ?? DEFAULT_LEVELS;
  const filterFn = opts.filterFn ?? applyFilters;
  const filterOpts: FilterOptions = { proximityDiameter: cfg.proximityDiameter };
  const all = jobs.slice();

  let cacheKey: string | null = null;
  let cached: { sorted: Job[]; facets: QueryResult['facets']; total: number } | null = null;

  const compute = (state: FilterInput, sort: SortSpec) => {
    const filtered = filterFn(all, state, filterOpts);
    const sorted = sortJobs(filtered, sort);
    const facets = buildHierarchy(
      sorted.map((j) => ({ data: j as Record<string, unknown> })),
      { levels },
    );
    cached = { sorted, facets, total: sorted.length };
  };

  return {
    all: () => all,
    query(state, sort, page, pageSize): QueryResult {
      const key = memoKey(state, sort);
      if (key !== cacheKey || cached === null) {
        cacheKey = key;
        compute(state, sort);
      }
      const c = cached!;
      const start = pageSize > 0 ? page * pageSize : 0;
      const end = pageSize > 0 ? start + pageSize : undefined;
      return {
        page: c.sorted.slice(start, end),
        total: c.total,
        facets: c.facets,
      };
    },
  };
}

/**
 * Fetch the cached job collection ONCE (never with `limit`) and return a
 * memoized JobsModel. Resolves the siteID via sdk.site().
 */
export async function loadJobs(
  sdk: Sdk,
  cfg: WidgetConfig,
  opts: BuildModelOptions = {},
): Promise<JobsModel> {
  const site = await sdk.site();
  const raw = await sdk.fetchJobs(site.siteID);
  return buildModel(extractJobs(raw), cfg, opts);
}

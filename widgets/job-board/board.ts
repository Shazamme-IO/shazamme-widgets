// Job Board logic with no DOM: filter, count, sort and page the site's jobs, and read and write the search in
// the page address. Facet counts are worked out against every other active filter, so each count is the number
// of jobs a click would show.

import { annualPay, payLine } from '../../core/salary';
import { text, type SiteJob } from '../../core/site-jobs';
import { GROUP_IDS, SORTS, type GroupId, type LocationFormat, type Settings, type Sort } from './settings';

export interface State {
  keyword: string;
  location: string;
  selected: Partial<Record<GroupId, string[]>>;
  sort: Sort;
  page: number;
}

export interface FacetOption {
  value: string;
  count: number;
  checked: boolean;
}

export interface Facet {
  id: GroupId;
  label: string;
  options: FacetOption[];
}

export interface Card {
  label: string;
  title: string;
  pay: string;
  where: string;
  workType: string;
  workModel: string;
  href: string;
}

const VALUE: Record<GroupId, (f: Record<string, unknown>) => string> = {
  profession: (f) => text(f.profession) || text(f.category),
  role: (f) => text(f.role) || text(f.subCategory),
  workType: (f) => text(f.workTypeLabel) || text(f.workType),
  workModel: (f) => text(f.workModel),
  country: (f) => text(f.country),
  state: (f) => text(f.state),
  city: (f) => text(f.city),
};

const KEYWORD_FIELDS = ['jobName', 'positionTitle', 'category', 'subCategory', 'profession', 'role', 'shortDescription', 'tags', 'referenceNumber', 'workType'];
const LOCATION_FIELDS = ['city', 'state', 'country', 'postalCode', 'location', 'address', 'fullAddressForSearch'];

export const valueOf = (job: SiteJob, id: GroupId): string => VALUE[id](job.fields);

const fold = (s: string): string => s.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '');

const words = (query: string): string[] => fold(query).split(/[\s,]+/).filter(Boolean);

interface Entry {
  job: SiteJob;
  /** Folded keyword and location text, built once per data load. */
  kw: string;
  loc: string;
  /** Folded value of each group, '' when the job has none. */
  folded: Record<GroupId, string>;
}

interface Option {
  value: string;
  total: number;
}

interface Index {
  entries: Entry[];
  /** Every value of each group across all jobs, keyed by its folded form, most jobs first then A to Z. */
  totals: Record<GroupId, Map<string, Option>>;
}

/** One index per jobs array: the board loads its jobs once, so folding happens once, not on every render. */
const indexes = new WeakMap<readonly SiteJob[], Index>();

function buildIndex(jobs: readonly SiteJob[]): Index {
  const totals = Object.fromEntries(GROUP_IDS.map((id) => [id, new Map<string, Option>()])) as Index['totals'];
  const entries = jobs.map((job) => {
    const folded = {} as Record<GroupId, string>;
    for (const id of GROUP_IDS) {
      const v = valueOf(job, id);
      const k = v ? fold(v) : '';
      folded[id] = k;
      if (!k) continue;
      const entry = totals[id].get(k);
      if (entry) entry.total += 1;
      else totals[id].set(k, { value: v, total: 1 });
    }
    const hay = (fields: readonly string[]): string => fold(fields.map((k) => text(job.fields[k])).join(' '));
    return { job, kw: hay(KEYWORD_FIELDS), loc: hay(LOCATION_FIELDS), folded };
  });
  for (const id of GROUP_IDS) {
    totals[id] = new Map([...totals[id].entries()].sort((a, b) => b[1].total - a[1].total || a[1].value.localeCompare(b[1].value, 'en-AU')));
  }
  return { entries, totals };
}

function indexFor(jobs: readonly SiteJob[]): Index {
  let index = indexes.get(jobs);
  if (!index) {
    index = buildIndex(jobs);
    indexes.set(jobs, index);
  }
  return index;
}

export interface SearchResult {
  matched: SiteJob[];
  facets: Facet[];
}

/**
 * The jobs that match the state and the facets for the shown groups, in one pass. Keyword and location are checked
 * once per job; for each job the board notes which group (if exactly one) it fails, so a facet counts the jobs that
 * pass every other filter (its "except" mask) without filtering again per group.
 * A value picked in the address that no job has stays listed (count 0) so it can be unticked.
 */
export function searchBoard(jobs: readonly SiteJob[], state: State, groups: Settings['groups']): SearchResult {
  const { entries, totals } = indexFor(jobs);
  const kw = words(state.keyword);
  const loc = words(state.location);
  const picks = GROUP_IDS.filter((id) => state.selected[id]?.length).map((id) => [id, new Set((state.selected[id] ?? []).map(fold))] as const);
  const shown = groups.map((g) => g.id);
  const live = Object.fromEntries(shown.map((id) => [id, new Map<string, number>()])) as Partial<Record<GroupId, Map<string, number>>>;
  const matched: SiteJob[] = [];
  for (const e of entries) {
    if (!kw.every((w) => e.kw.includes(w)) || !loc.every((w) => e.loc.includes(w))) continue;
    let misses = 0;
    let missed: GroupId | undefined;
    for (const [id, set] of picks) {
      if (set.has(e.folded[id])) continue;
      misses += 1;
      missed = id;
      if (misses > 1) break;
    }
    if (misses === 0) matched.push(e.job);
    if (misses > 1) continue;
    for (const id of shown) {
      if (misses === 1 && missed !== id) continue;
      const k = e.folded[id];
      if (k) live[id]!.set(k, (live[id]!.get(k) ?? 0) + 1);
    }
  }
  const facets = groups.map(({ id, label }) => {
    const chosen = state.selected[id] ?? [];
    const keys = new Set(chosen.map(fold));
    const options: FacetOption[] = [...totals[id].entries()].map(([k, { value }]) => ({ value, count: live[id]!.get(k) ?? 0, checked: keys.has(k) }));
    const extra = chosen
      .filter((p, i) => !totals[id].has(fold(p)) && chosen.findIndex((q) => fold(q) === fold(p)) === i)
      .sort((a, b) => a.localeCompare(b, 'en-AU'));
    return { id, label, options: [...options, ...extra.map((value) => ({ value, count: 0, checked: true }))] };
  }).filter((f) => f.options.length > 0);
  return { matched, facets };
}

export function filterJobs(jobs: readonly SiteJob[], state: State, except?: GroupId): SiteJob[] {
  const selected = except ? { ...state.selected, [except]: [] } : state.selected;
  return searchBoard(jobs, { ...state, selected }, []).matched;
}

/** Each shown group with every value the site's jobs carry, most jobs first then A to Z, so the list does not jump as filters change. */
export function buildFacets(jobs: readonly SiteJob[], state: State, groups: Settings['groups']): Facet[] {
  return searchBoard(jobs, state, groups).facets;
}

function postedAt(j: SiteJob): number {
  return Date.parse(text(j.fields.addedOnUTC) || text(j.fields.changedOnUTC) || '') || 0;
}

export function sortJobs(jobs: readonly SiteJob[], sort: Sort): SiteJob[] {
  const newest = (a: SiteJob, b: SiteJob): number => postedAt(b) - postedAt(a);
  if (sort === 'newest') return [...jobs].sort(newest);
  const dir = sort === 'salary-high' ? -1 : 1;
  return [...jobs].sort((a, b) => {
    const pa = annualPay(a.fields);
    const pb = annualPay(b.fields);
    if (!pa !== !pb) return pa ? -1 : 1;
    return (pa - pb) * dir || newest(a, b);
  });
}

export function pageCount(total: number, size: number): number {
  return Math.max(1, Math.ceil(total / size));
}

/** The jobs on screen: one page, or every page so far with "load more". */
export function visibleJobs(jobs: readonly SiteJob[], state: State, s: Pick<Settings, 'pageSize' | 'paging'>): SiteJob[] {
  const page = Math.min(Math.max(1, state.page), pageCount(jobs.length, s.pageSize));
  const start = s.paging === 'loadmore' ? 0 : (page - 1) * s.pageSize;
  return jobs.slice(start, page * s.pageSize);
}

/** Page numbers with gaps: [1, '…', 4, 5, 6, '…', 12]. */
export function pageList(current: number, total: number): Array<number | '…'> {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const keep = new Set([1, total, current - 1, current, current + 1]);
  const out: Array<number | '…'> = [];
  for (let n = 1; n <= total; n += 1) {
    if (keep.has(n)) out.push(n);
    else if (out[out.length - 1] !== '…') out.push('…');
  }
  return out;
}

function safeDecode(seg: string): string {
  try {
    return decodeURIComponent(seg);
  } catch {
    return seg;
  }
}

export function whereFor(f: Record<string, unknown>, format: LocationFormat): string {
  const parts = [text(f.city)];
  if (format === 'city-state' || format === 'city-state-country') parts.push(text(f.state));
  if (format === 'city-country' || format === 'city-state-country') parts.push(text(f.country));
  return parts.filter(Boolean).join(', ');
}

export function toCard(job: SiteJob, s: Settings): Card {
  const f = job.fields;
  const label = s.cardLabel === 'none' ? '' : valueOf(job, s.cardLabel);
  // Each segment is encoded on its own and empty, "." and ".." segments are dropped, so the link always stays under detailsPage.
  const path = job.pageItemUrl
    .split(/[/\\]/)
    .map((seg) => safeDecode(seg))
    .filter((seg) => seg && seg !== '.' && seg !== '..')
    .map((seg) => encodeURIComponent(seg))
    .join('/');
  return {
    label,
    title: text(f.jobName) || text(f.positionTitle),
    pay: s.showSalary ? payLine(f) || s.noSalaryText : '',
    where: whereFor(f, s.locationFormat),
    workType: s.showWorkType ? valueOf(job, 'workType') : '',
    workModel: s.showWorkModel ? text(f.workModel) : '',
    href: `${s.detailsPage}/${path}`,
  };
}

/**
 * Search and filters from the address. Takes what Job Search Hero sends (keyword, location, workType) and the legacy
 * Job Search hash. Only the groups the board shows are read: a filter for a hidden group could not be unticked.
 */
export function readAddress(search: string, hash: string, defaultSort: Sort, groups: readonly GroupId[] = GROUP_IDS): State {
  const params = new URLSearchParams(search);
  const selected: State['selected'] = {};
  for (const id of groups) {
    const values = params.getAll(id).map((v) => v.trim()).filter(Boolean);
    if (values.length) selected[id] = [...new Set(values)];
  }
  let keyword = params.get('keyword') ?? '';
  if (!keyword && hash.length > 1) {
    try {
      const parsed = JSON.parse(decodeURIComponent(hash.slice(1))) as { keyword?: unknown };
      if (parsed && typeof parsed.keyword === 'string') keyword = parsed.keyword;
    } catch {
      // Not a Job Search hash.
    }
  }
  const sort = SORTS.find((x) => x === params.get('sort')) ?? defaultSort;
  const page = Math.max(1, parseInt(params.get('page') ?? '1', 10) || 1);
  return { keyword: keyword.trim(), location: (params.get('location') ?? '').trim(), selected, sort, page };
}

/** The current query string with this board's keys replaced by the state; other keys (preview flags) are kept. */
export function writeAddress(search: string, state: State, defaultSort: Sort): string {
  const params = new URLSearchParams(search);
  for (const k of ['keyword', 'location', 'sort', 'page', ...GROUP_IDS]) params.delete(k);
  if (state.keyword) params.set('keyword', state.keyword);
  if (state.location) params.set('location', state.location);
  for (const id of GROUP_IDS) for (const v of state.selected[id] ?? []) params.append(id, v);
  if (state.sort !== defaultSort) params.set('sort', state.sort);
  if (state.page > 1) params.set('page', String(state.page));
  const out = params.toString();
  return out ? `?${out}` : '';
}

export function activeFilterCount(state: State): number {
  return GROUP_IDS.reduce((n, id) => n + (state.selected[id]?.length ?? 0), 0);
}

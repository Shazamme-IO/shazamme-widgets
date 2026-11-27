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

function haystack(job: SiteJob, fields: readonly string[]): string {
  return fold(fields.map((k) => text(job.fields[k])).join(' '));
}

/** Every word of the search must appear somewhere in the job's text. */
function matchesWords(job: SiteJob, query: string, fields: readonly string[]): boolean {
  const words = fold(query).split(/[\s,]+/).filter(Boolean);
  if (!words.length) return true;
  const hay = haystack(job, fields);
  return words.every((w) => hay.includes(w));
}

function matchesGroups(job: SiteJob, selected: State['selected'], except?: GroupId): boolean {
  for (const id of GROUP_IDS) {
    if (id === except) continue;
    const picks = selected[id];
    if (!picks?.length) continue;
    const v = fold(valueOf(job, id));
    if (!picks.some((p) => fold(p) === v)) return false;
  }
  return true;
}

export function filterJobs(jobs: readonly SiteJob[], state: State, except?: GroupId): SiteJob[] {
  return jobs.filter(
    (j) => matchesWords(j, state.keyword, KEYWORD_FIELDS) && matchesWords(j, state.location, LOCATION_FIELDS) && matchesGroups(j, state.selected, except),
  );
}

/**
 * Each shown group with every value the site's jobs carry, most jobs first then A to Z, so the list does not jump
 * as filters change. A value picked in the address that no job has stays listed (count 0) so it can be unticked.
 */
export function buildFacets(jobs: readonly SiteJob[], state: State, groups: Settings['groups']): Facet[] {
  return groups.map(({ id, label }) => {
    const totals = new Map<string, { value: string; total: number }>();
    for (const j of jobs) {
      const v = valueOf(j, id);
      if (!v) continue;
      const k = fold(v);
      const entry = totals.get(k);
      if (entry) entry.total += 1;
      else totals.set(k, { value: v, total: 1 });
    }
    const picks = (state.selected[id] ?? []).map(fold);
    for (const p of state.selected[id] ?? []) if (!totals.has(fold(p))) totals.set(fold(p), { value: p, total: 0 });
    const live = new Map<string, number>();
    for (const j of filterJobs(jobs, state, id)) {
      const k = fold(valueOf(j, id));
      if (k) live.set(k, (live.get(k) ?? 0) + 1);
    }
    const options = [...totals.entries()]
      .sort((a, b) => b[1].total - a[1].total || a[1].value.localeCompare(b[1].value, 'en-AU'))
      .map(([k, { value }]) => ({ value, count: live.get(k) ?? 0, checked: picks.includes(k) }));
    return { id, label, options };
  }).filter((f) => f.options.length > 0);
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
  const path = job.pageItemUrl.split('/').map((seg) => encodeURIComponent(safeDecode(seg))).join('/');
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

/** Search and filters from the address. Takes what Job Search Hero sends (keyword, location, workType) and the legacy Job Search hash. */
export function readAddress(search: string, hash: string, defaultSort: Sort): State {
  const params = new URLSearchParams(search);
  const selected: State['selected'] = {};
  for (const id of GROUP_IDS) {
    const values = params.getAll(id).flatMap((v) => v.split('|')).map((v) => v.trim()).filter(Boolean);
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

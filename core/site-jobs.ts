// Live numbers and job rows straight from the site's cached job feed, for widgets that only
// summarise jobs (counts, industries, a few featured cards). One fetch per page, shared by every
// copy of every widget: the SDK caches /job-results/<siteID> and we cache the parsed rows.

import type { DudaData } from './config';
import type { FetchDesc, ShazammeClient } from './sdk';

export interface SiteJob {
  /** Raw job fields from the feed (jobName, city, workType, salaryText, ...). */
  fields: Record<string, unknown>;
  /** Last path segment of the job page: /job-details/<pageItemUrl>. */
  pageItemUrl: string;
}

/** How long a widget waits for the SDK's ready() before carrying on without it. */
const SDK_READY_TIMEOUT_MS = 1200;
const CONSULTANTS_COLLECTION = 'Consultants';
const CONSULTANTS_ACTION = 'Get Consultants';

/** Duda's Collections API pages at 100 rows; 20 pages covers any recruiter's live jobs. */
const COLLECTION_PAGE_SIZE = 100;
const COLLECTION_MAX_PAGES = 20;

interface CollectionQuery {
  pageSize(n: number): CollectionQuery;
  pageNumber(n: number): CollectionQuery;
  get(): Promise<{ values?: unknown[]; page?: { totalPages?: number } }>;
}
interface DmApi {
  loadCollectionsAPI?: () => Promise<{ data(name: string): CollectionQuery }>;
}

type Win = Window & { __shmSiteJobs?: Map<string, Promise<SiteJob[]>>; dmAPI?: DmApi };

/** Where a widget's jobs came from: the site's Duda collection or the Shazamme job feed. */
export type JobSource = 'collection' | 'feed';

interface ReadyClient {
  _sid?: string;
  _site?: unknown;
  ready?: (sid: string, page?: unknown) => unknown;
}

/** Text of a feed field, or '' for null, undefined and objects. */
export function text(v: unknown): string {
  if (typeof v === 'string') return v.trim();
  if (typeof v === 'number' && Number.isFinite(v)) return String(v);
  return '';
}

/** Escape text for an HTML text node or a double-quoted attribute. */
export function esc(v: unknown): string {
  return String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** http(s) or site-relative addresses only. Anything else (javascript:, data:, //host) becomes ''. */
export function safeUrl(v: unknown): string {
  const s = typeof v === 'string' ? v.trim() : '';
  // A backslash reads as a slash and tabs or newlines are dropped, so "/\evil.example" would become "//evil.example".
  if (!s || /[\\\u0000-\u001f\u007f]/.test(s)) return '';
  if (/^https?:\/\//i.test(s)) return s;
  if (/^\/(?![/\\])/.test(s)) return s;
  return '';
}

/** Clamp a numeric setting; blank or garbage falls back. */
export function clampInt(v: unknown, fallback: number, min: number, max: number): number {
  const n = typeof v === 'number' ? v : parseInt(String(v ?? '').trim(), 10);
  return Number.isFinite(n) ? Math.max(min, Math.min(max, Math.trunc(n))) : fallback;
}

/** Duda hands toggles through as 'true'/'false' strings (or real booleans). */
export function flag(v: unknown, fallback: boolean): boolean {
  if (typeof v === 'boolean') return v;
  if (typeof v === 'string') {
    const s = v.trim().toLowerCase();
    if (s === 'true' || s === '1' || s === 'yes' || s === 'on') return true;
    if (s === 'false' || s === '0' || s === 'no' || s === 'off') return false;
  }
  return fallback;
}

/** One of the allowed dropdown values, else the fallback. Case-insensitive. */
export function pick<T extends string>(v: unknown, allowed: readonly T[], fallback: T): T {
  const s = text(v).toLowerCase();
  return allowed.find((a) => a.toLowerCase() === s) ?? fallback;
}

/** A Duda list setting as an array of plain objects; anything else is an empty list. */
export function listOf(v: unknown): Array<Record<string, unknown>> {
  if (!Array.isArray(v)) return [];
  return v.filter((i): i is Record<string, unknown> => !!i && typeof i === 'object');
}

export function getSdk(shazamme: unknown): ShazammeClient | undefined {
  const sdk = shazamme ?? (typeof window !== 'undefined' ? (window as unknown as { shazamme?: unknown }).shazamme : undefined);
  return sdk && typeof (sdk as ShazammeClient).fetch === 'function' ? (sdk as ShazammeClient) : undefined;
}

/**
 * Make sure the injected SDK knows its site before site() is called. A second ready() on an SDK that
 * already resolved can hand back a promise that never settles, so skip it then and cap the wait otherwise.
 */
export async function ensureSdkReady(sdk: ShazammeClient, data: DudaData | undefined): Promise<void> {
  const s = sdk as unknown as ReadyClient;
  const d = (data ?? {}) as { siteId?: string; siteID?: string; page?: unknown };
  const sid = s._sid || d.siteId || d.siteID;
  if (!sid) return;
  s._sid = s._sid || sid;
  if (s._site || typeof s.ready !== 'function') return;
  try {
    await Promise.race([
      Promise.resolve(s.ready(s._sid, d.page)),
      new Promise<void>((resolve) => setTimeout(resolve, SDK_READY_TIMEOUT_MS)),
    ]);
  } catch {
    // The SDK still answers site() from its own lookup; a failed ready() is not fatal.
  }
}

function toRows(raw: unknown): SiteJob[] {
  const list = Array.isArray(raw) ? raw : (raw as { values?: unknown })?.values;
  if (!Array.isArray(list)) return [];
  const rows: SiteJob[] = [];
  for (const item of list as Array<Record<string, unknown>>) {
    const fields = (item?.data ?? item) as Record<string, unknown> | undefined;
    if (!fields || typeof fields !== 'object' || fields.activeStatus === false || fields.activeStatus === 'false') continue;
    const fromUrl = text(fields.jobURL).split(/[?#]/)[0].split('/').filter(Boolean).pop() ?? '';
    rows.push({ fields, pageItemUrl: text(item.page_item_url) || fromUrl });
  }
  return rows;
}

/** The site's live jobs. Rejects when there is no SDK or the feed cannot be read. */
export async function loadSiteJobs(shazamme: unknown, data: DudaData | undefined, inEditor: boolean): Promise<SiteJob[]> {
  const sdk = getSdk(shazamme);
  if (!sdk) throw new Error('The Shazamme SDK did not load.');
  await ensureSdkReady(sdk, data);
  const site = await sdk.site();
  const key = String(site?.siteID ?? '');
  if (!key) throw new Error('The site id could not be read.');
  const win = window as Win;
  const cache = (win.__shmSiteJobs = win.__shmSiteJobs ?? new Map());
  const hit = cache.get(key);
  if (hit && !inEditor) return hit;
  const desc: FetchDesc = { name: 'Jobs', action: 'Get Jobs', useCache: !inEditor, path: `/job-results/${key}`, isExternal: true };
  const pending = Promise.resolve(sdk.fetch(desc)).then(toRows);
  if (!inEditor) {
    cache.set(key, pending);
    pending.catch(() => cache.delete(key));
  }
  return pending;
}

/** Rows of a Duda collection on this site, read with Duda's Collections API (dmAPI). Rejects when it cannot be read. */
export async function loadCollectionJobs(name: string, inEditor: boolean): Promise<SiteJob[]> {
  const win = window as Win;
  const loader = win.dmAPI?.loadCollectionsAPI;
  if (typeof loader !== 'function') throw new Error('The Duda collections API is not on this page.');
  const cache = (win.__shmSiteJobs = win.__shmSiteJobs ?? new Map());
  const key = `collection:${name}`;
  const hit = cache.get(key);
  if (hit && !inEditor) return hit;
  const pending = (async () => {
    const api = await loader.call(win.dmAPI);
    const values: unknown[] = [];
    for (let page = 0; page < COLLECTION_MAX_PAGES; page += 1) {
      const res = await api.data(name).pageSize(COLLECTION_PAGE_SIZE).pageNumber(page).get();
      values.push(...(Array.isArray(res?.values) ? res.values : []));
      if (page + 1 >= (Number(res?.page?.totalPages) || 1)) break;
    }
    return toRows(values);
  })();
  if (!inEditor) {
    cache.set(key, pending);
    pending.catch(() => cache.delete(key));
  }
  return pending;
}

/**
 * Jobs from the named Duda collection when it can be read and has rows, else the Shazamme job feed.
 * A blank collection name goes straight to the feed.
 */
export async function loadJobsFrom(
  collection: string,
  shazamme: unknown,
  data: DudaData | undefined,
  inEditor: boolean,
): Promise<{ jobs: SiteJob[]; source: JobSource }> {
  if (collection) {
    try {
      const jobs = await loadCollectionJobs(collection, inEditor);
      if (jobs.length) return { jobs, source: 'collection' };
    } catch (err) {
      if (inEditor) console.warn(`[site-jobs] collection "${collection}" could not be read, using the job feed`, err);
    }
  }
  return { jobs: await loadSiteJobs(shazamme, data, inEditor), source: 'feed' };
}

/** Consultants shown on the site (isVisible is not false). Rejects when the collection cannot be read. */
export async function loadVisibleConsultantCount(shazamme: unknown, data: DudaData | undefined): Promise<number> {
  const sdk = getSdk(shazamme);
  if (!sdk) throw new Error('The Shazamme SDK did not load.');
  await ensureSdkReady(sdk, data);
  const raw = await sdk.fetch({ name: CONSULTANTS_COLLECTION, action: CONSULTANTS_ACTION, useCache: true });
  const list = Array.isArray(raw) ? raw : (raw as { values?: unknown })?.values;
  if (!Array.isArray(list)) return 0;
  return (list as Array<Record<string, unknown>>).filter((i) => {
    const f = (i?.data ?? i) as Record<string, unknown> | undefined;
    return !!f && f.isVisible !== false;
  }).length;
}

/** Distinct non-blank values of a job field, in first-seen order. */
export function distinct(jobs: readonly SiteJob[], field: string): string[] {
  const seen = new Set<string>();
  for (const j of jobs) {
    const v = text(j.fields[field]);
    if (v) seen.add(v);
  }
  return [...seen];
}

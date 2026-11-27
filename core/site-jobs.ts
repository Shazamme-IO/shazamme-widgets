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

/**
 * Duda's Collections API (developer.duda.co/docs/collections-api.md): pageNumber is 0-based, pageSize is at most 100,
 * and get() resolves { values, page: { pageNumber, pageSize, totalPages, totalItems } } (checked live on Demo 2,
 * 27 Nov 2026). 20 pages covers any recruiter's live jobs.
 */
export const COLLECTION_PAGE_SIZE = 100;
export const COLLECTION_MAX_PAGES = 20;
/** How long a widget waits for the collection before using the Shazamme job feed instead. */
export const COLLECTION_TIMEOUT_MS = 4000;

interface CollectionPage {
  values?: unknown[];
  page?: { pageNumber?: number; totalPages?: number };
}
interface CollectionQuery {
  pageSize(n: number): CollectionQuery;
  pageNumber(n: number): CollectionQuery;
  get(): Promise<CollectionPage | unknown[]>;
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
  const pending = loader.call(win.dmAPI).then((api) => readAllPages(name, (n) => api.data(name).pageSize(COLLECTION_PAGE_SIZE).pageNumber(n).get()));
  if (!inEditor) {
    cache.set(key, pending);
    pending.catch(() => cache.delete(key));
  }
  return pending;
}

type PageGetter = (n: number) => Promise<CollectionPage | unknown[]>;

function pageValues(res: CollectionPage | unknown[] | undefined): unknown[] {
  if (Array.isArray(res)) return res;
  return Array.isArray(res?.values) ? res.values : [];
}

function pageMeta(res: CollectionPage | unknown[] | undefined): { echo: number; total: number; size: number } {
  const page = (Array.isArray(res) ? undefined : res?.page) as { pageNumber?: unknown; totalPages?: unknown; pageSize?: unknown } | undefined;
  const whole = (v: unknown): number => {
    const n = Number(v);
    return Number.isFinite(n) && n > 0 ? Math.trunc(n) : 0;
  };
  return { echo: Number(page?.pageNumber ?? NaN), total: whole(page?.totalPages), size: whole(page?.pageSize) };
}

/** Rows once each: a repeated page_item_url (an API that pages from 1 answers page 0 and page 1 alike) is dropped. */
function dedupe(rows: SiteJob[]): SiteJob[] {
  const seen = new Set<string>();
  return rows.filter((r) => {
    if (!r.pageItemUrl) return true;
    if (seen.has(r.pageItemUrl)) return false;
    seen.add(r.pageItemUrl);
    return true;
  });
}

/**
 * Every page of a collection. Page 0 first; its totalPages lets the rest load in parallel. A short page (fewer than
 * 100 rows) ends the read whatever totalPages says, and a full last page keeps reading one page at a time, so a
 * missing or wrong totalPages, or an API that counts pages from 1, still reads every row. Stops at 20 pages.
 */
export async function readAllPages(name: string, get: PageGetter): Promise<SiteJob[]> {
  let first = await get(0);
  let base = pageMeta(first).echo === 1 ? 1 : 0;
  if (!pageValues(first).length && !pageMeta(first).total) {
    const one = await get(1);
    if (pageValues(one).length) {
      first = one;
      base = 1;
    }
  }
  const meta = pageMeta(first);
  const size = Math.min(meta.size || COLLECTION_PAGE_SIZE, COLLECTION_PAGE_SIZE);
  const pages: unknown[][] = [pageValues(first)];
  const full = (): boolean => pages[pages.length - 1].length >= size;
  const total = Math.min(meta.total, COLLECTION_MAX_PAGES);
  if (total > 1) {
    const rest = await Promise.all(Array.from({ length: total - 1 }, (_, i) => get(base + 1 + i)));
    pages.push(...rest.map(pageValues));
  }
  while (full() && pages.length < COLLECTION_MAX_PAGES) pages.push(pageValues(await get(base + pages.length)));
  if (full() && pages.length >= COLLECTION_MAX_PAGES) {
    console.warn(`[site-jobs] collection "${name}" has more than ${COLLECTION_MAX_PAGES * COLLECTION_PAGE_SIZE} rows; only the first ${COLLECTION_MAX_PAGES} pages are shown`);
  }
  return dedupe(toRows(pages.flat()));
}

/** The promise, or a rejection once ms have passed. The timer is cleared either way. */
function withTimeout<T>(work: Promise<T>, ms: number, what: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const late = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`${what} took longer than ${ms}ms`)), ms);
  });
  return Promise.race([work, late]).finally(() => clearTimeout(timer));
}

/**
 * Jobs from the named Duda collection when it can be read within 4 seconds and has rows, else the Shazamme job feed.
 * A blank collection name goes straight to the feed.
 */
export async function loadJobsFrom(
  collection: string,
  shazamme: unknown,
  data: DudaData | undefined,
  inEditor: boolean,
  collectionTimeoutMs = COLLECTION_TIMEOUT_MS,
): Promise<{ jobs: SiteJob[]; source: JobSource }> {
  if (collection) {
    try {
      const jobs = await withTimeout(loadCollectionJobs(collection, inEditor), collectionTimeoutMs, `The "${collection}" collection`);
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

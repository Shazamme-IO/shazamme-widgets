// Shared by Job Summary and Job Hero Chips: find the job on the current job page and turn
// its fields into display text. Not a widget itself (no index.ts or legacy.js here).
//
// How the job is found, the same way the other job-page widgets do it: the site builder binds
// the widget's "jobID" input to the dynamic page's jobID (as Dynamic Application button does).
// The widget then reads the Jobs collection through the Shazamme SDK, the list Job Feed 2026
// and Job Search use, because that list carries names (profession, work type, work model)
// where the per-job record carries only ids. With no bound jobID it matches the page address
// to the job's own address, so the widget still works on a page where nothing was bound.

import { payLine, salaryRange } from '../../core/salary';

export type JobRow = Record<string, unknown>;

export interface Sdk {
  ready?: (siteId: string, page?: unknown) => unknown;
  register?: (name: string, data: unknown) => unknown;
  fetch?: (options: Record<string, unknown>) => Promise<unknown>;
}

export const JOBS_COLLECTION = 'Jobs';

/** Shown in the Design Editor only, so a site builder can style the widget before a real job loads. */
export const SAMPLE_JOB: Readonly<JobRow> = {
  jobName: 'Financial Controller',
  category: 'Accounting & Finance',
  subCategory: 'Financial Controller',
  workType: 'Permanent',
  workModel: 'Hybrid',
  city: 'Sydney',
  state: 'NSW',
  country: 'Australia',
  salaryType: 'Annual',
  salaryFrom: '150000',
  salaryTo: '170000',
  salaryText: '$150,000 – $170,000 + super',
  currencyCode: 'AUD',
  referenceNumber: '236',
};

export function text(v: unknown): string {
  if (typeof v === 'string') return v.trim();
  if (typeof v === 'number' && Number.isFinite(v)) return String(v);
  return '';
}

export function toBool(v: unknown, fallback: boolean): boolean {
  if (v === true || v === 'true') return true;
  if (v === false || v === 'false') return false;
  return fallback;
}

export function toChoice<T extends string>(v: unknown, allowed: readonly T[], fallback: T): T {
  const s = text(v);
  return (allowed as readonly string[]).includes(s) ? (s as T) : fallback;
}

export function esc(v: unknown): string {
  return text(v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string);
}

export function currencyCode(job: JobRow): string {
  const code = text(job.currencyCode) || text(job.salaryCurrency) || text(job.currency);
  return /^[A-Za-z]{3}$/.test(code) ? code.toUpperCase() : '';
}

export { salaryRange };

/** The formatted range with the recruiter's wording ("+ super") after it; see core/salary. */
export function salaryLine(job: JobRow): string {
  return payLine(job);
}

export function locationLine(job: JobRow): string {
  return [text(job.city), text(job.state), text(job.country)].filter(Boolean).join(', ');
}

export const profession = (job: JobRow): string => text(job.profession) || text(job.category);
export const role = (job: JobRow): string => text(job.role) || text(job.subCategory);

function rowData(entry: unknown): JobRow | null {
  if (!entry || typeof entry !== 'object') return null;
  const inner = (entry as JobRow).data;
  return inner && typeof inner === 'object' ? (inner as JobRow) : (entry as JobRow);
}

function lastSegment(url: string): string {
  const path = url.split(/[?#]/)[0].replace(/\/+$/, '');
  const seg = path.slice(path.lastIndexOf('/') + 1);
  try {
    return decodeURIComponent(seg).toLowerCase();
  } catch {
    return seg.toLowerCase();
  }
}

/** The row for this job: by id when one is bound, else by the last part of the page address. */
export function pickJob(entries: unknown, jobId: string, pageUrl: string): JobRow | null {
  if (!Array.isArray(entries)) return null;
  const wantId = jobId.toLowerCase();
  const slug = lastSegment(pageUrl);
  let bySlug: JobRow | null = null;
  for (const entry of entries) {
    const row = rowData(entry);
    if (!row) continue;
    if (wantId && text(row.jobID).toLowerCase() === wantId) return row;
    if (!bySlug && slug) {
      const own = lastSegment(text((entry as JobRow).page_item_url) || text(row.jobURL) || text(row.jobURLAddress));
      if (own && own === slug) bySlug = row;
    }
  }
  return bySlug;
}

interface Win { __shmJobRows?: Promise<unknown> }

/** One Jobs read per page, shared by every job widget on it (job page and search hero alike). */
export function loadJobRows(sdk: Sdk, inEditor: boolean): Promise<unknown> {
  if (typeof sdk.fetch !== 'function') return Promise.reject(new Error('The Shazamme SDK did not load.'));
  const win = window as unknown as Win;
  if (!inEditor && win.__shmJobRows) return win.__shmJobRows;
  const p = Promise.resolve(sdk.fetch({ name: JOBS_COLLECTION, useCache: true }));
  if (!inEditor) {
    win.__shmJobRows = p;
    p.catch(() => { win.__shmJobRows = undefined; });
  }
  return p;
}

export interface JobLookup {
  sdk: Sdk | undefined;
  config: Record<string, unknown>;
  siteId: string;
  page: unknown;
  inEditor: boolean;
  pageUrl: string;
}

export type LoadedJob = { job: JobRow; isSample: boolean } | null;

/** Resolves to the job, the editor sample, or null (live page with no job: render nothing). */
export async function loadJob(l: JobLookup): Promise<LoadedJob> {
  const sdk = l.sdk;
  if (!sdk) {
    if (l.inEditor) return { job: { ...SAMPLE_JOB }, isSample: true };
    return null;
  }
  await Promise.resolve(sdk.ready?.(l.siteId, l.page));
  let found: JobRow | null = null;
  try {
    found = pickJob(await loadJobRows(sdk, l.inEditor), text(l.config.jobID), l.pageUrl);
  } catch (e) {
    if (!l.inEditor) throw e;
  }
  if (found) return { job: found, isSample: false };
  return l.inEditor ? { job: { ...SAMPLE_JOB }, isSample: true } : null;
}

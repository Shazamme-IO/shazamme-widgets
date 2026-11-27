// Consultant data: normalise each collection row to one shape, then filter, sort and
// count live roles. Everything here is pure except `loadRows`.

import { toText, type Settings } from './settings';

export interface Consultant {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  path: string;
  classification: string;
  sortOrder: number;
}

/** How many live jobs name each consultant. `known` is false when the job feed carries no consultant link at all. */
export interface LiveRoles {
  known: boolean;
  counts: Map<string, number>;
}

type Raw = Record<string, unknown>;

const EMAIL_PATTERN = /^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]+$/;

/** http(s) or site-relative URLs only. Anything else (javascript:, data:, //host) renders as nothing. */
export function safeUrl(v: unknown): string {
  const s = typeof v === 'string' ? v.trim() : '';
  if (!s || /[\\\u0000-\u001f\u007f]/.test(s)) return '';
  if (/^https?:\/\//i.test(s)) return s;
  if (/^\/(?!\/)/.test(s)) return s;
  return '';
}

/** Rich text from the collection -> plain text. DOMParser is inert: nothing in it loads or runs. */
export function plainText(v: unknown): string {
  const html = typeof v === 'string' ? v : '';
  if (!html) return '';
  if (!/[<&]/.test(html)) return html.trim();
  const doc = new DOMParser().parseFromString(html, 'text/html');
  doc.querySelectorAll('script, style').forEach((el) => el.remove());
  return (doc.body.textContent ?? '').trim();
}

export function pathOf(v: unknown): string {
  const url = safeUrl(v);
  if (!url) return '';
  try {
    return (url.startsWith('/') ? url : new URL(url).pathname).replace(/\/+$/, '').toLowerCase();
  } catch {
    return '';
  }
}

export function cleanEmail(v: unknown): string {
  const s = toText(v);
  return EMAIL_PATTERN.test(s) ? s : '';
}

const MIN_PHONE_DIGITS = 6;

/** Digits and a leading plus only, so a phone number can sit in a tel: link. Too short to be a number gives nothing. */
export function telHref(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length < MIN_PHONE_DIGITS) return '';
  return `tel:${phone.trim().startsWith('+') ? '+' : ''}${digits}`;
}

export function initials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  const first = Array.from(words[0] ?? '')[0] ?? '';
  const last = words.length > 1 ? (Array.from(words[words.length - 1])[0] ?? '') : '';
  return (first + last).toUpperCase() || '?';
}

export function rowData(entry: unknown): Raw | null {
  if (!entry || typeof entry !== 'object') return null;
  const e = entry as Raw;
  const inner = e.data;
  return inner && typeof inner === 'object' ? (inner as Raw) : e;
}

export function toConsultant(row: Raw, index: number): Consultant | null {
  if (row.isVisible === false || row.isVisible === 'false') return null;
  const name = [plainText(row.firstName), plainText(row.lastName)].filter(Boolean).join(' ');
  if (!name) return null;
  const sort = typeof row.sortOrder === 'number' ? row.sortOrder : parseInt(String(row.sortOrder ?? ''), 10);
  return {
    id: toText(row.consultantID, `row-${index}`).toLowerCase() || `row-${index}`,
    name,
    role: plainText(row.positionTitle),
    email: cleanEmail(row.eMail),
    phone: plainText(row.phone) || plainText(row.mobile),
    path: pathOf(row.consultantURL),
    classification: toText(row.classification).toLowerCase(),
    sortOrder: Number.isFinite(sort) ? sort : Number.MAX_SAFE_INTEGER,
  };
}

export function normaliseConsultants(entries: unknown): Consultant[] {
  if (!Array.isArray(entries)) return [];
  const out: Consultant[] = [];
  entries.forEach((entry, index) => {
    const row = rowData(entry);
    const c = row ? toConsultant(row, index) : null;
    if (c) out.push(c);
  });
  return out;
}

export function selectConsultants(all: Consultant[], s: Pick<Settings, 'classification' | 'sortBy' | 'maxConsultants'>): Consultant[] {
  const filtered = s.classification ? all.filter((c) => c.classification === s.classification) : all.slice();
  const sorted =
    s.sortBy === 'name'
      ? filtered.sort((a, b) => a.name.localeCompare(b.name))
      : filtered.sort((a, b) => a.sortOrder - b.sortOrder);
  return s.maxConsultants > 0 ? sorted.slice(0, s.maxConsultants) : sorted;
}

function isLive(row: Raw): boolean {
  return !(row.activeStatus === false || row.activeStatus === 'false');
}

/**
 * Jobs name their consultant by contactEmail (the same link Jobs on Consultants uses) and
 * by consultantURL. A job matches a consultant on either. A feed where no job carries
 * either field cannot say who owns what, so the counts are "not known" and the line stays hidden.
 */
export function countLiveRoles(jobEntries: unknown, consultants: Consultant[]): LiveRoles {
  const counts = new Map<string, number>();
  const rows = Array.isArray(jobEntries) ? jobEntries : [];
  const byEmail = new Map<string, Consultant>();
  const byPath = new Map<string, Consultant>();
  for (const c of consultants) {
    if (c.email) byEmail.set(c.email.toLowerCase(), c);
    if (c.path) byPath.set(c.path, c);
  }
  let known = false;
  for (const entry of rows) {
    const row = rowData(entry);
    if (!row || !isLive(row)) continue;
    const email = cleanEmail(row.contactEmail).toLowerCase();
    const path = pathOf(row.consultantURL);
    if (email || path) known = true;
    const owner = (email && byEmail.get(email)) || (path && byPath.get(path)) || null;
    if (owner) counts.set(owner.id, (counts.get(owner.id) ?? 0) + 1);
  }
  return { known, counts };
}

export function findJob(entries: unknown, jobId: string): Raw | null {
  if (!Array.isArray(entries) || !jobId) return null;
  const want = jobId.toLowerCase();
  for (const entry of entries) {
    const row = rowData(entry);
    if (row && toText(row.jobID).toLowerCase() === want) return row;
  }
  return null;
}

/** The consultant who owns a job: matched in the Consultants collection, else built from the job's own contact fields. */
export function consultantForJob(job: Raw, consultants: Consultant[]): Consultant | null {
  const email = cleanEmail(job.contactEmail);
  const path = pathOf(job.consultantURL);
  const match =
    (email && consultants.find((c) => c.email.toLowerCase() === email.toLowerCase())) ||
    (path && consultants.find((c) => c.path === path)) ||
    null;
  if (match) return match;
  const name = plainText(job.contactName);
  if (!name) return null;
  return { id: 'job-contact', name, role: '', email, phone: plainText(job.contactPhone), path, classification: '', sortOrder: 0 };
}

export interface Sdk {
  ready?: (siteId: string, page: unknown) => unknown;
  register?: (name: string, config: unknown) => unknown;
  fetch?: (desc: { name: string }) => Promise<unknown>;
  site?: () => Promise<{ siteID?: string }>;
  submit?: (payload: Record<string, unknown>, regional?: boolean) => Promise<unknown>;
}

type Win = Window & { __shmCcFetch?: Record<string, Promise<unknown>> };

/** One fetch per collection per page, shared by every copy of the widget. The editor always refetches. */
export function loadRows(sdk: Sdk, collection: string, siteId: string, inEditor: boolean): Promise<unknown> {
  if (typeof sdk.fetch !== 'function') return Promise.reject(new Error('The Shazamme SDK did not load.'));
  const win = window as Win;
  const cache = (win.__shmCcFetch = win.__shmCcFetch ?? {});
  const key = `${siteId}::${collection}`;
  const hit = cache[key];
  if (!inEditor && hit) return hit;
  const p = Promise.resolve(sdk.fetch({ name: collection }));
  if (!inEditor) {
    cache[key] = p;
    p.catch(() => { delete cache[key]; });
  }
  return p;
}

/** The Consultant on Jobs fallback for a job that is not in the Jobs collection: ask the API who owns it. */
export async function consultantFromApi(sdk: Sdk, jobId: string): Promise<Consultant | null> {
  if (typeof sdk.site !== 'function' || typeof sdk.submit !== 'function') return null;
  const site = await sdk.site();
  const res = (await sdk.submit({ action: 'Get Consultant By Job', jobID: jobId, siteID: site?.siteID })) as { response?: { items?: unknown } } | undefined;
  const items = res?.response?.items;
  return normaliseConsultants(items)[0] ?? null;
}

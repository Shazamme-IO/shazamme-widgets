// Consultant data: normalise each collection row to one shape, then filter, sort and
// count live roles. Everything here is pure except `loadRows`.

import { toText, type Settings, type SocialKey } from './settings';

export interface Consultant {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  path: string;
  key: string;
  classification: string;
  sortOrder: number;
  /** The phone line as stored, without falling back to the mobile (used when the mobile line is on too). */
  phoneOnly: string;
  mobile: string;
  photo: string;
  locations: string[];
  sectors: string[];
  description: string;
  socials: Partial<Record<SocialKey, string>>;
}

/** How many live jobs name each consultant. `known` is false when the job feed carries no consultant link at all. */
export interface LiveRoles {
  known: boolean;
  counts: Map<string, number>;
}

type Raw = Record<string, unknown>;

const EMAIL_PATTERN = /^[A-Za-z0-9._%+'-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/;

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

/**
 * A path that stays on this site. Leading slashes and backslashes collapse to one "/", so
 * "//evil.com/p" or "/\evil" (which a browser reads as another host) become a local path.
 */
export function localPath(path: string): string {
  return path.replace(/^[/\\]+/, '/');
}

/** The consultant's page as a link: the path of the address, keeping its case, so a case-sensitive slug still works. */
export function hrefPath(v: unknown): string {
  const url = safeUrl(v);
  if (!url) return '';
  if (url.startsWith('/')) {
    const path = localPath(url);
    return path === '/' ? '' : path;
  }
  try {
    const u = new URL(url);
    const path = localPath(u.pathname);
    return path === '/' ? '' : `${path}${u.search}`;
  } catch {
    return '';
  }
}

/** The same page for matching a job to a consultant: path only, no trailing slash, any case. */
export function pathKey(v: unknown): string {
  const href = hrefPath(v);
  return href ? href.split(/[?#]/)[0].replace(/\/+$/, '').toLowerCase() : '';
}

export function cleanEmail(v: unknown): string {
  const s = toText(v);
  return EMAIL_PATTERN.test(s) ? s : '';
}

const MIN_PHONE_DIGITS = 6;

/** Digits and a leading plus only, so a phone number can sit in a tel: link. An extension ("ext 12", "x12", "#12") is not dialled. */
export function telHref(phone: string): string {
  const main = phone.split(/\s*(?:ext\.?(?=\s*\d)|x(?=\s*\d)|#)/i)[0];
  const digits = main.replace(/\D/g, '');
  if (digits.length < MIN_PHONE_DIGITS) return '';
  return `tel:${main.trim().startsWith('+') ? '+' : ''}${digits}`;
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

/**
 * A list field from the console: a JSON array (`[{"Profession":"Legal"}]`, `[{"LocationName":"Sydney"}]`
 * or plain strings) or comma-separated text. Returns trimmed, de-duplicated plain text.
 */
export function parseList(v: unknown, objectKey: string): string[] {
  const raw = typeof v === 'string' ? v.trim() : Array.isArray(v) ? v : '';
  if (!raw) return [];
  let items: unknown[] | null = Array.isArray(raw) ? raw : null;
  if (!items && typeof raw === 'string' && raw.startsWith('[')) {
    try {
      const parsed: unknown = JSON.parse(raw);
      if (Array.isArray(parsed)) items = parsed;
    } catch {
      items = null;
    }
  }
  const values = items
    ? items.map((i) => (typeof i === 'string' ? i : i && typeof i === 'object' ? (i as Raw)[objectKey] ?? (i as Raw).Name ?? (i as Raw).name : ''))
    : String(raw).split(',');
  const seen = new Set<string>();
  const out: string[] = [];
  for (const value of values) {
    const text = plainText(typeof value === 'string' ? value : '');
    if (text && !seen.has(text.toLowerCase())) {
      seen.add(text.toLowerCase());
      out.push(text);
    }
  }
  return out;
}

/**
 * The console's photo fields, in the order the platform Consultant widget reads them (photoURL
 * first). An http address is asked for over https, so the photo never makes the page mixed
 * content. A custom port is kept as written; only an explicit :80 (the http default, which never
 * speaks https) is dropped. A host without https fails to load and the card falls back (see
 * photoErrorHandler).
 */
export function photoUrl(row: Raw): string {
  const url = safeUrl(row.photoURL) || safeUrl(row.externalPhotoURL) || safeUrl(row.s3URL);
  if (!/^http:\/\//i.test(url)) return url;
  return url.replace(/^http:\/\/([^/?#]*?):80(?=[/?#]|$)/i, 'http://$1').replace(/^http:\/\//i, 'https://');
}

const SOCIAL_FIELDS: Record<SocialKey, string> = {
  linkedin: 'linkedInURL',
  facebook: 'facebookURL',
  twitter: 'twitterURL',
  google: 'googleURL',
  wechat: 'weChatURL',
};

function socialsOf(row: Raw): Partial<Record<SocialKey, string>> {
  const out: Partial<Record<SocialKey, string>> = {};
  for (const [id, field] of Object.entries(SOCIAL_FIELDS) as [SocialKey, string][]) {
    const url = safeUrl(row[field]);
    if (/^https?:\/\//i.test(url)) out[id] = url;
  }
  return out;
}

export function toConsultant(row: Raw, index: number): Consultant | null {
  if (row.isVisible === false || row.isVisible === 'false') return null;
  const name = [plainText(row.firstName), plainText(row.lastName)].filter(Boolean).join(' ');
  if (!name) return null;
  const sort = typeof row.sortOrder === 'number' ? row.sortOrder : parseInt(String(row.sortOrder ?? ''), 10);
  const locations = parseList(row.businessLocation, 'LocationName');
  const sectors = parseList(row.classification, 'Profession');
  return {
    id: toText(row.consultantID, `row-${index}`).toLowerCase() || `row-${index}`,
    name,
    role: plainText(row.positionTitle),
    email: cleanEmail(row.eMail),
    phone: plainText(row.phone) || plainText(row.mobile),
    path: hrefPath(row.consultantURL),
    key: pathKey(row.consultantURL),
    classification: toText(row.classification).toLowerCase(),
    sortOrder: Number.isFinite(sort) ? sort : Number.MAX_SAFE_INTEGER,
    phoneOnly: plainText(row.phone),
    mobile: plainText(row.mobile),
    photo: photoUrl(row),
    locations: locations.length ? locations : parseList(row.businessLocation2, 'LocationName'),
    sectors: sectors.length ? sectors : parseList(row.classification2, 'Profession'),
    description: plainText(row.shortDescription),
    socials: socialsOf(row),
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

/** Comma-separated wanted values; a consultant matches on their whole field or any one of its entries. */
function matchesAny(want: string, whole: string, entries: string[]): boolean {
  if (!want) return true;
  if (whole && whole === want) return true;
  const wanted = want.split(',').map((w) => w.trim()).filter(Boolean);
  return entries.some((e) => wanted.includes(e.toLowerCase()));
}

export function selectConsultants(all: Consultant[], s: Pick<Settings, 'classification' | 'sortBy' | 'maxConsultants'> & Partial<Pick<Settings, 'location'>>): Consultant[] {
  const location = s.location ?? '';
  const filtered =
    s.classification || location
      ? all.filter((c) => matchesAny(s.classification, c.classification, c.sectors) && matchesAny(location, '', c.locations))
      : all.slice();
  const sorted =
    s.sortBy === 'name'
      ? filtered.sort((a, b) => a.name.localeCompare(b.name))
      : filtered.sort((a, b) => a.sortOrder - b.sortOrder);
  return s.maxConsultants > 0 ? sorted.slice(0, s.maxConsultants) : sorted;
}

export interface ActiveFilters {
  sector: string;
  location: string;
  query: string;
}

/** The visitor's choices in the filter bar: one sector, one location and a name search, all at once. */
export function applyFilters(items: Consultant[], f: ActiveFilters): Consultant[] {
  const query = f.query.trim().toLowerCase();
  return items.filter(
    (c) =>
      (!f.sector || c.sectors.some((x) => x.toLowerCase() === f.sector)) &&
      (!f.location || c.locations.some((x) => x.toLowerCase() === f.location)) &&
      (!query || c.name.toLowerCase().includes(query) || c.role.toLowerCase().includes(query)),
  );
}

/** Every distinct value of one list field, A to Z, for the filter buttons. */
export function distinctValues(items: Consultant[], field: 'sectors' | 'locations'): string[] {
  const byLower = new Map<string, string>();
  for (const c of items) for (const v of c[field]) if (!byLower.has(v.toLowerCase())) byLower.set(v.toLowerCase(), v);
  return [...byLower.values()].sort((a, b) => a.localeCompare(b));
}

/**
 * The consultant's page. With no profile page set it is the consultant's own address; with one
 * (for example "consultant") it is that page plus the last part of their address, as the
 * Consultant widget builds it.
 */
export function profileHref(c: Pick<Consultant, 'path'>, profilePage: string): string {
  if (!c.path || !profilePage) return c.path;
  const slug = c.path.split(/[?#]/)[0].replace(/\/+$/, '').split('/').pop() ?? '';
  return slug ? localPath(`/${profilePage.split('/').map(encodeURIComponent).join('/')}/${slug}`) : c.path;
}

function isLive(row: Raw): boolean {
  return !(row.activeStatus === false || row.activeStatus === 'false');
}

/**
 * Jobs name their consultant by contactEmail (the same link Jobs on Consultants uses) and
 * by consultantURL. A job matches a consultant on either. Counts are only "known" once at
 * least one live job matches a consultant: a feed that never names anyone we list cannot say
 * who owns what, so the line stays hidden instead of claiming "0 live roles" for everyone.
 * A consultant with neither an email nor a page cannot be matched, so they get no count.
 */
export function countLiveRoles(jobEntries: unknown, consultants: Consultant[]): LiveRoles {
  const rows = Array.isArray(jobEntries) ? jobEntries : [];
  const byEmail = new Map<string, Consultant>();
  const byKey = new Map<string, Consultant>();
  for (const c of consultants) {
    if (c.email) byEmail.set(c.email.toLowerCase(), c);
    if (c.key) byKey.set(c.key, c);
  }
  const matched = new Map<string, number>();
  for (const entry of rows) {
    const row = rowData(entry);
    if (!row || !isLive(row)) continue;
    const email = cleanEmail(row.contactEmail).toLowerCase();
    const key = pathKey(row.consultantURL);
    const owner = (email && byEmail.get(email)) || (key && byKey.get(key)) || null;
    if (owner) matched.set(owner.id, (matched.get(owner.id) ?? 0) + 1);
  }
  if (matched.size === 0) return { known: false, counts: new Map() };
  const counts = new Map<string, number>();
  for (const c of consultants) if (c.email || c.key) counts.set(c.id, matched.get(c.id) ?? 0);
  return { known: true, counts };
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
  const key = pathKey(job.consultantURL);
  const match =
    (email && consultants.find((c) => c.email.toLowerCase() === email.toLowerCase())) ||
    (key && consultants.find((c) => c.key === key)) ||
    null;
  if (match) return match;
  const name = plainText(job.contactName);
  if (!name) return null;
  const phone = plainText(job.contactPhone);
  return {
    id: 'job-contact', name, role: '', email, phone, path: hrefPath(job.consultantURL), key, classification: '', sortOrder: 0,
    phoneOnly: phone, mobile: '', photo: '', locations: [], sectors: [], description: '', socials: {},
  };
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

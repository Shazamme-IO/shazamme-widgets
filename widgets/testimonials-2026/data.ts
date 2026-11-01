// Testimonials data: fetch once, normalise each row to one shape, then filter,
// sort and limit per the settings. Everything here is pure except `loadRows`.

import { splitTags, toText, type Settings } from './settings';

export interface Testimonial {
  id: string;
  quote: string;
  name: string;
  position: string;
  company: string;
  photo: string;
  dateMs: number | null;
  tags: string[];
  tagLabels: string[];
  consultantId: string;
  rating: number | null;
  order: number;
}

export interface Consultant {
  id: string;
  name: string;
  photo: string;
  path: string;
}

type Raw = Record<string, unknown>;

const MAX_RATING = 5;
const RATING_KEYS = ['rating', 'testimonialRating', 'starRating', 'stars'] as const;

/** http(s) or site-relative URLs only. Anything else (javascript:, data:, //host) renders as nothing. */
export function safeUrl(v: unknown): string {
  const s = typeof v === 'string' ? v.trim() : '';
  // Browsers read a backslash as a slash and drop tabs and newlines, so "/\evil.example" would become "//evil.example".
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
  const spaced = html.replace(/<\s*br\s*\/?>/gi, '\n').replace(/<\/\s*(p|div|li|h[1-6])\s*>/gi, '\n\n');
  const doc = new DOMParser().parseFromString(spaced, 'text/html');
  doc.querySelectorAll('script, style').forEach((el) => el.remove());
  return (doc.body.textContent ?? '').replace(/\n{3,}/g, '\n\n').trim();
}

export function parseRating(row: Raw): number | null {
  for (const key of RATING_KEYS) {
    const raw = row[key];
    if (raw === null || raw === undefined || raw === '') continue;
    const n = typeof raw === 'number' ? raw : parseFloat(String(raw));
    if (Number.isFinite(n) && n > 0 && n <= MAX_RATING) return Math.round(n * 10) / 10;
  }
  return null;
}

function parseDate(v: unknown): number | null {
  if (typeof v !== 'string' && typeof v !== 'number') return null;
  const ms = typeof v === 'number' ? v : Date.parse(v);
  return Number.isFinite(ms) ? ms : null;
}

function rowData(entry: unknown): Raw | null {
  if (!entry || typeof entry !== 'object') return null;
  const e = entry as Raw;
  const inner = e.data;
  return inner && typeof inner === 'object' ? (inner as Raw) : e;
}

export function normalise(entries: unknown): Testimonial[] {
  if (!Array.isArray(entries)) return [];
  const out: Testimonial[] = [];
  entries.forEach((entry, index) => {
    const row = rowData(entry);
    if (!row) return;
    const quote = plainText(row.content) || plainText(row.metaDescription);
    if (!quote) return;
    const labels = toText(row.tags)
      .split(/[,;|]/)
      .map((t) => t.trim())
      .filter(Boolean);
    out.push({
      id: toText(row.testimonialID, `row-${index}`) || `row-${index}`,
      quote,
      name: plainText(row.who) || plainText(row.testimonialName) || 'Anonymous',
      position: plainText(row.position),
      company: plainText(row.company),
      photo: safeUrl(row.photoURL),
      dateMs: parseDate(row.testimonialDate),
      tags: labels.map((t) => t.toLowerCase()),
      tagLabels: labels,
      consultantId: toText(row.consultantID).toLowerCase(),
      rating: parseRating(row),
      order: index,
    });
  });
  return out;
}

export function normaliseConsultants(entries: unknown): Map<string, Consultant> {
  const map = new Map<string, Consultant>();
  if (!Array.isArray(entries)) return map;
  for (const entry of entries) {
    const row = rowData(entry);
    if (!row) continue;
    const id = toText(row.consultantID).toLowerCase();
    if (!id) continue;
    const name = [plainText(row.firstName), plainText(row.lastName)].filter(Boolean).join(' ');
    let path = '';
    const url = safeUrl(row.consultantURL);
    if (url) {
      try {
        path = url.startsWith('/') ? url : new URL(url).pathname;
      } catch {
        path = '';
      }
    }
    map.set(id, { id, name, photo: safeUrl(row.photoURL), path });
  }
  return map;
}

export function filterTestimonials(items: Testimonial[], s: Pick<Settings, 'tags' | 'consultantId'>): Testimonial[] {
  return items.filter((t) => {
    if (s.consultantId && t.consultantId !== s.consultantId) return false;
    if (s.tags.length === 0) return true;
    return t.tags.some((tag) => s.tags.includes(tag));
  });
}

function shuffled<T>(items: T[], random: () => number): T[] {
  const a = items.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function sortTestimonials(items: Testimonial[], order: Settings['sortOrder'], random: () => number = Math.random): Testimonial[] {
  if (order === 'random') return shuffled(items, random);
  if (order === 'manual') return items.slice().sort((a, b) => a.order - b.order);
  const dir = order === 'oldest' ? 1 : -1;
  return items.slice().sort((a, b) => {
    if (a.dateMs === null && b.dateMs === null) return a.order - b.order;
    if (a.dateMs === null) return 1;
    if (b.dateMs === null) return -1;
    return a.dateMs === b.dateMs ? a.order - b.order : (a.dateMs - b.dateMs) * dir;
  });
}

export function limitTestimonials<T>(items: T[], max: number): T[] {
  return max > 0 ? items.slice(0, max) : items;
}

export function selectTestimonials(entries: unknown, s: Settings, random?: () => number): Testimonial[] {
  const filtered = filterTestimonials(normalise(entries), s);
  return limitTestimonials(sortTestimonials(filtered, s.sortOrder, random), s.maxTestimonials);
}

/** Distinct tags (original casing, first seen) across the chosen testimonials, for the filter chips. */
export function distinctTags(items: Testimonial[]): { key: string; label: string }[] {
  const seen = new Map<string, string>();
  for (const t of items) t.tags.forEach((key, i) => { if (!seen.has(key)) seen.set(key, t.tagLabels[i]); });
  return Array.from(seen, ([key, label]) => ({ key, label }));
}

export interface Sdk {
  ready?: (siteId: string, page: unknown) => unknown;
  register?: (name: string, config: unknown) => unknown;
  fetch?: (desc: { name: string }) => Promise<unknown>;
}

type Win = Window & { __shmTmFetch?: Record<string, Promise<unknown>> };

/** One fetch per collection per page, shared by every copy of the widget. The editor always refetches. */
export function loadRows(sdk: Sdk, collection: string, siteId: string, inEditor: boolean): Promise<unknown> {
  if (typeof sdk.fetch !== 'function') return Promise.reject(new Error('The Shazamme SDK did not load.'));
  const win = window as Win;
  const cache = (win.__shmTmFetch = win.__shmTmFetch ?? {});
  const key = `${siteId}::${collection}`;
  const hit = cache[key] as Promise<unknown> | undefined;
  if (!inEditor && hit) return hit;
  const p = Promise.resolve(sdk.fetch({ name: collection }));
  if (!inEditor) {
    cache[key] = p;
    p.catch(() => { delete cache[key]; });
  }
  return p;
}

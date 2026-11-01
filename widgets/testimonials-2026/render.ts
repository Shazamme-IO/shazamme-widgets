// HTML builders. Every piece of loaded data goes through esc() or safeUrl() before it
// reaches a string, and the only attribute values built from numbers are numeric.

import { safeUrl, type Consultant, type Testimonial } from './data';
import type { DateFormat, Settings } from './settings';

export function esc(v: unknown): string {
  return String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function initials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  const first = Array.from(words[0] ?? '')[0] ?? '';
  const last = words.length > 1 ? (Array.from(words[words.length - 1])[0] ?? '') : '';
  return (first + last).toUpperCase() || '?';
}

const STAR_ROW = '★★★★★';
const CHEVRON_LEFT = '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const CHEVRON_RIGHT = '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const PAUSE_ICON = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false"><path d="M8 5v14M16 5v14" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>';
const QUOTE_MARK = '“';

const pad2 = (n: number): string => String(n).padStart(2, '0');

/** YYYY-MM-DD in the visitor's local day, the same day the visible text shows. */
export function isoDay(ms: number): string {
  const d = new Date(ms);
  return Number.isNaN(d.getTime()) ? '' : `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

export function formatDate(ms: number, fmt: DateFormat, locale?: string): { text: string; iso: string } {
  const d = new Date(ms);
  const iso = isoDay(ms);
  const opts: Intl.DateTimeFormatOptions =
    fmt === 'long' ? { day: 'numeric', month: 'long', year: 'numeric' } : fmt === 'year' ? { year: 'numeric' } : { month: 'long', year: 'numeric' };
  try {
    return { text: new Intl.DateTimeFormat(locale || 'en-AU', opts).format(d), iso };
  } catch {
    return { text: String(d.getFullYear()), iso };
  }
}

export function starsHtml(rating: number): string {
  const pct = Math.round((rating / 5) * 100);
  return (
    `<span class="shm-tm-stars" role="img" aria-label="Rated ${esc(rating)} out of 5">` +
    `<span class="shm-tm-stars-off" aria-hidden="true">${STAR_ROW}</span>` +
    `<span class="shm-tm-stars-on" aria-hidden="true" style="width:${pct}%">${STAR_ROW}</span></span>`
  );
}

function photoHtml(t: Testimonial, s: Settings, extra = ''): string {
  if (!s.showPhoto) return '';
  const cls = extra ? `shm-tm-photo ${extra}` : 'shm-tm-photo';
  if (t.photo) {
    return `<span class="${cls}"><img src="${esc(t.photo)}" alt="" width="64" height="64" loading="lazy" decoding="async"></span>`;
  }
  return `<span class="${cls} shm-tm-initials" aria-hidden="true">${esc(initials(t.name))}</span>`;
}

export interface CardCtx {
  settings: Settings;
  consultants: Map<string, Consultant>;
  uid: string;
  locale?: string;
}

function consultantHtml(t: Testimonial, ctx: CardCtx): string {
  if (!ctx.settings.showConsultant) return '';
  const c = ctx.consultants.get(t.consultantId);
  if (!c || !c.name) return '';
  const label = ctx.settings.consultantLabel ? `${esc(ctx.settings.consultantLabel)}: ` : '';
  const path = safeUrl(c.path);
  const name = ctx.settings.linkConsultant && path ? `<a class="shm-tm-consultant-link" href="${esc(path)}">${esc(c.name)}</a>` : esc(c.name);
  return `<span class="shm-tm-consultant">${label}${name}</span>`;
}

export function personHtml(t: Testimonial, ctx: CardCtx): string {
  const s = ctx.settings;
  const role = s.showPosition && t.position ? `<span class="shm-tm-role">${esc(t.position)}</span>` : '';
  const company = s.showCompany && t.company ? `<span class="shm-tm-company">${esc(t.company)}</span>` : '';
  let date = '';
  if (s.showDate && t.dateMs !== null) {
    const f = formatDate(t.dateMs, s.dateFormat, ctx.locale);
    date = `<time class="shm-tm-date"${f.iso ? ` datetime="${esc(f.iso)}"` : ''}>${esc(f.text)}</time>`;
  }
  return (
    `<figcaption class="shm-tm-person">${photoHtml(t, s)}` +
    `<span class="shm-tm-meta"><cite class="shm-tm-name">${esc(t.name)}</cite>${role}${company}${date}${consultantHtml(t, ctx)}</span></figcaption>`
  );
}

export function cardHtml(t: Testimonial, index: number, ctx: CardCtx): string {
  const s = ctx.settings;
  const textId = `${ctx.uid}-q${index}`;
  const mark = s.showQuoteMark ? `<span class="shm-tm-mark" aria-hidden="true">${QUOTE_MARK}</span>` : '';
  const stars = s.showRating && t.rating !== null ? starsHtml(t.rating) : '';
  const more = s.readMore === 'off' ? '' : `<button type="button" class="shm-tm-more" aria-controls="${esc(textId)}" aria-expanded="false" hidden>${esc(s.readMoreText)}</button>`;
  return (
    `<figure class="shm-tm-card" data-index="${index}"><div class="shm-tm-body">${mark}${stars}` +
    `<blockquote class="shm-tm-quote"><p class="shm-tm-text" id="${esc(textId)}">${esc(t.quote)}</p></blockquote>${more}</div>` +
    `${personHtml(t, ctx)}</figure>`
  );
}

export function tagFilterHtml(tags: { key: string; label: string }[], s: Settings): string {
  if (!s.showTagFilter || tags.length < 2) return '';
  const chip = (key: string, label: string, on: boolean): string =>
    `<button type="button" class="shm-tm-chip" data-tag="${esc(key)}" aria-pressed="${on ? 'true' : 'false'}">${esc(label)}</button>`;
  return `<div class="shm-tm-filter" role="group" aria-label="Filter testimonials">${chip('', s.allTagsLabel, true)}${tags.map((t) => chip(t.key, t.label, false)).join('')}</div>`;
}

export function listHtml(items: Testimonial[], ctx: CardCtx): string {
  const cards = items.map((t, i) => `<li class="shm-tm-item" data-index="${i}">${cardHtml(t, i, ctx)}</li>`).join('');
  return `<ul class="shm-tm-grid" role="list">${cards}</ul>`;
}

export function loadMoreHtml(s: Settings): string {
  return `<div class="shm-tm-more-wrap"><button type="button" class="shm-tm-loadmore" hidden>${esc(s.loadMoreText)}</button></div>`;
}

export function carouselHtml(items: Testimonial[], ctx: CardCtx): string {
  const s = ctx.settings;
  const total = items.length;
  const slides = items
    .map(
      (t, i) =>
        `<div class="shm-tm-slide" role="group" aria-roledescription="slide" aria-label="${i + 1} of ${total}" data-index="${i}">${cardHtml(t, i, ctx)}</div>`,
    )
    .join('');
  const avatars = s.pagination === 'avatars';
  const dots = s.pagination === 'none' ? '' : `<div class="shm-tm-dots">${items.map((t, i) => dotHtml(t, i, s, avatars)).join('')}</div>`;
  const prev = s.arrows ? `<button type="button" class="shm-tm-btn shm-tm-prev" aria-label="Previous testimonial">${CHEVRON_LEFT}</button>` : '';
  const next = s.arrows ? `<button type="button" class="shm-tm-btn shm-tm-next" aria-label="Next testimonial">${CHEVRON_RIGHT}</button>` : '';
  const pause = s.autoplay ? `<button type="button" class="shm-tm-btn shm-tm-pause" aria-pressed="false" aria-label="Pause testimonials">${PAUSE_ICON}</button>` : '';
  return (
    `<div class="shm-tm-carousel${avatars ? ' has-avatars' : ''}" role="region" aria-roledescription="carousel" aria-label="${esc(s.ariaLabel)}">` +
    `<div class="shm-tm-track" tabindex="0" aria-live="off">${slides}</div>` +
    `<div class="shm-tm-controls">${prev}${dots}${next}${pause}</div></div>`
  );
}

function dotHtml(t: Testimonial, i: number, s: Settings, avatar: boolean): string {
  const label = `Show testimonial ${i + 1}`;
  const inner = avatar ? photoHtml(t, { ...s, showPhoto: true }, 'shm-tm-dot-photo') : '';
  return `<button type="button" class="shm-tm-dot${avatar ? ' is-avatar' : ''}" data-page="${i}" aria-label="${esc(avatar ? `${label}: ${t.name}` : label)}">${inner}</button>`;
}

export function dialogHtml(t: Testimonial, ctx: CardCtx, titleId: string, closeLabel: string): string {
  const stars = ctx.settings.showRating && t.rating !== null ? starsHtml(t.rating) : '';
  return (
    `<div class="shm-tm-dialog-backdrop" data-close></div>` +
    `<div class="shm-tm-dialog-panel" role="dialog" aria-modal="true" aria-labelledby="${esc(titleId)}">` +
    `<button type="button" class="shm-tm-dialog-close" aria-label="${esc(closeLabel)}">×</button>` +
    `<figure class="shm-tm-dialog-card">${stars}<blockquote class="shm-tm-dialog-quote"><p id="${esc(titleId)}">${esc(t.quote)}</p></blockquote>` +
    `${personHtml(t, ctx)}</figure></div>`
  );
}

const SCHEMA_BEST = 5;

/** schema.org Review/AggregateRating, built only from testimonials that carry a real rating. Null when there is nothing honest to say. */
export function schemaJsonLd(items: Testimonial[], s: Settings): string | null {
  if (!s.schemaEnabled || !s.schemaBusinessName) return null;
  const rated = items.filter((t) => t.rating !== null);
  if (rated.length === 0) return null;
  const sum = rated.reduce((acc, t) => acc + (t.rating ?? 0), 0);
  const graph = {
    '@context': 'https://schema.org',
    '@type': s.schemaBusinessType,
    name: s.schemaBusinessName,
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: Math.round((sum / rated.length) * 10) / 10,
      reviewCount: rated.length,
      bestRating: SCHEMA_BEST,
      worstRating: 1,
    },
    review: rated.map((t) => ({
      '@type': 'Review',
      author: { '@type': 'Person', name: t.name },
      reviewBody: t.quote,
      ...(t.dateMs !== null && isoDay(t.dateMs) ? { datePublished: isoDay(t.dateMs) } : {}),
      reviewRating: { '@type': 'Rating', ratingValue: t.rating, bestRating: SCHEMA_BEST, worstRating: 1 },
    })),
  };
  return JSON.stringify(graph).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
}

// HTML builders. Every piece of loaded data goes through esc() before it reaches a
// string, and links are built only from validated paths, emails and phone numbers.

import { initials, telHref, type Consultant } from './data';
import type { Settings } from './settings';

export function esc(v: unknown): string {
  return String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function liveRolesText(n: number, s: Pick<Settings, 'liveRolesOne' | 'liveRolesMany'>): string {
  return (n === 1 ? s.liveRolesOne : s.liveRolesMany).replace(/\{n\}/g, String(n));
}

function nameHtml(c: Consultant, s: Settings): string {
  return s.linkProfile && c.path
    ? `<a class="shm-cc-name" href="${esc(c.path)}">${esc(c.name)}</a>`
    : `<span class="shm-cc-name">${esc(c.name)}</span>`;
}

function contactHtml(c: Consultant, s: Settings): string {
  const phone = s.showPhone && c.phone ? telHref(c.phone) : '';
  const parts = [
    phone ? `<a class="shm-cc-phone" href="${esc(phone)}">${esc(c.phone)}</a>` : '',
    s.showEmail && c.email ? `<a class="shm-cc-email" href="mailto:${esc(c.email)}">${esc(c.email)}</a>` : '',
  ].filter(Boolean);
  return parts.length ? `<span class="shm-cc-contact">${parts.join('')}</span>` : '';
}

/** A line only when the count is real: unknown hides it, zero hides it unless the site builder asked to see it. */
function liveHtml(c: Consultant, s: Settings, counts: Map<string, number> | null): string {
  if (!s.showLiveRoles || counts === null) return '';
  const n = counts.get(c.id) ?? 0;
  if (n === 0 && !s.showZeroRoles) return '';
  return `<span class="shm-cc-live">${esc(liveRolesText(n, s))}</span>`;
}

export function cardHtml(c: Consultant, s: Settings, counts: Map<string, number> | null): string {
  const role = s.showRole && c.role ? `<span class="shm-cc-role">${esc(c.role)}</span>` : '';
  return (
    `<article class="shm-cc-card">` +
    `<span class="shm-cc-badge" aria-hidden="true">${esc(initials(c.name))}</span>` +
    `<span class="shm-cc-id">${nameHtml(c, s)}${role}</span>` +
    `${contactHtml(c, s)}${liveHtml(c, s, counts)}</article>`
  );
}

export function teamHtml(items: Consultant[], s: Settings, counts: Map<string, number> | null): string {
  const cards = items.map((c) => `<li class="shm-cc-item">${cardHtml(c, s, counts)}</li>`).join('');
  return `<ul class="shm-cc-grid" role="list" aria-label="${esc(s.ariaLabel)}">${cards}</ul>`;
}

export function jobHtml(c: Consultant, s: Settings, counts: Map<string, number> | null): string {
  const eyebrow = s.eyebrow ? `<span class="shm-cc-eyebrow">${esc(s.eyebrow)}</span>` : '';
  return `<section class="shm-cc-job" aria-label="${esc(s.eyebrow || s.ariaLabel)}">${eyebrow}${cardHtml(c, s, counts)}</section>`;
}

// HTML builders. Every piece of loaded data goes through esc() before it reaches a
// string, and links are built only from validated paths, emails, phone numbers and
// http(s) addresses. With every setting at its default the output is byte for byte the
// v0.1.65 card (golden.test.ts holds this): each new piece adds markup only when on.

import { initials, profileHref, telHref, type Consultant } from './data';
import { ICONS, SOCIAL_ICONS } from './icons';
import { SOCIAL_ORDER, type Item, type Settings } from './settings';

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

const NEW_TAB = ' target="_blank" rel="noopener"';

function targetAttr(s: Settings): string {
  return s.newTab ? NEW_TAB : '';
}

function nameHtml(c: Consultant, s: Settings): string {
  const href = profileHref(c, s.profilePage);
  return s.linkProfile && href
    ? `<a class="shm-cc-name" href="${esc(href)}"${targetAttr(s)}>${esc(c.name)}</a>`
    : `<span class="shm-cc-name">${esc(c.name)}</span>`;
}

/** The photo, the initials, or (photo only, no photo on file) a plain placeholder. Decorative: the name sits beside it. */
function avatarHtml(c: Consultant, s: Settings): string {
  const badge = `<span class="shm-cc-badge" aria-hidden="true">${esc(initials(c.name))}</span>`;
  if (s.avatar === 'initials') return badge;
  if (!c.photo) return s.avatar === 'photo' ? `<span class="shm-cc-photo is-missing" aria-hidden="true">${ICONS.person}</span>` : badge;
  return (
    `<span class="shm-cc-photo" aria-hidden="true" data-initials="${esc(initials(c.name))}">` +
    `<img class="shm-cc-photo-img" src="${esc(c.photo)}" alt="" width="64" height="64" loading="lazy" decoding="async"></span>`
  );
}

/** One contact link. Text only is the v0.1.65 markup; an icon adds a class and, without text, a name for screen readers. */
function contactLink(cls: string, href: string, text: string, item: Item, icon: string): string {
  if (!href || (!item.icon && !item.label)) return '';
  if (!item.icon) return `<a class="${cls}" href="${esc(href)}">${esc(text)}</a>`;
  const label = item.label ? `<span class="shm-cc-text">${esc(text)}</span>` : '';
  const named = item.label ? '' : ` aria-label="${esc(text)}"`;
  return `<a class="${cls} has-icon${item.label ? '' : ' is-icon-only'}" href="${esc(href)}"${named}>${icon}${label}</a>`;
}

function contactHtml(c: Consultant, s: Settings): string {
  const phone = s.mobile.show ? c.phoneOnly : c.phone;
  const shown = [
    s.phone.show && phone ? { item: s.phone, html: contactLink('shm-cc-phone', telHref(phone), phone, s.phone, ICONS.phone) } : null,
    s.mobile.show && c.mobile ? { item: s.mobile, html: contactLink('shm-cc-mobile', telHref(c.mobile), c.mobile, s.mobile, ICONS.mobile) } : null,
    s.email.show && c.email ? { item: s.email, html: contactLink('shm-cc-email', `mailto:${c.email}`, c.email, s.email, ICONS.email) } : null,
  ].filter((p): p is { item: Item; html: string } => Boolean(p && p.html));
  if (!shown.length) return '';
  const iconsOnly = shown.every((p) => !p.item.label);
  return `<span class="shm-cc-contact${iconsOnly ? ' is-icons' : ''}">${shown.map((p) => p.html).join('')}</span>`;
}

/** Social profiles open in a new tab. The accessible name starts with the visible text, then the consultant. */
function socialHtml(c: Consultant, s: Settings): string {
  const links = SOCIAL_ORDER.map((id) => {
    const cfg = s.socials[id];
    const url = c.socials[id];
    if (!cfg.show || !url || (!cfg.icon && !cfg.label)) return '';
    const text = cfg.label ? `<span class="shm-cc-text">${esc(cfg.text)}</span>` : '';
    return (
      `<a class="shm-cc-social-link shm-cc-${id}${cfg.label ? '' : ' is-icon-only'}" href="${esc(url)}" target="_blank" rel="noopener noreferrer" ` +
      `aria-label="${esc(`${cfg.text}: ${c.name}`)}">${cfg.icon ? SOCIAL_ICONS[id] : ''}${text}</a>`
    );
  }).filter(Boolean);
  return links.length ? `<span class="shm-cc-social">${links.join('')}</span>` : '';
}

function metaHtml(c: Consultant, s: Settings): string {
  const location = s.showLocation && c.locations.length
    ? `<span class="shm-cc-meta shm-cc-location">${s.showLocationIcon ? ICONS.location : ''}<span class="shm-cc-text">${esc(c.locations.join(', '))}</span></span>`
    : '';
  const sector = s.showSector && c.sectors.length ? `<span class="shm-cc-meta shm-cc-sector">${esc(c.sectors.join(', '))}</span>` : '';
  return location + sector;
}

function descriptionHtml(c: Consultant, s: Settings): string {
  if (!s.showDescription || !c.description) return '';
  const attrs = s.descriptionLines > 0 ? ` class="shm-cc-desc is-clamped" style="--shm-cc-lines: ${s.descriptionLines}"` : ` class="shm-cc-desc"`;
  return `<p${attrs}>${esc(c.description)}</p>`;
}

function buttonHtml(c: Consultant, s: Settings): string {
  const href = profileHref(c, s.profilePage);
  if (!s.showButton || !href) return '';
  return `<span class="shm-cc-actions"><a class="shm-cc-button" href="${esc(href)}"${targetAttr(s)}>${esc(s.buttonText)}</a></span>`;
}

/** A line only when the count is real: unknown hides it, zero hides it unless the site builder asked to see it. */
function liveHtml(c: Consultant, s: Settings, counts: Map<string, number> | null): string {
  if (!s.showLiveRoles || counts === null) return '';
  const n = counts.get(c.id);
  if (n === undefined || (n === 0 && !s.showZeroRoles)) return '';
  return `<span class="shm-cc-live">${esc(liveRolesText(n, s))}</span>`;
}

export function cardHtml(c: Consultant, s: Settings, counts: Map<string, number> | null): string {
  const role = s.showRole && c.role ? `<span class="shm-cc-role">${esc(c.role)}</span>` : '';
  return (
    `<article class="shm-cc-card">` +
    avatarHtml(c, s) +
    `<span class="shm-cc-id">${nameHtml(c, s)}${role}${metaHtml(c, s)}</span>` +
    `${descriptionHtml(c, s)}${contactHtml(c, s)}${socialHtml(c, s)}${liveHtml(c, s, counts)}${buttonHtml(c, s)}</article>`
  );
}

function itemsHtml(items: Consultant[], s: Settings, counts: Map<string, number> | null): string {
  return items.map((c) => `<li class="shm-cc-item">${cardHtml(c, s, counts)}</li>`).join('');
}

export function teamHtml(items: Consultant[], s: Settings, counts: Map<string, number> | null): string {
  return `<ul class="shm-cc-grid" role="list" aria-label="${esc(s.ariaLabel)}">${itemsHtml(items, s, counts)}</ul>`;
}

function controlButton(cls: string, hook: string, label: string, icon: string): string {
  return `<button type="button" class="shm-cc-arrow ${cls}" ${hook} aria-label="${esc(label)}">${icon}</button>`;
}

/** A scrolling row of the same cards. Arrows and the pause button are real buttons; the row itself scrolls with the keyboard. */
export function sliderHtml(items: Consultant[], s: Settings, counts: Map<string, number> | null): string {
  const pause = s.autoplay ? controlButton('shm-cc-pause', 'data-shm-cc-pause', s.pauseLabel, ICONS.pause) : '';
  const arrows = s.arrows
    ? controlButton('shm-cc-prev', 'data-shm-cc-prev', s.previousLabel, ICONS.previous) + controlButton('shm-cc-next', 'data-shm-cc-next', s.nextLabel, ICONS.next)
    : '';
  const controls = pause || arrows ? `<div class="shm-cc-controls">${pause}${arrows}</div>` : '';
  return (
    `<div class="shm-cc-slider" role="region" aria-roledescription="carousel" aria-label="${esc(s.ariaLabel)}">` +
    `<ul class="shm-cc-grid shm-cc-track" role="list" tabindex="0" aria-label="${esc(s.ariaLabel)}" data-shm-cc-track>${itemsHtml(items, s, counts)}</ul>` +
    `${controls}</div>`
  );
}

export function listHtml(items: Consultant[], s: Settings, counts: Map<string, number> | null): string {
  if (!items.length) return `<p class="shm-cc-empty shm-cc-nomatch">${esc(s.noMatchText)}</p>`;
  return s.layout === 'slider' ? sliderHtml(items, s, counts) : teamHtml(items, s, counts);
}

function filterGroup(kind: 'sector' | 'location', label: string, values: string[], s: Settings): string {
  if (!values.length) return '';
  const button = (value: string, text: string, pressed: boolean) =>
    `<button type="button" class="shm-cc-filter" aria-pressed="${pressed}" data-value="${esc(value.toLowerCase())}">${esc(text)}</button>`;
  return (
    `<div class="shm-cc-filters" role="group" aria-label="${esc(label)}" data-shm-cc-group="${kind}">` +
    button('', s.filterAllText, true) + values.map((v) => button(v, v, false)).join('') + `</div>`
  );
}

export interface ToolValues {
  sectors: string[];
  locations: string[];
}

/** The search box and the filter buttons above the list, and the region the list re-renders into. */
export function toolsHtml(uid: string, s: Settings, values: ToolValues, list: string): string {
  const search = s.showSearch
    ? `<div class="shm-cc-search"><label class="shm-cc-sr" for="${uid}-q">${esc(s.searchPlaceholder)}</label>` +
      `<input class="shm-cc-search-input" id="${uid}-q" type="search" placeholder="${esc(s.searchPlaceholder)}" autocomplete="off" data-shm-cc-search></div>`
    : '';
  const sectors = s.showClassificationFilter ? filterGroup('sector', s.classificationFilterLabel, values.sectors, s) : '';
  const locations = s.showLocationFilter ? filterGroup('location', s.locationFilterLabel, values.locations, s) : '';
  return (
    `<div class="shm-cc-tools">${search}${sectors}${locations}</div>` +
    `<div class="shm-cc-results" data-shm-cc-results>${list}</div>` +
    `<p class="shm-cc-sr" role="status" data-shm-cc-status></p>`
  );
}

export function jobHtml(c: Consultant, s: Settings, counts: Map<string, number> | null): string {
  const eyebrow = s.eyebrow ? `<span class="shm-cc-eyebrow">${esc(s.eyebrow)}</span>` : '';
  return `<section class="shm-cc-job" aria-label="${esc(s.eyebrow || s.ariaLabel)}">${eyebrow}${cardHtml(c, s, counts)}</section>`;
}

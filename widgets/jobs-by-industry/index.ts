// Jobs by Industry: a vertical tab list of the professions that have live jobs ("N live roles" under each name)
// beside a panel with the profession's name, a one-line blurb, a background image and up to four job cards.
// The tabs follow the WAI-ARIA tabs pattern (role=tablist, arrow keys, Home and End). Registered as
// window.ShazammeWidget["jobs-by-industry"].

import type { DudaData } from '../../core/config';
import { payLine } from '../../core/salary';
import { clampInt, esc, flag, listOf, loadSiteJobs, pick, safeUrl, text, type SiteJob } from '../../core/site-jobs';

interface WidgetContext {
  element: HTMLElement;
  data?: DudaData;
  shazamme?: unknown;
}

type LocationFormat = 'city-state' | 'city-country' | 'city-state-country';
type HeadingTag = 'h2' | 'h3' | 'h4' | 'h5' | 'p';

export interface Card {
  title: string;
  where: string;
  workType: string;
  workModel: string;
  pay: string;
  href: string;
}

export interface Industry {
  name: string;
  count: number;
  blurb: string;
  image: string;
  cards: Card[];
}

export interface Settings {
  maxProfessions: number;
  maxJobs: number;
  detailsPage: string;
  showSeeAll: boolean;
  seeAllText: string;
  seeAllUrl: string;
  countOne: string;
  countMany: string;
  locationFormat: LocationFormat;
  showSalary: boolean;
  ariaLabel: string;
  headingTag: HeadingTag;
  defaultImage: string;
  profiles: Map<string, { blurb: string; image: string }>;
}

const LOCATION_FORMATS: readonly LocationFormat[] = ['city-state', 'city-country', 'city-state-country'];
const HEADING_TAGS: readonly HeadingTag[] = ['h2', 'h3', 'h4', 'h5', 'p'];
const DEFAULT_DETAILS_PAGE = '/job-details';
const DEFAULT_SEE_ALL_URL = '/job-results';
const DEFAULT_SEE_ALL_TEXT = 'See all {count} roles';
const DEFAULT_COUNT_ONE = '{n} live role';
const DEFAULT_COUNT_MANY = '{n} live roles';
const MAX_PROFESSIONS_CAP = 30;
const MAX_JOBS_CAP = 12;
const EDITOR_NOTE = 'Jobs by Industry: this site has no live jobs yet, so there are no industries to show.';
const ARROW_SVG = '<svg aria-hidden="true" focusable="false" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 12L12 4M6 4h6v6"></path></svg>';

const runs = new WeakMap<HTMLElement, number>();
const teardowns = new WeakMap<HTMLElement, () => void>();

/** Detach the previous board's listeners. Only called once new content is ready, so a slow or failed reload leaves the old tabs working. */
function release(element: HTMLElement): void {
  teardowns.get(element)?.();
  teardowns.delete(element);
}
let uid = 0;

/** Decode a path segment that may already be percent-encoded, so it is not encoded twice. */
function safeDecode(seg: string): string {
  try {
    return decodeURIComponent(seg);
  } catch {
    return seg;
  }
}

const key = (name: string): string => name.trim().toLowerCase();
const fill = (template: string, token: string, value: string | number): string => template.split(token).join(String(value));

const INDUSTRY_FIELDS = ['name', 'blurb', 'image'] as const;

/** Industries from the {{#each industries}} source markup the HTML tab renders, used when the list setting is not an array. */
function industriesFromDom(root: Element): Array<Record<string, unknown>> {
  return [...root.querySelectorAll('.shm-jbi-src')].map((src) => {
    const item: Record<string, unknown> = {};
    for (const f of INDUSTRY_FIELDS) item[f] = src.querySelector(`[data-f="${f}"]`)?.textContent ?? '';
    return item;
  });
}

export function readSettings(config: Record<string, unknown>, root?: Element): Settings {
  const profiles = new Map<string, { blurb: string; image: string }>();
  const configured = listOf(config.industries);
  for (const item of configured.length || !root ? configured : industriesFromDom(root)) {
    const name = text(item.name);
    if (name) profiles.set(key(name), { blurb: text(item.blurb), image: safeUrl(item.image) });
  }
  const label = (v: unknown, fallback: string): string => text(v) || fallback;
  return {
    maxProfessions: clampInt(config.maxProfessions, 6, 1, MAX_PROFESSIONS_CAP),
    maxJobs: clampInt(config.maxJobs, 4, 1, MAX_JOBS_CAP),
    detailsPage: (safeUrl(config.detailsPage) || DEFAULT_DETAILS_PAGE).replace(/\/+$/, ''),
    showSeeAll: flag(config.showSeeAll, true),
    seeAllText: label(config.seeAllText, DEFAULT_SEE_ALL_TEXT),
    seeAllUrl: safeUrl(config.seeAllUrl) || DEFAULT_SEE_ALL_URL,
    countOne: label(config.countOne, DEFAULT_COUNT_ONE),
    countMany: label(config.countMany, DEFAULT_COUNT_MANY),
    locationFormat: pick(config.locationFormat, LOCATION_FORMATS, 'city-state'),
    showSalary: flag(config.showSalary, true),
    ariaLabel: label(config.ariaLabel, 'Industries'),
    headingTag: pick(config.headingTag, HEADING_TAGS, 'h3'),
    defaultImage: safeUrl(config.defaultImage),
    profiles,
  };
}

/** Salary from the advert: the from and to figures with the recruiter's wording ("+ super") after them. */
export const payFor = (f: Record<string, unknown>): string => payLine(f);

export function whereFor(f: Record<string, unknown>, format: LocationFormat): string {
  const parts = [text(f.city)];
  if (format !== 'city-country') parts.push(text(f.state));
  if (format !== 'city-state') parts.push(text(f.country));
  return parts.filter(Boolean).join(', ');
}

function newestFirst(a: SiteJob, b: SiteJob): number {
  const when = (j: SiteJob): number => Date.parse(text(j.fields.addedOnUTC) || text(j.fields.changedOnUTC) || '') || 0;
  return when(b) - when(a);
}

/** Professions with live jobs, most roles first then A to Z, each with its newest jobs as cards. */
export function buildIndustries(jobs: readonly SiteJob[], s: Settings): Industry[] {
  const groups = new Map<string, SiteJob[]>();
  for (const j of jobs) {
    const name = text(j.fields.category);
    if (!name || !j.pageItemUrl) continue;
    const list = groups.get(name);
    if (list) list.push(j);
    else groups.set(name, [j]);
  }
  return [...groups.entries()]
    .sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0]))
    .slice(0, s.maxProfessions)
    .map(([name, list]) => {
      const profile = s.profiles.get(key(name));
      const cards = [...list].sort(newestFirst).slice(0, s.maxJobs).map((j): Card => ({
        title: text(j.fields.jobName),
        where: whereFor(j.fields, s.locationFormat),
        workType: text(j.fields.workType),
        workModel: text(j.fields.workModel),
        pay: s.showSalary ? payFor(j.fields) : '',
        href: `${s.detailsPage}/${j.pageItemUrl.split('/').map((seg) => encodeURIComponent(safeDecode(seg))).join('/')}`,
      }));
      return { name, count: list.length, blurb: profile?.blurb ?? '', image: profile?.image || s.defaultImage, cards };
    });
}

function cardHtml(c: Card): string {
  const chips = [c.workType && `<span class="shm-jbi-tag is-type">${esc(c.workType)}</span>`, c.workModel && `<span class="shm-jbi-tag is-model">${esc(c.workModel)}</span>`]
    .filter(Boolean)
    .join('');
  return (
    `<a class="shm-jbi-card" href="${esc(c.href)}">` +
    `<span class="shm-jbi-card-title">${esc(c.title)}</span>` +
    (c.where ? `<span class="shm-jbi-card-where">${esc(c.where)}</span>` : '') +
    (chips ? `<span class="shm-jbi-tags">${chips}</span>` : '') +
    (c.pay ? `<span class="shm-jbi-card-pay">${esc(c.pay)}</span>` : '') +
    '</a>'
  );
}

function panelHtml(i: Industry, s: Settings): string {
  const tag = s.headingTag;
  return (
    (i.image ? `<img class="shm-jbi-bg" src="${esc(i.image)}" alt="" loading="lazy" decoding="async">` : '') +
    '<div class="shm-jbi-panel-body">' +
    `<${tag} class="shm-jbi-title">${esc(i.name)}</${tag}>` +
    (i.blurb ? `<p class="shm-jbi-blurb">${esc(i.blurb)}</p>` : '') +
    `<div class="shm-jbi-cards">${i.cards.map(cardHtml).join('')}</div>` +
    '</div>'
  );
}

function countLabel(n: number, s: Settings): string {
  return fill(n === 1 ? s.countOne : s.countMany, '{n}', n);
}

function tabHtml(i: Industry, index: number, id: string, s: Settings): string {
  return (
    `<button type="button" role="tab" class="shm-jbi-tab" id="${id}-tab-${index}" aria-selected="false" aria-controls="${id}-panel" tabindex="-1">` +
    `<span class="shm-jbi-tab-text"><span class="shm-jbi-tab-name">${esc(i.name)}</span><span class="shm-jbi-tab-count">${esc(countLabel(i.count, s))}</span></span>` +
    `${ARROW_SVG}</button>`
  );
}

function mountBoard(stage: HTMLElement, industries: readonly Industry[], total: number, s: Settings): () => void {
  const id = `shm-jbi-${(uid += 1)}`;
  const seeAll = s.showSeeAll
    ? `<div class="shm-jbi-top"><a class="shm-jbi-all shm-btn" href="${esc(s.seeAllUrl)}">${esc(fill(s.seeAllText, '{count}', total))}</a></div>`
    : '';
  stage.innerHTML =
    seeAll +
    '<div class="shm-jbi-board">' +
    `<div class="shm-jbi-tabs" role="tablist" aria-label="${esc(s.ariaLabel)}">${industries.map((i, n) => tabHtml(i, n, id, s)).join('')}</div>` +
    `<div class="shm-jbi-panel" role="tabpanel" id="${id}-panel"></div>` +
    '</div>';

  const tabs = [...stage.querySelectorAll<HTMLButtonElement>('.shm-jbi-tab')];
  const panel = stage.querySelector<HTMLElement>('.shm-jbi-panel')!;

  const select = (index: number, focus: boolean): void => {
    tabs.forEach((tab, n) => {
      const on = n === index;
      tab.setAttribute('aria-selected', on ? 'true' : 'false');
      tab.tabIndex = on ? 0 : -1;
      tab.classList.toggle('is-active', on);
    });
    panel.setAttribute('aria-labelledby', tabs[index].id);
    panel.innerHTML = panelHtml(industries[index], s);
    if (focus) {
      tabs[index].focus();
      if (typeof tabs[index].scrollIntoView === 'function') tabs[index].scrollIntoView({ block: 'nearest', inline: 'nearest' });
    }
  };

  const onClick = (e: Event): void => {
    const tab = (e.target as Element).closest<HTMLButtonElement>('.shm-jbi-tab');
    if (tab && tabs.includes(tab)) select(tabs.indexOf(tab), false);
  };
  const onKey = (e: KeyboardEvent): void => {
    const current = tabs.indexOf((e.target as Element).closest<HTMLButtonElement>('.shm-jbi-tab') as HTMLButtonElement);
    if (current < 0) return;
    const last = tabs.length - 1;
    const moves: Record<string, number> = {
      ArrowDown: current === last ? 0 : current + 1,
      ArrowRight: current === last ? 0 : current + 1,
      ArrowUp: current === 0 ? last : current - 1,
      ArrowLeft: current === 0 ? last : current - 1,
      Home: 0,
      End: last,
    };
    if (!(e.key in moves)) return;
    e.preventDefault();
    select(moves[e.key], true);
  };
  const list = stage.querySelector('.shm-jbi-tabs')!;
  list.addEventListener('click', onClick);
  list.addEventListener('keydown', onKey as EventListener);
  select(0, false);
  return () => {
    list.removeEventListener('click', onClick);
    list.removeEventListener('keydown', onKey as EventListener);
  };
}

function showNote(element: HTMLElement, root: HTMLElement, stage: HTMLElement, inEditor: boolean, note: string): void {
  release(element);
  root.classList.add('is-empty', 'is-ready');
  stage.innerHTML = inEditor ? `<p class="shm-jbi-empty">${esc(note)}</p>` : '';
}

export default async function jobsByIndustry(ctx: WidgetContext): Promise<void> {
  const { element, data } = ctx;
  const root = element.querySelector<HTMLElement>('.shm-jbi');
  const stage = root?.querySelector<HTMLElement>('.shm-jbi-stage');
  if (!root || !stage) return;
  const inEditor = !!data?.inEditor;
  const run = (runs.get(element) ?? 0) + 1;
  runs.set(element, run);
  const s = readSettings(data?.config ?? {}, root);

  try {
    const jobs = await loadSiteJobs(ctx.shazamme, data, inEditor);
    if (runs.get(element) !== run) return;
    const industries = buildIndustries(jobs, s);
    if (!industries.length) return showNote(element, root, stage, inEditor, EDITOR_NOTE);
    root.classList.remove('is-empty');
    release(element);
    teardowns.set(element, mountBoard(stage, industries, jobs.length, s));
    root.classList.add('is-ready');
  } catch (err) {
    if (runs.get(element) !== run) return;
    console.error('[jobs-by-industry]', err);
    showNote(element, root, stage, inEditor, EDITOR_NOTE);
  }
}

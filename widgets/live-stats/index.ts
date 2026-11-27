// Live Stats: a bento grid of stat tiles. Each tile has a number, a label and a short line. The number is
// typed in, or live from the site's own data: open roles, industries, countries or visible consultants.
// A live tile with no data is left out; nothing is invented. Registered as window.ShazammeWidget["live-stats"].

import type { DudaData } from '../../core/config';
import {
  clampInt,
  distinct,
  esc,
  loadSiteJobs,
  loadVisibleConsultantCount,
  pick,
  safeUrl,
  text,
  type SiteJob,
} from '../../core/site-jobs';

interface WidgetContext {
  element: HTMLElement;
  data?: DudaData;
  shazamme?: unknown;
}

export type Source = 'jobs' | 'industries' | 'countries' | 'consultants' | 'custom';
type TileStyle = 'dark' | 'accent';

export interface Tile {
  source: Source;
  value: string;
  suffix: string;
  label: string;
  text: string;
  wide: boolean;
  style: TileStyle;
  linkText: string;
  linkUrl: string;
}

const SOURCES: readonly Source[] = ['jobs', 'industries', 'countries', 'consultants', 'custom'];
const STYLES: readonly TileStyle[] = ['dark', 'accent'];
const MAX_TILES = 12;
const TILE_FIELDS = ['source', 'value', 'suffix', 'label', 'text', 'size', 'style', 'linkText', 'linkUrl'] as const;
const EDITOR_NOTE = 'Live Stats: add at least one tile in the Content editor. A live number only appears once the site has jobs (or consultants) to count.';

const runs = new WeakMap<HTMLElement, number>();
const numberFormat = new Intl.NumberFormat('en');

function listFromSetting(v: unknown): unknown[] {
  if (Array.isArray(v)) return v;
  if (typeof v === 'string' && v.trim().startsWith('[')) {
    try {
      const parsed: unknown = JSON.parse(v);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

/** Tiles from the {{#each tiles}} source markup the HTML tab renders, used when the list setting is not an array. */
function tilesFromDom(root: Element): unknown[] {
  return [...root.querySelectorAll('.shm-ls-src')].map((src) => {
    const item: Record<string, string> = {};
    for (const f of TILE_FIELDS) item[f] = src.querySelector(`[data-f="${f}"]`)?.textContent ?? '';
    return item;
  });
}

export function normaliseTiles(list: unknown[]): Tile[] {
  const tiles: Tile[] = [];
  for (const item of list) {
    if (tiles.length >= MAX_TILES) break;
    const raw = (item && typeof item === 'object' ? item : {}) as Record<string, unknown>;
    const tile: Tile = {
      source: pick(raw.source, SOURCES, 'custom'),
      value: text(raw.value),
      suffix: text(raw.suffix),
      label: text(raw.label),
      text: text(raw.text),
      wide: clampInt(raw.size, 1, 1, 2) === 2,
      style: pick(raw.style, STYLES, 'dark'),
      linkText: text(raw.linkText),
      linkUrl: safeUrl(raw.linkUrl),
    };
    if (tile.source !== 'custom' || tile.value || tile.label || tile.text) tiles.push(tile);
  }
  return tiles;
}

export interface Counts {
  jobs: number | null;
  industries: number | null;
  countries: number | null;
  consultants: number | null;
}

export function countsFromJobs(jobs: readonly SiteJob[]): Pick<Counts, 'jobs' | 'industries' | 'countries'> {
  return {
    jobs: jobs.length,
    industries: distinct(jobs, 'category').length,
    countries: distinct(jobs, 'country').length,
  };
}

/** The number a tile shows, or null when it has no data and must be left out. */
export function numberFor(tile: Tile, counts: Counts): string | null {
  if (tile.source === 'custom') return tile.value;
  const n = counts[tile.source];
  return n && n > 0 ? numberFormat.format(n) : null;
}

function tileHtml(tile: Tile, number: string): string {
  const eyebrow = tile.style === 'dark' && tile.wide && !!tile.label;
  const label = tile.label ? `<div class="shm-ls-label">${esc(tile.label)}</div>` : '';
  const suffix = tile.suffix ? `<span class="shm-ls-suffix">${esc(tile.suffix)}</span>` : '';
  const value = number || suffix ? `<div class="shm-ls-number">${esc(number)}${suffix}</div>` : '';
  const line = tile.text ? `<p class="shm-ls-text">${esc(tile.text)}</p>` : '';
  const link = tile.linkText && tile.linkUrl ? `<a class="shm-ls-link shm-btn" href="${esc(tile.linkUrl)}">${esc(tile.linkText)}</a>` : '';
  const main = `<div class="shm-ls-main">${value}${eyebrow ? '' : label}${line}</div>`;
  const classes = ['shm-ls-tile', tile.style === 'accent' ? 'is-accent' : 'is-dark', tile.wide ? 'is-wide' : ''].filter(Boolean).join(' ');
  return `<li class="${classes}">${eyebrow ? label : ''}${main}${link}</li>`;
}

async function liveCounts(ctx: WidgetContext, tiles: readonly Tile[], inEditor: boolean): Promise<Counts> {
  const counts: Counts = { jobs: null, industries: null, countries: null, consultants: null };
  const needsJobs = tiles.some((t) => t.source === 'jobs' || t.source === 'industries' || t.source === 'countries');
  const needsConsultants = tiles.some((t) => t.source === 'consultants');
  const [jobs, consultants] = await Promise.all([
    needsJobs ? loadSiteJobs(ctx.shazamme, ctx.data, inEditor).catch((e: unknown) => { console.error('[live-stats] jobs', e); return null; }) : null,
    needsConsultants ? loadVisibleConsultantCount(ctx.shazamme, ctx.data).catch((e: unknown) => { console.error('[live-stats] consultants', e); return null; }) : null,
  ]);
  return { ...counts, ...(jobs ? countsFromJobs(jobs) : {}), consultants };
}

export default async function liveStats(ctx: WidgetContext): Promise<void> {
  const { element, data } = ctx;
  const root = element.querySelector<HTMLElement>('.shm-ls');
  const grid = root?.querySelector<HTMLElement>('.shm-ls-grid');
  if (!root || !grid) return;
  const inEditor = !!data?.inEditor;
  const run = (runs.get(element) ?? 0) + 1;
  runs.set(element, run);

  const config = data?.config ?? {};
  let tiles = normaliseTiles(listFromSetting(config.tiles));
  if (!tiles.length) tiles = normaliseTiles(tilesFromDom(root));

  const counts = await liveCounts(ctx, tiles, inEditor);
  if (runs.get(element) !== run) return;

  const html = tiles
    .map((t) => ({ t, n: numberFor(t, counts) }))
    .filter((x): x is { t: Tile; n: string } => x.n !== null)
    .map((x) => tileHtml(x.t, x.n))
    .join('');
  grid.innerHTML = html || (inEditor ? `<li class="shm-ls-empty">${esc(EDITOR_NOTE)}</li>` : '');
  root.classList.toggle('is-empty', !html);
  root.classList.add('is-ready');
}

// Flip Cards settings: every data.config key the widget reads, coerced once.
// Duda hands settings over as strings (toggles may arrive as booleans, lists as
// arrays, images and links as objects), so each reader accepts all of those.

export const FLIP_STYLES = ['flip', 'fade', 'none'] as const;
export const HEIGHT_MODES = ['fixed', 'min', 'aspect'] as const;
export const HEADING_TAGS = ['h2', 'h3', 'h4', 'h5', 'p', 'div'] as const;
export const ASPECTS = ['1:1', '4:3', '3:2', '16:9', '5:4', '4:5', '3:4', '2:3', '9:16'] as const;
export const CARD_FIELDS = ['image', 'alt', 'title', 'frontLine', 'backHeading', 'backText', 'link', 'buttonText'] as const;

export type FlipStyle = (typeof FLIP_STYLES)[number];
export type HeightMode = (typeof HEIGHT_MODES)[number];
export type HeadingTag = (typeof HEADING_TAGS)[number];
export type CardField = (typeof CARD_FIELDS)[number];
export type Card = Record<CardField, string>;

export const MAX_COLUMNS = 6;
export const MAX_CARDS = 60;

export interface BreakpointSettings {
  key: 'd' | 't' | 'm';
  columns: number;
  gap: number;
  mode: HeightMode;
  height: number;
  aspect: string;
}

export interface Settings {
  cards: Card[];
  flipStyle: FlipStyle;
  vertical: boolean;
  hoverFlip: boolean;
  newTab: boolean;
  headingTag: HeadingTag;
  fillColumn: boolean;
  stretchLastRow: boolean;
  speedMs: number;
  radius: [number, number, number, number];
  breakpoints: BreakpointSettings[];
}

type Config = Record<string, unknown>;

const BREAKPOINTS = [
  { key: 'd', name: 'Desktop', columns: 3, gap: 24, mode: 'aspect', height: 380 },
  { key: 't', name: 'Tablet', columns: 2, gap: 20, mode: 'aspect', height: 340 },
  { key: 'm', name: 'Mobile', columns: 1, gap: 16, mode: 'min', height: 320 },
] as const;

export function toBool(v: unknown, fallback: boolean): boolean {
  if (v === true || v === 'true') return true;
  if (v === false || v === 'false') return false;
  return fallback;
}

export function toInt(v: unknown, fallback: number, min: number, max: number): number {
  const n = parseInt(String(v), 10);
  return Number.isNaN(n) ? fallback : Math.max(min, Math.min(max, n));
}

export function choice<T extends string>(v: unknown, allowed: readonly T[], fallback: T): T {
  const s = String(v ?? '').trim().toLowerCase();
  return (allowed as readonly string[]).includes(s) ? (s as T) : fallback;
}

/** Duda hands an image or link over as a string or as an object holding one. */
export function text(v: unknown): string {
  if (v == null) return '';
  if (typeof v === 'object') {
    const o = v as Record<string, unknown>;
    return text(o.url || o.src || o.href || o.link || '');
  }
  return String(v).trim();
}

/** http(s), mailto:, tel:, a relative path or a #anchor. Any other scheme, and protocol-relative (//, /\), is dropped. */
export function safeUrl(v: unknown): string {
  const s = text(v);
  if (!s || /[\u0000-\u001f\u007f]/.test(s)) return '';
  if (/^[/\\]{2}/.test(s) || s.startsWith('\\')) return '';
  if (/^[a-z][a-z0-9+.-]*:/i.test(s)) return /^(https?|mailto|tel):/i.test(s) ? s : '';
  return s;
}

function listFrom(v: unknown): unknown[] {
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

export function normaliseCards(list: unknown[]): Card[] {
  const out: Card[] = [];
  for (const item of list) {
    if (out.length >= MAX_CARDS) break;
    const raw = (item ?? {}) as Record<string, unknown>;
    const card: Card = {
      image: safeUrl(raw.image),
      alt: text(raw.alt),
      title: text(raw.title),
      frontLine: text(raw.frontLine),
      backHeading: text(raw.backHeading),
      backText: text(raw.backText),
      link: safeUrl(raw.link),
      buttonText: text(raw.buttonText),
    };
    if (card.image || card.title || card.frontLine || card.backHeading || card.backText) out.push(card);
  }
  return out;
}

/** Cards from the {{#each cards}} source markup the HTML tab renders, used when the list setting is not an array. */
export function cardsFromDom(root: Element): unknown[] {
  return [...root.querySelectorAll('.shm-fc-src')].map((src) => {
    const item: Record<string, string> = {};
    for (const f of CARD_FIELDS) item[f] = src.querySelector(`[data-f="${f}"]`)?.textContent ?? '';
    return item;
  });
}

export function readSettings(config: Config, root: Element): Settings {
  let cards = normaliseCards(listFrom(config.cards));
  if (!cards.length) cards = normaliseCards(cardsFromDom(root));
  const corner = (key: string) => toInt(config[key], 16, 0, 400);
  return {
    cards,
    flipStyle: choice(config.flipStyle, FLIP_STYLES, 'flip'),
    vertical: choice(config.flipDirection, ['horizontal', 'vertical'] as const, 'horizontal') === 'vertical',
    hoverFlip: toBool(config.flipOnHover, true),
    newTab: toBool(config.openInNewTab, false),
    headingTag: choice(config.headingTag, HEADING_TAGS, 'h3'),
    fillColumn: toBool(config.fillColumn, false),
    stretchLastRow: toBool(config.stretchLastRow, false),
    speedMs: toInt(config.flipSpeed, 600, 0, 3000),
    radius: [corner('radiusTopLeft'), corner('radiusTopRight'), corner('radiusBottomRight'), corner('radiusBottomLeft')],
    breakpoints: BREAKPOINTS.map((bp) => ({
      key: bp.key,
      columns: toInt(config[`columns${bp.name}`], bp.columns, 1, MAX_COLUMNS),
      gap: toInt(config[`gap${bp.name}`], bp.gap, 0, 120),
      mode: choice(config[`heightMode${bp.name}`], HEIGHT_MODES, bp.mode),
      height: toInt(config[`height${bp.name}`], bp.height, 80, 1600),
      aspect: choice(config[`aspect${bp.name}`], ASPECTS, '4:5'),
    })),
  };
}

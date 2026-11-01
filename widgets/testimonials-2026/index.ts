// Testimonials 2026: slider, grid, list and featured-quote layouts for the Shazamme
// "Testimonials" collection. No jQuery, no slick. Registered by the build as
// window.ShazammeWidget["testimonials-2026"]; Duda's loader stub calls the default
// export with { element, data, $, shazamme }. Looks come from the CSS in Duda's CSS tabs.

import type { DudaData } from '../../core/config';
import {
  distinctTags,
  loadRows,
  normaliseConsultants,
  selectTestimonials,
  type Consultant,
  type Sdk,
  type Testimonial,
} from './data';
import { mountCarousel, prefersReducedMotion, type Carousel } from './carousel';
import { openDialog } from './dialog';
import { carouselHtml, cardHtml, dialogHtml, esc, listHtml, loadMoreHtml, schemaJsonLd, tagFilterHtml, type CardCtx } from './render';
import { readSettings, type Settings } from './settings';

interface WidgetContext {
  element: HTMLElement;
  data?: DudaData;
  shazamme?: unknown;
}

type Destroyable = HTMLElement & { __shmTmDestroy?: () => void };

const COLLECTION = 'Testimonials';
const CONSULTANTS = 'Consultants';
const WIDGET_NAME = 'testimonials-2026';
const FALLBACK_CHARS_PER_LINE = 90;
const GENERIC_ERROR = 'The testimonials could not be loaded.';
let instanceCounter = 0;

function ensureShell(element: HTMLElement): { root: HTMLElement; stage: HTMLElement } {
  let root = element.querySelector<HTMLElement>('.shm-tm');
  if (!root) {
    root = document.createElement('div');
    root.className = 'shm-tm';
    element.appendChild(root);
  }
  let stage = root.querySelector<HTMLElement>('.shm-tm-stage');
  if (!stage) {
    stage = document.createElement('div');
    stage.className = 'shm-tm-stage';
    root.appendChild(stage);
  }
  return { root, stage };
}

function applyShell(root: HTMLElement, s: Settings): void {
  Array.from(root.classList)
    .filter((c) => c.startsWith('is-layout-'))
    .forEach((c) => root.classList.remove(c));
  root.classList.add(`is-layout-${s.layout}`);
  root.classList.remove('is-ready', 'is-empty');
  root.hidden = false;
  root.style.setProperty('--shm-tm-cols-d', String(s.columnsDesktop));
  root.style.setProperty('--shm-tm-cols-t', String(s.columnsTablet));
  root.style.setProperty('--shm-tm-cols-m', String(s.columnsMobile));
  root.style.setProperty('--shm-tm-lines', s.quoteLines > 0 && s.readMore !== 'off' ? String(s.quoteLines) : 'none');

  const heading = root.querySelector<HTMLElement>('.shm-tm-heading');
  if (heading) {
    const wanted = `h${s.headingLevel}`;
    let h = heading;
    if (heading.tagName.toLowerCase() !== wanted) {
      h = document.createElement(wanted);
      h.className = heading.className;
      h.textContent = heading.textContent;
      heading.replaceWith(h);
    }
    h.hidden = !(h.textContent ?? '').trim();
  }
  const intro = root.querySelector<HTMLElement>('.shm-tm-intro');
  if (intro) intro.hidden = !(intro.textContent ?? '').trim();
}

function showEditorNote(root: HTMLElement, stage: HTMLElement, inEditor: boolean, message: string): void {
  stage.innerHTML = inEditor ? `<div class="shm-tm-editor-note" role="note">Testimonials 2026: ${esc(message)}</div>` : '';
  root.classList.add('is-ready');
  if (!inEditor) {
    root.classList.add('is-empty');
    root.hidden = true;
  }
}

function emptyMessage(s: Settings, total: number): string {
  if (total === 0) return 'the Testimonials collection has no rows yet. Add testimonials in the Shazamme console.';
  const parts: string[] = [];
  if (s.tags.length) parts.push(`Tags "${s.tags.join(', ')}"`);
  if (s.consultantId) parts.push('the Consultant ID filter');
  return `no testimonials match ${parts.join(' and ') || 'the current settings'}. Clear the filter to show all ${total}.`;
}

function measureOverflow(card: HTMLElement, chars: number, lines: number): boolean {
  const text = card.querySelector<HTMLElement>('.shm-tm-text');
  if (!text) return false;
  if (text.clientHeight > 0) return text.scrollHeight > text.clientHeight + 1;
  return chars > lines * FALLBACK_CHARS_PER_LINE;
}

class Instance {
  private carousel: Carousel | undefined;
  private readonly ac = new AbortController();
  private resizeObs: ResizeObserver | undefined;
  private dialog: { close(): void } | undefined;
  private visible = 0;
  private activeTag = '';

  constructor(
    private readonly root: HTMLElement,
    private readonly stage: HTMLElement,
    private readonly s: Settings,
    private readonly items: Testimonial[],
    private readonly consultants: Map<string, Consultant>,
  ) {}

  render(): void {
    const { root, stage, s, items } = this;
    const ctx: CardCtx = {
      settings: s,
      consultants: this.consultants,
      uid: `shm-tm-${++instanceCounter}`,
      locale: document.documentElement.lang || undefined,
    };
    const carousel = s.layout === 'slider' || s.layout === 'featured';
    const filter = carousel ? '' : tagFilterHtml(distinctTags(items), s);
    const body = carousel ? carouselHtml(items, ctx) : `${filter}<div class="shm-tm-list" role="region" aria-label="${esc(s.ariaLabel)}">${listHtml(items, ctx)}${s.pageSize > 0 ? loadMoreHtml(s) : ''}</div>`;
    const ld = schemaJsonLd(items, s);
    stage.innerHTML = body + (ld ? `<script type="application/ld+json">${ld}</script>` : '');
    root.classList.add('is-ready');

    this.wire(ctx);
    if (carousel) {
      const el = stage.querySelector<HTMLElement>('.shm-tm-carousel');
      if (el) this.carousel = mountCarousel({ root: el, loop: s.loop, autoplayMs: s.autoplay ? s.autoplaySeconds * 1000 : 0, reducedMotion: prefersReducedMotion() });
    } else {
      this.visible = s.pageSize > 0 ? s.pageSize : items.length;
      this.applyVisibility();
    }
    this.refreshReadMore();
    if (typeof ResizeObserver === 'function') {
      let last = stage.clientWidth;
      this.resizeObs = new ResizeObserver(() => {
        if (stage.clientWidth === last) return;
        last = stage.clientWidth;
        this.refreshReadMore();
      });
      this.resizeObs.observe(stage);
    }
  }

  private wire(ctx: CardCtx): void {
    const { stage } = this;
    const { signal } = this.ac;
    stage.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      const more = target.closest<HTMLElement>('.shm-tm-more');
      if (more) return this.onReadMore(more, ctx);
      const chip = target.closest<HTMLElement>('.shm-tm-chip');
      if (chip) return this.onChip(chip);
      if (target.closest('.shm-tm-loadmore')) {
        this.visible += this.s.pageSize;
        this.applyVisibility();
      }
    }, { signal });
    stage.addEventListener('error', (e) => {
      const img = e.target;
      if (!(img instanceof HTMLImageElement)) return;
      const photo = img.parentElement;
      if (!photo) return;
      const card = img.closest<HTMLElement>('.shm-tm-card, .shm-tm-dot');
      const name = card?.querySelector('.shm-tm-name')?.textContent ?? img.closest('.shm-tm-dot')?.getAttribute('aria-label') ?? '';
      photo.classList.add('shm-tm-initials');
      photo.setAttribute('aria-hidden', 'true');
      photo.textContent = initialsOf(name);
    }, { capture: true, signal });
  }

  private onReadMore(btn: HTMLElement, ctx: CardCtx): void {
    const card = btn.closest<HTMLElement>('.shm-tm-card');
    if (!card) return;
    if (this.s.readMore === 'expand') {
      const open = card.classList.toggle('is-expanded');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      btn.textContent = open ? this.s.readLessText : this.s.readMoreText;
      return;
    }
    const item = this.items[Number(card.getAttribute('data-index'))];
    if (!item) return;
    this.dialog?.close();
    const titleId = `${ctx.uid}-dialog`;
    this.dialog = openDialog(dialogHtml(item, ctx, titleId, 'Close testimonial'), btn, () => { this.dialog = undefined; });
  }

  private onChip(chip: HTMLElement): void {
    this.activeTag = chip.getAttribute('data-tag') ?? '';
    this.stage.querySelectorAll<HTMLElement>('.shm-tm-chip').forEach((c) => c.setAttribute('aria-pressed', c === chip ? 'true' : 'false'));
    this.visible = this.s.pageSize > 0 ? this.s.pageSize : this.items.length;
    this.applyVisibility();
  }

  private applyVisibility(): void {
    const rows = Array.from(this.stage.querySelectorAll<HTMLElement>('.shm-tm-item'));
    let matched = 0;
    rows.forEach((row) => {
      const item = this.items[Number(row.getAttribute('data-index'))];
      const matches = !this.activeTag || (item?.tags.includes(this.activeTag) ?? false);
      const show = matches && matched < this.visible;
      if (matches) matched++;
      row.hidden = !show;
    });
    const btn = this.stage.querySelector<HTMLElement>('.shm-tm-loadmore');
    if (btn) btn.hidden = matched <= this.visible;
    this.refreshReadMore();
  }

  refreshReadMore(): void {
    if (this.s.readMore === 'off') return;
    this.stage.querySelectorAll<HTMLElement>('.shm-tm-card').forEach((card) => {
      const btn = card.querySelector<HTMLElement>('.shm-tm-more');
      if (!btn) return;
      if (card.classList.contains('is-expanded')) { btn.hidden = false; return; }
      const item = this.items[Number(card.getAttribute('data-index'))];
      btn.hidden = !measureOverflow(card, item?.quote.length ?? 0, this.s.quoteLines || 1);
    });
  }

  destroy(): void {
    this.ac.abort();
    this.carousel?.destroy();
    this.resizeObs?.disconnect();
    this.dialog?.close();
    this.stage.innerHTML = '';
  }
}

function initialsOf(name: string): string {
  const words = name.replace(/^Show testimonial \d+:\s*/, '').trim().split(/\s+/).filter(Boolean);
  const first = Array.from(words[0] ?? '')[0] ?? '';
  const last = words.length > 1 ? (Array.from(words[words.length - 1])[0] ?? '') : '';
  return (first + last).toUpperCase() || '?';
}

const runs = new WeakMap<HTMLElement, number>();

export default async function testimonials2026(ctx: WidgetContext): Promise<void> {
  const element = ctx?.element as Destroyable | undefined;
  if (!element || typeof element.querySelector !== 'function') return;
  element.__shmTmDestroy?.();
  element.__shmTmDestroy = undefined;

  const data = (ctx.data ?? {}) as DudaData;
  const inEditor = Boolean(data.inEditor);
  const parsed = readSettings(data.config);
  const s: Settings = prefersReducedMotion() ? { ...parsed, autoplay: false } : parsed;
  const { root, stage } = ensureShell(element);
  applyShell(root, s);
  stage.innerHTML = '';

  const run = (runs.get(element) ?? 0) + 1;
  runs.set(element, run);
  const current = (): boolean => runs.get(element) === run;

  try {
    const sdk = (ctx.shazamme ?? (window as unknown as { shazamme?: unknown }).shazamme) as Sdk | undefined;
    if (!sdk) throw new Error('The Shazamme SDK did not load.');
    const siteId = s.siteId || String((data as { siteId?: unknown }).siteId ?? '');
    await Promise.resolve(sdk.ready?.(siteId, (data as { page?: unknown }).page));
    sdk.register?.(WIDGET_NAME, data);

    const wantsConsultants = s.showConsultant;
    const [rows, consultantRows] = await Promise.all([
      loadRows(sdk, COLLECTION, siteId, inEditor),
      wantsConsultants ? loadRows(sdk, CONSULTANTS, siteId, inEditor).catch(() => []) : Promise.resolve([]),
    ]);
    if (!current()) return;

    const items = selectTestimonials(rows, s);
    if (items.length === 0) {
      const total = Array.isArray(rows) ? rows.length : 0;
      showEditorNote(root, stage, inEditor, emptyMessage(s, total));
      return;
    }
    const instance = new Instance(root, stage, s, items, normaliseConsultants(consultantRows));
    instance.render();
    element.__shmTmDestroy = () => instance.destroy();
  } catch (err) {
    if (!current()) return;
    console.error('[testimonials-2026]', err);
    showEditorNote(root, stage, inEditor, err instanceof Error && err.message ? err.message : GENERIC_ERROR);
  }
}

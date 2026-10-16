// google-reviews widget controller — a Duda replacement for the Elfsight Google
// Reviews widget. Reads Elfsight-shaped settings (see settings.ts), loads the
// business's Google reviews (data.ts), and renders the chosen layout with the
// same `es-*` structure Elfsight produces, so existing custom CSS keeps working.
//
// Registered by the build as window.ShazammeWidget["google-reviews"]; Duda calls
// the default export with { element, data, $, shazamme }.

import type { DudaData } from '../../core/config';
import { loadReviews, selectReviews, type Review, type ReviewData } from './data';
import { readSettings, readSource, type Settings, type ThemeSettings } from './settings';
import { badge, header, reviewCard, schemaJsonLd, widgetTitle, type RenderCtx } from './render';
import { carouselHtml, carouselOpts, mountCarousel } from './carousel';
import { openPopup } from './popup';
import { esc } from './format';

interface WidgetContext {
  element: HTMLElement;
  data: DudaData;
}

const AUTO_MIN_CARD = 260;
const MOBILE_MAX = 500;
const TABLET_MAX = 768;
const FONT_LINK_ID = 'shm-greviews-font-';
const RATING_SIZE: Record<string, number> = { small: 14, medium: 16, large: 18 };

const px = (n: number | undefined): string | undefined => (typeof n === 'number' ? `${n}px` : undefined);

/** ThemeSettings → CSS custom properties on the widget root. */
export function themeVars(t: ThemeSettings, s: Settings): Record<string, string> {
  const hasBg = Boolean(t.widgetBackground?.color && t.widgetBackground.color !== 'transparent');
  const vars: Record<string, string | undefined> = {
    '--es-font': t.font?.value ? `'${t.font.value.replace(/'/g, '')}', sans-serif` : undefined,
    '--es-title-color': t.widgetTitleTitleColor,
    '--es-title-caption-color': t.widgetTitleCaptionColor,
    '--es-title-align': t.widgetTitleAlignment,
    '--es-title-size': px(t.widgetTitleTitleTextStyle?.fontSize),
    '--es-title-weight': t.widgetTitleTitleTextStyle?.fontWeight,
    '--es-widget-bg': t.widgetBackground?.color,
    '--es-widget-radius': px(t.widgetBackground?.borderRadius),
    '--es-widget-pad-x': hasBg ? px(t.widgetHorizontalPadding) : '0px',
    '--es-widget-pad-y': hasBg ? px(t.widgetVerticalPadding) : '0px',
    '--es-review-bg': t.reviewBackgroundColor,
    '--es-review-outline': t.reviewOutlineColor,
    '--es-review-text': t.reviewTextColor,
    '--es-read-more': t.reviewReadMoreColor,
    '--es-verified': t.reviewVerifiedBadgeColor,
    '--es-source-name': t.reviewSourceNameColor,
    '--es-review-radius': px(t.reviewCornerRadius),
    '--es-review-font-size': px(t.reviewTextFontSize?.fontSize),
    '--es-star-size': px(RATING_SIZE[t.reviewRatingSize ?? 'medium']),
    '--es-rating': t.ratingColor,
    '--es-header-bg': t.headerBackgroundColor,
    '--es-header-text': t.headerTextColor,
    '--es-header-radius': px(t.headerCornerRadius),
    '--es-btn-bg': t.writeReviewButton?.color,
    '--es-btn-text': t.writeReviewButton?.fontColor,
    '--es-btn-radius': px(t.writeReviewButton?.borderRadius),
    '--es-btn-font-size': px(t.writeReviewButton?.font?.fontSize),
    '--es-btn-pad-x': px(t.writeReviewButton?.horizontalPadding),
    '--es-btn-pad-y': px(t.writeReviewButton?.verticalPadding),
    '--es-more-bg': t.loadMoreButton?.color,
    '--es-more-text': t.loadMoreButton?.fontColor,
    '--es-more-radius': px(t.loadMoreButton?.borderRadius),
    '--es-arrow-bg': t.carouselArrowBackgroundColor,
    '--es-arrow-color': t.carouselArrowColor,
    '--es-arrow-bg-hover': t.carouselArrowBackgroundColorOnHover,
    '--es-arrow-color-hover': t.carouselArrowColorOnHover,
    '--es-arrow-size': px(t.carouselArrowSize),
    '--es-arrow-offset': hasBg && typeof t.carouselArrowSize === 'number' ? `${-t.carouselArrowSize / 2}px` : '0px',
    '--es-dot': t.carouselPaginationColor,
    '--es-popup-bg': t.popupBackgroundColor,
    '--es-popup-text': t.popupTextColor,
    '--es-popup-rating': t.popupRatingColor,
    '--es-popup-read-more': t.popupReviewReadMoreColor,
    '--es-badge-bg': t.badgeBackgroundColor,
    '--es-badge-text': t.badgeTextColor,
    '--es-badge-rating': t.badgeRatingColor,
    '--es-badge-radius': px(t.badgeCornerRadius),
    '--es-max-width': s.widgetWidth.auto ? 'none' : `${s.widgetWidth.customValue}px`,
  };
  return Object.fromEntries(Object.entries(vars).filter(([, v]) => v !== undefined && v !== '')) as Record<string, string>;
}

export function styleAttr(vars: Record<string, string>): string {
  return Object.entries(vars).map(([k, v]) => `${k}:${String(v).replace(/[;"<>{}]/g, '')}`).join(';');
}

function loadFont(t: ThemeSettings): void {
  const family = t.font?.value;
  if (!family || t.font?.googleFont === false) return;
  const id = FONT_LINK_ID + family.replace(/\W+/g, '-');
  if (document.getElementById(id)) return;
  const link = document.createElement('link');
  link.id = id;
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@400;600;700&display=swap`;
  document.head.appendChild(link);
}

export function columnsFor(s: Settings, width: number): number {
  const auto = (gap: number): number => Math.max(1, Math.min(5, Math.floor((width + gap) / (AUTO_MIN_CARD + gap))));
  const pick = (mode: string, gap: number, large: number, tablet: number, mobile: number): number => {
    if (mode === 'auto') return auto(gap);
    if (width < MOBILE_MAX) return mobile;
    if (width < TABLET_MAX) return tablet;
    return large;
  };
  if (s.layout === 'list') return 1;
  if (s.layout === 'masonry') {
    return pick(s.masonryColumnsMode, s.masonryItemSpacing, s.masonryColumnsDesktopLarge, s.masonryColumnsTablet, s.masonryColumnsMobile);
  }
  return pick(s.gridColumnsMode, s.gridItemSpacing, s.gridColumnsDesktopLarge, s.gridColumnsTablet, s.gridColumnsMobile);
}

export function pageSize(s: Settings, width: number): number {
  const mobile = width < MOBILE_MAX;
  if (s.layout === 'list') return mobile ? s.listItemsPerPageOnMobile : s.listItemsPerPage;
  if (s.layout === 'masonry') return mobile ? s.masonryItemsPerPageOnMobile : s.masonryItemsPerPage;
  return columnsFor(s, width) * (mobile ? s.gridRowsOnMobile : s.gridRows);
}

/** Show "Read more" only where the clamp actually cut text off. */
function revealReadMore(scope: ParentNode): void {
  scope.querySelectorAll<HTMLElement>('.es-text-shortener.es-is-clamped').forEach((el) => {
    const btn = el.parentElement?.querySelector<HTMLElement>('.es-text-shortener-control');
    if (btn) btn.hidden = el.scrollHeight <= el.clientHeight + 1;
  });
}

function bindPopupReadMore(content: HTMLElement): void {
  requestAnimationFrame(() => revealReadMore(content));
  content.addEventListener('click', (e) => {
    const btn = (e.target as Element).closest<HTMLElement>('[data-action="read-more"]');
    if (!btn) return;
    btn.parentElement?.querySelector('.es-text-shortener')?.classList.remove('es-is-clamped');
    btn.hidden = true;
  });
}

function renderPaged(body: HTMLElement, s: Settings, cards: string[], width: number, signal: AbortSignal): void {
  const size = Math.max(1, pageSize(s, width));
  let shown = Math.min(size, cards.length);
  const cls = s.layout === 'list' ? 'es-list-layout' : s.layout === 'masonry' ? 'es-masonry-layout' : 'es-grid-layout';
  const gap = s.layout === 'list' ? s.listItemSpacing : s.layout === 'masonry' ? s.masonryItemSpacing : s.gridItemSpacing;
  const label = esc(s.theme.themeSettings.loadMoreButton?.text || 'Load More');
  body.innerHTML =
    `<div class="${cls}" style="--es-cols:${columnsFor(s, width)};--es-gap:${gap}px">${cards.slice(0, shown).join('')}</div>` +
    (s.showLoadMoreButton && cards.length > shown
      ? `<div class="es-load-more-button-container"><button type="button" class="es-load-more-button">${label}</button></div>`
      : '');
  const more = body.querySelector<HTMLButtonElement>('.es-load-more-button');
  more?.addEventListener('click', () => {
    const list = body.querySelector<HTMLElement>(`.${cls}`)!;
    list.insertAdjacentHTML('beforeend', cards.slice(shown, shown + size).join(''));
    shown += size;
    revealReadMore(list);
    if (shown >= cards.length) more.parentElement?.remove();
  }, { signal });
}

/** http(s) only, unescaped — for window.open rather than markup. */
function openableUrl(v: string): string {
  return /^https?:\/\//i.test(v.trim()) ? v.trim() : '';
}

/** One teardown per widget root: Duda re-runs the widget on every editor change. */
const teardowns = new WeakMap<HTMLElement, AbortController>();

export function render(root: HTMLElement, s: Settings, data: ReviewData): void {
  teardowns.get(root)?.abort();
  const controller = new AbortController();
  teardowns.set(root, controller);
  const { signal } = controller;

  const reviews = selectReviews(data.reviews, s);
  const ctx: RenderCtx = { s, business: data.business };
  const cards = reviews.map((r) => reviewCard(r, ctx));
  const byId = new Map<string, Review>(reviews.map((r) => [r.id, r]));
  const popupCtx: RenderCtx = { ...ctx, inPopup: true, s: { ...s, reviewLayout: 'classic', reviewSourceStyle: 'icon', reviewTextDisplayMode: 'short' } };
  const fullList = (): string =>
    header(ctx, true) + `<div class="es-popup-list">${reviews.map((r) => reviewCard(r, popupCtx)).join('')}</div>`;

  root.innerHTML =
    `<div class="es-main-container"><div class="es-widget-background-container">` +
    `${widgetTitle(s)}${s.layout === 'cardBadge' ? '' : header(ctx)}<div class="es-main-content"></div></div></div>` +
    (s.enableSchemaOrg ? schemaJsonLd(data.business, reviews) : '');
  if (s.customCSS.trim()) {
    // textContent, never markup: the site's CSS cannot close the tag and inject HTML.
    const style = document.createElement('style');
    style.textContent = s.customCSS;
    root.prepend(style);
  }
  const body = root.querySelector<HTMLElement>('.es-main-content')!;
  const width = root.clientWidth || window.innerWidth;

  if (s.layout === 'cardBadge') {
    body.innerHTML = badge(ctx);
  } else if (s.layout === 'carousel' || s.layout === 'slider') {
    if (cards.length) {
      body.innerHTML = carouselHtml(cards);
      mountCarousel(body, { ...carouselOpts(s), onLayout: () => revealReadMore(body) }, signal);
    }
  } else {
    renderPaged(body, s, cards, width, signal);
    // Re-check clamps when the widget first becomes visible (Duda tabs/accordions) or resizes.
    if (typeof ResizeObserver !== 'undefined') {
      const ro = new ResizeObserver(() => revealReadMore(body));
      ro.observe(root);
      signal.addEventListener('abort', () => ro.disconnect(), { once: true });
    }
  }
  root.classList.toggle('es-normalize-height', s.reviewHeightNormalization);
  requestAnimationFrame(() => revealReadMore(root));

  root.addEventListener('click', (e) => {
    const target = e.target as Element;
    const readMore = target.closest('[data-action="read-more"]');
    if (readMore) {
      const review = byId.get(readMore.closest<HTMLElement>('[data-review-id]')?.dataset.reviewId ?? '');
      if (review) openPopup(root, reviewCard(review, { ...ctx, full: true, inPopup: true }));
      return;
    }
    if (target.closest('[data-action="close-badge"]')) {
      target.closest('.es-badge-wrapper')?.remove();
      return;
    }
    if (target.closest('[data-action="badge-click"]')) {
      const link = s.enableExternalLinks ? openableUrl(data.business.reviewsUrl) : '';
      if (s.badgeClickAction === 'openLink' && link) window.open(link, '_blank', 'noopener');
      else openPopup(root, fullList(), bindPopupReadMore);
    }
  }, { signal });
  root.addEventListener('keydown', (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && (e.target as Element).closest('[data-action="badge-click"]')) {
      e.preventDefault();
      (e.target as HTMLElement).click();
    }
  }, { signal });
}

function showMessage(root: HTMLElement, inEditor: boolean, message: string): void {
  // Visitors never see setup errors; the editor shows them so the site builder can fix the config.
  root.innerHTML = inEditor ? `<div class="es-editor-message">Google Reviews: ${esc(message)}</div>` : '';
}

export default async function googleReviews({ element, data }: WidgetContext): Promise<void> {
  const config = (data?.config ?? {}) as Record<string, unknown>;
  const s = readSettings(config);
  const src = readSource(config, s);
  const root = element.querySelector<HTMLElement>('[data-shm-main]') ?? element;
  root.classList.remove(...Array.from(root.classList).filter((c) => c.startsWith('es-layout-')));
  root.classList.add('es-embed-root', `es-layout-${s.layout}`);
  const headerBg = s.theme.themeSettings.headerBackgroundColor ?? 'transparent';
  root.classList.toggle('es-header-has-bg', !/^(transparent|rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*0\s*\))$/i.test(headerBg.trim()));
  root.setAttribute('style', styleAttr(themeVars(s.theme.themeSettings, s)));
  loadFont(s.theme.themeSettings);
  root.classList.add('shm-ready');

  try {
    render(root, s, await loadReviews(src));
  } catch (e) {
    console.error('[google-reviews]', e);
    showMessage(root, Boolean(data?.inEditor), (e as Error).message);
  }
}

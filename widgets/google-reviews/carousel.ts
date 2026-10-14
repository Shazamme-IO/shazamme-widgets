// Carousel / slider: a translateX track with per-breakpoint columns, arrows,
// dynamic dots, autoplay and swipe. Slider is the same thing at one column.
// The track also carries `swiper-wrapper` / `swiper-slide` classes because sites'
// existing custom CSS (written for Elfsight, which uses Swiper) targets them.

import { CHEVRON } from './format';
import type { Settings } from './settings';

export interface CarouselOpts {
  columns: (width: number) => number;
  gap: number;
  autoplay: boolean;
  pauseOnHover: boolean;
  interval: number;
  speed: number;
  pagination: boolean;
  arrows: boolean;
  arrowsOnMobile: boolean;
  swipeDesktop: boolean;
  swipeMobile: boolean;
  /** Runs before each measure, so late content (Read more, fonts, images) is counted. */
  onLayout?: () => void;
}

const MOBILE_MAX = 500;
const TABLET_MAX = 768;
const DESKTOP_SMALL_MAX = 1024;
const DESKTOP_MEDIUM_MAX = 1280;
const AUTO_MIN_CARD = 260;
const MAX_DOTS = 5;
const SWIPE_MIN_PX = 40;

export function carouselColumns(s: Settings, width: number): number {
  if (s.layout === 'slider') return 1;
  if (s.carouselColumnsMode === 'auto') {
    return Math.max(1, Math.min(5, Math.floor((width + s.carouselItemSpacing) / (AUTO_MIN_CARD + s.carouselItemSpacing))));
  }
  if (width < MOBILE_MAX) return s.carouselColumnsMobile;
  if (width < TABLET_MAX) return s.carouselColumnsTablet;
  if (width < DESKTOP_SMALL_MAX) return s.carouselColumnsDesktopSmall;
  if (width < DESKTOP_MEDIUM_MAX) return s.carouselColumnsDesktopMedium;
  return s.carouselColumnsDesktopLarge;
}

export function carouselOpts(s: Settings): CarouselOpts {
  const slider = s.layout === 'slider';
  return {
    columns: (w) => carouselColumns(s, w),
    gap: s.carouselItemSpacing,
    autoplay: slider ? s.sliderAutoplay : s.carouselAutoplay,
    pauseOnHover: slider ? s.sliderAutoplayPauseOnHover : s.carouselAutoplayPauseOnHover,
    interval: slider ? s.sliderAutoplayInterval : s.carouselAutoplayInterval,
    speed: slider ? s.sliderAnimationSpeed : s.carouselAnimationSpeed,
    pagination: slider ? s.sliderPagination : s.carouselPagination,
    arrows: slider ? s.sliderArrowsEnable : s.carouselArrowsEnable,
    arrowsOnMobile: slider ? s.sliderArrowsOnMobileEnable : s.carouselArrowsOnMobileEnable,
    swipeDesktop: s.carouselSwipeDesktopEnable,
    swipeMobile: s.carouselSwipeMobileEnable,
  };
}

export function carouselHtml(cards: string[]): string {
  return (
    `<div class="es-carousel-layout">` +
    `<div class="es-carousel-viewport"><div class="es-carousel-track swiper-wrapper">` +
    cards.map((c) => `<div class="es-carousel-slide swiper-slide"><div class="es-carousel-layout-item">${c}</div></div>`).join('') +
    `</div></div>` +
    `<button type="button" class="es-carousel-arrow es-carousel-arrow-prev" aria-label="Previous reviews">${CHEVRON}</button>` +
    `<button type="button" class="es-carousel-arrow es-carousel-arrow-next" aria-label="Next reviews">${CHEVRON}</button>` +
    `<div class="es-carousel-pagination"></div></div>`
  );
}

/** Which dot indexes to show and how big each is — Swiper-style "dynamic bullets". */
export function dotWindow(count: number, active: number): { index: number; size: 'main' | 'near' | 'far' }[] {
  if (count <= 1) return [];
  const shown = Math.min(count, MAX_DOTS);
  const start = Math.max(0, Math.min(active - Math.floor(shown / 2), count - shown));
  return Array.from({ length: shown }, (_, i) => {
    const index = start + i;
    const d = Math.abs(index - active);
    return { index, size: d === 0 ? 'main' : d === 1 ? 'near' : 'far' };
  });
}

export function mountCarousel(root: HTMLElement, o: CarouselOpts, signal?: AbortSignal): () => void {
  const viewport = root.querySelector<HTMLElement>('.es-carousel-viewport')!;
  const track = root.querySelector<HTMLElement>('.es-carousel-track')!;
  const slides = Array.from(track.children) as HTMLElement[];
  const prev = root.querySelector<HTMLButtonElement>('.es-carousel-arrow-prev')!;
  const next = root.querySelector<HTMLButtonElement>('.es-carousel-arrow-next')!;
  const dots = root.querySelector<HTMLElement>('.es-carousel-pagination')!;
  const on = { signal } as AddEventListenerOptions;
  const reducedMotion = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const autoplay = o.autoplay && !reducedMotion;
  let index = 0;
  let cols = 1;
  let step = 0;
  let timer: ReturnType<typeof setInterval> | null = null;
  let hovering = false;
  let focused = false;
  let frame = 0;

  const maxIndex = (): number => Math.max(0, slides.length - cols);

  function paint(animate = true): void {
    const focusedDot = dots.contains(document.activeElement);
    const focusedArrow = document.activeElement === prev ? prev : document.activeElement === next ? next : null;
    track.style.transitionDuration = animate ? `${o.speed}ms` : '0ms';
    track.style.transform = `translate3d(${-index * step}px,0,0)`;
    const mobile = root.clientWidth < MOBILE_MAX;
    const showArrows = o.arrows && (!mobile || o.arrowsOnMobile) && slides.length > cols;
    prev.hidden = !showArrows || (!autoplay && index === 0);
    next.hidden = !showArrows || (!autoplay && index >= maxIndex());
    dots.hidden = !o.pagination || slides.length <= cols;
    dots.innerHTML = dotWindow(maxIndex() + 1, index)
      .map((d) => `<button type="button" class="es-carousel-dot es-dot-${d.size}${d.index === index ? ' is-active' : ''}" data-index="${d.index}" aria-label="Go to review ${d.index + 1}"${d.index === index ? ' aria-current="true"' : ''}></button>`)
      .join('');
    // Keep keyboard users where they were: the dot row is rebuilt, and an arrow
    // hides itself at either end.
    if (focusedDot) dots.querySelector<HTMLElement>('.is-active')?.focus();
    if (focusedArrow?.hidden) (focusedArrow === prev ? next : prev).focus();
    slides.forEach((sl, i) => { sl.inert = i < index || i >= index + cols; });
    // One-up sliders size to the current review (Elfsight's auto-height), so a
    // long review elsewhere in the set doesn't pad every slide.
    if (cols === 1) viewport.style.height = `${slides[index]?.offsetHeight ?? 0}px`;
    else viewport.style.removeProperty('height');
  }

  function layout(): void {
    const width = viewport.clientWidth;
    if (!width) return;
    o.onLayout?.();
    cols = Math.max(1, Math.min(o.columns(root.clientWidth), slides.length || 1));
    const slideW = (width - o.gap * (cols - 1)) / cols;
    step = slideW + o.gap;
    track.style.gap = `${o.gap}px`;
    for (const sl of slides) sl.style.width = `${slideW}px`;
    index = Math.min(index, maxIndex());
    paint(false);
  }

  /** Coalesce resize/load bursts into one layout per frame (also avoids RO loop errors). */
  function scheduleLayout(): void {
    if (frame) return;
    frame = requestAnimationFrame(() => { frame = 0; layout(); });
  }

  function go(to: number): void {
    const max = maxIndex();
    index = to > max ? (autoplay ? 0 : max) : to < 0 ? (autoplay ? max : 0) : to;
    paint();
  }

  function stopAutoplay(): void {
    if (timer) clearInterval(timer);
    timer = null;
  }
  function startAutoplay(): void {
    stopAutoplay();
    if (!autoplay || slides.length <= cols) return;
    timer = setInterval(() => {
      if ((o.pauseOnHover && hovering) || focused || document.hidden) return;
      go(index + 1);
    }, o.interval);
  }

  prev.addEventListener('click', () => { go(index - 1); startAutoplay(); }, on);
  next.addEventListener('click', () => { go(index + 1); startAutoplay(); }, on);
  dots.addEventListener('click', (e) => {
    const dot = (e.target as Element).closest<HTMLElement>('[data-index]');
    if (dot) { go(Number(dot.dataset.index)); startAutoplay(); }
  }, on);
  root.addEventListener('mouseenter', () => { hovering = true; }, on);
  root.addEventListener('mouseleave', () => { hovering = false; }, on);
  root.addEventListener('focusin', () => { focused = true; }, on);
  root.addEventListener('focusout', (e) => { focused = root.contains(e.relatedTarget as Node | null); }, on);
  // Avatars and web fonts change card heights after first paint.
  track.addEventListener('load', scheduleLayout, { capture: true, signal });

  let startX = 0;
  let startY = 0;
  let dragging = false;
  viewport.addEventListener('pointerdown', (e) => {
    const mobile = root.clientWidth < MOBILE_MAX;
    if (!(mobile ? o.swipeMobile : o.swipeDesktop) || (e.target as Element).closest('a,button')) return;
    dragging = true; startX = e.clientX; startY = e.clientY;
  }, on);
  viewport.addEventListener('pointerup', (e) => {
    if (!dragging) return;
    dragging = false;
    const dx = e.clientX - startX;
    if (Math.abs(dx) > SWIPE_MIN_PX && Math.abs(dx) > Math.abs(e.clientY - startY)) { go(index + (dx < 0 ? 1 : -1)); startAutoplay(); }
  }, on);
  viewport.addEventListener('pointercancel', () => { dragging = false; }, on);

  const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(scheduleLayout) : null;
  ro?.observe(root);
  ro?.observe(track);
  document.fonts?.ready.then(scheduleLayout).catch(() => undefined);
  layout();
  startAutoplay();
  const cleanup = (): void => { stopAutoplay(); ro?.disconnect(); if (frame) cancelAnimationFrame(frame); };
  signal?.addEventListener('abort', cleanup, { once: true });
  return cleanup;
}

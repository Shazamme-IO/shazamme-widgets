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
  swipe: boolean;
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
    swipe: s.carouselSwipeDesktopEnable || s.carouselSwipeMobileEnable,
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

export function mountCarousel(root: HTMLElement, o: CarouselOpts): () => void {
  const viewport = root.querySelector<HTMLElement>('.es-carousel-viewport')!;
  const track = root.querySelector<HTMLElement>('.es-carousel-track')!;
  const slides = Array.from(track.children) as HTMLElement[];
  const prev = root.querySelector<HTMLButtonElement>('.es-carousel-arrow-prev')!;
  const next = root.querySelector<HTMLButtonElement>('.es-carousel-arrow-next')!;
  const dots = root.querySelector<HTMLElement>('.es-carousel-pagination')!;
  let index = 0;
  let cols = 1;
  let step = 0;
  let timer: ReturnType<typeof setInterval> | null = null;
  let hovering = false;

  const maxIndex = (): number => Math.max(0, slides.length - cols);

  function paint(animate = true): void {
    track.style.transitionDuration = animate ? `${o.speed}ms` : '0ms';
    track.style.transform = `translate3d(${-index * step}px,0,0)`;
    const mobile = root.clientWidth < MOBILE_MAX;
    const showArrows = o.arrows && (!mobile || o.arrowsOnMobile) && slides.length > cols;
    prev.hidden = !showArrows || (!o.autoplay && index === 0);
    next.hidden = !showArrows || (!o.autoplay && index >= maxIndex());
    dots.hidden = !o.pagination || slides.length <= cols;
    dots.innerHTML = dotWindow(maxIndex() + 1, index)
      .map((d) => `<button type="button" class="es-carousel-dot es-dot-${d.size}${d.index === index ? ' is-active' : ''}" data-index="${d.index}" aria-label="Go to review ${d.index + 1}"></button>`)
      .join('');
    slides.forEach((sl, i) => { sl.inert = i < index || i >= index + cols; });
    // One-up sliders size to the current review (Elfsight's auto-height), so a
    // long review elsewhere in the set doesn't pad every slide.
    if (cols === 1) viewport.style.height = `${slides[index]?.offsetHeight ?? 0}px`;
    else viewport.style.removeProperty('height');
  }

  function layout(): void {
    const width = viewport.clientWidth;
    if (!width) return;
    cols = Math.max(1, Math.min(o.columns(root.clientWidth), slides.length || 1));
    const slideW = (width - o.gap * (cols - 1)) / cols;
    step = slideW + o.gap;
    track.style.gap = `${o.gap}px`;
    for (const sl of slides) sl.style.width = `${slideW}px`;
    index = Math.min(index, maxIndex());
    paint(false);
  }

  function go(to: number): void {
    const max = maxIndex();
    index = to > max ? (o.autoplay ? 0 : max) : to < 0 ? (o.autoplay ? max : 0) : to;
    paint();
  }

  function stopAutoplay(): void {
    if (timer) clearInterval(timer);
    timer = null;
  }
  function startAutoplay(): void {
    stopAutoplay();
    if (o.autoplay && slides.length > cols) {
      timer = setInterval(() => { if (!(o.pauseOnHover && hovering)) go(index + 1); }, o.interval);
    }
  }

  prev.addEventListener('click', () => { go(index - 1); startAutoplay(); });
  next.addEventListener('click', () => { go(index + 1); startAutoplay(); });
  dots.addEventListener('click', (e) => {
    const dot = (e.target as Element).closest<HTMLElement>('[data-index]');
    if (dot) { go(Number(dot.dataset.index)); startAutoplay(); }
  });
  root.addEventListener('mouseenter', () => { hovering = true; });
  root.addEventListener('mouseleave', () => { hovering = false; });

  if (o.swipe) {
    let startX = 0;
    let startY = 0;
    let dragging = false;
    viewport.addEventListener('pointerdown', (e) => {
      if ((e.target as Element).closest('a,button')) return;
      dragging = true; startX = e.clientX; startY = e.clientY;
    });
    viewport.addEventListener('pointerup', (e) => {
      if (!dragging) return;
      dragging = false;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > SWIPE_MIN_PX && Math.abs(dx) > Math.abs(e.clientY - startY)) { go(index + (dx < 0 ? 1 : -1)); startAutoplay(); }
    });
    viewport.addEventListener('pointercancel', () => { dragging = false; });
  }

  const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => layout()) : null;
  ro?.observe(root);
  layout();
  startAutoplay();
  return () => { stopAutoplay(); ro?.disconnect(); };
}

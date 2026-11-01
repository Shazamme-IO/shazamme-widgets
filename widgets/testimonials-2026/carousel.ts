// A small self-contained carousel: CSS scroll-snap does the scrolling and swiping,
// this adds buttons, dots, optional autoplay and the accessibility state.

export interface CarouselOptions {
  root: HTMLElement;
  loop: boolean;
  autoplayMs: number;
  reducedMotion: boolean;
}

export interface Carousel {
  goTo(index: number): void;
  destroy(): void;
}

const RESIZE_DEBOUNCE_MS = 120;
const SCROLL_SETTLE_PX = 2;
const SCROLL_GIVE_UP_MS = 900;
const PAUSE_LABEL = 'Pause testimonials';
const PLAY_LABEL = 'Play testimonials';

export function prefersReducedMotion(): boolean {
  return typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Keyboard focus only: a mouse click on a button should not hold autoplay still. */
function isKeyboardFocus(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return true;
  try {
    return target.matches(':focus-visible');
  } catch {
    return true;
  }
}

export function mountCarousel(opts: CarouselOptions): Carousel {
  const { root, loop, reducedMotion } = opts;
  const track = root.querySelector<HTMLElement>('.shm-tm-track');
  const slides = Array.from(root.querySelectorAll<HTMLElement>('.shm-tm-slide'));
  const prev = root.querySelector<HTMLElement>('.shm-tm-prev');
  const next = root.querySelector<HTMLElement>('.shm-tm-next');
  const pauseBtn = root.querySelector<HTMLButtonElement>('.shm-tm-pause');
  const dots = Array.from(root.querySelectorAll<HTMLElement>('.shm-tm-dot'));
  const controls = root.querySelector<HTMLElement>('.shm-tm-controls');
  const ac = new AbortController();
  const { signal } = ac;
  const total = slides.length;
  const autoplayMs = reducedMotion ? 0 : opts.autoplayMs;

  if (!track || total === 0) return { goTo: () => undefined, destroy: () => undefined };
  const scroller: HTMLElement = track;

  let current = 0;
  let perView = 1;
  let userPaused = false;
  let hoverPaused = false;
  let focusPaused = false;
  let offscreen = false;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let raf = 0;
  let resizeTimer: ReturnType<typeof setTimeout> | undefined;
  let settleTimer: ReturnType<typeof setTimeout> | undefined;
  let scrollTarget: number | null = null;
  let lastWidth = scroller.clientWidth;
  let destroyed = false;

  const maxIndex = (): number => Math.max(0, total - perView);
  const pageCount = (): number => Math.max(1, Math.ceil(total / perView));
  const pageOf = (i: number): number => (i >= maxIndex() ? pageCount() - 1 : Math.floor(i / perView));
  const leftOf = (i: number): number => slides[i].offsetLeft - slides[0].offsetLeft;

  function measure(): void {
    const w = slides[0].offsetWidth;
    perView = w > 0 && scroller.clientWidth > 0 ? Math.max(1, Math.min(total, Math.round(scroller.clientWidth / w))) : 1;
  }

  function setDisabled(btn: HTMLElement | null, off: boolean): void {
    if (!btn) return;
    btn.setAttribute('aria-disabled', off ? 'true' : 'false');
    btn.classList.toggle('is-disabled', off);
  }

  function dotLabel(dot: HTMLElement, page: number): string {
    if (perView === 1) {
      const name = dot.getAttribute('data-name');
      return name ? `Show testimonial ${page + 1}: ${name}` : `Show testimonial ${page + 1}`;
    }
    const from = page * perView + 1;
    const to = Math.min(total, (page + 1) * perView);
    return `Show testimonials ${from} to ${to}`;
  }

  function paint(): void {
    const visibleTo = current + perView - 1;
    slides.forEach((slide, i) => {
      const visible = i >= current && i <= visibleTo;
      slide.toggleAttribute('inert', !visible);
      slide.setAttribute('aria-hidden', visible ? 'false' : 'true');
      slide.classList.toggle('is-active', visible);
    });
    const page = pageOf(current);
    dots.forEach((dot, i) => {
      dot.hidden = i >= pageCount();
      dot.setAttribute('aria-label', dotLabel(dot, i));
      if (i === page) dot.setAttribute('aria-current', 'true');
      else dot.removeAttribute('aria-current');
    });
    setDisabled(prev, !loop && current <= 0);
    setDisabled(next, !loop && current >= maxIndex());
    const scrollable = total > perView;
    if (controls) controls.hidden = !scrollable;
    if (scrollable) scroller.setAttribute('tabindex', '0');
    else scroller.removeAttribute('tabindex');
  }

  function scrollToIndex(i: number, behavior: ScrollBehavior): void {
    const left = leftOf(i);
    scrollTarget = left;
    if (settleTimer) clearTimeout(settleTimer);
    settleTimer = setTimeout(() => { scrollTarget = null; }, SCROLL_GIVE_UP_MS);
    if (typeof scroller.scrollTo === 'function') scroller.scrollTo({ left, behavior });
    else scroller.scrollLeft = left;
  }

  function goTo(index: number, behavior: ScrollBehavior = reducedMotion ? 'auto' : 'smooth'): void {
    current = Math.max(0, Math.min(maxIndex(), index));
    scrollToIndex(current, behavior);
    paint();
    restartTimer();
  }

  function step(dir: 1 | -1): void {
    if (dir === 1) goTo(current >= maxIndex() ? (loop ? 0 : current) : current + 1);
    else goTo(current <= 0 ? (loop ? maxIndex() : 0) : current - 1);
  }

  function syncFromScroll(): void {
    raf = 0;
    const w = slides[0].offsetWidth;
    if (w <= 0) return;
    if (scrollTarget !== null) {
      // A scroll we started: wait for it to arrive instead of reading its halfway positions.
      if (Math.abs(scroller.scrollLeft - scrollTarget) > SCROLL_SETTLE_PX) return;
      scrollTarget = null;
    }
    const index = Math.max(0, Math.min(maxIndex(), Math.round(scroller.scrollLeft / w)));
    if (index !== current) {
      current = index;
      paint();
      restartTimer();
    }
  }

  function userTookOver(): void {
    scrollTarget = null;
  }

  function canAutoplay(): boolean {
    return autoplayMs > 0 && !userPaused && !hoverPaused && !focusPaused && !offscreen && !document.hidden && total > perView;
  }

  function setLive(running: boolean): void {
    scroller.setAttribute('aria-live', running ? 'off' : 'polite');
  }

  function restartTimer(): void {
    if (timer) clearTimeout(timer);
    timer = undefined;
    const running = canAutoplay();
    setLive(running);
    if (!running) return;
    timer = setTimeout(() => {
      if (!root.isConnected) return destroy();
      if (!loop && current >= maxIndex()) return;
      step(1);
    }, autoplayMs);
  }

  function destroy(): void {
    if (destroyed) return;
    destroyed = true;
    ac.abort();
    if (timer) clearTimeout(timer);
    if (resizeTimer) clearTimeout(resizeTimer);
    if (settleTimer) clearTimeout(settleTimer);
    if (raf) cancelAnimationFrame(raf);
    io?.disconnect();
    ro?.disconnect();
  }

  scroller.addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(syncFromScroll); }, { passive: true, signal });
  scroller.addEventListener('pointerdown', userTookOver, { passive: true, signal });
  scroller.addEventListener('wheel', userTookOver, { passive: true, signal });
  scroller.addEventListener('touchstart', userTookOver, { passive: true, signal });
  prev?.addEventListener('click', () => { if (prev.getAttribute('aria-disabled') !== 'true') step(-1); }, { signal });
  next?.addEventListener('click', () => { if (next.getAttribute('aria-disabled') !== 'true') step(1); }, { signal });
  dots.forEach((dot, i) => dot.addEventListener('click', () => goTo(Math.min(i * perView, maxIndex())), { signal }));

  scroller.addEventListener('keydown', (e) => {
    if (e.target !== scroller) return;
    if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
    else if (e.key === 'Home') { e.preventDefault(); goTo(0); }
    else if (e.key === 'End') { e.preventDefault(); goTo(maxIndex()); }
  }, { signal });

  const isTouch = (e: Event): boolean => (e as PointerEvent).pointerType === 'touch';
  root.addEventListener('pointerenter', (e) => { if (isTouch(e)) return; hoverPaused = true; restartTimer(); }, { signal });
  root.addEventListener('pointerleave', (e) => { if (isTouch(e)) return; hoverPaused = false; restartTimer(); }, { signal });
  root.addEventListener('focusin', (e) => { if (!isKeyboardFocus(e.target)) return; focusPaused = true; restartTimer(); }, { signal });
  root.addEventListener('focusout', (e) => {
    if (e.relatedTarget instanceof Node && root.contains(e.relatedTarget)) return;
    focusPaused = false;
    restartTimer();
  }, { signal });
  document.addEventListener('visibilitychange', () => (root.isConnected ? restartTimer() : destroy()), { signal });

  pauseBtn?.addEventListener('click', () => {
    userPaused = !userPaused;
    pauseBtn.setAttribute('aria-label', userPaused ? PLAY_LABEL : PAUSE_LABEL);
    pauseBtn.classList.toggle('is-paused', userPaused);
    restartTimer();
  }, { signal });

  let io: IntersectionObserver | undefined;
  if (autoplayMs > 0 && typeof IntersectionObserver === 'function') {
    io = new IntersectionObserver((entries) => {
      offscreen = !entries[entries.length - 1].isIntersecting;
      restartTimer();
    });
    io.observe(root);
  }

  let ro: ResizeObserver | undefined;
  if (typeof ResizeObserver === 'function') {
    ro = new ResizeObserver(() => {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (scroller.clientWidth === lastWidth) return;
        lastWidth = scroller.clientWidth;
        measure();
        current = Math.min(current, maxIndex());
        scrollToIndex(current, 'auto');
        paint();
      }, RESIZE_DEBOUNCE_MS);
    });
    ro.observe(scroller);
  }

  measure();
  paint();
  restartTimer();

  return { goTo: (i: number) => goTo(i), destroy };
}

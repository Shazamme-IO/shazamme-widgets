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

export function prefersReducedMotion(): boolean {
  return typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
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

  let current = 0;
  let perView = 1;
  let userPaused = false;
  let hoverPaused = false;
  let focusPaused = false;
  let offscreen = false;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let raf = 0;
  let resizeTimer: ReturnType<typeof setTimeout> | undefined;

  if (!track || total === 0) return { goTo: () => undefined, destroy: () => undefined };

  const maxIndex = (): number => Math.max(0, total - perView);
  const pageCount = (): number => Math.max(1, Math.ceil(total / perView));
  const pageOf = (i: number): number => (i >= maxIndex() ? pageCount() - 1 : Math.floor(i / perView));

  function measure(): void {
    const first = slides[0];
    const w = first.offsetWidth;
    perView = w > 0 && track!.clientWidth > 0 ? Math.max(1, Math.min(total, Math.round(track!.clientWidth / w))) : 1;
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
      const inRange = i < pageCount();
      dot.hidden = !inRange;
      if (i === page) dot.setAttribute('aria-current', 'true');
      else dot.removeAttribute('aria-current');
    });
    const atStart = current <= 0;
    const atEnd = current >= maxIndex();
    setDisabled(prev, !loop && atStart);
    setDisabled(next, !loop && atEnd);
    if (controls) controls.hidden = total <= perView;
  }

  function setDisabled(btn: HTMLElement | null, off: boolean): void {
    if (!btn) return;
    btn.setAttribute('aria-disabled', off ? 'true' : 'false');
    btn.classList.toggle('is-disabled', off);
  }

  function scrollToIndex(i: number): void {
    const slide = slides[i];
    const left = slide.offsetLeft - slides[0].offsetLeft;
    const behavior: ScrollBehavior = reducedMotion ? 'auto' : 'smooth';
    if (typeof track!.scrollTo === 'function') track!.scrollTo({ left, behavior });
    else track!.scrollLeft = left;
  }

  function goTo(index: number): void {
    const target = Math.max(0, Math.min(maxIndex(), index));
    current = target;
    scrollToIndex(target);
    paint();
    restartTimer();
  }

  function step(dir: 1 | -1): void {
    if (dir === 1) goTo(current >= maxIndex() ? (loop ? 0 : current) : current + 1);
    else goTo(current <= 0 ? (loop ? maxIndex() : 0) : current - 1);
  }

  function goToPage(page: number): void {
    goTo(Math.min(page * perView, maxIndex()));
  }

  function syncFromScroll(): void {
    raf = 0;
    const w = slides[0].offsetWidth;
    if (w <= 0) return;
    const index = Math.round(track!.scrollLeft / w);
    const clamped = Math.max(0, Math.min(maxIndex(), index));
    if (clamped !== current) {
      current = clamped;
      paint();
    }
  }

  function canAutoplay(): boolean {
    return autoplayMs > 0 && !userPaused && !hoverPaused && !focusPaused && !offscreen && !document.hidden && total > perView;
  }

  function restartTimer(): void {
    if (timer) clearTimeout(timer);
    timer = undefined;
    if (!canAutoplay()) return;
    timer = setTimeout(() => {
      if (!loop && current >= maxIndex()) return;
      step(1);
    }, autoplayMs);
  }

  function setLive(): void {
    track!.setAttribute('aria-live', autoplayMs > 0 && !userPaused ? 'off' : 'polite');
  }

  track.addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(syncFromScroll); }, { passive: true, signal });
  prev?.addEventListener('click', () => { if (prev.getAttribute('aria-disabled') !== 'true') step(-1); }, { signal });
  next?.addEventListener('click', () => { if (next.getAttribute('aria-disabled') !== 'true') step(1); }, { signal });
  dots.forEach((dot, i) => dot.addEventListener('click', () => goToPage(i), { signal }));

  track.addEventListener('keydown', (e) => {
    if (e.target !== track) return;
    if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
    else if (e.key === 'Home') { e.preventDefault(); goTo(0); }
    else if (e.key === 'End') { e.preventDefault(); goTo(maxIndex()); }
  }, { signal });

  root.addEventListener('mouseenter', () => { hoverPaused = true; restartTimer(); }, { signal });
  root.addEventListener('mouseleave', () => { hoverPaused = false; restartTimer(); }, { signal });
  root.addEventListener('focusin', () => { focusPaused = true; restartTimer(); }, { signal });
  root.addEventListener('focusout', (e) => {
    if (e.relatedTarget instanceof Node && root.contains(e.relatedTarget)) return;
    focusPaused = false;
    restartTimer();
  }, { signal });
  document.addEventListener('visibilitychange', restartTimer, { signal });

  pauseBtn?.addEventListener('click', () => {
    userPaused = !userPaused;
    pauseBtn.setAttribute('aria-pressed', userPaused ? 'true' : 'false');
    pauseBtn.setAttribute('aria-label', userPaused ? 'Play testimonials' : 'Pause testimonials');
    pauseBtn.classList.toggle('is-paused', userPaused);
    setLive();
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
        measure();
        current = Math.min(current, maxIndex());
        scrollToIndex(current);
        paint();
      }, RESIZE_DEBOUNCE_MS);
    });
    ro.observe(track);
  }

  measure();
  setLive();
  paint();
  restartTimer();

  return {
    goTo,
    destroy(): void {
      ac.abort();
      if (timer) clearTimeout(timer);
      if (resizeTimer) clearTimeout(resizeTimer);
      if (raf) cancelAnimationFrame(raf);
      io?.disconnect();
      ro?.disconnect();
    },
  };
}

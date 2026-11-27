// Slider behaviour for layout "slider": a CSS scroll-snap row the arrows, the arrow keys
// and (optionally) a timer move one card at a time. No library. Autoplay pauses on hover,
// on keyboard focus, in a hidden tab and when the visitor asks for reduced motion, and
// always has a pause button (WCAG 2.2.2). Without "infinite" it stops at the last card.
// Right to left pages scroll the other way: "next" always means towards the end of the
// row, and the arrow keys follow the reading direction. Returns a teardown for re-runs.

import { ICONS } from './icons';
import type { Settings } from './settings';

type SliderSettings = Pick<Settings, 'autoplay' | 'sliderSpeed' | 'infinite' | 'pauseLabel' | 'playLabel'>;

const EDGE = 2;
const noop = (): void => undefined;

function prefersReducedMotion(): boolean {
  return typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function moveTo(track: HTMLElement, left: number, smooth: boolean): void {
  if (typeof track.scrollTo === 'function') track.scrollTo({ left, behavior: smooth ? 'smooth' : 'auto' });
  else track.scrollLeft = left;
}

export function mountSlider(scope: HTMLElement, s: SliderSettings): () => void {
  const slider = scope.querySelector<HTMLElement>('.shm-cc-slider');
  const track = slider?.querySelector<HTMLElement>('[data-shm-cc-track]');
  if (!slider || !track) return noop;
  const prev = slider.querySelector<HTMLButtonElement>('[data-shm-cc-prev]');
  const next = slider.querySelector<HTMLButtonElement>('[data-shm-cc-next]');
  const pauseButton = slider.querySelector<HTMLButtonElement>('[data-shm-cc-pause]');
  const reduced = prefersReducedMotion();
  const smooth = !reduced;

  const isRtl = (): boolean => getComputedStyle(track).direction === 'rtl';
  /** -1 in a right to left row: the end of the row is at a negative scrollLeft there. */
  const sign = (): 1 | -1 => (isRtl() ? -1 : 1);
  const max = (): number => Math.max(0, track.scrollWidth - track.clientWidth);
  const offset = (): number => Math.abs(track.scrollLeft);
  const atStart = (): boolean => offset() <= EDGE;
  const atEnd = (): boolean => offset() >= max() - EDGE;
  const step = (): number => {
    const item = track.querySelector<HTMLElement>('.shm-cc-item');
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    return item ? item.getBoundingClientRect().width + gap : track.clientWidth;
  };

  const sync = (): void => {
    const gap = getComputedStyle(track).columnGap;
    if (gap && gap !== 'normal') track.style.setProperty('--shm-cc-gap-px', gap);
    const isStatic = max() <= EDGE;
    slider.classList.toggle('is-static', isStatic);
    if (isStatic) track.removeAttribute('tabindex');
    else track.setAttribute('tabindex', '0');
    if (s.infinite) return;
    prev?.setAttribute('aria-disabled', String(atStart()));
    next?.setAttribute('aria-disabled', String(atEnd()));
  };

  /** One card towards the end (1) or the start (-1). Returns false when it is at that end and does not wrap. */
  const go = (dir: 1 | -1, wrap: boolean): boolean => {
    if (dir > 0 && atEnd()) {
      if (wrap) moveTo(track, 0, smooth);
      return wrap;
    }
    if (dir < 0 && atStart()) {
      if (wrap) moveTo(track, sign() * max(), smooth);
      return wrap;
    }
    const left = sign() * dir * step();
    if (typeof track.scrollBy === 'function') track.scrollBy({ left, behavior: smooth ? 'smooth' : 'auto' });
    else track.scrollLeft += left;
    return true;
  };

  const onPrev = (): void => { go(-1, s.infinite); };
  const onNext = (): void => { go(1, s.infinite); };
  const onKey = (e: KeyboardEvent): void => {
    if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    e.preventDefault();
    const towardsRight: 1 | -1 = e.key === 'ArrowRight' ? 1 : -1;
    go((towardsRight * sign()) as 1 | -1, s.infinite);
  };
  let frame = 0;
  const onScroll = (): void => {
    if (typeof requestAnimationFrame !== 'function') return sync();
    if (frame) return;
    frame = requestAnimationFrame(() => { frame = 0; sync(); });
  };

  prev?.addEventListener('click', onPrev);
  next?.addEventListener('click', onNext);
  track.addEventListener('keydown', onKey);
  track.addEventListener('scroll', onScroll, { passive: true });
  const observer = typeof ResizeObserver === 'function' ? new ResizeObserver(sync) : null;
  observer?.observe(track);
  sync();

  const stopAutoplay = s.autoplay
    ? startAutoplay(slider, track, pauseButton, s, reduced, {
      advance: () => go(1, s.infinite),
      atEnd,
      fits: () => max() <= EDGE,
      rewind: () => moveTo(track, 0, smooth),
    })
    : noop;

  return () => {
    stopAutoplay();
    observer?.disconnect();
    if (frame && typeof cancelAnimationFrame === 'function') cancelAnimationFrame(frame);
    prev?.removeEventListener('click', onPrev);
    next?.removeEventListener('click', onNext);
    track.removeEventListener('keydown', onKey);
    track.removeEventListener('scroll', onScroll);
  };
}

interface Motion {
  /** Moves one card on; false when it is at the last card and does not loop. */
  advance: () => boolean;
  atEnd: () => boolean;
  /** The whole row is on screen: there is nothing to move, so the timer waits instead of pausing. */
  fits: () => boolean;
  rewind: () => void;
}

function startAutoplay(slider: HTMLElement, track: HTMLElement, pauseButton: HTMLButtonElement | null, s: SliderSettings, reduced: boolean, motion: Motion): () => void {
  let paused = reduced;
  let hovered = false;
  let focused = false;
  const label = (): void => {
    if (!pauseButton) return;
    pauseButton.setAttribute('aria-label', paused ? s.playLabel : s.pauseLabel);
    pauseButton.innerHTML = paused ? ICONS.play : ICONS.pause;
    slider.classList.toggle('is-paused', paused);
  };
  const onToggle = (): void => {
    paused = !paused;
    if (!paused && !s.infinite && !motion.fits() && motion.atEnd()) motion.rewind();
    label();
  };
  const onEnter = (): void => { hovered = true; };
  const onLeave = (): void => { hovered = false; };
  const onFocusIn = (e: FocusEvent): void => { focused = track.contains(e.target as Node | null); };
  const onFocusOut = (e: FocusEvent): void => { focused = track.contains(e.relatedTarget as Node | null); };
  pauseButton?.addEventListener('click', onToggle);
  slider.addEventListener('mouseenter', onEnter);
  slider.addEventListener('mouseleave', onLeave);
  slider.addEventListener('focusin', onFocusIn);
  slider.addEventListener('focusout', onFocusOut);
  label();
  const timer = window.setInterval(() => {
    if (paused || hovered || focused || document.visibilityState === 'hidden' || motion.fits()) return;
    if (motion.advance()) return;
    paused = true;
    label();
  }, s.sliderSpeed);
  return () => {
    window.clearInterval(timer);
    pauseButton?.removeEventListener('click', onToggle);
    slider.removeEventListener('mouseenter', onEnter);
    slider.removeEventListener('mouseleave', onLeave);
    slider.removeEventListener('focusin', onFocusIn);
    slider.removeEventListener('focusout', onFocusOut);
  };
}

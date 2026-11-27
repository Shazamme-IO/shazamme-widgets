// Slider behaviour for layout "slider": a CSS scroll-snap row the arrows, the arrow keys
// and (optionally) a timer move one card at a time. No library. Autoplay pauses on hover,
// on keyboard focus, in a hidden tab and when the visitor asks for reduced motion, and
// always has a pause button (WCAG 2.2.2). Returns a teardown for the editor's re-runs.

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

  const max = (): number => Math.max(0, track.scrollWidth - track.clientWidth);
  const atStart = (): boolean => track.scrollLeft <= EDGE;
  const atEnd = (): boolean => track.scrollLeft >= max() - EDGE;
  const step = (): number => {
    const item = track.querySelector<HTMLElement>('.shm-cc-item');
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    return item ? item.getBoundingClientRect().width + gap : track.clientWidth;
  };

  const sync = (): void => {
    const gap = getComputedStyle(track).columnGap;
    if (gap && gap !== 'normal') track.style.setProperty('--shm-cc-gap-px', gap);
    slider.classList.toggle('is-static', max() <= EDGE);
    if (s.infinite) return;
    prev?.setAttribute('aria-disabled', String(atStart()));
    next?.setAttribute('aria-disabled', String(atEnd()));
  };

  const go = (dir: 1 | -1, wrap: boolean): void => {
    if (dir > 0 && atEnd()) {
      if (wrap) moveTo(track, 0, smooth);
      return;
    }
    if (dir < 0 && atStart()) {
      if (wrap) moveTo(track, max(), smooth);
      return;
    }
    if (typeof track.scrollBy === 'function') track.scrollBy({ left: dir * step(), behavior: smooth ? 'smooth' : 'auto' });
    else track.scrollLeft += dir * step();
  };

  const onPrev = (): void => go(-1, s.infinite);
  const onNext = (): void => go(1, s.infinite);
  const onKey = (e: KeyboardEvent): void => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    e.preventDefault();
    go(e.key === 'ArrowRight' ? 1 : -1, s.infinite);
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

  const stopAutoplay = s.autoplay ? startAutoplay(slider, track, pauseButton, s, reduced, () => go(1, true)) : noop;

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

function startAutoplay(slider: HTMLElement, track: HTMLElement, pauseButton: HTMLButtonElement | null, s: SliderSettings, reduced: boolean, advance: () => void): () => void {
  let paused = reduced;
  let hovered = false;
  let focused = false;
  const label = (): void => {
    if (!pauseButton) return;
    pauseButton.setAttribute('aria-label', paused ? s.playLabel : s.pauseLabel);
    pauseButton.innerHTML = paused ? ICONS.play : ICONS.pause;
    slider.classList.toggle('is-paused', paused);
  };
  const onToggle = (): void => { paused = !paused; label(); };
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
    if (paused || hovered || focused || document.visibilityState === 'hidden') return;
    advance();
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

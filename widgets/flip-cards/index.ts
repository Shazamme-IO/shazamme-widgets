// Flip Cards widget controller. A list of photo cards that flip to a back with text, a link and an
// optional button. Needs no Shazamme data, so it never loads or waits for the SDK (see .no-sdk).
//
// Registered by the build as window.ShazammeWidget["flip-cards"]; the loader stub calls the default
// export with { element, data }. The editor re-runs it on every settings change: the previous run's
// listeners are torn down first, so nothing stacks up on the element, document or media query.

import type { DudaData } from '../../core/config';
import { wireFlip, watchReducedMotion } from './interactions';
import { cardsHtml } from './render';
import { readSettings, type Settings } from './settings';

interface WidgetContext {
  element: HTMLElement;
  data: DudaData;
}

const EMPTY_MESSAGE =
  '<p class="shm-fc-empty">Flip Cards: add at least one card (photo, title and back text) in the Content editor.</p>';

const teardowns = new WeakMap<HTMLElement, () => void>();

/** Per-breakpoint values and shape go to CSS as custom properties; the shared stylesheet picks them by media query. */
function applyLayout(root: HTMLElement, s: Settings): void {
  for (const bp of s.breakpoints) {
    let height = 'auto';
    let minHeight = '0px';
    let ratio = 'auto';
    if (bp.mode === 'fixed') {
      if (s.fillColumn) minHeight = `${bp.height}px`;
      else height = `${bp.height}px`;
    } else if (bp.mode === 'min') {
      minHeight = `${bp.height}px`;
    } else {
      ratio = bp.aspect.replace(':', ' / ');
    }
    root.style.setProperty(`--shm-fc-cols-${bp.key}`, String(bp.columns));
    root.style.setProperty(`--shm-fc-gap-${bp.key}`, `${bp.gap}px`);
    root.style.setProperty(`--shm-fc-h-${bp.key}`, height);
    root.style.setProperty(`--shm-fc-minh-${bp.key}`, minHeight);
    root.style.setProperty(`--shm-fc-ar-${bp.key}`, ratio);
  }
  root.style.setProperty('--shm-fc-radius', s.radius.map((r) => `${r}px`).join(' '));
  root.style.setProperty('--shm-fc-speed', `${s.speedMs}ms`);
  root.classList.toggle('is-vertical', s.vertical);
  root.classList.toggle('is-noflip', s.flipStyle === 'none');
  root.classList.toggle('is-fill', s.fillColumn);
  root.classList.toggle('is-stretch', s.stretchLastRow);
}

export default function flipCards({ element, data }: WidgetContext): void {
  teardowns.get(element)?.();
  teardowns.delete(element);

  const root = element.querySelector<HTMLElement>('.shm-flip-cards');
  const grid = root?.querySelector<HTMLElement>('.shm-fc-grid');
  if (!root || !grid) return;

  const settings = readSettings(data?.config ?? {}, root);
  applyLayout(root, settings);
  root.classList.toggle('is-fade', settings.flipStyle === 'fade');

  if (!settings.cards.length) {
    grid.innerHTML = data?.inEditor ? EMPTY_MESSAGE : '';
  } else {
    grid.innerHTML = cardsHtml(settings);
    const stops: Array<() => void> = [watchReducedMotion(root, settings.flipStyle === 'fade')];
    if (settings.flipStyle !== 'none') stops.push(wireFlip(root, grid, settings.hoverFlip));
    teardowns.set(element, () => stops.forEach((stop) => stop()));
  }

  root.classList.add('is-ready');
}

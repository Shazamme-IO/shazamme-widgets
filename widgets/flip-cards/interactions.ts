// Flip behaviour. Every listener is recorded, so the returned teardown removes them all (the
// editor re-runs the widget on each settings change). Plain removeEventListener, not an
// AbortSignal, so it also works on the older Safari builds the es2018 target allows.

const CARD = '.shm-fc-card';
const SCROLL_KEYS = new Map<string, number>([['ArrowDown', 40], ['ArrowUp', -40], ['PageDown', 200], ['PageUp', -200]]);

const cardOf = (node: EventTarget | null): HTMLElement | null =>
  node instanceof Element ? node.closest<HTMLElement>(CARD) : null;
const linkOf = (card: Element): HTMLElement | null => card.querySelector<HTMLElement>('.shm-fc-link');
const isFlipped = (card: Element): boolean => card.classList.contains('is-flipped');

function setFlipped(grid: Element, card: HTMLElement, flipped: boolean): void {
  if (isFlipped(card) === flipped) return;
  if (flipped) closeAll(grid, card);
  card.classList.toggle('is-flipped', flipped);
  card.querySelector('.shm-fc-front')?.setAttribute('aria-hidden', String(flipped));
  card.querySelector('.shm-fc-back')?.setAttribute('aria-hidden', String(!flipped));
}

function closeAll(grid: Element, except: Element | null): void {
  grid.querySelectorAll<HTMLElement>(`${CARD}.is-flipped`).forEach((c) => {
    if (c !== except) setFlipped(grid, c, false);
  });
}

export function wireFlip(root: HTMLElement, grid: HTMLElement, hoverFlip: boolean): () => void {
  const doc = root.ownerDocument;
  const bound: Array<[EventTarget, string, EventListener]> = [];
  const on = <T extends Event>(target: EventTarget, type: string, fn: (e: T) => void) => {
    target.addEventListener(type, fn as EventListener);
    bound.push([target, type, fn as EventListener]);
  };
  const teardown = () => {
    bound.splice(0).forEach(([target, type, fn]) => target.removeEventListener(type, fn));
  };
  let pointerType = 'mouse';
  let pointerFocus = false;
  let lastInput: 'pointer' | 'key' = 'pointer';

  on<PointerEvent>(root, 'pointerdown', (e) => {
    pointerType = e.pointerType || 'mouse';
    pointerFocus = true;
    lastInput = 'pointer';
  });

  on<KeyboardEvent>(root, 'keydown', (e) => {
    pointerFocus = false;
    lastInput = 'key';
    const card = cardOf(e.target);
    if (!card) return;
    if (e.key === 'Escape' || e.key === 'Esc') {
      setFlipped(grid, card, false);
      if (e.target !== card) card.focus();
      return;
    }
    if (e.target !== card) return;
    if (e.key === 'Enter') {
      const link = linkOf(card);
      if (isFlipped(card) && link) link.click();
      else setFlipped(grid, card, true);
      e.preventDefault();
    } else if (e.key === ' ' || e.key === 'Spacebar') {
      setFlipped(grid, card, !isFlipped(card));
      e.preventDefault();
    } else if (isFlipped(card) && SCROLL_KEYS.has(e.key)) {
      const body = card.querySelector<HTMLElement>('.shm-fc-back-body');
      if (body && body.scrollHeight > body.clientHeight) {
        body.scrollTop += SCROLL_KEYS.get(e.key) ?? 0;
        e.preventDefault();
      }
    }
  });

  on<FocusEvent>(root, 'focusin', (e) => {
    const card = cardOf(e.target);
    if (card && e.target === card && !pointerFocus) setFlipped(grid, card, true);
  });

  on<FocusEvent>(root, 'focusout', (e) => {
    const card = cardOf(e.target);
    const next = e.relatedTarget;
    if (card && !(next instanceof Node && card.contains(next))) setFlipped(grid, card, false);
  });

  on<PointerEvent>(root, 'pointerover', (e) => {
    const card = cardOf(e.target);
    if (card && hoverFlip && e.pointerType === 'mouse') setFlipped(grid, card, true);
  });

  on<PointerEvent>(root, 'pointerout', (e) => {
    const card = cardOf(e.target);
    const next = e.relatedTarget;
    if (!card || !hoverFlip || e.pointerType !== 'mouse' || (next instanceof Node && card.contains(next))) return;
    // A card a keyboard user has focused stays open when a parked mouse leaves it.
    if (lastInput === 'key' && card.contains(doc.activeElement)) return;
    setFlipped(grid, card, false);
  });

  on<MouseEvent>(root, 'click', (e) => {
    pointerFocus = false;
    const card = cardOf(e.target);
    if (!card) return;
    const link = linkOf(card);
    const flipped = isFlipped(card);
    const onLink = e.target instanceof Element && !!e.target.closest('.shm-fc-link');
    if (flipped && link) {
      if (!onLink) link.click();
      return;
    }
    if (onLink) e.preventDefault();
    const clickType = ('pointerType' in e && (e as PointerEvent).pointerType) || (e.detail === 0 ? 'synthetic' : pointerType);
    if (flipped && clickType === 'mouse' && hoverFlip) return;
    setFlipped(grid, card, !flipped);
  });

  // The one listener outside the widget: a tap elsewhere on the page closes open cards.
  on<PointerEvent>(doc, 'pointerdown', (e) => {
    if (!root.isConnected) return teardown();
    if (!(e.target instanceof Node) || !root.contains(e.target)) closeAll(grid, null);
  });

  return teardown;
}

/** Fade instead of flip: the Fade setting, and visitors who ask for less motion. Returns a teardown. */
export function watchReducedMotion(root: HTMLElement, fadeSetting: boolean): () => void {
  const query = root.ownerDocument.defaultView?.matchMedia?.('(prefers-reduced-motion: reduce)');
  if (!query) return () => undefined;
  const apply = () => root.classList.toggle('is-fade', fadeSetting || query.matches);
  apply();
  // Older Safari only has addListener/removeListener.
  if (query.addEventListener) query.addEventListener('change', apply);
  else query.addListener(apply);
  return () => {
    if (query.removeEventListener) query.removeEventListener('change', apply);
    else query.removeListener(apply);
  };
}

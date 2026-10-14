// Modal popup: a single review in full ("Read more"), or the badge's full review
// list. Appended to <body> so a Duda container's overflow/z-index can't clip it;
// it copies the widget's theme variables so it is styled identically.
//
// Only one popup is ever open: opening another closes the first, so the body
// scroll lock is captured once and always restored.

import { CLOSE } from './format';

const FOCUSABLE = 'a[href],button:not([disabled]),[tabindex]:not([tabindex="-1"])';

let closeCurrent: (() => void) | null = null;

export function openPopup(themeSource: HTMLElement, contentHtml: string, onMount?: (content: HTMLElement) => void): () => void {
  closeCurrent?.();
  const previousFocus = document.activeElement as HTMLElement | null;
  const root = document.createElement('div');
  root.className = 'es-embed-root es-popup-root';
  root.setAttribute('style', themeSource.getAttribute('style') ?? '');
  root.innerHTML =
    `<div class="es-popup-overlay" data-action="close-popup"></div>` +
    `<div class="es-popup-content-container" role="dialog" aria-modal="true" aria-label="Google reviews" tabindex="-1">` +
    `<button type="button" class="es-popup-close" data-action="close-popup" aria-label="Close">${CLOSE}</button>` +
    `<div class="es-popup-content">${contentHtml}</div></div>`;
  document.body.appendChild(root);
  const dialog = root.querySelector<HTMLElement>('.es-popup-content-container')!;
  const prevOverflow = document.body.style.overflow;
  document.body.style.overflow = 'hidden';

  function onKey(e: KeyboardEvent): void {
    if (e.key === 'Escape') {
      close();
      return;
    }
    if (e.key !== 'Tab') return;
    // Keep Tab inside the dialog — aria-modal promises it, the browser doesn't enforce it.
    const items = Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((el) => !el.hidden);
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && (document.activeElement === first || !dialog.contains(document.activeElement))) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  function close(): void {
    document.removeEventListener('keydown', onKey);
    root.remove();
    document.body.style.overflow = prevOverflow;
    if (closeCurrent === close) closeCurrent = null;
    // The opener may be gone (badge closed, widget re-rendered) — fall back to the widget.
    const target = previousFocus?.isConnected ? previousFocus : themeSource;
    target.focus?.({ preventScroll: true });
  }

  root.addEventListener('click', (e) => {
    if ((e.target as Element).closest('[data-action="close-popup"]')) close();
  });
  document.addEventListener('keydown', onKey);
  closeCurrent = close;
  root.querySelector<HTMLElement>('.es-popup-close')?.focus();
  onMount?.(root.querySelector<HTMLElement>('.es-popup-content')!);
  return close;
}

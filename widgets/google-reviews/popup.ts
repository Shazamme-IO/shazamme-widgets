// Modal popup: a single review in full ("Read more"), or the badge's full review
// list. Appended to <body> so a Duda container's overflow/z-index can't clip it;
// it copies the widget's theme variables so it is styled identically.

import { CLOSE } from './format';

export function openPopup(themeSource: HTMLElement, contentHtml: string, onMount?: (content: HTMLElement) => void): () => void {
  const previousFocus = document.activeElement as HTMLElement | null;
  const root = document.createElement('div');
  root.className = 'es-embed-root es-popup-root';
  root.setAttribute('style', themeSource.getAttribute('style') ?? '');
  root.innerHTML =
    `<div class="es-popup-overlay" data-action="close-popup"></div>` +
    `<div class="es-popup-content-container" role="dialog" aria-modal="true" aria-label="Google reviews">` +
    `<button type="button" class="es-popup-close" data-action="close-popup" aria-label="Close">${CLOSE}</button>` +
    `<div class="es-popup-content">${contentHtml}</div></div>`;
  document.body.appendChild(root);
  const prevOverflow = document.body.style.overflow;
  document.body.style.overflow = 'hidden';

  function onKey(e: KeyboardEvent): void {
    if (e.key === 'Escape') close();
  }
  function close(): void {
    document.removeEventListener('keydown', onKey);
    root.remove();
    document.body.style.overflow = prevOverflow;
    previousFocus?.focus?.();
  }
  root.addEventListener('click', (e) => {
    if ((e.target as Element).closest('[data-action="close-popup"]')) close();
  });
  document.addEventListener('keydown', onKey);
  root.querySelector<HTMLElement>('.es-popup-close')?.focus();
  onMount?.(root.querySelector<HTMLElement>('.es-popup-content')!);
  return close;
}

// An accessible modal: focus moves in, Tab is trapped, Esc / backdrop / the close button
// close it, focus returns to the button that opened it, the page behind is inert and stops
// scrolling, so keyboard, pointer and screen reader users all stay inside it.

export interface DialogHandle {
  close(): void;
}

export interface DialogOptions {
  trigger: HTMLElement | null;
  /** Gets focus on close when the trigger is gone or hidden (a resize can hide it). */
  fallback?: HTMLElement | null;
  onClosed?: () => void;
}

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"]), input, select, textarea';

function isUsable(el: HTMLElement | null | undefined): el is HTMLElement {
  return Boolean(el && el.isConnected && !el.closest('[hidden]'));
}

export function openDialog(html: string, { trigger, fallback, onClosed }: DialogOptions): DialogHandle {
  const host = document.createElement('div');
  host.className = 'shm-tm-dialog';
  host.innerHTML = html;

  const body = document.body;
  const behind = Array.from(body.children).filter((el): el is HTMLElement => el instanceof HTMLElement && !el.hasAttribute('inert'));
  body.appendChild(host);
  behind.forEach((el) => el.setAttribute('inert', ''));

  const panel = host.querySelector<HTMLElement>('.shm-tm-dialog-panel');
  const closeBtn = host.querySelector<HTMLElement>('.shm-tm-dialog-close');
  const previousOverflow = body.style.overflow;
  const previousPadding = body.style.paddingRight;
  const scrollbar = window.innerWidth - document.documentElement.clientWidth;
  body.style.overflow = 'hidden';
  if (scrollbar > 0) body.style.paddingRight = `${scrollbar}px`;
  let closed = false;

  const focusables = (): HTMLElement[] =>
    Array.from(host.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((el) => !el.hasAttribute('hidden'));

  function close(): void {
    if (closed) return;
    closed = true;
    document.removeEventListener('keydown', onKey, true);
    host.remove();
    behind.forEach((el) => el.removeAttribute('inert'));
    body.style.overflow = previousOverflow;
    body.style.paddingRight = previousPadding;
    const target = isUsable(trigger) ? trigger : isUsable(fallback) ? fallback : null;
    if (target) {
      if (!target.matches('button, a[href], [tabindex]')) target.setAttribute('tabindex', '-1');
      target.focus();
    }
    onClosed?.();
  }

  function onKey(e: KeyboardEvent): void {
    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      close();
      return;
    }
    if (e.key !== 'Tab') return;
    const items = focusables();
    if (items.length === 0) {
      e.preventDefault();
      panel?.focus();
      return;
    }
    const first = items[0];
    const last = items[items.length - 1];
    const active = document.activeElement;
    const outside = !host.contains(active) || active === panel;
    if (e.shiftKey && (active === first || outside)) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && (active === last || outside)) {
      e.preventDefault();
      first.focus();
    }
  }

  host.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    if (target.closest('.shm-tm-dialog-close') || target.hasAttribute('data-close')) close();
  });
  document.addEventListener('keydown', onKey, true);

  panel?.setAttribute('tabindex', '-1');
  (closeBtn ?? panel)?.focus();
  return { close };
}

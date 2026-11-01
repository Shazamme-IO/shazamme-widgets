// An accessible modal: focus moves in, Tab is trapped, Esc / backdrop / the close button
// close it, focus returns to the button that opened it, the page behind is inert and stops
// scrolling, so keyboard, pointer and screen reader users all stay inside it.

export interface DialogHandle {
  close(restoreFocus?: boolean): void;
}

export interface DialogOptions {
  trigger: HTMLElement | null;
  /** Gets focus on close when the trigger is gone or hidden (a resize can hide it). */
  fallback?: HTMLElement | null;
  /** Runs once the page is live again, before focus returns (bring the trigger back into view here). */
  beforeFocus?: () => void;
  onClosed?: () => void;
}

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"]), input, select, textarea';

function isUsable(el: HTMLElement | null | undefined): el is HTMLElement {
  return Boolean(el && el.isConnected && !el.closest('[hidden], [inert]'));
}

interface PageLock {
  behind: HTMLElement[];
  overflow: string;
  padding: string;
  open: number;
}

/** Shared by every open dialog, so closing one never un-locks the page under another. */
let lock: PageLock | null = null;
/** Open dialogs, newest last: only the top one answers the keyboard. */
const stack: HTMLElement[] = [];

function lockPage(host: HTMLElement): void {
  const body = document.body;
  if (lock) {
    lock.open += 1;
    return;
  }
  const behind = Array.from(body.children).filter((el): el is HTMLElement => el instanceof HTMLElement && el !== host && !el.hasAttribute('inert'));
  lock = { behind, overflow: body.style.overflow, padding: body.style.paddingRight, open: 1 };
  const scrollbar = window.innerWidth - document.documentElement.clientWidth;
  behind.forEach((el) => el.setAttribute('inert', ''));
  body.style.overflow = 'hidden';
  if (scrollbar > 0) body.style.paddingRight = `${scrollbar}px`;
}

function unlockPage(): void {
  if (!lock) return;
  lock.open -= 1;
  if (lock.open > 0) return;
  lock.behind.forEach((el) => el.removeAttribute('inert'));
  document.body.style.overflow = lock.overflow;
  document.body.style.paddingRight = lock.padding;
  lock = null;
}

export function openDialog(html: string, { trigger, fallback, beforeFocus, onClosed }: DialogOptions): DialogHandle {
  const host = document.createElement('div');
  host.className = 'shm-tm-dialog';
  host.innerHTML = html;

  document.body.appendChild(host);
  lockPage(host);
  stack.push(host);

  const panel = host.querySelector<HTMLElement>('.shm-tm-dialog-panel');
  const closeBtn = host.querySelector<HTMLElement>('.shm-tm-dialog-close');
  let closed = false;

  const focusables = (): HTMLElement[] =>
    Array.from(host.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((el) => !el.hasAttribute('hidden'));

  function close(restoreFocus = true): void {
    if (closed) return;
    closed = true;
    document.removeEventListener('keydown', onKey, true);
    host.remove();
    stack.splice(stack.indexOf(host), 1);
    unlockPage();
    if (restoreFocus) beforeFocus?.();
    const target = restoreFocus ? (isUsable(trigger) ? trigger : isUsable(fallback) ? fallback : null) : null;
    if (target) {
      if (!target.matches('button, a[href], [tabindex]')) target.setAttribute('tabindex', '-1');
      target.focus();
    }
    onClosed?.();
  }

  function onKey(e: KeyboardEvent): void {
    if (stack[stack.length - 1] !== host) return;
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

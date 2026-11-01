// An accessible modal: focus moves in, Tab is trapped, Esc / backdrop / the close button
// close it, focus returns to the button that opened it, and the page stops scrolling behind it.

export interface DialogHandle {
  close(): void;
}

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"]), input, select, textarea';

export function openDialog(html: string, trigger: HTMLElement | null, onClosed?: () => void): DialogHandle {
  const host = document.createElement('div');
  host.className = 'shm-tm-dialog';
  host.innerHTML = html;
  document.body.appendChild(host);

  const panel = host.querySelector<HTMLElement>('.shm-tm-dialog-panel');
  const closeBtn = host.querySelector<HTMLElement>('.shm-tm-dialog-close');
  const previousOverflow = document.body.style.overflow;
  document.body.style.overflow = 'hidden';
  let closed = false;

  const focusables = (): HTMLElement[] =>
    Array.from(host.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((el) => !el.hasAttribute('hidden'));

  function close(): void {
    if (closed) return;
    closed = true;
    document.removeEventListener('keydown', onKey, true);
    host.remove();
    document.body.style.overflow = previousOverflow;
    if (trigger && trigger.isConnected) trigger.focus();
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
    if (e.shiftKey && (active === first || !host.contains(active))) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && (active === last || !host.contains(active))) {
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

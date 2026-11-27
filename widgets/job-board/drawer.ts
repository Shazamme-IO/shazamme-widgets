// The filter panel below 1024px: the sidebar becomes a modal dialog. Focus moves in and is kept inside (Tab and
// Shift+Tab wrap), Esc closes, focus goes back to the Filters button, the page behind does not scroll and is inert.
// The scroll lock is counted across every open sheet on the page, so it lifts only when the last one closes. Esc
// closes only the sheet opened last, and a sheet whose widget Duda removes while it is open closes itself.

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export interface Drawer {
  open(): void;
  close(returnFocus: boolean): void;
  isOpen(): boolean;
  destroy(): void;
}

let locks = 0;
let savedOverflow = '';
/** Open sheets, the one opened last at the end: only it answers Esc. */
const stack: object[] = [];

function lockScroll(): void {
  if (locks === 0) {
    savedOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
  }
  locks += 1;
}

function unlockScroll(): void {
  if (locks === 0) return;
  locks -= 1;
  if (locks === 0) document.body.style.overflow = savedOverflow;
}

/** Make everything beside the sheet (and beside each of its ancestors, up to body) inert. Returns what it changed. */
function inertOutside(side: HTMLElement, keep: HTMLElement): HTMLElement[] {
  const changed: HTMLElement[] = [];
  for (let node: HTMLElement | null = side; node && node !== document.body; node = node.parentElement) {
    const parent: HTMLElement | null = node.parentElement;
    if (!parent) break;
    for (const sib of [...parent.children] as HTMLElement[]) {
      if (sib === node || sib === keep || sib.hasAttribute('inert') || sib.tagName === 'SCRIPT') continue;
      sib.setAttribute('inert', '');
      changed.push(sib);
    }
  }
  return changed;
}

/**
 * onGone runs when the sheet is found removed from the page (while open, or on the next key press), after the sheet
 * has closed and lifted its scroll lock and inert attributes.
 */
export function createDrawer(side: HTMLElement, opener: HTMLButtonElement, backdrop: HTMLElement, onGone?: () => void): Drawer {
  let open = false;
  let inerted: HTMLElement[] = [];
  let watcher: MutationObserver | null = null;
  const token = {};

  const gone = (): boolean => {
    if (side.isConnected) return false;
    api.close(false);
    onGone?.();
    return true;
  };

  const focusables = (): HTMLElement[] =>
    [...side.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((el) => !el.closest('[hidden]'));

  const onKey = (e: KeyboardEvent): void => {
    if (!open || gone()) return;
    if (e.key === 'Escape') {
      // Something else already used this Esc (a menu inside the sheet), or a sheet opened later is on top.
      if (e.defaultPrevented || stack[stack.length - 1] !== token) return;
      e.preventDefault();
      api.close(true);
      return;
    }
    if (e.key !== 'Tab') return;
    const list = focusables();
    if (!list.length) return;
    const first = list[0];
    const last = list[list.length - 1];
    const active = document.activeElement;
    if (e.shiftKey && (active === first || !side.contains(active))) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && (active === last || !side.contains(active))) {
      e.preventDefault();
      first.focus();
    }
  };

  const api: Drawer = {
    open() {
      if (open) return;
      open = true;
      side.classList.add('is-open');
      side.setAttribute('role', 'dialog');
      side.setAttribute('aria-modal', 'true');
      backdrop.hidden = false;
      opener.setAttribute('aria-expanded', 'true');
      lockScroll();
      inerted = inertOutside(side, backdrop);
      stack.push(token);
      document.addEventListener('keydown', onKey, true);
      if (typeof MutationObserver === 'function') {
        watcher = new MutationObserver(() => void gone());
        watcher.observe(document.body, { childList: true, subtree: true });
      }
      const target = side.querySelector<HTMLElement>('.shm-jb-close') ?? focusables()[0];
      target?.focus();
    },
    close(returnFocus) {
      if (!open) return;
      open = false;
      side.classList.remove('is-open');
      side.removeAttribute('role');
      side.removeAttribute('aria-modal');
      backdrop.hidden = true;
      opener.setAttribute('aria-expanded', 'false');
      for (const el of inerted) el.removeAttribute('inert');
      inerted = [];
      unlockScroll();
      const at = stack.indexOf(token);
      if (at >= 0) stack.splice(at, 1);
      watcher?.disconnect();
      watcher = null;
      document.removeEventListener('keydown', onKey, true);
      if (returnFocus && opener.isConnected) opener.focus();
    },
    isOpen: () => open,
    destroy() {
      api.close(false);
    },
  };
  return api;
}

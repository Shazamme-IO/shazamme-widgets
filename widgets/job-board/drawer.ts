// The filter panel below 1024px: the sidebar becomes a modal dialog. Focus moves in and is kept inside (Tab and
// Shift+Tab wrap), Esc closes, focus goes back to the Filters button, and the page behind does not scroll.

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export interface Drawer {
  open(): void;
  close(returnFocus: boolean): void;
  isOpen(): boolean;
  destroy(): void;
}

export function createDrawer(side: HTMLElement, opener: HTMLButtonElement, backdrop: HTMLElement): Drawer {
  let open = false;
  let savedOverflow = '';

  const focusables = (): HTMLElement[] =>
    [...side.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((el) => !el.closest('[hidden]'));

  const onKey = (e: KeyboardEvent): void => {
    if (!open) return;
    if (e.key === 'Escape') {
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
      savedOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', onKey, true);
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
      document.body.style.overflow = savedOverflow;
      document.removeEventListener('keydown', onKey, true);
      if (returnFocus) opener.focus();
    },
    isOpen: () => open,
    destroy() {
      api.close(false);
    },
  };
  return api;
}

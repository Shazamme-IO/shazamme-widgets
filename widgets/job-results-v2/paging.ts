// Pagination — faithful `button-paging` markup with zero-based data-page-number.
// Rendered as a string into the stable paging container; clicks are handled by a
// single delegated listener on the results region (bound once, never rebound).

import { setHtml } from '../../core/dom';

const MAX_VISIBLE = 5;

interface PageButton {
  label: string;
  page: number | null;
  active: boolean;
  disabled: boolean;
}

function windowBounds(page: number, totalPages: number): [number, number] {
  const half = Math.floor(MAX_VISIBLE / 2);
  let start = Math.max(0, page - half);
  const end = Math.min(totalPages, start + MAX_VISIBLE);
  start = Math.max(0, end - MAX_VISIBLE);
  return [start, end];
}

function buildButtons(page: number, totalPages: number): PageButton[] {
  const buttons: PageButton[] = [];
  buttons.push({ label: '<<', page: page - 1, active: false, disabled: page <= 0 });

  const [start, end] = windowBounds(page, totalPages);
  if (start > 0) {
    buttons.push({ label: '1', page: 0, active: page === 0, disabled: false });
    if (start > 1) buttons.push({ label: '...', page: null, active: false, disabled: true });
  }
  for (let i = start; i < end; i++) {
    buttons.push({ label: String(i + 1), page: i, active: i === page, disabled: false });
  }
  if (end < totalPages) {
    if (end < totalPages - 1) buttons.push({ label: '...', page: null, active: false, disabled: true });
    buttons.push({ label: String(totalPages), page: totalPages - 1, active: page === totalPages - 1, disabled: false });
  }

  buttons.push({ label: '>>', page: page + 1, active: false, disabled: page >= totalPages - 1 });
  return buttons;
}

function buttonHtml(b: PageButton): string {
  const classes = ['button-paging'];
  if (b.active) classes.push('active');
  if (b.disabled) classes.push('disabled');
  const rel = b.disabled || b.page === null ? '' : ' data-rel="paging-select"';
  const pageAttr = b.page === null ? '' : ` data-page-number="${b.page}"`;
  return `<a class="${classes.join(' ')}"${rel}${pageAttr}>${b.label}</a>`;
}

/** Render the pager. Hidden when a single page (or fewer) of results. */
export function renderPaging(container: Element, total: number, pageSize: number, page: number): void {
  const totalPages = pageSize > 0 ? Math.ceil(total / pageSize) : 1;
  if (totalPages <= 1) {
    setHtml(container, '');
    return;
  }
  const html = buildButtons(page, totalPages).map(buttonHtml).join('');
  setHtml(container, html);
}

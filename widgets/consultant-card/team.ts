// Team mode in the page: the list (grid or slider), and when switched on the search box
// and the sector and location buttons above it. Filtering happens in the browser on the
// consultants already loaded. Returns a teardown for the editor's re-runs.

import { applyFilters, distinctValues, type ActiveFilters, type Consultant } from './data';
import { esc, listHtml, resultsText, toolsHtml } from './render';
import type { Settings } from './settings';
import { mountSlider } from './slider';

/** Typing waits this long after the last key before the list redraws, so a slider is not reset on every key. */
export const SEARCH_DEBOUNCE_MS = 150;

/** An id of the element's own, so two copies on one page (or a re-run) never share a label target. */
export function uniqueId(): string {
  const c = (globalThis as { crypto?: { randomUUID?: () => string } }).crypto;
  if (c && typeof c.randomUUID === 'function') return c.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function sameFilters(a: ActiveFilters, b: ActiveFilters): boolean {
  return a.sector === b.sector && a.location === b.location && a.query.trim().toLowerCase() === b.query.trim().toLowerCase();
}

export function hasTools(s: Settings): boolean {
  return s.showSearch || s.showClassificationFilter || s.showLocationFilter;
}

/** Editor-only notes for a filter that has nothing to filter on, so the site builder knows why it is missing. */
function editorNotes(s: Settings, sectors: string[], locations: string[]): string {
  const notes = [
    s.showClassificationFilter && !sectors.length ? 'no consultant has a sector (classification), so the sector buttons are hidden.' : '',
    s.showLocationFilter && !locations.length ? 'no consultant has a location, so the location buttons are hidden.' : '',
  ].filter(Boolean);
  return notes.map((n) => `<div class="shm-cc-editor-note" role="note">Consultant Card: ${esc(n)}</div>`).join('');
}

export function mountTeam(stage: HTMLElement, items: Consultant[], s: Settings, counts: Map<string, number> | null, inEditor: boolean): () => void {
  if (!hasTools(s)) {
    stage.innerHTML = listHtml(items, s, counts);
    return mountSlider(stage, s);
  }
  const uid = `shm-cc-${uniqueId()}`;
  const sectors = distinctValues(items, 'sectors');
  const locations = distinctValues(items, 'locations');
  const notes = inEditor ? editorNotes(s, sectors, locations) : '';
  stage.innerHTML = notes + toolsHtml(uid, s, { sectors, locations }, listHtml(items, s, counts));
  const results = stage.querySelector<HTMLElement>('[data-shm-cc-results]')!;
  const status = stage.querySelector<HTMLElement>('[data-shm-cc-status]')!;
  const tools = stage.querySelector<HTMLElement>('.shm-cc-tools')!;
  const search = stage.querySelector<HTMLInputElement>('[data-shm-cc-search]');
  let active: ActiveFilters = { sector: '', location: '', query: '' };
  let teardownSlider = mountSlider(results, s);

  let pending = 0;
  let announcing = 0;

  /** Clears the live region, then fills it a tick later, so the same count twice in a row is still read out. */
  const announce = (text: string): void => {
    window.clearTimeout(announcing);
    status.textContent = '';
    announcing = window.setTimeout(() => {
      announcing = 0;
      status.textContent = text;
    }, 0);
  };

  /** Redraws the list and announces how many are shown (or the no-match message) after every real change. */
  const update = (next: ActiveFilters): void => {
    if (sameFilters(next, active)) return;
    active = next;
    teardownSlider();
    const shown = applyFilters(items, active);
    results.innerHTML = listHtml(shown, s, counts);
    announce(shown.length ? resultsText(shown.length, s) : s.noMatchText);
    teardownSlider = mountSlider(results, s);
  };

  const onClick = (e: Event): void => {
    const button = (e.target as Element | null)?.closest?.<HTMLButtonElement>('.shm-cc-filter');
    const group = button?.closest<HTMLElement>('[data-shm-cc-group]');
    if (!button || !group) return;
    group.querySelectorAll('.shm-cc-filter').forEach((b) => b.setAttribute('aria-pressed', String(b === button)));
    const value = button.getAttribute('data-value') ?? '';
    update(group.getAttribute('data-shm-cc-group') === 'sector' ? { ...active, sector: value } : { ...active, location: value });
  };
  const onInput = (): void => {
    window.clearTimeout(pending);
    pending = window.setTimeout(() => {
      pending = 0;
      update({ ...active, query: search?.value ?? '' });
    }, SEARCH_DEBOUNCE_MS);
  };

  tools.addEventListener('click', onClick);
  search?.addEventListener('input', onInput);
  return () => {
    window.clearTimeout(pending);
    window.clearTimeout(announcing);
    teardownSlider();
    tools.removeEventListener('click', onClick);
    search?.removeEventListener('input', onInput);
  };
}

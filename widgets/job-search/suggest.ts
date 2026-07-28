// Non-Google location autocomplete. Replaces the legacy Google Places
// getPlacePredictions + per-keystroke getDetails (teardown slow-pattern #6) with
// core/geo geocode.maps.co behind a debounce — geometry is resolved on the
// SELECTION only, never per keystroke. No Fuse.js, no Google.

import { geocode, debounce, type GeocodeResult } from '../../core/geo';
import { setHtml } from '../../core/dom';

const GEOCODE_DEBOUNCE_MS = 500;
const MAX_SUGGESTIONS = 6;

/** Minimal HTML-escape (kept local so the widget stays independent of core). */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Render the suggestion list into its host, or hide it when empty. */
export function renderSuggestions(host: HTMLElement, results: readonly GeocodeResult[]): void {
  if (results.length === 0) {
    setHtml(host, '');
    host.style.display = 'none';
    return;
  }
  const rows = results
    .slice(0, MAX_SUGGESTIONS)
    .map(
      (r) =>
        `<a href="javascript:void(0)" class="result-text" data-value="${r.lat},${r.lon}" data-label="${escapeHtml(
          r.label,
        )}">${escapeHtml(r.label)}</a>`,
    )
    .join('');
  setHtml(host, `${rows}<a href="javascript:void(0)" class="result-text close" data-value="" data-label="">close</a>`);
  host.style.display = 'flex';
}

/**
 * Build a debounced geocode runner. Calls `onResults` after the trailing edge;
 * network errors resolve to an empty list so the UI degrades quietly.
 */
export function makeGeocodeRunner(
  apiKey: string,
  onResults: (results: GeocodeResult[]) => void,
): (term: string) => void {
  return debounce((term: string) => {
    geocode(term, apiKey)
      .then(onResults)
      .catch(() => onResults([]));
  }, GEOCODE_DEBOUNCE_MS);
}

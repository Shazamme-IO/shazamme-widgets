// geocode.maps.co client — the one geocoder we keep (provider-agnostic).
// fetch is injected so this stays unit-testable with no network.

const GEOCODE_BASE = 'https://geocode.maps.co/search';

export interface GeocodeResult {
  label: string;
  lat: number;
  lon: number;
}

/** Raw geocode.maps.co row shape. */
interface RawGeocodeRow {
  display_name?: string;
  lat?: string | number;
  lon?: string | number;
}

type FetchImpl = (url: string) => Promise<{ json(): Promise<unknown> }>;

/** Build the geocode URL (exported for URL-construction tests). */
export function geocodeUrl(term: string, apiKey: string): string {
  return `${GEOCODE_BASE}?q=${encodeURIComponent(term)}&api_key=${apiKey}`;
}

/** Geocode a free-text location. Returns [] on empty input or no matches. */
export async function geocode(
  term: string,
  apiKey: string,
  fetchImpl: FetchImpl = fetch as unknown as FetchImpl,
): Promise<GeocodeResult[]> {
  const q = term.trim();
  if (q === '') return [];

  const res = await fetchImpl(geocodeUrl(q, apiKey));
  const rows = (await res.json()) as RawGeocodeRow[] | null;
  if (!Array.isArray(rows)) return [];

  return rows
    .map((r) => ({
      label: String(r.display_name ?? ''),
      lat: parseFloat(String(r.lat)),
      lon: parseFloat(String(r.lon)),
    }))
    .filter((r) => !isNaN(r.lat) && !isNaN(r.lon));
}

/** Trailing-edge debounce. Coalesces rapid calls into one after `delayMs`. */
export function debounce<A extends unknown[]>(
  fn: (...args: A) => void,
  delayMs: number,
): (...args: A) => void {
  let timer: ReturnType<typeof setTimeout> | undefined;
  return (...args: A): void => {
    if (timer !== undefined) clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delayMs);
  };
}

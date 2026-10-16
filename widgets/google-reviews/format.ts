// Small pure helpers shared by the renderers: escaping, dates, names, icons.

export function esc(v: unknown): string {
  return String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Only http(s) URLs reach an href/src — anything else renders as no link. */
export function safeUrl(v: unknown): string {
  const s = String(v ?? '').trim();
  return /^https?:\/\//i.test(s) ? esc(s) : '';
}

const UNITS: [number, string][] = [
  [365 * 24 * 3600, 'year'],
  [30 * 24 * 3600, 'month'],
  [24 * 3600, 'day'],
  [3600, 'hour'],
  [60, 'minute'],
];

/** "7 days ago" / "1 month ago" — the wording Google and Elfsight both use. */
export function relativeTime(epochSeconds: number | null, fallback = '', now = Date.now()): string {
  if (!epochSeconds) return fallback;
  const diff = Math.max(0, Math.round(now / 1000) - epochSeconds);
  for (const [size, unit] of UNITS) {
    const n = Math.floor(diff / size);
    if (n >= 1) return `${n} ${unit}${n > 1 ? 's' : ''} ago`;
  }
  return 'just now';
}

export function formatName(name: string, format: 'fullName' | 'firstName' | 'firstNameLastInitial'): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return 'Customer';
  if (format === 'firstName') return parts[0];
  if (format === 'firstNameLastInitial' && parts.length > 1) return `${parts[0]} ${parts[parts.length - 1][0]}.`;
  return name.trim();
}

/** "Excellent" / "Very good"… — header2's "<word> on Google" line. */
export function ratingWord(rating: number): string {
  if (rating >= 4.5) return 'Excellent';
  if (rating >= 4) return 'Very good';
  if (rating >= 3.5) return 'Good';
  if (rating >= 2.5) return 'Average';
  return 'Poor';
}

const AVATAR_COLOURS = ['#5c6bc0', '#689f38', '#455a64', '#7b1fa2', '#c2185b', '#0288d1', '#f4511e', '#00796b', '#5d4037', '#512da8'];

export function avatarColour(name: string): string {
  let h = 0;
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return AVATAR_COLOURS[h % AVATAR_COLOURS.length];
}

export const STAR_PATH = 'M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z';

/** Five stars, the last partially filled for fractional ratings (4.7 → 70% of star 5). */
export function stars(rating: number, cls = ''): string {
  const r = Math.max(0, Math.min(5, rating));
  let html = '';
  for (let i = 0; i < 5; i++) {
    const fill = Math.max(0, Math.min(1, r - i));
    html +=
      `<span class="es-rating-item">` +
      `<svg class="es-rating-item-unfilled" viewBox="2 1.6 20 20" aria-hidden="true"><path d="${STAR_PATH}"/></svg>` +
      (fill > 0
        ? `<span class="es-rating-item-filled" style="width:${Math.round(fill * 100)}%"><svg viewBox="2 1.6 20 20" aria-hidden="true"><path d="${STAR_PATH}"/></svg></span>`
        : '') +
      `</span>`;
  }
  return `<span class="es-rating-container ${cls}" role="img" aria-label="Rating: ${r} out of 5">${html}</span>`;
}

export const GOOGLE_G =
  '<svg class="es-google-g" viewBox="0 0 48 48" aria-hidden="true">' +
  '<path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>' +
  '<path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>' +
  '<path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>' +
  '<path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>' +
  '</svg>';

/** The coloured "Google" wordmark, as text so it scales with the font size around it. */
export const GOOGLE_WORDMARK =
  '<span class="es-google-logo" aria-label="Google">' +
  '<span style="color:#4285F4">G</span><span style="color:#EA4335">o</span><span style="color:#FBBC05">o</span>' +
  '<span style="color:#4285F4">g</span><span style="color:#34A853">l</span><span style="color:#EA4335">e</span></span>';

export const VERIFIED =
  '<svg class="es-verified-badge-icon" viewBox="0 0 24 24" role="img" aria-label="Verified by Google">' +
  '<path d="M23 12l-2.44-2.79.34-3.69-3.61-.82-1.89-3.2L12 2.96 8.6 1.5 6.71 4.69 3.1 5.5l.34 3.7L1 12l2.44 2.79-.34 3.7 3.61.82L8.6 22.5l3.4-1.47 3.4 1.46 1.89-3.19 3.61-.82-.34-3.69L23 12zm-12.91 4.72l-3.8-3.81 1.48-1.48 2.32 2.33 5.85-5.87 1.48 1.48-7.33 7.35z"/>' +
  '</svg>';

export const CHEVRON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8.6 5.4 10 4l8 8-8 8-1.4-1.4L15.2 12z"/></svg>';
export const CLOSE = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>';

// Typed readers over Duda's `data.config.*` — one place, no magic strings.
// Duda hands every setting through as a STRING (even booleans/numbers), so we
// coerce here and hand the rest of core a clean, typed object.

/** The raw Duda-injected data object. `config` values are strings in practice. */
export interface DudaData {
  config?: Record<string, unknown>;
  inEditor?: boolean;
  [key: string]: unknown;
}

/** Proximity radius unit: '6371' = miles slider, '12756' = km slider. */
export type ProximityDiameter = '6371' | '12756';

/** Card markup: 'classic' keeps the legacy shm* structure a site's own CSS may
 *  target; 'modern' is the semantic card whose look is driven by tokens. */
export type CardTemplate = 'classic' | 'modern';

export interface WidgetConfig {
  jobCollection: string;
  applicationPage: string;
  detailsPage: string;
  showJobTypeFilter: boolean;
  showClassificationFilter: boolean;
  showSubClassificationFilter: boolean;
  useSubFilters: boolean;
  showLocationFilter: boolean;
  proximityDiameter: ProximityDiameter;
  geocodeApiKey: string;
  pageSize: number;
  /** Drop the left-nav filter sidebar and render results full-width (filters then
   *  live on the job-search bar — the paxus/talent reference layout). */
  hideLeftNav: boolean;
  cardTemplate: CardTemplate;
  /** Card labels. The settings panel has always exposed these; the renderer used
   *  to hardcode the English, so editing them did nothing. */
  applyNowLabel: string;
  readMoreLabel: string;
  saveJobText: string;
  unsaveJobText: string;
  postedText: string;
  noResultsText: string;
  /** Appearance, mapped onto CSS custom properties at mount. Empty means "leave
   *  the stylesheet default alone". */
  accentColour: string;
  headerBackground: string;
  cardRadius: string;
}

const DEFAULT_PAGE_SIZE = 20;
const DEFAULT_PROXIMITY: ProximityDiameter = '6371';
const DEFAULT_DETAILS_PAGE = '/job-details';
const DEFAULT_APPLICATION_PAGE = '/job-application';

/** Duda serialises booleans as 'true'/'false' (or leaves them as real bools). */
export function coerceBool(value: unknown, fallback = false): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const v = value.trim().toLowerCase();
    if (v === 'true' || v === '1' || v === 'yes' || v === 'on') return true;
    if (v === 'false' || v === '0' || v === 'no' || v === 'off' || v === '') return false;
  }
  if (typeof value === 'number') return value !== 0;
  return fallback;
}

/** Coerce a config string to a positive integer, falling back on empty/NaN. */
export function coerceInt(value: unknown, fallback: number): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const n = parseInt(value.trim(), 10);
    if (Number.isFinite(n)) return n;
  }
  return fallback;
}

function coerceStr(value: unknown, fallback = ''): string {
  if (typeof value === 'string') return value;
  if (value == null) return fallback;
  return String(value);
}

function coerceProximity(value: unknown): ProximityDiameter {
  return coerceStr(value) === '12756' ? '12756' : DEFAULT_PROXIMITY;
}

function coerceTemplate(value: unknown): CardTemplate {
  return coerceStr(value).trim().toLowerCase() === 'classic' ? 'classic' : 'modern';
}

/** A page setting is a site-relative path. Duda hands it back with or without a
 *  leading slash depending on how it was typed, and `'/' + '/job-details'` builds
 *  `//job-details`, which a browser resolves as a host. Collapse to exactly one. */
export function rootPath(value: string, fallback: string): string {
  const raw = coerceStr(value).trim() || fallback;
  if (/^https?:\/\//i.test(raw)) return raw;
  return ('/' + raw).replace(/^\/+/, '/');
}

/** Read `data.config.*` into a typed, defaulted WidgetConfig. */
export function readConfig(data: DudaData | undefined): WidgetConfig {
  const c = (data && data.config) || {};
  return {
    jobCollection: coerceStr(c.JobCollection || c.jobCollection),
    applicationPage: rootPath(coerceStr(c.applicationPage), DEFAULT_APPLICATION_PAGE),
    detailsPage: rootPath(coerceStr(c.detailsPage), DEFAULT_DETAILS_PAGE),
    showJobTypeFilter: coerceBool(c.showJobTypeFilter),
    showClassificationFilter: coerceBool(c.showClassificationFilter),
    showSubClassificationFilter: coerceBool(c.showSubClassificationFilter),
    useSubFilters: coerceBool(c.useSubFilters),
    showLocationFilter: coerceBool(c.showLocationFilter),
    proximityDiameter: coerceProximity(c.proximityDiameter),
    geocodeApiKey: coerceStr(c.geocodeApiKey),
    pageSize: coerceInt(c.pageSize, DEFAULT_PAGE_SIZE),
    hideLeftNav: coerceBool(c.hideLeftNav),
    cardTemplate: coerceTemplate(c.cardTemplate),
    applyNowLabel: coerceStr(c.applyNowLabel, 'Apply Now'),
    readMoreLabel: coerceStr(c.readMoreLabel, 'Read More'),
    saveJobText: coerceStr(c.saveJobText, 'save job'),
    unsaveJobText: coerceStr(c.unsaveJobText, 'unsave job'),
    postedText: coerceStr(c.postedText, 'Posted'),
    noResultsText: coerceStr(c.resultMessageNone || c.noResultsText, 'No jobs match your search.'),
    accentColour: coerceStr(c.accentColour || c.accentColor),
    headerBackground: coerceStr(c.headerBackground),
    cardRadius: coerceStr(c.cardRadius),
  };
}

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
}

const DEFAULT_PAGE_SIZE = 20;
const DEFAULT_PROXIMITY: ProximityDiameter = '6371';

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

/** Read `data.config.*` into a typed, defaulted WidgetConfig. */
export function readConfig(data: DudaData | undefined): WidgetConfig {
  const c = (data && data.config) || {};
  return {
    jobCollection: coerceStr(c.JobCollection || c.jobCollection),
    applicationPage: coerceStr(c.applicationPage),
    detailsPage: coerceStr(c.detailsPage),
    showJobTypeFilter: coerceBool(c.showJobTypeFilter),
    showClassificationFilter: coerceBool(c.showClassificationFilter),
    showSubClassificationFilter: coerceBool(c.showSubClassificationFilter),
    useSubFilters: coerceBool(c.useSubFilters),
    showLocationFilter: coerceBool(c.showLocationFilter),
    proximityDiameter: coerceProximity(c.proximityDiameter),
    geocodeApiKey: coerceStr(c.geocodeApiKey),
    pageSize: coerceInt(c.pageSize, DEFAULT_PAGE_SIZE),
  };
}

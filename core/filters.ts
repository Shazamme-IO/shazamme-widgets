// Pure filter engine: keyword, facet, and geo (haversine) matching.
// No DOM, no globals — just data in, filtered data out.

import type { Job, GeoPoint, FilterOptions } from './types';

/** Default job fields the keyword searches across. */
const DEFAULT_KEYWORD_FIELDS: string[] = [
  'jobName',
  'title',
  'category',
  'subCategory',
  'city',
  'state',
  'country',
  'location',
  'fullDescription',
  'fullAddressForSearch',
  'referenceNumber',
  'tags',
];

const LOCATION_FIELDS: string[] = [
  'fullAddress',
  'fullAddressForSearch',
  'city',
  'state',
  'country',
  'location',
];

const MILES_TO_KM = 1.60934;
const DEFAULT_RANGE = 50;

/** Keys handled specially — never treated as plain facet fields. */
const RESERVED = new Set([
  'keyword',
  'geo',
  'geoRange',
  'geoAddress',
  'geoIn',
  'location',
  'salaryFrom',
  'salaryTo',
]);

function includesCI(value: unknown, term: string): boolean {
  if (typeof value !== 'string') return false;
  return value.toLowerCase().includes(term);
}

/** True if any of `fields` on the job contains `term` (case-insensitive). */
export function matchKeyword(
  job: Job,
  term: string,
  fields: string[] = DEFAULT_KEYWORD_FIELDS,
): boolean {
  const t = term.toLowerCase().trim();
  if (t === '') return true;
  return fields.some((f) => includesCI((job as Record<string, unknown>)[f], t));
}

function matchLocation(job: Job, term: string): boolean {
  return matchKeyword(job, term, LOCATION_FIELDS);
}

/** Haversine great-circle distance in kilometres (Earth radius 6371 km). */
export function haversineKm(a: GeoPoint, b: GeoPoint): number {
  const R = 6371;
  const toRad = (deg: number): number => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const h =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

/** Convert a slider range to km based on the proximityDiameter unit setting. */
export function rangeToKm(rawRange: number, proximityDiameter?: string): number {
  const isMiles = (proximityDiameter || '6371') !== '12756';
  return isMiles ? rawRange * MILES_TO_KM : rawRange;
}

function jobPoint(job: Job): GeoPoint | null {
  const lat = parseFloat(String(job.latitude));
  const lon = parseFloat(String(job.longitude));
  if (job.latitude == null || job.longitude == null || isNaN(lat) || isNaN(lon)) {
    return null;
  }
  return { lat, lon };
}

/** True if the job sits within `rangeKm` of ANY of the given geo points. */
export function withinRange(job: Job, geo: GeoPoint[], rangeKm: number): boolean {
  if (!geo || geo.length === 0) return true;
  const p = jobPoint(job);
  if (!p) return false;
  return geo.some((g) => haversineKm(g, p) <= rangeKm);
}

/** A filter payload: facet ids (string[]) plus special geo/keyword keys. */
export type FilterInput = Record<string, unknown[]>;

function asStrings(v: unknown[] | undefined): string[] {
  return (v ?? []).map((x) => String(x));
}

/** Apply keyword, facet, and geo filters. Returns a new array (pure). */
export function applyFilters(
  jobs: readonly Job[],
  state: FilterInput,
  opts: FilterOptions = {},
): Job[] {
  const keys = Object.keys(state);
  if (keys.length === 0) return jobs.slice();

  const keywordTerms = asStrings(state.keyword as unknown[]);
  const locationTerms = asStrings(state.location as unknown[]);
  const geoPoints = (state.geo as GeoPoint[] | undefined) ?? [];
  const hasGeo = geoPoints.length > 0;
  const rawRange =
    state.geoRange && (state.geoRange as unknown[])[0] != null
      ? parseFloat(String((state.geoRange as unknown[])[0]))
      : opts.defaultRange ?? DEFAULT_RANGE;
  const rangeKm = rangeToKm(rawRange, opts.proximityDiameter);

  return jobs.filter((job) => {
    // keyword — OR across terms
    if (keywordTerms.length > 0 && !keywordTerms.some((t) => matchKeyword(job, t, opts.keywordFields))) {
      return false;
    }
    // location keyword
    if (locationTerms.length > 0 && !locationTerms.some((t) => matchLocation(job, t))) {
      return false;
    }
    // geo radius
    if (hasGeo && !withinRange(job, geoPoints, rangeKm)) {
      return false;
    }
    // facet fields — AND across fields, OR within a field's ids
    for (const f of keys) {
      if (RESERVED.has(f)) continue;
      const vals = asStrings(state[f]);
      if (vals.length === 0) continue;
      const jobVal = String((job as Record<string, unknown>)[f] ?? '');
      if (!vals.includes(jobVal)) return false;
    }
    return true;
  });
}

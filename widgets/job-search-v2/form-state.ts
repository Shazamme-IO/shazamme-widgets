// Pure form ↔ payload ↔ hash serialisation for the job-search bar. No DOM here;
// the controller reads/writes the actual inputs and hands plain state through
// these functions. The published payload shape is dictated by the results
// widget's FilterChangePayload (state / keyword / geo / geoRange) — see
// core/pubsub — so the two widgets interoperate over the shared bus.

import { coerceBool, type DudaData, type ProximityDiameter } from '../../core/config';
import type { FacetLevel, FilterState, GeoPoint } from '../../core/types';
import type { FilterChangePayload } from '../../core/pubsub';

export const DEFAULT_GEO_RANGE = 50;

/** Levels the search dropdowns are populated from (role depends on profession). */
export const SEARCH_LEVELS: FacetLevel[] = [
  { field: 'jobTypeID', labelKey: 'jobType', idKey: 'jobTypeID' },
  { field: 'professionID', labelKey: 'category', idKey: 'professionID' },
  { field: 'roleID', labelKey: 'subCategory', idKey: 'roleID', parentField: 'professionID' },
  { field: 'workTypeID', labelKey: 'workType', idKey: 'workTypeID' },
  { field: 'workModelID', labelKey: 'workModel', idKey: 'workModelID' },
  { field: 'state', labelKey: 'state', idKey: 'state' },
];

/** Everything the search bar collects before it publishes. */
export interface FormState {
  facets: FilterState;
  keyword: string;
  geo: GeoPoint | null;
  geoAddress: string;
  geoRange: number;
}

export function emptyForm(): FormState {
  return { facets: {}, keyword: '', geo: null, geoAddress: '', geoRange: DEFAULT_GEO_RANGE };
}

/** Immutable patch. */
export function patchForm(state: FormState, next: Partial<FormState>): FormState {
  return { ...state, ...next };
}

/** True when the form carries anything worth publishing. */
export function isEmpty(state: FormState): boolean {
  const hasFacet = Object.values(state.facets).some((v) => v.length > 0);
  return !hasFacet && state.keyword.trim() === '' && state.geo === null;
}

/**
 * Project the form into the exact payload the results widget reads on
 * MESSAGES.FILTER_CHANGE ('job-search-submit').
 */
export function toPayload(state: FormState): FilterChangePayload {
  return {
    state: state.facets,
    keyword: state.keyword,
    geo: state.geo,
    geoRange: state.geoRange,
  };
}

/**
 * Parse the URL hash to pre-fill on load. Matches the results widget's hash
 * shape exactly — `#<encoded JSON {facets, keyword}>` — so a reload restores.
 */
export function readHash(): Partial<FormState> {
  try {
    const raw = window.location.hash.replace(/^#/, '');
    if (!raw) return {};
    const parsed = JSON.parse(decodeURIComponent(raw)) as {
      facets?: FilterState;
      keyword?: string;
    };
    return { facets: parsed.facets ?? {}, keyword: parsed.keyword ?? '' };
  } catch {
    return {};
  }
}

/** Search-bar-specific visibility + label toggles, read off `data.config.*`. */
export interface SearchConfig {
  showKeyword: boolean;
  showJobType: boolean;
  showClassification: boolean;
  showSubClassification: boolean;
  showWorkType: boolean;
  showWorkModel: boolean;
  showLocation: boolean;
  showGeoSearch: boolean;
  buttonText: string;
}

function str(value: unknown, fallback: string): string {
  if (typeof value === 'string' && value.trim() !== '') return value;
  return fallback;
}

/** Legacy config keys are preserved so existing Duda sites keep working. */
export function readSearchConfig(data: DudaData | undefined): SearchConfig {
  const c = (data && data.config) || {};
  return {
    showKeyword: coerceBool(c.showSearchKeyword, true),
    showJobType: coerceBool(c.showJobType),
    showClassification: coerceBool(c.showJobCategories),
    showSubClassification: coerceBool(c.ShowSubCalssifications),
    showWorkType: coerceBool(c.showWorkType),
    showWorkModel: coerceBool(c.showWorkModel),
    showLocation: coerceBool(c.showLocationSearch),
    showGeoSearch: coerceBool(c.showGeoSearch),
    buttonText: str(c.buttonText, 'Search'),
  };
}

/** Slider unit label from the shared proximityDiameter setting. */
export function rangeUnit(proximityDiameter: ProximityDiameter): string {
  return proximityDiameter === '6371' ? 'mi' : 'km';
}

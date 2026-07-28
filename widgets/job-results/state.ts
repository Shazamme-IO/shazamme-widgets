// Widget query state + helpers. The controller owns one immutable QueryState;
// every interaction produces a NEW state (no mutation) and re-queries the model.

import type { FilterState, GeoPoint, SortSpec } from '../../core/types';
import type { FilterInput } from '../../core/filters';

/** Everything that defines the current result query. */
export interface QueryState {
  facets: FilterState;
  keyword: string;
  location: string;
  geo: GeoPoint | null;
  geoAddress: string;
  geoRange: number;
  sort: SortSpec;
  page: number;
}

export const DEFAULT_SORT: SortSpec = { field: 'changedOnUTC', direction: 'desc' };
export const DEFAULT_GEO_RANGE = 50;

export function initialState(): QueryState {
  return {
    facets: {},
    keyword: '',
    location: '',
    geo: null,
    geoAddress: '',
    geoRange: DEFAULT_GEO_RANGE,
    sort: DEFAULT_SORT,
    page: 0,
  };
}

/** Immutable patch. */
export function patch(state: QueryState, next: Partial<QueryState>): QueryState {
  return { ...state, ...next };
}

/**
 * Project the state into the model's FilterInput. geo supersedes a plain
 * location keyword (mirrors the legacy `delete activeFilter['location']`).
 */
export function toFilterInput(state: QueryState): FilterInput {
  const input: FilterInput = {};
  for (const [k, v] of Object.entries(state.facets)) {
    if (v.length > 0) input[k] = [...v];
  }
  const keyword = state.keyword.trim();
  if (keyword !== '') input.keyword = [keyword];

  if (state.geo) {
    input.geo = [state.geo];
    input.geoRange = [state.geoRange];
    if (state.geoAddress) input.geoAddress = [state.geoAddress];
  } else {
    const location = state.location.trim();
    if (location !== '') input.location = [location];
  }
  return input;
}

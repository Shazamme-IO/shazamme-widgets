// Shared domain types for the shazamme-widgets core.
// DOM-light: nothing here touches the Duda globals directly.

/** A single job record. Fields mirror the legacy `j.data.*` shape. */
export interface Job {
  // Classification (jobType → profession → role hierarchy)
  professionID?: string;
  category?: string;
  professionSeo?: string;
  roleID?: string;
  subCategory?: string;
  roleSeo?: string;
  jobTypeID?: string;
  jobType?: string;
  // Work attributes
  workTypeID?: string;
  workType?: string;
  workTypeSeo?: string;
  workModelID?: string;
  workModel?: string;
  workModelSeo?: string;
  // Location
  state?: string;
  city?: string;
  country?: string;
  latitude?: string | number;
  longitude?: string | number;
  // Custom / misc
  customField1?: string;
  customField2?: string;
  shiftType?: string;
  // Keyword-searchable fields
  jobName?: string;
  category_?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  location?: string;
  fullDescription?: string;
  fullAddress?: string;
  fullAddressForSearch?: string;
  referenceNumber?: string;
  tags?: string;
  title?: string;
  reference?: string;
  changedOnUTC?: string;
  // Any additional SDK-provided fields.
  [key: string]: unknown;
}

/** SDK collection envelope: `{ values: [{ data: Job }] }`. */
export interface JobValue {
  data: Job;
}

export interface JobCollection {
  values: JobValue[];
}

/** A node in a facet tree. `id` falls back to `value` when the *ID field is empty. */
export interface FacetNode {
  value: string;
  id: string;
  seo?: string;
  parent?: string;
}

/** Declares one level of a facet hierarchy and how to read it off a Job. */
export interface FacetLevel {
  /** Logical field name (also the FilterState key), e.g. 'jobTypeID'. */
  field: string;
  /** Job field holding the human label, e.g. 'jobType'. */
  labelKey: keyof Job | string;
  /** Job field holding the id, e.g. 'jobTypeID'. Falls back to label when empty. */
  idKey: keyof Job | string;
  /** Optional Job field holding the SEO slug. */
  seoKey?: keyof Job | string;
  /** Job field on THIS level whose value is the PARENT node's id. */
  parentField?: keyof Job | string;
}

/** Selected facet ids keyed by field, e.g. `{ jobTypeID: ['1'], professionID: ['7'] }`. */
export type FilterState = Record<string, string[]>;

/** A geographic point. Note: lon (not lng) to match the legacy contract. */
export interface GeoPoint {
  lat: number;
  lon: number;
}

/** Result of building a facet hierarchy from a set of jobs. */
export interface Hierarchy {
  /** Deduped nodes per field, in first-seen order. */
  index: Record<string, FacetNode[]>;
  /** Occurrence counts per field, keyed by node id. */
  counts: Record<string, Record<string, number>>;
  /** Children of a parent id at a given field level. */
  children(field: string, parentId: string): FacetNode[];
  /** Root nodes at a given field level (no parent). */
  roots(field: string): FacetNode[];
}

export interface SortSpec {
  field: string;
  direction: 'asc' | 'desc';
}

/** Options passed to the pure filter engine. */
export interface FilterOptions {
  /** Job data fields the keyword should match against. */
  keywordFields?: string[];
  /** Radius unit selector: '6371' = miles slider, '12756' = km slider. */
  proximityDiameter?: string;
  /** Fallback range (in slider units) when geoRange isn't in state. */
  defaultRange?: number;
}

/** A page of query results plus totals and facet info. */
export interface QueryResult {
  page: Job[];
  /** The full filtered+sorted set (every match, not just the page) — used by the map. */
  matching: Job[];
  total: number;
  facets: Hierarchy;
}

/** The indexed, memoized jobs model returned by loadJobs. */
export interface JobsModel {
  /** All jobs (post-normalisation), read-only. */
  all(): readonly Job[];
  /** Filtered + sorted + paginated query with memoized filtering. */
  query(
    state: FilterState,
    sort: SortSpec,
    page: number,
    pageSize: number,
  ): QueryResult;
}

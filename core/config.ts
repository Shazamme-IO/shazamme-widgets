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
  /** LEGACY panel (widgets cloned from Job Results 2026). Job field -> accepted
   *  values; every listed field must match. Empty when no default is set. */
  defaultFilters: DefaultFilters;
  /** "Show Results & Favorites Bar" (shmTopResultsRow) and "Show Action Bar". */
  showResultsRow: boolean;
  showActionBar: boolean;
  /** Legacy panel only showed List/Map when its Google `apikey` was filled in. */
  showViewToggle: boolean;
  searchResultsText: string;
  resultMessage: string;
  resultMessagePlural: string;
  showApplyButton: boolean;
  showReadMoreButton: boolean;
  /** Legacy per-field "Show …" toggles for the card. All on when absent (v2 panel). */
  cardFields: CardFields;
  /** Legacy card layout; 'simple' tags cards with the classes its Design panel targets. */
  legacyLayout: string;
  /** Job summary under the meta rows. Off when absent, so no existing card changes. */
  showShortDescription: boolean;
  /** Character cap for that summary; 0 shows it in full. */
  shortDescriptionLength: number;
  /** Summary text alignment; left unless set, as cards may centre their text. */
  shortDescriptionAlign: TextAlign;
}

export type TextAlign = 'left' | 'center' | 'right' | 'justify';

export type DefaultFilters = Readonly<Record<string, readonly string[]>>;

export interface CardFields {
  salary: boolean;
  workType: boolean;
  workModel: boolean;
  category: boolean;
  city: boolean;
  state: boolean;
  country: boolean;
  posted: boolean;
  newTag: boolean;
}

/** Legacy `default*` panel keys and the job field each one constrains. */
const DEFAULT_FILTER_KEYS: ReadonlyArray<readonly [string, string]> = [
  ['defaultKeyword', 'keyword'],
  ['defaultLocation', 'location'],
  ['defaultCategory', 'category'],
  ['defaultSubCategory', 'subCategory'],
  ['defaultState', 'state'],
  ['defaultCity', 'city'],
  ['defaultAdvertiserID', 'advertiserID'],
  ['defaultCountry', 'country'],
  ['defaultWorkType', 'workType'],
  ['defaultJobtype', 'jobType'],
  ['defaultCustomField1', 'customField1'],
  ['defaultCustomField2', 'customField2'],
  ['defaultTags', 'tags'],
  ['defaultIndustry', 'industry'],
];

const DEFAULT_PAGE_SIZE = 20;
const DEFAULT_PROXIMITY: ProximityDiameter = '6371';
const DEFAULT_DETAILS_PAGE = '/job-details';
const DEFAULT_APPLICATION_PAGE = '/job-application';
const DEFAULT_SHORT_DESCRIPTION_LENGTH = 150;

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

/** A non-negative integer setting; blank, garbage or negative falls back. */
function coerceLimit(value: unknown, fallback: number): number {
  const n = coerceInt(value, fallback);
  return n < 0 ? fallback : n;
}

const TEXT_ALIGNS: readonly TextAlign[] = ['left', 'center', 'right', 'justify'];

/** Duda dropdown values arrive in any case; anything unknown is left. */
function coerceAlign(value: unknown): TextAlign {
  const v = coerceStr(value).trim().toLowerCase();
  return TEXT_ALIGNS.find((a) => a === v) ?? 'left';
}

/** Duda hands an unset text setting through as '', which coerceStr would return
 *  verbatim — rendering, say, an Apply button with no text. Labels fall back. */
function coerceLabel(value: unknown, fallback: string): string {
  const v = coerceStr(value).trim();
  return v === '' ? fallback : v;
}

/** A CSS length from a setting: pass a value that already carries a unit through
 *  (1.5rem, 50%), and treat a bare number as px. parseInt alone turned '1.5rem'
 *  into '1px'. */
export function coerceLength(value: unknown): string {
  const v = coerceStr(value).trim();
  if (v === '') return '';
  return /^-?\d*\.?\d+$/.test(v) ? `${v}px` : v;
}

function coerceStr(value: unknown, fallback = ''): string {
  if (typeof value === 'string') return value;
  if (value == null) return fallback;
  return String(value);
}

function coerceProximity(value: unknown): ProximityDiameter {
  return coerceStr(value) === '12756' ? '12756' : DEFAULT_PROXIMITY;
}

function coerceTemplate(value: unknown, legacyLayout: string): CardTemplate {
  const v = coerceStr(value).trim().toLowerCase();
  if (v === '') return legacyLayout === 'standard' ? 'classic' : 'modern';
  return v === 'classic' ? 'classic' : 'modern';
}

/** A toggle the v2 panel does not have: absent means "on", so v2 sites are unchanged. */
function coerceToggle(value: unknown): boolean {
  return value === undefined || value === null ? true : coerceBool(value);
}

/** Comma-separated values, as the legacy widget split them, minus blanks. */
function readDefaultFilters(c: Record<string, unknown>): DefaultFilters {
  const out: Record<string, string[]> = {};
  for (const [key, field] of DEFAULT_FILTER_KEYS) {
    const values = coerceStr(c[key])
      .split(',')
      .map((v) => v.trim())
      .filter((v) => v !== '');
    if (values.length > 0) out[field] = values;
  }
  return out;
}

/** A page setting is a site-relative path. Duda hands it back with or without a
 *  leading slash depending on how it was typed, and `'/' + '/job-details'` builds
 *  `//job-details`, which a browser resolves as a host. Collapse to exactly one. */
export function rootPath(value: string, fallback: string): string {
  const raw = coerceStr(value).trim() || fallback;
  if (/^https?:\/\//i.test(raw)) return raw.replace(/\/+$/, '');
  // Trailing slashes matter too: 'job-details/' would build '/job-details//slug'.
  return ('/' + raw).replace(/^\/+/, '/').replace(/\/+$/, '');
}

/** Read `data.config.*` into a typed, defaulted WidgetConfig. */
export function readConfig(data: DudaData | undefined): WidgetConfig {
  const c = (data && data.config) || {};
  const legacyLayout = coerceStr(c.layout).trim().toLowerCase();
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
    cardTemplate: coerceTemplate(c.cardTemplate, legacyLayout),
    applyNowLabel: coerceLabel(c.applyNowLabel, 'Apply Now'),
    readMoreLabel: coerceLabel(c.readMoreLabel, 'Read More'),
    saveJobText: coerceLabel(c.saveJobText, 'save job'),
    unsaveJobText: coerceLabel(c.unsaveJobText, 'unsave job'),
    postedText: coerceLabel(c.postedText, 'Posted'),
    noResultsText: coerceLabel(c.resultMessageNone || c.noResultsText, 'No jobs match your search.'),
    accentColour: coerceStr(c.accentColour || c.accentColor),
    headerBackground: coerceStr(c.headerBackground),
    cardRadius: coerceLength(c.cardRadius),
    defaultFilters: readDefaultFilters(c),
    showResultsRow: coerceToggle(c.shmTopResultsRow),
    showActionBar: coerceToggle(c.showActionBar),
    showViewToggle: c.apikey === undefined || c.apikey === null || coerceStr(c.apikey).trim() !== '',
    searchResultsText: coerceStr(c.searchResultsText).trim(),
    resultMessage: coerceStr(c.resultMessage).trim(),
    resultMessagePlural: coerceStr(c.resultMessagePlural).trim(),
    showApplyButton: coerceToggle(c.applybtn),
    showReadMoreButton: coerceToggle(c.readmorebtn),
    cardFields: {
      salary: coerceToggle(c.showSalary),
      workType: coerceToggle(c.showWorkType),
      workModel: coerceToggle(c.showWorkModel),
      category: coerceToggle(c.showCategory),
      city: coerceToggle(c.showCity),
      state: coerceToggle(c.showState),
      country: coerceToggle(c.showCountry),
      // The card shows relative time only, which legacy gated on this toggle alone.
      posted: coerceToggle(c.showTimeSincePosted),
      newTag: coerceToggle(c.showNewIcon),
    },
    legacyLayout,
    showShortDescription: coerceBool(c.showShortDescription),
    shortDescriptionLength: coerceLimit(c.shortDescriptionLength, DEFAULT_SHORT_DESCRIPTION_LENGTH),
    shortDescriptionAlign: coerceAlign(c.shortDescriptionAlign || c.shortDescriptionAlignment || c.alignShortDescription),
  };
}

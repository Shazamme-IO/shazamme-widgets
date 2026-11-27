// Every data.config key Job Board reads, coerced from Duda's strings. settings.json lists the same keys and
// port.test.ts keeps it, this file and the Duda AI prompts in step.

import { clampInt, flag, pick, safeUrl, text } from '../../core/site-jobs';

export const GROUP_IDS = ['profession', 'role', 'workType', 'workModel', 'country', 'state', 'city'] as const;
export type GroupId = (typeof GROUP_IDS)[number];

export const SORTS = ['newest', 'salary-high', 'salary-low'] as const;
export type Sort = (typeof SORTS)[number];

const LOCATION_FORMATS = ['city', 'city-state', 'city-country', 'city-state-country'] as const;
export type LocationFormat = (typeof LOCATION_FORMATS)[number];
const HEADING_TAGS = ['h2', 'h3', 'h4', 'p'] as const;
const CARD_LABELS = ['profession', 'role', 'none'] as const;
const PAGING = ['pages', 'loadmore'] as const;
const GROUPS_OPEN = ['all', 'first', 'none'] as const;

export const DEFAULT_GROUPS = 'profession, workType, workModel, country, city';

const LABEL_KEYS: Record<GroupId, string> = {
  profession: 'labelProfession',
  role: 'labelRole',
  workType: 'labelWorkType',
  workModel: 'labelWorkModel',
  country: 'labelCountry',
  state: 'labelState',
  city: 'labelCity',
};
const LABEL_DEFAULTS: Record<GroupId, string> = {
  profession: 'Profession',
  role: 'Role',
  workType: 'Work type',
  workModel: 'Work model',
  country: 'Country',
  state: 'State',
  city: 'City',
};

export interface Settings {
  jobsCollection: string;
  detailsPage: string;
  syncAddress: boolean;
  showSearch: boolean;
  searchPrompt: string;
  keywordPlaceholder: string;
  locationPlaceholder: string;
  showLocationSearch: boolean;
  searchButtonLabel: string;
  searchOverlap: number;
  showFilters: boolean;
  groups: Array<{ id: GroupId; label: string }>;
  optionsShown: number;
  groupsOpen: (typeof GROUPS_OPEN)[number];
  showMoreText: string;
  showLessText: string;
  filtersTitle: string;
  filtersButtonText: string;
  closeText: string;
  applyText: string;
  clearText: string;
  pageSize: number;
  paging: (typeof PAGING)[number];
  loadMoreText: string;
  prevText: string;
  nextText: string;
  pagerLabel: string;
  showSort: boolean;
  defaultSort: Sort;
  sortLabel: string;
  sortNames: Record<Sort, string>;
  countOne: string;
  countMany: string;
  cardLabel: (typeof CARD_LABELS)[number];
  headingTag: (typeof HEADING_TAGS)[number];
  showSalary: boolean;
  noSalaryText: string;
  locationFormat: LocationFormat;
  showWorkType: boolean;
  showWorkModel: boolean;
  emptyTitle: string;
  emptyText: string;
  noJobsText: string;
}

/** "profession, city" to the groups in that order, unknown names and repeats dropped. "none" shows no groups. */
export function parseGroups(v: unknown, config: Record<string, unknown>): Settings['groups'] {
  const raw = typeof v === 'string' ? v : DEFAULT_GROUPS;
  const seen = new Set<GroupId>();
  for (const part of raw.split(/[,;\n]/)) {
    const id = GROUP_IDS.find((g) => g.toLowerCase() === part.trim().toLowerCase());
    if (id) seen.add(id);
  }
  return [...seen].map((id) => ({ id, label: text(config[LABEL_KEYS[id]]) || LABEL_DEFAULTS[id] }));
}

export function readSettings(config: Record<string, unknown> = {}): Settings {
  const t = (key: string, fallback: string): string => text(config[key]) || fallback;
  return {
    jobsCollection: typeof config.jobsCollection === 'string' ? config.jobsCollection.trim() : 'Jobs',
    detailsPage: (safeUrl(config.detailsPage) || '/job-details').replace(/\/+$/, ''),
    syncAddress: flag(config.syncAddress, true),
    showSearch: flag(config.showSearch, true),
    searchPrompt: typeof config.searchPrompt === 'string' ? config.searchPrompt.trim() : 'Looking for your next opportunity?',
    keywordPlaceholder: t('keywordPlaceholder', 'Keyword'),
    locationPlaceholder: t('locationPlaceholder', 'Location'),
    showLocationSearch: flag(config.showLocationSearch, true),
    searchButtonLabel: t('searchButtonLabel', 'Search jobs'),
    searchOverlap: clampInt(config.searchOverlap, 0, 0, 240),
    showFilters: flag(config.showFilters, true),
    groups: parseGroups(config.filterGroups, config),
    optionsShown: clampInt(config.optionsShown, 8, 1, 50),
    groupsOpen: pick(config.groupsOpen, GROUPS_OPEN, 'all'),
    showMoreText: t('showMoreText', 'Show more'),
    showLessText: t('showLessText', 'Show less'),
    filtersTitle: t('filtersTitle', 'Filter jobs'),
    filtersButtonText: t('filtersButtonText', 'Filters'),
    closeText: t('closeText', 'Close filters'),
    applyText: t('applyText', 'Show {count} jobs'),
    clearText: t('clearText', 'Clear all'),
    pageSize: clampInt(config.pageSize, 12, 3, 60),
    paging: pick(config.paging, PAGING, 'pages'),
    loadMoreText: t('loadMoreText', 'Load more jobs'),
    prevText: t('prevText', 'Previous'),
    nextText: t('nextText', 'Next'),
    pagerLabel: t('pagerLabel', 'Job pages'),
    showSort: flag(config.showSort, true),
    defaultSort: pick(config.defaultSort, SORTS, 'newest'),
    sortLabel: t('sortLabel', 'Sort by'),
    sortNames: {
      newest: t('sortNewest', 'Newest'),
      'salary-high': t('sortSalaryHigh', 'Highest salary'),
      'salary-low': t('sortSalaryLow', 'Lowest salary'),
    },
    countOne: t('countOne', '{count} job'),
    countMany: t('countMany', '{count} jobs'),
    cardLabel: pick(config.cardLabel, CARD_LABELS, 'profession'),
    headingTag: pick(config.headingTag, HEADING_TAGS, 'h3'),
    showSalary: flag(config.showSalary, true),
    noSalaryText: typeof config.noSalaryText === 'string' ? config.noSalaryText.trim() : 'Competitive',
    locationFormat: pick(config.locationFormat, LOCATION_FORMATS, 'city-state'),
    showWorkType: flag(config.showWorkType, true),
    showWorkModel: flag(config.showWorkModel, false),
    emptyTitle: t('emptyTitle', 'No jobs match your search'),
    emptyText: t('emptyText', 'Try removing a filter or searching for something broader.'),
    noJobsText: t('noJobsText', 'There are no live jobs right now. Check back soon.'),
  };
}

export const fill = (template: string, count: number): string => template.split('{count}').join(String(count));

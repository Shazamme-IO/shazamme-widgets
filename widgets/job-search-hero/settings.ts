// Content Editor settings -> a typed object. Duda hands every value through as a string
// (or leaves it out), so every read is coerced with a fallback and never throws.

import { text, toBool } from '../_job-page/job';

export interface HeroSettings {
  resultsPage: string;
  ariaLabel: string;
  showLocation: boolean;
  showWorkType: boolean;
  keywordLabel: string;
  keywordPlaceholder: string;
  locationLabel: string;
  locationPlaceholder: string;
  workTypeLabel: string;
  workTypeAllLabel: string;
  buttonText: string;
  buttonTextOne: string;
  buttonTextNoCount: string;
}

/** The Content Editor defaults. The prompt file lists the same values; settings.test.ts keeps them in step. */
export const DEFAULTS = {
  resultsPage: 'job-results',
  ariaLabel: 'Search jobs',
  showLocation: true,
  showWorkType: true,
  keywordLabel: 'Keyword',
  keywordPlaceholder: 'Job title, skill or company',
  locationLabel: 'Location',
  locationPlaceholder: 'Sydney, London…',
  workTypeLabel: 'Work type',
  workTypeAllLabel: 'All types',
  buttonText: 'Search {count} roles',
  buttonTextOne: 'Search 1 role',
  buttonTextNoCount: 'Search roles',
} as const;

export const SETTING_KEYS = Object.keys(DEFAULTS) as Array<keyof typeof DEFAULTS>;

export function readSettings(config: unknown): HeroSettings {
  const c: Record<string, unknown> = config && typeof config === 'object' ? (config as Record<string, unknown>) : {};
  const t = <K extends keyof typeof DEFAULTS>(k: K): string => text(c[k]) || String(DEFAULTS[k]);
  return {
    resultsPage: t('resultsPage'),
    ariaLabel: t('ariaLabel'),
    showLocation: toBool(c.showLocation, DEFAULTS.showLocation),
    showWorkType: toBool(c.showWorkType, DEFAULTS.showWorkType),
    keywordLabel: t('keywordLabel'),
    keywordPlaceholder: t('keywordPlaceholder'),
    locationLabel: t('locationLabel'),
    locationPlaceholder: t('locationPlaceholder'),
    workTypeLabel: t('workTypeLabel'),
    workTypeAllLabel: t('workTypeAllLabel'),
    buttonText: t('buttonText'),
    buttonTextOne: t('buttonTextOne'),
    buttonTextNoCount: t('buttonTextNoCount'),
  };
}

/** "/job-results?keyword=a&workType=b" for a site-relative page; a full address keeps its own origin and query. */
export function buildResultsUrl(page: string, params: Record<string, string>): string {
  const query = Object.entries(params)
    .filter(([, v]) => v.trim() !== '')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v.trim())}`)
    .join('&');
  const raw = page.trim();
  const hashAt = raw.indexOf('#');
  const base = hashAt === -1 ? raw : raw.slice(0, hashAt);
  const frag = hashAt === -1 ? '' : raw.slice(hashAt);
  const isAbsolute = /^https?:\/\//i.test(base);
  if (!isAbsolute && /^[a-z][a-z0-9+.-]*:/i.test(base)) return buildResultsUrl(DEFAULTS.resultsPage, params);
  const path = isAbsolute ? base : `/${base.replace(/^[/\\]+/, '')}`;
  const sep = path.includes('?') ? '&' : '?';
  return `${path}${query ? sep + query : ''}${frag}`;
}

export function countLabel(s: HeroSettings, count: number): string {
  if (count === 1) return s.buttonTextOne;
  if (count > 1) return s.buttonText.replace(/\{count\}/g, count.toLocaleString('en-AU'));
  return s.buttonTextNoCount;
}

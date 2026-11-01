// Content Editor settings -> a typed object. Duda hands every value through as a
// string (or leaves it out), so every read is coerced with a fallback and never throws.

export type Layout = 'slider' | 'grid' | 'list' | 'featured';
export type SortOrder = 'newest' | 'oldest' | 'random' | 'manual';
export type ReadMoreMode = 'expand' | 'dialog' | 'off';
export type Pagination = 'dots' | 'avatars' | 'none';
export type DateFormat = 'long' | 'month-year' | 'year';

export interface Settings {
  siteId: string;
  tags: string[];
  consultantId: string;
  sortOrder: SortOrder;
  maxTestimonials: number;
  layout: Layout;
  columnsDesktop: number;
  columnsTablet: number;
  columnsMobile: number;
  heading: string;
  intro: string;
  headingLevel: number;
  ariaLabel: string;
  pageSize: number;
  showTagFilter: boolean;
  allTagsLabel: string;
  loadMoreText: string;
  showPhoto: boolean;
  showQuoteMark: boolean;
  showRating: boolean;
  showPosition: boolean;
  showCompany: boolean;
  showDate: boolean;
  dateFormat: DateFormat;
  showConsultant: boolean;
  linkConsultant: boolean;
  consultantLabel: string;
  quoteLines: number;
  readMore: ReadMoreMode;
  readMoreText: string;
  readLessText: string;
  autoplay: boolean;
  autoplaySeconds: number;
  loop: boolean;
  arrows: boolean;
  pagination: Pagination;
  schemaEnabled: boolean;
  schemaBusinessName: string;
  schemaBusinessType: string;
}

export const LIMITS = {
  columns: { min: 1, max: 4 },
  maxTestimonials: { min: 0, max: 200 },
  pageSize: { min: 0, max: 100 },
  quoteLines: { min: 0, max: 30 },
  autoplaySeconds: { min: 2, max: 60 },
} as const;

const LAYOUTS: readonly Layout[] = ['slider', 'grid', 'list', 'featured'];
const SORTS: readonly SortOrder[] = ['newest', 'oldest', 'random', 'manual'];
const READ_MORE: readonly ReadMoreMode[] = ['expand', 'dialog', 'off'];
const PAGINATIONS: readonly Pagination[] = ['dots', 'avatars', 'none'];
const DATE_FORMATS: readonly DateFormat[] = ['long', 'month-year', 'year'];
const BUSINESS_TYPES = ['Organization', 'LocalBusiness', 'EmploymentAgency'] as const;

export function toText(v: unknown, fallback = ''): string {
  if (typeof v === 'string') return v.trim();
  if (typeof v === 'number' && Number.isFinite(v)) return String(v);
  return fallback;
}

export function toBool(v: unknown, fallback: boolean): boolean {
  if (v === true || v === 'true') return true;
  if (v === false || v === 'false') return false;
  return fallback;
}

export function toInt(v: unknown, fallback: number, min: number, max: number): number {
  const n = typeof v === 'number' ? v : parseInt(String(v ?? ''), 10);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, Math.round(n)));
}

export function toChoice<T extends string>(v: unknown, allowed: readonly T[], fallback: T): T {
  const s = toText(v).toLowerCase();
  return (allowed as readonly string[]).includes(s) ? (s as T) : fallback;
}

/** "Candidate, client ;  PERM" -> ["candidate", "client", "perm"]. Empty entries are dropped. */
export function splitTags(v: unknown): string[] {
  if (typeof v !== 'string') return [];
  const seen = new Set<string>();
  for (const part of v.split(/[,;|]/)) {
    const t = part.trim().toLowerCase();
    if (t) seen.add(t);
  }
  return Array.from(seen);
}

export function readSettings(config: unknown): Settings {
  const c: Record<string, unknown> = config && typeof config === 'object' ? (config as Record<string, unknown>) : {};
  const businessType = toText(c.schemaBusinessType);
  return {
    siteId: toText(c.siteId),
    tags: splitTags(c.tags),
    consultantId: toText(c.consultantID).toLowerCase(),
    sortOrder: toChoice(c.sortOrder, SORTS, 'newest'),
    maxTestimonials: toInt(c.maxTestimonials, 0, LIMITS.maxTestimonials.min, LIMITS.maxTestimonials.max),
    layout: toChoice(c.testimonialLayout, LAYOUTS, 'slider'),
    columnsDesktop: toInt(c.columnsDesktop, 3, LIMITS.columns.min, LIMITS.columns.max),
    columnsTablet: toInt(c.columnsTablet, 2, LIMITS.columns.min, LIMITS.columns.max),
    columnsMobile: toInt(c.columnsMobile, 1, LIMITS.columns.min, LIMITS.columns.max),
    heading: toText(c.heading),
    intro: toText(c.intro),
    headingLevel: toInt(c.headingLevel, 2, 1, 6),
    ariaLabel: toText(c.ariaLabel, 'Client testimonials') || 'Client testimonials',
    pageSize: toInt(c.pageSize, 6, LIMITS.pageSize.min, LIMITS.pageSize.max),
    showTagFilter: toBool(c.showTagFilter, false),
    allTagsLabel: toText(c.allTagsLabel, 'All') || 'All',
    loadMoreText: toText(c.loadMoreText, 'Show more') || 'Show more',
    showPhoto: toBool(c.showPhoto, true),
    showQuoteMark: toBool(c.showQuoteMark, true),
    showRating: toBool(c.showRating, true),
    showPosition: toBool(c.showPosition, true),
    showCompany: toBool(c.showCompany, true),
    showDate: toBool(c.showDate, false),
    dateFormat: toChoice(c.dateFormat, DATE_FORMATS, 'month-year'),
    showConsultant: toBool(c.showConsultant, false),
    linkConsultant: toBool(c.linkConsultant, true),
    consultantLabel: toText(c.consultantLabel, 'Consultant'),
    quoteLines: toInt(c.quoteLines, 6, LIMITS.quoteLines.min, LIMITS.quoteLines.max),
    readMore: toChoice(c.readMore, READ_MORE, 'dialog'),
    readMoreText: toText(c.readMoreText, 'Read more') || 'Read more',
    readLessText: toText(c.readLessText, 'Read less') || 'Read less',
    autoplay: toBool(c.autoplay, false),
    autoplaySeconds: toInt(c.autoplaySeconds, 6, LIMITS.autoplaySeconds.min, LIMITS.autoplaySeconds.max),
    loop: toBool(c.loop, true),
    arrows: toBool(c.arrows, true),
    pagination: toChoice(c.pagination, PAGINATIONS, 'dots'),
    schemaEnabled: toBool(c.schemaEnabled, false),
    schemaBusinessName: toText(c.schemaBusinessName),
    schemaBusinessType: (BUSINESS_TYPES as readonly string[]).includes(businessType) ? businessType : 'Organization',
  };
}

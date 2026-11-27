// Content Editor settings -> a typed object. Duda hands every value through as a
// string (or leaves it out), so every read is coerced with a fallback and never throws.

export type Mode = 'team' | 'job';
export type SortBy = 'default' | 'name';
export type Show = 'auto' | 'show' | 'hide';

export interface Settings {
  siteId: string;
  mode: Mode;
  jobId: string;
  classification: string;
  maxConsultants: number;
  sortBy: SortBy;
  columnsDesktop: number;
  columnsTablet: number;
  columnsMobile: number;
  eyebrow: string;
  ariaLabel: string;
  showRole: boolean;
  showLiveRoles: boolean;
  showZeroRoles: boolean;
  liveRolesOne: string;
  liveRolesMany: string;
  showEmail: boolean;
  showPhone: boolean;
  linkProfile: boolean;
  noConsultantMessage: string;
}

export const LIMITS = {
  columns: { min: 1, max: 6 },
  maxConsultants: { min: 0, max: 100 },
} as const;

const MODES: readonly Mode[] = ['team', 'job'];
const SORTS: readonly SortBy[] = ['default', 'name'];
const SHOWS: readonly Show[] = ['auto', 'show', 'hide'];

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

/** "auto" follows the mode: on for the team grid, off for the single job-page card (or the reverse). */
function resolveShow(v: unknown, autoValue: boolean): boolean {
  const choice = toChoice(v, SHOWS, 'auto');
  return choice === 'auto' ? autoValue : choice === 'show';
}

export function readSettings(config: unknown): Settings {
  const c: Record<string, unknown> = config && typeof config === 'object' ? (config as Record<string, unknown>) : {};
  const mode = toChoice(c.mode, MODES, 'team');
  const isTeam = mode === 'team';
  return {
    siteId: toText(c.siteId),
    mode,
    jobId: toText(c.jobID),
    classification: toText(c.classification).toLowerCase(),
    maxConsultants: toInt(c.maxConsultants, 0, LIMITS.maxConsultants.min, LIMITS.maxConsultants.max),
    sortBy: toChoice(c.sortBy, SORTS, 'default'),
    columnsDesktop: toInt(c.columnsDesktop, 4, LIMITS.columns.min, LIMITS.columns.max),
    columnsTablet: toInt(c.columnsTablet, 2, LIMITS.columns.min, LIMITS.columns.max),
    columnsMobile: toInt(c.columnsMobile, 1, LIMITS.columns.min, LIMITS.columns.max),
    eyebrow: toText(c.eyebrow, 'Your consultant'),
    ariaLabel: toText(c.ariaLabel, 'Our consultants') || 'Our consultants',
    showRole: toBool(c.showRole, true),
    showLiveRoles: resolveShow(c.showLiveRoles, isTeam),
    showZeroRoles: toBool(c.showZeroRoles, false),
    liveRolesOne: toText(c.liveRolesOne, '{n} live role') || '{n} live role',
    liveRolesMany: toText(c.liveRolesMany, '{n} live roles') || '{n} live roles',
    showEmail: resolveShow(c.showEmail, !isTeam),
    showPhone: resolveShow(c.showPhone, !isTeam),
    linkProfile: toBool(c.linkProfile, true),
    noConsultantMessage: toText(c.noConsultantMessage),
  };
}

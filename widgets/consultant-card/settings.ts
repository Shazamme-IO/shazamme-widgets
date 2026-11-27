// Content Editor settings -> a typed object. Duda hands every value through as a
// string (or leaves it out), so every read is coerced with a fallback and never throws.
// Every default reproduces the v0.1.65 card: initials, name, job title, live roles.

export type Mode = 'team' | 'job';
export type SortBy = 'default' | 'name';
export type Show = 'auto' | 'show' | 'hide';
export type Avatar = 'initials' | 'photo' | 'photo-with-initials-fallback';
export type ItemLayout = 'stacked' | 'side' | 'portrait';
export type Align = 'left' | 'center';
export type Layout = 'grid' | 'slider';
export type FilterAlign = 'left' | 'center' | 'right';

/** One contact or social line: shown at all, with its icon, with its text. */
export interface Item {
  show: boolean;
  icon: boolean;
  label: boolean;
}

export interface Social extends Item {
  text: string;
}

export type SocialKey = 'linkedin' | 'facebook' | 'twitter' | 'google' | 'wechat';
export const SOCIAL_ORDER: readonly SocialKey[] = ['linkedin', 'facebook', 'twitter', 'google', 'wechat'];

export interface Settings {
  siteId: string;
  mode: Mode;
  jobId: string;
  classification: string;
  location: string;
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
  avatar: Avatar;
  itemLayout: ItemLayout;
  align: Align;
  showLocation: boolean;
  showLocationIcon: boolean;
  showSector: boolean;
  showDescription: boolean;
  descriptionLines: number;
  showButton: boolean;
  buttonText: string;
  profilePage: string;
  newTab: boolean;
  phone: Item;
  mobile: Item;
  email: Item;
  socials: Record<SocialKey, Social>;
  layout: Layout;
  slidesToShow: number;
  autoplay: boolean;
  sliderSpeed: number;
  arrows: boolean;
  infinite: boolean;
  previousLabel: string;
  nextLabel: string;
  pauseLabel: string;
  playLabel: string;
  showClassificationFilter: boolean;
  showLocationFilter: boolean;
  showSearch: boolean;
  filterAllText: string;
  classificationFilterLabel: string;
  locationFilterLabel: string;
  searchPlaceholder: string;
  noMatchText: string;
  filterAlign: FilterAlign;
}

export const LIMITS = {
  columns: { min: 1, max: 6 },
  maxConsultants: { min: 0, max: 100 },
  descriptionLines: { min: 0, max: 20 },
  sliderSpeed: { min: 2000, max: 20000 },
} as const;

const MODES: readonly Mode[] = ['team', 'job'];
const SORTS: readonly SortBy[] = ['default', 'name'];
const SHOWS: readonly Show[] = ['auto', 'show', 'hide'];
const AVATARS: readonly Avatar[] = ['initials', 'photo', 'photo-with-initials-fallback'];
const ITEM_LAYOUTS: readonly ItemLayout[] = ['stacked', 'side', 'portrait'];
const ALIGNS: readonly Align[] = ['left', 'center'];
const LAYOUTS: readonly Layout[] = ['grid', 'slider'];
const FILTER_ALIGNS: readonly FilterAlign[] = ['left', 'center', 'right'];

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

/** Text with a default that an empty field also falls back to. */
function textOr(v: unknown, fallback: string): string {
  return toText(v, fallback) || fallback;
}

/** Socials are off until switched on; then the icon shows and the text does not (the Consultant widget's defaults). */
function social(show: unknown, icon: unknown, label: unknown, text: unknown, fallbackText: string): Social {
  return { show: toBool(show, false), icon: toBool(icon, true), label: toBool(label, false), text: textOr(text, fallbackText) };
}

export function readSettings(config: unknown): Settings {
  const c: Record<string, unknown> = config && typeof config === 'object' ? (config as Record<string, unknown>) : {};
  const mode = toChoice(c.mode, MODES, 'team');
  const isTeam = mode === 'team';
  const showEmail = resolveShow(c.showEmail, !isTeam);
  const showPhone = resolveShow(c.showPhone, !isTeam);
  return {
    siteId: toText(c.siteId),
    mode,
    jobId: toText(c.jobID),
    classification: toText(c.classification).toLowerCase(),
    location: toText(c.location).toLowerCase(),
    maxConsultants: toInt(c.maxConsultants, 0, LIMITS.maxConsultants.min, LIMITS.maxConsultants.max),
    sortBy: toChoice(c.sortBy, SORTS, 'default'),
    columnsDesktop: toInt(c.columnsDesktop, 4, LIMITS.columns.min, LIMITS.columns.max),
    columnsTablet: toInt(c.columnsTablet, 2, LIMITS.columns.min, LIMITS.columns.max),
    columnsMobile: toInt(c.columnsMobile, 1, LIMITS.columns.min, LIMITS.columns.max),
    eyebrow: toText(c.eyebrow, 'Your consultant'),
    ariaLabel: textOr(c.ariaLabel, 'Our consultants'),
    showRole: toBool(c.showRole, true),
    showLiveRoles: resolveShow(c.showLiveRoles, isTeam),
    showZeroRoles: toBool(c.showZeroRoles, false),
    liveRolesOne: textOr(c.liveRolesOne, '{n} live role'),
    liveRolesMany: textOr(c.liveRolesMany, '{n} live roles'),
    showEmail,
    showPhone,
    linkProfile: toBool(c.linkProfile, true),
    noConsultantMessage: toText(c.noConsultantMessage),
    avatar: toChoice(c.avatar, AVATARS, 'initials'),
    itemLayout: toChoice(c.itemLayout, ITEM_LAYOUTS, 'stacked'),
    align: toChoice(c.align, ALIGNS, 'left'),
    showLocation: toBool(c.showLocation, false),
    showLocationIcon: toBool(c.showLocationIcon, false),
    showSector: toBool(c.showSector, false),
    showDescription: toBool(c.showDescription, false),
    descriptionLines: toInt(c.descriptionLines, 3, LIMITS.descriptionLines.min, LIMITS.descriptionLines.max),
    showButton: toBool(c.showButton, false),
    buttonText: textOr(c.buttonText, 'View profile'),
    profilePage: toText(c.profilePage).replace(/^\/+|\/+$/g, ''),
    newTab: toBool(c.newTab, false),
    phone: { show: showPhone, icon: toBool(c.showPhoneIcon, false), label: toBool(c.showPhoneLabel, true) },
    mobile: { show: toBool(c.showMobile, false), icon: toBool(c.showMobileIcon, false), label: toBool(c.showMobileLabel, true) },
    email: { show: showEmail, icon: toBool(c.showEmailIcon, false), label: toBool(c.showEmailLabel, true) },
    socials: {
      linkedin: social(c.showLinkedin, c.showLinkedinIcon, c.showLinkedinLabel, c.linkedinText, 'LinkedIn'),
      facebook: social(c.showFacebook, c.showFacebookIcon, c.showFacebookLabel, c.facebookText, 'Facebook'),
      twitter: social(c.showTwitter, c.showTwitterIcon, c.showTwitterLabel, c.twitterText, 'X'),
      google: social(c.showGoogle, c.showGoogleIcon, c.showGoogleLabel, c.googleText, 'Google'),
      wechat: social(c.showWeChat, c.showWeChatIcon, c.showWeChatLabel, c.wechatText, 'WeChat'),
    },
    layout: toChoice(c.layout, LAYOUTS, 'grid'),
    slidesToShow: toInt(c.slidesToShow, 3, LIMITS.columns.min, LIMITS.columns.max),
    autoplay: toBool(c.autoplay, false),
    sliderSpeed: toInt(c.sliderSpeed, 5000, LIMITS.sliderSpeed.min, LIMITS.sliderSpeed.max),
    arrows: toBool(c.arrows, true),
    infinite: toBool(c.infinite, true),
    previousLabel: textOr(c.previousLabel, 'Previous consultants'),
    nextLabel: textOr(c.nextLabel, 'Next consultants'),
    pauseLabel: textOr(c.pauseLabel, 'Pause'),
    playLabel: textOr(c.playLabel, 'Play'),
    showClassificationFilter: toBool(c.showClassificationFilter, false),
    showLocationFilter: toBool(c.showLocationFilter, false),
    showSearch: toBool(c.showSearch, false),
    filterAllText: textOr(c.filterAllText, 'All'),
    classificationFilterLabel: textOr(c.classificationFilterLabel, 'Filter by sector'),
    locationFilterLabel: textOr(c.locationFilterLabel, 'Filter by location'),
    searchPlaceholder: textOr(c.searchPlaceholder, 'Search by name'),
    noMatchText: textOr(c.noMatchText, 'No consultants match your search.'),
    filterAlign: toChoice(c.filterAlign, FILTER_ALIGNS, 'left'),
  };
}

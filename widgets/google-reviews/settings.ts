// Settings for the google-reviews widget.
//
// The model is Elfsight's own Google Reviews settings schema (same key names, same
// value shapes), so a site migrating off Elfsight pastes its exported settings JSON
// into the `settingsJson` field and renders the same widget. A handful of Duda
// fields (placeId, layout, colours…) override that JSON when set, so a new site can
// be configured from the Duda panel alone.

import { coerceBool } from '../../core/config';

export type Layout = 'carousel' | 'slider' | 'grid' | 'list' | 'masonry' | 'cardBadge';
export type ReviewLayout = 'classic' | 'balloon' | 'spotlight';
export type SourceStyle = 'text' | 'logo' | 'icon' | 'logoBottom' | 'iconBottom';
export type HeaderLayout = 'header1' | 'header2' | 'header4' | 'header7' | 'header9';

export interface Keyword { keyword: string }

export interface ButtonStyle {
  text?: string;
  horizontalPadding?: number;
  verticalPadding?: number;
  color?: string;
  fontColor?: string;
  borderRadius?: number;
  font?: { fontSize?: number; fontWeight?: string };
}

export interface ThemeSettings {
  font?: { value?: string; googleFont?: boolean };
  widgetTitleTitleColor?: string;
  widgetTitleCaptionColor?: string;
  widgetTitleAlignment?: 'left' | 'center' | 'right';
  widgetTitleTitleTextStyle?: { fontSize?: number; fontWeight?: string };
  widgetBackground?: { color?: string; borderRadius?: number };
  widgetHorizontalPadding?: number;
  widgetVerticalPadding?: number;
  reviewBackgroundColor?: string;
  reviewOutlineColor?: string;
  reviewTextColor?: string;
  reviewReadMoreColor?: string;
  reviewVerifiedBadgeColor?: string;
  reviewSourceNameColor?: string;
  reviewCornerRadius?: number;
  reviewTextFontSize?: { fontSize?: number };
  reviewRatingSize?: 'small' | 'medium' | 'large';
  ratingColor?: string;
  headerBackgroundColor?: string;
  headerTextColor?: string;
  headerCornerRadius?: number;
  writeReviewButton?: ButtonStyle;
  loadMoreButton?: ButtonStyle;
  carouselArrowBackgroundColor?: string;
  carouselArrowColor?: string;
  carouselArrowBackgroundColorOnHover?: string;
  carouselArrowColorOnHover?: string;
  carouselArrowSize?: number;
  carouselPaginationColor?: string;
  popupBackgroundColor?: string;
  popupTextColor?: string;
  popupRatingColor?: string;
  popupReviewReadMoreColor?: string;
  badgeBackgroundColor?: string;
  badgeTextColor?: string;
  badgeRatingColor?: string;
  badgeCornerRadius?: number;
}

export interface Settings {
  sources: { url: string }[];
  layout: Layout;
  widgetWidth: { auto: boolean; customValue: number };

  carouselColumnsMode: 'auto' | 'custom';
  carouselColumnsDesktopLarge: number;
  carouselColumnsDesktopMedium: number;
  carouselColumnsDesktopSmall: number;
  carouselColumnsTablet: number;
  carouselColumnsMobile: number;
  carouselItemSpacing: number;
  carouselAutoplay: boolean;
  carouselAutoplayPauseOnHover: boolean;
  carouselAutoplayInterval: number;
  carouselAnimationSpeed: number;
  carouselPagination: boolean;
  carouselArrowsEnable: boolean;
  carouselArrowsOnMobileEnable: boolean;
  carouselSwipeDesktopEnable: boolean;
  carouselSwipeMobileEnable: boolean;

  sliderAutoplay: boolean;
  sliderAutoplayPauseOnHover: boolean;
  sliderAutoplayInterval: number;
  sliderAnimationSpeed: number;
  sliderPagination: boolean;
  sliderArrowsEnable: boolean;
  sliderArrowsOnMobileEnable: boolean;

  gridColumnsMode: 'auto' | 'custom';
  gridColumnsDesktopLarge: number;
  gridColumnsTablet: number;
  gridColumnsMobile: number;
  gridItemSpacing: number;
  gridRows: number;
  gridRowsOnMobile: number;
  showLoadMoreButton: boolean;
  listItemSpacing: number;
  listItemsPerPage: number;
  listItemsPerPageOnMobile: number;
  masonryColumnsMode: 'auto' | 'custom';
  masonryColumnsDesktopLarge: number;
  masonryColumnsTablet: number;
  masonryColumnsMobile: number;
  masonryItemSpacing: number;
  masonryItemsPerPage: number;
  masonryItemsPerPageOnMobile: number;

  reviewLayout: ReviewLayout;
  reviewSourceStyle: SourceStyle;
  reviewDisplayOwnerReply: boolean;
  reviewDisplayAuthorName: boolean;
  reviewDisplayVerifiedBadge: boolean;
  reviewDisplayAuthorPicture: boolean;
  reviewDisplayDate: boolean;
  reviewDisplayRating: boolean;
  reviewDisplaySource: boolean;
  reviewHeightNormalization: boolean;
  reviewTextDisplayMode: 'short' | 'full';
  reviewPreviewLinesNumber: number;
  reviewAuthorNameFormat: 'fullName' | 'firstName' | 'firstNameLastInitial';

  widgetTitle: boolean;
  widgetTitleTitle: string;
  widgetTitleCaption: string;
  showOverallRating: boolean;
  headerLayout: HeaderLayout;
  headerElements: ('title' | 'rating' | 'reviewsNumber')[];
  showWriteReviewButton: boolean;

  badgeDisplayMode: 'singleInline' | 'singleFloating';
  badgeInlinePosition: 'left' | 'center' | 'right';
  badgeFloatingPosition: { position: string; horizontalOffset: number; verticalOffset: number };
  badgeSize: 'small' | 'medium' | 'large';
  badgeLabelType: 'custom' | 'none';
  badgeLabelCustomText: string;
  badgeDisplayNumberOfReviews: boolean;
  badgeDisplaySourceIcon: boolean;
  badgeDisplayVerifiedBadge: boolean;
  badgeDisplayRating: boolean;
  badgeCloseButton: boolean;
  badgeClickAction: 'openPopup' | 'openLink' | 'none';

  displayReviewsOnlyWithText: boolean;
  displayReviewsOnlyWithImages: boolean;
  filterMinRating: number;
  filterIncludeKeywords: Keyword[];
  filterExcludeKeywords: Keyword[];
  limitTotalNumberOfItems: boolean;
  totalNumberOfItems: number;
  sorting: 'date' | 'rating' | 'relevance' | 'random';

  enableExternalLinks: boolean;
  openLinksInNewTab: boolean;
  enableSchemaOrg: boolean;
  customCSS: string;
  theme: { themeSettings: ThemeSettings };
}

export const DEFAULTS: Settings = {
  sources: [],
  layout: 'carousel',
  widgetWidth: { auto: true, customValue: 1280 },
  carouselColumnsMode: 'auto',
  carouselColumnsDesktopLarge: 4,
  carouselColumnsDesktopMedium: 3,
  carouselColumnsDesktopSmall: 3,
  carouselColumnsTablet: 2,
  carouselColumnsMobile: 1,
  carouselItemSpacing: 20,
  carouselAutoplay: false,
  carouselAutoplayPauseOnHover: true,
  carouselAutoplayInterval: 5000,
  carouselAnimationSpeed: 740,
  carouselPagination: true,
  carouselArrowsEnable: true,
  carouselArrowsOnMobileEnable: true,
  carouselSwipeDesktopEnable: true,
  carouselSwipeMobileEnable: true,
  sliderAutoplay: false,
  sliderAutoplayPauseOnHover: true,
  sliderAutoplayInterval: 5000,
  sliderAnimationSpeed: 740,
  sliderPagination: true,
  sliderArrowsEnable: true,
  sliderArrowsOnMobileEnable: true,
  gridColumnsMode: 'auto',
  gridColumnsDesktopLarge: 5,
  gridColumnsTablet: 2,
  gridColumnsMobile: 1,
  gridItemSpacing: 20,
  gridRows: 3,
  gridRowsOnMobile: 3,
  showLoadMoreButton: true,
  listItemSpacing: 20,
  listItemsPerPage: 8,
  listItemsPerPageOnMobile: 8,
  masonryColumnsMode: 'auto',
  masonryColumnsDesktopLarge: 5,
  masonryColumnsTablet: 2,
  masonryColumnsMobile: 1,
  masonryItemSpacing: 20,
  masonryItemsPerPage: 8,
  masonryItemsPerPageOnMobile: 8,
  reviewLayout: 'classic',
  reviewSourceStyle: 'text',
  reviewDisplayOwnerReply: true,
  reviewDisplayAuthorName: true,
  reviewDisplayVerifiedBadge: true,
  reviewDisplayAuthorPicture: true,
  reviewDisplayDate: true,
  reviewDisplayRating: true,
  reviewDisplaySource: true,
  reviewHeightNormalization: true,
  reviewTextDisplayMode: 'short',
  reviewPreviewLinesNumber: 4,
  reviewAuthorNameFormat: 'fullName',
  widgetTitle: false,
  widgetTitleTitle: 'What Our Customers Say',
  widgetTitleCaption: '',
  showOverallRating: true,
  headerLayout: 'header1',
  headerElements: ['title', 'rating', 'reviewsNumber'],
  showWriteReviewButton: true,
  badgeDisplayMode: 'singleInline',
  badgeInlinePosition: 'center',
  badgeFloatingPosition: { position: 'bottom-left', horizontalOffset: 20, verticalOffset: 20 },
  badgeSize: 'medium',
  badgeLabelType: 'custom',
  badgeLabelCustomText: 'Google Rating',
  badgeDisplayNumberOfReviews: true,
  badgeDisplaySourceIcon: true,
  badgeDisplayVerifiedBadge: true,
  badgeDisplayRating: true,
  badgeCloseButton: true,
  badgeClickAction: 'openPopup',
  displayReviewsOnlyWithText: true,
  displayReviewsOnlyWithImages: false,
  filterMinRating: 4,
  filterIncludeKeywords: [],
  filterExcludeKeywords: [],
  limitTotalNumberOfItems: false,
  totalNumberOfItems: 100,
  sorting: 'date',
  enableExternalLinks: true,
  openLinksInNewTab: true,
  enableSchemaOrg: true,
  customCSS: '',
  theme: {
    themeSettings: {
      widgetTitleTitleColor: 'rgba(17, 17, 17, 1)',
      widgetTitleCaptionColor: 'rgba(17, 17, 17, 0.7)',
      widgetTitleAlignment: 'center',
      widgetTitleTitleTextStyle: { fontSize: 24, fontWeight: 'bold' },
      widgetBackground: { color: 'transparent', borderRadius: 0 },
      widgetHorizontalPadding: 0,
      widgetVerticalPadding: 0,
      reviewBackgroundColor: 'rgba(248, 248, 248, 1)',
      reviewOutlineColor: 'rgba(17, 17, 17, 0.1)',
      reviewTextColor: 'rgba(17, 17, 17, 1)',
      reviewReadMoreColor: 'rgba(0, 109, 255, 1)',
      reviewVerifiedBadgeColor: 'rgba(0, 109, 255, 1)',
      reviewSourceNameColor: 'rgba(0, 109, 255, 1)',
      reviewCornerRadius: 8,
      reviewTextFontSize: { fontSize: 16 },
      reviewRatingSize: 'medium',
      ratingColor: 'rgba(252, 191, 2, 1)',
      headerBackgroundColor: 'transparent',
      headerTextColor: 'rgba(17, 17, 17, 1)',
      headerCornerRadius: 8,
      writeReviewButton: { color: 'rgba(0, 109, 255, 1)', fontColor: 'rgb(255, 255, 255)', borderRadius: 24, horizontalPadding: 21, verticalPadding: 9, font: { fontSize: 14, fontWeight: 'bold' } },
      loadMoreButton: { text: 'Load More', color: 'rgba(248, 248, 248, 1)', fontColor: 'rgb(17, 17, 17)', borderRadius: 4, font: { fontSize: 13, fontWeight: 'bold' } },
      carouselArrowBackgroundColor: 'rgba(17, 17, 17, 0.5)',
      carouselArrowColor: 'rgba(255, 255, 255, 1)',
      carouselArrowBackgroundColorOnHover: 'rgba(17, 17, 17, 0.7)',
      carouselArrowColorOnHover: 'rgba(255, 255, 255, 1)',
      carouselArrowSize: 32,
      carouselPaginationColor: 'rgba(17, 17, 17, 1)',
      popupBackgroundColor: 'rgba(255, 255, 255, 1)',
      popupTextColor: 'rgba(17, 17, 17, 1)',
      popupRatingColor: 'rgba(252, 191, 2, 1)',
      popupReviewReadMoreColor: 'rgba(0, 109, 255, 1)',
      badgeBackgroundColor: 'rgba(255, 255, 255, 1)',
      badgeTextColor: 'rgba(17, 17, 17, 1)',
      badgeRatingColor: 'rgba(252, 191, 2, 1)',
      badgeCornerRadius: 12,
    },
  },
};

/** Data-source config — where the reviews come from, separate from how they look. */
export interface SourceConfig {
  placeId: string;
  googleApiKey: string;
  feedUrl: string;
  language: string;
}

function parseJson(raw: unknown): Partial<Settings> {
  if (raw && typeof raw === 'object') return raw as Partial<Settings>;
  if (typeof raw !== 'string' || !raw.trim()) return {};
  try {
    const parsed = JSON.parse(raw);
    // Accept either a bare settings object or the full Elfsight widget export.
    return (parsed?.publishedWidgetRevision?.settings ?? parsed?.settings ?? parsed) as Partial<Settings>;
  } catch (e) {
    console.error('[google-reviews] settingsJson is not valid JSON — using defaults', e);
    return {};
  }
}

function str(v: unknown): string {
  return typeof v === 'string' ? v.trim() : '';
}

function keywords(v: unknown): Keyword[] {
  return str(v).split(',').map((k) => k.trim()).filter(Boolean).map((keyword) => ({ keyword }));
}

/** The Duda panel fields that override the JSON. Empty means "keep the JSON value". */
function panelOverrides(c: Record<string, unknown>): Partial<Settings> {
  const o: Partial<Settings> = {};
  const enumField = <K extends keyof Settings>(key: K, allowed: readonly string[]): void => {
    const v = str(c[key]);
    if (allowed.includes(v)) (o as Record<string, unknown>)[key] = v;
  };
  enumField('layout', ['carousel', 'slider', 'grid', 'list', 'masonry', 'cardBadge']);
  enumField('reviewLayout', ['classic', 'balloon', 'spotlight']);
  enumField('headerLayout', ['header1', 'header2', 'header4', 'header7', 'header9']);
  enumField('reviewSourceStyle', ['text', 'logo', 'icon', 'logoBottom', 'iconBottom']);
  enumField('badgeDisplayMode', ['singleInline', 'singleFloating']);
  for (const key of ['showOverallRating', 'showWriteReviewButton', 'widgetTitle', 'carouselAutoplay'] as const) {
    if (c[key] !== undefined && c[key] !== '') o[key] = coerceBool(c[key]);
  }
  if (str(c.widgetTitleTitle)) o.widgetTitleTitle = str(c.widgetTitleTitle);
  const min = Number(str(c.filterMinRating));
  if (min >= 1 && min <= 5) o.filterMinRating = min;
  if (str(c.includeKeywords)) o.filterIncludeKeywords = keywords(c.includeKeywords);
  if (str(c.excludeKeywords)) o.filterExcludeKeywords = keywords(c.excludeKeywords);
  if (str(c.placeId)) o.sources = [{ url: str(c.placeId) }];
  return o;
}

function panelTheme(c: Record<string, unknown>): ThemeSettings {
  const t: ThemeSettings = {};
  const colour = (key: string, set: (v: string) => void): void => {
    const v = str(c[key]);
    if (v) set(v);
  };
  colour('cardBackground', (v) => { t.reviewBackgroundColor = v; });
  colour('cardTextColour', (v) => { t.reviewTextColor = v; });
  colour('starColour', (v) => { t.ratingColor = v; t.popupRatingColor = v; t.badgeRatingColor = v; });
  colour('accentColour', (v) => {
    t.reviewReadMoreColor = v;
    t.reviewVerifiedBadgeColor = v;
    t.reviewSourceNameColor = v;
    t.writeReviewButton = { color: v };
  });
  colour('fontFamily', (v) => { t.font = { value: v, googleFont: true }; });
  return t;
}

function mergeTheme(...layers: (ThemeSettings | undefined)[]): ThemeSettings {
  const out: Record<string, unknown> = {};
  for (const layer of layers) {
    if (!layer) continue;
    for (const [k, v] of Object.entries(layer)) {
      const prev = out[k];
      out[k] =
        v && typeof v === 'object' && !Array.isArray(v) && prev && typeof prev === 'object'
          ? { ...(prev as object), ...(v as object) }
          : v;
    }
  }
  return out as ThemeSettings;
}

export function readSettings(config: Record<string, unknown> = {}): Settings {
  const json = parseJson(config.settingsJson);
  const merged = { ...DEFAULTS, ...json, ...panelOverrides(config) } as Settings;
  return {
    ...merged,
    theme: {
      themeSettings: mergeTheme(DEFAULTS.theme.themeSettings, json.theme?.themeSettings, panelTheme(config)),
    },
  };
}

export function readSource(config: Record<string, unknown>, settings: Settings): SourceConfig {
  return {
    placeId: settings.sources.find((s) => s.url)?.url ?? '',
    googleApiKey: str(config.googleApiKey),
    feedUrl: str(config.feedUrl),
    language: str(config.language) || 'en',
  };
}

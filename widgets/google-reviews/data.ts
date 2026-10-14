// Review data: load from Google (Places API) or a JSON feed, normalise to one
// shape, then filter + sort per the widget settings. Pure apart from the fetchers.

import type { Settings, SourceConfig } from './settings';

export interface OwnerReply {
  text: string;
  publishedAt: number | null;
}

export interface Review {
  id: string;
  authorName: string;
  authorPhoto: string;
  authorUrl: string;
  rating: number;
  text: string;
  publishedAt: number | null;
  relativeTime: string;
  url: string;
  images: string[];
  reply: OwnerReply | null;
}

export interface Business {
  name: string;
  rating: number;
  reviewCount: number;
  reviewsUrl: string;
  writeReviewUrl: string;
}

export interface ReviewData {
  business: Business;
  reviews: Review[];
}

const PLACES_FIELDS = 'displayName,rating,userRatingCount,googleMapsUri,reviews';
const CACHE_TTL_MS = 6 * 60 * 60 * 1000;
const CACHE_PREFIX = 'shm-greviews:';

export function writeReviewUrl(placeId: string): string {
  return placeId ? `https://search.google.com/local/writereview?placeid=${encodeURIComponent(placeId)}` : '';
}

function toEpochSeconds(v: unknown): number | null {
  if (typeof v === 'number' && Number.isFinite(v)) return v > 1e12 ? Math.round(v / 1000) : v;
  if (typeof v === 'string' && v) {
    const ms = Date.parse(v);
    return Number.isNaN(ms) ? null : Math.round(ms / 1000);
  }
  return null;
}

type Raw = Record<string, any>;

/** Places API (New) place-details response → ReviewData. */
export function fromPlaces(place: Raw, placeId: string): ReviewData {
  const reviews: Review[] = (place.reviews ?? []).map((r: Raw, i: number) => ({
    id: r.name ?? `${placeId}-${i}`,
    authorName: r.authorAttribution?.displayName ?? '',
    authorPhoto: r.authorAttribution?.photoUri ?? '',
    authorUrl: r.authorAttribution?.uri ?? '',
    rating: Number(r.rating) || 0,
    text: r.text?.text ?? r.originalText?.text ?? '',
    publishedAt: toEpochSeconds(r.publishTime),
    relativeTime: r.relativePublishTimeDescription ?? '',
    url: r.googleMapsUri ?? r.authorAttribution?.uri ?? '',
    images: [],
    reply: null,
  }));
  return {
    business: {
      name: place.displayName?.text ?? '',
      rating: Number(place.rating) || 0,
      reviewCount: Number(place.userRatingCount) || reviews.length,
      reviewsUrl: place.googleMapsUri ?? '',
      writeReviewUrl: writeReviewUrl(placeId),
    },
    reviews,
  };
}

/**
 * A JSON feed. Accepts our own `{ business, reviews }` shape, or a reviews
 * service payload in the `{ reviewer_name, rating, text, published_at, response }`
 * shape (the one Elfsight's widget consumes), so either can back the widget.
 */
export function fromFeed(feed: Raw, placeId: string): ReviewData {
  const root = feed?.result ?? feed;
  const list: Raw[] = root?.reviews ?? root?.data ?? [];
  const reviews: Review[] = list.map((r, i) => ({
    id: String(r.id ?? `${placeId}-${i}`),
    authorName: r.authorName ?? r.reviewer_name ?? '',
    authorPhoto: r.authorPhoto ?? r.reviewer_picture_url ?? '',
    authorUrl: r.authorUrl ?? '',
    rating: Number(r.rating) || 0,
    text: r.text ?? '',
    publishedAt: toEpochSeconds(r.publishedAt ?? r.published_at),
    relativeTime: r.relativeTime ?? '',
    url: r.url ?? '',
    images: Array.isArray(r.images) ? r.images.map((x: Raw | string) => (typeof x === 'string' ? x : x.url)).filter(Boolean) : [],
    reply: r.reply
      ? { text: r.reply.text ?? '', publishedAt: toEpochSeconds(r.reply.publishedAt) }
      : r.response?.text
        ? { text: r.response.text, publishedAt: toEpochSeconds(r.response.published_at) }
        : null,
  }));
  const b: Raw = root?.business ?? {};
  return {
    business: {
      name: b.name ?? '',
      rating: Number(b.rating) || average(reviews),
      reviewCount: Number(b.reviewCount ?? b.reviews_number) || reviews.length,
      reviewsUrl: b.reviewsUrl ?? '',
      writeReviewUrl: b.writeReviewUrl ?? writeReviewUrl(placeId),
    },
    reviews,
  };
}

function average(reviews: Review[]): number {
  if (!reviews.length) return 0;
  return Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10;
}

function readCache(key: string): ReviewData | null {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + key);
    if (!raw) return null;
    const { at, data } = JSON.parse(raw);
    return Date.now() - at < CACHE_TTL_MS ? (data as ReviewData) : null;
  } catch {
    return null;
  }
}

function writeCache(key: string, data: ReviewData): void {
  try {
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify({ at: Date.now(), data }));
  } catch {
    // Storage full or blocked (private mode) — the widget still renders, uncached.
  }
}

async function getJson(url: string): Promise<Raw> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} from ${url.split('?')[0]}`);
  return res.json();
}

export async function loadReviews(src: SourceConfig, fetchJson = getJson): Promise<ReviewData> {
  const cacheKey = `${src.feedUrl || src.placeId}|${src.language}`;
  const cached = readCache(cacheKey);
  if (cached) return cached;

  let data: ReviewData;
  if (src.feedUrl) {
    data = fromFeed(await fetchJson(src.feedUrl), src.placeId);
  } else if (src.placeId && src.googleApiKey) {
    const url =
      `https://places.googleapis.com/v1/places/${encodeURIComponent(src.placeId)}` +
      `?fields=${PLACES_FIELDS}&languageCode=${encodeURIComponent(src.language)}&key=${encodeURIComponent(src.googleApiKey)}`;
    data = fromPlaces(await fetchJson(url), src.placeId);
  } else {
    throw new Error('No review source: set a Google Place ID + API key, or a feed URL');
  }
  writeCache(cacheKey, data);
  return data;
}

function matches(text: string, keyword: string): boolean {
  return text.toLowerCase().includes(keyword.toLowerCase());
}

/** Apply Elfsight's filter + sort semantics. Never mutates the input. */
export function selectReviews(reviews: readonly Review[], s: Settings, random = Math.random): Review[] {
  const include = s.filterIncludeKeywords.map((k) => k.keyword.trim()).filter(Boolean);
  const exclude = s.filterExcludeKeywords.map((k) => k.keyword.trim()).filter(Boolean);
  const kept = reviews.filter((r) => {
    if (r.rating < s.filterMinRating) return false;
    if (s.displayReviewsOnlyWithText && !r.text.trim()) return false;
    if (s.displayReviewsOnlyWithImages && !r.images.length) return false;
    const haystack = `${r.text} ${r.authorName}`;
    if (include.length && !include.some((k) => matches(haystack, k))) return false;
    if (exclude.some((k) => matches(haystack, k))) return false;
    return true;
  });
  const sorted = [...kept];
  if (s.sorting === 'date') sorted.sort((a, b) => (b.publishedAt ?? 0) - (a.publishedAt ?? 0));
  else if (s.sorting === 'rating') sorted.sort((a, b) => b.rating - a.rating || (b.publishedAt ?? 0) - (a.publishedAt ?? 0));
  else if (s.sorting === 'random') {
    for (let i = sorted.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [sorted[i], sorted[j]] = [sorted[j], sorted[i]];
    }
  }
  return s.limitTotalNumberOfItems ? sorted.slice(0, s.totalNumberOfItems) : sorted;
}

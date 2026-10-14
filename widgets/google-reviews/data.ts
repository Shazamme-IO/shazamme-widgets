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

const text = (v: unknown): string => (typeof v === 'string' ? v : '');
const list = (v: unknown): Raw[] => (Array.isArray(v) ? v.filter((x): x is Raw => Boolean(x) && typeof x === 'object') : []);

/** Places API (New) place-details response → ReviewData. */
export function fromPlaces(place: Raw, placeId: string): ReviewData {
  const reviews: Review[] = list(place?.reviews).map((r, i) => ({
    id: text(r.name) || `${placeId}-${i}`,
    authorName: text(r.authorAttribution?.displayName),
    authorPhoto: text(r.authorAttribution?.photoUri),
    authorUrl: text(r.authorAttribution?.uri),
    rating: Number(r.rating) || 0,
    text: text(r.text?.text) || text(r.originalText?.text),
    publishedAt: toEpochSeconds(r.publishTime),
    relativeTime: text(r.relativePublishTimeDescription),
    url: text(r.googleMapsUri) || text(r.authorAttribution?.uri),
    images: [],
    reply: null,
  }));
  return {
    business: {
      name: text(place?.displayName?.text),
      rating: Number(place?.rating) || 0,
      reviewCount: Number(place?.userRatingCount) || reviews.length,
      reviewsUrl: text(place?.googleMapsUri),
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
  const root: Raw = feed?.result ?? feed ?? {};
  const reviews: Review[] = list(root.reviews ?? root.data).map((r, i) => {
    const reply: Raw | null = r.reply && typeof r.reply === 'object' ? r.reply : r.response && typeof r.response === 'object' ? r.response : null;
    return {
      id: String(r.id ?? `${placeId}-${i}`),
      authorName: text(r.authorName) || text(r.reviewer_name),
      authorPhoto: text(r.authorPhoto) || text(r.reviewer_picture_url),
      authorUrl: text(r.authorUrl),
      rating: Number(r.rating) || 0,
      text: text(r.text),
      publishedAt: toEpochSeconds(r.publishedAt ?? r.published_at),
      relativeTime: text(r.relativeTime),
      url: text(r.url),
      images: (Array.isArray(r.images) ? r.images : [])
        .map((x: unknown) => (typeof x === 'string' ? x : x && typeof x === 'object' ? text((x as Raw).url) : ''))
        .filter(Boolean),
      reply: reply && text(reply.text)
        ? { text: text(reply.text), publishedAt: toEpochSeconds(reply.publishedAt ?? reply.published_at) }
        : null,
    };
  });
  const b: Raw = root.business && typeof root.business === 'object' ? root.business : {};
  return {
    business: {
      name: text(b.name),
      rating: Number(b.rating) || average(reviews),
      reviewCount: Number(b.reviewCount ?? b.reviews_number) || reviews.length,
      reviewsUrl: text(b.reviewsUrl),
      writeReviewUrl: text(b.writeReviewUrl) || writeReviewUrl(placeId),
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
    const fresh = typeof at === 'number' && Date.now() - at < CACHE_TTL_MS;
    return fresh && data?.business && Array.isArray(data.reviews) ? (data as ReviewData) : null;
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

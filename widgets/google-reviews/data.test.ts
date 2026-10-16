import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fromFeed, fromPlaces, loadReviews, selectReviews, writeReviewUrl, type Review } from './data';
import { readSettings } from './settings';

const review = (over: Partial<Review>): Review => ({
  id: 'r', authorName: 'Ann Smith', authorPhoto: '', authorUrl: '', rating: 5, text: 'Great',
  publishedAt: 1_700_000_000, relativeTime: '', url: '', images: [], reply: null, ...over,
});

describe('fromPlaces', () => {
  it('maps a Places API (New) place to business + reviews', () => {
    const d = fromPlaces({
      displayName: { text: 'Acme Recruitment' }, rating: 4.8, userRatingCount: 129, googleMapsUri: 'https://maps.google.com/?cid=1',
      reviews: [{ name: 'places/x/reviews/1', rating: 5, text: { text: 'Lovely' }, publishTime: '2026-07-01T10:00:00Z',
        relativePublishTimeDescription: '3 months ago', authorAttribution: { displayName: 'Lloyd D', photoUri: 'https://p/1', uri: 'https://u/1' } }],
    }, 'ChIJabc');
    expect(d.business).toEqual({ name: 'Acme Recruitment', rating: 4.8, reviewCount: 129, reviewsUrl: 'https://maps.google.com/?cid=1', writeReviewUrl: writeReviewUrl('ChIJabc') });
    expect(d.reviews[0]).toMatchObject({ id: 'places/x/reviews/1', authorName: 'Lloyd D', authorPhoto: 'https://p/1', rating: 5, text: 'Lovely', publishedAt: Date.parse('2026-07-01T10:00:00Z') / 1000 });
  });

  it('survives a place with no reviews', () => {
    expect(fromPlaces({ rating: 5 }, 'ChIJ').reviews).toEqual([]);
  });
});

describe('fromFeed', () => {
  it('reads the reviews-service shape, including owner replies', () => {
    const d = fromFeed({ status: 'success', result: { data: [
      { id: 'a', reviewer_name: 'Mark', reviewer_picture_url: 'https://p', rating: 5, text: 'Helpful', published_at: 1791304462, response: { text: 'Thanks Mark', published_at: 1791304999 } },
    ] } }, 'ChIJ');
    expect(d.reviews[0]).toMatchObject({ id: 'a', authorName: 'Mark', publishedAt: 1791304462, reply: { text: 'Thanks Mark', publishedAt: 1791304999 } });
    expect(d.business.reviewCount).toBe(1);
    expect(d.business.rating).toBe(5);
  });
});

describe('malformed feeds', () => {
  it('coerces wrong types instead of throwing, so one bad review cannot blank the widget', () => {
    const d = fromFeed({ reviews: [null, { reviewer_name: 42, text: { x: 1 }, images: [null, 'https://i/1', { url: 'https://i/2' }] }], business: 'nope' }, 'ChIJ');
    expect(d.reviews).toHaveLength(1);
    expect(d.reviews[0]).toMatchObject({ authorName: '', text: '', images: ['https://i/1', 'https://i/2'] });
    expect(() => selectReviews(d.reviews, readSettings({ filterMinRating: '1' }))).not.toThrow();
  });

  it('tolerates a non-array data payload', () => {
    expect(fromFeed({ result: { data: 'oops' } }, 'ChIJ').reviews).toEqual([]);
  });
});

describe('selectReviews', () => {
  const s = readSettings({});
  const list = [
    review({ id: '1', rating: 5, text: 'Emma was brilliant', publishedAt: 100 }),
    review({ id: '2', rating: 3, text: 'Ok', publishedAt: 300 }),
    review({ id: '3', rating: 5, text: '', publishedAt: 200 }),
    review({ id: '4', rating: 4, text: 'Candidate experience good', publishedAt: 400 }),
  ];

  it('applies min rating and text-only, newest first', () => {
    expect(selectReviews(list, { ...s, filterMinRating: 4 }).map((r) => r.id)).toEqual(['4', '1']);
  });

  it('include keywords keep only matching reviews (per-consultant widgets)', () => {
    expect(selectReviews(list, { ...s, filterMinRating: 1, filterIncludeKeywords: [{ keyword: 'emma' }] }).map((r) => r.id)).toEqual(['1']);
  });

  it('exclude keywords drop matches; blank keywords are ignored', () => {
    const out = selectReviews(list, { ...s, filterMinRating: 1, filterExcludeKeywords: [{ keyword: 'Candidate' }, { keyword: '' }] });
    expect(out.map((r) => r.id)).toEqual(['2', '1']);
  });

  it('limits the total when asked, and never mutates the input', () => {
    const before = list.map((r) => r.id);
    expect(selectReviews(list, { ...s, filterMinRating: 1, displayReviewsOnlyWithText: false, limitTotalNumberOfItems: true, totalNumberOfItems: 2 })).toHaveLength(2);
    expect(list.map((r) => r.id)).toEqual(before);
  });
});

describe('loadReviews', () => {
  beforeEach(() => {
    const store = new Map<string, string>();
    vi.stubGlobal('localStorage', { getItem: (k: string) => store.get(k) ?? null, setItem: (k: string, v: string) => store.set(k, v) });
  });

  it('calls the Places API with the field mask and key, then serves the cache', async () => {
    const fetchJson = vi.fn().mockResolvedValue({ rating: 4.5, userRatingCount: 10, reviews: [] });
    const src = { placeId: 'ChIJabc', businessSearch: '', googleApiKey: 'KEY', feedUrl: '', language: 'en' };
    await loadReviews(src, fetchJson);
    await loadReviews(src, fetchJson);
    expect(fetchJson).toHaveBeenCalledTimes(1);
    expect(fetchJson.mock.calls[0][0]).toBe('https://places.googleapis.com/v1/places/ChIJabc?fields=displayName,rating,userRatingCount,googleMapsUri,reviews&languageCode=en&key=KEY');
  });

  it('prefers the feed URL when set', async () => {
    const fetchJson = vi.fn().mockResolvedValue({ reviews: [] });
    await loadReviews({ placeId: 'ChIJ', businessSearch: '', googleApiKey: 'KEY', feedUrl: 'https://feed/x.json', language: 'en' }, fetchJson);
    expect(fetchJson).toHaveBeenCalledWith('https://feed/x.json');
  });

  it('rejects with a clear message when there is no source', async () => {
    await expect(loadReviews({ placeId: '', businessSearch: '', googleApiKey: '', feedUrl: '', language: 'en' }, vi.fn())).rejects.toThrow(/API key/);
    await expect(loadReviews({ placeId: '', businessSearch: '', googleApiKey: 'KEY', feedUrl: '', language: 'en' }, vi.fn())).rejects.toThrow(/business name/);
  });

  it('finds the Place ID from "business name, suburb", then caches it', async () => {
    const doFetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ places: [{ id: 'ChIJfound' }] }) });
    const fetchJson = vi.fn().mockResolvedValue({ rating: 5, userRatingCount: 3, reviews: [] });
    const src = { placeId: '', businessSearch: 'Acme Recruitment, Sydney', googleApiKey: 'KEY', feedUrl: '', language: 'en' };
    const d = await loadReviews(src, fetchJson, doFetch as unknown as typeof fetch);
    expect(doFetch.mock.calls[0][0]).toBe('https://places.googleapis.com/v1/places:searchText');
    expect(JSON.parse(doFetch.mock.calls[0][1].body)).toEqual({ textQuery: 'Acme Recruitment, Sydney' });
    expect(fetchJson.mock.calls[0][0]).toContain('/places/ChIJfound?');
    expect(d.business.writeReviewUrl).toContain('ChIJfound');
    await loadReviews(src, fetchJson, doFetch as unknown as typeof fetch);
    expect(doFetch).toHaveBeenCalledTimes(1);
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { API_BASE, fromFeed, loadReviews, searchBusinesses, selectReviews, type Review } from './data';
import { readSettings } from './settings';

const review = (over: Partial<Review>): Review => ({
  id: 'r', authorName: 'Ann Smith', authorPhoto: '', authorUrl: '', rating: 5, text: 'Great',
  publishedAt: 1_700_000_000, relativeTime: '', url: '', images: [], reply: null, ...over,
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
  const src = (over: Record<string, string> = {}) => ({ placeId: '', businessSearch: '', feedUrl: '', language: 'en', ...over });

  it('always goes through the Shazamme helper (never Google directly), then serves the cache', async () => {
    const fetchJson = vi.fn().mockResolvedValue({ business: { placeId: 'ChIJabc', name: 'Acme', address: '1 St', rating: 4.5, reviewCount: 10 }, reviews: [] });
    await loadReviews(src({ placeId: 'ChIJabc' }), fetchJson);
    await loadReviews(src({ placeId: 'ChIJabc' }), fetchJson);
    expect(fetchJson).toHaveBeenCalledTimes(1);
    expect(fetchJson.mock.calls[0][0]).toBe(`${API_BASE}/api/reviews?placeId=ChIJabc&lang=en`);
    expect(fetchJson.mock.calls[0][0]).not.toContain('googleapis');
  });

  it('a business name is resolved by the helper; its Place ID feeds the write-review link', async () => {
    const fetchJson = vi.fn().mockResolvedValue({ business: { placeId: 'ChIJfound', name: 'Acme' }, reviews: [] });
    const d = await loadReviews(src({ businessSearch: 'Acme Recruitment, Sydney' }), fetchJson);
    expect(fetchJson.mock.calls[0][0]).toBe(`${API_BASE}/api/reviews?q=Acme%20Recruitment%2C%20Sydney&lang=en`);
    expect(d.business.writeReviewUrl).toContain('ChIJfound');
  });

  it('prefers the feed URL when set', async () => {
    const fetchJson = vi.fn().mockResolvedValue({ business: { name: 'Acme' }, reviews: [] });
    await loadReviews(src({ placeId: 'ChIJ', feedUrl: 'https://feed/x.json' }), fetchJson);
    expect(fetchJson).toHaveBeenCalledWith('https://feed/x.json');
  });

  it('an empty 200 is an error and is never cached', async () => {
    const fetchJson = vi.fn().mockResolvedValue({});
    await expect(loadReviews(src({ placeId: 'ChIJempty' }), fetchJson)).rejects.toThrow(/no business/);
    await expect(loadReviews(src({ placeId: 'ChIJempty' }), fetchJson)).rejects.toThrow();
    expect(fetchJson).toHaveBeenCalledTimes(2);
  });

  it('falls back to the last good copy when the helper is down', async () => {
    const good = { business: { name: 'Acme', rating: 5, reviewCount: 1 }, reviews: [] };
    vi.useFakeTimers();
    await loadReviews(src({ placeId: 'ChIJstale' }), vi.fn().mockResolvedValue(good));
    vi.setSystemTime(Date.now() + 7 * 60 * 60 * 1000);
    const d = await loadReviews(src({ placeId: 'ChIJstale' }), vi.fn().mockRejectedValue(new Error('down')));
    expect(d.business.name).toBe('Acme');
    vi.useRealTimers();
  });

  it('tells the site builder what to do when nothing is set', async () => {
    await expect(loadReviews(src(), vi.fn())).rejects.toThrow(/Search for the business/);
  });
});

describe('searchBusinesses', () => {
  it('calls the helper and drops results without a Place ID', async () => {
    const fetchJson = vi.fn().mockResolvedValue({ results: [{ placeId: 'ChIJ1', name: 'HRA', address: 'Wolverhampton' }, { name: 'x' }] });
    expect(await searchBusinesses('hra', 'en', fetchJson)).toEqual([{ placeId: 'ChIJ1', name: 'HRA', address: 'Wolverhampton' }]);
    expect(fetchJson.mock.calls[0][0]).toBe(`${API_BASE}/api/places/search?q=hra&lang=en`);
  });
});

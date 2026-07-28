import { describe, it, expect, vi } from 'vitest';
import { geocode, geocodeUrl, debounce } from './geo';

describe('geocodeUrl', () => {
  it('encodes the query and appends the api key', () => {
    expect(geocodeUrl('London, UK', 'KEY1')).toBe(
      'https://geocode.maps.co/search?q=London%2C%20UK&api_key=KEY1',
    );
  });
});

describe('geocode', () => {
  it('parses display_name/lat/lon into label/lat/lon', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      json: async () => [
        { display_name: 'London, England, UK', lat: '51.5074', lon: '-0.1278' },
        { display_name: 'London, Ontario, Canada', lat: '42.98', lon: '-81.24' },
      ],
    });
    const out = await geocode('London', 'KEY1', fetchImpl);
    expect(fetchImpl).toHaveBeenCalledWith(geocodeUrl('London', 'KEY1'));
    expect(out).toEqual([
      { label: 'London, England, UK', lat: 51.5074, lon: -0.1278 },
      { label: 'London, Ontario, Canada', lat: 42.98, lon: -81.24 },
    ]);
  });

  it('returns [] for empty input without calling fetch', async () => {
    const fetchImpl = vi.fn();
    expect(await geocode('   ', 'KEY1', fetchImpl)).toEqual([]);
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it('returns [] when the API returns a non-array', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({ json: async () => ({ error: 'nope' }) });
    expect(await geocode('x', 'KEY1', fetchImpl)).toEqual([]);
  });

  it('drops rows with unparseable coordinates', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      json: async () => [{ display_name: 'bad', lat: 'abc', lon: 'def' }],
    });
    expect(await geocode('x', 'KEY1', fetchImpl)).toEqual([]);
  });
});

describe('debounce', () => {
  it('coalesces rapid calls into a single trailing invocation', () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    const d = debounce(fn, 300);
    d('a');
    d('b');
    d('c');
    expect(fn).not.toHaveBeenCalled();
    vi.advanceTimersByTime(300);
    expect(fn).toHaveBeenCalledOnce();
    expect(fn).toHaveBeenCalledWith('c');
    vi.useRealTimers();
  });
});

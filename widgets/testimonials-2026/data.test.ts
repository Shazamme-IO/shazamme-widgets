import { describe, expect, it } from 'vitest';
import { filterTestimonials, normalise, parseRating, safeUrl, sortTestimonials } from './data';
import { readSettings, splitTags } from './settings';
import { initials, schemaJsonLd } from './render';

describe('splitTags', () => {
  it('trims, lowercases, de-duplicates and drops empties', () => {
    expect(splitTags(' A , a;B|  ,, c ')).toEqual(['a', 'b', 'c']);
  });
  it('returns nothing for missing or non-string input', () => {
    expect(splitTags(undefined)).toEqual([]);
    expect(splitTags(null)).toEqual([]);
    expect(splitTags(7)).toEqual([]);
    expect(splitTags('')).toEqual([]);
  });
});

describe('readSettings', () => {
  it('returns safe defaults for anything that is not an object', () => {
    for (const input of [undefined, null, 'x', 5, []]) {
      const s = readSettings(input);
      expect(s.layout).toBe('slider');
      expect(s.tags).toEqual([]);
      expect(s.autoplay).toBe(false);
      expect(s.schemaEnabled).toBe(false);
      expect(s.ariaLabel).toBe('Client testimonials');
    }
  });
  it('reads booleans from strings, so "false" is false', () => {
    expect(readSettings({ showPhoto: 'false', autoplay: 'true', loop: false }).showPhoto).toBe(false);
    expect(readSettings({ autoplay: 'true' }).autoplay).toBe(true);
    expect(readSettings({ loop: false }).loop).toBe(false);
  });
  it('clamps numbers into their range', () => {
    expect(readSettings({ columnsDesktop: '99' }).columnsDesktop).toBe(4);
    expect(readSettings({ columnsDesktop: '0' }).columnsDesktop).toBe(1);
    expect(readSettings({ autoplaySeconds: '1' }).autoplaySeconds).toBe(2);
  });
});

describe('data helpers', () => {
  it('safeUrl allows http(s) and site paths only', () => {
    expect(safeUrl('https://a.example/x.jpg')).toBe('https://a.example/x.jpg');
    expect(safeUrl('/img/a.jpg')).toBe('/img/a.jpg');
    for (const bad of ['javascript:alert(1)', 'data:text/html,x', '//evil.example/x', 'ftp://x', '', null, 5]) expect(safeUrl(bad)).toBe('');
  });
  it('parseRating accepts 0 < n <= 5 only', () => {
    expect(parseRating({ rating: '4.5' })).toBe(4.5);
    expect(parseRating({ stars: 3 })).toBe(3);
    for (const bad of [0, -1, 6, 'x', null, '']) expect(parseRating({ rating: bad })).toBeNull();
  });
  it('filters by consultant id case-insensitively', () => {
    const items = normalise([{ data: { content: 'a', consultantID: 'ABC' } }, { data: { content: 'b', consultantID: 'def' } }]);
    expect(filterTestimonials(items, { tags: [], consultantId: 'abc' }).map((t) => t.quote)).toEqual(['a']);
  });
  it('random sort is a permutation and honours the injected generator', () => {
    const items = normalise([1, 2, 3, 4].map((n) => ({ data: { content: `q${n}` } })));
    const out = sortTestimonials(items, 'random', () => 0);
    expect(out.map((t) => t.quote).sort()).toEqual(['q1', 'q2', 'q3', 'q4']);
  });
  it('initials handles one word, many words, blanks and emoji', () => {
    expect(initials('Jane Wisdom')).toBe('JW');
    expect(initials('cher')).toBe('C');
    expect(initials('Ana Maria de Souza')).toBe('AS');
    expect(initials('   ')).toBe('?');
    expect(initials('\u{1F600} Smile')).toBe('\u{1F600}S');
  });
  it('schemaJsonLd refuses to describe unrated testimonials', () => {
    const s = readSettings({ schemaEnabled: 'true', schemaBusinessName: 'Acme' });
    expect(schemaJsonLd(normalise([{ data: { content: 'x' } }]), s)).toBeNull();
  });
});

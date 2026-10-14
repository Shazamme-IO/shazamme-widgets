import { describe, it, expect } from 'vitest';
import { DEFAULTS, readSettings, readSource } from './settings';

describe('readSettings', () => {
  it('falls back to defaults with no config', () => {
    expect(readSettings({}).layout).toBe(DEFAULTS.layout);
  });

  it('accepts an Elfsight widget export and keeps its theme', () => {
    const exported = JSON.stringify({ publishedWidgetRevision: { settings: {
      layout: 'masonry', reviewLayout: 'balloon', sources: [{ url: 'ChIJxyz' }],
      theme: { themeSettings: { ratingColor: '#3e2e51', writeReviewButton: { color: '#123456' } } },
    } } });
    const s = readSettings({ settingsJson: exported });
    expect(s.layout).toBe('masonry');
    expect(s.reviewLayout).toBe('balloon');
    expect(s.theme.themeSettings.ratingColor).toBe('#3e2e51');
    expect(s.theme.themeSettings.writeReviewButton?.color).toBe('#123456');
    // nested objects merge onto the defaults rather than replacing them
    expect(s.theme.themeSettings.writeReviewButton?.borderRadius).toBe(24);
    expect(readSource({}, s).placeId).toBe('ChIJxyz');
  });

  it('lets Duda panel fields override the JSON; Duda string booleans are coerced', () => {
    const s = readSettings({
      settingsJson: '{"layout":"grid","showOverallRating":true}',
      layout: 'carousel', showOverallRating: 'false', placeId: 'ChIJpanel', includeKeywords: 'Emma, Barry', starColour: '#ff0000',
    });
    expect(s.layout).toBe('carousel');
    expect(s.showOverallRating).toBe(false);
    expect(s.sources[0].url).toBe('ChIJpanel');
    expect(s.filterIncludeKeywords.map((k) => k.keyword)).toEqual(['Emma', 'Barry']);
    expect(s.theme.themeSettings.ratingColor).toBe('#ff0000');
  });

  it('ignores invalid enum values and bad JSON', () => {
    const s = readSettings({ settingsJson: '{not json', layout: 'ticker' });
    expect(s.layout).toBe(DEFAULTS.layout);
  });
});

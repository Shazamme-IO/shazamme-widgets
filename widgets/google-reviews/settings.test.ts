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

describe('readSettings normalisation (hand-pasted JSON)', () => {
  it('coerces numeric strings and rejects junk numbers', () => {
    const s = readSettings({ settingsJson: '{"carouselItemSpacing":"20","reviewPreviewLinesNumber":"abc","filterMinRating":9}' });
    expect(s.carouselItemSpacing).toBe(20);
    expect(s.reviewPreviewLinesNumber).toBe(DEFAULTS.reviewPreviewLinesNumber);
    expect(s.filterMinRating).toBe(5);
  });

  it('drops enum values that are not on the allowlist, so they never reach markup', () => {
    const s = readSettings({ settingsJson: JSON.stringify({ reviewLayout: 'x"><img src=x onerror=alert(1)>', layout: 'grid list' }) });
    expect(s.reviewLayout).toBe(DEFAULTS.reviewLayout);
    expect(s.layout).toBe(DEFAULTS.layout);
  });

  it('keeps only well-formed keywords, sources and header elements', () => {
    const s = readSettings({ settingsJson: JSON.stringify({
      filterIncludeKeywords: [{ keyword: 'Emma' }, null, { keyword: 3 }, 'Barry'],
      sources: [{ url: ' ChIJ1 ' }, 'bad'],
      headerElements: ['rating', 'evil'],
    }) });
    expect(s.filterIncludeKeywords).toEqual([{ keyword: 'Emma' }, { keyword: 'Barry' }]);
    expect(s.sources).toEqual([{ url: 'ChIJ1' }, { url: '' }]);
    expect(s.headerElements).toEqual(['rating']);
  });

  it('the panel autoplay toggle drives the slider too', () => {
    const s = readSettings({ layout: 'slider', carouselAutoplay: 'true' });
    expect(s.sliderAutoplay).toBe(true);
  });
});

describe('Duda panel parity', () => {
  it('every key in the Duda AI prompt is one the widget reads', async () => {
    const { readFileSync } = await import('node:fs');
    const { join, dirname } = await import('node:path');
    const { fileURLToPath } = await import('node:url');
    const prompt = readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'duda-ai-prompt.md'), 'utf8');
    const keys = [...prompt.matchAll(/key: (\w+)/g)].map((m) => m[1]);
    const known = new Set([
      ...Object.keys(DEFAULTS), ...Object.keys(DEFAULTS.theme.themeSettings),
      'placeId', 'businessSearch', 'googleApiKey', 'language', 'feedUrl', 'includeKeywords', 'excludeKeywords',
      'widgetMaxWidth', 'reviewTextFontSize', 'widgetTitleFontSize', 'widgetBackgroundColor', 'fontFamily',
      'writeReviewButtonColor', 'writeReviewButtonTextColor', 'writeReviewButtonRadius',
    ]);
    expect(keys.length).toBeGreaterThan(70);
    expect(keys.filter((k) => !known.has(k))).toEqual([]);
  });

  it('plain panel fields set layout, behaviour and design with no JSON', () => {
    const s = readSettings({
      layout: 'grid', carouselAutoplay: 'true', carouselColumnsDesktopLarge: '3', reviewDisplayDate: 'false',
      ratingColor: '#ff0000', reviewCornerRadius: '16', writeReviewButtonColor: '#123456', badgeFloatingPosition: 'top-right', widgetMaxWidth: '900',
    });
    expect(s.layout).toBe('grid');
    expect(s.carouselAutoplay).toBe(true);
    expect(s.sliderAutoplay).toBe(true);
    expect(s.carouselColumnsDesktopLarge).toBe(3);
    expect(s.reviewDisplayDate).toBe(false);
    expect(s.theme.themeSettings.ratingColor).toBe('#ff0000');
    expect(s.theme.themeSettings.reviewCornerRadius).toBe(16);
    expect(s.theme.themeSettings.writeReviewButton?.color).toBe('#123456');
    expect(s.badgeFloatingPosition.position).toBe('top-right');
    expect(s.widgetWidth).toEqual({ auto: false, customValue: 900 });
  });

  it('accepts real booleans/numbers from Duda, odd casing and units', () => {
    const s = readSettings({
      layout: 'slider', carouselAutoplay: true, reviewCornerRadius: 12, headerElements: 'Title, Rating',
      widgetMaxWidth: '1200px', ratingColor: 'red) , url(//x)',
    });
    expect(s.sliderAutoplay).toBe(true);
    expect(s.theme.themeSettings.reviewCornerRadius).toBe(12);
    expect(s.headerElements).toEqual(['title', 'rating']);
    expect(s.widgetWidth.customValue).toBe(1200);
    expect(s.theme.themeSettings.ratingColor).toBe(DEFAULTS.theme.themeSettings.ratingColor);
  });

  it('a bad max width or header list keeps the defaults', () => {
    const s = readSettings({ widgetMaxWidth: 'wide', headerElements: 'nonsense' });
    expect(s.widgetWidth).toEqual(DEFAULTS.widgetWidth);
    expect(s.headerElements).toEqual(DEFAULTS.headerElements);
  });
});

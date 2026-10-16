// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { badge, header, reviewCard, schemaJsonLd } from './render';
import { readSettings } from './settings';
import { render, columnsFor, pageSize, themeVars, styleAttr } from './index';
import type { Business, Review, ReviewData } from './data';
import { dotWindow, carouselColumns } from './carousel';
import { relativeTime, formatName, safeUrl } from './format';

const business: Business = { name: 'Acme', rating: 4.8, reviewCount: 129, reviewsUrl: 'https://maps/x', writeReviewUrl: 'https://search.google.com/local/writereview?placeid=ChIJ' };
const r = (id: string, over: Partial<Review> = {}): Review => ({
  id, authorName: 'Ann Smith', authorPhoto: '', authorUrl: '', rating: 5, text: `Review ${id}`,
  publishedAt: 1_700_000_000 + Number(id), relativeTime: '', url: 'https://maps/r', images: [], reply: null, ...over,
});
const data = (n: number): ReviewData => ({ business, reviews: Array.from({ length: n }, (_, i) => r(String(i + 1))) });

beforeEach(() => {
  vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => { cb(0); return 0; });
});

describe('reviewCard', () => {
  const s = readSettings({});

  it('escapes review text and author names', () => {
    const html = reviewCard(r('1', { text: '<img src=x onerror=alert(1)>', authorName: '<b>x</b>' }), { s, business });
    expect(html).not.toContain('<img src=x');
    expect(html).toContain('&lt;img src=x');
    expect(html).not.toContain('<b>x</b>');
  });

  it('drops non-http photo URLs', () => {
    expect(reviewCard(r('1', { authorPhoto: 'javascript:alert(1)' }), { s, business })).not.toContain('javascript:');
  });

  it('renders each card style with the Elfsight es-* hooks', () => {
    for (const reviewLayout of ['classic', 'balloon', 'spotlight'] as const) {
      const html = reviewCard(r('1'), { s: { ...s, reviewLayout }, business });
      expect(html).toContain(`es-review-layout-${reviewLayout}`);
      expect(html).toContain('es-review-background-container');
      expect(html).toContain('es-text-shortener');
    }
    expect(reviewCard(r('1'), { s: { ...s, reviewLayout: 'balloon' }, business })).toContain('es-review-balloon');
  });

  it('shows the owner reply in the popup only, as Elfsight does', () => {
    const withReply = r('1', { reply: { text: 'Thanks!', publishedAt: null } });
    const html = reviewCard(withReply, { s, business, inPopup: true });
    expect(html).toContain('Owner reply');
    expect(html).toContain('Thanks!');
    expect(reviewCard(withReply, { s, business })).not.toContain('Thanks!');
  });

  it('clamps short text to the configured line count, never in full mode', () => {
    const ss = { ...s, reviewPreviewLinesNumber: 5 };
    expect(reviewCard(r('1'), { s: ss, business })).toContain('-webkit-line-clamp:5');
    expect(reviewCard(r('1'), { s: ss, business, full: true })).not.toContain('line-clamp');
  });
});

describe('header', () => {
  const s = readSettings({});
  it('is hidden when showOverallRating is off', () => {
    expect(header({ s: { ...s, showOverallRating: false }, business })).toBe('');
  });
  it('renders rating, count and the write-review link', () => {
    const html = header({ s, business });
    expect(html).toContain('4.8');
    expect(html).toContain('(129)');
    expect(html).toContain('writereview?placeid=ChIJ');
  });
  it('header2 says "Excellent on Google" for a 4.8', () => {
    expect(header({ s: { ...s, headerLayout: 'header2' }, business })).toContain('Excellent on Google');
  });
  it('header9 shows the reviews total line', () => {
    expect(header({ s: { ...s, headerLayout: 'header9' }, business })).toContain('129 reviews');
  });
});

describe('badge', () => {
  it('floats in the configured corner', () => {
    const s = readSettings({});
    const html = badge({ s: { ...s, badgeDisplayMode: 'singleFloating', badgeFloatingPosition: { position: 'bottom-right', horizontalOffset: 20, verticalOffset: 30 } }, business });
    expect(html).toContain('es-badge-floating');
    expect(html).toContain('bottom:30px;right:20px');
    expect(html).toContain('Google Rating');
  });
});

describe('schemaJsonLd', () => {
  it('emits AggregateRating and cannot be broken out of with </script>', () => {
    const out = schemaJsonLd(business, [r('1', { text: '</script><script>alert(1)</script>' })]);
    expect(out).toContain('"AggregateRating"');
    expect(out.match(/<\/script>/g)).toHaveLength(1);
  });
});

describe('render', () => {
  it('builds a carousel with one slide per review and the swiper hooks', () => {
    const root = document.createElement('div');
    render(root, readSettings({}), data(6));
    expect(root.querySelectorAll('.swiper-slide .es-carousel-layout-item')).toHaveLength(6);
  });

  it('pages a list and loads more on click', () => {
    const root = document.createElement('div');
    render(root, { ...readSettings({}), layout: 'list', listItemsPerPage: 4, listItemsPerPageOnMobile: 4 }, data(10));
    expect(root.querySelectorAll('.es-review-container')).toHaveLength(4);
    root.querySelector<HTMLButtonElement>('.es-load-more-button')!.click();
    expect(root.querySelectorAll('.es-review-container')).toHaveLength(8);
    root.querySelector<HTMLButtonElement>('.es-load-more-button')!.click();
    expect(root.querySelectorAll('.es-review-container')).toHaveLength(10);
    expect(root.querySelector('.es-load-more-button')).toBeNull();
  });

  it('opens the full review list from the badge and closes on Escape', () => {
    const root = document.createElement('div');
    document.body.appendChild(root);
    render(root, { ...readSettings({}), layout: 'cardBadge' }, data(3));
    root.querySelector<HTMLElement>('[data-action="badge-click"]')!.click();
    expect(document.querySelectorAll('.es-popup-root .es-review-container')).toHaveLength(3);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(document.querySelector('.es-popup-root')).toBeNull();
  });

  it('injects the site custom CSS as text, so it can never close the style tag', () => {
    const root = document.createElement('div');
    render(root, { ...readSettings({}), customCSS: '.a{color:red}</sty</stylele><img src=x onerror=alert(1)>' }, data(1));
    expect(root.querySelector('style')!.textContent).toContain('.a{color:red}');
    expect(root.querySelector('img[onerror]')).toBeNull();
  });

  it('re-rendering the same root binds handlers once (Duda editor re-runs)', () => {
    const root = document.createElement('div');
    document.body.appendChild(root);
    const s = { ...readSettings({}), layout: 'cardBadge' as const };
    render(root, s, data(2));
    render(root, s, data(2));
    root.querySelector<HTMLElement>('[data-action="badge-click"]')!.click();
    expect(document.querySelectorAll('.es-popup-root')).toHaveLength(1);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(document.body.style.overflow).toBe('');
  });

  it('never opens a non-http reviews link', () => {
    const open = vi.spyOn(window, 'open').mockImplementation(() => null);
    const root = document.createElement('div');
    render(root, { ...readSettings({}), layout: 'cardBadge', badgeClickAction: 'openLink' }, { ...data(1), business: { ...business, reviewsUrl: 'javascript:alert(1)' } });
    root.querySelector<HTMLElement>('[data-action="badge-click"]')!.click();
    expect(open).not.toHaveBeenCalled();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
  });
});

describe('layout maths', () => {
  const s = readSettings({});
  it('custom carousel columns follow the breakpoints', () => {
    const c = { ...s, carouselColumnsMode: 'custom' as const, carouselColumnsDesktopLarge: 4, carouselColumnsDesktopMedium: 4, carouselColumnsDesktopSmall: 3, carouselColumnsTablet: 2, carouselColumnsMobile: 1 };
    expect([375, 700, 900, 1100, 1400].map((w) => carouselColumns(c, w))).toEqual([1, 2, 3, 4, 4]);
    expect(carouselColumns({ ...c, layout: 'slider' }, 1400)).toBe(1);
  });
  it('grid page size is columns × rows', () => {
    expect(pageSize({ ...s, layout: 'grid', gridColumnsMode: 'custom', gridColumnsDesktopLarge: 3, gridRows: 2 }, 1200)).toBe(6);
    expect(columnsFor({ ...s, layout: 'list' }, 1200)).toBe(1);
  });
  it('dots cap at five and centre on the active one', () => {
    expect(dotWindow(10, 5).map((d) => d.index)).toEqual([3, 4, 5, 6, 7]);
    expect(dotWindow(10, 0).map((d) => d.size)).toEqual(['main', 'near', 'far', 'far', 'far']);
    expect(dotWindow(1, 0)).toEqual([]);
  });
});

describe('format', () => {
  it('relative time reads like Google', () => {
    const now = 1_800_000_000_000;
    expect(relativeTime(now / 1000 - 7 * 86400, '', now)).toBe('7 days ago');
    expect(relativeTime(now / 1000 - 40 * 86400, '', now)).toBe('1 month ago');
    expect(relativeTime(null, '3 weeks ago', now)).toBe('3 weeks ago');
  });
  it('name formats', () => {
    expect(formatName('Taylor Danielle Jones', 'firstNameLastInitial')).toBe('Taylor J.');
    expect(formatName('', 'fullName')).toBe('Customer');
  });
  it('safeUrl only passes http(s)', () => {
    expect(safeUrl('javascript:alert(1)')).toBe('');
    expect(safeUrl('https://a.b/c?d=1&e=2')).toBe('https://a.b/c?d=1&amp;e=2');
  });
  it('theme vars cannot inject extra declarations', () => {
    const s = readSettings({ settingsJson: '{"theme":{"themeSettings":{"ratingColor":"red;}body{display:none"}}}' });
    expect(styleAttr(themeVars(s.theme.themeSettings, s))).not.toMatch(/[{}]/);
  });
});

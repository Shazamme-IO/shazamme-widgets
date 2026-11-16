// @vitest-environment jsdom
// flip-cards runs the built bundle against the markup Duda renders from content.hbs. It must build
// escaped cards, guard links, flip on tap and keyboard, swap aria-hidden, and set per-breakpoint CSS variables.

import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it, expect, beforeEach } from 'vitest';

const here = dirname(fileURLToPath(import.meta.url));
const VERSION = JSON.parse(readFileSync(join(here, '..', '..', 'package.json'), 'utf8')).version as string;
const BUNDLE = readFileSync(join(here, '..', '..', 'dist', 'flip-cards', VERSION, 'widget.min.js'), 'utf8');

type Win = Record<string, any>;
type Card = Record<string, string>;

const SHELL = '<div class="shm-flip-cards" data-shm-flip-cards><div class="shm-fc-grid" data-shm-fc-grid></div><div class="shm-fc-sources"></div></div>';
const ONE: Card[] = [
  { image: 'https://example.com/a.jpg', alt: 'A photo', title: 'Accounting', frontLine: 'Finance', backHeading: 'Hire finance', backText: 'Back text', link: '/finance', buttonText: 'Find out more' },
];

function run(element: HTMLElement, config: Record<string, unknown>, inEditor = false) {
  (window as unknown as Win).ShazammeWidget['flip-cards']({ element, data: { config, inEditor }, $: undefined, shazamme: undefined });
}
function mount(cards: Card[] | undefined, config: Record<string, unknown> = {}, inEditor = false, html = SHELL) {
  const win = window as unknown as Win;
  win.document.body.innerHTML = `<div id="widget">${html}</div>`;
  delete win.ShazammeWidget;
  win.eval(BUNDLE);
  const element = win.document.getElementById('widget')!;
  run(element, { ...(cards ? { cards } : {}), ...config }, inEditor);
  return element;
}
const cardsOf = (el: Element) => [...el.querySelectorAll('.shm-fc-card')] as HTMLElement[];
const flipped = (c: Element) => c.classList.contains('is-flipped');
const click = (t: Element) => t.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
const key = (t: Element, k: string) => t.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true }));
function pointer(t: Element, type: string, pointerType: string, extra: Record<string, unknown> = {}) {
  const e = new Event(type, { bubbles: true, cancelable: true });
  Object.assign(e, { pointerType }, extra);
  t.dispatchEvent(e);
}

describe('flip-cards bundle', () => {
  beforeEach(() => { document.body.innerHTML = ''; });

  it('renders a card per item with front and back content', () => {
    const el = mount([...ONE, { title: 'Legal', backText: 'More' }]);
    const cards = cardsOf(el);
    expect(cards).toHaveLength(2);
    expect(cards[0].querySelector('.shm-fc-title')!.textContent).toBe('Accounting');
    expect(cards[0].querySelector('.shm-fc-line')!.textContent).toBe('Finance');
    expect(cards[0].querySelector('img')!.getAttribute('alt')).toBe('A photo');
    expect(cards[0].querySelector('.shm-fc-back-heading')!.textContent).toBe('Hire finance');
    expect(cards[0].querySelector('.shm-fc-button')!.textContent).toBe('Find out more');
    expect(el.querySelector('.shm-flip-cards')!.classList.contains('is-ready')).toBe(true);
  });

  it('reads cards from the rendered source markup when the setting is not an array', () => {
    const src = '<div class="shm-fc-src"><span data-f="title">From HTML</span><span data-f="backText">Body</span><span data-f="link">/x</span></div>';
    const html = SHELL.replace('<div class="shm-fc-sources"></div>', `<div class="shm-fc-sources">${src}</div>`);
    const el = mount(undefined, {}, false, html);
    expect(cardsOf(el)[0].querySelector('.shm-fc-title')!.textContent).toBe('From HTML');
  });

  it('escapes user text instead of rendering it as HTML', () => {
    const el = mount([{ title: '<img src=x onerror=alert(1)>', backText: '<b>x</b>', alt: '"><script>', image: 'https://e.com/a.jpg' }]);
    expect(el.querySelector('.shm-fc-title img')).toBeNull();
    expect(el.querySelector('.shm-fc-back-text b')).toBeNull();
    expect(el.querySelector('script')).toBeNull();
    expect(el.querySelector('.shm-fc-title')!.textContent).toBe('<img src=x onerror=alert(1)>');
    expect(el.querySelector('.shm-fc-img')!.getAttribute('alt')).toBe('"><script>');
  });

  it('keeps http(s), relative and # links and drops everything else', () => {
    const hrefs = ['https://a.com/x', 'http://a.com', '/page', 'page.html', '#top'];
    const bad = ['javascript:alert(1)', ' JaVaScRiPt:alert(1)', '//evil.example', '/\\evil.example', 'data:text/html,x', 'vbscript:x'];
    const el = mount([...hrefs, ...bad].map((link, i) => ({ title: `T${i}`, backText: 'b', link })));
    const out = cardsOf(el).map((c) => c.querySelector('a.shm-fc-link')?.getAttribute('href') ?? null);
    expect(out).toEqual([...hrefs, ...bad.map(() => null)]);
  });

  it('drops an unsafe image address', () => {
    const el = mount([{ title: 'T', image: 'javascript:alert(1)' }]);
    expect(el.querySelector('.shm-fc-img')).toBeNull();
  });

  it('first tap flips, second tap on the flipped card follows the link', () => {
    const el = mount(ONE);
    const card = cardsOf(el)[0];
    const link = card.querySelector('a.shm-fc-link') as HTMLAnchorElement;
    let followed = 0;
    link.addEventListener('click', (e) => { followed += 1; e.preventDefault(); });
    pointer(card, 'pointerdown', 'touch');
    click(card.querySelector('.shm-fc-front')!);
    expect(flipped(card)).toBe(true);
    expect(followed).toBe(0);
    pointer(card, 'pointerdown', 'touch');
    click(card.querySelector('.shm-fc-back-body')!);
    expect(followed).toBe(1);
    expect(flipped(card)).toBe(true);
  });

  it('a second tap on a flipped card with no link flips it back', () => {
    const el = mount([{ title: 'T', backText: 'b' }]);
    const card = cardsOf(el)[0];
    pointer(card, 'pointerdown', 'touch');
    click(card);
    expect(flipped(card)).toBe(true);
    pointer(card, 'pointerdown', 'touch');
    click(card);
    expect(flipped(card)).toBe(false);
  });

  it('a tap on the link of an unflipped card flips instead of navigating', () => {
    const el = mount(ONE);
    const card = cardsOf(el)[0];
    const link = card.querySelector('a.shm-fc-link')!;
    const ev = new MouseEvent('click', { bubbles: true, cancelable: true });
    link.dispatchEvent(ev);
    expect(ev.defaultPrevented).toBe(true);
    expect(flipped(card)).toBe(true);
  });

  it('flipping one card closes the others, and a tap outside closes all', () => {
    const el = mount([{ title: 'A', backText: 'a' }, { title: 'B', backText: 'b' }]);
    const [a, b] = cardsOf(el);
    pointer(a, 'pointerdown', 'touch'); click(a);
    pointer(b, 'pointerdown', 'touch'); click(b);
    expect(flipped(a)).toBe(false);
    expect(flipped(b)).toBe(true);
    pointer(document.body, 'pointerdown', 'touch');
    expect(flipped(b)).toBe(false);
  });

  it('keyboard: cards are focusable, focus flips, Escape flips back, Enter follows the link', () => {
    const el = mount(ONE);
    const card = cardsOf(el)[0];
    expect(card.getAttribute('tabindex')).toBe('0');
    card.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
    expect(flipped(card)).toBe(true);
    let followed = 0;
    card.querySelector('a.shm-fc-link')!.addEventListener('click', (e) => { followed += 1; e.preventDefault(); });
    key(card, 'Enter');
    expect(followed).toBe(1);
    key(card, 'Escape');
    expect(flipped(card)).toBe(false);
    key(card, 'Enter');
    expect(flipped(card)).toBe(true);
    expect(followed).toBe(1);
  });

  it('keyboard: Enter flips a card that has no link and Space toggles', () => {
    const el = mount([{ title: 'T', backText: 'b' }]);
    const card = cardsOf(el)[0];
    key(card, 'Enter');
    expect(flipped(card)).toBe(true);
    key(card, ' ');
    expect(flipped(card)).toBe(false);
  });

  it('a focus that comes from a pointer press does not flip by itself', () => {
    const el = mount(ONE);
    const card = cardsOf(el)[0];
    pointer(card, 'pointerdown', 'touch');
    card.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
    expect(flipped(card)).toBe(false);
  });

  it('mouse hover flips and leaving flips back', () => {
    const el = mount(ONE);
    const card = cardsOf(el)[0];
    pointer(card, 'pointerover', 'mouse');
    expect(flipped(card)).toBe(true);
    pointer(card, 'pointerout', 'mouse', { relatedTarget: document.body });
    expect(flipped(card)).toBe(false);
    pointer(card, 'pointerover', 'touch');
    expect(flipped(card)).toBe(false);
  });

  it('swaps aria-hidden so each side is exposed once', () => {
    const el = mount(ONE);
    const card = cardsOf(el)[0];
    const front = card.querySelector('.shm-fc-front')!;
    const back = card.querySelector('.shm-fc-back')!;
    expect([front.getAttribute('aria-hidden'), back.getAttribute('aria-hidden')]).toEqual(['false', 'true']);
    key(card, 'Enter');
    key(card, 'Escape');
    key(card, 'Enter');
    expect([front.getAttribute('aria-hidden'), back.getAttribute('aria-hidden')]).toEqual(['true', 'false']);
    expect(card.hasAttribute('inert')).toBe(false);
    expect(card.querySelector('[inert]')).toBeNull();
    key(card, 'Escape');
    expect([front.getAttribute('aria-hidden'), back.getAttribute('aria-hidden')]).toEqual(['false', 'true']);
  });

  it('shows an editor-only message when there are no cards, and nothing on the live site', () => {
    const editor = mount([], {}, true);
    expect(editor.querySelector('.shm-fc-empty')).not.toBeNull();
    const live = mount([], {}, false);
    expect(live.querySelector('.shm-fc-empty')).toBeNull();
    expect(live.querySelectorAll('.shm-fc-card')).toHaveLength(0);
  });

  it('does not stack listeners when the editor re-runs it', () => {
    const el = mount([{ title: 'T', backText: 'b' }]);
    run(el, { cards: [{ title: 'T', backText: 'b' }] }, true);
    run(el, { cards: [{ title: 'T', backText: 'b' }] }, true);
    const card = cardsOf(el)[0];
    pointer(card, 'pointerdown', 'touch');
    click(card);
    expect(flipped(card)).toBe(true);
    expect(cardsOf(el)).toHaveLength(1);
  });

  it('keeps two copies on one page independent', () => {
    const win = window as unknown as Win;
    win.document.body.innerHTML = `<div id="a">${SHELL}</div><div id="b">${SHELL}</div>`;
    delete win.ShazammeWidget;
    win.eval(BUNDLE);
    const a = win.document.getElementById('a')!;
    const b = win.document.getElementById('b')!;
    run(a, { cards: [{ title: 'A', backText: 'a' }], columnsDesktop: '2' });
    run(b, { cards: [{ title: 'B1', backText: 'b' }, { title: 'B2', backText: 'b' }], columnsDesktop: '4' });
    pointer(cardsOf(a)[0], 'pointerdown', 'touch');
    click(cardsOf(a)[0]);
    expect(flipped(cardsOf(a)[0])).toBe(true);
    expect(cardsOf(b).some(flipped)).toBe(false);
    expect(cardsOf(b)).toHaveLength(2);
    expect((a.querySelector('.shm-flip-cards') as HTMLElement).style.getPropertyValue('--shm-fc-cols-d')).toBe('2');
    expect((b.querySelector('.shm-flip-cards') as HTMLElement).style.getPropertyValue('--shm-fc-cols-d')).toBe('4');
  });

  it('sets columns, gap and the three height modes per breakpoint as CSS variables', () => {
    const el = mount(ONE, {
      columnsDesktop: '4', columnsTablet: '3', columnsMobile: '2',
      gapDesktop: '30', gapTablet: '18', gapMobile: '8',
      heightModeDesktop: 'fixed', heightDesktop: '400',
      heightModeTablet: 'min', heightTablet: '300',
      heightModeMobile: 'aspect', aspectMobile: '16:9',
    });
    const r = el.querySelector('.shm-flip-cards') as HTMLElement;
    const v = (n: string) => r.style.getPropertyValue(n);
    expect([v('--shm-fc-cols-d'), v('--shm-fc-cols-t'), v('--shm-fc-cols-m')]).toEqual(['4', '3', '2']);
    expect([v('--shm-fc-gap-d'), v('--shm-fc-gap-t'), v('--shm-fc-gap-m')]).toEqual(['30px', '18px', '8px']);
    expect([v('--shm-fc-h-d'), v('--shm-fc-minh-d'), v('--shm-fc-ar-d')]).toEqual(['400px', '0px', 'auto']);
    expect([v('--shm-fc-h-t'), v('--shm-fc-minh-t'), v('--shm-fc-ar-t')]).toEqual(['auto', '300px', 'auto']);
    expect([v('--shm-fc-h-m'), v('--shm-fc-minh-m'), v('--shm-fc-ar-m')]).toEqual(['auto', '0px', '16 / 9']);
  });

  it('falls back to defaults for junk settings and clamps numbers', () => {
    const el = mount(ONE, { columnsDesktop: 'x', gapDesktop: '9999', heightModeDesktop: 'huge', aspectDesktop: '7:7', flipSpeed: '-5' });
    const r = el.querySelector('.shm-flip-cards') as HTMLElement;
    expect(r.style.getPropertyValue('--shm-fc-cols-d')).toBe('3');
    expect(r.style.getPropertyValue('--shm-fc-gap-d')).toBe('120px');
    expect(r.style.getPropertyValue('--shm-fc-ar-d')).toBe('4 / 5');
    expect(r.style.getPropertyValue('--shm-fc-speed')).toBe('0ms');
  });

  it('fill column keeps a fixed height as a floor and turns on the fill class', () => {
    const el = mount(ONE, { fillColumn: 'true', heightModeDesktop: 'fixed', heightDesktop: '350' });
    const r = el.querySelector('.shm-flip-cards') as HTMLElement;
    expect(r.classList.contains('is-fill')).toBe(true);
    expect(r.style.getPropertyValue('--shm-fc-h-d')).toBe('auto');
    expect(r.style.getPropertyValue('--shm-fc-minh-d')).toBe('350px');
  });

  it('sets per-corner radius, direction, speed and the fade and no-flip modes', () => {
    const el = mount(ONE, { radiusTopLeft: '40', radiusTopRight: '0', radiusBottomRight: '40', radiusBottomLeft: '0', flipDirection: 'vertical', flipSpeed: '900' });
    const r = el.querySelector('.shm-flip-cards') as HTMLElement;
    expect(r.style.getPropertyValue('--shm-fc-radius')).toBe('40px 0px 40px 0px');
    expect(r.classList.contains('is-vertical')).toBe(true);
    expect(r.style.getPropertyValue('--shm-fc-speed')).toBe('900ms');
    expect(mount(ONE, { flipStyle: 'fade' }).querySelector('.shm-flip-cards')!.classList.contains('is-fade')).toBe(true);

    const none = mount(ONE, { flipStyle: 'none' });
    expect(none.querySelector('.shm-fc-back')).toBeNull();
    expect(none.querySelector('.shm-fc-card')!.hasAttribute('tabindex')).toBe(false);
    expect(none.querySelector('.shm-fc-front a.shm-fc-link')!.getAttribute('href')).toBe('/finance');
  });

  it('uses the chosen heading level and opens links in a new tab only when asked', () => {
    const el = mount(ONE, { headingTag: 'h4', openInNewTab: 'true' });
    expect(el.querySelector('h4.shm-fc-title')).not.toBeNull();
    expect(el.querySelector('h4.shm-fc-back-heading')).not.toBeNull();
    const a = el.querySelector('a.shm-fc-link')!;
    expect(a.getAttribute('target')).toBe('_blank');
    expect(a.getAttribute('rel')).toBe('noopener noreferrer');
    expect(mount(ONE).querySelector('a.shm-fc-link')!.hasAttribute('target')).toBe(false);
  });

  it('crossfades when the visitor prefers reduced motion', () => {
    const win = window as unknown as Win;
    win.matchMedia = () => ({ matches: true, addEventListener() {}, removeEventListener() {} });
    try {
      expect(mount(ONE).querySelector('.shm-flip-cards')!.classList.contains('is-fade')).toBe(true);
    } finally {
      delete win.matchMedia;
    }
  });
});

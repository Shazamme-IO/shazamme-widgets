// @vitest-environment jsdom
// The dots are drawn by a style element the widget appends at run time. Text-matching the
// CSS proves it is present, not that it reaches the page once and only once, or that every
// dot layout Duda can pick gets a shape. This runs the real ensureDotsStyle in a DOM.

import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it, expect, beforeEach } from 'vitest';

const here = dirname(fileURLToPath(import.meta.url));
const src = readFileSync(join(here, 'legacy.js'), 'utf8');

// Runs the widget's own DOTS_STYLE constants and ensureDotsStyle against `document`.
function install(): { css: string; id: string } {
  const start = src.indexOf('var DOTS_STYLE_ID =');
  const fn = src.indexOf('function ensureDotsStyle()', start);
  expect(start, 'DOTS_STYLE_ID not found').toBeGreaterThan(-1);
  expect(fn, 'ensureDotsStyle not found').toBeGreaterThan(start);
  // Walk the braces to the end of ensureDotsStyle, so a nested block cannot cut the slice short.
  let depth = 0;
  let end = fn;
  for (let i = src.indexOf('{', fn); i < src.length; i++) {
    if (src[i] === '{') depth++;
    else if (src[i] === '}' && --depth === 0) { end = i + 1; break; }
  }
  const body = src.slice(start, end);
  const run = new Function('document', `${body}\nensureDotsStyle();\nreturn { css: DOTS_STYLE, id: DOTS_STYLE_ID };`) as (d: Document) => { css: string; id: string };
  return run(document);
}

describe('testimonials ensureDotsStyle', () => {
  beforeEach(() => { document.head.innerHTML = '<link rel="stylesheet" href="widget.css">'; });

  it('appends one style element to the end of head, and only once', () => {
    const { id } = install();
    install();
    const styles = document.querySelectorAll('style');
    expect(styles).toHaveLength(1);
    expect(styles[0].id).toBe(id);
    expect(document.head.lastElementChild).toBe(styles[0]);
  });

  it('replaces the glyph with an empty box for every dot layout the widget can pick', () => {
    const { css } = install();
    expect(css).toContain('ul.shm-dots-shaped li button::before{content:""!important');
    expect(css).toContain('ul.shm-dots-shaped.slideTwo-dotsl2 li button::before{border-radius:50%');
    expect(css).toContain('ul.shm-dots-shaped.slideTwo-dots li button::before{padding:.06em .4em');
    expect(css).toContain('width:0!important;height:0!important;padding:.2em!important');
    expect(css).toContain('background-clip:content-box!important');
    expect(css).toContain('li button{position:relative!important');
    expect(css).not.toContain('display:inline-block!important');
    expect(css.match(/\.shmTestimonial ul/g)!.length).toBe(css.match(/\.shmTestimonial ul\.shm-dots-shaped/g)!.length);
    expect(css).toContain('text-indent:-9999px!important');
    expect(css).not.toContain('overflow:hidden');
    expect(css).toContain('background-color:transparent!important;background-image:none!important;background-clip:content-box!important');
    expect(css).toContain('li.slick-active button::before{box-shadow:inset 0 0 0 1em currentColor');
    expect(document.querySelector('style')!.textContent).toBe(css);
  });

  it('draws in currentColor and em so the Design tab colour and font-size still apply', () => {
    const { css } = install();
    expect(css).toContain('border:2px solid currentColor');
    expect(css).not.toMatch(/#[0-9a-f]{3,6}\b/i);
    expect(css).not.toMatch(/font-size|rgb/);
  });

  function shapeDotsRunner() {
    const start = src.indexOf('var DOTS_SHAPED_CLASS =');
    const end = src.indexOf('\n}\n', src.indexOf('function shapeDots()', start)) + 3;
    expect(start).toBeGreaterThan(-1);
    return new Function('element', 'getComputedStyle', `${src.slice(start, end)}\nshapeDots();`) as (e: Element, g: unknown) => void;
  }

  type Style = { content?: string; fontSize?: string; display?: string; visibility?: string; opacity?: string; color?: string };
  const VISIBLE: Style = { display: 'block', visibility: 'visible', opacity: '1' };

  // One list per case; `styles` gives the ul, button and ::before computed styles the stub returns.
  function run(cases: Record<string, { ul?: Style; btn?: Style; before: Style }>) {
    document.body.innerHTML = `<div id="w"><div class="shmTestimonial">${Object.keys(cases).map((k) => `<ul class="slideTwo-dotsl2" data-case="${k}"><li><button>1</button></li></ul>`).join('')}</div></div>`;
    const fake = (el: Element, pseudo?: string): Style => {
      const c = cases[el.closest('ul')!.getAttribute('data-case')!];
      if (pseudo === '::before') return { ...VISIBLE, fontSize: '20px', color: 'rgb(51, 51, 51)', ...c.before };
      return { ...VISIBLE, ...(el.tagName === 'UL' ? c.ul : c.btn) };
    };
    shapeDotsRunner()(document.getElementById('w')!, fake);
    return Object.fromEntries(Object.keys(cases).map((k) => [k, document.querySelector(`[data-case="${k}"]`)!.classList.contains('shm-dots-shaped')]));
  }

  it('shapes a list for each of the five glyphs the CSS tab draws', () => {
    expect(run({ dash: { before: { content: '"—"' } }, circle: { before: { content: '"○"' } }, disc: { before: { content: '"●"' } }, square: { before: { content: '"□"' } }, block: { before: { content: '"■"' } } }))
      .toEqual({ dash: true, circle: true, disc: true, square: true, block: true });
  });

  it('leaves alone a list whose dots are hidden or drawn by the site', () => {
    expect(run({
      fontSizeZero: { before: { content: '"●"', fontSize: '0px' } },
      custom: { before: { content: '""' } },
      noContent: { before: { content: 'none' } },
      ulNone: { ul: { display: 'none' }, before: { content: '"●"' } },
      btnNone: { btn: { display: 'none' }, before: { content: '"●"' } },
      btnInvisible: { btn: { visibility: 'hidden' }, before: { content: '"●"' } },
      btnTransparent: { btn: { opacity: '0' }, before: { content: '"●"' } },
      beforeInvisible: { before: { content: '"●"', visibility: 'hidden' } },
      beforeTransparent: { before: { content: '"●"', opacity: '0' } },
      beforeClearColor: { before: { content: '"●"', color: 'rgba(0, 0, 0, 0)' } },
      beforeTransparentKeyword: { before: { content: '"●"', color: 'transparent' } },
      beforeSlashAlphaZero: { before: { content: '"●"', color: 'rgb(0 0 0 / 0)' } },
    })).toEqual({ fontSizeZero: false, custom: false, noContent: false, ulNone: false, btnNone: false, btnInvisible: false, btnTransparent: false, beforeInvisible: false, beforeTransparent: false, beforeClearColor: false, beforeTransparentKeyword: false, beforeSlashAlphaZero: false });
  });

  it('still shapes a glyph drawn in a colour with any alpha above zero', () => {
    expect(run({
      rgb: { before: { content: '"●"', color: 'rgb(255, 0, 0)' } },
      rgbaHalf: { before: { content: '"●"', color: 'rgba(255, 0, 0, 0.5)' } },
      slashAlpha: { before: { content: '"●"', color: 'rgb(255 0 0 / 0.4)' } },
    })).toEqual({ rgb: true, rgbaHalf: true, slashAlpha: true });
  });

  it('finds the dots list even when another class is placed before the Slick dots class', () => {
    document.body.innerHTML = '<div id="w"><div class="shmTestimonial"><ul class="site-dots slideTwo-dotsl2" data-case="x"><li><button>1</button></li></ul></div></div>';
    const fake = (el: Element, pseudo?: string): Style => (pseudo === '::before' ? { ...VISIBLE, fontSize: '20px', color: 'rgb(0, 0, 0)', content: '"●"' } : VISIBLE);
    shapeDotsRunner()(document.getElementById('w')!, fake);
    expect(document.querySelector('[data-case="x"]')!.classList.contains('shm-dots-shaped')).toBe(true);
  });

  it('re-evaluates on every run: a list keeps its class while the glyph shows and loses it when hidden', () => {
    const cases: Record<string, { before: Style }> = { a: { before: { content: '"●"' } } };
    expect(run(cases)).toEqual({ a: true });
    const ul = document.querySelector('[data-case="a"]')!;
    const fake = (el: Element, pseudo?: string): Style => (pseudo === '::before' ? { ...VISIBLE, fontSize: '20px', color: 'rgb(0, 0, 0)', content: '"●"' } : VISIBLE);
    shapeDotsRunner()(document.getElementById('w')!, fake);
    expect(ul.classList.contains('shm-dots-shaped')).toBe(true);
    const hiddenNow = (el: Element, pseudo?: string): Style => (pseudo === '::before' ? { ...VISIBLE, fontSize: '0px', color: 'rgb(0, 0, 0)', content: '"●"' } : VISIBLE);
    shapeDotsRunner()(document.getElementById('w')!, hiddenNow);
    expect(ul.classList.contains('shm-dots-shaped')).toBe(false);
  });

  it('is bound once to reInit, runs after init and on every refit', () => {
    const slider = src.slice(src.indexOf('function slider(){'));
    expect(slider).toContain(".off('reInit.shmDots').on('reInit.shmDots', shapeDots)");
    expect(slider.indexOf('shapeDots();')).toBeGreaterThan(slider.indexOf('.slick({'));
    const refit = src.slice(src.indexOf('function refitSlider(){'), src.indexOf('\n}\n', src.indexOf('function refitSlider(){')));
    expect(refit).toContain('shapeDots();');
  });

  it('is installed before the slider is built', () => {
    const slider = src.slice(src.indexOf('function slider(){'));
    expect(slider.indexOf('ensureDotsStyle();')).toBeGreaterThan(-1);
    expect(slider.indexOf('ensureDotsStyle();')).toBeLessThan(slider.indexOf('.slick({'));
  });
});

describe('testimonials floorHeight', () => {
  function runner() {
    const start = src.indexOf('function saveInline(el, props)');
    const end = src.indexOf('\n}\n', src.indexOf('function floorHeight(slide)')) + 3;
    expect(start).toBeGreaterThan(-1);
    return new Function('slide', `${src.slice(start, end)}\nreturn floorHeight(slide);`) as (s: Element | null) => number;
  }

  // jsdom has no layout: the holder reports the site px height only while the card is display none
  // and no inline height or min-height overrides the site rule (an inline height:auto reads as the
  // card height, 0 when the card is hidden).
  function slideWith(holderPx: number) {
    document.body.innerHTML = '<div class="slick-slide"><div class="holder"><div class="shm-slide"><div class="shmTestimonial-comments">text</div></div></div></div>';
    const slide = document.querySelector('.slick-slide')!;
    const holder = slide.firstElementChild as HTMLElement;
    const card = slide.querySelector('.shmTestimonial-comments') as HTMLElement;
    holder.getBoundingClientRect = () => {
      const hidden = card.style.display === 'none';
      if (holder.style.height === 'auto') return { height: hidden ? 0 : 300 } as DOMRect;
      if (holder.style.minHeight) return { height: Math.max(parseFloat(holder.style.minHeight), hidden ? holderPx : 300) } as DOMRect;
      return { height: hidden ? holderPx : 300 } as DOMRect;
    };
    return { slide, card, holder };
  }

  it('lifts the inline height:auto and min-height this widget puts on the holder while it measures, then puts them back', () => {
    const { slide, holder } = slideWith(400);
    holder.style.setProperty('height', 'auto', 'important');
    holder.style.setProperty('min-height', '600px', 'important');
    expect(runner()(slide)).toBe(400);
    expect(holder.style.getPropertyValue('height')).toBe('auto');
    expect(holder.style.getPropertyPriority('height')).toBe('important');
    expect(holder.style.getPropertyValue('min-height')).toBe('600px');
    expect(holder.style.getPropertyPriority('min-height')).toBe('important');
  });

  it('leaves no inline height behind on a holder that had none', () => {
    const { slide, holder } = slideWith(400);
    expect(runner()(slide)).toBe(400);
    expect(holder.getAttribute('style')).toBeNull();
  });

  it('returns 0 and touches nothing when the card is the slide\'s direct child or the slide is empty', () => {
    document.body.innerHTML = '<div class="slick-slide"><div class="shmTestimonial-comments" style="height: auto !important;">text</div></div><div class="slick-slide empty"></div>';
    const direct = document.querySelector('.slick-slide')!;
    const card = direct.firstElementChild as HTMLElement;
    card.getBoundingClientRect = () => ({ height: card.style.display === 'none' ? 0 : 250 } as DOMRect);
    expect(runner()(direct)).toBe(0);
    expect(card.style.getPropertyValue('height')).toBe('auto');
    expect(card.style.getPropertyPriority('height')).toBe('important');
    expect(card.style.getPropertyValue('display')).toBe('');
    expect(runner()(document.querySelector('.slick-slide.empty')!)).toBe(0);
  });

  it('reads the holder height with the card hidden and puts the card back exactly as it was', () => {
    const { slide, card } = slideWith(490);
    card.style.setProperty('display', 'block', 'important');
    expect(runner()(slide)).toBe(490);
    expect(card.style.getPropertyValue('display')).toBe('block');
    expect(card.style.getPropertyPriority('display')).toBe('important');
  });

  it('leaves no inline display behind when the card had none', () => {
    const { slide, card } = slideWith(0);
    expect(runner()(slide)).toBe(0);
    expect(card.style.getPropertyValue('display')).toBe('');
  });

  it('returns 0 without a slide, a holder or a card', () => {
    expect(runner()(null)).toBe(0);
    document.body.innerHTML = '<div class="slick-slide"></div>';
    expect(runner()(document.querySelector('.slick-slide'))).toBe(0);
  });

  it('returns 0 for a slide with a holder but no card', () => {
    document.body.innerHTML = '<div class="slick-slide"><div class="holder"></div></div>';
    expect(runner()(document.querySelector('.slick-slide'))).toBe(0);
  });
});

describe('testimonials adaptive height', () => {
  // Runs the real floorHeight, windowCards, visibleHeight, sizeList and fitAdaptive against a fake Slick.
  function fn(name: string) {
    const start = src.indexOf(`function ${name}(`);
    expect(start, name).toBeGreaterThan(-1);
    return src.slice(start, src.indexOf('\n}\n', start) + 3);
  }
  const body = ['saveInline', 'restoreInline', 'floorHeight', 'windowCards', 'visibleHeight', 'sizeList', 'fitAdaptive'].map(fn).join('\n');
  const run = new Function('slick', 'first', 'setImportant', 'getComputedStyle', `${body}\nfitAdaptive(slick, first);`) as (slick: unknown, first: number, set: unknown, gcs: unknown) => void;

  // cards: text height per slide index; floor: holder height with the card hidden; top: where each card
  // starts below the list top (list padding plus any slide padding or card margin).
  function fakeSlick(cards: number[], floor: number, slidesToShow: number, listBox = 'border-box', top = 20) {
    document.body.innerHTML = `<div class="slick-list">${cards.map((_, i) => `<div class="slick-slide" data-slick-index="${i}"><div class="holder"><div class="shmTestimonial-comments">t</div></div></div>`).join('')}</div>`;
    const slides = Array.from(document.querySelectorAll('.slick-slide')) as HTMLElement[];
    const set: Record<string, string> = {};
    const minHeights: number[] = [];
    slides.forEach((s, i) => {
      const card = s.querySelector('.shmTestimonial-comments') as HTMLElement;
      const h = () => Math.max(cards[i], minHeights[i] || 0);
      card.getBoundingClientRect = () => ({ height: h(), top: 100 + top, bottom: 100 + top + h() } as DOMRect);
      (s.firstElementChild as HTMLElement).getBoundingClientRect = () => ({ height: card.style.display === 'none' ? floor : Math.max(h(), floor) } as DOMRect);
    });
    const list = document.querySelector('.slick-list') as HTMLElement;
    list.getBoundingClientRect = () => ({ top: 100 } as DOMRect);
    const allCards = () => ({ each: (f: (this: Element) => void) => Array.from(document.querySelectorAll('.shmTestimonial-comments')).forEach((c) => f.call(c)) });
    const slick = { options: { slidesToShow }, $list: [list], $slideTrack: { children: (sel: string) => [document.querySelector(sel)].filter(Boolean), find: allCards } };
    const setImportant = (el: Element, props: Record<string, string>) => {
      if (el.classList.contains('slick-list')) Object.assign(set, props);
      if (el.classList.contains('shmTestimonial-comments') && props['min-height']) minHeights[slides.indexOf(el.closest('.slick-slide') as HTMLElement)] = parseFloat(props['min-height']);
    };
    const gcs = () => ({ boxSizing: listBox, paddingTop: '20px', paddingBottom: '0px' });
    return { slick, set, setImportant, gcs };
  }

  it('ends the list at the card bottom when the card is taller than the floor', () => {
    const { slick, set, setImportant, gcs } = fakeSlick([359], 190, 1);
    run(slick, 0, setImportant, gcs);
    expect(set.height).toBe('379px');
  });

  it('raises the card to the floor and ends the list there when the floor is taller', () => {
    const { slick, set, setImportant, gcs } = fakeSlick([200], 490, 1);
    run(slick, 0, setImportant, gcs);
    expect(set.height).toBe('510px');
  });

  it('allows for a card that starts below the list padding', () => {
    const { slick, set, setImportant, gcs } = fakeSlick([418], 0, 1, 'border-box', 50);
    run(slick, 0, setImportant, gcs);
    expect(set.height).toBe('468px');
  });

  it('uses the lowest card of the window on a multi-column adaptive desktop, and shrinks again for a shorter window', () => {
    const { slick, set, setImportant, gcs } = fakeSlick([200, 340, 120], 0, 2);
    run(slick, 0, setImportant, gcs);
    expect(set.height).toBe('360px');
    run(slick, 1, setImportant, gcs);
    expect(set.height).toBe('360px');
    run(slick, 2, setImportant, gcs);
    expect(set.height).toBe('140px');
  });

  it('shrinks again on a single column when the next card is shorter', () => {
    const { slick, set, setImportant, gcs } = fakeSlick([400, 150], 0, 1);
    run(slick, 0, setImportant, gcs);
    expect(set.height).toBe('420px');
    run(slick, 1, setImportant, gcs);
    expect(set.height).toBe('170px');
  });

  it('counts the bottom padding of a border-box list and not of a content-box one', () => {
    const padded = () => ({ boxSizing: 'border-box', paddingTop: '20px', paddingBottom: '12px' });
    const a = fakeSlick([300], 0, 1);
    run(a.slick, 0, a.setImportant, padded);
    expect(a.set.height).toBe('332px');
    const b = fakeSlick([300], 0, 1, 'content-box');
    run(b.slick, 0, b.setImportant, () => ({ boxSizing: 'content-box', paddingTop: '20px', paddingBottom: '12px' }));
    expect(b.set.height).toBe('300px');
  });

  it('does not count the top padding twice for a content-box list', () => {
    const { slick, set, setImportant, gcs } = fakeSlick([300], 0, 1, 'content-box');
    run(slick, 0, setImportant, gcs);
    expect(set.height).toBe('300px');
  });

  it('counts the list border the same way as its padding, and treats a missing width as zero', () => {
    const a = fakeSlick([300], 0, 1);
    run(a.slick, 0, a.setImportant, () => ({ boxSizing: 'border-box', paddingTop: '20px', paddingBottom: '12px', borderBottomWidth: '2px' }));
    expect(a.set.height).toBe('334px');
    const b = fakeSlick([300], 0, 1, 'content-box');
    run(b.slick, 0, b.setImportant, () => ({ boxSizing: 'content-box', paddingTop: '20px', borderTopWidth: '3px', paddingBottom: '12px' }));
    expect(b.set.height).toBe('297px');
    const c = fakeSlick([300], 0, 1);
    run(c.slick, 0, c.setImportant, () => ({ boxSizing: 'border-box', paddingTop: '20px', paddingBottom: '12px' }));
    expect(c.set.height).toBe('332px');
  });

  it('leaves the list alone when there is no card in the window', () => {
    const { slick, set, setImportant, gcs } = fakeSlick([], 0, 1);
    run(slick, 5, setImportant, gcs);
    expect(set.height).toBeUndefined();
  });

  it('is wired to beforeChange and setPosition in adaptive mode, and the fixed mode shares the window measure', () => {
    const slider = src.slice(src.indexOf('function slider(){'));
    expect(slider).toContain('else fitAdaptive(slick, next);');
    expect(slider).toContain('fitAdaptive(slick, slick.currentSlide);');
    expect(slider).not.toContain("'.slick-current>div'");
    expect(fn('fitHeights')).toContain('visibleHeight(slick, shown)');
    expect(fn('fitHeights')).toContain('sizeList(slick, shown)');
  });
});

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

  type Style = { content?: string; fontSize?: string; display?: string; visibility?: string; opacity?: string };
  const VISIBLE: Style = { display: 'block', visibility: 'visible', opacity: '1' };

  // One list per case; `styles` gives the ul, button and ::before computed styles the stub returns.
  function run(cases: Record<string, { ul?: Style; btn?: Style; before: Style }>) {
    document.body.innerHTML = `<div id="w"><div class="shmTestimonial">${Object.keys(cases).map((k) => `<ul class="slideTwo-dotsl2" data-case="${k}"><li><button>1</button></li></ul>`).join('')}</div></div>`;
    const fake = (el: Element, pseudo?: string): Style => {
      const c = cases[el.closest('ul')!.getAttribute('data-case')!];
      if (pseudo === '::before') return { ...VISIBLE, fontSize: '20px', ...c.before };
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
    })).toEqual({ fontSizeZero: false, custom: false, noContent: false, ulNone: false, btnNone: false, btnInvisible: false, btnTransparent: false, beforeInvisible: false, beforeTransparent: false });
  });

  it('re-evaluates on every run: a list keeps its class while the glyph shows and loses it when hidden', () => {
    const cases: Record<string, { before: Style }> = { a: { before: { content: '"●"' } } };
    expect(run(cases)).toEqual({ a: true });
    const ul = document.querySelector('[data-case="a"]')!;
    const fake = (el: Element, pseudo?: string): Style => (pseudo === '::before' ? { ...VISIBLE, fontSize: '20px', content: '"●"' } : VISIBLE);
    shapeDotsRunner()(document.getElementById('w')!, fake);
    expect(ul.classList.contains('shm-dots-shaped')).toBe(true);
    const hiddenNow = (el: Element, pseudo?: string): Style => (pseudo === '::before' ? { ...VISIBLE, fontSize: '0px', content: '"●"' } : VISIBLE);
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
    const start = src.indexOf('function floorHeight(slide)');
    const end = src.indexOf('\n}\n', start) + 3;
    expect(start).toBeGreaterThan(-1);
    return new Function('slide', `${src.slice(start, end)}\nreturn floorHeight(slide);`) as (s: Element | null) => number;
  }

  // jsdom has no layout: the holder reports the site px height only while the card is display none.
  function slideWith(holderPx: number) {
    document.body.innerHTML = '<div class="slick-slide"><div class="holder"><div class="shm-slide"><div class="shmTestimonial-comments">text</div></div></div></div>';
    const slide = document.querySelector('.slick-slide')!;
    const holder = slide.firstElementChild as HTMLElement;
    const card = slide.querySelector('.shmTestimonial-comments') as HTMLElement;
    holder.getBoundingClientRect = () => ({ height: card.style.display === 'none' ? holderPx : 300 } as DOMRect);
    return { slide, card };
  }

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

  it('is the floor for both height modes', () => {
    const fit = src.slice(src.indexOf('function fitHeights(slick, first)'), src.indexOf('\n}\n', src.indexOf('function fitHeights(slick, first)')));
    expect(fit).toContain('tallest = Math.max(tallest, floorHeight(firstSlide))');
    const adaptive = src.slice(src.indexOf('function fitAdaptive(slick)'), src.indexOf('\n}\n', src.indexOf('function fitAdaptive(slick)')));
    expect(adaptive).toContain('Math.max(Math.ceil(card.getBoundingClientRect().height), floorHeight(slide))');
    const handler = src.slice(src.indexOf(".on('setPosition'"), src.indexOf('growWrapper();', src.indexOf(".on('setPosition'")));
    expect(handler).toContain('fitAdaptive(slick);');
    expect(handler).not.toContain("'.slick-current>div'");
  });
});

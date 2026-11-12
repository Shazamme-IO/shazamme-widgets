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
  const body = src.slice(start, src.indexOf('\n}\n', fn) + 3);
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
    expect(css).toContain('ul[class^="slideTwo-dots"] li button::before{content:""!important');
    expect(css).toContain('ul.slideTwo-dotsl2 li button::before{border-radius:50%');
    expect(css).toContain('ul.slideTwo-dots li button::before{padding:.06em .4em');
    expect(css).toContain('width:0!important;height:0!important;padding:.2em!important');
    expect(css).toContain('background-clip:content-box!important');
    expect(css).toContain('li.slick-active button::before{box-shadow:inset 0 0 0 1em currentColor');
    expect(document.querySelector('style')!.textContent).toBe(css);
  });

  it('draws in currentColor and em so the Design tab colour and font-size still apply', () => {
    const { css } = install();
    expect(css).toContain('border:2px solid currentColor');
    expect(css).not.toMatch(/#[0-9a-f]{3,6}\b/i);
    expect(css).not.toMatch(/font-size|rgb/);
  });

  it('is installed before the slider is built', () => {
    const slider = src.slice(src.indexOf('function slider(){'));
    expect(slider.indexOf('ensureDotsStyle();')).toBeGreaterThan(-1);
    expect(slider.indexOf('ensureDotsStyle();')).toBeLessThan(slider.indexOf('.slick({'));
  });
});

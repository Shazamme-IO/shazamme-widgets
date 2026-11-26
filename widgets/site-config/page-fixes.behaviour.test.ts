// @vitest-environment jsdom
// Runs the real PageFix helpers from legacy.js. Layout is mocked (jsdom has none): the
// fixes must act only when they measure the fault, and the sticky Apply bar must exist
// only for a page that opted in with the sz-sticky-apply class.

import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it, expect, beforeEach, vi } from 'vitest';

const here = dirname(fileURLToPath(import.meta.url));
const src = readFileSync(join(here, 'legacy.js'), 'utf8').replace(/\r\n/g, '\n');

function body(marker: string): string {
  const start = src.indexOf(marker);
  if (start < 0) throw new Error(`marker not found: ${marker}`);
  let depth = 0;
  for (let i = src.indexOf('{', start); i < src.length; i++) {
    if (src[i] === '{') depth++;
    else if (src[i] === '}' && --depth === 0) return src.slice(start, i + 1);
  }
  throw new Error(`unbalanced braces after ${marker}`);
}

const prelude = `${src.slice(src.indexOf('const PageFix = {'), src.indexOf('};', src.indexOf('const PageFix = {')) + 2)}
const centreOf = (r) => r.top + r.height / 2;`;
const make = (fn: string, ret: string) =>
  // eslint-disable-next-line no-new-func
  new Function(`${prelude}\n${body(fn)}\nreturn ${ret};`)() as (...a: any[]) => any;

const rect = (top: number, height: number) => ({ top, height, bottom: top + height, left: 0, right: 0, width: 100 }) as DOMRect;

describe('thinSalaryTracks', () => {
  const thin = make('function thinSalaryTracks(', 'thinSalaryTracks');
  const page = (height: number, barTop: number) => {
    document.body.innerHTML = '<div class="control-salary-slider"><div class="slider"><input type="range"><span class="section-color"></span><input type="range"></div></div>';
    document.querySelectorAll('input').forEach((i) => { i.getBoundingClientRect = () => rect(0, height); });
    const bar = document.querySelector('.section-color') as HTMLElement;
    bar.getBoundingClientRect = () => rect(barTop, 6);
    return { inputs: Array.from(document.querySelectorAll('input')), bar };
  };

  it('keeps the 44px input but paints only a thin strip of it', () => {
    const { inputs } = page(44, 19);
    thin();
    expect(inputs[0].style.paddingBlock).toBe('19px');
    expect(inputs[0].style.backgroundClip).toBe('content-box');
  });

  it('leaves an input that is already thin alone', () => {
    const { inputs } = page(10, 2);
    thin();
    expect(inputs[0].style.paddingBlock).toBe('');
  });

  it('centres the selected-range bar on the track when it is off', () => {
    const { bar } = page(44, 0);
    thin();
    expect(bar.style.top).toBe('19px');
  });

  it('does not move a bar that is already centred', () => {
    const { bar } = page(44, 19);
    thin();
    expect(bar.style.top).toBe('');
  });
});

describe('installStickyApply', () => {
  const sticky = make('function installStickyApply(', 'installStickyApply');
  let io: { cb: (e: { isIntersecting: boolean }[]) => void; observe: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    document.body.innerHTML = '';
    io = { cb: () => {}, observe: vi.fn() };
    (window as any).IntersectionObserver = class { constructor(cb: any) { io.cb = cb; } observe = io.observe; disconnect() {} };
    (window as any).IntersectionObserver = (window as any).IntersectionObserver;
    (globalThis as any).IntersectionObserver = (window as any).IntersectionObserver;
    window.matchMedia = ((q: string) => ({ matches: true, media: q, addEventListener() {} })) as any;
  });

  const apply = (cls: string) => {
    document.body.innerHTML = `<div class="${cls}"><div class="shLinkApplyBtn" href="/job-application?jobID=1">Apply Now</div></div>`;
    const el = document.querySelector('.shLinkApplyBtn') as HTMLElement;
    el.getClientRects = () => [rect(3000, 56)] as any;
    return el;
  };

  it('does nothing unless the page opts in', () => {
    apply('plain');
    sticky();
    expect(document.querySelector('[data-rel=sticky-apply]')).toBeNull();
  });

  it('adds a bar while the real button is off screen and hides it when visible', () => {
    apply('sz-sticky-apply');
    sticky();
    const bar = document.querySelector('[data-rel=sticky-apply]') as HTMLElement;
    expect(bar.textContent).toBe('Apply Now');
    io.cb([{ isIntersecting: false }]);
    expect(bar.style.display).toBe('block');
    io.cb([{ isIntersecting: true }]);
    expect(bar.style.display).toBe('none');
  });

  it('clicks the real button when the bar is tapped', () => {
    const el = apply('sz-sticky-apply');
    const clicked = vi.fn();
    el.addEventListener('click', clicked);
    sticky();
    (document.querySelector('[data-rel=sticky-apply] button') as HTMLElement).click();
    expect(clicked).toHaveBeenCalledTimes(1);
  });

  it('adds no bar on a wide screen', () => {
    window.matchMedia = ((q: string) => ({ matches: false, media: q, addEventListener() {} })) as any;
    apply('sz-sticky-apply');
    sticky();
    expect(document.querySelector('[data-rel=sticky-apply]')).toBeNull();
  });
});

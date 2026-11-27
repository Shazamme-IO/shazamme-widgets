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
const centreOf = (r) => r.top + r.height / 2;
const centredLabels = new WeakSet();`;
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
    bar.style.position = 'absolute';
    Object.defineProperty(bar, 'offsetParent', { value: document.querySelector('.slider') });
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
  let io: { cb: (e: { isIntersecting: boolean; target?: Element }[]) => void; observe: ReturnType<typeof vi.fn> };

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
    const el = apply('sz-sticky-apply');
    sticky();
    const bar = document.querySelector('[data-rel=sticky-apply]') as HTMLElement;
    expect(bar.textContent).toBe('Apply Now');
    io.cb([{ isIntersecting: false, target: el }]);
    expect(bar.style.display).toBe('block');
    io.cb([{ isIntersecting: true, target: el }]);
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

describe('thinSalaryTracks follows a changed input height', () => {
  const thin = make('function thinSalaryTracks(', 'thinSalaryTracks');

  it('recomputes the padding instead of keeping a stale one', () => {
    document.body.innerHTML = '<div class="control-salary-slider"><div class="slider"><input type="range"></div></div>';
    const input = document.querySelector('input') as HTMLInputElement;
    let height = 44;
    input.getBoundingClientRect = () => rect(0, height);
    thin();
    expect(input.style.paddingBlock).toBe('19px');
    height = 30;
    thin();
    expect(input.style.paddingBlock).toBe('12px');
    height = 8;
    thin();
    expect(input.style.paddingBlock).toBe('');
  });
});

describe('centreCheckboxLabels', () => {
  const centre = make('function centreCheckboxLabels(', 'centreCheckboxLabels');

  const mount = (inner: string, textTop: number, lines = 1) => {
    document.body.innerHTML = `<div class="dmCustomWidget"><label>${inner}</label></div>`;
    const label = document.querySelector('label') as HTMLElement;
    const box = label.querySelector('input') as HTMLElement;
    box.getBoundingClientRect = () => rect(0, 44);
    document.createRange = () => ({ selectNodeContents() {}, getClientRects: () => Array.from({ length: lines }, (_, i) => rect(textTop + i * 20, 19)) }) as any;
    return label;
  };

  it('centres a one-line label that sits low beside the box', () => {
    const label = mount('<input type="checkbox">I agree', 30);
    centre();
    expect(label.style.display).toBe('flex');
    expect(label.style.alignItems).toBe('center');
  });

  it('leaves a label that is already centred', () => {
    const label = mount('<input type="checkbox">I agree', 12);
    centre();
    expect(label.style.display).toBe('');
  });

  it('leaves a label with its own link, and a multi-line label', () => {
    const withLink = mount('<input type="checkbox">I agree <a href="#">terms</a>', 30);
    centre();
    expect(withLink.style.display).toBe('');
    const wrapped = mount('<input type="checkbox">I agree to a very long line', 30, 2);
    centre();
    expect(wrapped.style.display).toBe('');
  });
});

describe('installStickyApply side effects', () => {
  const sticky = make('function installStickyApply(', 'installStickyApply');
  let cb: (e: { target: Element; isIntersecting: boolean }[]) => void = () => {};

  beforeEach(() => {
    document.body.innerHTML = '';
    document.body.removeAttribute('style');
    (globalThis as any).IntersectionObserver = class { constructor(c: any) { cb = c; } observe() {} disconnect() {} };
    window.matchMedia = ((q: string) => ({ matches: true, media: q, addEventListener() {} })) as any;
  });

  const apply = () => {
    document.body.innerHTML = '<div class="sz-sticky-apply"><div class="shLinkApplyBtn" href="/x">Apply Now</div></div>';
    const el = document.querySelector('.shLinkApplyBtn') as HTMLElement;
    el.getClientRects = () => [rect(3000, 56)] as any;
    return el;
  };

  it('restores the body padding the site had when the bar hides again', () => {
    document.body.style.paddingBottom = '7px';
    const el = apply();
    sticky();
    cb([{ target: el, isIntersecting: false }]);
    expect(document.body.style.paddingBottom).toContain('calc(');
    cb([{ target: el, isIntersecting: true }]);
    expect(document.body.style.paddingBottom).toBe('7px');
  });

  it('never touches the body padding on a page without the opt-in class', () => {
    document.body.style.paddingBottom = '7px';
    document.body.innerHTML = '<div class="plain"></div>';
    sticky();
    expect(document.body.style.paddingBottom).toBe('7px');
  });

  it('stays hidden while a modal dialog is open', () => {
    const el = apply();
    sticky();
    document.body.insertAdjacentHTML('beforeend', '<div aria-modal="true"></div>');
    cb([{ target: el, isIntersecting: false }]);
    expect((document.querySelector('[data-rel=sticky-apply]') as HTMLElement).style.display).toBe('none');
  });

  it('shows the bar only while no copy of the button is on screen', () => {
    document.body.innerHTML = '<div class="sz-sticky-apply"><div class="shLinkApplyBtn" href="/x">Apply</div></div><div class="sz-sticky-apply"><div class="shLinkApplyBtn" href="/x">Apply</div></div>';
    const els = Array.from(document.querySelectorAll('.shLinkApplyBtn')) as HTMLElement[];
    els.forEach((e) => { e.getClientRects = () => [rect(10, 10)] as any; });
    sticky();
    const bar = document.querySelector('[data-rel=sticky-apply]') as HTMLElement;
    cb([{ target: els[0], isIntersecting: false }, { target: els[1], isIntersecting: true }]);
    expect(bar.style.display).toBe('none');
    cb([{ target: els[1], isIntersecting: false }]);
    expect(bar.style.display).toBe('block');
  });
});

describe('fitApplyButtons', () => {
  const fit = make('function fitApplyButtons(', 'fitApplyButtons');
  const rules = () => Array.from(document.querySelectorAll('style#shz-apply-fit-style')).map((s) => s.textContent || '');

  beforeEach(() => { document.head.innerHTML = ''; });

  it('caps the Dynamic Application button at the width of its column', () => {
    fit();
    expect(rules()).toHaveLength(1);
    expect(rules()[0]).toMatch(/div\.shLinkApplyBtn\{max-width:100%\}/);
  });

  it('sets no width, padding or important flag, so Design panel choices still apply', () => {
    fit();
    expect(rules()[0]).not.toMatch(/!important|(^|[{;])width|padding/);
  });

  it('adds the stylesheet once however often it runs', () => {
    fit();
    fit();
    expect(rules()).toHaveLength(1);
  });

  it('runs on every page, not only after a watched control appears', () => {
    const install = body('function installPageFixes() {');
    expect(install.indexOf('fitApplyButtons()')).toBeGreaterThan(-1);
    expect(install.indexOf('fitApplyButtons()')).toBeLessThan(install.indexOf('const run = '));
  });
});

describe('installPageFixes', () => {
  it('installs once per page', () => {
    expect(body('function installPageFixes() {')).toMatch(/if \(window\.__szPageFixes\) return;/);
  });
});

// @vitest-environment jsdom
// The container-fluid layout (columns from width, portrait sizing, wrapper growth) was built for
// the WOW rebuild and overrides every site's own widget CSS with inline !important. On 10 Nov 2026
// it reached every site on the shared Widget Builder widget: NGO Recruitment (13 consultants) fell
// to 2 columns and Quinn Allan's 290x360 portraits were cropped to 224px squares. It is opt-in now.
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it, expect } from 'vitest';

const here = dirname(fileURLToPath(import.meta.url));
const body = readFileSync(join(here, 'legacy.js'), 'utf8');
// Pull one top-level function out of the source by matching its braces, so an unindented
// brace inside the body cannot cut the extract short.
function fn(name: string) {
  const start = body.indexOf(`function ${name}(`);
  if (start < 0) throw new Error(`function ${name} not found`);
  let depth = 0;
  for (let i = body.indexOf('{', start); i < body.length; i++) {
    if (body[i] === '{') depth++;
    if (body[i] === '}' && --depth === 0) return body.slice(start, i + 1);
  }
  throw new Error(`function ${name} has unbalanced braces`);
}
const gate = `${body.match(/var FLUID_SITES = [^\n]+/)![0]}; ${fn('isFluidLayout')}`;

const isFluidLayout = new Function(`${gate}; return isFluidLayout;`)() as (data: unknown) => boolean;
const label = (fluid: boolean, text: unknown) => new Function('fluid', `${fn('oneLine')}; ${fn('label')}; return label;`)(fluid)(text) as string;

describe('consultant fluid layout opt-in', () => {
  it('is off for an ordinary client site with no setting', () => {
    expect(isFluidLayout({ config: {}, siteId: '472ec671' })).toBe(false);
    expect(isFluidLayout({ config: {}, siteId: '03eb4556' })).toBe(false);
  });

  it('is on when the widget setting fluidLayout is true (Duda passes strings)', () => {
    expect(isFluidLayout({ config: { fluidLayout: 'true' }, siteId: '472ec671' })).toBe(true);
    expect(isFluidLayout({ config: { fluidLayout: true }, siteId: '472ec671' })).toBe(true);
  });

  it('accepts the other spellings a checkbox setting arrives as', () => {
    expect(isFluidLayout({ config: { fluidLayout: 'True' }, siteId: '472ec671' })).toBe(true);
    expect(isFluidLayout({ config: { fluidLayout: '1' }, siteId: '472ec671' })).toBe(true);
    expect(isFluidLayout({ config: { fluidLayout: ' TRUE ' }, siteId: '472ec671' })).toBe(true);
    expect(isFluidLayout({ config: { fluidLayout: '0' }, siteId: '0682872f' })).toBe(false);
    expect(isFluidLayout({ config: { fluidLayout: '' }, siteId: '472ec671' })).toBe(false);
  });

  it('is on for the WOW sites until their widget carries the setting, and the setting can turn it off', () => {
    expect(isFluidLayout({ config: {}, siteId: '0682872f' })).toBe(true);
    expect(isFluidLayout({ config: {}, siteId: 'b40871c0' })).toBe(true);
    expect(isFluidLayout({ config: { fluidLayout: 'false' }, siteId: '0682872f' })).toBe(false);
    expect(isFluidLayout({ config: { fluidLayout: false }, siteId: '0682872f' })).toBe(false);
  });
});

describe('consultant card text', () => {
  it('keeps CMS names and titles as written, <br> included, when fluid layout is off', () => {
    expect(label(false, 'Senior Consultant<br>Technology')).toBe('Senior Consultant<br>Technology');
    expect(label(false, '  two  spaces ')).toBe('  two  spaces ');
    expect(label(false, null)).toBe('');
  });

  it('flattens them to one line when fluid layout is on', () => {
    expect(label(true, 'Senior Consultant<br>Technology')).toBe('Senior Consultant Technology');
    expect(label(true, 'General <br/> Manager')).toBe('General Manager');
  });
});

function grid(fluid: boolean, count: number, run = 'fluidGrid();') {
  document.head.innerHTML = '<link id="site-css">';
  document.body.innerHTML = `<div class="widget-wrapper" style="height:400px"><div id="w"><div class="consultList"><div class="consultList-consultantWrap">${
    Array.from({ length: count }, () => '<div class="consultList-consultant"><div class="consultList-top"></div><div class="consultList-consultImg"></div></div>').join('')
  }</div></div></div></div>`;
  const element = document.getElementById('w')!;
  const wrapEl = element.querySelector<HTMLElement>('.consultList-consultantWrap')!;
  wrapEl.getBoundingClientRect = () => ({ width: 1120 } as DOMRect);
  element.querySelectorAll<HTMLElement>('.consultList-consultant').forEach((c) => { c.getBoundingClientRect = () => ({ width: 280 } as DOMRect); });
  function jq(nodes: Element[]) {
    return {
      find: (s: string) => jq(nodes.flatMap((n) => [...n.querySelectorAll(s)])),
      children: (s: string) => jq(nodes.flatMap((n) => [...n.children].filter((c) => c.matches(s)))),
      each: (f: (this: Element) => void) => nodes.forEach((n) => f.call(n)),
      get: (i: number) => nodes[i],
      length: nodes.length,
      width: () => (nodes[0] as HTMLElement).getBoundingClientRect().width,
    };
  }
  const $ = (sel: Element | string) => jq(typeof sel === 'string' ? [...document.querySelectorAll(sel)] : [sel]);
  const src = `${fn('setImportant')}; ${fn('fluidPortraits')}; ${fn('fluidGrid')}; ${fn('growWrapper')}; ${fn('ensurePortraitStyle')};
    var PORTRAIT_STYLE_ID='shm-consultant-portrait-default', PORTRAIT_CLASS='shm-portrait', PORTRAIT_SHARE=0.8, PORTRAIT_MAX=230, GRID_MIN_CARD=240, GRID_MAX_COLUMNS=5;
    var layout='grid', itemLayout='grid'; ${run}`;
  new Function('element', '$', 'document', 'fluid', src)(element, $, document, fluid);
  const card = element.querySelector<HTMLElement>('.consultList-consultant')!;
  const img = element.querySelector<HTMLElement>('.consultList-consultImg')!;
  return { wrapStyle: wrapEl.getAttribute('style'), cardWidth: card.style.getPropertyValue('width'), imgWidth: img.style.getPropertyValue('width'), imgClass: img.className,
    defaultStyle: document.getElementById('shm-consultant-portrait-default'), wrapperHeight: document.querySelector<HTMLElement>('.widget-wrapper')!.style.height };
}

describe('consultant grid when fluid layout is off (every ordinary site)', () => {
  it('leaves the wrap, the cards, the portraits and the widget wrapper exactly as the site CSS laid them out', () => {
    const r = grid(false, 13);
    expect(r.wrapStyle).toBeNull();
    expect(r.cardWidth).toBe('');
    expect(r.imgWidth).toBe('');
    expect(r.imgClass).toBe('consultList-consultImg');
    expect(r.defaultStyle).toBeNull();
    expect(r.wrapperHeight).toBe('400px');
  });

  it('fluidPortraits() and growWrapper() are inert on their own too (the vertical layouts call them directly)', () => {
    const r = grid(false, 3, 'fluidPortraits(); growWrapper();');
    expect(r.imgWidth).toBe('');
    expect(r.imgClass).toBe('consultList-consultImg');
    expect(r.defaultStyle).toBeNull();
    expect(r.wrapperHeight).toBe('400px');
  });
});

describe('consultant grid when fluid layout is on (WOW)', () => {
  it('still lays the cards out from the container width and sizes the portraits', () => {
    const r = grid(true, 8);
    expect(r.wrapStyle).toContain('display: flex');
    expect(r.cardWidth).toBe('25%');
    expect(r.imgWidth).toBe('224px');
    expect(r.imgClass).toContain('shm-portrait');
    expect(r.defaultStyle).not.toBeNull();
    expect(r.wrapperHeight).toBe('auto');
  });
});

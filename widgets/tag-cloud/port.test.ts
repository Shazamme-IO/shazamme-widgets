// @vitest-environment jsdom
// tag-cloud was an inline Duda paste. Ported, the bundle must still turn the
// one-tag-per-line text Duda renders into escaped pills, guard the link pattern,
// and drop empty groups.

import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it, expect } from 'vitest';

const here = dirname(fileURLToPath(import.meta.url));
const VERSION = JSON.parse(readFileSync(join(here, '..', '..', 'package.json'), 'utf8')).version as string;
const BUNDLE = readFileSync(join(here, '..', '..', 'dist', 'tag-cloud', VERSION, 'widget.min.js'), 'utf8');

type Win = Record<string, any>;
type Group = { heading?: string; tags: string };

// What Duda's Handlebars renders from content.hbs, with {{tags}} HTML-escaped.
function render(groups: Group[]) {
  const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const body = groups
    .map(
      (g) =>
        `<section class="shm-tc-group">${g.heading ? `<h3 class="shm-tc-heading">${esc(g.heading)}</h3>` : ''}` +
        `<div class="shm-tc-list"><span class="shm-tc-raw">${esc(g.tags)}</span></div></section>`,
    )
    .join('');
  return `<div id="widget"><div class="shm-tc" data-shm-tc>${body}</div></div>`;
}

function mount(groups: Group[], config: Record<string, string> = {}, inEditor = false) {
  const win = window as unknown as Win;
  win.document.body.innerHTML = render(groups);
  delete win.ShazammeWidget;
  win.eval(BUNDLE);
  const element = win.document.getElementById('widget')!;
  win.ShazammeWidget['tag-cloud']({ element, data: { config: { groups, ...config }, inEditor }, $: undefined, shazamme: undefined });
  return element;
}

describe('tag-cloud bundle', () => {
  it('renders one linked pill per non-blank line', () => {
    const el = mount([{ heading: 'Tech', tags: 'Java\n\n  Cloud & DevOps  \nC#' }]);
    const pills = [...el.querySelectorAll('a.shm-tc-pill')] as HTMLAnchorElement[];
    expect(pills.map((p) => p.textContent)).toEqual(['Java', 'Cloud & DevOps', 'C#']);
    expect(pills[1].getAttribute('href')).toBe('/job-results?search=Cloud%20%26%20DevOps');
    expect(el.querySelector('.shm-tc')!.classList.contains('is-ready')).toBe(true);
  });

  it('escapes tag text instead of rendering it as HTML', () => {
    const el = mount([{ tags: '<img src=x onerror=alert(1)>' }]);
    expect(el.querySelector('img')).toBeNull();
    expect(el.querySelector('.shm-tc-pill')!.textContent).toBe('<img src=x onerror=alert(1)>');
  });

  it('falls back to the default link for a javascript: or protocol-relative pattern', () => {
    for (const linkPattern of ['javascript:alert({tag})', '//evil.example/{tag}']) {
      const el = mount([{ tags: 'Java' }], { linkPattern });
      expect(el.querySelector('a.shm-tc-pill')!.getAttribute('href')).toBe('/job-results?search=Java');
    }
  });

  it('renders plain labels when links are off', () => {
    const el = mount([{ tags: 'Java' }], { linkEnabled: 'false' });
    expect(el.querySelector('a')).toBeNull();
    expect(el.querySelector('span.shm-tc-pill')!.textContent).toBe('Java');
  });

  it('removes an empty group and shows the editor message when nothing is left', () => {
    const el = mount([{ heading: 'Empty', tags: '\n \n' }], {}, true);
    expect(el.querySelector('.shm-tc-group')).toBeNull();
    expect(el.querySelector('.shm-tc-empty')).not.toBeNull();
  });

  it('keeps every pill when Duda re-runs it on already-rendered markup', () => {
    const el = mount([{ heading: 'Tech', tags: 'Java\nC#' }]);
    const win = window as unknown as Win;
    win.ShazammeWidget['tag-cloud']({ element: el, data: { config: {}, inEditor: true }, $: undefined, shazamme: undefined });
    expect(el.querySelectorAll('.shm-tc-pill')).toHaveLength(2);
    expect(el.querySelector('.shm-tc-empty')).toBeNull();
    expect(el.querySelector('.shm-tc')!.classList.contains('is-ready')).toBe(true);
  });

  it('swaps the heading level and sets the column grid', () => {
    const el = mount([{ heading: 'Tech', tags: 'Java' }], { headingTag: 'h4', columnsDesktop: '3' });
    expect(el.querySelector('h4.shm-tc-heading')!.textContent).toBe('Tech');
    const root = el.querySelector('.shm-tc') as HTMLElement;
    expect(root.classList.contains('is-cols-d')).toBe(true);
    expect(root.style.getPropertyValue('--shm-tc-cols-d')).toBe('3');
  });
});

// @vitest-environment jsdom
// Runs the real prettifyClearButtons from legacy.js against the classic template's
// clear buttons, which carry Font Awesome classes and (on location) a second icon.

import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it, expect, beforeEach } from 'vitest';

const here = dirname(fileURLToPath(import.meta.url));
const src = readFileSync(join(here, 'legacy.js'), 'utf8');

new Function(readFileSync(createRequire(import.meta.url).resolve('jquery/dist/jquery.js'), 'utf8'))();
const jQuery = (window as unknown as { jQuery: (el: unknown) => unknown }).jQuery;

function extract(name: string): string {
  const start = src.indexOf(`const ${name} = `);
  expect(start, `${name} not found`).toBeGreaterThan(-1);
  let depth = 0;
  for (let i = src.indexOf('{', start); i < src.length; i++) {
    if (src[i] === '{') depth++;
    else if (src[i] === '}' && --depth === 0) return src.slice(start, i + 1) + ';';
  }
  throw new Error(`${name} not terminated`);
}

const prettify = new Function(
  '$',
  `const ClearIcon = ${src.match(/const ClearIcon = (.+);/)![1]};
   const ClearStyle = ${src.match(/const ClearStyle = (`[\s\S]+?`);/)![1]};
   ${extract('prettifyClearButtons')}
   return prettifyClearButtons;`,
)(jQuery) as (root: unknown) => void;

const Template = `
  <div class="section-job-result-filter">
    <div class="section-keyword-search">
      <input class="filter-field" data-rel="job-result-filter-keyword" data-keyword-field="keyword" />
      <button class="filter-keyword-clear far fa-window-close" data-rel="job-result-filter-keyword-clear" data-keyword-field="keyword"></button>
    </div>
    <div class="section-keyword-search">
      <input class="filter-field" data-rel="job-result-filter-keyword" data-keyword-field="location" />
      <button class="filter-keyword-clear far fa-window-close" data-rel="job-result-filter-keyword-clear" data-keyword-field="location"><i class="fa-light fa-square-x"></i></button>
    </div>
    <div class="section-keyword-search">
      <input type="date" class="filter-field" data-rel="job-result-filter-keyword" data-keyword-field="jobStartDate" />
      <button class="filter-keyword-clear far fa-window-close" data-rel="job-result-filter-keyword-clear" data-keyword-field="jobStartDate"></button>
    </div>
  </div>`;

const buttons = () => document.querySelectorAll('.filter-keyword-clear');

describe('job-results clear buttons', () => {
  beforeEach(() => {
    document.head.innerHTML = '';
    document.body.innerHTML = Template;
    prettify(jQuery(document.body));
  });

  it('drops the Font Awesome icon classes', () => {
    buttons().forEach(b => {
      expect(b.classList.contains('far')).toBe(false);
      expect(b.classList.contains('fa-window-close')).toBe(false);
    });
  });

  it('leaves exactly one icon in each button, including location', () => {
    buttons().forEach(b => {
      expect(b.querySelectorAll('i')).toHaveLength(0);
      expect(b.querySelectorAll('svg')).toHaveLength(1);
    });
  });

  it('makes the buttons accessible non-submit buttons', () => {
    buttons().forEach(b => {
      expect(b.getAttribute('type')).toBe('button');
      expect(b.getAttribute('aria-label')).toBe('Clear');
    });
  });

  it('keeps the data hooks the click handlers rely on', () => {
    const loc = document.querySelector('.filter-keyword-clear[data-keyword-field=location]');
    expect(loc?.getAttribute('data-rel')).toBe('job-result-filter-keyword-clear');
  });

  it('injects the stylesheet once across widgets', () => {
    prettify(jQuery(document.body));
    expect(document.querySelectorAll('style#shm-jr-clear')).toHaveLength(1);
  });

  it('does not use !important', () => {
    expect(document.getElementById('shm-jr-clear')?.textContent).not.toContain('!important');
  });

  it('moves date clear buttons clear of the native calendar picker', () => {
    const css = document.getElementById('shm-jr-clear')?.textContent ?? '';
    expect(css).toMatch(/\[data-keyword-field=jobStartDate\][\s\S]*?right: 34px/);
    expect(css).toMatch(/\.filter-field\[type=date\] \{\s*padding-right: 64px/);
  });

  it('inherits the theme text colour instead of a fixed grey', () => {
    const css = document.getElementById('shm-jr-clear')?.textContent ?? '';
    expect(css).toContain('color: inherit');
    expect(css).not.toMatch(/#[0-9a-f]{6}/i);
  });
});

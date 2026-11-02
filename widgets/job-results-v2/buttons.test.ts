// @vitest-environment node
// Button standard (platform/standards/BUTTONS.md section 3) for the Grid 2026
// widgets: 14px 32px padding, 14px 24px on mobile, 44px minimum, centred inline-flex.

import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it, expect } from 'vitest';

const widgets = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (file: string): string => readFileSync(join(widgets, file), 'utf8');
const rule = (css: string, selector: string): string => {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return css.match(new RegExp(`(?:^|\\n)${escaped} \\{([^}]*)\\}`))?.[1] ?? '';
};

const results = read('job-results-v2/styles.css');
const resultsMobile = read('job-results-v2/styles.mobile.css');
const search = read('job-search-v2/styles.css');

const centred = (body: string): void => {
  expect(body).toMatch(/display: inline-flex/);
  expect(body).toMatch(/align-items: center/);
  expect(body).toMatch(/justify-content: center/);
};

describe('job-results-v2 buttons', () => {
  it.each(['.sjr-btn', '.action-bar .action-item button', '.section-job-result-filter .toolbar .submit'])(
    '%s is 14px 32px, 44px tall and centred',
    (sel) => {
      const body = rule(results, sel);
      expect(body).toMatch(/padding: 14px 32px/);
      expect(body).toMatch(/min-height: 44px/);
      expect(body).not.toMatch(/\sheight: \d+px/);
      if (sel !== '.action-bar .action-item button') centred(body);
    },
  );

  it('keeps the toolbar buttons centred', () => {
    expect(rule(results, '.action-bar .action-item button')).toMatch(/justify-content: center/);
  });

  it('gives Save, paging, filter rows, sort options and the clear cross a 44px target', () => {
    for (const sel of [
      '.sjr-save',
      '.section-job-results-paging .button-paging',
      '.section-job-result-filter .filter-toggle',
      '.menu-option',
    ]) {
      expect(rule(results, sel), sel).toMatch(/min-height: 44px/);
    }
    const clear = rule(results, '.section-job-result-filter .filter-keyword-clear');
    expect(clear).toMatch(/width: 44px/);
    expect(clear).toMatch(/height: 44px/);
  });

  it('tightens horizontal padding to 24px on mobile', () => {
    expect(resultsMobile).toMatch(/\.sjr-btn,[\s\S]*\.action-bar \.action-item button,[\s\S]*\.submit \{\s*padding: 14px 24px;/);
  });
});

describe('job-search-v2 buttons', () => {
  it('searchBtn is 14px 32px, at least 44px and centred inline-flex', () => {
    const body = rule(search, '.flex-items-js .searchBtn');
    expect(body).toMatch(/padding: 14px 32px/);
    expect(body).toMatch(/min-height: 46px/);
    expect(body).not.toMatch(/\sheight: \d+px/);
    centred(body);
  });

  it('uses 14px 24px inside the mobile breakpoint', () => {
    expect(search).toMatch(/@media \(max-width: 640px\)[\s\S]*\.searchBtn \{\s*padding: 14px 24px;/);
  });

  it('gives the chip remove cross a 44px tap area without growing the chip', () => {
    const body = rule(search, '.job-search-root [data-chip-remove]');
    expect(body).toMatch(/min-width: 44px/);
    expect(body).toMatch(/min-height: 44px/);
    expect(body).toMatch(/margin: -14px/);
  });
});

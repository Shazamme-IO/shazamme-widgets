// @vitest-environment jsdom
// Runs the real _postedDateText and showLoadingMessage bodies from legacy.js with real jQuery.

import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { describe, it, expect, beforeEach } from 'vitest';

const here = dirname(fileURLToPath(import.meta.url));
const src = readFileSync(join(here, 'legacy.js'), 'utf8').replace(/\r\n/g, '\n');
const JQUERY = readFileSync(createRequire(import.meta.url).resolve('jquery/dist/jquery.js'), 'utf8');

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

type Ux = { _postedDateText: (j: Record<string, unknown>, d: Date) => string; showLoadingMessage: (on?: boolean) => void };

function mount(config: Record<string, unknown>): { ux: Ux; list: HTMLElement } {
  document.body.innerHTML = '<div id="w"><div data-rel="job-results-list" style="display:none"></div></div>';
  // eslint-disable-next-line no-new-func
  new Function(JQUERY)();
  const $ = (window as unknown as { jQuery: any }).jQuery;
  const root = document.getElementById('w') as HTMLElement;
  const ux = { el: $(root) } as unknown as Ux;
  const code = [body('this._postedDateText = (j, jobDate) => {'), body('this.showLoadingMessage = (showing = true) => {')].join('\n');
  // eslint-disable-next-line no-new-func
  new Function('$', 'data', 'self', `${code.replace(/this\./g, 'self.')}`)($, { config }, ux);
  return { ux, list: root.querySelector('[data-rel=job-results-list]') as HTMLElement };
}

const local = new Date('2026-11-16T14:00:00Z');

describe('_postedDateText', () => {
  it('keeps the locale date by default', () => {
    const { ux } = mount({});
    expect(ux._postedDateText({ postedDate: '16-Nov-2026' }, local)).toBe(local.toLocaleDateString());
  });

  it('shows the job posted date as entered when useJobPostedDate is on', () => {
    const { ux } = mount({ useJobPostedDate: true });
    expect(ux._postedDateText({ postedDate: '16-Nov-2026' }, local)).toBe('16-Nov-2026');
  });

  it('falls back to the locale date when the job has no posted date', () => {
    const { ux } = mount({ useJobPostedDate: true });
    expect(ux._postedDateText({}, local)).toBe(local.toLocaleDateString());
  });

  it('escapes the posted date', () => {
    const { ux } = mount({ useJobPostedDate: true });
    expect(ux._postedDateText({ postedDate: '<img src=x onerror=alert(1)>' }, local)).not.toContain('<img');
  });
});

describe('showLoadingMessage', () => {
  let ctx: ReturnType<typeof mount>;

  beforeEach(() => { ctx = mount({ loadingText: 'Loading jobs...' }); });

  it('shows the text in an empty list and removes it on request', () => {
    ctx.ux.showLoadingMessage();
    expect(ctx.list.textContent).toBe('Loading jobs...');
    expect(ctx.list.style.display).not.toBe('none');
    ctx.ux.showLoadingMessage(false);
    expect(ctx.list.textContent).toBe('');
  });

  it('does nothing when loadingText is not set', () => {
    const off = mount({});
    off.ux.showLoadingMessage();
    expect(off.list.textContent).toBe('');
    expect(off.list.style.display).toBe('none');
  });

  it('does not touch a list that already has results', () => {
    ctx.list.innerHTML = '<div class="job">x</div>';
    ctx.ux.showLoadingMessage();
    expect(ctx.list.textContent).toBe('x');
  });
});

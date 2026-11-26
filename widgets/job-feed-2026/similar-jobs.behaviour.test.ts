// @vitest-environment jsdom
// Runs the real isViewedJob / fitCards bodies from legacy.js: the job page being
// viewed must not appear in its own Similar Jobs, and a card box pinned shorter than
// its copy must grow so the copy cannot run under the buttons.

import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it, expect } from 'vitest';

const here = dirname(fileURLToPath(import.meta.url));
const src = readFileSync(join(here, 'legacy.js'), 'utf8');

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

const viewed = new Function(
  `${body('const lastPathSegment = (')}\n${body('const isViewedJob = (')}\nreturn isViewedJob;`,
)() as (job: { jobURL?: string } | undefined, pathname: string) => boolean;

describe('isViewedJob', () => {
  const job = { jobURL: 'https://shazamme.io/job-details/sales-director-in-sales-account-management-jobs-1799165' };

  it('matches the job whose URL ends in the page URL segment', () => {
    expect(viewed(job, '/job-details/sales-director-in-sales-account-management-jobs-1799165')).toBe(true);
  });

  it('ignores a trailing slash and letter case', () => {
    expect(viewed(job, '/job-details/Sales-Director-In-Sales-Account-Management-Jobs-1799165/')).toBe(true);
  });

  it('does not match a different job', () => {
    expect(viewed(job, '/job-details/engineer-jobs-42')).toBe(false);
  });

  it('does not match on a page with no job segment', () => {
    expect(viewed(job, '/')).toBe(false);
  });

  it('never throws on a job without a usable URL', () => {
    expect(viewed({}, '/job-details/x')).toBe(false);
    expect(viewed({ jobURL: 'not a url' }, '/job-details/x')).toBe(false);
    expect(viewed(undefined, '/job-details/x')).toBe(false);
  });
});

describe('fitCards', () => {
  type Rect = { top: number; bottom: number; height: number };
  const rect = (top: number, height: number): Rect => ({ top, bottom: top + height, height });

  function mount(pinned: number, contentHeight: number) {
    document.body.innerHTML = `<div id="w"><div class="container-card-content"><div class="ordering-content"></div></div></div>`;
    const card = document.querySelector('.container-card-content') as HTMLElement;
    const inner = card.firstElementChild as HTMLElement;
    card.getBoundingClientRect = () => rect(0, parseFloat(card.style.height) || pinned) as DOMRect;
    inner.getBoundingClientRect = () => rect(20, contentHeight) as DOMRect;
    const fit = new Function(
      '$el',
      'getComputedStyle',
      `const self = { el: $el }; self.fitCards = ${body('this.fitCards = () => {').replace('this.fitCards = ', '')}; return self.fitCards;`.replace(/this\./g, 'self.'),
    );
    const $el = { find: () => ({ get: () => [card] }) };
    return { card, run: fit($el, () => ({ paddingBottom: '20px' })) as () => void };
  }

  it('grows a card box that is shorter than its copy', () => {
    const { card, run } = mount(320, 346);
    run();
    expect(card.style.getPropertyValue('height')).toBe('386px');
    expect(card.style.getPropertyPriority('height')).toBe('important');
  });

  it('leaves a card box alone when the copy fits', () => {
    const { card, run } = mount(400, 200);
    run();
    expect(card.style.height).toBe('');
  });
});

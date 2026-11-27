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
  type Spec = { pinned: number; content: number; boxSizing?: string };
  const rect = (top: number, height: number) => ({ top, bottom: top + height, height }) as DOMRect;

  function mount(specs: Spec[]) {
    document.body.innerHTML = specs.map(() => '<div class="container-card-content"><div class="ordering-content"></div></div>').join('');
    const cards = Array.from(document.querySelectorAll<HTMLElement>('.container-card-content'));
    cards.forEach((card, i) => {
      const inner = card.firstElementChild as HTMLElement;
      card.getBoundingClientRect = () => rect(0, parseFloat(card.style.height) || specs[i].pinned);
      inner.getBoundingClientRect = () => rect(20, specs[i].content);
    });
    const fitBody = body('this.fitCards = () => {').replace('this.fitCards = ', '');
    const fit = new Function('self', 'getComputedStyle', `return ${fitBody.replace(/this\./g, 'self.')};`);
    const self = { el: { find: () => ({ get: () => cards }) } };
    const css = (c: Element) => ({
      paddingTop: '20px', paddingBottom: '20px', borderTopWidth: '0px', borderBottomWidth: '0px',
      boxSizing: specs[cards.indexOf(c as HTMLElement)].boxSizing ?? 'border-box',
    });
    return { cards, run: fit(self, css) as () => void };
  }

  it('grows a card box that is shorter than its copy', () => {
    const { cards, run } = mount([{ pinned: 320, content: 346 }]);
    run();
    expect(cards[0].style.getPropertyValue('height')).toBe('386px');
    expect(cards[0].style.getPropertyPriority('height')).toBe('important');
  });

  it('leaves every card alone when all of them fit', () => {
    const { cards, run } = mount([{ pinned: 400, content: 200 }, { pinned: 400, content: 300 }]);
    run();
    expect(cards.map((c) => c.style.height)).toEqual(['', '']);
  });

  it('equalises the cards once one of them overflows', () => {
    const { cards, run } = mount([{ pinned: 320, content: 346 }, { pinned: 320, content: 200 }]);
    run();
    expect(cards.map((c) => c.style.height)).toEqual(['386px', '386px']);
  });

  it('subtracts padding for a content-box card', () => {
    const { cards, run } = mount([{ pinned: 320, content: 346, boxSizing: 'content-box' }]);
    run();
    expect(cards[0].style.height).toBe('346px');
  });

  it('does nothing while the widget is hidden', () => {
    const { cards, run } = mount([{ pinned: 0, content: 0 }]);
    run();
    expect(cards[0].style.height).toBe('');
  });
});

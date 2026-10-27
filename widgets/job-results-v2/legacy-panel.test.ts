// @vitest-environment jsdom
// Widgets cloned from Job Results 2026 keep the LEGACY settings panel (defaultCity,
// shmTopResultsRow, applybtn, layout:"simple", …) while running this controller.
// G&D Chillers (ir-jobs.dzconnex.com/gdchillers-careers) shipped like that: every
// default filter, the results-header toggle, the button toggles and the Design
// panel's `.shmJobResultSimple …` rules were wired to keys/classes v2 never read.

import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it, expect, beforeEach } from 'vitest';
import jobResults from './index';
import { renderCards } from './cards';
import { inDefaultScope } from './defaults';
import { readConfig } from '../../core/config';
import type { ShazammeClient } from '../../core/sdk';
import type { Job, QueryResult } from '../../core/types';

const TEMPLATE = readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'template.html'), 'utf8');

const JOBS = [
  { jobID: '1', jobName: 'Test Engineer', city: 'Junction City', state: 'Oregon', advertiserID: 'adv-dz', tags: 'Chillers, Hot', changedOnUTC: '2026-10-20T00:00:00Z' },
  { jobID: '2', jobName: 'Material Handler', city: 'Junction City', state: 'Oregon', advertiserID: 'adv-ir', tags: '', changedOnUTC: '2026-10-19T00:00:00Z' },
  { jobID: '3', jobName: 'Service Coordinator', city: 'Greensboro', state: 'North Carolina', advertiserID: 'adv-dz', tags: 'Hot', changedOnUTC: '2026-10-18T00:00:00Z' },
];

function client(): ShazammeClient {
  return {
    fetch: () => Promise.resolve({ values: JOBS.map((data) => ({ data })) }),
    submit: () => Promise.resolve({}),
    site: () => Promise.resolve({ siteID: 'S1' }),
    pub: () => undefined,
    sub: () => undefined,
  };
}

const flush = (): Promise<void> => new Promise((r) => setTimeout(r, 0));

async function mount(config: Record<string, unknown>): Promise<HTMLElement> {
  const element = document.createElement('div');
  element.innerHTML = TEMPLATE;
  document.body.appendChild(element);
  jobResults({ element, data: { config }, $: {}, shazamme: client() });
  await flush();
  await flush();
  return element;
}

const ids = (root: Element): string[] =>
  Array.from(root.querySelectorAll('[data-rel="article-job-result"]')).map((c) => c.getAttribute('data-id') ?? '');

describe('legacy default filters', () => {
  beforeEach(() => {
    window.location.hash = '';
  });

  it('scopes results to the default city and state', async () => {
    const el = await mount({ defaultCity: 'Junction City', defaultState: 'Oregon' });

    expect(ids(el).sort()).toEqual(['1', '2']);
    expect(el.querySelector('[data-rel="label-results-count"]')?.textContent).toBe('2');
  });

  it('matches case-insensitively and treats commas as alternatives', async () => {
    const el = await mount({ defaultCity: 'junction city, GREENSBORO ' });

    expect(ids(el).sort()).toEqual(['1', '2', '3']);
  });

  it('ANDs different fields together', async () => {
    const el = await mount({ defaultAdvertiserID: 'adv-dz', defaultState: 'Oregon' });

    expect(ids(el)).toEqual(['1']);
  });

  it('shows every job when no default is set', async () => {
    const el = await mount({ defaultCity: '', defaultState: '  ' });

    expect(ids(el).length).toBe(3);
  });

  it('matches a tag inside a comma-separated tag list', () => {
    const cfg = readConfig({ config: { defaultTags: 'chillers' } });

    expect(JOBS.filter((j) => inDefaultScope(j as Job, cfg.defaultFilters)).map((j) => j.jobID)).toEqual(['1']);
  });

  it('matches a default keyword as a contains search', () => {
    const cfg = readConfig({ config: { defaultKeyword: 'engineer' } });

    expect(JOBS.filter((j) => inDefaultScope(j as Job, cfg.defaultFilters)).map((j) => j.jobID)).toEqual(['1']);
  });
});

describe('legacy results header', () => {
  beforeEach(() => {
    window.location.hash = '';
  });

  it('hides the results count row when Show Results bar is off', async () => {
    const el = await mount({ shmTopResultsRow: false });
    const row = el.querySelector<HTMLElement>('.shmResultCountContainer');

    expect(row?.style.getPropertyValue('display')).toBe('none');
    expect(row?.style.getPropertyPriority('display')).toBe('important');
  });

  it('hides the action bar when Show Action Bar is off', async () => {
    const el = await mount({ showActionBar: false });
    const bar = el.querySelector<HTMLElement>('[data-rel="action-bar"]');

    expect(bar?.style.getPropertyValue('display')).toBe('none');
    expect(bar?.style.getPropertyPriority('display')).toBe('important');
  });

  it('leaves both visible when the keys are absent (v2 panel)', async () => {
    const el = await mount({});

    expect(el.querySelector<HTMLElement>('.shmResultCountContainer')?.style.display).toBe('');
    expect(el.querySelector<HTMLElement>('[data-rel="action-bar"]')?.style.display).toBe('');
  });

  it('hides the List/Map toggle when the legacy Google API key is empty', async () => {
    const el = await mount({ apikey: '' });
    const toggle = el.querySelector<HTMLElement>('[data-rel="view-toggle"]');

    expect(toggle?.style.getPropertyValue('display')).toBe('none');
    expect(toggle?.style.getPropertyPriority('display')).toBe('important');
  });

  it('keeps the List/Map toggle when a Google API key is set', async () => {
    const el = await mount({ apikey: 'AIza-test' });

    expect(el.querySelector<HTMLElement>('[data-rel="view-toggle"]')?.style.display).toBe('');
  });

  it('keeps the List/Map toggle when the key is absent (v2 panel)', async () => {
    const el = await mount({});

    expect(el.querySelector<HTMLElement>('[data-rel="view-toggle"]')?.style.display).toBe('');
  });

  it('renders the search results text and singular/plural message', async () => {
    const el = await mount({
      searchResultsText: 'Your search resulted in:',
      resultMessage: 'position',
      resultMessagePlural: 'positions',
      defaultState: 'North Carolina',
    });
    const text = (): string =>
      (el.querySelector('.shmResultStaticText')?.textContent ?? '').replace(/\s+/g, ' ').trim();

    expect(text()).toBe('Your search resulted in: 1 position');
  });

  it('rewrites the message at a count of 1 when only the plural is set', async () => {
    const el = await mount({ resultMessagePlural: 'positions', defaultState: 'North Carolina' });

    expect(el.querySelector('[data-rel="label-results-message"]')?.textContent).toBe('');
  });

  it('keeps sample cards in the editor when the fetch fails, despite defaults', async () => {
    const element = document.createElement('div');
    element.innerHTML = TEMPLATE;
    document.body.appendChild(element);
    const failing: ShazammeClient = { ...client(), fetch: () => Promise.reject(new Error('no SDK')) };
    jobResults({ element, data: { config: { defaultCity: 'Junction City' }, inEditor: true }, $: {}, shazamme: failing });
    await flush();
    await flush();

    expect(ids(element).length).toBeGreaterThan(0);
  });

  it('uses the plural message for more than one result', async () => {
    const el = await mount({ resultMessage: 'position', resultMessagePlural: 'positions' });

    expect(el.querySelector('[data-rel="label-results-message"]')?.textContent).toBe('positions');
  });
});

function cards(config: Record<string, unknown>): HTMLElement {
  const host = document.createElement('div');
  const result = { page: [JOBS[0]], matching: [JOBS[0]], total: 1 } as unknown as QueryResult;
  renderCards(host, result, readConfig({ config }));
  return host;
}

describe('legacy card toggles and design hooks', () => {
  it('drops the Apply and Read More buttons when their toggles are off', () => {
    const host = cards({ applybtn: false, readmorebtn: false, applyNowLabel: 'APPLY NOW', readMoreLabel: 'READ MORE' });

    expect(host.textContent).not.toContain('APPLY NOW');
    expect(host.textContent).not.toContain('READ MORE');
  });

  it('keeps both buttons when the toggles are absent', () => {
    const host = cards({ applyNowLabel: 'APPLY NOW', readMoreLabel: 'READ MORE' });

    expect(host.textContent).toContain('APPLY NOW');
    expect(host.textContent).toContain('READ MORE');
  });

  it('carries the simple-layout classes the Design panel styles', () => {
    const host = cards({ layout: 'simple' });

    expect(host.querySelector('.shmJobResultSimple .jobResultTitle a, .shmJobResultSimple a.jobResultTitle')).not.toBeNull();
    expect(host.querySelector('.shmJobResultSimple .applyActionButton .text')).not.toBeNull();
    expect(host.querySelector('.shmJobResultSimple .readMoreActionButton .text')).not.toBeNull();
    expect(host.querySelector('.shmJobResultSimple .locationText')).not.toBeNull();
  });

  it('adds no legacy classes for the v2 panel', () => {
    const host = cards({});

    expect(host.querySelector('.shmJobResultSimple, .jobResultTitle, .applyActionButton')).toBeNull();
  });

  it('renders the classic card for the legacy standard layout', () => {
    const host = cards({ layout: 'standard' });

    expect(host.querySelector('.shmJobResult .shmGoApply')).not.toBeNull();
  });
});

describe('legacy card field toggles', () => {
  const job = {
    jobID: 'f1', jobName: 'Thermal Engineer', city: 'Junction City', state: 'Oregon', country: 'USA',
    salary: '155400', workType: 'Direct Hire', workModel: 'Onsite', category: 'Engineering',
    changedOnUTC: new Date().toISOString(),
  };
  const render = (config: Record<string, unknown>, template = ''): string => {
    const host = document.createElement('div');
    const result = { page: [job], matching: [job], total: 1 } as unknown as QueryResult;
    renderCards(host, result, readConfig({ config: template ? { ...config, cardTemplate: template } : config }));
    return host.textContent ?? '';
  };

  for (const template of ['', 'classic']) {
    const name = template || 'modern';

    it(`hides salary when Show Salary is off (${name})`, () => {
      expect(render({}, template)).toContain('155400');
      expect(render({ showSalary: false }, template)).not.toContain('155400');
    });

    it(`hides work type, work model and category when their toggles are off (${name})`, () => {
      const text = render({ showWorkType: false, showWorkModel: false, showCategory: false }, template);

      expect(text).not.toContain('Direct Hire');
      expect(text).not.toContain('Onsite');
      expect(text).not.toContain('Engineering');
    });

    it(`builds the location from the city/state toggles (${name})`, () => {
      expect(render({ showState: false }, template)).toContain('Junction City');
      expect(render({ showState: false }, template)).not.toContain('Oregon');
      expect(render({ showCity: false, showState: false, showCountry: false }, template)).not.toContain('Junction City');
    });
  }

  it('hides the posted line and New tag when their toggles are off', () => {
    const text = render({ showTimeSincePosted: false, showNewIcon: false });

    expect(text).not.toMatch(/Posted/);
    expect(text).not.toMatch(/\bNew\b/);
  });

  it('keeps the posted line when only Show Date is off (legacy gates it on time-since)', () => {
    expect(render({ showDate: false, showTimeSincePosted: true })).toMatch(/Posted/);
  });

  it('shows every field when the toggles are absent (v2 panel)', () => {
    const text = render({});

    for (const value of ['155400', 'Direct Hire', 'Onsite', 'Engineering', 'Junction City, Oregon']) {
      expect(text).toContain(value);
    }
  });
});

describe('short description on the card', () => {
  const SUMMARY =
    'The Chiller Test Engineer is responsible for planning, executing, monitoring, and documenting performance testing of commercial chiller systems.';
  const job = { jobID: 'd1', jobName: 'Test Engineer', state: 'Oregon', shortDescription: SUMMARY };
  const cards = (config: Record<string, unknown>, extra: Record<string, unknown> = {}): HTMLElement => {
    const host = document.createElement('div');
    const page = [{ ...job, ...extra }];
    renderCards(host, { page, matching: page, total: 1 } as unknown as QueryResult, readConfig({ config }));
    return host;
  };
  const desc = (host: HTMLElement): string | null =>
    host.querySelector('[data-rel="label-job-description"]')?.textContent ?? null;

  it('is hidden when Show Short Description is absent or off', () => {
    expect(desc(cards({}))).toBeNull();
    expect(desc(cards({ showShortDescription: 'false' }))).toBeNull();
  });

  for (const template of ['modern', 'classic']) {
    it(`shows the full summary when it fits the length (${template})`, () => {
      const host = cards({ showShortDescription: 'true', shortDescriptionLength: '500', cardTemplate: template });

      expect(desc(host)).toBe(SUMMARY);
      // Legacy CSS hides `.shmResultView.grid div.jobDescription`; stay clear of it.
      expect(host.querySelector('.jobDescription')).toBeNull();
    });
  }

  it('cuts at a word boundary within the configured length and adds an ellipsis', () => {
    const text = desc(cards({ showShortDescription: 'true', shortDescriptionLength: '40' })) ?? '';

    expect(text).toBe('The Chiller Test Engineer is responsible…');
    expect(text.length).toBeLessThanOrEqual(41);
  });

  it('defaults to 150 characters when the length is blank or invalid', () => {
    const long = 'word '.repeat(60).trim();
    for (const shortDescriptionLength of ['', 'abc', '-5']) {
      const text = desc(cards({ showShortDescription: 'true', shortDescriptionLength }, { shortDescription: long })) ?? '';

      expect(text.endsWith('…')).toBe(true);
      expect(text.length).toBeLessThanOrEqual(151);
    }
  });

  it('shows the whole summary when the length is 0', () => {
    const long = 'word '.repeat(60).trim();

    expect(desc(cards({ showShortDescription: 'true', shortDescriptionLength: '0' }, { shortDescription: long }))).toBe(long);
  });

  it('strips markup before cutting so no tag is left open in the grid', () => {
    const host = cards(
      { showShortDescription: 'true', shortDescriptionLength: '21' },
      { shortDescription: '<p><strong>Great&nbsp;role</strong> &amp; benefits for a <em>senior</em> engineer</p><script>x()</script>' },
    );

    expect(desc(host)).toBe('Great role & benefits…');
    expect(host.querySelector('[data-rel="label-job-description"] *, strong, em, script')).toBeNull();
  });

  it('renders decoded angle brackets as text, not markup', () => {
    const host = cards({ showShortDescription: 'true' }, { shortDescription: '&lt;img src=x onerror=alert(1)&gt; Apply today' });

    expect(host.querySelector('img')).toBeNull();
    expect(desc(host)).toBe('<img src=x onerror=alert(1)> Apply today');
  });

  it('decodes numeric and common named entities instead of showing them', () => {
    const host = cards({ showShortDescription: 'true' }, { shortDescription: 'Don&#8217;t miss &ndash; you&rsquo;ll love it &#x2014; apply' });

    expect(desc(host)).toBe('Don’t miss – you’ll love it — apply');
  });

  it('decodes every named entity once, never twice', () => {
    const host = cards({ showShortDescription: 'true' }, { shortDescription: 'Caf&eacute; &euro;50k &copy; &amp;lt;b&amp;gt; &bogus;' });

    expect(desc(host)).toBe('Café €50k © &lt;b&gt; &bogus;');
    expect(host.querySelector('b')).toBeNull();
  });

  it('breaks at a word that sits exactly half way', () => {
    expect(desc(cards({ showShortDescription: 'true', shortDescriptionLength: '20' }, { shortDescription: 'Supervisor of operations hiring now' }))).toBe(
      'Supervisor of…',
    );
  });

  it('keeps text around a bare < that is not a tag', () => {
    expect(desc(cards({ showShortDescription: 'true' }, { shortDescription: 'Salary < 50k, apply now > today' }))).toBe(
      'Salary < 50k, apply now > today',
    );
  });

  it('hard-cuts rather than keep only a tiny first word', () => {
    const text = desc(cards({ showShortDescription: 'true', shortDescriptionLength: '20' }, { shortDescription: `I ${'x'.repeat(40)}` }));

    expect(text).toBe(`I ${'x'.repeat(18)}…`);
  });

  it('never splits an emoji on a hard cut', () => {
    const text = desc(cards({ showShortDescription: 'true', shortDescriptionLength: '5' }, { shortDescription: 'abcd😀efgh' })) ?? '';

    expect(text).toBe('abcd…');
    expect(/[\uD800-\uDBFF](?![\uDC00-\uDFFF])/.test(text)).toBe(false);
  });

  const align = (config: Record<string, unknown>): string | undefined =>
    (cards({ showShortDescription: 'true', ...config }).querySelector('[data-rel="label-job-description"]') as HTMLElement | null)?.style
      .textAlign;

  it('is left-aligned by default, overriding a centred card', () => {
    expect(align({})).toBe('left');
    expect(align({ cardTemplate: 'classic' })).toBe('left');
  });

  it('follows the alignment setting, whatever case Duda sends', () => {
    expect(align({ shortDescriptionAlign: 'Center' })).toBe('center');
    expect(align({ shortDescriptionAlign: 'right' })).toBe('right');
    expect(align({ shortDescriptionAlignment: 'justify' })).toBe('justify');
  });

  it('falls back to left for an unknown or unsafe alignment', () => {
    expect(align({ shortDescriptionAlign: 'middle' })).toBe('left');
    expect(align({ shortDescriptionAlign: 'left;color:red' })).toBe('left');
  });

  it('renders nothing for a job without a summary', () => {
    expect(desc(cards({ showShortDescription: 'true' }, { shortDescription: '' }))).toBeNull();
    expect(desc(cards({ showShortDescription: 'true' }, { shortDescription: '<p> </p>' }))).toBeNull();
  });
});

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

// @vitest-environment jsdom
// Smoke test: mount the controller against a stub SDK + the real template, and
// assert it renders cards, populates a facet panel, and wires one filter click.

import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it, expect, beforeEach } from 'vitest';
import jobResults from './index';
import type { ShazammeClient } from '../../core/sdk';

const TEMPLATE = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), 'template.html'),
  'utf8',
);

function makeJobs(): { values: { data: Record<string, unknown> }[] } {
  const now = new Date().toISOString();
  return {
    values: [
      { data: { jobID: '1', jobName: 'Senior Nurse', jobTypeID: 'perm', jobType: 'Permanent', city: 'London', state: 'England', workType: 'Full Time', changedOnUTC: now } },
      { data: { jobID: '2', jobName: 'Site Engineer', jobTypeID: 'contract', jobType: 'Contract', city: 'Leeds', state: 'England', workType: 'Contract', changedOnUTC: now } },
    ],
  };
}

function stubClient(jobs: unknown): ShazammeClient {
  return {
    fetch: () => Promise.resolve(jobs),
    submit: () => Promise.resolve({}),
    site: () => Promise.resolve({ siteID: 'S1' }),
    pub: () => undefined,
    sub: () => undefined,
  };
}

const flush = (): Promise<void> => new Promise((r) => setTimeout(r, 0));

describe('jobResults controller', () => {
  let element: HTMLElement;

  beforeEach(() => {
    window.location.hash = '';
    element = document.createElement('div');
    element.innerHTML = TEMPLATE;
    document.body.appendChild(element);
  });

  it('renders one card per job and the result count', async () => {
    jobResults({ element, data: { config: { showJobTypeFilter: 'true' } }, $: {}, shazamme: stubClient(makeJobs()) });
    await flush();
    await flush();

    const list = element.querySelector('[data-rel="job-results-list"]');
    expect(list?.querySelectorAll('.shmJobResultStd').length).toBe(2);
    expect(element.querySelector('[data-rel="label-results-count"]')?.textContent).toBe('2');
  });

  it('renders the jobType facet panel and filters on click', async () => {
    jobResults({ element, data: { config: { showJobTypeFilter: 'true' } }, $: {}, shazamme: stubClient(makeJobs()) });
    await flush();
    await flush();

    const toggle = element.querySelector('[data-filter-type="jobTypeID"][data-filter-value="perm"]');
    expect(toggle).not.toBeNull();

    toggle?.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));

    const list = element.querySelector('[data-rel="job-results-list"]');
    expect(list?.querySelectorAll('.shmJobResultStd').length).toBe(1);
    expect(element.querySelector('[data-rel="label-results-count"]')?.textContent).toBe('1');
  });

  it('loads real jobs in editor mode (no short-circuit)', async () => {
    let fetched = false;
    const client = stubClient(makeJobs());
    const spied: ShazammeClient = { ...client, fetch: (d) => { fetched = true; return client.fetch(d); } };
    jobResults({ element, data: { config: {}, inEditor: true }, $: {}, shazamme: spied });
    await flush();
    await flush();

    expect(fetched).toBe(true);
    expect(element.querySelector('[data-rel="job-results-list"]')?.querySelectorAll('.shmJobResultStd').length)
      .toBe(makeJobs().values.length);
  });

  it('falls back to sample cards when the live fetch fails', async () => {
    const client = stubClient(makeJobs());
    const spied: ShazammeClient = { ...client, fetch: () => Promise.reject(new Error('no sdk')) };
    jobResults({ element, data: { config: {}, inEditor: true }, $: {}, shazamme: spied });
    await flush();
    await flush();

    expect(element.querySelector('[data-rel="job-results-list"]')?.querySelectorAll('.shmJobResultStd').length)
      .toBe(2);
  });

  it('keeps the left-nav sidebar by default', async () => {
    jobResults({ element, data: { config: {} }, $: {}, shazamme: stubClient(makeJobs()) });
    await flush();
    await flush();

    const sidebar = element.querySelector<HTMLElement>('[data-rel="filter-sidebar"]');
    expect(sidebar?.style.display).not.toBe('none');
  });

  it('drops the left-nav sidebar when hideLeftNav is set', async () => {
    jobResults({ element, data: { config: { hideLeftNav: 'true' } }, $: {}, shazamme: stubClient(makeJobs()) });
    await flush();
    await flush();

    const sidebar = element.querySelector<HTMLElement>('[data-rel="filter-sidebar"]');
    expect(sidebar?.style.display).toBe('none');
    // results still render full-width
    expect(element.querySelector('[data-rel="job-results-list"]')?.querySelectorAll('.shmJobResultStd').length).toBe(2);
  });
});

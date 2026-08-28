// @vitest-environment jsdom
// Smoke test: mount the search bar against a stub SDK + the real template, then
// type a keyword, pick a job type, and submit — asserting it publishes EXACTLY
// ONE 'job-search-submit' message carrying the payload shape the results widget
// reads (state / keyword / geo / geoRange). This is the search↔results contract.

import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it, expect, beforeEach } from 'vitest';
import jobSearch from './index';
import { MESSAGES } from '../../core/pubsub';
import type { ShazammeClient } from '../../core/sdk';

const TEMPLATE = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), 'template.html'),
  'utf8',
);

function makeJobs(): { values: { data: Record<string, unknown> }[] } {
  const now = new Date().toISOString();
  return {
    values: [
      { data: { jobID: '1', jobName: 'Senior Nurse', jobTypeID: 'perm', jobType: 'Permanent', professionID: 'health', category: 'Healthcare', roleID: 'nurse', subCategory: 'Nurse', state: 'England', workTypeID: 'ft', workType: 'Full Time', changedOnUTC: now } },
      { data: { jobID: '2', jobName: 'Site Engineer', jobTypeID: 'contract', jobType: 'Contract', professionID: 'build', category: 'Construction', roleID: 'eng', subCategory: 'Engineer', state: 'Scotland', workTypeID: 'ct', workType: 'Contract', changedOnUTC: now } },
    ],
  };
}

interface Published {
  msg: string;
  payload: unknown;
}

function stubClient(jobs: unknown, sink: Published[]): ShazammeClient {
  return {
    fetch: () => Promise.resolve(jobs),
    submit: () => Promise.resolve({}),
    site: () => Promise.resolve({ siteID: 'S1' }),
    pub: (msg, payload) => sink.push({ msg, payload }),
    sub: () => undefined,
  };
}

const flush = (): Promise<void> => new Promise((r) => setTimeout(r, 0));

describe('jobSearch controller', () => {
  let element: HTMLElement;

  beforeEach(() => {
    window.location.hash = '';
    element = document.createElement('div');
    element.innerHTML = TEMPLATE;
    document.body.appendChild(element);
  });

  it('publishes one filter-change with the expected payload shape on submit', async () => {
    const published: Published[] = [];
    jobSearch({
      element,
      data: { config: { showSearchKeyword: 'true', showJobType: 'true' } },
      $: {},
      shazamme: stubClient(makeJobs(), published),
    });
    await flush();
    await flush();

    const keyword = element.querySelector<HTMLInputElement>('[data-rel="search-keyword"]');
    const jobType = element.querySelector<HTMLSelectElement>('select[data-filter="jobTypeID"]');
    expect(keyword).not.toBeNull();
    expect(jobType).not.toBeNull();

    keyword!.value = 'nurse';
    jobType!.value = 'perm';

    element
      .querySelector('[data-rel="search-button"]')!
      .dispatchEvent(new window.MouseEvent('click', { bubbles: true }));

    expect(published).toHaveLength(1);
    const { msg, payload } = published[0];
    expect(msg).toBe(MESSAGES.FILTER_CHANGE);
    expect(payload).toEqual({
      state: { jobTypeID: ['perm'] },
      keyword: 'nurse',
      geo: null,
      geoRange: 50,
    });
  });

  it('populates the job type dropdown from the model', async () => {
    const published: Published[] = [];
    jobSearch({
      element,
      data: { config: { showJobType: 'true' } },
      $: {},
      shazamme: stubClient(makeJobs(), published),
    });
    await flush();
    await flush();

    const opts = element.querySelectorAll('select[data-filter="jobTypeID"] option');
    // placeholder + 2 job types
    expect(opts.length).toBe(3);
  });

  it('short-circuits network in editor mode and never publishes', async () => {
    const published: Published[] = [];
    let fetched = false;
    const base = stubClient(makeJobs(), published);
    const spied: ShazammeClient = { ...base, fetch: () => { fetched = true; return Promise.resolve(makeJobs()); } };
    jobSearch({ element, data: { config: { showJobType: 'true' }, inEditor: true }, $: {}, shazamme: spied });
    await flush();

    expect(fetched).toBe(false);
    expect(published).toHaveLength(0);
    expect(element.querySelectorAll('select[data-filter="jobTypeID"] option').length).toBe(3);
  });

  it('renders a removable chip for a selected filter and clears it on the ✕', async () => {
    const published: Published[] = [];
    jobSearch({
      element,
      data: { config: { showJobType: 'true' } },
      $: {},
      shazamme: stubClient(makeJobs(), published),
    });
    await flush();
    await flush();

    // Arrange: select a job type.
    const jobType = element.querySelector<HTMLSelectElement>('select[data-filter="jobTypeID"]')!;
    jobType.value = 'perm';
    jobType.dispatchEvent(new window.Event('change', { bubbles: true }));

    // Assert: a chip appears with the option's label + a remove button.
    const host = element.querySelector<HTMLElement>('[data-rel="active-chips"]');
    expect(host).not.toBeNull();
    expect(host!.textContent).toContain('Permanent');
    const remove = host!.querySelector<HTMLButtonElement>('[data-chip-remove="jobTypeID"]');
    expect(remove).not.toBeNull();

    // Act: click the ✕.
    remove!.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));

    // Assert: filter cleared and the chip removed.
    expect(jobType.value).toBe('');
    expect(host!.querySelectorAll('[data-chip-remove]').length).toBe(0);
  });

  it('multi-selects classifications — count, one chip each, array in payload', async () => {
    const published: Published[] = [];
    jobSearch({
      element,
      data: { config: { showJobCategories: 'true' } },
      $: {},
      shazamme: stubClient(makeJobs(), published),
    });
    await flush();
    await flush();

    const wrap = element.querySelector<HTMLElement>('[data-ms-field="professionID"]')!;
    expect(wrap).not.toBeNull();
    const boxes = wrap.querySelectorAll<HTMLInputElement>('.multi-select-dropdown input[type="checkbox"]');
    expect(boxes.length).toBe(2); // Healthcare, Construction

    // Check both classifications.
    for (const cb of Array.from(boxes)) {
      cb.checked = true;
      cb.dispatchEvent(new window.Event('change', { bubbles: true }));
    }

    // Box shows a "2 selected" count, and there is one removable chip per pick.
    expect(wrap.querySelector('.ms-count')?.textContent).toBe('2 selected');
    const host = element.querySelector<HTMLElement>('[data-rel="active-chips"]')!;
    expect(host.querySelectorAll('[data-chip-remove="professionID"]').length).toBe(2);

    // Submit publishes professionID as a multi-value array.
    element
      .querySelector('[data-rel="search-button"]')!
      .dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
    const last = published[published.length - 1];
    expect(last.msg).toBe(MESSAGES.FILTER_CHANGE);
    expect((last.payload as { state: Record<string, string[]> }).state.professionID.length).toBe(2);
  });

  it('locks sub-classification until a classification is chosen, and resets it on change', async () => {
    jobSearch({
      element,
      data: { config: { showJobCategories: 'true', ShowSubCalssifications: 'true' } },
      $: {},
      shazamme: stubClient(makeJobs(), []),
    });
    await flush();
    await flush();

    const subBox = element.querySelector<HTMLElement>('[data-ms-field="roleID"] [data-rel="ms-box"]')!;
    expect(subBox.classList.contains('subcategory-disabled')).toBe(true);

    // Choosing a classification unlocks the sub-classification.
    const classCb = element.querySelector<HTMLInputElement>('[data-ms-field="professionID"] input[type="checkbox"]')!;
    classCb.checked = true;
    classCb.dispatchEvent(new window.Event('change', { bubbles: true }));
    expect(subBox.classList.contains('subcategory-disabled')).toBe(false);

    // Pick a sub-classification.
    const subCb = element.querySelector<HTMLInputElement>('[data-ms-field="roleID"] input[type="checkbox"]')!;
    expect(subCb).not.toBeNull();
    subCb.checked = true;
    subCb.dispatchEvent(new window.Event('change', { bubbles: true }));
    expect(element.querySelector('[data-ms-field="roleID"] .ms-count')?.textContent).toBe('1 selected');

    // Clearing the classification resets the sub-classification and re-locks it.
    classCb.checked = false;
    classCb.dispatchEvent(new window.Event('change', { bubbles: true }));
    expect(element.querySelector('[data-ms-field="roleID"] .ms-count')).toBeNull();
    expect(subBox.classList.contains('subcategory-disabled')).toBe(true);
  });
});

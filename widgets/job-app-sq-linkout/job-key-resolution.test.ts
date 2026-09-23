// A live job showed "no longer available" because the brochure page links with the
// jobURL slug under a lowercase ?jobId=, while the row endpoint only answers to the
// jobID GUID. Text-matching the fix would pass on a regex that never runs, so this
// extracts the real jobKey/getJobID/jobRow and the real destination expression from
// legacy.js and exercises them against the shape the collection actually returns.

import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it, expect } from 'vitest';

const here = dirname(fileURLToPath(import.meta.url));
const src = readFileSync(join(here, 'legacy.js'), 'utf8');

const SITE = { siteID: 'site-1' };
const GUID = 'd7d86bf2-ff1c-4988-8471-e28a2fe34a90';
const SLUG = 'team-leader-asset-strategy-in-government-nfp-jobs-1443119';
const ROW = {
  data: {
    jobID: GUID,
    jobName: 'Team Leader Asset Strategy',
    jobURL: `https://www.capstonerecruitment.com.au/job-details/${SLUG}`,
    applicationURL: null,
    customField2: 'https://75ad0735.flowpaper.com/CityofLauncestonCandidateBrochure/',
  },
};

function endOfBlock(from: number) {
  let depth = 0;
  for (let i = src.indexOf('{', from); i < src.length; i++) {
    if (src[i] === '{') depth++;
    else if (src[i] === '}' && --depth === 0) return i + 1;
  }
  throw new Error('unbalanced');
}

function loadResolver(href: string, config: Record<string, unknown> = {}, store: Record<string, string> = {}) {
  const start = src.indexOf('const JOB_GUID_RE');
  const end = endOfBlock(src.indexOf('function jobRow(){'));
  expect(start).toBeGreaterThan(-1);

  const fetches: { path: string }[] = [];
  const shazamme = {
    site: () => Promise.resolve(SITE),
    fetch: (o: { path: string }) => {
      fetches.push(o);
      if (o.path === `/job-results/${SITE.siteID}/${GUID}`) return Promise.resolve(ROW);
      if (o.path === `/job-results/${SITE.siteID}`) return Promise.resolve([{ data: { jobID: 'other', jobURL: 'https://x/job-details/other-job-1' } }, ROW]);
      return Promise.reject(new Error('500'));
    },
    store: (k: string, v?: string | null) => {
      if (v === undefined) return store[k] ?? null;
      if (v === null) delete store[k];
      else store[k] = v;
      return v;
    },
  };

  const make = new Function(
    'data', 'window', 'shazamme', 'URL',
    `${src.slice(start, end)}; return { jobKey, getJobID, jobRow };`,
  );

  return { ...make({ config, inEditor: false }, { location: { href } }, shazamme, URL), fetches, store, shazamme };
}

describe('job key resolution', () => {
  it('reads ?jobId= regardless of case — the brochure page uses a lowercase d', () => {
    expect(loadResolver(`https://site/form?jobId=${SLUG}`).jobKey()).toBe(SLUG);
    expect(loadResolver(`https://site/form?JOBID=${SLUG}`).jobKey()).toBe(SLUG);
    expect(loadResolver(`https://site/form?jobID=${GUID}`).jobKey()).toBe(GUID);
  });

  it('resolves a slug to the job row via the collection', async () => {
    const r = loadResolver(`https://site/form?jobId=${SLUG}`);
    const j = await r.jobRow();

    expect(j?.data?.jobID).toBe(GUID);
    expect(r.fetches.map((f: { path: string }) => f.path)).toEqual([`/job-results/${SITE.siteID}`]);
  });

  it('records the application against the real jobID, not the slug', async () => {
    const r = loadResolver(`https://site/form?jobId=${SLUG}`);

    expect(r.getJobID()).toBe(SLUG);
    await r.jobRow();
    expect(r.getJobID()).toBe(GUID);
    expect(r.store.jobID).toBe(GUID);
    expect(JSON.parse(r.store.currentJobViewed).data.jobID).toBe(GUID);
  });

  it('fetches the single row directly when the key is already a GUID', async () => {
    const r = loadResolver(`https://site/form?jobID=${GUID}`);
    await r.jobRow();

    expect(r.fetches.map((f: { path: string }) => f.path)).toEqual([`/job-results/${SITE.siteID}/${GUID}`]);
  });

  it('matches a slug carrying a trailing slash or a full URL', async () => {
    for (const key of [`${SLUG}/`, `https://www.capstonerecruitment.com.au/job-details/${SLUG}`]) {
      const j = await loadResolver(`https://site/form?jobId=${encodeURIComponent(key)}`).jobRow();
      expect(j?.data?.jobID, key).toBe(GUID);
    }
  });

  it('falls back to the widget setting and the stored jobID', async () => {
    expect(loadResolver('https://site/form', { useSingleJob: true, jobID: GUID }).jobKey()).toBe(GUID);
    expect(loadResolver('https://site/form', {}, { jobID: GUID }).jobKey()).toBe(GUID);
  });

  it('resolves to null for an unknown job instead of throwing', async () => {
    await expect(loadResolver('https://site/form?jobId=no-such-job').jobRow()).resolves.toBeNull();
    await expect(loadResolver('https://site/form').jobRow()).resolves.toBeNull();
  });

  it('fetches once per page no matter how many callers ask', async () => {
    const r = loadResolver(`https://site/form?jobId=${SLUG}`);
    await Promise.all([r.jobRow(), r.jobRow(), r.jobRow()]);

    expect(r.fetches).toHaveLength(1);
  });
});

describe('redirect destination', () => {
  // The real expression from apply(), so a reordering of the fallback chain fails here.
  const END = "].find( v => typeof v === 'string' && v.length > 0 );";
  const expr = src.slice(src.indexOf('let linkoutUrl = ['), src.indexOf(END) + END.length);
  const pick = new Function('data', 'jobData', `${expr}; return linkoutUrl;`) as
    (d: unknown, j: Record<string, unknown>) => string | undefined;

  const cfg = (o = {}) => ({ config: o });

  it('sends the candidate to the job brochure', () => {
    expect(pick(cfg(), ROW.data)).toBe(ROW.data.customField2);
  });

  it('prefers the brochure over an external apply URL', () => {
    expect(pick(cfg(), { ...ROW.data, applicationURL: 'https://ats.example/apply' })).toBe(ROW.data.customField2);
  });

  it('falls back to the external apply URL when there is no brochure', () => {
    expect(pick(cfg(), { ...ROW.data, customField2: null, applicationURL: 'https://ats.example/apply' }))
      .toBe('https://ats.example/apply');
  });

  it('leaves the thank-you page in play when the job has neither', () => {
    expect(pick(cfg(), { ...ROW.data, customField2: null })).toBeUndefined();
  });

  it('takes the brochure field name from settings when a site uses a different one', () => {
    expect(pick(cfg({ brochureField: 'customField4' }), { ...ROW.data, customField4: 'https://b/roch' }))
      .toBe('https://b/roch');
  });
});

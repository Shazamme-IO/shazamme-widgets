import { describe, it, expect } from 'vitest';
import type { SiteJob } from '../../core/site-jobs';
import { activeFilterCount, buildFacets, filterJobs, pageList, readAddress, searchBoard, sortJobs, toCard, valueOf, visibleJobs, writeAddress, type State } from './board';
import { GROUP_IDS, type GroupId } from './settings';
import { parseGroups, readSettings } from './settings';

const job = (n: number, f: Record<string, unknown>): SiteJob => ({ pageItemUrl: `role-${n}`, fields: { jobName: `Job ${n}`, addedOnUTC: `2026-11-${String(10 + n).padStart(2, '0')}T00:00:00`, ...f } });

const JOBS: SiteJob[] = [
  job(1, { category: 'Finance', workType: 'Permanent', workModel: 'Hybrid', city: 'Sydney', state: 'NSW', country: 'Australia', salaryFrom: '150000', salaryTo: '170000', salaryText: '+ super', currencyCode: 'AUD', salaryType: 'Annual', shortDescription: 'Lead the finance team' }),
  job(2, { category: 'Finance', workType: 'Contract', workModel: 'Onsite', city: 'Brisbane', state: 'QLD', country: 'Australia', salaryFrom: '55', salaryTo: '65', salaryText: 'per hour + super', currencyCode: 'AUD', salaryType: 'Hourly' }),
  job(3, { category: 'IT & Telecomms', workType: 'Permanent', workModel: 'Remote', city: 'London', country: 'United Kingdom', salaryFrom: '70000', salaryTo: '85000', currencyCode: 'GBP', salaryType: 'Annual', jobName: 'Cloud Engineer' }),
  job(4, { category: 'IT & Telecomms', workType: 'Contract', workModel: 'Remote', city: 'Melbourne', state: 'VIC', country: 'Australia', salaryFrom: null, salaryTo: null }),
  job(5, { category: 'Mining', workType: 'Permanent', workModel: 'Onsite', city: 'Perth', state: 'WA', country: 'Australia', salaryFrom: '180000', salaryTo: '210000', currencyCode: 'AUD', salaryType: 'Annual' }),
];

const base = (over: Partial<State> = {}): State => ({ keyword: '', location: '', selected: {}, sort: 'newest', page: 1, ...over });
const names = (list: SiteJob[]) => list.map((j) => j.fields.jobName);
const s = readSettings({});

describe('filterJobs', () => {
  it('matches every keyword word across title, profession and summary, ignoring case', () => {
    expect(names(filterJobs(JOBS, base({ keyword: 'finance lead' })))).toEqual(['Job 1']);
    expect(names(filterJobs(JOBS, base({ keyword: 'CLOUD' })))).toEqual(['Cloud Engineer']);
  });

  it('matches the location against city, state and country', () => {
    expect(names(filterJobs(JOBS, base({ location: 'qld' })))).toEqual(['Job 2']);
    expect(filterJobs(JOBS, base({ location: 'australia' }))).toHaveLength(4);
  });

  it('ORs values inside a group and ANDs the groups', () => {
    const picked = filterJobs(JOBS, base({ selected: { profession: ['Finance', 'Mining'], workType: ['Permanent'] } }));
    expect(names(picked)).toEqual(['Job 1', 'Job 5']);
  });
});

describe('buildFacets', () => {
  it('counts each option against the other active filters, not its own group', () => {
    const facets = buildFacets(JOBS, base({ selected: { workType: ['Contract'] } }), parseGroups('profession, workType', {}));
    const prof = facets.find((f) => f.id === 'profession')!;
    expect(prof.options.map((o) => [o.value, o.count])).toEqual([['Finance', 1], ['IT & Telecomms', 1], ['Mining', 0]]);
    const wt = facets.find((f) => f.id === 'workType')!;
    expect(wt.options.map((o) => [o.value, o.count, o.checked])).toEqual([['Permanent', 3, false], ['Contract', 2, true]]);
  });

  it('keeps a picked value no job has, so it can be unticked, and drops empty groups', () => {
    const facets = buildFacets(JOBS, base({ selected: { workType: ['Casual'] } }), parseGroups('workType, role', {}));
    expect(facets.map((f) => f.id)).toEqual(['workType']);
    expect(facets[0].options.find((o) => o.value === 'Casual')).toEqual({ value: 'Casual', count: 0, checked: true });
  });

  it('lists the most common values first, then A to Z', () => {
    const city = buildFacets(JOBS, base(), parseGroups('country', {}))[0];
    expect(city.options.map((o) => o.value)).toEqual(['Australia', 'United Kingdom']);
  });
});

describe('sortJobs', () => {
  it('sorts newest first by date added', () => {
    expect(names(sortJobs(JOBS, 'newest'))[0]).toBe('Job 5');
  });

  it('sorts by yearly pay, hourly pay annualised, jobs with no salary last either way', () => {
    expect(names(sortJobs(JOBS, 'salary-high'))).toEqual(['Job 5', 'Job 1', 'Job 2', 'Cloud Engineer', 'Job 4']);
    expect(names(sortJobs(JOBS, 'salary-low'))).toEqual(['Cloud Engineer', 'Job 2', 'Job 1', 'Job 5', 'Job 4']);
  });
});

describe('paging', () => {
  it('shows one page, or everything so far with load more, and clamps a page past the end', () => {
    expect(visibleJobs(JOBS, base({ page: 2 }), { pageSize: 2, paging: 'pages' })).toHaveLength(2);
    expect(visibleJobs(JOBS, base({ page: 2 }), { pageSize: 2, paging: 'loadmore' })).toHaveLength(4);
    expect(names(visibleJobs(JOBS, base({ page: 99 }), { pageSize: 2, paging: 'pages' }))).toEqual(['Job 5']);
  });

  it('lists page numbers with gaps', () => {
    expect(pageList(1, 5)).toEqual([1, 2, 3, 4, 5]);
    expect(pageList(6, 12)).toEqual([1, '…', 5, 6, 7, '…', 12]);
    expect(pageList(1, 12)).toEqual([1, 2, '…', 12]);
  });
});

describe('toCard', () => {
  it('writes the salary with its wording, the location and the work type', () => {
    expect(toCard(JOBS[0], s)).toEqual({ label: 'Finance', title: 'Job 1', pay: '$150,000 – $170,000 + super', where: 'Sydney, NSW', workType: 'Permanent', workModel: '', href: '/job-details/role-1' });
  });

  it('says Competitive when there is no salary, and follows the card settings', () => {
    const card = toCard(JOBS[3], readSettings({ cardLabel: 'none', noSalaryText: 'Negotiable', locationFormat: 'city-country', showWorkType: 'false', showWorkModel: 'true', detailsPage: '/jobs/' }));
    expect(card).toMatchObject({ label: '', pay: 'Negotiable', where: 'Melbourne, Australia', workType: '', workModel: 'Remote', href: '/jobs/role-4' });
    expect(toCard(JOBS[3], s).pay).toBe('Competitive');
  });

  it('encodes the job address once, even when the feed already encoded it', () => {
    const c = toCard({ pageItemUrl: 'site-manager-%E2%80%93-perth', fields: { jobName: 'x' } }, s);
    expect(c.href).toBe('/job-details/site-manager-%E2%80%93-perth');
  });
});

describe('page address', () => {
  it('reads what Job Search Hero sends and repeated filter values', () => {
    const st = readAddress('?keyword=nurse&location=Perth&workType=Permanent&profession=Finance&profession=Mining&sort=salary-high&page=2', '', 'newest');
    expect(st).toEqual({ keyword: 'nurse', location: 'Perth', selected: { workType: ['Permanent'], profession: ['Finance', 'Mining'] }, sort: 'salary-high', page: 2 });
  });

  it('reads the keyword from the legacy Job Search hash and ignores junk', () => {
    expect(readAddress('', `#${encodeURIComponent(JSON.stringify({ facets: {}, keyword: 'driver' }))}`, 'newest').keyword).toBe('driver');
    expect(readAddress('?sort=bogus&page=-3', '#top', 'newest')).toMatchObject({ keyword: '', sort: 'newest', page: 1 });
  });

  it('round-trips a value that contains a bar or an ampersand', () => {
    const url = writeAddress('', base({ selected: { profession: ['Sales | Marketing', 'Accounting & Finance'] } }), 'newest');
    expect(readAddress(url, '', 'newest').selected).toEqual({ profession: ['Sales | Marketing', 'Accounting & Finance'] });
  });

  it('writes only what differs from the defaults and keeps other parameters', () => {
    const url = writeAddress('?preview=true&keyword=old', base({ keyword: 'data', selected: { city: ['Sydney', 'Perth'] }, page: 3 }), 'newest');
    expect(url).toBe('?preview=true&keyword=data&city=Sydney&city=Perth&page=3');
    expect(writeAddress('?keyword=x', base(), 'newest')).toBe('');
    expect(readAddress(url, '', 'newest')).toMatchObject({ keyword: 'data', selected: { city: ['Sydney', 'Perth'] }, page: 3 });
  });

  it('counts active filters', () => {
    expect(activeFilterCount(base({ selected: { city: ['a', 'b'], workType: ['c'] } }))).toBe(3);
  });
});

describe('settings', () => {
  it('reads groups in the given order, drops unknown names and repeats, and uses custom names', () => {
    expect(parseGroups('city, Profession, bogus, city', { labelCity: 'Town' })).toEqual([{ id: 'city', label: 'Town' }, { id: 'profession', label: 'Profession' }]);
    expect(parseGroups('', {})).toEqual([]);
    expect(parseGroups(undefined, {}).map((g) => g.id)).toEqual(['profession', 'workType', 'workModel', 'country', 'city']);
  });

  it('coerces strings, clamps numbers and rejects unknown dropdown values', () => {
    const r = readSettings({ pageSize: '500', optionsShown: 'x', paging: 'infinite', defaultSort: 'SALARY-HIGH', showSearch: 'false', detailsPage: 'javascript:alert(1)', searchOverlap: '-20' });
    expect(r).toMatchObject({ pageSize: 60, optionsShown: 8, paging: 'pages', defaultSort: 'salary-high', showSearch: false, detailsPage: '/job-details', searchOverlap: 0 });
  });

  it('a cleared collection name reads the feed; an untouched one reads Jobs', () => {
    expect(readSettings({}).jobsCollection).toBe('Jobs');
    expect(readSettings({ jobsCollection: '  ' }).jobsCollection).toBe('');
  });
});

// A pseudo-random board of n jobs (fixed seed), for the perf test and the brute-force facet check.
function bigBoard(n: number): SiteJob[] {
  let seed = 7;
  const rnd = (k: number) => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed % k; };
  const pickOf = <T,>(list: readonly T[]) => list[rnd(list.length)];
  return Array.from({ length: n }, (_, i) => job(i, {
    jobName: `${pickOf(['Senior', 'Junior', 'Lead', 'Principal'])} ${pickOf(['Accountant', 'Engineer', 'Nurse', 'Driver', 'Analyst'])}`,
    category: pickOf(['Finance', 'IT & Telecomms', 'Mining', 'Healthcare', 'Logistics', 'Café & Hospitality']),
    subCategory: pickOf(['Payroll', 'Cloud', 'Surface', 'Aged care', 'Warehouse']),
    workType: pickOf(['Permanent', 'Contract', 'Casual']),
    workModel: pickOf(['Hybrid', 'Remote', 'Onsite']),
    city: pickOf(['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide', 'Hobart', 'Darwin', 'Canberra']),
    state: pickOf(['NSW', 'VIC', 'QLD', 'WA', 'SA']),
    country: pickOf(['Australia', 'New Zealand']),
    shortDescription: 'A role with a great team and real growth',
  }));
}

describe('review fix #4: facets in one pass', () => {
  const groups = parseGroups(GROUP_IDS.join(', '), {});
  const fold = (v: string) => v.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '');

  /** The old O(groups x jobs) way: refilter every job for every group. */
  function naiveCount(jobs: SiteJob[], state: State, id: GroupId): Map<string, number> {
    const out = new Map<string, number>();
    for (const j of filterJobs(jobs, { ...state, selected: { ...state.selected, [id]: [] } })) {
      const k = fold(valueOf(j, id));
      if (k) out.set(k, (out.get(k) ?? 0) + 1);
    }
    return out;
  }

  it('counts every option exactly as refiltering per group would', () => {
    const jobs = bigBoard(400);
    const states: State[] = [
      base(),
      base({ keyword: 'engineer' }),
      base({ selected: { workType: ['Contract'], city: ['Perth', 'Hobart'] } }),
      base({ keyword: 'senior', location: 'nsw', selected: { profession: ['Finance', 'Mining'], workModel: ['Remote'], country: ['Australia'] } }),
      base({ selected: { profession: ['Cafe & Hospitality'] } }),
    ];
    for (const st of states) {
      const { facets, matched } = searchBoard(jobs, st, groups);
      expect(matched).toEqual(filterJobs(jobs, st));
      for (const f of facets) {
        const want = naiveCount(jobs, st, f.id);
        for (const o of f.options) expect(o.count, `${f.id}=${o.value}`).toBe(want.get(fold(o.value)) ?? 0);
      }
    }
  });

  it('works out a 2,000-job board with seven groups and filters on in well under the time bound', () => {
    const jobs = bigBoard(2000);
    const st = base({ keyword: 'lead', location: 'australia', selected: { workType: ['Permanent', 'Contract'], city: ['Sydney', 'Perth'], profession: ['Finance', 'Mining', 'Healthcare'] } });
    const t0 = performance.now();
    searchBoard(jobs, st, groups);
    const first = performance.now() - t0;
    const t1 = performance.now();
    for (let i = 0; i < 20; i += 1) searchBoard(jobs, { ...st, page: i }, groups);
    const perRender = (performance.now() - t1) / 20;
    expect(first).toBeLessThan(500);
    expect(perRender).toBeLessThan(50);
  });
});

describe('review fix #7: address filters for hidden groups', () => {
  it('reads only the groups it is given', () => {
    const st = readAddress('?city=Perth&workType=Contract&profession=Finance', '', 'newest', ['workType']);
    expect(st.selected).toEqual({ workType: ['Contract'] });
    expect(readAddress('?city=Perth', '', 'newest', []).selected).toEqual({});
  });
});

describe('review fix #9: job links stay on the site', () => {
  it('keeps protocol-relative, javascript: and dot-segment addresses under the details page', () => {
    const href = (pageItemUrl: string) => toCard({ pageItemUrl, fields: { jobName: 'x' } }, s).href;
    expect(href('//evil.com')).toBe('/job-details/evil.com');
    expect(href('javascript:alert(1)')).toBe('/job-details/javascript%3Aalert(1)');
    expect(href('\\\\evil.com')).toBe('/job-details/evil.com');
    expect(href('../../admin')).toBe('/job-details/admin');
    expect(href('%2e%2e/%2E%2E/admin')).toBe('/job-details/admin');
    expect(href('a/%2F%2Fevil.com')).toBe('/job-details/a/%2F%2Fevil.com');
    for (const u of ['//evil.com', 'javascript:alert(1)', '\\\\evil.com', '../../admin', 'https://evil.com/x']) {
      const url = new URL(href(u), 'https://site.example/jobs');
      expect(url.origin, u).toBe('https://site.example');
      expect(url.pathname.startsWith('/job-details/'), u).toBe(true);
    }
  });
});

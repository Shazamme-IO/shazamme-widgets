// Test harness: runs the real legacy.js in jsdom against a stub SDK and a fixed job list.
// Fleet safety guard: Job Feed 2026 is on hundreds of live sites. The chip card is opt-in
// (cardStyle = "chips"), so with the setting absent, blank or "standard" the cards the widget
// draws must be byte-for-byte what they were before the chip card existed. The golden files in
// __golden__ were generated from the untouched legacy.js before the chip card was added.

import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const here = dirname(fileURLToPath(import.meta.url));
const src = readFileSync(join(here, 'legacy.js'), 'utf8');
const $ = createRequire(import.meta.url)('jquery') as Record<string, unknown>;
$.getScript = (_url: string, ok: () => void) => ok();

export type Job = { data: Record<string, unknown> };
export const JOBS: Job[] = [
  { data: { jobID: 'j1', jobName: 'Financial Controller', category: 'Accounting & Finance', subCategory: 'Controller', city: 'Sydney', state: 'NSW', country: 'Australia', workType: 'Permanent', workModel: 'Hybrid', salaryText: '$150,000 – $170,000 + super', salaryFrom: '150000', salaryTo: '170000', currencyCode: 'AUD', currencySymbol: '$', salaryType: 'Annual', shortDescription: 'Lead finance.', changedOnUTC: '2026-01-01T00:00:00', postedDate: '01-Jan-2026', jobURL: 'https://x.example/job-details/financial-controller-1' } },
  { data: { jobID: 'j2', jobName: 'Payroll Officer <b>', category: 'Accounting & Finance', city: 'Brisbane', state: 'QLD', country: 'Australia', workType: 'Contract', workModel: 'Onsite', salaryText: '', changedOnUTC: '2026-01-02T00:00:00', jobURL: 'https://x.example/job-details/payroll-officer-2' } },
  { data: { jobID: 'j3', jobName: 'Analyst', city: '', workType: '', workModel: '', changedOnUTC: '2026-01-03T00:00:00', jobURL: 'https://x.example/job-details/analyst-3' } },
];

const BASE = {
  useDudaJobCollection: true, jobLimit: '10', useSlides: false, toggleJobLinkButtonA: true, togglejobLinkButtonsAll: true,
  btnTextJobLinkA: 'Read More', jobNameOrder: '2', toggleLocationAll: true, toggleLocationCity: true, toggleLocationState: true,
  LocationAllOrder: '5', toggleJobTypesWorkModel: true, toggleWorkType: true, toggleWorkModel: true, JobTypesWorkModelOrder: '6',
  toggleSalaryAll: true, toggleSalaryText: true, salaryAllOrder: '7', showSalaryCurrencySymbol: true, jobLinkButtonOrder: '15',
  toggleCategorySubCategory: true, toggleJobCategory: true, CategorySubCategoryOrder: '3',
};
export const CONFIGS: Record<string, Record<string, unknown>> = {
  'live-like': BASE,
  'all-rows': { ...BASE, toggleShortDescription: true, shortDescriptionOrder: '10', toggleJobPostedDate: true, jobPostedDateOrder: '8', toggleVertTextRight: true, toggleVertWorkType: true, toggleVertWorkModel: true, toggleVertRightSeparator: true, vertTextRightSeparator: '•', toggleSalaryFromSalaryTo: true, toggleSalaryType: true, customBackground: 'profession-border', toggleShowShadow: true, overlayShadowColor: '#888888' },
};

const tick = () => new Promise((r) => setTimeout(r, 30));

export async function render(config: Record<string, unknown>, jobs: Job[] = JOBS): Promise<string> {
  document.body.innerHTML = '<div id="w"><div data-rel="content-main"></div></div>';
  const widget = { log: () => widget, sub: () => widget, pub: () => undefined };
  Object.assign(globalThis, {
    $,
    shazamme: {
      ready: () => Promise.resolve(),
      site: () => Promise.resolve({ siteID: 'site1' }),
      fetch: () => Promise.resolve(jobs.map((j) => ({ data: { ...j.data } }))),
      script: () => Promise.resolve(),
      style: () => Promise.resolve(),
      bag: () => ({}),
      register: () => widget,
    },
  });
  const data = { config, siteId: 'd1', inEditor: false, device: 'desktop' };
  new Function('element', 'data', src)(document.getElementById('w'), data);
  await tick();
  await tick();
  return (document.querySelector('[data-rel=content-main]') as HTMLElement).innerHTML.replace(/>\s+</g, '><').trim();
}


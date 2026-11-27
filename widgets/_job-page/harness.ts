// Test helpers shared by the job-page widgets: a fake SDK that serves a Jobs list.

import type { JobRow } from './job';

export const JOBS: Array<{ page_item_url: string; data: JobRow }> = [
  { page_item_url: 'financial-controller-in-accounting-finance-jobs-1', data: { jobID: 'job-1', jobName: 'Financial Controller', category: 'Accounting & Finance', subCategory: 'Controller', workType: 'Permanent', workModel: 'Hybrid', city: 'Sydney', state: 'NSW', country: 'Australia', salaryType: 'Annual', salaryFrom: '150000', salaryTo: '170000', salaryText: '$150,000 – $170,000 + super', currencyCode: 'AUD', referenceNumber: '236', jobURL: 'https://x.example/job-details/financial-controller-in-accounting-finance-jobs-1' } },
  { page_item_url: 'nurse-2', data: { jobID: 'job-2', jobName: '<img src=x onerror=alert(1)>', category: 'Health', workType: 'Contract', workModel: '', city: 'Perth', salaryText: '', salaryFrom: null, salaryTo: null, realSalaryFrom: -1, jobURL: 'https://x.example/job-details/nurse-2' } },
  { page_item_url: 'analyst-3', data: { jobID: 'job-3', jobName: 'Analyst', salaryFrom: '80000', salaryTo: '', currencyCode: 'GBP', jobURL: 'https://x.example/job-details/analyst-3' } },
];

export function fakeSdk(rows: unknown = JOBS) {
  const calls: Array<Record<string, unknown>> = [];
  return {
    calls,
    ready: () => Promise.resolve(),
    register: () => undefined,
    fetch: (o: Record<string, unknown>) => { calls.push(o); return Promise.resolve(rows); },
  };
}

export function mount(html: string): HTMLElement {
  document.body.innerHTML = `<div id="w">${html}</div>`;
  return document.getElementById('w') as HTMLElement;
}

export function useUrl(path: string): void {
  window.history.replaceState({}, '', path);
}

export function resetPage(): void {
  (window as unknown as { __shmJobRows?: unknown }).__shmJobRows = undefined;
  useUrl('/');
}

export function resetRows(): void {
  (window as unknown as { __shmJobRows?: unknown }).__shmJobRows = undefined;
}

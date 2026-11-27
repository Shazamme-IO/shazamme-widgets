// @vitest-environment jsdom
// The opt-in chip card (cardStyle = "chips"): content, escaping, per-row toggles and the slide hook.

import { describe, expect, it } from 'vitest';
import { render, CONFIGS } from './harness';

const cfg = (over: Record<string, unknown> = {}) => ({ ...CONFIGS['live-like'], cardStyle: 'chips', ...over });
const cards = (html: string) => { const d = document.createElement('div'); d.innerHTML = html; return Array.from(d.querySelectorAll('.shm-cc-slide')); };

describe('job-feed-2026 chip card', () => {
  it('draws title, location, both chips and the pay line, and keeps the slide hook', async () => {
    const [first] = cards(await render(cfg()));
    expect(first.getAttribute('data-rel')).toBe('entry-job');
    expect(first.querySelector('.shm-cc-title')?.textContent).toBe('Financial Controller');
    expect(first.querySelector('.shm-cc-where')?.textContent).toBe('Sydney, NSW');
    expect(first.querySelector('.shm-cc-chip-type')?.textContent).toBe('Permanent');
    expect(first.querySelector('.shm-cc-chip-model')?.textContent).toBe('Hybrid');
    expect(first.querySelector('.shm-cc-pay')?.textContent).toBe('$150,000 – $170,000 + super');
    expect(first.querySelector('a.shm-cc-card')?.getAttribute('href')).toContain('/job-details/financial-controller-1');
  });

  it('escapes job text and omits rows that have no value', async () => {
    const all = cards(await render(cfg()));
    expect(all[1].querySelector('.shm-cc-title')?.innerHTML).toBe('Payroll Officer &lt;b&gt;');
    expect(all[1].querySelector('.shm-cc-pay')).toBeNull();
    expect(all[2].querySelector('.shm-cc-where')).toBeNull();
    expect(all[2].querySelector('.shm-cc-chips')).toBeNull();
  });

  it('hides a row when its toggle is off and adds the country when asked', async () => {
    const off = cards(await render(cfg({ chipShowLocation: false, chipShowWorkType: 'false', chipShowSalary: false })))[0];
    expect(off.querySelector('.shm-cc-where')).toBeNull();
    expect(off.querySelector('.shm-cc-chip-type')).toBeNull();
    expect(off.querySelector('.shm-cc-chip-model')).not.toBeNull();
    expect(off.querySelector('.shm-cc-pay')).toBeNull();
    const withCountry = cards(await render(cfg({ chipShowCountry: true })))[0];
    expect(withCountry.querySelector('.shm-cc-where')?.textContent).toBe('Sydney, NSW, Australia');
  });

  it('falls back to the from and to amounts when there is no pay text', async () => {
    const job = { data: { jobID: 'j9', jobName: 'Nurse', city: 'Perth', state: 'WA', workType: 'Permanent', workModel: 'Onsite', salaryText: '', salaryFrom: '90000', salaryTo: '110000', realSalaryFrom: -1, currencyCode: 'AUD', changedOnUTC: '2026-01-01T00:00:00', jobURL: 'https://x.example/job-details/nurse-9' } };
    const pay = cards(await render(cfg(), [job]))[0].querySelector('.shm-cc-pay')?.textContent ?? '';
    expect(pay).toBe('$90,000 – $110,000');
  });
});

describe('job-feed-2026 chip card salary edge cases', () => {
  it('shows one figure when from and to are equal', async () => {
    const job = { data: { jobID: 'j7', jobName: 'Driver', workType: 'Casual', salaryText: '', salaryFrom: '60000', salaryTo: '60000', currencyCode: 'AUD', changedOnUTC: '2026-01-01T00:00:00', jobURL: 'https://x.example/job-details/driver-7' } };
    expect(cards(await render(cfg(), [job]))[0].querySelector('.shm-cc-pay')?.textContent).toBe('$60,000');
  });

  it('adds rel noopener only when the link opens a new tab', async () => {
    expect(cards(await render(cfg({ jobLinkButtonABlank: true })))[0].querySelector('a')?.getAttribute('rel')).toBe('noopener');
    expect(cards(await render(cfg()))[0].querySelector('a')?.hasAttribute('rel')).toBe(false);
  });

  it('treats the feed\'s -1 as no salary', async () => {
    const job = { data: { jobID: 'j8', jobName: 'Clerk', workType: 'Casual', salaryText: '', salaryFrom: null, salaryTo: null, realSalaryFrom: -1, realSalaryTo: -1, changedOnUTC: '2026-01-01T00:00:00', jobURL: 'https://x.example/job-details/clerk-8' } };
    expect(cards(await render(cfg(), [job]))[0].querySelector('.shm-cc-pay')).toBeNull();
  });
});

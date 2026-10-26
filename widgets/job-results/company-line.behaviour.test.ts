// @vitest-environment jsdom
// Runs the real _companyEl from legacy.js (not a text match) so the toggle, the
// field whitelist and the escaping are each proven to work.

import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it, expect } from 'vitest';

const here = dirname(fileURLToPath(import.meta.url));
const src = readFileSync(join(here, 'legacy.js'), 'utf8');

// The only jQuery the helper uses: $('<div>').text(s).html()
const $ = () => {
  const el = document.createElement('div');
  const api = {
    text(t: string) { el.textContent = t; return api; },
    html() { return el.innerHTML; },
  };
  return api;
};

function constant(name: string): string {
  const m = src.match(new RegExp(`const ${name} = (.+);`));
  expect(m, `${name} not found`).not.toBeNull();
  return m![1];
}

function extractCompanyEl(config: Record<string, unknown>): (j: Record<string, unknown>) => string {
  const start = src.indexOf('this._companyEl = (j) => {');
  expect(start, '_companyEl not found').toBeGreaterThan(-1);

  let depth = 0;
  let end = start;
  for (let i = src.indexOf('{', start); i < src.length; i++) {
    if (src[i] === '{') depth++;
    else if (src[i] === '}' && --depth === 0) { end = i + 1; break; }
  }
  const body = src.slice(src.indexOf('{', start), end);

  const make = new Function(
    'data',
    '$',
    `const CompanyFields = ${constant('CompanyFields')};
     const DefaultCompanyField = ${constant('DefaultCompanyField')};
     return (j) => ${body};`,
  ) as (d: unknown, jq: unknown) => (j: Record<string, unknown>) => string;

  return make({ config }, $);
}

const job = { customField6: 'Example & Co Foundation', customField3: 'Other Org', advertiserName: 'Example Agency' };

describe('job-results company line', () => {
  it('renders nothing when the toggle is off', () => {
    expect(extractCompanyEl({ companyField: 'customField6' })(job)).toBe('');
  });

  it('renders the chosen field when on', () => {
    expect(extractCompanyEl({ showCompany: true, companyField: 'customField3' })(job))
      .toBe('<div class="shmCompany">Other Org</div>');
  });

  it('defaults to customField6 when no field is picked', () => {
    expect(extractCompanyEl({ showCompany: true })(job))
      .toBe('<div class="shmCompany">Example &amp; Co Foundation</div>');
  });

  it('accepts advertiserName', () => {
    expect(extractCompanyEl({ showCompany: true, companyField: 'advertiserName' })(job))
      .toBe('<div class="shmCompany">Example Agency</div>');
  });

  it('ignores a field outside the whitelist and falls back to the default', () => {
    expect(extractCompanyEl({ showCompany: true, companyField: 'fullDescription' })({ ...job, fullDescription: 'x' }))
      .toBe('<div class="shmCompany">Example &amp; Co Foundation</div>');
    expect(extractCompanyEl({ showCompany: true, companyField: 'customField13' })(job))
      .toBe('<div class="shmCompany">Example &amp; Co Foundation</div>');
  });

  it('renders nothing when the field is empty, null or whitespace', () => {
    const on = extractCompanyEl({ showCompany: true, companyField: 'customField6' });
    expect(on({ customField6: null })).toBe('');
    expect(on({})).toBe('');
    expect(on({ customField6: '   ' })).toBe('');
  });

  it('renders nothing for a non-string value rather than [object Object]', () => {
    const on = extractCompanyEl({ showCompany: true, companyField: 'customField6' });
    expect(on({ customField6: { name: 'x' } })).toBe('');
    expect(on({ customField6: ['x'] })).toBe('');
  });

  it('escapes ATS text so it cannot inject markup', () => {
    expect(extractCompanyEl({ showCompany: true })({ customField6: '<img src=x onerror=alert(1)>' }))
      .toBe('<div class="shmCompany">&lt;img src=x onerror=alert(1)&gt;</div>');
  });

  it('is placed under the title in all three card layouts', () => {
    expect(src).toMatch(/class="shmJobtitle" data-rel="link-job-name">\$\{j\.jobName\}<\/a>\s*\$\{this\._companyEl\(j\)\}/);
    expect(src).toMatch(/class="jobResultTitle" data-rel="link-job-name">\$\{j\.jobName\}<\/a><\/div>\s*\$\{this\._companyEl\(j\)\}/);
    expect(src).toMatch(/<p class="job-title">.*<\/p>\s*\$\{this\._companyEl\(j\)\}/);
  });
});

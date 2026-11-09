// @vitest-environment jsdom
// job-schema was an inline Duda paste that re-parsed the JSON the HTML tab had
// interpolated: one newline in a description and JSON.parse threw, the catch swallowed
// it, and the page kept an unparseable JobPosting (Method Recruitment, 42 of 45 ads).
// Ported, the bundle builds the object from data.config and must emit valid JSON
// whatever the description holds, and only values Google accepts.

import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it, expect } from 'vitest';

const here = dirname(fileURLToPath(import.meta.url));
const VERSION = JSON.parse(readFileSync(join(here, '..', '..', 'package.json'), 'utf8')).version as string;
const BUNDLE = readFileSync(join(here, '..', '..', 'dist', 'job-schema', VERSION, 'widget.min.js'), 'utf8');

type Win = Record<string, any>;
type Config = Record<string, unknown>;

const JOB: Config = {
  jobTitle: 'Financial Operations Analyst ',
  Description: '<p>Receipting &amp; first chase</p><ul><li>Daily</li></ul>',
  worktype: 'Temp',
  datePosted: '2026-11-05T00:38:19.567',
  address: '1 Example Street',
  city: 'Cremorne',
  state: 'Victoria',
  country: 'Australia',
  salaryFrom: null,
  salaryTo: null,
  salaryType: null,
  currencyCode: 'AUD',
  jobID: 'e947a938-ad31-43eb-9969-2769d6b50cfb',
  advertiserName: 'Example Recruitment Bullhorn',
  advertiserImageURL: null,
  siteUri: 'https://www.example.com',
  category: 'Accounting & Finance',
};

// What the HTML tab leaves on the page before the bundle runs.
const STATIC_BLOCK = '<script class="jobSchema" type="application/ld+json">{"@type":"JobPosting","title":"static"}</script>';
const OLD_LABEL = '<div class="smSetUp" style="display:none">SCHEMA MARKUP ( This text will only show on the editor. )</div>';

function mount(config: Config, { inEditor = false, html = STATIC_BLOCK } = {}) {
  const win = window as unknown as Win;
  win.document.body.innerHTML = `<div id="widget">${html}</div>`;
  delete win.ShazammeWidget;
  win.eval(BUNDLE);
  const element = win.document.getElementById('widget')! as HTMLElement;
  win.ShazammeWidget['job-schema']({ element, data: { config, inEditor }, $: undefined, shazamme: undefined });
  return element;
}

const scriptText = (el: HTMLElement) => el.querySelector('script.jobSchema')!.textContent!;
const posting = (config: Config) => JSON.parse(scriptText(mount(config)));

describe('job-schema bundle: valid JSON from raw values', () => {
  it('emits a parseable JobPosting when the description holds newlines, quotes and backslashes', () => {
    const Description = '<p>Line one\nLine "two"\twith a \\ backslash</p>\r\n<p>Three</p>';
    const out = posting({ ...JOB, Description });
    expect(out['@type']).toBe('JobPosting');
    expect(out.description).toBe(Description);
  });

  it('sends the description as HTML, not entity-escaped text', () => {
    expect(posting(JOB).description).toBe('<p>Receipting &amp; first chase</p><ul><li>Daily</li></ul>');
  });

  it('cannot be closed early by a </script> inside the description', () => {
    const el = mount({ ...JOB, Description: '<p>a</p></script><script>alert(1)</script>' });
    expect(scriptText(el)).not.toContain('<');
    expect(JSON.parse(scriptText(el)).description).toBe('<p>a</p></script><script>alert(1)</script>');
  });

  it('trims the title', () => {
    expect(posting(JOB).title).toBe('Financial Operations Analyst');
  });

  it('replaces the block the HTML tab rendered rather than adding a second one', () => {
    const el = mount(JOB);
    expect(el.querySelectorAll('script[type="application/ld+json"]')).toHaveLength(1);
    expect(JSON.parse(scriptText(el)).title).toBe('Financial Operations Analyst');
  });

  it('creates the block when the HTML tab has none', () => {
    const el = mount(JOB, { html: '' });
    const scripts = el.querySelectorAll('script.jobSchema[type="application/ld+json"]');
    expect(scripts).toHaveLength(1);
    expect(JSON.parse(scripts[0].textContent!).title).toBe('Financial Operations Analyst');
  });

  it('leaves the HTML tab block alone when the page has no job', () => {
    const el = mount({ ...JOB, jobTitle: '  ' });
    expect(JSON.parse(scriptText(el)).title).toBe('static');
  });

  it('gives the same result when Duda runs it twice', () => {
    const el = mount(JOB);
    const first = scriptText(el);
    (window as unknown as Win).ShazammeWidget['job-schema']({ element: el, data: { config: JOB, inEditor: false } });
    expect(scriptText(el)).toBe(first);
    expect(el.querySelectorAll('script.jobSchema')).toHaveLength(1);
  });
});

describe('job-schema bundle: employmentType', () => {
  it.each([
    ['Full Time', 'FULL_TIME'],
    ['Part Time', 'PART_TIME'],
    ['Casual/Temp', 'TEMPORARY'],
    ['Contract', 'CONTRACTOR'],
    ['Internship', 'INTERN'],
    ['Volunteer', 'VOLUNTEER'],
    ['Temp', 'TEMPORARY'],
    ['Permanent', 'FULL_TIME'],
    ['Fixed Term', 'TEMPORARY'],
    ['Permanent Part Time', 'PART_TIME'],
    ['part-time', 'PART_TIME'],
    ['FULL_TIME', 'FULL_TIME'],
    ['Per Diem', 'PER_DIEM'],
    ['Locum', 'OTHER'],
    ['Internal', 'OTHER'],
  ])('%s -> %s', (worktype, expected) => {
    expect(posting({ ...JOB, worktype }).employmentType).toBe(expected);
  });

  it('lists every type a combined label names', () => {
    expect(posting({ ...JOB, worktype: 'Contract/Temp' }).employmentType).toEqual(['CONTRACTOR', 'TEMPORARY']);
    expect(posting({ ...JOB, worktype: 'Full Time / Part Time' }).employmentType).toEqual(['FULL_TIME', 'PART_TIME']);
  });

  it('is left out when the job has no work type', () => {
    expect(posting({ ...JOB, worktype: null })).not.toHaveProperty('employmentType');
  });
});

describe('job-schema bundle: baseSalary', () => {
  const paid = { ...JOB, salaryFrom: '80000', salaryTo: '95,000.50', salaryType: 'Annual', currencyCode: 'aud' };

  it('is left out when the job carries no salary', () => {
    expect(posting(JOB)).not.toHaveProperty('baseSalary');
    expect(posting({ ...JOB, salaryFrom: '0', salaryTo: '', salaryType: 'Annual' })).not.toHaveProperty('baseSalary');
  });

  it('sends a range as numbers with a Google unit', () => {
    expect(posting(paid).baseSalary).toEqual({
      '@type': 'MonetaryAmount',
      currency: 'AUD',
      value: { '@type': 'QuantitativeValue', unitText: 'YEAR', minValue: 80000, maxValue: 95000.5 },
    });
  });

  it('sends a single amount as value', () => {
    expect(posting({ ...paid, salaryTo: null }).baseSalary.value).toEqual({ '@type': 'QuantitativeValue', unitText: 'YEAR', value: 80000 });
    expect(posting({ ...paid, salaryTo: '80000' }).baseSalary.value.value).toBe(80000);
  });

  it.each([
    ['Hourly', 'HOUR'],
    ['Daily', 'DAY'],
    ['Per Day', 'DAY'],
    ['Weekly', 'WEEK'],
    ['Monthly', 'MONTH'],
    ['Yearly', 'YEAR'],
    ['Per Annum', 'YEAR'],
  ])('unit %s -> %s', (salaryType, unit) => {
    expect(posting({ ...paid, salaryType }).baseSalary.value.unitText).toBe(unit);
  });

  it('is left out when the unit, the currency or the number is not usable', () => {
    expect(posting({ ...paid, salaryType: 'Fortnightly' })).not.toHaveProperty('baseSalary');
    expect(posting({ ...paid, salaryType: null })).not.toHaveProperty('baseSalary');
    expect(posting({ ...paid, currencyCode: null })).not.toHaveProperty('baseSalary');
    expect(posting({ ...paid, salaryFrom: 'Negotiable', salaryTo: null })).not.toHaveProperty('baseSalary');
  });
});

describe('job-schema bundle: organisation, dates and address', () => {
  it('uses the advertiser name and drops an empty logo', () => {
    const out = posting(JOB);
    expect(out.hiringOrganization).toEqual({ '@type': 'Organization', name: 'Example Recruitment Bullhorn', sameAs: 'https://www.example.com' });
    expect(out.identifier).toEqual({ '@type': 'PropertyValue', name: 'Example Recruitment Bullhorn', value: JOB.jobID });
  });

  it('prefers the optional company name and logo inputs', () => {
    const out = posting({ ...JOB, companyName: 'Example Recruitment', companyLogo: 'https://cdn.example.com/logo.png', advertiserImageURL: 'https://cdn.example.com/advertiser.png' });
    expect(out.hiringOrganization.name).toBe('Example Recruitment');
    expect(out.hiringOrganization.logo).toBe('https://cdn.example.com/logo.png');
    expect(out.identifier.name).toBe('Example Recruitment');
  });

  it('falls back to the advertiser logo and ignores a value that is not a URL', () => {
    expect(posting({ ...JOB, advertiserImageURL: 'https://cdn.example.com/advertiser.png' }).hiringOrganization.logo).toBe('https://cdn.example.com/advertiser.png');
    expect(posting({ ...JOB, advertiserImageURL: 'null' }).hiringOrganization).not.toHaveProperty('logo');
  });

  it('keeps only the date of datePosted', () => {
    expect(posting(JOB).datePosted).toBe('2026-11-05');
  });

  it('adds validThrough only for an ISO date', () => {
    expect(posting(JOB)).not.toHaveProperty('validThrough');
    expect(posting({ ...JOB, validThrough: '2026-12-01T00:00:00' }).validThrough).toBe('2026-12-01T00:00:00');
    expect(posting({ ...JOB, validThrough: '01-Dec-2026' })).not.toHaveProperty('validThrough');
  });

  it('sends region, postcode and a two-letter country', () => {
    expect(posting({ ...JOB, postalCode: 3121 }).jobLocation).toEqual({
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        streetAddress: '1 Example Street',
        addressLocality: 'Cremorne',
        addressRegion: 'Victoria',
        postalCode: '3121',
        addressCountry: 'AU',
      },
    });
  });

  it.each(['NA', 'N/A', '.', 'a', ' ', 'TBC'])('leaves out the filler street address "%s"', (address) => {
    expect(posting({ ...JOB, address }).jobLocation.address).not.toHaveProperty('streetAddress');
  });

  it('trims the trailing comma recruiters leave on address parts', () => {
    const { address } = posting({ ...JOB, address: '40 Market St, ', city: 'South Melbourne,', state: 'Victoria ,' }).jobLocation;
    expect(address.streetAddress).toBe('40 Market St');
    expect(address.addressLocality).toBe('South Melbourne');
    expect(address.addressRegion).toBe('Victoria');
  });

  it.each([
    ['united kingdom', 'GB'],
    ['USA', 'US'],
    ['nz', 'NZ'],
    ['Atlantis', 'Atlantis'],
  ])('country %s -> %s', (country, expected) => {
    expect(posting({ ...JOB, country }).jobLocation.address.addressCountry).toBe(expected);
  });

  it('leaves industry out, as the inline version did', () => {
    expect(posting(JOB)).not.toHaveProperty('industry');
  });
});

describe('job-schema bundle: editor label', () => {
  it('is not on a live page', () => {
    expect(mount(JOB).querySelector('.smSetUp')).toBeNull();
  });

  it('is added and visible in the editor', () => {
    const label = mount(JOB, { inEditor: true }).querySelector('.smSetUp') as HTMLElement;
    expect(label.textContent).toContain('SCHEMA MARKUP');
    expect(label.style.display).toBe('block');
  });

  it('reuses the label an older HTML tab still renders, and never adds a second', () => {
    const el = mount(JOB, { inEditor: true, html: OLD_LABEL + STATIC_BLOCK });
    (window as unknown as Win).ShazammeWidget['job-schema']({ element: el, data: { config: JOB, inEditor: true } });
    const labels = el.querySelectorAll('.smSetUp');
    expect(labels).toHaveLength(1);
    expect((labels[0] as HTMLElement).style.display).toBe('block');
  });

  it('shows in the editor even when the page has no job', () => {
    expect(mount({}, { inEditor: true }).querySelector('.smSetUp')).not.toBeNull();
  });
});

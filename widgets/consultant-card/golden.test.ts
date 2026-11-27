// @vitest-environment jsdom
// Golden test: with only the settings v0.1.65 knew about, the new bundle must draw exactly
// what the v0.1.65 bundle drew, byte for byte. fixtures/v0.1.65.widget.min.js is that
// bundle as tagged (git show v0.1.65:dist/consultant-card/0.1.0/widget.min.js). Both run in
// the same jsdom against the same fake SDK and data, and the whole widget HTML is compared:
// root classes, the column variables, and every card.

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const here = dirname(fileURLToPath(import.meta.url));
const VERSION = JSON.parse(readFileSync(join(here, '..', '..', 'package.json'), 'utf8')).version as string;
const OLD = readFileSync(join(here, 'fixtures', 'v0.1.65.widget.min.js'), 'utf8');
const NEW = readFileSync(join(here, '..', '..', 'dist', 'consultant-card', VERSION, 'widget.min.js'), 'utf8');
const SHELL = readFileSync(join(here, 'content.hbs'), 'utf8');
const DEMO2 = JSON.parse(readFileSync(join(here, 'fixtures', 'demo2-consultants.json'), 'utf8')) as { data: Record<string, unknown> }[];

type Win = Record<string, any>;
type Widget = (ctx: Record<string, unknown>) => Promise<void>;
const win = window as unknown as Win;

function load(bundle: string): Widget {
  delete win.ShazammeWidget?.['consultant-card'];
  win.eval(bundle.replace('"use strict";', ''));
  return win.ShazammeWidget['consultant-card'] as Widget;
}
const oldWidget = load(OLD);
const newWidget = load(NEW);

const row = (data: Record<string, unknown>) => ({ data });
const SYNTHETIC = [
  row({ consultantID: 'a', firstName: 'Priya', lastName: 'Shah', positionTitle: 'Senior Consultant, Finance', eMail: 'priya@example.com', phone: '+61 2 0000 0000', mobile: '0400 000 000', consultantURL: 'https://demo.example.com/consultant/priya-shah', photoURL: 'https://cdn.example.com/p.jpg', linkedInURL: 'https://www.linkedin.com/in/example', isVisible: true, sortOrder: 2, classification: 'Finance' }),
  row({ consultantID: 'b', firstName: 'Tom', lastName: 'Reilly', positionTitle: 'Consultant, Technology', eMail: 'tom@example.com', phone: '', mobile: '0411 111 111', consultantURL: 'https://demo.example.com/consultant/tom-reilly', isVisible: true, sortOrder: 1, classification: 'Technology' }),
  row({ consultantID: 'c', firstName: 'Ana', lastName: 'Costa', positionTitle: '<b>Lead</b> &amp; Partner', eMail: 'ana@example.com', consultantURL: '/consultant/ana-costa', isVisible: 'true', sortOrder: 3, shortDescription: '<p>Ana leads legal.</p>' }),
  row({ consultantID: 'd', firstName: 'Hidden', lastName: 'Person', isVisible: false, sortOrder: 0 }),
];
const job = (data: Record<string, unknown>) => ({ data: { activeStatus: true, contactEmail: '', consultantURL: '', contactName: '', ...data } });
const JOBS = [
  job({ jobID: 'J1', contactEmail: 'priya@example.com' }),
  job({ jobID: 'J2', contactName: 'Sam Contact', contactEmail: 'sam@example.com', contactPhone: '0411 222 333' }),
  job({ jobID: 'J3', contactEmail: 'Tom@Example.com' }),
  job({ jobID: 'J4', consultantURL: 'https://other.example.com/consultant/ana-costa/' }),
  job({ jobID: 'J5', contactEmail: 'roy.harper@shazamme.com' }),
  job({ jobID: 'J6', contactEmail: 'priya@example.com', activeStatus: false }),
];
const DATASETS: Record<string, Record<string, unknown>> = {
  'Demo 2 consultants, no job owners': { Consultants: DEMO2, Jobs: [job({ jobID: 'X1' })] },
  'Demo 2 consultants, synthetic job owners': { Consultants: DEMO2, Jobs: JOBS },
  'synthetic consultants and jobs': { Consultants: SYNTHETIC, Jobs: JOBS },
  'no consultants': { Consultants: [], Jobs: [] },
};

// The settings v0.1.65 reads, as Duda sends them (strings) and as the Demo 3 placement 29703713 stores them (booleans).
const CONFIGS: Record<string, Record<string, unknown>> = {
  'empty settings': {},
  'Demo 3 home placement 29703713': { mode: 'team', sortBy: 'default', maxConsultants: '0', columnsDesktop: '4', columnsTablet: '2', columnsMobile: '1', showRole: true, showLiveRoles: true, showZeroRoles: false, linkProfile: true },
  'sort by name, max 3': { sortBy: 'name', maxConsultants: '3' },
  'classification': { classification: ' technology ' },
  'no link, no role': { linkProfile: 'false', showRole: 'false' },
  'phone and email shown': { showPhone: 'show', showEmail: 'show' },
  'live roles wording and zero': { showZeroRoles: 'true', liveRolesOne: '{n} open job', liveRolesMany: '{n} open jobs' },
  'live roles hidden': { showLiveRoles: 'hide' },
  'columns and label': { columnsDesktop: '3', columnsTablet: '1', columnsMobile: '2', ariaLabel: 'The team' },
  'job page': { mode: 'job', jobID: 'j1' },
  'job page, fallback contact': { mode: 'job', jobID: 'J2' },
  'job page, live roles, no heading': { mode: 'job', jobID: 'J3', showLiveRoles: 'show', eyebrow: '' },
  'job page, contact hidden': { mode: 'job', jobID: 'J5', showPhone: 'hide', showEmail: 'hide' },
  'job page, no job': { mode: 'job' },
  'job page, no consultant, message': { mode: 'job', jobID: 'nobody', noConsultantMessage: 'No consultant yet.' },
  'garbage': { mode: 'nope', columnsDesktop: 'x', maxConsultants: '-4', sortBy: '??', showEmail: 'maybe' },
};

function fakeSdk(collections: Record<string, unknown>) {
  return {
    ready: async () => undefined,
    register: () => undefined,
    fetch: async ({ name }: { name: string }) => collections[name] ?? [],
    site: async () => ({ siteID: 'S1' }),
    submit: async () => ({ response: { items: [] } }),
  };
}

async function render(widget: Widget, collections: Record<string, unknown>, config: Record<string, unknown>, inEditor: boolean): Promise<string> {
  const element = document.createElement('div');
  element.innerHTML = SHELL;
  document.body.appendChild(element);
  delete win.__shmCcFetch;
  await widget({ element, data: { config, inEditor, siteId: 'site-1' }, $: undefined, shazamme: fakeSdk(collections) });
  return element.innerHTML;
}

beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => undefined);
  document.body.innerHTML = '';
});

describe('default output is byte for byte the v0.1.65 bundle', () => {
  it('loads two different bundles (the test would prove nothing otherwise)', () => {
    expect(oldWidget).not.toBe(newWidget);
    expect(OLD).not.toBe(NEW);
  });

  const cases = Object.keys(DATASETS).flatMap((d) => Object.keys(CONFIGS).flatMap((c) => [[d, c, false], [d, c, true]] as const));
  it.each(cases)('%s, %s, editor %s', async (dataset, config, inEditor) => {
    const before = await render(oldWidget, DATASETS[dataset], CONFIGS[config], inEditor);
    const after = await render(newWidget, DATASETS[dataset], CONFIGS[config], inEditor);
    expect(after).toBe(before);
    expect(after.length).toBeGreaterThan(50);
  });

  it('does see a difference when a new option is switched on (the comparison is not blind)', async () => {
    const data = DATASETS['Demo 2 consultants, no job owners'];
    for (const option of [{ avatar: 'photo' }, { showMobile: 'true' }, { showLinkedin: 'true' }, { layout: 'slider' }, { showSearch: 'true' }, { showPhone: 'show', showPhoneIcon: 'true' }]) {
      expect(await render(newWidget, data, option, false), JSON.stringify(option)).not.toBe(await render(oldWidget, data, option, false));
    }
  });

  it('draws the Demo 3 placement as eight initials cards, no images', async () => {
    const html = await render(newWidget, DATASETS['Demo 2 consultants, no job owners'], CONFIGS['Demo 3 home placement 29703713'], false);
    const box = document.createElement('div');
    box.innerHTML = html;
    expect(box.querySelectorAll('.shm-cc-card')).toHaveLength(8);
    expect(box.querySelectorAll('.shm-cc-badge')).toHaveLength(8);
    expect(box.querySelector('img')).toBeNull();
  });
});

// @vitest-environment jsdom
// Fleet safety: the proof wall is opt-in. Every layout that existed before it must render the
// exact same markup as the bundle on main did. default-output.golden.json holds that markup,
// captured by running the pre-wall bundle (origin/main at v0.1.62) on the fixture below.

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it, vi } from 'vitest';

const here = dirname(fileURLToPath(import.meta.url));
const VERSION = JSON.parse(readFileSync(join(here, '..', '..', 'package.json'), 'utf8')).version as string;
const BUNDLE = readFileSync(join(here, '..', '..', 'dist', 'testimonials-2026', VERSION, 'widget.min.js'), 'utf8');
const SHELL = readFileSync(join(here, 'content.hbs'), 'utf8').replace(/\{\{\w+\}\}/g, '');
const GOLDEN = JSON.parse(readFileSync(join(here, 'default-output.golden.json'), 'utf8')) as Record<string, string>;

type Win = Record<string, any>;
const win = window as unknown as Win;
win.eval(BUNDLE.replace('"use strict";', ''));

const FIXTURE = [
  { who: 'Steve Jobs', position: 'CEO', company: 'Apple', photoURL: 'https://cdn.example.com/steve.jpg', testimonialDate: '2023-05-04T00:00:00', tags: 'Candidate', consultantID: 'c1', rating: 4.5, content: 'Great people to work with.' },
  { who: 'Ada Lovelace', position: 'Engineer', company: 'Analytical', photoURL: null, testimonialDate: '2022-01-02T00:00:00', tags: 'Client, Perm', consultantID: 'c2', content: 'Quick, honest and thorough from the first call.' },
  { who: 'Grace Hopper', position: '', company: 'Navy', photoURL: null, testimonialDate: '2021-03-04T00:00:00', tags: 'Candidate', consultantID: null, content: 'A <b>bold</b> & "tidy" process.' },
  { who: 'Linus T', position: 'Lead', company: '', photoURL: 'https://cdn.example.com/l.jpg', testimonialDate: null, tags: '', consultantID: 'c1', content: 'Found me the role in a week.' },
].map((data, i) => ({ data: { testimonialID: `id-${i}`, ...data }, page_item_url: 'x' }));
const CONSULTANTS = [{ data: { consultantID: 'c1', firstName: 'Priya', lastName: 'Shah', consultantURL: 'https://x.example.com/consultant/priya', photoURL: null } }];

const SETTINGS: Record<string, Record<string, string>> = {
  slider: { testimonialLayout: 'slider' },
  grid: { testimonialLayout: 'grid', showTagFilter: 'true', showDate: 'true', showConsultant: 'true' },
  list: { testimonialLayout: 'list', pageSize: '2', readMore: 'expand' },
  featured: { testimonialLayout: 'featured', pagination: 'avatars' },
  empty: {},
  garbage: { testimonialLayout: 'wall-ish', wallAccent: '3', wallHeadline: 'role', wallPhotos: 'true' },
};

async function render(config: Record<string, string>): Promise<string> {
  delete win.__shmTmFetch;
  const element: HTMLElement = document.createElement('div');
  element.innerHTML = SHELL;
  document.body.appendChild(element);
  const sdk = {
    ready: vi.fn(async () => undefined),
    register: vi.fn(),
    fetch: vi.fn(async ({ name }: { name: string }) => (name === 'Testimonials' ? FIXTURE : CONSULTANTS)),
  };
  await win.ShazammeWidget['testimonials-2026']({ element, data: { config, inEditor: false, siteId: 'site-1' }, $: undefined, shazamme: sdk });
  const html = element.innerHTML.replace(/shm-tm-\d+/g, 'shm-tm-N');
  element.remove();
  return html;
}

describe('pre-wall layouts are unchanged', () => {
  for (const name of Object.keys(SETTINGS)) {
    it(`${name}: same markup as the bundle on main`, async () => {
      expect(await render(SETTINGS[name])).toBe(GOLDEN[name]);
    });
  }

  it('the wall settings do nothing unless the layout is wall', async () => {
    const plain = await render({ testimonialLayout: 'grid' });
    const withWallKeys = await render({ testimonialLayout: 'grid', wallAccent: '1', wallHeadline: 'role', wallPhotos: 'true' });
    expect(withWallKeys).toBe(plain);
    expect(plain).not.toContain('is-accent');
  });
});

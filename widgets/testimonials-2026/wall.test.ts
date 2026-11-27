// @vitest-environment jsdom
// The proof wall layout (testimonialLayout = wall): grid of cards, one accent card, curly-quoted
// italic quotes, an initials badge instead of a photo, name-or-role headline.

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it, vi } from 'vitest';

const here = dirname(fileURLToPath(import.meta.url));
const VERSION = JSON.parse(readFileSync(join(here, '..', '..', 'package.json'), 'utf8')).version as string;
const BUNDLE = readFileSync(join(here, '..', '..', 'dist', 'testimonials-2026', VERSION, 'widget.min.js'), 'utf8');
const SHELL = readFileSync(join(here, 'content.hbs'), 'utf8').replace(/\{\{\w+\}\}/g, '');
const css = readFileSync(join(here, 'duda-css.reference.css'), 'utf8');

type Win = Record<string, any>;
const win = window as unknown as Win;
win.eval(BUNDLE.replace('"use strict";', ''));

const row = (over: Record<string, unknown>) => ({
  data: { testimonialID: `id-${Math.random()}`, content: 'Great people.', who: 'Head of Finance', position: 'Head of Finance', company: 'Logistics group', photoURL: 'https://cdn.example.com/p.jpg', tags: 'Client', ...over },
  page_item_url: 'x',
});

async function mount(rows: unknown[], config: Record<string, string>) {
  delete win.__shmTmFetch;
  const element: HTMLElement = document.createElement('div');
  element.innerHTML = SHELL;
  document.body.appendChild(element);
  const sdk = { ready: vi.fn(async () => undefined), register: vi.fn(), fetch: vi.fn(async () => rows) };
  await win.ShazammeWidget['testimonials-2026']({ element, data: { config: { testimonialLayout: 'wall', ...config }, inEditor: false, siteId: 's' }, $: undefined, shazamme: sdk });
  return element;
}

const three = [row({ who: 'Ada Lovelace' }), row({ who: 'Grace Hopper' }), row({ who: 'Linus Torvalds' })];

describe('wall layout', () => {
  it('marks the root, lists the cards and highlights the second by default', async () => {
    const el = await mount(three, {});
    expect(el.querySelector('.shm-tm')!.classList.contains('is-layout-wall')).toBe(true);
    const cards = [...el.querySelectorAll('.shm-tm-card')];
    expect(cards).toHaveLength(3);
    expect(cards.map((c) => c.classList.contains('is-accent'))).toEqual([false, true, false]);
  });

  it('moves the highlight, and turns it off with 0', async () => {
    const third = await mount(three, { wallAccent: '3' });
    expect([...third.querySelectorAll('.shm-tm-card')].map((c) => c.classList.contains('is-accent'))).toEqual([false, false, true]);
    const none = await mount(three, { wallAccent: '0' });
    expect(none.querySelector('.is-accent')).toBeNull();
  });

  it('shows an initials badge, never a photo, unless photos are switched on', async () => {
    const el = await mount(three, {});
    expect(el.querySelector('.shm-tm-card img')).toBeNull();
    expect([...el.querySelectorAll('.shm-tm-initials')].map((n) => n.textContent)).toEqual(['AL', 'GH', 'LT']);
    expect(el.querySelector('.shm-tm-initials')!.getAttribute('aria-hidden')).toBe('true');
    const photos = await mount(three, { wallPhotos: 'true' });
    expect(photos.querySelectorAll('.shm-tm-card img')).toHaveLength(3);
  });

  it('keeps no badge at all when showPhoto is off', async () => {
    const el = await mount(three, { showPhoto: 'false' });
    expect(el.querySelector('.shm-tm-photo')).toBeNull();
  });

  it('wraps the quote in curly quotes, as plain text', async () => {
    const el = await mount([row({ content: 'Fast <i>and</i> fair' })], {});
    expect(el.querySelector('.shm-tm-text')!.textContent).toBe('“Fast and fair”');
    expect(el.querySelector('.shm-tm-text i')).toBeNull();
  });

  it('puts the name first by default, with job title and company under it', async () => {
    const el = await mount([row({ who: 'Ada Lovelace', position: 'Engineer', company: 'Analytical' })], {});
    expect(el.querySelector('.shm-tm-name')!.textContent).toBe('Ada Lovelace');
    expect(el.querySelector('.shm-tm-role')!.textContent).toBe('Engineer · Analytical');
  });

  it('puts the job title first when asked, with the company under it', async () => {
    const el = await mount([row({ who: 'Ada Lovelace', position: 'Engineer', company: 'Analytical' })], { wallHeadline: 'role' });
    expect(el.querySelector('.shm-tm-name')!.textContent).toBe('Engineer');
    expect(el.querySelector('.shm-tm-role')!.textContent).toBe('Analytical');
  });

  it('falls back to the name when there is no job title, and hides an empty second line', async () => {
    const el = await mount([row({ who: 'Ada Lovelace', position: '', company: '' })], { wallHeadline: 'role' });
    expect(el.querySelector('.shm-tm-name')!.textContent).toBe('Ada Lovelace');
    expect(el.querySelector('.shm-tm-role')).toBeNull();
  });

  it('honours showCompany and showPosition', async () => {
    const el = await mount([row({ who: 'Ada', position: 'Engineer', company: 'Analytical' })], { showCompany: 'false' });
    expect(el.querySelector('.shm-tm-role')!.textContent).toBe('Engineer');
  });

  it('keeps Show more and tag filters working in the wall', async () => {
    const many = Array.from({ length: 8 }, (_, i) => row({ who: `P${i}`, tags: i % 2 ? 'Client' : 'Candidate' }));
    const el = await mount(many, { pageSize: '3', showTagFilter: 'true' });
    expect([...el.querySelectorAll<HTMLElement>('.shm-tm-item')].filter((n) => !n.hidden)).toHaveLength(3);
    expect(el.querySelectorAll('.shm-tm-chip').length).toBe(3);
    el.querySelector<HTMLButtonElement>('.shm-tm-loadmore')!.click();
    expect([...el.querySelectorAll<HTMLElement>('.shm-tm-item')].filter((n) => !n.hidden)).toHaveLength(6);
  });
});

describe('wall Design Editor prompt', () => {
  const prompt = readFileSync(join(here, 'duda-ai-prompt-8-design-wall.md'), 'utf8');
  const lines = [...prompt.matchAll(/selector: (.+?) \| property: ([\w-]+) \| default: (.+)$/gm)];

  it('has a line for every colour and size', () => {
    expect(lines.length).toBeGreaterThan(40);
  });

  it('backs every line with its selector and default in the shared CSS', () => {
    for (const [, selector, property, def] of lines) {
      const block = css.split('\n').filter((l) => l.includes(selector.trim() + ' {') || l.includes(selector.trim() + ','));
      expect(block.length, selector).toBeGreaterThan(0);
      expect(block.join('\n'), `${selector} ${property}`).toContain(`${property}: ${def.trim()}`);
    }
  });
});

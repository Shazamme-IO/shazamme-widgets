// @vitest-environment jsdom
// typing-headline was an inline Duda paste. Ported, the bundle must still show the
// first word for search engines and screen readers, type through the list, and stop
// its timers when Duda's editor re-runs it on a settings change.

import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it, expect, vi, afterEach } from 'vitest';

const here = dirname(fileURLToPath(import.meta.url));
const VERSION = JSON.parse(readFileSync(join(here, '..', '..', 'package.json'), 'utf8')).version as string;
const BUNDLE = readFileSync(join(here, '..', '..', 'dist', 'typing-headline', VERSION, 'widget.min.js'), 'utf8');

type Win = Record<string, any>;
const WORDS = 'Cloud & DevOps\nData';

// What Duda's Handlebars renders from content.hbs.
const PAGE = (lead: string, words: string) =>
  `<div id="widget"><div class="shm-ty" data-shm-ty><h2 class="shm-ty-heading">` +
  `<span class="shm-ty-lead">${lead}</span> <span class="shm-ty-word">${words.replace(/&/g, '&amp;')}</span></h2></div></div>`;

function load() {
  const win = window as unknown as Win;
  delete win.ShazammeWidget;
  win.eval(BUNDLE);
  return win;
}

function run(win: Win, element: HTMLElement, config: Record<string, string>) {
  win.ShazammeWidget['typing-headline']({ element, data: { config, inEditor: false }, $: undefined, shazamme: undefined });
}

function mount(config: Record<string, string> = {}) {
  const win = window as unknown as Win;
  win.document.body.innerHTML = PAGE('Experts in', WORDS);
  load();
  const element = win.document.getElementById('widget')!;
  run(win, element, { lead: 'Experts in', words: WORDS, reserveSpace: 'false', ...config });
  return { win, element, word: () => element.querySelector('.shm-ty-word')!.textContent };
}

afterEach(() => {
  vi.useRealTimers();
});

describe('typing-headline bundle', () => {
  it('shows the first word and labels the heading with it', () => {
    vi.useFakeTimers();
    const { element, word } = mount();
    expect(word()).toBe('Cloud & DevOps');
    expect(element.querySelector('h2')!.getAttribute('aria-label')).toBe('Experts in Cloud & DevOps');
    expect(element.querySelector('.shm-ty')!.classList.contains('is-ready')).toBe(true);
  });

  it('deletes and types the next word', () => {
    vi.useFakeTimers();
    const { word } = mount({ pauseMs: '200', deleteSpeed: '0', typeSpeed: '10' });
    vi.advanceTimersByTime(200 + 250 + 10 * 4 + 5);
    expect(word()).toBe('Data');
  });

  it('stops the previous run when Duda re-runs the widget', () => {
    vi.useFakeTimers();
    const { win, element, word } = mount({ pauseMs: '200', deleteSpeed: '0', typeSpeed: '10' });
    run(win, element, { lead: 'Experts in', words: WORDS, reserveSpace: 'false', pauseMs: '20000' });
    vi.advanceTimersByTime(5000);
    expect(word()).toBe('Cloud & DevOps');
  });

  it('adds a keyboard pause button that holds the current word', () => {
    vi.useFakeTimers();
    const { element, word } = mount({ pauseMs: '200', deleteSpeed: '0', typeSpeed: '10' });
    const button = element.querySelector('button.shm-ty-pause') as HTMLButtonElement;
    expect(button.getAttribute('aria-pressed')).toBe('false');
    button.click();
    expect(button.getAttribute('aria-pressed')).toBe('true');
    vi.advanceTimersByTime(5000);
    expect(word()).toBe('Cloud & DevOps');
  });
});

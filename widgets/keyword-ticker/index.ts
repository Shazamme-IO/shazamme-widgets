// Keyword Ticker: a full-width band of words that scrolls right to left in a loop. The words are typed in
// or taken from the site's professions (the industries with live jobs). The band is decorative: the moving
// copy is hidden from screen readers, and when the visitor asks for reduced motion it is replaced by the
// same words once, as plain wrapped text. Registered as window.ShazammeWidget["keyword-ticker"].
//
// Typed words need no SDK, so the loader stub only loads the SDK for the professions source.

import type { DudaData } from '../../core/config';
import { clampInt, esc, flag, loadSiteJobs, pick, text, type SiteJob } from '../../core/site-jobs';

interface WidgetContext {
  element: HTMLElement;
  data?: DudaData;
  shazamme?: unknown;
}

type Source = 'words' | 'professions';
type Direction = 'rtl' | 'ltr';

export interface Settings {
  source: Source;
  words: string[];
  maxWords: number;
  speed: number;
  direction: Direction;
  pauseOnHover: boolean;
  showSeparator: boolean;
}

const SOURCES: readonly Source[] = ['words', 'professions'];
const DIRECTIONS: readonly Direction[] = ['rtl', 'ltr'];
const DEFAULT_SPEED_SECONDS = 40;
const DEFAULT_MAX_WORDS = 12;
const MAX_WORDS_CAP = 60;
const MAX_REPEATS = 8;
const EDITOR_NOTE_WORDS = 'Keyword Ticker: add some words (one per line) in the Content editor.';
const EDITOR_NOTE_PROFESSIONS = 'Keyword Ticker: this site has no live jobs yet, so there are no professions to show. Switch the source to typed words or add jobs.';

const runs = new WeakMap<HTMLElement, number>();

export function readSettings(config: Record<string, unknown>): Settings {
  const words = text(config.words)
    .split(/\r?\n/)
    .map((w) => w.trim())
    .filter(Boolean);
  return {
    source: pick(config.source, SOURCES, 'words'),
    words,
    maxWords: clampInt(config.maxWords, DEFAULT_MAX_WORDS, 1, MAX_WORDS_CAP),
    speed: clampInt(config.speed, DEFAULT_SPEED_SECONDS, 5, 300),
    direction: pick(config.direction, DIRECTIONS, 'rtl'),
    pauseOnHover: flag(config.pauseOnHover, true),
    showSeparator: flag(config.showSeparator, true),
  };
}

/** Professions with live jobs, most roles first, then A to Z. */
export function professionsFrom(jobs: readonly SiteJob[], limit: number): string[] {
  const counts = new Map<string, number>();
  for (const j of jobs) {
    const name = text(j.fields.category);
    if (name) counts.set(name, (counts.get(name) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([name]) => name);
}

function groupHtml(words: readonly string[], separator: boolean): string {
  const items = words
    .map((w) => `<span class="shm-kt-item"><span class="shm-kt-word">${esc(w)}</span>${separator ? '<span class="shm-kt-dot"></span>' : ''}</span>`)
    .join('');
  return `<span class="shm-kt-group">${items}</span>`;
}

function staticHtml(words: readonly string[], separator: boolean): string {
  const items = words
    .map((w) => `<li class="shm-kt-static-item"><span class="shm-kt-word">${esc(w)}</span>${separator ? '<span class="shm-kt-dot" aria-hidden="true"></span>' : ''}</li>`)
    .join('');
  return `<ul class="shm-kt-static">${items}</ul>`;
}

/** Repeat the words until one copy is wider than the band, so the loop never shows a gap. */
function fillTrack(root: HTMLElement, words: readonly string[], separator: boolean): void {
  const track = root.querySelector<HTMLElement>('.shm-kt-track');
  const viewport = root.querySelector<HTMLElement>('.shm-kt-viewport');
  if (!track || !viewport) return;
  const copyWidth = (): number => track.querySelector<HTMLElement>('.shm-kt-group')?.offsetWidth ?? 0;
  let repeats = 1;
  do {
    const one = Array.from({ length: repeats }, () => words).flat();
    track.innerHTML = groupHtml(one, separator) + groupHtml(one, separator);
    repeats += 1;
  } while (copyWidth() > 0 && copyWidth() < viewport.offsetWidth && repeats <= MAX_REPEATS);
}

function render(root: HTMLElement, words: readonly string[], s: Settings, stillCurrent: () => boolean): void {
  root.classList.remove('is-empty');
  root.classList.toggle('is-rtl', s.direction === 'rtl');
  root.classList.toggle('is-ltr', s.direction === 'ltr');
  root.classList.toggle('is-pausable', s.pauseOnHover);
  root.style.setProperty('--shm-kt-duration', `${s.speed}s`);
  root.innerHTML = `<div class="shm-kt-viewport" aria-hidden="true"><div class="shm-kt-track"></div></div>${staticHtml(words, s.showSeparator)}`;
  fillTrack(root, words, s.showSeparator);
  root.classList.add('is-ready');
  // The web font changes the words' width: measure again once it has loaded.
  void document.fonts?.ready.then(() => {
    if (root.isConnected && root.classList.contains('is-ready') && !root.classList.contains('is-empty') && stillCurrent()) fillTrack(root, words, s.showSeparator);
  });
}

function showNote(root: HTMLElement, inEditor: boolean, note: string): void {
  root.classList.add('is-empty', 'is-ready');
  root.innerHTML = inEditor ? `<p class="shm-kt-empty">${esc(note)}</p>` : '';
}

export default async function keywordTicker(ctx: WidgetContext): Promise<void> {
  const { element, data } = ctx;
  const root = element.querySelector<HTMLElement>('.shm-kt');
  if (!root) return;
  const inEditor = !!data?.inEditor;
  const s = readSettings(data?.config ?? {});
  const run = (runs.get(element) ?? 0) + 1;
  runs.set(element, run);

  if (s.source === 'words') {
    if (!s.words.length) return showNote(root, inEditor, EDITOR_NOTE_WORDS);
    return render(root, s.words, s, () => runs.get(element) === run);
  }

  try {
    const jobs = await loadSiteJobs(ctx.shazamme, data, inEditor);
    if (runs.get(element) !== run) return;
    const words = professionsFrom(jobs, s.maxWords);
    if (!words.length) return showNote(root, inEditor, EDITOR_NOTE_PROFESSIONS);
    render(root, words, s, () => runs.get(element) === run);
  } catch (err) {
    if (runs.get(element) !== run) return;
    console.error('[keyword-ticker]', err);
    showNote(root, inEditor, EDITOR_NOTE_PROFESSIONS);
  }
}

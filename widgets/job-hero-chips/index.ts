// Job Hero Chips: the pills under the job title on the job details page (location, work type,
// work model, a highlighted salary pill). Registered by the build as
// window.ShazammeWidget["job-hero-chips"]; Duda's loader stub calls the default export with
// { element, data, $, shazamme }. The look comes from the CSS in Duda's CSS tabs.

import type { DudaData } from '../../core/config';
import { esc, loadJob, text, type Sdk } from '../_job-page/job';
import { buildChips, type Chip } from './chips';

interface WidgetContext {
  element: HTMLElement;
  data?: DudaData;
  shazamme?: unknown;
}

const WIDGET_NAME = 'job-hero-chips';
const SAMPLE_NOTE = 'Sample job, shown in the editor only. The live job page shows the real job.';
const PIN_ICON =
  '<svg class="shm-jc-icon" aria-hidden="true" focusable="false" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M8 14s5-4.5 5-8A5 5 0 003 6c0 3.5 5 8 5 8z"></path><circle cx="8" cy="6" r="1.8"></circle></svg>';
const runs = new WeakMap<HTMLElement, number>();

function ensureShell(element: HTMLElement): { root: HTMLElement; list: HTMLElement } {
  let root = element.querySelector<HTMLElement>('.shm-jc');
  if (!root) {
    root = document.createElement('div');
    root.className = 'shm-jc';
    element.appendChild(root);
  }
  let list = root.querySelector<HTMLElement>('.shm-jc-list');
  if (!list) {
    list = document.createElement('ul');
    list.className = 'shm-jc-list';
    root.appendChild(list);
  }
  return { root, list };
}

function chipHtml(c: Chip): string {
  const classes = ['shm-jc-chip', `shm-jc-chip-${c.kind}`, c.highlight ? 'is-highlight' : ''].filter(Boolean).join(' ');
  return `<li class="${classes}">${c.icon ? PIN_ICON : ''}<span class="shm-jc-text">${esc(c.value)}</span></li>`;
}

function setNote(root: HTMLElement, message: string): void {
  root.querySelector('.shm-jc-note')?.remove();
  if (!message) return;
  const note = document.createElement('p');
  note.className = 'shm-jc-note';
  note.textContent = message;
  root.appendChild(note);
}

export default async function jobHeroChips(ctx: WidgetContext): Promise<void> {
  const element = ctx?.element;
  if (!element || typeof element.querySelector !== 'function') return;
  const data = (ctx.data ?? {}) as DudaData;
  const config = (data.config && typeof data.config === 'object' ? data.config : {}) as Record<string, unknown>;
  const inEditor = Boolean(data.inEditor);
  const { root, list } = ensureShell(element);

  const run = (runs.get(element) ?? 0) + 1;
  runs.set(element, run);
  root.classList.remove('is-ready', 'is-empty');
  root.hidden = false;
  list.innerHTML = '';
  setNote(root, '');

  try {
    const sdk = (ctx.shazamme ?? (window as unknown as { shazamme?: unknown }).shazamme) as Sdk | undefined;
    const loaded = await loadJob({
      sdk,
      config,
      siteId: text((data as { siteId?: unknown }).siteId),
      page: (data as { page?: unknown }).page,
      inEditor,
      pageUrl: window.location.href,
    });
    if (runs.get(element) !== run) return;
    const chips = loaded ? buildChips(loaded.job, config) : [];
    if (chips.length === 0) {
      root.classList.add('is-empty');
      root.hidden = !inEditor;
      if (inEditor) setNote(root, 'Job Hero Chips has no job to show here. Bind the jobID input to the job on a job details page.');
      return;
    }
    list.innerHTML = chips.map(chipHtml).join('');
    root.classList.add('is-ready');
    if (loaded?.isSample) setNote(root, SAMPLE_NOTE);
  } catch (e) {
    console.error(`[${WIDGET_NAME}]`, e);
    if (runs.get(element) !== run) return;
    root.classList.add('is-empty');
    root.hidden = !inEditor;
    if (inEditor) setNote(root, 'The job could not be loaded.');
  }
}

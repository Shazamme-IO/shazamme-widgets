// Job Summary: the "At a glance" card for the job details page. Registered by the build as
// window.ShazammeWidget["job-summary"]; Duda's loader stub calls the default export with
// { element, data, $, shazamme }. The look comes from the CSS in Duda's CSS tabs.

import type { DudaData } from '../../core/config';
import { esc, loadJob, text, type Sdk } from '../_job-page/job';
import { buildRows } from './rows';

interface WidgetContext {
  element: HTMLElement;
  data?: DudaData;
  shazamme?: unknown;
}

const WIDGET_NAME = 'job-summary';
const SAMPLE_NOTE = 'Sample job, shown in the editor only. The live job page shows the real job.';
const runs = new WeakMap<HTMLElement, number>();

function ensureShell(element: HTMLElement): { root: HTMLElement; list: HTMLElement } {
  let root = element.querySelector<HTMLElement>('.shm-js');
  if (!root) {
    root = document.createElement('div');
    root.className = 'shm-js';
    element.appendChild(root);
  }
  let list = root.querySelector<HTMLElement>('.shm-js-list');
  if (!list) {
    list = document.createElement('dl');
    list.className = 'shm-js-list';
    root.appendChild(list);
  }
  return { root, list };
}

function setNote(root: HTMLElement, message: string): void {
  root.querySelector('.shm-js-note')?.remove();
  if (!message) return;
  const note = document.createElement('p');
  note.className = 'shm-js-note';
  note.textContent = message;
  root.appendChild(note);
}

export default async function jobSummary(ctx: WidgetContext): Promise<void> {
  const element = ctx?.element;
  if (!element || typeof element.querySelector !== 'function') return;
  const data = (ctx.data ?? {}) as DudaData;
  const config = (data.config && typeof data.config === 'object' ? data.config : {}) as Record<string, unknown>;
  const inEditor = Boolean(data.inEditor);
  const { root, list } = ensureShell(element);
  const heading = root.querySelector<HTMLElement>('.shm-js-heading');
  if (heading) heading.hidden = !(heading.textContent ?? '').trim();

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
    const rows = loaded ? buildRows(loaded.job, config) : [];
    if (rows.length === 0) {
      root.classList.add('is-empty');
      root.hidden = !inEditor;
      if (inEditor) setNote(root, 'Job Summary has no job to show here. Bind the jobID input to the job on a job details page.');
      return;
    }
    list.innerHTML = rows
      .map((r) => `<dt class="shm-js-label">${esc(r.label)}</dt><dd class="shm-js-value" data-row="${esc(r.key)}">${esc(r.value)}</dd>`)
      .join('');
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

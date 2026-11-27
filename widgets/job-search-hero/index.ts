// Job Search Hero: a labelled search panel (keyword, location, work type) with a button that
// shows how many roles are live. Registered by the build as window.ShazammeWidget["job-search-hero"];
// Duda's loader stub calls the default export with { element, data, $, shazamme }. The look comes
// from the CSS in Duda's CSS tabs. It is a separate widget from Job Search on purpose: the fleet
// Job Search keeps its own markup, so nothing here can change it.

import type { DudaData } from '../../core/config';
import { loadJobRows, text, type Sdk } from '../_job-page/job';
import { buildResultsUrl, countLabel, readSettings, type HeroSettings } from './settings';

interface WidgetContext {
  element: HTMLElement;
  data?: DudaData;
  shazamme?: unknown;
}

const WIDGET_NAME = 'job-search-hero';
const URL_PARAMS = ['keyword', 'location', 'workType'] as const;
const runs = new WeakMap<HTMLElement, number>();

type Teardown = HTMLElement & { __shmJhOff?: () => void; __shmJhLast?: { count: number; labels: string[] } };

const FORM_HTML = `
  <label class="shm-jh-field shm-jh-field-keyword"><span class="shm-jh-label"></span><input class="shm-jh-input" type="text" name="keyword" autocomplete="off"></label>
  <label class="shm-jh-field shm-jh-field-location"><span class="shm-jh-label"></span><input class="shm-jh-input" type="text" name="location" autocomplete="off"></label>
  <label class="shm-jh-field shm-jh-field-worktype"><span class="shm-jh-label"></span><select class="shm-jh-input" name="workType"><option value=""></option></select></label>
  <button class="shm-jh-button" type="submit"><span class="shm-jh-button-text"></span></button>`;

function ensureForm(element: HTMLElement): HTMLFormElement {
  let form = element.querySelector<HTMLFormElement>('form.shm-jh');
  if (!form) {
    form = document.createElement('form');
    form.className = 'shm-jh';
    form.noValidate = true;
    element.appendChild(form);
  }
  if (!form.querySelector('.shm-jh-button')) form.innerHTML = FORM_HTML;
  return form;
}

const q = <T extends HTMLElement>(form: HTMLElement, sel: string): T => form.querySelector<T>(sel) as T;

function applyText(form: HTMLFormElement, s: HeroSettings): void {
  form.setAttribute('role', 'search');
  form.setAttribute('aria-label', s.ariaLabel);
  q(form, '.shm-jh-field-keyword .shm-jh-label').textContent = s.keywordLabel;
  q<HTMLInputElement>(form, '[name=keyword]').placeholder = s.keywordPlaceholder;
  q(form, '.shm-jh-field-location .shm-jh-label').textContent = s.locationLabel;
  q<HTMLInputElement>(form, '[name=location]').placeholder = s.locationPlaceholder;
  q(form, '.shm-jh-field-worktype .shm-jh-label').textContent = s.workTypeLabel;
  q(form, '.shm-jh-field-location').hidden = !s.showLocation;
}

function distinctWorkTypes(rows: unknown): string[] {
  if (!Array.isArray(rows)) return [];
  const seen = new Map<string, string>();
  for (const entry of rows) {
    const row = entry && typeof entry === 'object' ? ((entry as { data?: unknown }).data ?? entry) : null;
    const label = text(row && typeof row === 'object' ? (row as Record<string, unknown>).workType : '');
    if (label && !seen.has(label.toLowerCase())) seen.set(label.toLowerCase(), label);
  }
  return Array.from(seen.values()).sort((a, b) => a.localeCompare(b, 'en-AU'));
}

function fillWorkTypes(form: HTMLFormElement, s: HeroSettings, labels: string[]): void {
  const select = q<HTMLSelectElement>(form, '[name=workType]');
  const chosen = select.value;
  select.innerHTML = '';
  select.add(new Option(s.workTypeAllLabel, ''));
  labels.forEach((l) => select.add(new Option(l, l)));
  select.value = labels.includes(chosen) ? chosen : '';
  q(form, '.shm-jh-field-worktype').hidden = !s.showWorkType || labels.length === 0;
}

function prefillFromAddress(form: HTMLFormElement): void {
  const params = new URLSearchParams(window.location.search);
  for (const name of URL_PARAMS) {
    const value = params.get(name);
    const field = form.querySelector<HTMLInputElement | HTMLSelectElement>(`[name=${name}]`);
    if (value && field && !field.value) field.value = value;
  }
}

export default async function jobSearchHero(ctx: WidgetContext): Promise<void> {
  const element = ctx?.element as Teardown | undefined;
  if (!element || typeof element.querySelector !== 'function') return;
  element.__shmJhOff?.();
  element.__shmJhOff = undefined;

  const data = (ctx.data ?? {}) as DudaData;
  const inEditor = Boolean(data.inEditor);
  const s = readSettings(data.config);
  const form = ensureForm(element);
  applyText(form, s);
  const last = element.__shmJhLast ?? { count: 0, labels: [] };
  q(form, '.shm-jh-button-text').textContent = countLabel(s, last.count);
  fillWorkTypes(form, s, last.labels);
  prefillFromAddress(form);

  const onSubmit = (e: Event): void => {
    e.preventDefault();
    if (inEditor) return;
    const field = (name: string): string => text(form.querySelector<HTMLInputElement>(`[name=${name}]`)?.value);
    window.location.assign(buildResultsUrl(s.resultsPage, { keyword: field('keyword'), location: s.showLocation ? field('location') : '', workType: field('workType') }));
  };
  form.addEventListener('submit', onSubmit);
  element.__shmJhOff = () => form.removeEventListener('submit', onSubmit);

  const run = (runs.get(element) ?? 0) + 1;
  runs.set(element, run);
  try {
    const sdk = (ctx.shazamme ?? (window as unknown as { shazamme?: unknown }).shazamme) as Sdk | undefined;
    if (!sdk) return;
    await Promise.resolve(sdk.ready?.(text((data as { siteId?: unknown }).siteId), (data as { page?: unknown }).page));
    const rows = await loadJobRows(sdk, inEditor);
    if (runs.get(element) !== run) return;
    const count = Array.isArray(rows) ? rows.length : 0;
    const labels = distinctWorkTypes(rows);
    element.__shmJhLast = { count, labels };
    q(form, '.shm-jh-button-text').textContent = countLabel(s, count);
    fillWorkTypes(form, s, labels);
    prefillFromAddress(form);
  } catch (e) {
    console.error(`[${WIDGET_NAME}]`, e);
  }
}


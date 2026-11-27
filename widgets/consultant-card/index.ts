// Consultant Card: a card for the Shazamme "Consultants" collection, initials by default
// or the consultant's photo. "team" mode is a grid (or slider) of consultants with their
// live role count, optional contact and social links, and an optional filter bar; "job"
// mode is the card of the consultant who owns the current job (the Consultant on Jobs job).
// Registered by the build as window.ShazammeWidget["consultant-card"].

import type { DudaData } from '../../core/config';
import {
  consultantForJob,
  consultantFromApi,
  countLiveRoles,
  findJob,
  loadRows,
  normaliseConsultants,
  selectConsultants,
  type Consultant,
  type Sdk,
} from './data';
import { ICONS } from './icons';
import { esc, jobHtml } from './render';
import { readSettings, type Settings } from './settings';
import { mountTeam } from './team';

interface WidgetContext {
  element: HTMLElement;
  data?: DudaData;
  shazamme?: unknown;
}

const WIDGET_NAME = 'consultant-card';
const CONSULTANTS = 'Consultants';
const JOBS = 'Jobs';
const GENERIC_ERROR = 'The consultants could not be loaded.';
/** Root classes the settings add. Each is added only for a non-default choice, so the default root is unchanged. */
const OPTION_CLASS_PREFIXES = ['is-mode-', 'is-item-', 'is-align-', 'is-layout-', 'is-filters-'];

function ensureShell(element: HTMLElement): { root: HTMLElement; stage: HTMLElement } {
  let root = element.querySelector<HTMLElement>('.shm-cc');
  if (!root) {
    root = document.createElement('div');
    root.className = 'shm-cc';
    element.appendChild(root);
  }
  let stage = root.querySelector<HTMLElement>('.shm-cc-stage');
  if (!stage) {
    stage = document.createElement('div');
    stage.className = 'shm-cc-stage';
    root.appendChild(stage);
  }
  return { root, stage };
}

function optionClasses(s: Settings): string[] {
  return [
    `is-mode-${s.mode}`,
    s.mode === 'team' && s.itemLayout !== 'stacked' ? `is-item-${s.itemLayout}` : '',
    s.align !== 'left' ? `is-align-${s.align}` : '',
    s.mode === 'team' && s.layout !== 'grid' ? `is-layout-${s.layout}` : '',
    s.filterAlign !== 'left' ? `is-filters-${s.filterAlign}` : '',
  ].filter(Boolean);
}

function applyShell(root: HTMLElement, s: Settings): void {
  Array.from(root.classList)
    .filter((c) => OPTION_CLASS_PREFIXES.some((p) => c.startsWith(p)))
    .forEach((c) => root.classList.remove(c));
  optionClasses(s).forEach((c) => root.classList.add(c));
  root.classList.remove('is-ready', 'is-empty');
  root.hidden = false;
  const slider = s.mode === 'team' && s.layout === 'slider';
  root.style.setProperty('--shm-cc-cols-d', String(slider ? s.slidesToShow : s.columnsDesktop));
  root.style.setProperty('--shm-cc-cols-t', String(slider ? Math.min(s.columnsTablet, s.slidesToShow) : s.columnsTablet));
  root.style.setProperty('--shm-cc-cols-m', String(slider ? Math.min(s.columnsMobile, s.slidesToShow) : s.columnsMobile));
}

/** In the editor a note says what is missing; on the live site an empty widget renders nothing. */
function showNote(root: HTMLElement, stage: HTMLElement, inEditor: boolean, message: string, liveMessage = ''): void {
  if (inEditor) stage.innerHTML = `<div class="shm-cc-editor-note" role="note">Consultant Card: ${esc(message)}</div>`;
  else stage.innerHTML = liveMessage ? `<p class="shm-cc-empty">${esc(liveMessage)}</p>` : '';
  root.classList.add('is-ready');
  if (!inEditor && !liveMessage) {
    root.classList.add('is-empty');
    root.hidden = true;
  }
}

/** Live role counts when the jobs say who owns them, otherwise null (the line stays hidden). */
function countsFrom(jobs: unknown, consultants: Consultant[]): Map<string, number> | null {
  if (jobs === null) return null;
  const result = countLiveRoles(jobs, consultants);
  return result.known ? result.counts : null;
}

type Outcome =
  | { html: string }
  | { team: Consultant[]; counts: Map<string, number> | null }
  | { note: string; live?: string };

function noMatchNote(all: Consultant[], s: Settings): string {
  if (all.length === 0) return 'the Consultants collection has no visible rows.';
  if (s.classification && s.location) return `no consultants match the Classification "${s.classification}" and the Location "${s.location}".`;
  if (s.location) return `no consultants match the Location "${s.location}".`;
  return `no consultants match the Classification "${s.classification}".`;
}

async function renderTeam(sdk: Sdk, s: Settings, siteId: string, inEditor: boolean): Promise<Outcome> {
  const consultantsLoad = loadRows(sdk, CONSULTANTS, siteId, inEditor);
  const countsLoad = s.showLiveRoles ? loadRows(sdk, JOBS, siteId, inEditor).catch((err) => { console.error('[consultant-card] live roles unavailable', err); return null; }) : Promise.resolve(null);
  const all = normaliseConsultants(await consultantsLoad);
  const items = selectConsultants(all, s);
  if (items.length === 0) return { note: noMatchNote(all, s) };
  return { team: items, counts: countsFrom(await countsLoad, all) };
}

async function ownerOfJob(sdk: Sdk, s: Settings, siteId: string, inEditor: boolean): Promise<{ consultant: Consultant | null; all: Consultant[]; jobRows: unknown }> {
  const [jobRows, consultantRows] = await Promise.all([
    loadRows(sdk, JOBS, siteId, inEditor).catch((err) => { console.error('[consultant-card] jobs unavailable', err); return null; }),
    loadRows(sdk, CONSULTANTS, siteId, inEditor).catch(() => []),
  ]);
  const all = normaliseConsultants(consultantRows);
  const job = findJob(jobRows, s.jobId);
  const fromJob = job ? consultantForJob(job, all) : null;
  if (fromJob) return { consultant: fromJob, all, jobRows };
  return { consultant: await consultantFromApi(sdk, s.jobId).catch(() => null), all, jobRows };
}

async function renderJob(sdk: Sdk, s: Settings, siteId: string, inEditor: boolean): Promise<Outcome> {
  if (!s.jobId) {
    return { note: "connect the Job ID field to the page's job, so the card knows which job it is on.", live: s.noConsultantMessage };
  }
  const { consultant, all, jobRows } = await ownerOfJob(sdk, s, siteId, inEditor);
  if (!consultant) return { note: `no consultant is assigned to job ${s.jobId}.`, live: s.noConsultantMessage };
  const everyone = all.some((c) => c.id === consultant.id) ? all : [...all, consultant];
  return { html: jobHtml(consultant, s, s.showLiveRoles ? countsFrom(jobRows, everyone) : null) };
}

/** A photo that fails to load becomes the initials (fallback setting) or the plain placeholder. */
function photoErrorHandler(s: Settings): (e: Event) => void {
  return (e: Event) => {
    const img = e.target as HTMLElement | null;
    if (!img || img.tagName !== 'IMG' || !img.classList.contains('shm-cc-photo-img')) return;
    const holder = img.parentElement;
    if (!holder) return;
    if (s.avatar === 'photo-with-initials-fallback') {
      const badge = document.createElement('span');
      badge.className = 'shm-cc-badge';
      badge.setAttribute('aria-hidden', 'true');
      badge.textContent = holder.getAttribute('data-initials') ?? '';
      holder.replaceWith(badge);
    } else {
      holder.classList.add('is-missing');
      holder.innerHTML = ICONS.person;
    }
  };
}

type Destroyable = HTMLElement & { __shmCcDestroy?: () => void };
const runs = new WeakMap<HTMLElement, number>();

export default async function consultantCard(ctx: WidgetContext): Promise<void> {
  const element = ctx?.element as Destroyable | undefined;
  if (!element || typeof element.querySelector !== 'function') return;
  element.__shmCcDestroy?.();

  const data = (ctx.data ?? {}) as DudaData;
  const inEditor = Boolean(data.inEditor);
  const s = readSettings(data.config);
  const { root, stage } = ensureShell(element);
  applyShell(root, s);
  stage.innerHTML = '';
  let teardown = (): void => undefined;
  const onPhotoError = photoErrorHandler(s);
  stage.addEventListener('error', onPhotoError, true);
  element.__shmCcDestroy = () => {
    teardown();
    stage.removeEventListener('error', onPhotoError, true);
    stage.innerHTML = '';
  };

  const run = (runs.get(element) ?? 0) + 1;
  runs.set(element, run);
  const current = (): boolean => runs.get(element) === run;

  try {
    const sdk = (ctx.shazamme ?? (window as unknown as { shazamme?: unknown }).shazamme) as Sdk | undefined;
    if (!sdk) throw new Error('The Shazamme SDK did not load.');
    const siteId = s.siteId || String((data as { siteId?: unknown }).siteId ?? '');
    await Promise.resolve(sdk.ready?.(siteId, (data as { page?: unknown }).page));
    sdk.register?.(WIDGET_NAME, data);
    if (!current()) return;
    const outcome = s.mode === 'job' ? await renderJob(sdk, s, siteId, inEditor) : await renderTeam(sdk, s, siteId, inEditor);
    if (!current()) return;
    if ('team' in outcome) {
      teardown = mountTeam(stage, outcome.team, s, outcome.counts, inEditor);
      root.classList.add('is-ready');
    } else if ('html' in outcome) {
      stage.innerHTML = outcome.html;
      root.classList.add('is-ready');
    } else {
      showNote(root, stage, inEditor, outcome.note, outcome.live);
    }
  } catch (err) {
    if (!current()) return;
    console.error('[consultant-card]', err);
    showNote(root, stage, inEditor, err instanceof Error && err.message ? err.message : GENERIC_ERROR);
  }
}

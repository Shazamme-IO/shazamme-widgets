// Job Board: a search panel, a sidebar of filters with live counts (a sheet on mobile) and a grid of job cards with
// sort and pages. Jobs come from the site's "Jobs" Duda collection when it can be read, else the Shazamme job feed.
// The search and filters live in the page address, so a search can be shared and Back works. Registered by the
// build as window.ShazammeWidget["job-board"].

import type { DudaData } from '../../core/config';
import { loadJobsFrom, type JobSource, type SiteJob } from '../../core/site-jobs';
import {
  activeFilterCount, buildFacets, filterJobs, pageCount, readAddress, sortJobs, toCard, visibleJobs, writeAddress, type State,
} from './board';
import { createDrawer } from './drawer';
import { cardHtml, countText, emptyHtml, facetsHtml, pagerHtml, shellHtml, type FacetView } from './render';
import { fill, readSettings, SORTS, type GroupId, type Settings } from './settings';

interface WidgetContext {
  element: HTMLElement;
  data?: DudaData;
  shazamme?: unknown;
}

const NAME = 'job-board';
const runs = new WeakMap<HTMLElement, number>();
const teardowns = new WeakMap<HTMLElement, () => void>();
let uid = 0;

function release(element: HTMLElement): void {
  teardowns.get(element)?.();
  teardowns.delete(element);
}

function freshState(s: Settings, inEditor: boolean): State {
  if (s.syncAddress && !inEditor) return readAddress(window.location.search, window.location.hash, s.defaultSort);
  return { keyword: '', location: '', selected: {}, sort: s.defaultSort, page: 1 };
}

function openGroups(s: Settings): Set<string> {
  if (s.groupsOpen === 'none') return new Set();
  const ids = s.groups.map((g) => g.id);
  return new Set(s.groupsOpen === 'first' ? ids.slice(0, 1) : ids);
}

function sourceNote(source: JobSource, count: number, s: Settings): string {
  if (source === 'collection') return `Connected to the "${s.jobsCollection}" collection: ${count} live jobs.`;
  const why = s.jobsCollection ? ` (the "${s.jobsCollection}" collection could not be read on this page)` : '';
  return `Showing ${count} live jobs from the site job feed${why}.`;
}

const q = <T extends Element>(root: Element, sel: string): T | null => root.querySelector<T>(sel);

function mountBoard(stage: HTMLElement, jobs: readonly SiteJob[], source: JobSource, s: Settings, inEditor: boolean, id: string): () => void {
  let state = freshState(s, inEditor);
  const view: FacetView = { open: openGroups(s), expanded: new Set() };
  stage.innerHTML = shellHtml(id, s, state);

  const grid = q<HTMLElement>(stage, '.shm-jb-grid')!;
  const count = q<HTMLElement>(stage, '.shm-jb-count')!;
  const empty = q<HTMLElement>(stage, '.shm-jb-empty')!;
  const pager = q<HTMLElement>(stage, '.shm-jb-pager')!;
  const results = q<HTMLElement>(stage, '.shm-jb-results')!;
  const facetsBox = q<HTMLElement>(stage, '.shm-jb-facets');
  const side = q<HTMLElement>(stage, '.shm-jb-side');
  const opener = q<HTMLButtonElement>(stage, '.shm-jb-open');
  const backdrop = q<HTMLElement>(stage, '.shm-jb-backdrop');
  const apply = q<HTMLButtonElement>(stage, '.shm-jb-apply');
  const note = q<HTMLElement>(stage, '.shm-jb-note')!;
  const drawer = side && opener && backdrop ? createDrawer(side, opener, backdrop) : null;

  if (inEditor) {
    note.hidden = false;
    note.textContent = sourceNote(source, jobs.length, s);
  }

  const renderFacets = (): void => {
    if (!facetsBox) return;
    facetsBox.innerHTML = facetsHtml(id, buildFacets(jobs, state, s.groups), s, view);
  };

  const render = (): void => {
    const matched = sortJobs(filterJobs(jobs, state), state.sort);
    const pages = pageCount(matched.length, s.pageSize);
    state = { ...state, page: Math.min(state.page, pages) };
    const shown = visibleJobs(matched, state, s);
    grid.innerHTML = shown.map((j) => cardHtml(toCard(j, s), s)).join('');
    grid.setAttribute('aria-busy', 'false');
    grid.hidden = shown.length === 0;
    count.textContent = countText(matched.length, s);
    const filtered = activeFilterCount(state) > 0 || !!state.keyword || !!state.location;
    empty.hidden = shown.length > 0;
    empty.innerHTML = shown.length ? '' : emptyHtml(s, jobs.length > 0, filtered);
    const pagerMarkup = pagerHtml(state.page, pages, shown.length, matched.length, s);
    pager.innerHTML = pagerMarkup;
    pager.hidden = !pagerMarkup;
    if (apply) apply.textContent = fill(s.applyText, matched.length);
    const n = activeFilterCount(state);
    const badge = opener && q<HTMLElement>(opener, '.shm-jb-open-count');
    if (badge) badge.textContent = n ? `(${n})` : '';
    renderFacets();
  };

  const commit = (push: boolean): void => {
    if (s.syncAddress && !inEditor) {
      const url = `${window.location.pathname}${writeAddress(window.location.search, state, s.defaultSort)}`;
      if (push) window.history.pushState({ shmJobBoard: true }, '', url);
      else window.history.replaceState(window.history.state, '', url);
    }
    render();
  };

  const syncInputs = (): void => {
    const kw = q<HTMLInputElement>(stage, '[name=keyword]');
    const loc = q<HTMLInputElement>(stage, '[name=location]');
    const sort = q<HTMLSelectElement>(stage, '[name=sort]');
    if (kw) kw.value = state.keyword;
    if (loc) loc.value = state.location;
    if (sort) sort.value = state.sort;
  };

  const toResults = (): void => {
    if (results.getBoundingClientRect().top >= 0) return;
    const reduce = typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    results.scrollIntoView?.({ block: 'start', behavior: reduce ? 'auto' : 'smooth' });
  };

  const focusIn = (sel: string, match?: (el: HTMLElement) => boolean): void => {
    const list = [...stage.querySelectorAll<HTMLElement>(sel)];
    (match ? list.find(match) : list[0])?.focus();
  };

  const onSubmit = (e: Event): void => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const val = (name: string): string => (form.querySelector<HTMLInputElement>(`[name=${name}]`)?.value ?? '').trim();
    state = { ...state, keyword: val('keyword'), location: val('location'), page: 1 };
    commit(true);
  };

  const onChange = (e: Event): void => {
    const el = e.target as HTMLElement;
    if (el.matches('.shm-jb-check')) {
      const box = el as HTMLInputElement;
      const group = box.dataset.group as GroupId;
      const now = state.selected[group] ?? [];
      const next = box.checked ? [...now, box.value] : now.filter((v) => v.toLowerCase() !== box.value.toLowerCase());
      state = { ...state, selected: { ...state.selected, [group]: next }, page: 1 };
      commit(true);
      focusIn(`.shm-jb-check[data-group="${group}"]`, (c) => (c as HTMLInputElement).value === box.value);
    } else if (el.matches('[name=sort]')) {
      const value = (el as HTMLSelectElement).value;
      state = { ...state, sort: SORTS.find((x) => x === value) ?? s.defaultSort, page: 1 };
      commit(true);
    }
  };

  const onClick = (e: Event): void => {
    const el = (e.target as Element).closest<HTMLElement>('button, .shm-jb-backdrop');
    if (!el || !stage.contains(el)) return;
    if (el.matches('.shm-jb-toggle')) {
      const group = el.closest<HTMLElement>('.shm-jb-group')!.dataset.group!;
      if (view.open.has(group)) view.open.delete(group);
      else view.open.add(group);
      renderFacets();
      focusIn(`.shm-jb-group[data-group="${group}"] .shm-jb-toggle`);
    } else if (el.matches('.shm-jb-more')) {
      const group = el.dataset.group!;
      if (view.expanded.has(group)) view.expanded.delete(group);
      else view.expanded.add(group);
      renderFacets();
      focusIn(`.shm-jb-more[data-group="${group}"]`);
    } else if (el.matches('.shm-jb-clear')) {
      state = { ...state, keyword: '', location: '', selected: {}, page: 1 };
      syncInputs();
      commit(true);
    } else if (el.matches('.shm-jb-page, .shm-jb-prev, .shm-jb-next')) {
      const page = parseInt(el.dataset.page ?? '', 10);
      if (!page) return;
      state = { ...state, page };
      commit(true);
      toResults();
      focusIn('.shm-jb-page.is-current');
    } else if (el.matches('.shm-jb-loadmore')) {
      const before = grid.children.length;
      state = { ...state, page: state.page + 1 };
      commit(false);
      (grid.children[before]?.querySelector('a') as HTMLElement | null)?.focus();
    } else if (el.matches('.shm-jb-open')) {
      drawer?.open();
    } else if (el.matches('.shm-jb-close, .shm-jb-apply, .shm-jb-backdrop')) {
      drawer?.close(true);
      if (el.matches('.shm-jb-apply')) toResults();
    }
  };

  const onPop = (): void => {
    state = freshState(s, inEditor);
    syncInputs();
    render();
  };

  const wide = typeof window.matchMedia === 'function' ? window.matchMedia('(min-width: 1024px)') : null;
  const onWide = (): void => {
    if (wide?.matches) drawer?.close(false);
  };

  stage.addEventListener('submit', onSubmit);
  stage.addEventListener('change', onChange);
  stage.addEventListener('click', onClick);
  if (s.syncAddress && !inEditor) window.addEventListener('popstate', onPop);
  wide?.addEventListener?.('change', onWide);
  render();

  return () => {
    drawer?.destroy();
    stage.removeEventListener('submit', onSubmit);
    stage.removeEventListener('change', onChange);
    stage.removeEventListener('click', onClick);
    window.removeEventListener('popstate', onPop);
    wide?.removeEventListener?.('change', onWide);
  };
}

function ensureRoot(element: HTMLElement): { root: HTMLElement; stage: HTMLElement } {
  let root = element.querySelector<HTMLElement>('.shm-jb');
  if (!root) {
    root = document.createElement('div');
    root.className = 'shm-jb';
    element.appendChild(root);
  }
  let stage = root.querySelector<HTMLElement>('.shm-jb-stage');
  if (!stage) {
    stage = document.createElement('div');
    stage.className = 'shm-jb-stage';
    root.appendChild(stage);
  }
  return { root, stage };
}

export default async function jobBoard(ctx: WidgetContext): Promise<void> {
  const element = ctx?.element;
  if (!element || typeof element.querySelector !== 'function') return;
  const data = ctx.data ?? {};
  const inEditor = !!data.inEditor;
  const s = readSettings(data.config ?? {});
  const { root, stage } = ensureRoot(element);
  const run = (runs.get(element) ?? 0) + 1;
  runs.set(element, run);
  const id = `shm-jb-${(uid += 1)}`;

  try {
    const { jobs, source } = await loadJobsFrom(s.jobsCollection, ctx.shazamme, data, inEditor);
    if (runs.get(element) !== run) return;
    release(element);
    teardowns.set(element, mountBoard(stage, jobs, source, s, inEditor, id));
  } catch (err) {
    if (runs.get(element) !== run) return;
    console.error(`[${NAME}]`, err);
    release(element);
    teardowns.set(element, mountBoard(stage, [], 'feed', s, inEditor, id));
    if (inEditor) {
      const note = stage.querySelector<HTMLElement>('.shm-jb-note');
      if (note) note.textContent = `Job Board could not read any jobs: ${err instanceof Error ? err.message : String(err)}`;
    }
  } finally {
    if (runs.get(element) === run) root.classList.add('is-ready');
  }
}

// job-results widget controller — merges the 2026 (3-level hierarchy) and
// proximity (geocode + map) references onto the shared core. Everything slow in
// the legacy widgets is delegated to core: fetch-once model (no `limit`),
// memoized query, keyed card render, bind-once delegation, lazy non-Google map.
//
// Registered by the build as window.ShazammeWidget["job-results"]; Duda calls
// the default export with { element, data, $, shazamme }.

import { readConfig, type DudaData, type WidgetConfig } from '../../core/config';
import { wrapSdk, type Sdk, type ShazammeClient } from '../../core/sdk';
import { loadJobs, buildModel } from '../../core/jobs';
import type { Job, JobsModel, FilterState } from '../../core/types';
import { toggleFacet, type FacetTree } from '../../core/hierarchy';
import { geocode, debounce, type GeocodeResult } from '../../core/geo';
import { delegate, setHtml } from '../../core/dom';
import {
  onFilterChange,
  loginChannel,
  resultsReadyChannel,
  type LoginPayload,
} from '../../core/pubsub';
import { renderCards, renderCount, escapeHtml } from './cards';
import { renderPaging } from './paging';
import { buildFacetTree, renderFacets, MASTER_LEVELS } from './facets';
import { MapView } from './map-view';
import {
  initialState,
  patch,
  toFilterInput,
  DEFAULT_GEO_RANGE,
  type QueryState,
} from './state';

interface WidgetContext {
  element: HTMLElement;
  data: DudaData;
  $: unknown;
  shazamme: ShazammeClient;
}

const GEOCODE_DEBOUNCE_MS = 500;
const INPUT_DEBOUNCE_MS = 400;
// Cap how long we wait on the SDK's ready() so a never-resolving second ready()
// call (fast cached/2nd load) can't hang the widget forever.
const SDK_READY_TIMEOUT_MS = 1200;

const FAKE_JOBS: Job[] = [
  { jobID: '1', jobName: 'Senior Nurse', category: 'Healthcare', jobType: 'Permanent', jobTypeID: 'perm', professionID: 'health', city: 'London', state: 'England', workType: 'Full Time', changedOnUTC: new Date().toISOString() },
  { jobID: '2', jobName: 'Site Engineer', category: 'Construction', jobType: 'Contract', jobTypeID: 'contract', professionID: 'build', city: 'Manchester', state: 'England', workType: 'Contract', changedOnUTC: new Date().toISOString() },
];

function $one<T extends Element = Element>(root: Element, sel: string): T | null {
  return root.querySelector<T>(sel);
}

function readHash(): Partial<QueryState> {
  try {
    const raw = window.location.hash.replace(/^#/, '');
    if (!raw) return {};
    const parsed = JSON.parse(decodeURIComponent(raw)) as { facets?: FilterState; keyword?: string };
    return { facets: parsed.facets ?? {}, keyword: parsed.keyword ?? '' };
  } catch {
    return {};
  }
}

function writeHash(state: QueryState): void {
  const payload = JSON.stringify({ facets: state.facets, keyword: state.keyword });
  window.history.replaceState(null, '', `#${encodeURIComponent(payload)}`);
}

// Duda widgets initialise the injected SDK with shazamme.ready(dudaSiteID, page),
// which sets its internal _sid. If our controller runs BEFORE that — a race on
// pages where another widget bootstraps the SDK, or the norm on a page that has
// only this widget — an early site() call fires with no dudaSiteID and the SDK's
// site() hangs (it has no error path), so the widget never renders. Ensure the
// SDK is ready first, seeding the dudaSiteID from the Duda-provided data.
async function ensureSdkReady(shazamme: ShazammeClient, data: DudaData): Promise<void> {
  const s = shazamme as unknown as {
    _sid?: string;
    _site?: unknown;
    ready?: (sid: string, page?: unknown) => unknown;
  };
  const d = data as { siteId?: string; siteID?: string; page?: unknown };
  const sid = s._sid || d.siteId || d.siteID;
  if (!sid) return;
  s._sid = s._sid || sid;
  // If the SDK already resolved its site, it's ready — do NOT await ready() again.
  // On a fast cached/2nd load the page has already called ready(); a second call
  // can hand back a promise that never resolves, hanging the widget so it never
  // renders/reveals (looks like "1st load ok, 2nd not"). Otherwise await ready()
  // but cap it with a timeout so we can never hang on it.
  if (s._site) return;
  if (typeof s.ready === 'function') {
    try {
      await Promise.race([
        Promise.resolve(s.ready(s._sid, d.page)),
        new Promise<void>((resolve) => setTimeout(resolve, SDK_READY_TIMEOUT_MS)),
      ]);
    } catch { /* ignore */ }
  }
}

export default function jobResults(ctx: WidgetContext): void {
  const { element, data, shazamme } = ctx;
  const cfg: WidgetConfig = readConfig(data);
  const sdk: Sdk = wrapSdk(shazamme);
  const proximityEnabled = cfg.showLocationFilter && cfg.geocodeApiKey.trim() !== '';

  // Required DOM anchors from template.html.
  const details = $one(element, '.section-details');
  const listEl = $one(element, '[data-rel="job-results-list"]');
  const pagingEl = $one(element, '[data-rel="job-results-paging"]');
  const facetHost = $one(element, '[data-rel="filter-attribute"]');
  const sidebar = $one(element, '[data-rel="filter-sidebar"]');
  const actionBar = $one(element, '[data-rel="action-bar"]');
  const mapWrap = $one<HTMLElement>(element, '[data-rel="job-results-map"]');
  const mapContainer = $one<HTMLElement>(element, '#shmMap');
  const listWrap = $one<HTMLElement>(element, '.shmResultViewPagination');
  if (!details || !listEl || !pagingEl || !facetHost || !sidebar) return;

  let model: JobsModel;
  let tree: FacetTree;
  let state: QueryState = { ...initialState(), ...readHash() };
  let lastPage: readonly Job[] = [];
  let currentUser: LoginPayload | null = null;
  const mapView = mapContainer ? new MapView(mapContainer) : null;

  // Hide the widget until the first render so the raw template (search bar, filter
  // panels) never flashes before config visibility + cards are applied (FOUC).
  const mainContainer = $one<HTMLElement>(element, '[data-shm-main]') ?? (element as HTMLElement);
  mainContainer.style.visibility = 'hidden';
  let revealed = false;

  function render(): void {
    const input = toFilterInput(state) as unknown as FilterState;
    const result = model.query(input, state.sort, state.page, cfg.pageSize);
    lastPage = result.page;
    renderCards(listEl!, result, cfg);
    renderCount(element, result.total);
    renderPaging(pagingEl!, result.total, cfg.pageSize, state.page);
    renderFacets(facetHost!, tree, cfg, state.facets);
    if (mapView?.isReady) mapView.setJobs(result.page);
    writeHash(state);
    resultsReadyChannel.publish(sdk, { total: result.total });
    if (!revealed) {
      revealed = true;
      // Reveal must survive Duda re-asserting the widget root's class attribute
      // (which strips the runtime-added `shm-ready`). Inline `visibility:visible
      // !important` wins over the CSS `:not(.shm-ready){visibility:hidden!important}`
      // hide regardless of the class; the class add covers non-Duda contexts.
      mainContainer.classList.add('shm-ready');
      mainContainer.style.setProperty('visibility', 'visible', 'important');
    }
  }

  function applyConfigVisibility(): void {
    const locationBlock = $one<HTMLElement>(element, '[data-rel="filter-location-block"]');
    const proximityBlock = $one<HTMLElement>(element, '[data-rel="filter-proximity-block"]');
    if (locationBlock) locationBlock.hidden = !cfg.showLocationFilter;
    if (proximityBlock) proximityBlock.hidden = !proximityEnabled;
    const display = $one(element, '[data-rel="geo-range-display"]');
    if (display) display.textContent = `${state.geoRange} ${cfg.proximityDiameter === '6371' ? 'mi' : 'km'}`;
  }

  function setView(view: string | null): void {
    const isMap = view === 'Map';
    if (mapWrap) mapWrap.hidden = !isMap;
    if (listWrap) listWrap.hidden = isMap;
    actionBar
      ?.querySelectorAll('[data-toggle="results-view"]')
      .forEach((b) => b.classList.toggle('active', b.getAttribute('data-view') === view));
    if (isMap && mapView) {
      mapView.setJobs(lastPage);
      mapView.ensure().catch(() => undefined);
    }
  }

  function showPredictions(results: GeocodeResult[]): void {
    const host = $one<HTMLElement>(element, '[data-rel="geo-prediction"]');
    if (!host) return;
    if (results.length === 0) {
      setHtml(host, '');
      host.style.display = 'none';
      return;
    }
    const rows = results
      .slice(0, 6)
      .map(
        (r) =>
          `<a href="javascript:void(0)" class="result-text" data-value="${r.lat},${r.lon}" data-label="${escapeHtml(r.label)}">${escapeHtml(r.label)}</a>`,
      )
      .join('');
    setHtml(host, `${rows}<a href="javascript:void(0)" class="result-text close" data-value="" data-label="">close</a>`);
    host.style.display = 'flex';
  }

  const runGeocode = debounce((term: string) => {
    geocode(term, cfg.geocodeApiKey)
      .then(showPredictions)
      .catch(() => undefined);
  }, GEOCODE_DEBOUNCE_MS);

  const applyKeyword = debounce((field: string, value: string) => {
    if (field === 'keyword') {
      state = patch(state, { keyword: value, page: 0 });
    } else if (field === 'location') {
      state = patch(state, { location: value, geo: null, geoAddress: '', page: 0 });
      if (proximityEnabled && value.trim() !== '') runGeocode(value);
    }
    render();
  }, INPUT_DEBOUNCE_MS);

  function wireEvents(): void {
    // Facet checkbox toggle — parent auto-select + child cascade via core.
    delegate(sidebar!, 'click', '[data-rel="filter-toggle"]', (ev, matched) => {
      ev.preventDefault();
      const field = matched.getAttribute('data-filter-type');
      const id = matched.getAttribute('data-filter-value');
      if (!field || !id) return;
      state = patch(state, { facets: toggleFacet(state.facets, tree, field, id), page: 0 });
      render();
    });

    // Keyword / location text inputs (debounced).
    delegate(sidebar!, 'input', '[data-rel="job-result-filter-keyword"]', (_ev, matched) => {
      const field = matched.getAttribute('data-keyword-field') ?? '';
      applyKeyword(field, (matched as HTMLInputElement).value);
    });

    // Clear buttons.
    delegate(sidebar!, 'click', '[data-rel="job-result-filter-keyword-clear"]', (_ev, matched) => {
      const field = matched.getAttribute('data-keyword-field');
      if (field === 'keyword') state = patch(state, { keyword: '', page: 0 });
      else if (field === 'location') state = patch(state, { location: '', geo: null, geoAddress: '', page: 0 });
      const input = sidebar!.querySelector<HTMLInputElement>(`[data-keyword-field="${field}"]`);
      if (input) input.value = '';
      render();
    });

    // Proximity prediction selection.
    delegate(sidebar!, 'click', '[data-rel="geo-prediction"] .result-text', (ev, matched) => {
      ev.preventDefault();
      const value = matched.getAttribute('data-value') ?? '';
      const label = matched.getAttribute('data-label') ?? '';
      const host = $one<HTMLElement>(element, '[data-rel="geo-prediction"]');
      if (host) host.style.display = 'none';
      if (value === '') return;
      const [lat, lon] = value.split(',').map((n) => parseFloat(n));
      const input = sidebar!.querySelector<HTMLInputElement>('[data-keyword-field="location"]');
      if (input) input.value = label;
      state = patch(state, { geo: { lat, lon }, geoAddress: label, location: '', page: 0 });
      render();
    });

    // Radius slider.
    delegate(sidebar!, 'input', '[data-filter="geoRange"]', (_ev, matched) => {
      const val = parseInt((matched as HTMLInputElement).value, 10) || DEFAULT_GEO_RANGE;
      const display = $one(element, '[data-rel="geo-range-display"]');
      if (display) display.textContent = `${val} ${cfg.proximityDiameter === '6371' ? 'mi' : 'km'}`;
      state = patch(state, { geoRange: val, page: 0 });
      if (state.geo) render();
    });

    // Sort selection.
    if (actionBar) {
      delegate(actionBar, 'click', '[data-sort-field]', (ev, matched) => {
        ev.preventDefault();
        const field = matched.getAttribute('data-sort-field');
        const direction = matched.getAttribute('data-sort-direction');
        if (!field || !direction) return;
        actionBar.querySelectorAll('[data-sort-field]').forEach((n) => n.classList.remove('active'));
        matched.classList.add('active');
        state = patch(state, { sort: { field, direction: direction === 'asc' ? 'asc' : 'desc' }, page: 0 });
        render();
      });

      // List / Map view toggle.
      delegate(actionBar, 'click', '[data-toggle="results-view"]', (ev, matched) => {
        ev.preventDefault();
        setView(matched.getAttribute('data-view'));
      });
    }

    // Pagination.
    delegate(details!, 'click', '[data-rel="paging-select"]', (ev, matched) => {
      ev.preventDefault();
      const p = parseInt(matched.getAttribute('data-page-number') ?? '0', 10);
      state = patch(state, { page: Number.isNaN(p) ? 0 : p });
      render();
    });

    // Save / unsave job.
    delegate(details!, 'click', '[data-rel="action-save-job"], [data-rel="action-unsave-job"]', (ev, matched) => {
      ev.preventDefault();
      const card = matched.closest('[data-rel="article-job-result"]');
      const jobID = card?.getAttribute('data-id') ?? '';
      if (jobID === '') return;
      const saving = matched.getAttribute('data-rel') === 'action-save-job';
      matched.classList.toggle('active', saving);
      matched.setAttribute('data-rel', saving ? 'action-unsave-job' : 'action-save-job');
      const action = saving ? 'Save Job' : 'Delete Saved Job';
      sdk.submit(action, { jobID, candidateID: currentUser?.userID }).catch(() => undefined);
    });
  }

  function subscribe(): void {
    onFilterChange(sdk, (payload) => {
      state = patch(state, {
        facets: payload.state ?? {},
        keyword: payload.keyword ?? '',
        geo: payload.geo ?? null,
        geoRange: payload.geoRange ?? state.geoRange,
        page: 0,
      });
      render();
    });
    loginChannel.subscribe(sdk, (user) => {
      currentUser = user;
    });
  }

  (async (): Promise<void> => {
    await ensureSdkReady(shazamme, data);
    try {
      model = await loadJobs(sdk, cfg, { levels: MASTER_LEVELS });
    } catch {
      // Fall back to sample cards only if the live fetch fails (e.g. no SDK in
      // a bare editor context) — real jobs are always attempted first.
      model = buildModel(FAKE_JOBS, cfg, { levels: MASTER_LEVELS });
    }
    tree = buildFacetTree(model.all());
    applyConfigVisibility();
    wireEvents();
    subscribe();
    render();
  })();
}

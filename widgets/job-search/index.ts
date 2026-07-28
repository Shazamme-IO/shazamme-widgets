// job-search widget controller — the search bar. Collapses the two legacy forks
// (jobsearch2026 + jobsearch2026prox) into ONE parameterised widget on the shared
// core. It publishes ONE FilterChangePayload on 'job-search-submit' when the user
// submits (fix #10: set state, then a single publish — never a per-change
// fan-out), and the separate results widget applies it over the pub/sub bus.
//
// Registered by the build as window.ShazammeWidget["job-search"]; Duda calls the
// default export with { element, data, $, shazamme }.

import { readConfig, type DudaData, type WidgetConfig } from '../../core/config';
import { wrapSdk, type Sdk, type ShazammeClient } from '../../core/sdk';
import { loadJobs, buildModel } from '../../core/jobs';
import { buildHierarchy, type FacetTree } from '../../core/hierarchy';
import type { Job, FacetNode, GeoPoint } from '../../core/types';
import { delegate } from '../../core/dom';
import { publishFilterChange, resultsReadyChannel } from '../../core/pubsub';
import { renderSuggestions, makeGeocodeRunner } from './suggest';
import {
  emptyForm,
  patchForm,
  isEmpty,
  toPayload,
  readHash,
  readSearchConfig,
  rangeUnit,
  DEFAULT_GEO_RANGE,
  SEARCH_LEVELS,
  type FormState,
  type SearchConfig,
} from './form-state';

interface WidgetContext {
  element: HTMLElement;
  data: DudaData;
  $: unknown;
  shazamme: ShazammeClient;
}

const FAKE_JOBS: Job[] = [
  { jobID: '1', jobName: 'Senior Nurse', category: 'Healthcare', professionID: 'health', jobType: 'Permanent', jobTypeID: 'perm', roleID: 'nurse', subCategory: 'Nurse', workType: 'Full Time', workTypeID: 'ft', state: 'England', changedOnUTC: new Date().toISOString() },
  { jobID: '2', jobName: 'Site Engineer', category: 'Construction', professionID: 'build', jobType: 'Contract', jobTypeID: 'contract', roleID: 'eng', subCategory: 'Engineer', workType: 'Contract', workTypeID: 'ct', state: 'Scotland', changedOnUTC: new Date().toISOString() },
];

function $one<T extends Element = Element>(root: Element, sel: string): T | null {
  return root.querySelector<T>(sel);
}

function optionsHtml(nodes: readonly FacetNode[], placeholder: string): string {
  const opts = nodes
    .slice()
    .sort((a, b) => (a.value.toLowerCase() < b.value.toLowerCase() ? -1 : 1))
    .map((n) => `<option value="${n.id}">${n.value}</option>`)
    .join('');
  return `<option value="">${placeholder}</option>${opts}`;
}

// Ensure the injected SDK is initialised (shazamme.ready sets its dudaSiteID)
// before we call loadJobs. If our controller runs first, an early site() call
// fires with no dudaSiteID and the SDK's site() hangs — the dropdowns then never
// populate. Seed readiness from the Duda-provided data.
function ensureSdkReady(shazamme: ShazammeClient, data: DudaData): void {
  const s = shazamme as unknown as {
    _sid?: string;
    ready?: (sid: string, page?: unknown) => unknown;
  };
  const d = data as { siteId?: string; siteID?: string; page?: unknown };
  const sid = s._sid || d.siteId || d.siteID;
  if (!sid) return;
  // Seed the dudaSiteID and kick the SDK's bootstrap once without blocking on it;
  // loadJobs awaits site() itself, so we never wait on ready()'s slower work.
  s._sid = s._sid || sid;
  if (typeof s.ready === 'function') {
    try { s.ready(s._sid, d.page); } catch { /* ignore */ }
  }
}

export default function jobSearch(ctx: WidgetContext): void {
  const { element, data, shazamme } = ctx;
  const cfg: WidgetConfig = readConfig(data);
  const search: SearchConfig = readSearchConfig(data);
  const sdk: Sdk = wrapSdk(shazamme);
  const proximityEnabled = search.showGeoSearch && cfg.geocodeApiKey.trim() !== '';

  const form = $one(element, '[data-rel="search-form"]');
  const button = $one(element, '[data-rel="search-button"]');
  if (!form || !button) return;

  let tree: FacetTree | null = null;
  let state: FormState = { ...emptyForm(), ...readHash() };

  function selectEl(field: string): HTMLSelectElement | null {
    return $one<HTMLSelectElement>(form!, `select[data-filter="${field}"]`);
  }

  function populateSelect(field: string, placeholder: string, nodes: readonly FacetNode[]): void {
    const sel = selectEl(field);
    if (!sel) return;
    const keep = sel.value;
    sel.innerHTML = optionsHtml(nodes, placeholder);
    sel.value = keep;
  }

  function refreshRoles(): void {
    if (!tree) return;
    const prof = (state.facets.professionID ?? [])[0];
    const nodes = prof ? tree.children('roleID', prof) : tree.index.roleID ?? [];
    populateSelect('roleID', 'All Sub Classifications', nodes);
  }

  function populateAll(): void {
    if (!tree) return;
    populateSelect('jobTypeID', 'All Job Types', tree.index.jobTypeID ?? []);
    populateSelect('professionID', 'All Classifications', tree.index.professionID ?? []);
    populateSelect('workTypeID', 'All Work Types', tree.index.workTypeID ?? []);
    populateSelect('workModelID', 'All Work Models', tree.index.workModelID ?? []);
    populateSelect('state', 'All Locations', tree.index.state ?? []);
    refreshRoles();
  }

  function applyStateToForm(): void {
    for (const [field, ids] of Object.entries(state.facets)) {
      const sel = selectEl(field);
      if (sel) sel.value = ids[0] ?? '';
    }
    const keyword = $one<HTMLInputElement>(form!, '[data-rel="search-keyword"]');
    if (keyword) keyword.value = state.keyword;
    const geoInput = $one<HTMLInputElement>(form!, '[data-rel="geo-input"]');
    if (geoInput) geoInput.value = state.geoAddress;
    updateRangeDisplay();
  }

  function updateRangeDisplay(): void {
    const display = $one(element, '[data-rel="geo-range-display"]');
    if (display) display.textContent = `${state.geoRange} ${rangeUnit(cfg.proximityDiameter)}`;
  }

  function applyVisibility(): void {
    const setShown = (rel: string, shown: boolean): void => {
      const node = $one<HTMLElement>(form!, `[data-rel="${rel}"]`);
      if (node) node.hidden = !shown;
    };
    setShown('field-keyword', search.showKeyword);
    setShown('field-jobType', search.showJobType);
    setShown('field-classification', search.showClassification);
    setShown('field-subClassification', search.showSubClassification);
    setShown('field-workType', search.showWorkType);
    setShown('field-workModel', search.showWorkModel);
    setShown('field-location', search.showLocation);
    setShown('field-geo', proximityEnabled);
    const label = button!.querySelector('.text');
    if (label) label.textContent = search.buttonText;
  }

  /** Read the live form controls into a fresh FormState (geo carried from state). */
  function readForm(): FormState {
    const facets: Record<string, string[]> = {};
    form!.querySelectorAll<HTMLSelectElement>('select[data-filter]').forEach((sel) => {
      const field = sel.getAttribute('data-filter');
      if (field && sel.value) facets[field] = [sel.value];
    });
    const keywordEl = $one<HTMLInputElement>(form!, '[data-rel="search-keyword"]');
    const keyword = keywordEl ? keywordEl.value.trim() : '';
    return patchForm(state, { facets, keyword });
  }

  function submit(): void {
    state = readForm();
    publishFilterChange(sdk, toPayload(state));
  }

  const runGeocode = makeGeocodeRunner(cfg.geocodeApiKey, (results) => {
    const host = $one<HTMLElement>(element, '[data-rel="geo-prediction"]');
    if (host) renderSuggestions(host, results);
  });

  function wireEvents(): void {
    // Single publish on explicit submit only (fix #10).
    button!.addEventListener('click', (ev) => {
      ev.preventDefault();
      submit();
    });

    // Enter in any text input submits once.
    delegate(form!, 'keydown', 'input[type="text"], input:not([type])', (ev) => {
      if ((ev as KeyboardEvent).key === 'Enter') {
        ev.preventDefault();
        submit();
      }
    });

    // Dependent dropdown: profession drives role options. No publish.
    delegate(form!, 'change', 'select[data-filter="professionID"]', (_ev, matched) => {
      const val = (matched as HTMLSelectElement).value;
      state = patchForm(state, {
        facets: val ? { ...state.facets, professionID: [val] } : dropKey(state.facets, 'professionID'),
      });
      // Selecting a new classification resets the sub-classification.
      state = patchForm(state, { facets: dropKey(state.facets, 'roleID') });
      const roleSel = selectEl('roleID');
      if (roleSel) roleSel.value = '';
      refreshRoles();
    });

    if (!proximityEnabled) return;

    // Location text -> debounced geocode (resolve geometry on SELECTION only).
    delegate(form!, 'input', '[data-rel="geo-input"]', (_ev, matched) => {
      const value = (matched as HTMLInputElement).value;
      state = patchForm(state, { geo: null, geoAddress: '' });
      if (value.trim() !== '') runGeocode(value);
      else hidePredictions();
    });

    // Suggestion selection -> capture the GeoPoint. No publish (wait for submit).
    delegate(element, 'click', '[data-rel="geo-prediction"] .result-text', (ev, matched) => {
      ev.preventDefault();
      const raw = matched.getAttribute('data-value') ?? '';
      const label = matched.getAttribute('data-label') ?? '';
      hidePredictions();
      const geoInput = $one<HTMLInputElement>(form!, '[data-rel="geo-input"]');
      if (raw === '') return;
      const [lat, lon] = raw.split(',').map((n) => parseFloat(n));
      const geo: GeoPoint = { lat, lon };
      if (geoInput) geoInput.value = label;
      state = patchForm(state, { geo, geoAddress: label });
    });

    // Radius control.
    delegate(form!, 'input', '[data-rel="geo-range"]', (_ev, matched) => {
      const val = parseInt((matched as HTMLInputElement).value, 10) || DEFAULT_GEO_RANGE;
      state = patchForm(state, { geoRange: val });
      updateRangeDisplay();
    });
  }

  function hidePredictions(): void {
    const host = $one<HTMLElement>(element, '[data-rel="geo-prediction"]');
    if (host) host.style.display = 'none';
  }

  function dropKey(facets: Record<string, string[]>, key: string): Record<string, string[]> {
    const next = { ...facets };
    delete next[key];
    return next;
  }

  function subscribeCounter(): void {
    const counter = $one(element, '[data-rel="results-count"]');
    if (!counter) return;
    resultsReadyChannel.subscribe(sdk, (payload) => {
      counter.textContent = String(payload.total);
    });
  }

  (async (): Promise<void> => {
    ensureSdkReady(shazamme, data);
    try {
      const model = data.inEditor
        ? buildModel(FAKE_JOBS, cfg, { levels: SEARCH_LEVELS })
        : await loadJobs(sdk, cfg, { levels: SEARCH_LEVELS });
      tree = buildHierarchy(
        model.all().map((j) => ({ data: j as Record<string, unknown> })),
        { levels: SEARCH_LEVELS },
      );
    } catch {
      return;
    }
    applyVisibility();
    populateAll();
    applyStateToForm();
    wireEvents();
    if (!data.inEditor) {
      subscribeCounter();
      // Pre-fill came from the hash — publish once so results filter immediately.
      if (!isEmpty(state)) publishFilterChange(sdk, toPayload(state));
    }
  })();
}

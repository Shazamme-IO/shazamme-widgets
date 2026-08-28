// job-search widget controller — the search bar. Collapses the two legacy forks
// (jobsearch2026 + jobsearch2026prox) into ONE parameterised widget on the shared
// core. It publishes ONE FilterChangePayload on 'job-search-submit' when the user
// submits (fix #10: set state, then a single publish — never a per-change
// fan-out), and the separate results widget applies it over the pub/sub bus.
//
// Classification, sub-classification and location are custom MULTI-SELECT
// checkbox dropdowns (ported from the jobsearch2026 reference): each holds an
// array of ids in state.facets[field]; picking a classification resets the
// sub-classification and re-derives its options. Job type / work type / work
// model stay single native <select>s.
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

// The three multi-select fields and the classification→sub-classification link.
const MS_FIELDS = [
  { field: 'professionID', rel: 'field-classification' },
  { field: 'roleID', rel: 'field-subClassification' },
  { field: 'state', rel: 'field-location' },
] as const;
const MS_CLASS = 'professionID';
const MS_SUBCLASS = 'roleID';
const MS_FIELD_SET = new Set<string>(MS_FIELDS.map((m) => m.field));

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
// Cap how long we wait on the SDK's ready() so a never-resolving second ready()
// call (fast cached/2nd load) can't hang the widget forever.
const SDK_READY_TIMEOUT_MS = 1200;

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
  // can hand back a promise that never resolves, hanging the widget so the
  // dropdowns never populate ("1st load ok, 2nd not"). Otherwise await ready()
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

export default function jobSearch(ctx: WidgetContext): void {
  const { element, data, shazamme } = ctx;
  const cfg: WidgetConfig = readConfig(data);
  const search: SearchConfig = readSearchConfig(data);
  const sdk: Sdk = wrapSdk(shazamme);
  const proximityEnabled = search.showGeoSearch && cfg.geocodeApiKey.trim() !== '';

  const form = $one(element, '[data-rel="search-form"]');
  const button = $one(element, '[data-rel="search-button"]');
  if (!form || !button) return;

  // Hide until populated so the raw search bar doesn't flash at full size before
  // config visibility + dropdown options are applied (FOUC).
  const root = $one<HTMLElement>(element, '.job-search-root') ?? (element as HTMLElement);
  root.style.visibility = 'hidden';
  // Reveal must survive Duda re-asserting the widget root's class attribute
  // (which strips our runtime-added `shm-ready`). Inline `visibility:visible
  // !important` wins over the CSS `:not(.shm-ready){visibility:hidden!important}`
  // hide regardless of the class; the class add covers non-Duda contexts.
  const reveal = (): void => {
    root.classList.add('shm-ready');
    root.style.setProperty('visibility', 'visible', 'important');
  };

  // Force the native fields' look inline so no host theme can override it. Duda
  // themes generic input/select (e.g. an ID-scoped `!important` grey background
  // on text inputs) at a specificity even a scoped injected stylesheet can't
  // beat — but an inline style is top of the cascade. Keeps every field matched
  // to the multi-select boxes (46px, white, 1.5px border). `background-color`
  // (not `background`) preserves the select's custom arrow image.
  function normalizeFields(): void {
    root.querySelectorAll<HTMLElement>('.flex-items-js input, .flex-items-js select').forEach((el) => {
      el.style.setProperty('height', '46px', 'important');
      el.style.setProperty('background-color', '#fff', 'important');
      el.style.setProperty('border', '1.5px solid #d1d1d1', 'important');
      el.style.setProperty('box-sizing', 'border-box', 'important');
      el.style.setProperty('color', '#222', 'important');
      // Duda themes input/select with a margin-bottom (3px), which makes the
      // native columns taller than the multi-select boxes and, since the bar is
      // bottom-aligned, drops the multi-selects 3px lower. Zero it so every field
      // lines up. (Column spacing lives on .flex-items-js, not the field.)
      el.style.setProperty('margin', '0', 'important');
    });
  }

  // Duda re-asserts the widget's HTML shortly after we mount (same behaviour the
  // reveal() comment describes), REPLACING the field elements with fresh ones
  // that lack our inline styles — so a one-time normalizeFields() gets thrown
  // away. Re-apply whenever the form's descendants change. Observe childList
  // only (element add/remove), never attributes, so our own inline style writes
  // don't re-trigger the observer.
  function guardFields(): void {
    normalizeFields();
    try {
      new MutationObserver(() => normalizeFields()).observe(form!, {
        childList: true,
        subtree: true,
      });
    } catch { /* ignore */ }
  }

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

  function dropKey(facets: Record<string, string[]>, key: string): Record<string, string[]> {
    const next = { ...facets };
    delete next[key];
    return next;
  }

  function escapeHtml(s: string): string {
    return s.replace(/[&<>"']/g, (c) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string),
    );
  }

  // --- Multi-select (classification / sub-classification / location) -------
  function msWrapper(field: string): HTMLElement | null {
    return $one<HTMLElement>(form!, `[data-ms-field="${field}"]`);
  }

  /** Role options depend on the selected classifications (union of children). */
  function roleNodes(): readonly FacetNode[] {
    if (!tree) return [];
    const profs = state.facets.professionID ?? [];
    if (!profs.length) return tree.index.roleID ?? [];
    const seen = new Map<string, FacetNode>();
    for (const p of profs) for (const n of tree.children('roleID', p)) seen.set(n.id, n);
    return [...seen.values()];
  }

  function nodesForField(field: string): readonly FacetNode[] {
    if (!tree) return [];
    if (field === MS_SUBCLASS) return roleNodes();
    return tree.index[field] ?? [];
  }

  function labelFor(field: string, id: string): string {
    return nodesForField(field).find((n) => n.id === id)?.value ?? id;
  }

  function renderMsDropdown(field: string): void {
    const wrap = msWrapper(field);
    const dd = wrap ? $one<HTMLElement>(wrap, '[data-rel="ms-dropdown"]') : null;
    if (!dd) return;
    const selected = new Set(state.facets[field] ?? []);
    const nodes = nodesForField(field)
      .slice()
      .sort((a, b) => (a.value.toLowerCase() < b.value.toLowerCase() ? -1 : 1));
    if (!nodes.length) {
      dd.innerHTML = '<div class="ms-empty">No options available</div>';
      return;
    }
    dd.innerHTML = nodes
      .map(
        (n) =>
          `<label class="ms-option"><input type="checkbox" value="${escapeHtml(n.id)}"` +
          `${selected.has(n.id) ? ' checked' : ''} />` +
          `<span class="ms-option-label">${escapeHtml(n.value)}</span></label>`,
      )
      .join('');
  }

  function renderMsBox(field: string): void {
    const wrap = msWrapper(field);
    const box = wrap ? $one<HTMLElement>(wrap, '[data-rel="ms-box"]') : null;
    if (!box) return;
    const placeholder = $one<HTMLElement>(box, '.multi-select-placeholder');
    const count = (state.facets[field] ?? []).length;
    box.querySelector('.ms-count')?.remove();
    if (count === 0) {
      if (placeholder) placeholder.style.display = '';
    } else {
      if (placeholder) placeholder.style.display = 'none';
      const span = document.createElement('span');
      span.className = 'ms-count';
      span.textContent = count === 1 ? '1 selected' : `${count} selected`;
      box.insertBefore(span, box.querySelector('.multi-select-arrow'));
    }
  }

  function updateSubLock(): void {
    const wrap = msWrapper(MS_SUBCLASS);
    const box = wrap ? $one<HTMLElement>(wrap, '[data-rel="ms-box"]') : null;
    if (!box) return;
    const hasClass = (state.facets[MS_CLASS] ?? []).length > 0;
    box.classList.toggle('subcategory-disabled', !hasClass);
    if (!hasClass) box.classList.remove('open');
  }

  function renderMsField(field: string): void {
    renderMsDropdown(field);
    renderMsBox(field);
  }

  function renderAllMs(): void {
    for (const { field } of MS_FIELDS) renderMsField(field);
    updateSubLock();
  }

  function toggleMsSelection(field: string, id: string, checked: boolean): void {
    const current = state.facets[field] ?? [];
    const next = checked
      ? [...new Set([...current, id])]
      : current.filter((x) => x !== id);
    state = patchForm(state, {
      facets: next.length ? { ...state.facets, [field]: next } : dropKey(state.facets, field),
    });
    // Changing the classification set resets the sub-classification + its options.
    if (field === MS_CLASS) {
      state = patchForm(state, { facets: dropKey(state.facets, MS_SUBCLASS) });
      renderMsField(MS_SUBCLASS);
    }
    updateSubLock();
    renderMsBox(field);
    renderChips();
  }

  function closeAllMs(): void {
    form!
      .querySelectorAll('.multi-select-dropdown.open, .multi-select-box.open')
      .forEach((el) => el.classList.remove('open'));
  }

  function toggleMsDropdown(box: HTMLElement): void {
    const wrap = box.closest('.multi-select-wrapper');
    const dd = wrap ? wrap.querySelector('.multi-select-dropdown') : null;
    const isOpen = !!dd && dd.classList.contains('open');
    closeAllMs();
    if (!isOpen && dd) {
      dd.classList.add('open');
      box.classList.add('open');
    }
  }

  function populateAll(): void {
    if (!tree) return;
    populateSelect('jobTypeID', 'All Job Types', tree.index.jobTypeID ?? []);
    populateSelect('workTypeID', 'All Work Types', tree.index.workTypeID ?? []);
    populateSelect('workModelID', 'All Work Models', tree.index.workModelID ?? []);
    // Backward-compat: if a site still runs the pre-multi-select template, these
    // fields are native <select>s — populate them. populateSelect no-ops when the
    // field is multi-select markup (no <select>), and renderAllMs no-ops when the
    // multi-select wrappers are absent, so both templates work off one bundle.
    populateSelect('professionID', 'All Classifications', tree.index.professionID ?? []);
    populateSelect('roleID', 'All Sub Classifications', tree.index.roleID ?? []);
    populateSelect('state', 'All Locations', tree.index.state ?? []);
    renderAllMs();
  }

  function applyStateToForm(): void {
    form!.querySelectorAll<HTMLSelectElement>('select[data-filter]').forEach((sel) => {
      const field = sel.getAttribute('data-filter');
      if (field) sel.value = (state.facets[field] ?? [])[0] ?? '';
    });
    renderAllMs();
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
    // Single native selects.
    form!.querySelectorAll<HTMLSelectElement>('select[data-filter]').forEach((sel) => {
      const field = sel.getAttribute('data-filter');
      if (field && sel.value) facets[field] = [sel.value];
    });
    // Multi-select fields have no <select> — carry their arrays from state.
    for (const { field } of MS_FIELDS) {
      const ids = state.facets[field] ?? [];
      if (ids.length) facets[field] = ids;
    }
    const keywordEl = $one<HTMLInputElement>(form!, '[data-rel="search-keyword"]');
    const keyword = keywordEl ? keywordEl.value.trim() : '';
    return patchForm(state, { facets, keyword });
  }

  function submit(): void {
    state = readForm();
    // A foreign/legacy subscriber sharing the SDK bus can throw on our payload
    // shape (the SDK's pub loop has no per-subscriber isolation); that must not
    // break the search bar's own flow or leave the chips out of sync.
    try {
      publishFilterChange(sdk, toPayload(state));
    } catch (err) {
      console.warn('[job-search] filter subscriber threw', err);
    }
    renderChips();
  }

  // --- Active-filter chips ------------------------------------------------
  // Show each selection as a removable pill under the search bar. Multi-select
  // fields contribute one chip per selected id (so each can be removed
  // individually); single selects contribute one chip. The ✕ clears that
  // selection and re-applies immediately.
  function chipHtml(field: string, id: string, label: string): string {
    return (
      `<span style="display:inline-flex;align-items:center;gap:6px;padding:4px 10px;` +
      `background:#eef1f5;border-radius:16px;font-size:13px;line-height:1.4;color:#333;">` +
      `${escapeHtml(label)}` +
      `<button type="button" data-chip-remove="${escapeHtml(field)}" data-chip-id="${escapeHtml(id)}" ` +
      `aria-label="Remove ${escapeHtml(label)}" ` +
      `style="border:0;background:transparent;cursor:pointer;font-size:15px;` +
      `line-height:1;color:#666;padding:0;">&times;</button></span>`
    );
  }

  function chipContainer(): HTMLElement {
    let host = $one<HTMLElement>(element, '[data-rel="active-chips"]');
    if (!host) {
      host = document.createElement('div');
      host.setAttribute('data-rel', 'active-chips');
      host.style.cssText = 'display:none;flex-wrap:wrap;gap:8px;margin-top:10px;';
      form!.after(host);
    }
    return host;
  }

  function renderChips(): void {
    const host = chipContainer();
    const chips: string[] = [];
    // Multi-select: one chip per selected id.
    for (const { field } of MS_FIELDS) {
      for (const id of state.facets[field] ?? []) {
        chips.push(chipHtml(field, id, labelFor(field, id)));
      }
    }
    // Single native selects.
    form!.querySelectorAll<HTMLSelectElement>('select[data-filter]').forEach((sel) => {
      const field = sel.getAttribute('data-filter');
      if (!field || !sel.value) return;
      const label = sel.selectedOptions[0]?.text ?? sel.value;
      chips.push(chipHtml(field, '', label));
    });
    host.innerHTML = chips.join('');
    host.style.display = chips.length ? 'flex' : 'none';
  }

  function removeChip(field: string, id: string): void {
    if (MS_FIELD_SET.has(field) && id) {
      const next = (state.facets[field] ?? []).filter((x) => x !== id);
      state = patchForm(state, {
        facets: next.length ? { ...state.facets, [field]: next } : dropKey(state.facets, field),
      });
      if (field === MS_CLASS) {
        state = patchForm(state, { facets: dropKey(state.facets, MS_SUBCLASS) });
        renderMsField(MS_SUBCLASS);
      }
      renderMsField(field);
      updateSubLock();
    } else {
      const sel = selectEl(field);
      if (sel) sel.value = '';
      state = patchForm(state, { facets: dropKey(state.facets, field) });
    }
    submit(); // reads the form back into state, publishes, and re-renders chips
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

    // Single-select change re-renders the active-filter chips (live reflection).
    delegate(form!, 'change', 'select[data-filter]', () => renderChips());

    // Chip ✕ clears that selection and re-applies immediately.
    delegate(chipContainer(), 'click', '[data-chip-remove]', (ev, matched) => {
      ev.preventDefault();
      const field = matched.getAttribute('data-chip-remove');
      const id = matched.getAttribute('data-chip-id') ?? '';
      if (field) removeChip(field, id);
    });

    // Multi-select: open/close the dropdown on box click.
    delegate(form!, 'click', '[data-rel="ms-box"]', (ev, matched) => {
      ev.stopPropagation();
      if (matched.classList.contains('subcategory-disabled')) return;
      toggleMsDropdown(matched as HTMLElement);
    });

    // Multi-select: toggle a selection on checkbox change (live, no publish).
    delegate(form!, 'change', '.multi-select-dropdown input[type="checkbox"]', (_ev, matched) => {
      const input = matched as HTMLInputElement;
      const wrap = input.closest('[data-ms-field]');
      const field = wrap?.getAttribute('data-ms-field');
      if (field) toggleMsSelection(field, input.value, input.checked);
    });

    // Clicking inside a dropdown must not bubble to the box (would re-toggle).
    delegate(form!, 'click', '.multi-select-dropdown', (ev) => ev.stopPropagation());

    // Clicking anywhere else closes any open dropdown.
    document.addEventListener('click', closeAllMs);

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

  function subscribeCounter(): void {
    const counter = $one(element, '[data-rel="results-count"]');
    if (!counter) return;
    resultsReadyChannel.subscribe(sdk, (payload) => {
      counter.textContent = String(payload.total);
    });
  }

  (async (): Promise<void> => {
    await ensureSdkReady(shazamme, data);
    try {
      const model = data.inEditor
        ? buildModel(FAKE_JOBS, cfg, { levels: SEARCH_LEVELS })
        : await loadJobs(sdk, cfg, { levels: SEARCH_LEVELS });
      tree = buildHierarchy(
        model.all().map((j) => ({ data: j as Record<string, unknown> })),
        { levels: SEARCH_LEVELS },
      );
    } catch {
      reveal();
      return;
    }
    applyVisibility();
    populateAll();
    applyStateToForm();
    guardFields(); // force field look inline (survives Duda re-asserting the HTML)
    wireEvents();
    renderChips(); // reflect any hash-prefilled selections
    reveal();
    if (!data.inEditor) {
      subscribeCounter();
      // Pre-fill came from the hash — publish once so results filter immediately.
      if (!isEmpty(state)) publishFilterChange(sdk, toPayload(state));
    }
  })();
}

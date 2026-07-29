/* shazamme-widgets — shazamme-widgets v0.1.0
 * Built 2026-07-29T08:45:31.948Z. Registers window.ShazammeWidget["<name>"].
 */
"use strict";
var module = module || {};
module.exports = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // widgets/job-search/index.ts
  var index_exports = {};
  __export(index_exports, {
    default: () => jobSearch
  });

  // core/config.ts
  var DEFAULT_PAGE_SIZE = 20;
  var DEFAULT_PROXIMITY = "6371";
  function coerceBool(value, fallback = false) {
    if (typeof value === "boolean") return value;
    if (typeof value === "string") {
      const v = value.trim().toLowerCase();
      if (v === "true" || v === "1" || v === "yes" || v === "on") return true;
      if (v === "false" || v === "0" || v === "no" || v === "off" || v === "") return false;
    }
    if (typeof value === "number") return value !== 0;
    return fallback;
  }
  function coerceInt(value, fallback) {
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && value.trim() !== "") {
      const n = parseInt(value.trim(), 10);
      if (Number.isFinite(n)) return n;
    }
    return fallback;
  }
  function coerceStr(value, fallback = "") {
    if (typeof value === "string") return value;
    if (value == null) return fallback;
    return String(value);
  }
  function coerceProximity(value) {
    return coerceStr(value) === "12756" ? "12756" : DEFAULT_PROXIMITY;
  }
  function readConfig(data) {
    const c = data && data.config || {};
    return {
      jobCollection: coerceStr(c.JobCollection || c.jobCollection),
      applicationPage: coerceStr(c.applicationPage),
      detailsPage: coerceStr(c.detailsPage),
      showJobTypeFilter: coerceBool(c.showJobTypeFilter),
      showClassificationFilter: coerceBool(c.showClassificationFilter),
      showSubClassificationFilter: coerceBool(c.showSubClassificationFilter),
      useSubFilters: coerceBool(c.useSubFilters),
      showLocationFilter: coerceBool(c.showLocationFilter),
      proximityDiameter: coerceProximity(c.proximityDiameter),
      geocodeApiKey: coerceStr(c.geocodeApiKey),
      pageSize: coerceInt(c.pageSize, DEFAULT_PAGE_SIZE),
      hideLeftNav: coerceBool(c.hideLeftNav)
    };
  }

  // core/sdk.ts
  function jobsFetchDesc(siteID, name = "Get Jobs") {
    return {
      name,
      action: "Get Jobs",
      useCache: true,
      path: `/job-results/${siteID}`,
      isExternal: true
    };
  }
  var Sdk = class {
    constructor(client) {
      this.client = client;
    }
    /** Fetch the cached job collection for a site. Never passes `limit`. */
    fetchJobs(siteID) {
      return this.client.fetch(jobsFetchDesc(siteID));
    }
    /** Generic cached fetch (workModel / locationSeo lookups). */
    fetch(desc) {
      return this.client.fetch(desc);
    }
    submit(action, payload = {}) {
      return this.client.submit({ action, ...payload });
    }
    site() {
      return this.client.site();
    }
    pub(msg, payload) {
      this.client.pub(msg, payload);
    }
    sub(msg, cb) {
      this.client.sub(msg, cb);
    }
    unsub(msg, cb) {
      var _a, _b;
      (_b = (_a = this.client).unsub) == null ? void 0 : _b.call(_a, msg, cb);
    }
  };
  function wrapSdk(client) {
    return new Sdk(client);
  }

  // core/hierarchy.ts
  function toIndex(value, id, seo, parent) {
    return {
      value,
      id: id || value,
      seo: seo || id,
      parent: parent || void 0
    };
  }
  function readField(job, key) {
    const v = job[key];
    return v == null ? "" : String(v);
  }
  function resolveId(job, level) {
    return readField(job, String(level.idKey)) || readField(job, String(level.labelKey));
  }
  function buildHierarchy(jobs, opts) {
    var _a, _b;
    const { levels } = opts;
    const idKeyToLevel = /* @__PURE__ */ new Map();
    for (const l of levels) idKeyToLevel.set(String(l.idKey), l);
    const parentFieldMap = /* @__PURE__ */ new Map();
    const childFieldsMap = /* @__PURE__ */ new Map();
    for (const l of levels) {
      const parentLevel = l.parentField ? idKeyToLevel.get(String(l.parentField)) : void 0;
      parentFieldMap.set(l.field, parentLevel == null ? void 0 : parentLevel.field);
      if (parentLevel) {
        const arr = (_a = childFieldsMap.get(parentLevel.field)) != null ? _a : [];
        arr.push(l.field);
        childFieldsMap.set(parentLevel.field, arr);
      }
    }
    const index = {};
    const counts = {};
    const seen = {};
    for (const l of levels) {
      index[l.field] = [];
      counts[l.field] = {};
      seen[l.field] = /* @__PURE__ */ new Map();
    }
    for (const { data } of jobs) {
      for (const level of levels) {
        const id = resolveId(data, level);
        if (!id) continue;
        const value = readField(data, String(level.labelKey)) || id;
        const seo = level.seoKey ? readField(data, String(level.seoKey)) : "";
        let parent;
        if (level.parentField) {
          const parentLevel = idKeyToLevel.get(String(level.parentField));
          parent = parentLevel ? resolveId(data, parentLevel) || void 0 : readField(data, String(level.parentField)) || void 0;
        }
        counts[level.field][id] = ((_b = counts[level.field][id]) != null ? _b : 0) + 1;
        if (!seen[level.field].has(id)) {
          const node = toIndex(value, id, seo || void 0, parent);
          seen[level.field].set(id, node);
          index[level.field].push(node);
        }
      }
    }
    const nodeById = (field, id) => {
      var _a2;
      return (_a2 = seen[field]) == null ? void 0 : _a2.get(id);
    };
    const children = (field, parentId) => {
      var _a2;
      return ((_a2 = index[field]) != null ? _a2 : []).filter((n) => n.parent === parentId);
    };
    const roots = (field) => {
      var _a2;
      return ((_a2 = index[field]) != null ? _a2 : []).filter((n) => !n.parent);
    };
    return {
      index,
      counts,
      children,
      roots,
      levels,
      nodeById,
      parentField: (field) => parentFieldMap.get(field),
      childFields: (field) => {
        var _a2;
        return (_a2 = childFieldsMap.get(field)) != null ? _a2 : [];
      }
    };
  }

  // core/filters.ts
  var DEFAULT_KEYWORD_FIELDS = [
    "jobName",
    "title",
    "category",
    "subCategory",
    "city",
    "state",
    "country",
    "location",
    "fullDescription",
    "fullAddressForSearch",
    "referenceNumber",
    "tags"
  ];
  var LOCATION_FIELDS = [
    "fullAddress",
    "fullAddressForSearch",
    "city",
    "state",
    "country",
    "location"
  ];
  var MILES_TO_KM = 1.60934;
  var DEFAULT_RANGE = 50;
  var RESERVED = /* @__PURE__ */ new Set([
    "keyword",
    "geo",
    "geoRange",
    "geoAddress",
    "geoIn",
    "location",
    "salaryFrom",
    "salaryTo"
  ]);
  function includesCI(value, term) {
    if (typeof value !== "string") return false;
    return value.toLowerCase().includes(term);
  }
  function matchKeyword(job, term, fields = DEFAULT_KEYWORD_FIELDS) {
    const t = term.toLowerCase().trim();
    if (t === "") return true;
    return fields.some((f) => includesCI(job[f], t));
  }
  function matchLocation(job, term) {
    return matchKeyword(job, term, LOCATION_FIELDS);
  }
  function haversineKm(a, b) {
    const R = 6371;
    const toRad = (deg) => deg * Math.PI / 180;
    const dLat = toRad(b.lat - a.lat);
    const dLon = toRad(b.lon - a.lon);
    const h = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  }
  function rangeToKm(rawRange, proximityDiameter) {
    const isMiles = (proximityDiameter || "6371") !== "12756";
    return isMiles ? rawRange * MILES_TO_KM : rawRange;
  }
  function jobPoint(job) {
    const lat = parseFloat(String(job.latitude));
    const lon = parseFloat(String(job.longitude));
    if (job.latitude == null || job.longitude == null || isNaN(lat) || isNaN(lon)) {
      return null;
    }
    return { lat, lon };
  }
  function withinRange(job, geo, rangeKm) {
    if (!geo || geo.length === 0) return true;
    const p = jobPoint(job);
    if (!p) return false;
    return geo.some((g) => haversineKm(g, p) <= rangeKm);
  }
  function asStrings(v) {
    return (v != null ? v : []).map((x) => String(x));
  }
  function applyFilters(jobs, state, opts = {}) {
    var _a, _b;
    const keys = Object.keys(state);
    if (keys.length === 0) return jobs.slice();
    const keywordTerms = asStrings(state.keyword);
    const locationTerms = asStrings(state.location);
    const geoPoints = (_a = state.geo) != null ? _a : [];
    const hasGeo = geoPoints.length > 0;
    const rawRange = state.geoRange && state.geoRange[0] != null ? parseFloat(String(state.geoRange[0])) : (_b = opts.defaultRange) != null ? _b : DEFAULT_RANGE;
    const rangeKm = rangeToKm(rawRange, opts.proximityDiameter);
    return jobs.filter((job) => {
      var _a2;
      if (keywordTerms.length > 0 && !keywordTerms.some((t) => matchKeyword(job, t, opts.keywordFields))) {
        return false;
      }
      if (locationTerms.length > 0 && !locationTerms.some((t) => matchLocation(job, t))) {
        return false;
      }
      if (hasGeo && !withinRange(job, geoPoints, rangeKm)) {
        return false;
      }
      for (const f of keys) {
        if (RESERVED.has(f)) continue;
        const vals = asStrings(state[f]);
        if (vals.length === 0) continue;
        const jobVal = String((_a2 = job[f]) != null ? _a2 : "");
        if (!vals.includes(jobVal)) return false;
      }
      return true;
    });
  }

  // core/jobs.ts
  var DEFAULT_LEVELS = [
    { field: "jobTypeID", labelKey: "jobType", idKey: "jobTypeID" },
    { field: "professionID", labelKey: "category", idKey: "professionID", seoKey: "professionSeo", parentField: "jobTypeID" },
    { field: "roleID", labelKey: "subCategory", idKey: "roleID", seoKey: "roleSeo", parentField: "professionID" }
  ];
  function extractJobs(raw) {
    if (Array.isArray(raw)) {
      return raw.map((v) => {
        var _a;
        return (_a = v == null ? void 0 : v.data) != null ? _a : v;
      });
    }
    const values = raw == null ? void 0 : raw.values;
    if (Array.isArray(values)) return values.map((v) => v.data);
    return [];
  }
  function sortJobs(jobs, sort) {
    const dir = sort.direction === "asc" ? 1 : -1;
    return jobs.slice().sort((x, y) => {
      const a = x[sort.field];
      const b = y[sort.field];
      if (a === b) return 0;
      if (a == null) return 1;
      if (b == null) return -1;
      return a > b ? dir : -dir;
    });
  }
  function memoKey(state, sort) {
    const parts = Object.keys(state).sort().map((k) => `${k}=${JSON.stringify(state[k])}`);
    return `${parts.join("&")}::${sort.field}:${sort.direction}`;
  }
  function buildModel(jobs, cfg, opts = {}) {
    var _a, _b;
    const levels = (_a = opts.levels) != null ? _a : DEFAULT_LEVELS;
    const filterFn = (_b = opts.filterFn) != null ? _b : applyFilters;
    const filterOpts = { proximityDiameter: cfg.proximityDiameter };
    const all = jobs.slice();
    let cacheKey = null;
    let cached = null;
    const compute = (state, sort) => {
      const filtered = filterFn(all, state, filterOpts);
      const sorted = sortJobs(filtered, sort);
      const facets = buildHierarchy(
        sorted.map((j) => ({ data: j })),
        { levels }
      );
      cached = { sorted, facets, total: sorted.length };
    };
    return {
      all: () => all,
      query(state, sort, page, pageSize) {
        const key = memoKey(state, sort);
        if (key !== cacheKey || cached === null) {
          cacheKey = key;
          compute(state, sort);
        }
        const c = cached;
        const start = pageSize > 0 ? page * pageSize : 0;
        const end = pageSize > 0 ? start + pageSize : void 0;
        return {
          page: c.sorted.slice(start, end),
          total: c.total,
          facets: c.facets
        };
      }
    };
  }
  async function loadJobs(sdk, cfg, opts = {}) {
    const site = await sdk.site();
    const raw = await sdk.fetchJobs(site.siteID);
    return buildModel(extractJobs(raw), cfg, opts);
  }

  // core/dom.ts
  function delegate(root, eventType, selector, handler) {
    const listener = (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const matched = target.closest(selector);
      if (matched && root.contains(matched)) {
        handler(event, matched);
      }
    };
    root.addEventListener(eventType, listener);
    return () => root.removeEventListener(eventType, listener);
  }
  function setHtml(node, html) {
    node.innerHTML = html;
  }

  // core/pubsub.ts
  var MESSAGES = Object.freeze({
    FILTER_CHANGE: "job-search-submit",
    RESULTS_READY: "shazamme:results-ready",
    LOGIN: "site-auth",
    SAVE_JOB: "job-results-save-job"
  });
  function defineChannel(message) {
    return {
      message,
      publish(sdk, payload) {
        sdk.pub(message, payload);
      },
      subscribe(sdk, cb) {
        const handler = (payload) => cb(payload);
        sdk.sub(message, handler);
        return () => sdk.unsub(message, handler);
      }
    };
  }
  var filterChangeChannel = defineChannel(MESSAGES.FILTER_CHANGE);
  var resultsReadyChannel = defineChannel(MESSAGES.RESULTS_READY);
  var loginChannel = defineChannel(MESSAGES.LOGIN);
  var saveJobChannel = defineChannel(MESSAGES.SAVE_JOB);
  function publishFilterChange(sdk, payload) {
    filterChangeChannel.publish(sdk, payload);
  }

  // core/geo.ts
  var GEOCODE_BASE = "https://geocode.maps.co/search";
  function geocodeUrl(term, apiKey) {
    return `${GEOCODE_BASE}?q=${encodeURIComponent(term)}&api_key=${apiKey}`;
  }
  async function geocode(term, apiKey, fetchImpl = fetch) {
    const q = term.trim();
    if (q === "") return [];
    const res = await fetchImpl(geocodeUrl(q, apiKey));
    const rows = await res.json();
    if (!Array.isArray(rows)) return [];
    return rows.map((r) => {
      var _a;
      return {
        label: String((_a = r.display_name) != null ? _a : ""),
        lat: parseFloat(String(r.lat)),
        lon: parseFloat(String(r.lon))
      };
    }).filter((r) => !isNaN(r.lat) && !isNaN(r.lon));
  }
  function debounce(fn, delayMs) {
    let timer;
    return (...args) => {
      if (timer !== void 0) clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delayMs);
    };
  }

  // widgets/job-search/suggest.ts
  var GEOCODE_DEBOUNCE_MS = 500;
  var MAX_SUGGESTIONS = 6;
  function escapeHtml(value) {
    return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  function renderSuggestions(host, results) {
    if (results.length === 0) {
      setHtml(host, "");
      host.style.display = "none";
      return;
    }
    const rows = results.slice(0, MAX_SUGGESTIONS).map(
      (r) => `<a href="javascript:void(0)" class="result-text" data-value="${r.lat},${r.lon}" data-label="${escapeHtml(
        r.label
      )}">${escapeHtml(r.label)}</a>`
    ).join("");
    setHtml(host, `${rows}<a href="javascript:void(0)" class="result-text close" data-value="" data-label="">close</a>`);
    host.style.display = "flex";
  }
  function makeGeocodeRunner(apiKey, onResults) {
    return debounce((term) => {
      geocode(term, apiKey).then(onResults).catch(() => onResults([]));
    }, GEOCODE_DEBOUNCE_MS);
  }

  // widgets/job-search/form-state.ts
  var DEFAULT_GEO_RANGE = 50;
  var SEARCH_LEVELS = [
    { field: "jobTypeID", labelKey: "jobType", idKey: "jobTypeID" },
    { field: "professionID", labelKey: "category", idKey: "professionID" },
    { field: "roleID", labelKey: "subCategory", idKey: "roleID", parentField: "professionID" },
    { field: "workTypeID", labelKey: "workType", idKey: "workTypeID" },
    { field: "workModelID", labelKey: "workModel", idKey: "workModelID" },
    { field: "state", labelKey: "state", idKey: "state" }
  ];
  function emptyForm() {
    return { facets: {}, keyword: "", geo: null, geoAddress: "", geoRange: DEFAULT_GEO_RANGE };
  }
  function patchForm(state, next) {
    return { ...state, ...next };
  }
  function isEmpty(state) {
    const hasFacet = Object.values(state.facets).some((v) => v.length > 0);
    return !hasFacet && state.keyword.trim() === "" && state.geo === null;
  }
  function toPayload(state) {
    return {
      state: state.facets,
      keyword: state.keyword,
      geo: state.geo,
      geoRange: state.geoRange
    };
  }
  function readHash() {
    var _a, _b;
    try {
      const raw = window.location.hash.replace(/^#/, "");
      if (!raw) return {};
      const parsed = JSON.parse(decodeURIComponent(raw));
      return { facets: (_a = parsed.facets) != null ? _a : {}, keyword: (_b = parsed.keyword) != null ? _b : "" };
    } catch (e) {
      return {};
    }
  }
  function str(value, fallback) {
    if (typeof value === "string" && value.trim() !== "") return value;
    return fallback;
  }
  function readSearchConfig(data) {
    const c = data && data.config || {};
    return {
      showKeyword: coerceBool(c.showSearchKeyword, true),
      showJobType: coerceBool(c.showJobType),
      showClassification: coerceBool(c.showJobCategories),
      showSubClassification: coerceBool(c.ShowSubCalssifications),
      showWorkType: coerceBool(c.showWorkType),
      showWorkModel: coerceBool(c.showWorkModel),
      showLocation: coerceBool(c.showLocationSearch),
      showGeoSearch: coerceBool(c.showGeoSearch),
      buttonText: str(c.buttonText, "Search")
    };
  }
  function rangeUnit(proximityDiameter) {
    return proximityDiameter === "6371" ? "mi" : "km";
  }

  // widgets/job-search/index.ts
  var FAKE_JOBS = [
    { jobID: "1", jobName: "Senior Nurse", category: "Healthcare", professionID: "health", jobType: "Permanent", jobTypeID: "perm", roleID: "nurse", subCategory: "Nurse", workType: "Full Time", workTypeID: "ft", state: "England", changedOnUTC: (/* @__PURE__ */ new Date()).toISOString() },
    { jobID: "2", jobName: "Site Engineer", category: "Construction", professionID: "build", jobType: "Contract", jobTypeID: "contract", roleID: "eng", subCategory: "Engineer", workType: "Contract", workTypeID: "ct", state: "Scotland", changedOnUTC: (/* @__PURE__ */ new Date()).toISOString() }
  ];
  function $one(root, sel) {
    return root.querySelector(sel);
  }
  function optionsHtml(nodes, placeholder) {
    const opts = nodes.slice().sort((a, b) => a.value.toLowerCase() < b.value.toLowerCase() ? -1 : 1).map((n) => `<option value="${n.id}">${n.value}</option>`).join("");
    return `<option value="">${placeholder}</option>${opts}`;
  }
  var SDK_READY_TIMEOUT_MS = 1200;
  async function ensureSdkReady(shazamme, data) {
    const s = shazamme;
    const d = data;
    const sid = s._sid || d.siteId || d.siteID;
    if (!sid) return;
    s._sid = s._sid || sid;
    if (s._site) return;
    if (typeof s.ready === "function") {
      try {
        await Promise.race([
          Promise.resolve(s.ready(s._sid, d.page)),
          new Promise((resolve) => setTimeout(resolve, SDK_READY_TIMEOUT_MS))
        ]);
      } catch (e) {
      }
    }
  }
  function jobSearch(ctx) {
    var _a;
    const { element, data, shazamme } = ctx;
    const cfg = readConfig(data);
    const search = readSearchConfig(data);
    const sdk = wrapSdk(shazamme);
    const proximityEnabled = search.showGeoSearch && cfg.geocodeApiKey.trim() !== "";
    const form = $one(element, '[data-rel="search-form"]');
    const button = $one(element, '[data-rel="search-button"]');
    if (!form || !button) return;
    const root = (_a = $one(element, ".job-search-root")) != null ? _a : element;
    root.style.visibility = "hidden";
    const reveal = () => {
      root.classList.add("shm-ready");
      root.style.setProperty("visibility", "visible", "important");
    };
    let tree = null;
    let state = { ...emptyForm(), ...readHash() };
    function selectEl(field) {
      return $one(form, `select[data-filter="${field}"]`);
    }
    function populateSelect(field, placeholder, nodes) {
      const sel = selectEl(field);
      if (!sel) return;
      const keep = sel.value;
      sel.innerHTML = optionsHtml(nodes, placeholder);
      sel.value = keep;
    }
    function refreshRoles() {
      var _a2, _b;
      if (!tree) return;
      const prof = ((_a2 = state.facets.professionID) != null ? _a2 : [])[0];
      const nodes = prof ? tree.children("roleID", prof) : (_b = tree.index.roleID) != null ? _b : [];
      populateSelect("roleID", "All Sub Classifications", nodes);
    }
    function populateAll() {
      var _a2, _b, _c, _d, _e;
      if (!tree) return;
      populateSelect("jobTypeID", "All Job Types", (_a2 = tree.index.jobTypeID) != null ? _a2 : []);
      populateSelect("professionID", "All Classifications", (_b = tree.index.professionID) != null ? _b : []);
      populateSelect("workTypeID", "All Work Types", (_c = tree.index.workTypeID) != null ? _c : []);
      populateSelect("workModelID", "All Work Models", (_d = tree.index.workModelID) != null ? _d : []);
      populateSelect("state", "All Locations", (_e = tree.index.state) != null ? _e : []);
      refreshRoles();
    }
    function applyStateToForm() {
      var _a2;
      for (const [field, ids] of Object.entries(state.facets)) {
        const sel = selectEl(field);
        if (sel) sel.value = (_a2 = ids[0]) != null ? _a2 : "";
      }
      const keyword = $one(form, '[data-rel="search-keyword"]');
      if (keyword) keyword.value = state.keyword;
      const geoInput = $one(form, '[data-rel="geo-input"]');
      if (geoInput) geoInput.value = state.geoAddress;
      updateRangeDisplay();
    }
    function updateRangeDisplay() {
      const display = $one(element, '[data-rel="geo-range-display"]');
      if (display) display.textContent = `${state.geoRange} ${rangeUnit(cfg.proximityDiameter)}`;
    }
    function applyVisibility() {
      const setShown = (rel, shown) => {
        const node = $one(form, `[data-rel="${rel}"]`);
        if (node) node.hidden = !shown;
      };
      setShown("field-keyword", search.showKeyword);
      setShown("field-jobType", search.showJobType);
      setShown("field-classification", search.showClassification);
      setShown("field-subClassification", search.showSubClassification);
      setShown("field-workType", search.showWorkType);
      setShown("field-workModel", search.showWorkModel);
      setShown("field-location", search.showLocation);
      setShown("field-geo", proximityEnabled);
      const label = button.querySelector(".text");
      if (label) label.textContent = search.buttonText;
    }
    function readForm() {
      const facets = {};
      form.querySelectorAll("select[data-filter]").forEach((sel) => {
        const field = sel.getAttribute("data-filter");
        if (field && sel.value) facets[field] = [sel.value];
      });
      const keywordEl = $one(form, '[data-rel="search-keyword"]');
      const keyword = keywordEl ? keywordEl.value.trim() : "";
      return patchForm(state, { facets, keyword });
    }
    function submit() {
      state = readForm();
      try {
        publishFilterChange(sdk, toPayload(state));
      } catch (err) {
        console.warn("[job-search] filter subscriber threw", err);
      }
      renderChips();
    }
    function escapeHtml2(s) {
      return s.replace(
        /[&<>"']/g,
        (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]
      );
    }
    function chipContainer() {
      let host = $one(element, '[data-rel="active-chips"]');
      if (!host) {
        host = document.createElement("div");
        host.setAttribute("data-rel", "active-chips");
        host.style.cssText = "display:none;flex-wrap:wrap;gap:8px;margin-top:10px;";
        form.after(host);
      }
      return host;
    }
    function renderChips() {
      const host = chipContainer();
      const chips = [];
      form.querySelectorAll("select[data-filter]").forEach((sel) => {
        var _a2, _b;
        const field = sel.getAttribute("data-filter");
        if (!field || !sel.value) return;
        const label = (_b = (_a2 = sel.selectedOptions[0]) == null ? void 0 : _a2.text) != null ? _b : sel.value;
        chips.push(
          `<span style="display:inline-flex;align-items:center;gap:6px;padding:4px 10px;background:#eef1f5;border-radius:16px;font-size:13px;line-height:1.4;color:#333;">${escapeHtml2(label)}<button type="button" data-chip-remove="${escapeHtml2(field)}" aria-label="Remove ${escapeHtml2(label)}" style="border:0;background:transparent;cursor:pointer;font-size:15px;line-height:1;color:#666;padding:0;">&times;</button></span>`
        );
      });
      host.innerHTML = chips.join("");
      host.style.display = chips.length ? "flex" : "none";
    }
    function removeChip(field) {
      const sel = selectEl(field);
      if (sel) sel.value = "";
      state = patchForm(state, { facets: dropKey(state.facets, field) });
      if (field === "professionID") {
        const role = selectEl("roleID");
        if (role) role.value = "";
        state = patchForm(state, { facets: dropKey(state.facets, "roleID") });
        refreshRoles();
      }
      submit();
    }
    const runGeocode = makeGeocodeRunner(cfg.geocodeApiKey, (results) => {
      const host = $one(element, '[data-rel="geo-prediction"]');
      if (host) renderSuggestions(host, results);
    });
    function wireEvents() {
      button.addEventListener("click", (ev) => {
        ev.preventDefault();
        submit();
      });
      delegate(form, "keydown", 'input[type="text"], input:not([type])', (ev) => {
        if (ev.key === "Enter") {
          ev.preventDefault();
          submit();
        }
      });
      delegate(form, "change", "select[data-filter]", () => renderChips());
      delegate(chipContainer(), "click", "[data-chip-remove]", (ev, matched) => {
        ev.preventDefault();
        const field = matched.getAttribute("data-chip-remove");
        if (field) removeChip(field);
      });
      delegate(form, "change", 'select[data-filter="professionID"]', (_ev, matched) => {
        const val = matched.value;
        state = patchForm(state, {
          facets: val ? { ...state.facets, professionID: [val] } : dropKey(state.facets, "professionID")
        });
        state = patchForm(state, { facets: dropKey(state.facets, "roleID") });
        const roleSel = selectEl("roleID");
        if (roleSel) roleSel.value = "";
        refreshRoles();
      });
      if (!proximityEnabled) return;
      delegate(form, "input", '[data-rel="geo-input"]', (_ev, matched) => {
        const value = matched.value;
        state = patchForm(state, { geo: null, geoAddress: "" });
        if (value.trim() !== "") runGeocode(value);
        else hidePredictions();
      });
      delegate(element, "click", '[data-rel="geo-prediction"] .result-text', (ev, matched) => {
        var _a2, _b;
        ev.preventDefault();
        const raw = (_a2 = matched.getAttribute("data-value")) != null ? _a2 : "";
        const label = (_b = matched.getAttribute("data-label")) != null ? _b : "";
        hidePredictions();
        const geoInput = $one(form, '[data-rel="geo-input"]');
        if (raw === "") return;
        const [lat, lon] = raw.split(",").map((n) => parseFloat(n));
        const geo = { lat, lon };
        if (geoInput) geoInput.value = label;
        state = patchForm(state, { geo, geoAddress: label });
      });
      delegate(form, "input", '[data-rel="geo-range"]', (_ev, matched) => {
        const val = parseInt(matched.value, 10) || DEFAULT_GEO_RANGE;
        state = patchForm(state, { geoRange: val });
        updateRangeDisplay();
      });
    }
    function hidePredictions() {
      const host = $one(element, '[data-rel="geo-prediction"]');
      if (host) host.style.display = "none";
    }
    function dropKey(facets, key) {
      const next = { ...facets };
      delete next[key];
      return next;
    }
    function subscribeCounter() {
      const counter = $one(element, '[data-rel="results-count"]');
      if (!counter) return;
      resultsReadyChannel.subscribe(sdk, (payload) => {
        counter.textContent = String(payload.total);
      });
    }
    (async () => {
      await ensureSdkReady(shazamme, data);
      try {
        const model = data.inEditor ? buildModel(FAKE_JOBS, cfg, { levels: SEARCH_LEVELS }) : await loadJobs(sdk, cfg, { levels: SEARCH_LEVELS });
        tree = buildHierarchy(
          model.all().map((j) => ({ data: j })),
          { levels: SEARCH_LEVELS }
        );
      } catch (e) {
        reveal();
        return;
      }
      applyVisibility();
      populateAll();
      applyStateToForm();
      wireEvents();
      renderChips();
      reveal();
      if (!data.inEditor) {
        subscribeCounter();
        if (!isEmpty(state)) publishFilterChange(sdk, toPayload(state));
      }
    })();
  }
  return __toCommonJS(index_exports);
})();
(function(){
  var reg = (typeof module !== 'undefined' && module.exports) || {};
  var controller = reg.default || reg;
  if (typeof window !== 'undefined') {
    window.ShazammeWidget = window.ShazammeWidget || {};
    window.ShazammeWidget["job-search"] = controller;
  }
})();

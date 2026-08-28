/* shazamme-widgets — shazamme-widgets v0.1.0
 * Built 2026-08-28T01:31:33.843Z. Registers window.ShazammeWidget["<name>"].
 */
(function(){
  if (typeof document === 'undefined') return;
  if (document.getElementById("shm-css-job-search-v2")) return;
  var s = document.createElement('style');
  s.id = "shm-css-job-search-v2";
  s.textContent = "/*\n * job-search widget styles — ported from jobsearch2026prox-css, cleaned:\n * dropped the multi-select chip UI, Google .gapi-map, and active-filters bar\n * (not rebuilt). Class/hook names track template.html (which the controller\n * owns). Fields are a wrapping flex row that stacks on narrow viewports.\n */\n\n.job-search-root {\n  width: 100%;\n  overflow: visible;\n}\n\n.mainSearchContainer {\n  position: relative;\n  display: flex;\n  flex-direction: row;\n  box-sizing: border-box;\n  padding: 8px 4px;\n  width: 100%;\n  justify-content: space-between;\n  align-items: flex-end;\n  flex-wrap: wrap;\n  min-height: 62px;\n}\n\n/* Each field column. */\n.flex-items-js {\n  flex: 1;\n  min-width: 140px;\n  margin: 4px 5px;\n  box-sizing: border-box;\n  position: relative;\n  display: flex;\n  flex-direction: column;\n  justify-content: flex-end;\n  align-items: stretch;\n  font-family: inherit;\n}\n\n.flex-items-js[hidden] {\n  display: none;\n}\n\n/* All native inputs + selects share one base style. The visual props use\n * !important so they beat the host site's own theme (Duda styles generic\n * input/select with high specificity, which otherwise forces its own\n * height/background/border and clashes with the multi-select boxes). */\n.job-search-root .flex-items-js input,\n.job-search-root .flex-items-js select {\n  width: 100% !important;\n  height: 46px !important;\n  box-sizing: border-box !important;\n  padding: 0 14px !important;\n  background: #fff !important;\n  border: 1.5px solid #d1d1d1 !important;\n  font-family: inherit;\n  font-size: 14px !important;\n  color: #222 !important;\n  outline: none !important;\n  margin-top: 0 !important;\n  vertical-align: middle;\n}\n\n/* Native select — replace the browser arrow with a matching triangle. */\n.flex-items-js select {\n  appearance: none;\n  -webkit-appearance: none;\n  -moz-appearance: none;\n  padding-right: 36px;\n  background-image: url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='7' viewBox='0 0 10 7'%3E%3Cpolygon points='0,0 10,0 5,7' fill='%23666666'/%3E%3C/svg%3E\");\n  background-repeat: no-repeat;\n  background-position: right 13px center;\n  background-size: 10px 7px;\n}\n\n.flex-items-js input:focus,\n.flex-items-js select:focus {\n  border-color: #666;\n  box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.06);\n}\n\n.flex-items-js input::placeholder {\n  color: #aaa;\n}\n\n/* Search button. */\n.flex-items-js .searchBtn {\n  width: 100%;\n  height: 46px;\n  box-sizing: border-box;\n  padding: 0 20px;\n  background: #000;\n  color: #fff;\n  border: 1.5px solid #000;\n  font-family: inherit;\n  font-size: 14px;\n  font-weight: 600;\n  cursor: pointer;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  gap: 6px;\n  margin-top: 0;\n  transition: opacity 0.15s ease;\n  letter-spacing: 0.01em;\n}\n\n.flex-items-js .searchBtn:hover {\n  opacity: 0.82;\n}\n\n.searchBtn .count:empty {\n  display: none;\n}\n\n/* Geo proximity: text input over a radius slider. */\n.flex-items-js .split {\n  display: flex;\n  flex-direction: row;\n  gap: 6px;\n  position: relative;\n}\n\n.flex-items-js .split input {\n  flex: 1;\n  margin: 0;\n}\n\n.geo-range {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  margin-top: 6px;\n}\n\n.geo-range input[type=\"range\"] {\n  flex: 1;\n  height: auto;\n  padding: 0;\n  border: none;\n  background: transparent;\n}\n\n.geo-range .text {\n  font-size: 13px;\n  color: #444;\n  white-space: nowrap;\n}\n\n/* Typeahead prediction panel (geocode suggestions). */\n.prediction-result {\n  position: absolute;\n  top: 100%;\n  left: 0;\n  width: 100%;\n  background: #fff;\n  border: 1.5px solid #d1d1d1;\n  border-top: none;\n  border-radius: 0 0 6px 6px;\n  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);\n  display: none;\n  flex-direction: column;\n  overflow-y: auto;\n  max-height: 220px;\n  z-index: 99;\n  padding: 6px 0;\n  font-family: inherit;\n  box-sizing: border-box;\n}\n\n.prediction-result .result-text {\n  display: block;\n  color: #222;\n  text-decoration: none;\n  padding: 9px 16px;\n  font-family: inherit;\n  font-size: 14px;\n  cursor: pointer;\n}\n\n.prediction-result .result-text:hover {\n  background: #f5f5f5;\n}\n\n.prediction-result .result-text.close {\n  text-align: right;\n  font-size: 0.72em;\n  padding: 4px 10px;\n  color: #888;\n}\n\n/* Stack fields on narrow viewports. */\n@media (max-width: 640px) {\n  .mainSearchContainer {\n    flex-direction: column;\n    align-items: stretch;\n  }\n  .flex-items-js {\n    width: 100%;\n    flex: none;\n  }\n}\n\n/* ===================== MULTI-SELECT (classification / sub-classification /\n * location) — custom checkbox dropdown, ported from the jobsearch2026 reference.\n * The wrapper is a .flex-items-js field column; the box matches the 46px height\n * of the native inputs so the row stays aligned. ===================== */\n.multi-select-wrapper {\n  position: relative;\n}\n\n.multi-select-box {\n  width: 100%;\n  height: 46px;\n  box-sizing: border-box;\n  padding: 0 14px;\n  background: #fff;\n  border: 1.5px solid #d1d1d1;\n  font-family: inherit;\n  font-size: 14px;\n  color: #222;\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  cursor: pointer;\n  user-select: none;\n  transition: border-color 0.15s ease, box-shadow 0.15s ease;\n}\n\n.multi-select-box:hover,\n.multi-select-box.open {\n  border-color: #666;\n  box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.06);\n}\n\n.multi-select-box .multi-select-placeholder {\n  color: #888;\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  flex: 1;\n}\n\n/* When items are selected, a count label replaces the placeholder. */\n.multi-select-box .ms-count {\n  color: #222;\n  white-space: nowrap;\n  flex: 1;\n}\n\n.multi-select-box .multi-select-arrow {\n  font-size: 10px;\n  color: #666;\n  margin-left: 10px;\n  flex-shrink: 0;\n  transition: transform 0.18s ease;\n  line-height: 1;\n}\n\n.multi-select-box.open .multi-select-arrow {\n  transform: rotate(180deg);\n}\n\n/* Count is shown inline in the box; the tags row is unused. */\n.multi-select-tags {\n  display: none;\n}\n\n/* Disabled sub-classification (no classification chosen yet). */\n.multi-select-box.subcategory-disabled {\n  opacity: 0.45;\n  cursor: not-allowed;\n  pointer-events: none;\n}\n\n.multi-select-dropdown {\n  display: none;\n  position: absolute;\n  top: calc(100% + 3px);\n  left: 0;\n  width: 100%;\n  min-width: 220px;\n  background: #fff;\n  border: 1.5px solid #d1d1d1;\n  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.11);\n  z-index: 9999;\n  max-height: 300px;\n  overflow-y: auto;\n  box-sizing: border-box;\n  padding: 6px 0;\n}\n\n.multi-select-dropdown.open {\n  display: block;\n}\n\n.multi-select-dropdown::-webkit-scrollbar {\n  width: 5px;\n  background: #f9f9f9;\n}\n\n.multi-select-dropdown::-webkit-scrollbar-thumb {\n  background: #ddd;\n  border-radius: 4px;\n}\n\n.ms-option {\n  display: flex;\n  flex-direction: row;\n  align-items: center;\n  gap: 8px;\n  padding: 6px 14px;\n  cursor: pointer;\n  font-size: 13px;\n  color: #222;\n  box-sizing: border-box;\n  line-height: 1.3;\n  transition: background 0.1s ease;\n  white-space: nowrap;\n}\n\n.ms-option:hover {\n  background: #f5f5f5;\n}\n\n.ms-option input[type=\"checkbox\"] {\n  appearance: none;\n  -webkit-appearance: none;\n  width: 13px;\n  height: 13px;\n  min-width: 13px;\n  min-height: 13px;\n  flex-shrink: 0;\n  margin: 0 8px 0 0;\n  padding: 0;\n  cursor: pointer;\n  border: 1.5px solid #bbb;\n  border-radius: 3px;\n  background: #fff;\n  position: relative;\n  transition: background 0.12s ease, border-color 0.12s ease;\n  box-sizing: border-box;\n}\n\n.ms-option input[type=\"checkbox\"]:checked {\n  background: #1d4a45;\n  border-color: #1d4a45;\n}\n\n.ms-option input[type=\"checkbox\"]:checked::after {\n  content: '';\n  position: absolute;\n  left: 3px;\n  top: 0;\n  width: 4px;\n  height: 7px;\n  border: 1.5px solid #fff;\n  border-top: none;\n  border-left: none;\n  transform: rotate(45deg);\n  display: block;\n}\n\n.ms-option-label {\n  flex: 1;\n  line-height: 1.3;\n  color: #222;\n  font-size: 13px;\n  overflow: hidden;\n  text-overflow: ellipsis;\n}\n\n.ms-empty {\n  padding: 14px 18px;\n  color: #999;\n  font-style: italic;\n  font-size: 0.9em;\n}\n";
  (document.head || document.documentElement).appendChild(s);
})();
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

  // widgets/job-search-v2/index.ts
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
          matching: c.sorted,
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

  // widgets/job-search-v2/suggest.ts
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

  // widgets/job-search-v2/form-state.ts
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

  // widgets/job-search-v2/index.ts
  var MS_FIELDS = [
    { field: "professionID", rel: "field-classification" },
    { field: "roleID", rel: "field-subClassification" },
    { field: "state", rel: "field-location" }
  ];
  var MS_CLASS = "professionID";
  var MS_SUBCLASS = "roleID";
  var MS_FIELD_SET = new Set(MS_FIELDS.map((m) => m.field));
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
    function normalizeFields() {
      root.querySelectorAll(".flex-items-js input, .flex-items-js select").forEach((el) => {
        el.style.setProperty("height", "46px", "important");
        el.style.setProperty("background-color", "#fff", "important");
        el.style.setProperty("border", "1.5px solid #d1d1d1", "important");
        el.style.setProperty("box-sizing", "border-box", "important");
        el.style.setProperty("color", "#222", "important");
        el.style.setProperty("margin", "0", "important");
      });
    }
    function guardFields() {
      normalizeFields();
      try {
        new MutationObserver(() => normalizeFields()).observe(form, {
          childList: true,
          subtree: true
        });
      } catch (e) {
      }
    }
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
    function dropKey(facets, key) {
      const next = { ...facets };
      delete next[key];
      return next;
    }
    function escapeHtml2(s) {
      return s.replace(
        /[&<>"']/g,
        (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]
      );
    }
    function msWrapper(field) {
      return $one(form, `[data-ms-field="${field}"]`);
    }
    function roleNodes() {
      var _a2, _b;
      if (!tree) return [];
      const profs = (_a2 = state.facets.professionID) != null ? _a2 : [];
      if (!profs.length) return (_b = tree.index.roleID) != null ? _b : [];
      const seen = /* @__PURE__ */ new Map();
      for (const p of profs) for (const n of tree.children("roleID", p)) seen.set(n.id, n);
      return [...seen.values()];
    }
    function nodesForField(field) {
      var _a2;
      if (!tree) return [];
      if (field === MS_SUBCLASS) return roleNodes();
      return (_a2 = tree.index[field]) != null ? _a2 : [];
    }
    function labelFor(field, id) {
      var _a2, _b;
      return (_b = (_a2 = nodesForField(field).find((n) => n.id === id)) == null ? void 0 : _a2.value) != null ? _b : id;
    }
    function renderMsDropdown(field) {
      var _a2;
      const wrap = msWrapper(field);
      const dd = wrap ? $one(wrap, '[data-rel="ms-dropdown"]') : null;
      if (!dd) return;
      const selected = new Set((_a2 = state.facets[field]) != null ? _a2 : []);
      const nodes = nodesForField(field).slice().sort((a, b) => a.value.toLowerCase() < b.value.toLowerCase() ? -1 : 1);
      if (!nodes.length) {
        dd.innerHTML = '<div class="ms-empty">No options available</div>';
        return;
      }
      dd.innerHTML = nodes.map(
        (n) => `<label class="ms-option"><input type="checkbox" value="${escapeHtml2(n.id)}"${selected.has(n.id) ? " checked" : ""} /><span class="ms-option-label">${escapeHtml2(n.value)}</span></label>`
      ).join("");
    }
    function renderMsBox(field) {
      var _a2, _b;
      const wrap = msWrapper(field);
      const box = wrap ? $one(wrap, '[data-rel="ms-box"]') : null;
      if (!box) return;
      const placeholder = $one(box, ".multi-select-placeholder");
      const count = ((_a2 = state.facets[field]) != null ? _a2 : []).length;
      (_b = box.querySelector(".ms-count")) == null ? void 0 : _b.remove();
      if (count === 0) {
        if (placeholder) placeholder.style.display = "";
      } else {
        if (placeholder) placeholder.style.display = "none";
        const span = document.createElement("span");
        span.className = "ms-count";
        span.textContent = count === 1 ? "1 selected" : `${count} selected`;
        box.insertBefore(span, box.querySelector(".multi-select-arrow"));
      }
    }
    function updateSubLock() {
      var _a2;
      const wrap = msWrapper(MS_SUBCLASS);
      const box = wrap ? $one(wrap, '[data-rel="ms-box"]') : null;
      if (!box) return;
      const hasClass = ((_a2 = state.facets[MS_CLASS]) != null ? _a2 : []).length > 0;
      box.classList.toggle("subcategory-disabled", !hasClass);
      if (!hasClass) box.classList.remove("open");
    }
    function renderMsField(field) {
      renderMsDropdown(field);
      renderMsBox(field);
    }
    function renderAllMs() {
      for (const { field } of MS_FIELDS) renderMsField(field);
      updateSubLock();
    }
    function toggleMsSelection(field, id, checked) {
      var _a2;
      const current = (_a2 = state.facets[field]) != null ? _a2 : [];
      const next = checked ? [.../* @__PURE__ */ new Set([...current, id])] : current.filter((x) => x !== id);
      state = patchForm(state, {
        facets: next.length ? { ...state.facets, [field]: next } : dropKey(state.facets, field)
      });
      if (field === MS_CLASS) {
        state = patchForm(state, { facets: dropKey(state.facets, MS_SUBCLASS) });
        renderMsField(MS_SUBCLASS);
      }
      updateSubLock();
      renderMsBox(field);
      renderChips();
    }
    function closeAllMs() {
      form.querySelectorAll(".multi-select-dropdown.open, .multi-select-box.open").forEach((el) => el.classList.remove("open"));
    }
    function toggleMsDropdown(box) {
      const wrap = box.closest(".multi-select-wrapper");
      const dd = wrap ? wrap.querySelector(".multi-select-dropdown") : null;
      const isOpen = !!dd && dd.classList.contains("open");
      closeAllMs();
      if (!isOpen && dd) {
        dd.classList.add("open");
        box.classList.add("open");
      }
    }
    function populateAll() {
      var _a2, _b, _c, _d, _e, _f;
      if (!tree) return;
      populateSelect("jobTypeID", "All Job Types", (_a2 = tree.index.jobTypeID) != null ? _a2 : []);
      populateSelect("workTypeID", "All Work Types", (_b = tree.index.workTypeID) != null ? _b : []);
      populateSelect("workModelID", "All Work Models", (_c = tree.index.workModelID) != null ? _c : []);
      populateSelect("professionID", "All Classifications", (_d = tree.index.professionID) != null ? _d : []);
      populateSelect("roleID", "All Sub Classifications", (_e = tree.index.roleID) != null ? _e : []);
      populateSelect("state", "All Locations", (_f = tree.index.state) != null ? _f : []);
      renderAllMs();
    }
    function applyStateToForm() {
      form.querySelectorAll("select[data-filter]").forEach((sel) => {
        var _a2, _b;
        const field = sel.getAttribute("data-filter");
        if (field) sel.value = (_b = ((_a2 = state.facets[field]) != null ? _a2 : [])[0]) != null ? _b : "";
      });
      renderAllMs();
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
      var _a2;
      const facets = {};
      form.querySelectorAll("select[data-filter]").forEach((sel) => {
        const field = sel.getAttribute("data-filter");
        if (field && sel.value) facets[field] = [sel.value];
      });
      for (const { field } of MS_FIELDS) {
        const ids = (_a2 = state.facets[field]) != null ? _a2 : [];
        if (ids.length) facets[field] = ids;
      }
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
    function chipHtml(field, id, label) {
      return `<span style="display:inline-flex;align-items:center;gap:6px;padding:4px 10px;background:#eef1f5;border-radius:16px;font-size:13px;line-height:1.4;color:#333;">${escapeHtml2(label)}<button type="button" data-chip-remove="${escapeHtml2(field)}" data-chip-id="${escapeHtml2(id)}" aria-label="Remove ${escapeHtml2(label)}" style="border:0;background:transparent;cursor:pointer;font-size:15px;line-height:1;color:#666;padding:0;">&times;</button></span>`;
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
      var _a2;
      const host = chipContainer();
      const chips = [];
      for (const { field } of MS_FIELDS) {
        for (const id of (_a2 = state.facets[field]) != null ? _a2 : []) {
          chips.push(chipHtml(field, id, labelFor(field, id)));
        }
      }
      form.querySelectorAll("select[data-filter]").forEach((sel) => {
        var _a3, _b;
        const field = sel.getAttribute("data-filter");
        if (!field || !sel.value) return;
        const label = (_b = (_a3 = sel.selectedOptions[0]) == null ? void 0 : _a3.text) != null ? _b : sel.value;
        chips.push(chipHtml(field, "", label));
      });
      host.innerHTML = chips.join("");
      host.style.display = chips.length ? "flex" : "none";
    }
    function removeChip(field, id) {
      var _a2;
      if (MS_FIELD_SET.has(field) && id) {
        const next = ((_a2 = state.facets[field]) != null ? _a2 : []).filter((x) => x !== id);
        state = patchForm(state, {
          facets: next.length ? { ...state.facets, [field]: next } : dropKey(state.facets, field)
        });
        if (field === MS_CLASS) {
          state = patchForm(state, { facets: dropKey(state.facets, MS_SUBCLASS) });
          renderMsField(MS_SUBCLASS);
        }
        renderMsField(field);
        updateSubLock();
      } else {
        const sel = selectEl(field);
        if (sel) sel.value = "";
        state = patchForm(state, { facets: dropKey(state.facets, field) });
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
        var _a2;
        ev.preventDefault();
        const field = matched.getAttribute("data-chip-remove");
        const id = (_a2 = matched.getAttribute("data-chip-id")) != null ? _a2 : "";
        if (field) removeChip(field, id);
      });
      delegate(form, "click", '[data-rel="ms-box"]', (ev, matched) => {
        ev.stopPropagation();
        if (matched.classList.contains("subcategory-disabled")) return;
        toggleMsDropdown(matched);
      });
      delegate(form, "change", '.multi-select-dropdown input[type="checkbox"]', (_ev, matched) => {
        const input = matched;
        const wrap = input.closest("[data-ms-field]");
        const field = wrap == null ? void 0 : wrap.getAttribute("data-ms-field");
        if (field) toggleMsSelection(field, input.value, input.checked);
      });
      delegate(form, "click", ".multi-select-dropdown", (ev) => ev.stopPropagation());
      document.addEventListener("click", closeAllMs);
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
      guardFields();
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
    window.ShazammeWidget["job-search-v2"] = controller;
  }
})();

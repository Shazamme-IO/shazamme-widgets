/* shazamme-widgets — shazamme-widgets v0.1.0
 * Built 2026-07-28T08:05:49.322Z. Registers window.ShazammeWidget["<name>"].
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

  // widgets/job-results/index.ts
  var index_exports = {};
  __export(index_exports, {
    default: () => jobResults
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
      pageSize: coerceInt(c.pageSize, DEFAULT_PAGE_SIZE)
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
  function without(arr, id) {
    return arr.filter((x) => x !== id);
  }
  function withId(arr, id) {
    return arr.includes(id) ? arr : [...arr, id];
  }
  function toggleFacet(state, tree, field, id) {
    var _a, _b, _c;
    const next = {};
    for (const k of Object.keys(state)) next[k] = [...state[k]];
    const isSelected = ((_a = next[field]) != null ? _a : []).includes(id);
    if (isSelected) {
      next[field] = without((_b = next[field]) != null ? _b : [], id);
      cascadeRemove(next, tree, field, id);
    } else {
      next[field] = withId((_c = next[field]) != null ? _c : [], id);
      autoSelectAncestors(next, tree, field, id);
    }
    for (const k of Object.keys(next)) {
      if (next[k].length === 0) delete next[k];
    }
    return next;
  }
  function autoSelectAncestors(state, tree, field, id) {
    var _a;
    const node = tree.nodeById(field, id);
    if (!node || !node.parent) return;
    const pField = tree.parentField(field);
    if (!pField) return;
    state[pField] = withId((_a = state[pField]) != null ? _a : [], node.parent);
    autoSelectAncestors(state, tree, pField, node.parent);
  }
  function cascadeRemove(state, tree, field, id) {
    for (const childField of tree.childFields(field)) {
      const selected = state[childField];
      if (!selected || selected.length === 0) continue;
      const descendants = selected.filter(
        (childId) => {
          var _a;
          return ((_a = tree.nodeById(childField, childId)) == null ? void 0 : _a.parent) === id;
        }
      );
      for (const d of descendants) {
        state[childField] = without(state[childField], d);
        cascadeRemove(state, tree, childField, d);
      }
    }
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
  function el(tag, attrs = {}, children = []) {
    const node = document.createElement(tag);
    for (const [key, value] of Object.entries(attrs)) {
      if (value == null) continue;
      if (key === "class") {
        node.className = String(value);
      } else if (key === "text") {
        node.textContent = String(value);
      } else if (key === "html") {
        node.innerHTML = String(value);
      } else if (key === "dataset") {
        for (const [dk, dv] of Object.entries(value)) {
          node.dataset[dk] = String(dv);
        }
      } else {
        node.setAttribute(key, String(value));
      }
    }
    for (const child of children) {
      node.appendChild(typeof child === "string" ? document.createTextNode(child) : child);
    }
    return node;
  }
  function setHtml(node, html) {
    node.innerHTML = html;
  }
  var KEY_ATTR = "data-key";
  function renderList(container, items, keyOf, renderItem) {
    var _a;
    const existing = /* @__PURE__ */ new Map();
    for (const child of Array.from(container.children)) {
      const key = child.getAttribute(KEY_ATTR);
      if (key !== null) existing.set(key, child);
    }
    const nextKeys = /* @__PURE__ */ new Set();
    let ref = container.firstChild;
    for (const item of items) {
      const key = keyOf(item);
      nextKeys.add(key);
      const prev = (_a = existing.get(key)) != null ? _a : null;
      const node = renderItem(item, prev);
      node.setAttribute(KEY_ATTR, key);
      if (node === ref) {
        ref = node.nextSibling;
      } else {
        container.insertBefore(node, ref);
      }
    }
    for (const [key, node] of existing) {
      if (!nextKeys.has(key)) container.removeChild(node);
    }
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
  function onFilterChange(sdk, cb) {
    return filterChangeChannel.subscribe(sdk, cb);
  }

  // widgets/job-results/cards.ts
  var MS_PER_DAY = 864e5;
  var NEW_JOB_MAX_DAYS = 1;
  function str(job, key) {
    const v = job[key];
    return v == null ? "" : String(v);
  }
  function jobKey(job) {
    return str(job, "jobID") || str(job, "referenceNumber") || str(job, "jobName");
  }
  function slugOf(job) {
    const url = str(job, "jobURL");
    if (url) {
      const parts = url.split("/").filter(Boolean);
      if (parts.length > 0) return parts[parts.length - 1];
    }
    return str(job, "referenceNumber") || str(job, "jobID");
  }
  function detailsHref(job, cfg) {
    if (!cfg.detailsPage) return "javascript:void(0)";
    return `/${cfg.detailsPage}/${slugOf(job)}`;
  }
  function applyHref(job, cfg) {
    const own = str(job, "applicationURL");
    if (own) return own;
    if (!cfg.applicationPage) return detailsHref(job, cfg);
    return `/${cfg.applicationPage}?jobID=${encodeURIComponent(str(job, "jobID"))}`;
  }
  function timeSince(job) {
    const raw = str(job, "changedOnUTC");
    const then = Date.parse(raw);
    if (Number.isNaN(then)) return "";
    const days = Math.floor((Date.now() - then) / MS_PER_DAY);
    if (days <= 0) return "today";
    if (days === 1) return "1 day ago";
    if (days < 30) return `${days} days ago`;
    const months = Math.floor(days / 30);
    return months === 1 ? "1 month ago" : `${months} months ago`;
  }
  function isNew(job) {
    const then = Date.parse(str(job, "changedOnUTC"));
    if (Number.isNaN(then)) return false;
    return Date.now() - then <= NEW_JOB_MAX_DAYS * MS_PER_DAY;
  }
  function locationText(job) {
    const parts = [str(job, "city"), str(job, "state")].filter(Boolean);
    if (parts.length > 0) return parts.join(", ");
    return str(job, "country") || str(job, "location");
  }
  function detailRows(job) {
    const rows = [];
    const loc = locationText(job);
    if (loc) rows.push(`<div class="shmLocation">${escapeHtml(loc)}</div>`);
    const salary = str(job, "salary");
    if (salary) rows.push(`<div class="shmSalary">${escapeHtml(salary)}</div>`);
    const workType = str(job, "workType");
    if (workType) rows.push(`<div class="work-type">${escapeHtml(workType)}</div>`);
    const workModel = str(job, "workModel");
    if (workModel) rows.push(`<div class="work-model">${escapeHtml(workModel)}</div>`);
    const category = str(job, "category");
    if (category) rows.push(`<div class="jobCategory">${escapeHtml(category)}</div>`);
    return rows.join('<div class="shmDetailsDivider shmDividerEnabled">|</div>');
  }
  function escapeHtml(value) {
    return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function cardHtml(job, cfg) {
    const details = detailsHref(job, cfg);
    const apply = applyHref(job, cfg);
    const name = escapeHtml(str(job, "jobName") || str(job, "title"));
    const posted = timeSince(job);
    return `
    <div class="shmJobItemDetails">
      ${isNew(job) ? '<span class="shmTag job-new">New</span>' : ""}
      ${posted ? `<div class="shmTimePostedText">Posted ${escapeHtml(posted)}</div>` : ""}
      <div class="shmJobItemUpper">
        <div class="shmJobtitle"><a href="${details}" class="shmJobtitle" data-rel="link-job-name">${name}</a></div>
        <div class="shmUpperRight">
          <div class="shmCTA">
            <div class="shmSaveJob" data-rel="action-save-job" data-save-id="">
              <span class="active">unsave job</span>
              <span class="inactive">save job</span>
            </div>
          </div>
        </div>
      </div>
      <div class="shmJobDetails">
        <div class="shmJobDetailsPanel shmJobDetailsLeft">${detailRows(job)}</div>
      </div>
    </div>
    <div class="shmButtonLinks">
      <a class="shmGoApply" href="${apply}"><span class="text">Apply Now</span></a>
      <a class="shmGoReadMore" href="${details}"><span class="text">Read More</span></a>
    </div>`;
  }
  function buildCard(job, cfg) {
    const card = el("div", { class: "shmJobResultStd shmJobResult" });
    card.setAttribute("data-rel", "article-job-result");
    card.setAttribute("data-id", str(job, "jobID"));
    setHtml(card, cardHtml(job, cfg));
    return card;
  }
  function renderCards(container, result, cfg) {
    if (result.page.length === 0) {
      setHtml(container, '<div class="shmNoResults">No jobs match your search.</div>');
      return;
    }
    renderList(
      container,
      result.page,
      (job) => jobKey(job),
      (job, existing) => existing != null ? existing : buildCard(job, cfg)
    );
  }
  function renderCount(root, total) {
    const nodes = root.querySelectorAll('[data-rel="label-results-count"]');
    for (const node of Array.from(nodes)) node.textContent = String(total);
  }

  // widgets/job-results/paging.ts
  var MAX_VISIBLE = 5;
  function windowBounds(page, totalPages) {
    const half = Math.floor(MAX_VISIBLE / 2);
    let start = Math.max(0, page - half);
    const end = Math.min(totalPages, start + MAX_VISIBLE);
    start = Math.max(0, end - MAX_VISIBLE);
    return [start, end];
  }
  function buildButtons(page, totalPages) {
    const buttons = [];
    buttons.push({ label: "<<", page: page - 1, active: false, disabled: page <= 0 });
    const [start, end] = windowBounds(page, totalPages);
    if (start > 0) {
      buttons.push({ label: "1", page: 0, active: page === 0, disabled: false });
      if (start > 1) buttons.push({ label: "...", page: null, active: false, disabled: true });
    }
    for (let i = start; i < end; i++) {
      buttons.push({ label: String(i + 1), page: i, active: i === page, disabled: false });
    }
    if (end < totalPages) {
      if (end < totalPages - 1) buttons.push({ label: "...", page: null, active: false, disabled: true });
      buttons.push({ label: String(totalPages), page: totalPages - 1, active: page === totalPages - 1, disabled: false });
    }
    buttons.push({ label: ">>", page: page + 1, active: false, disabled: page >= totalPages - 1 });
    return buttons;
  }
  function buttonHtml(b) {
    const classes = ["button-paging"];
    if (b.active) classes.push("active");
    if (b.disabled) classes.push("disabled");
    const rel = b.disabled || b.page === null ? "" : ' data-rel="paging-select"';
    const pageAttr = b.page === null ? "" : ` data-page-number="${b.page}"`;
    return `<a class="${classes.join(" ")}"${rel}${pageAttr}>${b.label}</a>`;
  }
  function renderPaging(container, total, pageSize, page) {
    const totalPages = pageSize > 0 ? Math.ceil(total / pageSize) : 1;
    if (totalPages <= 1) {
      setHtml(container, "");
      return;
    }
    const html = buildButtons(page, totalPages).map(buttonHtml).join("");
    setHtml(container, html);
  }

  // widgets/job-results/facets.ts
  var MASTER_LEVELS = [
    { field: "jobTypeID", labelKey: "jobType", idKey: "jobTypeID" },
    { field: "professionID", labelKey: "category", idKey: "professionID", seoKey: "professionSeo", parentField: "jobTypeID" },
    { field: "roleID", labelKey: "subCategory", idKey: "roleID", seoKey: "roleSeo", parentField: "professionID" },
    { field: "state", labelKey: "state", idKey: "state" },
    { field: "city", labelKey: "city", idKey: "city", parentField: "state" },
    { field: "workTypeID", labelKey: "workType", idKey: "workTypeID" },
    { field: "workModelID", labelKey: "workModel", idKey: "workModelID" },
    { field: "shiftType", labelKey: "shiftType", idKey: "shiftType" }
  ];
  function buildFacetTree(jobs) {
    return buildHierarchy(
      jobs.map((j) => ({ data: j })),
      { levels: MASTER_LEVELS }
    );
  }
  function groupsFor(cfg) {
    const groups = [];
    if (cfg.showJobTypeFilter) groups.push({ title: "Job Type", field: "jobTypeID" });
    if (cfg.showClassificationFilter) {
      const nest = cfg.useSubFilters && cfg.showSubClassificationFilter;
      groups.push({ title: "Classification", field: "professionID", childField: nest ? "roleID" : void 0 });
    }
    if (cfg.showSubClassificationFilter && !cfg.useSubFilters) {
      groups.push({ title: "Sub Classification", field: "roleID" });
    }
    if (cfg.showLocationFilter) {
      groups.push({ title: "Location", field: "state", childField: cfg.useSubFilters ? "city" : void 0 });
      if (!cfg.useSubFilters) groups.push({ title: "Area", field: "city" });
    }
    groups.push({ title: "Work Type", field: "workTypeID" });
    groups.push({ title: "Work Model", field: "workModelID" });
    groups.push({ title: "Shift", field: "shiftType" });
    return groups;
  }
  function isActive(state, field, id) {
    var _a;
    return ((_a = state[field]) != null ? _a : []).includes(id);
  }
  function toggleHtml(node, field, count, active, nested) {
    const tag = nested ? "a" : "div";
    const classes = ["filter-toggle"];
    if (nested) classes.push("filter-nested", "visible");
    if (active) classes.push("active");
    const seo = node.seo ? ` data-filter-path="${escapeHtml(node.seo)}"` : "";
    const parent = node.parent ? ` data-filter-parent-value="${escapeHtml(node.parent)}"` : "";
    const label = `${escapeHtml(node.value)} (${count})`;
    return `<${tag} class="${classes.join(" ")}" href="javascript:void(0)" data-rel="filter-toggle" data-filter-type="${escapeHtml(field)}" data-filter-value="${escapeHtml(node.id)}"${seo}${parent}><input type="checkbox"${active ? " checked" : ""} /> ${label}</${tag}>`;
  }
  function groupHtml(group, tree, state) {
    var _a, _b, _c, _d, _e;
    const nodes = (_a = tree.index[group.field]) != null ? _a : [];
    if (nodes.length === 0) return "";
    const parts = [
      `<p class="filter-title" data-rel="filter-group" data-filter-type="${escapeHtml(group.field)}">${escapeHtml(group.title)}</p>`
    ];
    for (const node of nodes) {
      const count = (_c = (_b = tree.counts[group.field]) == null ? void 0 : _b[node.id]) != null ? _c : 0;
      parts.push(toggleHtml(node, group.field, count, isActive(state, group.field, node.id), false));
      if (group.childField) {
        for (const child of tree.children(group.childField, node.id)) {
          const childCount = (_e = (_d = tree.counts[group.childField]) == null ? void 0 : _d[child.id]) != null ? _e : 0;
          parts.push(
            toggleHtml(child, group.childField, childCount, isActive(state, group.childField, child.id), true)
          );
        }
      }
    }
    return parts.join("");
  }
  function renderFacets(host, tree, cfg, state) {
    const html = groupsFor(cfg).map((g) => groupHtml(g, tree, state)).join("");
    setHtml(host, html);
  }

  // core/maps.ts
  function toLngLat(p) {
    return [p.lon, p.lat];
  }
  var MAPLIBRE_VERSION = "4.7.1";
  var CDN_BASE = `https://cdn.jsdelivr.net/npm/maplibre-gl@${MAPLIBRE_VERSION}/dist`;
  var MAPLIBRE_JS_URL = `${CDN_BASE}/maplibre-gl.js`;
  var MAPLIBRE_CSS_URL = `${CDN_BASE}/maplibre-gl.css`;
  var DEFAULT_STYLE_URL = "https://demotiles.maplibre.org/style.json";
  var loadPromise = null;
  function defaultLoadScript(url) {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = url;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Failed to load ${url}`));
      document.head.appendChild(script);
    });
  }
  function defaultLoadCss(url) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = url;
    document.head.appendChild(link);
  }
  function loadMapLibre(loadScript = defaultLoadScript, loadCss = defaultLoadCss, win = window) {
    if (win.maplibregl) return Promise.resolve(win.maplibregl);
    if (loadPromise) return loadPromise;
    loadPromise = (async () => {
      loadCss(MAPLIBRE_CSS_URL);
      await loadScript(MAPLIBRE_JS_URL);
      const gl = win.maplibregl;
      if (!gl) {
        loadPromise = null;
        throw new Error("maplibregl not present on window after load");
      }
      return gl;
    })();
    return loadPromise;
  }
  var DEFAULT_ZOOM = 2;
  var FIT_PADDING = 40;
  function createMap(container, options = {}) {
    var _a, _b, _c;
    const gl = (_a = options.maplibre) != null ? _a : window.maplibregl;
    if (!gl) {
      throw new Error("MapLibre not loaded \u2014 call loadMapLibre() first");
    }
    const map = new gl.Map({
      container,
      style: (_b = options.style) != null ? _b : DEFAULT_STYLE_URL,
      center: options.center ? toLngLat(options.center) : [0, 0],
      zoom: (_c = options.zoom) != null ? _c : DEFAULT_ZOOM
    });
    let markers = [];
    let points = [];
    const clearMarkers = () => {
      for (const m of markers) m.remove();
      markers = [];
    };
    return {
      setMarkers(next) {
        clearMarkers();
        points = next.slice();
        markers = points.map((p) => {
          const marker = new gl.Marker().setLngLat(toLngLat({ lat: p.lat, lon: p.lon }));
          if (p.popupHtml && marker.setPopup) {
            marker.setPopup(new gl.Popup().setHTML(p.popupHtml));
          }
          marker.addTo(map);
          return marker;
        });
      },
      fitToMarkers() {
        if (points.length === 0) return;
        const bounds = new gl.LngLatBounds();
        for (const p of points) bounds.extend(toLngLat({ lat: p.lat, lon: p.lon }));
        map.fitBounds(bounds, { padding: FIT_PADDING });
      },
      on(event, cb) {
        map.on(event, cb);
      },
      destroy() {
        clearMarkers();
        points = [];
        map.remove();
      }
    };
  }

  // widgets/job-results/map-view.ts
  function str2(job, key) {
    const v = job[key];
    return v == null ? "" : String(v);
  }
  function toPoint(job) {
    const lat = parseFloat(str2(job, "latitude"));
    const lon = parseFloat(str2(job, "longitude"));
    if (Number.isNaN(lat) || Number.isNaN(lon)) return null;
    const name = escapeHtml(str2(job, "jobName") || str2(job, "title"));
    const loc = escapeHtml([str2(job, "city"), str2(job, "state")].filter(Boolean).join(", "));
    return {
      id: str2(job, "jobID") || str2(job, "referenceNumber") || name,
      lat,
      lon,
      popupHtml: `<div class="gmapInfoContainer"><div class="gmapTitle">${name}</div><div>${loc}</div></div>`
    };
  }
  var MapView = class {
    constructor(container) {
      this.container = container;
      this.adapter = null;
      this.pending = [];
    }
    get isReady() {
      return this.adapter !== null;
    }
    /** Load MapLibre (once) and create the map, then paint the pending markers. */
    async ensure() {
      if (this.adapter) return;
      await loadMapLibre();
      this.adapter = createMap(this.container);
      this.setJobs(this.pending);
    }
    /** Update markers from a set of jobs. Buffers until the map is ready. */
    setJobs(jobs) {
      this.pending = jobs.slice();
      if (!this.adapter) return;
      const points = jobs.map(toPoint).filter((p) => p !== null);
      this.adapter.setMarkers(points);
      this.adapter.fitToMarkers();
    }
    destroy() {
      var _a;
      (_a = this.adapter) == null ? void 0 : _a.destroy();
      this.adapter = null;
    }
  };

  // widgets/job-results/state.ts
  var DEFAULT_SORT = { field: "changedOnUTC", direction: "desc" };
  var DEFAULT_GEO_RANGE = 50;
  function initialState() {
    return {
      facets: {},
      keyword: "",
      location: "",
      geo: null,
      geoAddress: "",
      geoRange: DEFAULT_GEO_RANGE,
      sort: DEFAULT_SORT,
      page: 0
    };
  }
  function patch(state, next) {
    return { ...state, ...next };
  }
  function toFilterInput(state) {
    const input = {};
    for (const [k, v] of Object.entries(state.facets)) {
      if (v.length > 0) input[k] = [...v];
    }
    const keyword = state.keyword.trim();
    if (keyword !== "") input.keyword = [keyword];
    if (state.geo) {
      input.geo = [state.geo];
      input.geoRange = [state.geoRange];
      if (state.geoAddress) input.geoAddress = [state.geoAddress];
    } else {
      const location = state.location.trim();
      if (location !== "") input.location = [location];
    }
    return input;
  }

  // widgets/job-results/index.ts
  var GEOCODE_DEBOUNCE_MS = 500;
  var INPUT_DEBOUNCE_MS = 400;
  var FAKE_JOBS = [
    { jobID: "1", jobName: "Senior Nurse", category: "Healthcare", jobType: "Permanent", jobTypeID: "perm", professionID: "health", city: "London", state: "England", workType: "Full Time", changedOnUTC: (/* @__PURE__ */ new Date()).toISOString() },
    { jobID: "2", jobName: "Site Engineer", category: "Construction", jobType: "Contract", jobTypeID: "contract", professionID: "build", city: "Manchester", state: "England", workType: "Contract", changedOnUTC: (/* @__PURE__ */ new Date()).toISOString() }
  ];
  function $one(root, sel) {
    return root.querySelector(sel);
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
  function writeHash(state) {
    const payload = JSON.stringify({ facets: state.facets, keyword: state.keyword });
    window.history.replaceState(null, "", `#${encodeURIComponent(payload)}`);
  }
  function jobResults(ctx) {
    const { element, data, shazamme } = ctx;
    const cfg = readConfig(data);
    const sdk = wrapSdk(shazamme);
    const proximityEnabled = cfg.showLocationFilter && cfg.geocodeApiKey.trim() !== "";
    const details = $one(element, ".section-details");
    const listEl = $one(element, '[data-rel="job-results-list"]');
    const pagingEl = $one(element, '[data-rel="job-results-paging"]');
    const facetHost = $one(element, '[data-rel="filter-attribute"]');
    const sidebar = $one(element, '[data-rel="filter-sidebar"]');
    const actionBar = $one(element, '[data-rel="action-bar"]');
    const mapWrap = $one(element, '[data-rel="job-results-map"]');
    const mapContainer = $one(element, "#shmMap");
    const listWrap = $one(element, ".shmResultViewPagination");
    if (!details || !listEl || !pagingEl || !facetHost || !sidebar) return;
    let model;
    let tree;
    let state = { ...initialState(), ...readHash() };
    let lastPage = [];
    let currentUser = null;
    const mapView = mapContainer ? new MapView(mapContainer) : null;
    function render() {
      const input = toFilterInput(state);
      const result = model.query(input, state.sort, state.page, cfg.pageSize);
      lastPage = result.page;
      renderCards(listEl, result, cfg);
      renderCount(element, result.total);
      renderPaging(pagingEl, result.total, cfg.pageSize, state.page);
      renderFacets(facetHost, tree, cfg, state.facets);
      if (mapView == null ? void 0 : mapView.isReady) mapView.setJobs(result.page);
      writeHash(state);
      resultsReadyChannel.publish(sdk, { total: result.total });
    }
    function applyConfigVisibility() {
      const locationBlock = $one(element, '[data-rel="filter-location-block"]');
      const proximityBlock = $one(element, '[data-rel="filter-proximity-block"]');
      if (locationBlock) locationBlock.hidden = !cfg.showLocationFilter;
      if (proximityBlock) proximityBlock.hidden = !proximityEnabled;
      const display = $one(element, '[data-rel="geo-range-display"]');
      if (display) display.textContent = `${state.geoRange} ${cfg.proximityDiameter === "6371" ? "mi" : "km"}`;
    }
    function setView(view) {
      const isMap = view === "Map";
      if (mapWrap) mapWrap.hidden = !isMap;
      if (listWrap) listWrap.hidden = isMap;
      actionBar == null ? void 0 : actionBar.querySelectorAll('[data-toggle="results-view"]').forEach((b) => b.classList.toggle("active", b.getAttribute("data-view") === view));
      if (isMap && mapView) {
        mapView.setJobs(lastPage);
        mapView.ensure().catch(() => void 0);
      }
    }
    function showPredictions(results) {
      const host = $one(element, '[data-rel="geo-prediction"]');
      if (!host) return;
      if (results.length === 0) {
        setHtml(host, "");
        host.style.display = "none";
        return;
      }
      const rows = results.slice(0, 6).map(
        (r) => `<a href="javascript:void(0)" class="result-text" data-value="${r.lat},${r.lon}" data-label="${escapeHtml(r.label)}">${escapeHtml(r.label)}</a>`
      ).join("");
      setHtml(host, `${rows}<a href="javascript:void(0)" class="result-text close" data-value="" data-label="">close</a>`);
      host.style.display = "flex";
    }
    const runGeocode = debounce((term) => {
      geocode(term, cfg.geocodeApiKey).then(showPredictions).catch(() => void 0);
    }, GEOCODE_DEBOUNCE_MS);
    const applyKeyword = debounce((field, value) => {
      if (field === "keyword") {
        state = patch(state, { keyword: value, page: 0 });
      } else if (field === "location") {
        state = patch(state, { location: value, geo: null, geoAddress: "", page: 0 });
        if (proximityEnabled && value.trim() !== "") runGeocode(value);
      }
      render();
    }, INPUT_DEBOUNCE_MS);
    function wireEvents() {
      delegate(sidebar, "click", '[data-rel="filter-toggle"]', (ev, matched) => {
        ev.preventDefault();
        const field = matched.getAttribute("data-filter-type");
        const id = matched.getAttribute("data-filter-value");
        if (!field || !id) return;
        state = patch(state, { facets: toggleFacet(state.facets, tree, field, id), page: 0 });
        render();
      });
      delegate(sidebar, "input", '[data-rel="job-result-filter-keyword"]', (_ev, matched) => {
        var _a;
        const field = (_a = matched.getAttribute("data-keyword-field")) != null ? _a : "";
        applyKeyword(field, matched.value);
      });
      delegate(sidebar, "click", '[data-rel="job-result-filter-keyword-clear"]', (_ev, matched) => {
        const field = matched.getAttribute("data-keyword-field");
        if (field === "keyword") state = patch(state, { keyword: "", page: 0 });
        else if (field === "location") state = patch(state, { location: "", geo: null, geoAddress: "", page: 0 });
        const input = sidebar.querySelector(`[data-keyword-field="${field}"]`);
        if (input) input.value = "";
        render();
      });
      delegate(sidebar, "click", '[data-rel="geo-prediction"] .result-text', (ev, matched) => {
        var _a, _b;
        ev.preventDefault();
        const value = (_a = matched.getAttribute("data-value")) != null ? _a : "";
        const label = (_b = matched.getAttribute("data-label")) != null ? _b : "";
        const host = $one(element, '[data-rel="geo-prediction"]');
        if (host) host.style.display = "none";
        if (value === "") return;
        const [lat, lon] = value.split(",").map((n) => parseFloat(n));
        const input = sidebar.querySelector('[data-keyword-field="location"]');
        if (input) input.value = label;
        state = patch(state, { geo: { lat, lon }, geoAddress: label, location: "", page: 0 });
        render();
      });
      delegate(sidebar, "input", '[data-filter="geoRange"]', (_ev, matched) => {
        const val = parseInt(matched.value, 10) || DEFAULT_GEO_RANGE;
        const display = $one(element, '[data-rel="geo-range-display"]');
        if (display) display.textContent = `${val} ${cfg.proximityDiameter === "6371" ? "mi" : "km"}`;
        state = patch(state, { geoRange: val, page: 0 });
        if (state.geo) render();
      });
      if (actionBar) {
        delegate(actionBar, "click", "[data-sort-field]", (ev, matched) => {
          ev.preventDefault();
          const field = matched.getAttribute("data-sort-field");
          const direction = matched.getAttribute("data-sort-direction");
          if (!field || !direction) return;
          actionBar.querySelectorAll("[data-sort-field]").forEach((n) => n.classList.remove("active"));
          matched.classList.add("active");
          state = patch(state, { sort: { field, direction: direction === "asc" ? "asc" : "desc" }, page: 0 });
          render();
        });
        delegate(actionBar, "click", '[data-toggle="results-view"]', (ev, matched) => {
          ev.preventDefault();
          setView(matched.getAttribute("data-view"));
        });
      }
      delegate(details, "click", '[data-rel="paging-select"]', (ev, matched) => {
        var _a;
        ev.preventDefault();
        const p = parseInt((_a = matched.getAttribute("data-page-number")) != null ? _a : "0", 10);
        state = patch(state, { page: Number.isNaN(p) ? 0 : p });
        render();
      });
      delegate(details, "click", '[data-rel="action-save-job"], [data-rel="action-unsave-job"]', (ev, matched) => {
        var _a;
        ev.preventDefault();
        const card = matched.closest('[data-rel="article-job-result"]');
        const jobID = (_a = card == null ? void 0 : card.getAttribute("data-id")) != null ? _a : "";
        if (jobID === "") return;
        const saving = matched.getAttribute("data-rel") === "action-save-job";
        matched.classList.toggle("active", saving);
        matched.setAttribute("data-rel", saving ? "action-unsave-job" : "action-save-job");
        const action = saving ? "Save Job" : "Delete Saved Job";
        sdk.submit(action, { jobID, candidateID: currentUser == null ? void 0 : currentUser.userID }).catch(() => void 0);
      });
    }
    function subscribe() {
      onFilterChange(sdk, (payload) => {
        var _a, _b, _c, _d;
        state = patch(state, {
          facets: (_a = payload.state) != null ? _a : {},
          keyword: (_b = payload.keyword) != null ? _b : "",
          geo: (_c = payload.geo) != null ? _c : null,
          geoRange: (_d = payload.geoRange) != null ? _d : state.geoRange,
          page: 0
        });
        render();
      });
      loginChannel.subscribe(sdk, (user) => {
        currentUser = user;
      });
    }
    (async () => {
      try {
        model = await loadJobs(sdk, cfg, { levels: MASTER_LEVELS });
      } catch (e) {
        model = buildModel(FAKE_JOBS, cfg, { levels: MASTER_LEVELS });
      }
      tree = buildFacetTree(model.all());
      applyConfigVisibility();
      wireEvents();
      subscribe();
      render();
    })();
  }
  return __toCommonJS(index_exports);
})();
(function(){
  var reg = (typeof module !== 'undefined' && module.exports) || {};
  var controller = reg.default || reg;
  if (typeof window !== 'undefined') {
    window.ShazammeWidget = window.ShazammeWidget || {};
    window.ShazammeWidget["job-results"] = controller;
  }
})();

/* shazamme-widgets — shazamme-widgets v0.1.0
 * Build 050ba0bc6729. Registers window.ShazammeWidget["<name>"].
 */
"use strict";
var __shazWidgetExport = (() => {
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

  // widgets/job-board/index.ts
  var index_exports = {};
  __export(index_exports, {
    default: () => jobBoard
  });

  // core/site-jobs.ts
  var SDK_READY_TIMEOUT_MS = 1200;
  var COLLECTION_PAGE_SIZE = 100;
  var COLLECTION_MAX_PAGES = 20;
  var COLLECTION_TIMEOUT_MS = 4e3;
  var DMAPI_POLL_MS = 50;
  var DMAPI_WAIT_MS = 1500;
  var COLLECTION_CONCURRENCY = 5;
  function text(v) {
    if (typeof v === "string") return v.trim();
    if (typeof v === "number" && Number.isFinite(v)) return String(v);
    return "";
  }
  function esc(v) {
    return String(v != null ? v : "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  function safeUrl(v) {
    const s = typeof v === "string" ? v.trim() : "";
    if (!s || /[\\\u0000-\u001f\u007f]/.test(s)) return "";
    if (/^https?:\/\//i.test(s)) return s;
    if (/^\/(?![/\\])/.test(s)) return s;
    return "";
  }
  function clampInt(v, fallback, min, max) {
    const n = typeof v === "number" ? v : parseInt(String(v != null ? v : "").trim(), 10);
    return Number.isFinite(n) ? Math.max(min, Math.min(max, Math.trunc(n))) : fallback;
  }
  function flag(v, fallback) {
    if (typeof v === "boolean") return v;
    if (typeof v === "string") {
      const s = v.trim().toLowerCase();
      if (s === "true" || s === "1" || s === "yes" || s === "on") return true;
      if (s === "false" || s === "0" || s === "no" || s === "off") return false;
    }
    return fallback;
  }
  function pick(v, allowed, fallback) {
    var _a;
    const s = text(v).toLowerCase();
    return (_a = allowed.find((a) => a.toLowerCase() === s)) != null ? _a : fallback;
  }
  function getSdk(shazamme) {
    const sdk = shazamme != null ? shazamme : typeof window !== "undefined" ? window.shazamme : void 0;
    return sdk && typeof sdk.fetch === "function" ? sdk : void 0;
  }
  async function ensureSdkReady(sdk, data) {
    const s = sdk;
    const d = data != null ? data : {};
    const sid = s._sid || d.siteId || d.siteID;
    if (!sid) return;
    s._sid = s._sid || sid;
    if (s._site || typeof s.ready !== "function") return;
    try {
      await Promise.race([
        Promise.resolve(s.ready(s._sid, d.page)),
        new Promise((resolve) => setTimeout(resolve, SDK_READY_TIMEOUT_MS))
      ]);
    } catch (e) {
    }
  }
  function toRows(raw) {
    var _a, _b;
    const list = Array.isArray(raw) ? raw : raw == null ? void 0 : raw.values;
    if (!Array.isArray(list)) return [];
    const rows = [];
    for (const item of list) {
      const fields = (_a = item == null ? void 0 : item.data) != null ? _a : item;
      if (!fields || typeof fields !== "object" || fields.activeStatus === false || fields.activeStatus === "false") continue;
      const fromUrl = (_b = text(fields.jobURL).split(/[?#]/)[0].split("/").filter(Boolean).pop()) != null ? _b : "";
      rows.push({ fields, pageItemUrl: text(item.page_item_url) || fromUrl });
    }
    return rows;
  }
  async function loadSiteJobs(shazamme, data, inEditor) {
    var _a, _b;
    const sdk = getSdk(shazamme);
    if (!sdk) throw new Error("The Shazamme SDK did not load.");
    await ensureSdkReady(sdk, data);
    const site = await sdk.site();
    const key = String((_a = site == null ? void 0 : site.siteID) != null ? _a : "");
    if (!key) throw new Error("The site id could not be read.");
    const win = window;
    const cache = win.__shmSiteJobs = (_b = win.__shmSiteJobs) != null ? _b : /* @__PURE__ */ new Map();
    const hit = cache.get(key);
    if (hit && !inEditor) return hit;
    const desc = { name: "Jobs", action: "Get Jobs", useCache: !inEditor, path: `/job-results/${key}`, isExternal: true };
    const pending = Promise.resolve(sdk.fetch(desc)).then(toRows);
    if (!inEditor) {
      cache.set(key, pending);
      pending.catch(() => cache.delete(key));
    }
    return pending;
  }
  async function waitForCollectionsApi(waitMs = DMAPI_WAIT_MS, signal) {
    var _a;
    const win = window;
    const started = Date.now();
    for (; ; ) {
      const loader = (_a = win.dmAPI) == null ? void 0 : _a.loadCollectionsAPI;
      if (typeof loader === "function") return loader.bind(win.dmAPI);
      if (signal == null ? void 0 : signal.aborted) throw new Error("The collection read was stopped.");
      if (Date.now() - started >= waitMs) throw new Error("The Duda collections API is not on this page.");
      await new Promise((resolve) => setTimeout(resolve, DMAPI_POLL_MS));
    }
  }
  async function loadCollectionJobs(name, inEditor, signal) {
    var _a;
    const win = window;
    const cache = win.__shmSiteJobs = (_a = win.__shmSiteJobs) != null ? _a : /* @__PURE__ */ new Map();
    const key = `collection:${name}`;
    const hit = cache.get(key);
    if (hit && !inEditor) return hit;
    const pending = waitForCollectionsApi(DMAPI_WAIT_MS, signal).then((loader) => loader()).then((api) => readAllPages(name, (n) => api.data(name).pageSize(COLLECTION_PAGE_SIZE).pageNumber(n).get(), signal));
    if (!inEditor) {
      cache.set(key, pending);
      pending.catch(() => cache.delete(key));
    }
    return pending;
  }
  function pageValues(res) {
    if (Array.isArray(res)) return res;
    return Array.isArray(res == null ? void 0 : res.values) ? res.values : [];
  }
  function pageMeta(res) {
    var _a;
    const page = Array.isArray(res) ? void 0 : res == null ? void 0 : res.page;
    const whole = (v) => {
      const n = Number(v);
      return Number.isFinite(n) && n > 0 ? Math.trunc(n) : 0;
    };
    return { echo: Number((_a = page == null ? void 0 : page.pageNumber) != null ? _a : NaN), total: whole(page == null ? void 0 : page.totalPages), size: whole(page == null ? void 0 : page.pageSize), items: whole(page == null ? void 0 : page.totalItems) };
  }
  function dedupe(rows) {
    const seen = /* @__PURE__ */ new Set();
    return rows.filter((r) => {
      if (!r.pageItemUrl) return true;
      if (seen.has(r.pageItemUrl)) return false;
      seen.add(r.pageItemUrl);
      return true;
    });
  }
  async function readPool(first, count, get, signal) {
    const out = new Array(count);
    let next = 0;
    const worker = async () => {
      while (next < count) {
        const i = next;
        next += 1;
        stopIfAborted(signal);
        out[i] = pageValues(await get(first + i));
      }
    };
    await Promise.all(Array.from({ length: Math.min(COLLECTION_CONCURRENCY, count) }, worker));
    return out;
  }
  function stopIfAborted(signal) {
    if (signal == null ? void 0 : signal.aborted) throw new Error("The collection read was stopped.");
  }
  async function readAllPages(name, get, signal) {
    stopIfAborted(signal);
    let first = await get(0);
    let base = pageMeta(first).echo === 1 ? 1 : 0;
    if (!pageValues(first).length && !pageMeta(first).total) {
      stopIfAborted(signal);
      const one = await get(1);
      if (pageValues(one).length) {
        first = one;
        base = 1;
      }
    }
    const meta = pageMeta(first);
    const size = Math.min(meta.size || COLLECTION_PAGE_SIZE, COLLECTION_PAGE_SIZE);
    const pages = [pageValues(first)];
    const full = () => pages[pages.length - 1].length >= size;
    const total = Math.min(meta.total, COLLECTION_MAX_PAGES);
    if (total > 1) pages.push(...await readPool(base + 1, total - 1, get, signal));
    while (full() && pages.length < COLLECTION_MAX_PAGES) {
      stopIfAborted(signal);
      pages.push(pageValues(await get(base + pages.length)));
    }
    if (full() && pages.length >= COLLECTION_MAX_PAGES && await hasMoreRows(meta, () => get(base + COLLECTION_MAX_PAGES), signal)) {
      console.warn(`[site-jobs] collection "${name}" has more than ${COLLECTION_MAX_PAGES * COLLECTION_PAGE_SIZE} rows; only the first ${COLLECTION_MAX_PAGES} pages are shown`);
    }
    return dedupe(toRows(pages.flat()));
  }
  async function hasMoreRows(meta, next, signal) {
    if (meta.items) return meta.items > COLLECTION_MAX_PAGES * COLLECTION_PAGE_SIZE;
    if (meta.total) return meta.total > COLLECTION_MAX_PAGES;
    stopIfAborted(signal);
    return pageValues(await next()).length > 0;
  }
  function withTimeout(work, ms, what, onLate) {
    let timer;
    const late = new Promise((_, reject) => {
      timer = setTimeout(() => {
        onLate == null ? void 0 : onLate();
        reject(new Error(`${what} took longer than ${ms}ms`));
      }, ms);
    });
    return Promise.race([work, late]).finally(() => clearTimeout(timer));
  }
  async function loadJobsFrom(collection, shazamme, data, inEditor, collectionTimeoutMs = COLLECTION_TIMEOUT_MS, signal) {
    if (collection) {
      let late = false;
      const read = {
        get aborted() {
          return late || inEditor && !!(signal == null ? void 0 : signal.aborted);
        }
      };
      try {
        const jobs = await withTimeout(loadCollectionJobs(collection, inEditor, read), collectionTimeoutMs, `The "${collection}" collection`, () => {
          late = true;
        });
        return { jobs, source: "collection" };
      } catch (err) {
        if (inEditor) console.warn(`[site-jobs] collection "${collection}" could not be read, using the job feed`, err);
      }
    }
    return { jobs: await loadSiteJobs(shazamme, data, inEditor), source: "feed" };
  }

  // core/salary.ts
  var SYMBOLS = { AUD: "$", USD: "$", NZD: "$", CAD: "$", SGD: "$", HKD: "$", GBP: "\xA3", EUR: "\u20AC", INR: "\u20B9", JPY: "\xA5", ZAR: "R" };
  var PER_YEAR = { hourly: 1976, daily: 230, weekly: 52, monthly: 12 };
  var UNIT = { hourly: "per hour", daily: "per day", weekly: "per week", monthly: "per month" };
  var SUFFIX_RE = /^(\+|&|per\b|plus\b|pro[\s-]?rata\b|base\b|p\.?\s?[ahdw]\.?(\s|$)|inc\.?\b|incl\.?\b|including\b|ote\b|\()/i;
  function str(v) {
    if (typeof v === "string") return v.trim();
    if (typeof v === "number" && Number.isFinite(v)) return String(v);
    return "";
  }
  function amount(v) {
    const n = parseFloat(str(v).replace(/[^0-9.-]/g, ""));
    return Number.isFinite(n) && n > 0 ? n : 0;
  }
  function isHidden(f) {
    return f.isDisplaySalary === false || str(f.isDisplaySalary).toLowerCase() === "false";
  }
  function ends(f) {
    return { from: amount(f.salaryFrom) || amount(f.realSalaryFrom), to: amount(f.salaryTo) || amount(f.realSalaryTo) };
  }
  var THREE_LETTERS = /^[A-Za-z]{3}$/;
  var SYMBOL_AMOUNT_RE = /[$£€¥₹]\s?\d/;
  function codeFor(f) {
    const code = str(f.currencyCode) || str(f.salaryCurrency) || str(f.currency);
    if (code) return code.toUpperCase();
    const given = str(f.currencySymbol);
    return THREE_LETTERS.test(given) ? given.toUpperCase() : "";
  }
  function hasCurrency(row) {
    if (!row || typeof row !== "object") return false;
    return !!(codeFor(row) || str(row.currencySymbol));
  }
  function symbolFor(f) {
    const code = codeFor(f);
    if (SYMBOLS[code]) return SYMBOLS[code];
    const given = str(f.currencySymbol);
    if (given && !THREE_LETTERS.test(given)) return given;
    if (/^[A-Z]{3}$/.test(code)) return `${code} `;
    return "";
  }
  function money(n, symbol) {
    return `${symbol}${Math.round(n).toLocaleString("en-AU")}`;
  }
  function salaryRange(row) {
    if (!row || typeof row !== "object") return "";
    const { from, to } = ends(row);
    const symbol = symbolFor(row);
    if (from && to && from !== to) return `${money(Math.min(from, to), symbol)} \u2013 ${money(Math.max(from, to), symbol)}`;
    const one = from || to;
    return one ? money(one, symbol) : "";
  }
  function figuresIn(wording) {
    return [...wording.matchAll(/(\d[\d,]*(?:\.\d+)?)\s*(k\b)?/gi)].map((m) => parseFloat(m[1].replace(/,/g, "")) * (m[2] ? 1e3 : 1));
  }
  function statesPay(wording, row) {
    if (SYMBOL_AMOUNT_RE.test(wording)) return true;
    const { from, to } = ends(row);
    return figuresIn(wording).some((n) => n === from || n === to);
  }
  function payLine(row) {
    if (!row || typeof row !== "object" || isHidden(row)) return "";
    const wording = str(row.salaryText);
    const range = salaryRange(row);
    if (wording && (statesPay(wording, row) || !SUFFIX_RE.test(wording))) return wording;
    if (!range) return "";
    if (!wording) {
      const unit = UNIT[str(row.salaryType).toLowerCase()];
      return unit ? `${range} ${unit}` : range;
    }
    return `${range} ${wording}`;
  }
  function payLineDefaultAud(row) {
    if (!row || typeof row !== "object") return "";
    return payLine(hasCurrency(row) ? row : { ...row, currencyCode: "AUD" });
  }
  function annualPay(row) {
    var _a;
    if (!row || typeof row !== "object" || isHidden(row)) return 0;
    const { from, to } = ends(row);
    const top = Math.max(from, to);
    return top * ((_a = PER_YEAR[str(row.salaryType).toLowerCase()]) != null ? _a : 1);
  }

  // widgets/job-board/settings.ts
  var GROUP_IDS = ["profession", "role", "workType", "workModel", "country", "state", "city"];
  var SORTS = ["newest", "salary-high", "salary-low"];
  var LOCATION_FORMATS = ["city", "city-state", "city-country", "city-state-country"];
  var HEADING_TAGS = ["h2", "h3", "h4", "p"];
  var CARD_LABELS = ["profession", "role", "none"];
  var PAGING = ["pages", "loadmore"];
  var GROUPS_OPEN = ["all", "first", "none"];
  var DEFAULT_GROUPS = "profession, workType, workModel, country, city";
  var LABEL_KEYS = {
    profession: "labelProfession",
    role: "labelRole",
    workType: "labelWorkType",
    workModel: "labelWorkModel",
    country: "labelCountry",
    state: "labelState",
    city: "labelCity"
  };
  var LABEL_DEFAULTS = {
    profession: "Profession",
    role: "Role",
    workType: "Work type",
    workModel: "Work model",
    country: "Country",
    state: "State",
    city: "City"
  };
  function parseGroups(v, config) {
    const raw = typeof v === "string" ? v : DEFAULT_GROUPS;
    const seen = /* @__PURE__ */ new Set();
    for (const part of raw.split(/[,;\n]/)) {
      const id = GROUP_IDS.find((g) => g.toLowerCase() === part.trim().toLowerCase());
      if (id) seen.add(id);
    }
    return [...seen].map((id) => ({ id, label: text(config[LABEL_KEYS[id]]) || LABEL_DEFAULTS[id] }));
  }
  function readSettings(config = {}) {
    const t = (key, fallback) => text(config[key]) || fallback;
    return {
      jobsCollection: typeof config.jobsCollection === "string" ? config.jobsCollection.trim() : "Jobs",
      detailsPage: (safeUrl(config.detailsPage) || "/job-details").replace(/\/+$/, ""),
      syncAddress: flag(config.syncAddress, true),
      showSearch: flag(config.showSearch, true),
      searchPrompt: typeof config.searchPrompt === "string" ? config.searchPrompt.trim() : "Looking for your next opportunity?",
      keywordPlaceholder: t("keywordPlaceholder", "Keyword"),
      locationPlaceholder: t("locationPlaceholder", "Location"),
      showLocationSearch: flag(config.showLocationSearch, true),
      searchButtonLabel: t("searchButtonLabel", "Search jobs"),
      searchOverlap: clampInt(config.searchOverlap, 0, 0, 240),
      showFilters: flag(config.showFilters, true),
      groups: parseGroups(config.filterGroups, config),
      optionsShown: clampInt(config.optionsShown, 8, 1, 50),
      groupsOpen: pick(config.groupsOpen, GROUPS_OPEN, "all"),
      showMoreText: t("showMoreText", "Show more"),
      showLessText: t("showLessText", "Show less"),
      filtersTitle: t("filtersTitle", "Filter jobs"),
      filtersButtonText: t("filtersButtonText", "Filters"),
      closeText: t("closeText", "Close filters"),
      applyText: t("applyText", "Show {count} jobs"),
      clearText: t("clearText", "Clear all"),
      pageSize: clampInt(config.pageSize, 12, 3, 60),
      paging: pick(config.paging, PAGING, "pages"),
      loadMoreText: t("loadMoreText", "Load more jobs"),
      prevText: t("prevText", "Previous"),
      nextText: t("nextText", "Next"),
      pagerLabel: t("pagerLabel", "Job pages"),
      pageAriaText: t("pageAriaText", "Page {count}"),
      showSort: flag(config.showSort, true),
      defaultSort: pick(config.defaultSort, SORTS, "newest"),
      sortLabel: t("sortLabel", "Sort by"),
      sortNames: {
        newest: t("sortNewest", "Newest"),
        "salary-high": t("sortSalaryHigh", "Highest salary"),
        "salary-low": t("sortSalaryLow", "Lowest salary")
      },
      countOne: t("countOne", "{count} job"),
      countMany: t("countMany", "{count} jobs"),
      cardLabel: pick(config.cardLabel, CARD_LABELS, "profession"),
      headingTag: pick(config.headingTag, HEADING_TAGS, "h3"),
      showSalary: flag(config.showSalary, true),
      noSalaryText: typeof config.noSalaryText === "string" ? config.noSalaryText.trim() : "Competitive",
      locationFormat: pick(config.locationFormat, LOCATION_FORMATS, "city-state"),
      showWorkType: flag(config.showWorkType, true),
      showWorkModel: flag(config.showWorkModel, false),
      emptyTitle: t("emptyTitle", "No jobs match your search"),
      emptyText: t("emptyText", "Try removing a filter or searching for something broader."),
      noJobsText: t("noJobsText", "There are no live jobs right now. Check back soon."),
      loadErrorText: t("loadErrorText", "We couldn't load the jobs just now. Please try again."),
      retryText: t("retryText", "Try again")
    };
  }
  var fill = (template, count) => template.split("{count}").join(String(count));

  // widgets/job-board/board.ts
  var VALUE = {
    profession: (f) => text(f.profession) || text(f.category),
    role: (f) => text(f.role) || text(f.subCategory),
    workType: (f) => text(f.workTypeLabel) || text(f.workType),
    workModel: (f) => text(f.workModel),
    country: (f) => text(f.country),
    state: (f) => text(f.state),
    city: (f) => text(f.city)
  };
  var KEYWORD_FIELDS = ["jobName", "positionTitle", "category", "subCategory", "profession", "role", "shortDescription", "tags", "referenceNumber", "workType"];
  var LOCATION_FIELDS = ["city", "state", "country", "postalCode", "location", "address", "fullAddressForSearch"];
  var valueOf = (job, id) => VALUE[id](job.fields);
  var fold = (s) => s.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "");
  var words = (query) => fold(query).split(/[\s,]+/).filter(Boolean);
  var keywordTerms = (query) => query.split(",").map((term) => fold(term).split(/\s+/).filter(Boolean)).filter((t) => t.length > 0);
  var matchesKeywords = (hay, terms) => !terms.length || terms.some((term) => term.every((w) => hay.includes(w)));
  var indexes = /* @__PURE__ */ new WeakMap();
  function buildIndex(jobs) {
    const totals = Object.fromEntries(GROUP_IDS.map((id) => [id, /* @__PURE__ */ new Map()]));
    const entries = jobs.map((job) => {
      const folded = {};
      for (const id of GROUP_IDS) {
        const v = valueOf(job, id);
        const k = v ? fold(v) : "";
        folded[id] = k;
        if (!k) continue;
        const entry = totals[id].get(k);
        if (entry) entry.total += 1;
        else totals[id].set(k, { value: v, total: 1 });
      }
      const hay = (fields) => fold(fields.map((k) => text(job.fields[k])).join(" "));
      return { job, kw: hay(KEYWORD_FIELDS), loc: hay(LOCATION_FIELDS), folded };
    });
    for (const id of GROUP_IDS) {
      totals[id] = new Map([...totals[id].entries()].sort((a, b) => b[1].total - a[1].total || a[1].value.localeCompare(b[1].value, "en-AU")));
    }
    return { entries, totals };
  }
  function indexFor(jobs) {
    let index = indexes.get(jobs);
    if (!index) {
      index = buildIndex(jobs);
      indexes.set(jobs, index);
    }
    return index;
  }
  function searchBoard(jobs, state, groups) {
    var _a;
    const { entries, totals } = indexFor(jobs);
    const kw = keywordTerms(state.keyword);
    const loc = words(state.location);
    const picks = GROUP_IDS.filter((id) => {
      var _a2;
      return (_a2 = state.selected[id]) == null ? void 0 : _a2.length;
    }).map((id) => {
      var _a2;
      return [id, new Set(((_a2 = state.selected[id]) != null ? _a2 : []).map(fold))];
    });
    const shown = groups.map((g) => g.id);
    const live = Object.fromEntries(shown.map((id) => [id, /* @__PURE__ */ new Map()]));
    const matched = [];
    for (const e of entries) {
      if (!matchesKeywords(e.kw, kw) || !loc.every((w) => e.loc.includes(w))) continue;
      let misses = 0;
      let missed;
      for (const [id, set] of picks) {
        if (set.has(e.folded[id])) continue;
        misses += 1;
        missed = id;
        if (misses > 1) break;
      }
      if (misses === 0) matched.push(e.job);
      if (misses > 1) continue;
      for (const id of shown) {
        if (misses === 1 && missed !== id) continue;
        const k = e.folded[id];
        if (k) live[id].set(k, ((_a = live[id].get(k)) != null ? _a : 0) + 1);
      }
    }
    const facets = groups.map(({ id, label }) => {
      var _a2;
      const chosen = (_a2 = state.selected[id]) != null ? _a2 : [];
      const keys = new Set(chosen.map(fold));
      const options = [...totals[id].entries()].map(([k, { value }]) => {
        var _a3;
        return { value, count: (_a3 = live[id].get(k)) != null ? _a3 : 0, checked: keys.has(k) };
      });
      const extra = chosen.filter((p, i) => !totals[id].has(fold(p)) && chosen.findIndex((q2) => fold(q2) === fold(p)) === i).sort((a, b) => a.localeCompare(b, "en-AU"));
      return { id, label, options: [...options, ...extra.map((value) => ({ value, count: 0, checked: true }))] };
    }).filter((f) => f.options.length > 0);
    return { matched, facets };
  }
  function postedAt(j) {
    return Date.parse(text(j.fields.addedOnUTC) || text(j.fields.changedOnUTC) || "") || 0;
  }
  function sortJobs(jobs, sort) {
    const newest = (a, b) => postedAt(b) - postedAt(a);
    if (sort === "newest") return [...jobs].sort(newest);
    const dir = sort === "salary-high" ? -1 : 1;
    return [...jobs].sort((a, b) => {
      const pa = annualPay(a.fields);
      const pb = annualPay(b.fields);
      if (!pa !== !pb) return pa ? -1 : 1;
      return (pa - pb) * dir || newest(a, b);
    });
  }
  function pageCount(total, size) {
    return Math.max(1, Math.ceil(total / size));
  }
  function visibleJobs(jobs, state, s) {
    const page = Math.min(Math.max(1, state.page), pageCount(jobs.length, s.pageSize));
    const start = s.paging === "loadmore" ? 0 : (page - 1) * s.pageSize;
    return jobs.slice(start, page * s.pageSize);
  }
  function pageList(current, total) {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    const keep = /* @__PURE__ */ new Set([1, total, current - 1, current, current + 1]);
    const out = [];
    for (let n = 1; n <= total; n += 1) {
      if (keep.has(n)) out.push(n);
      else if (out[out.length - 1] !== "\u2026") out.push("\u2026");
    }
    return out;
  }
  function safeDecode(seg) {
    try {
      return decodeURIComponent(seg);
    } catch (e) {
      return seg;
    }
  }
  function whereFor(f, format) {
    const parts = [text(f.city)];
    if (format === "city-state" || format === "city-state-country") parts.push(text(f.state));
    if (format === "city-country" || format === "city-state-country") parts.push(text(f.country));
    return parts.filter(Boolean).join(", ");
  }
  function toCard(job, s) {
    const f = job.fields;
    const label = s.cardLabel === "none" ? "" : valueOf(job, s.cardLabel);
    const path = job.pageItemUrl.split(/[/\\]/).map((seg) => safeDecode(seg)).filter((seg) => seg && seg !== "." && seg !== "..").map((seg) => encodeURIComponent(seg)).join("/");
    return {
      label,
      title: text(f.jobName) || text(f.positionTitle),
      pay: s.showSalary ? payLineDefaultAud(f) || s.noSalaryText : "",
      where: whereFor(f, s.locationFormat),
      workType: s.showWorkType ? valueOf(job, "workType") : "",
      workModel: s.showWorkModel ? text(f.workModel) : "",
      href: `${s.detailsPage}/${path}`
    };
  }
  function readAddress(search, hash, defaultSort, groups = GROUP_IDS) {
    var _a, _b, _c, _d;
    const params = new URLSearchParams(search);
    const selected = {};
    for (const id of groups) {
      const values = params.getAll(id).map((v) => v.trim()).filter(Boolean);
      if (values.length) selected[id] = [...new Set(values)];
    }
    let keyword = (_a = params.get("keyword")) != null ? _a : "";
    if (!keyword && hash.length > 1) {
      try {
        const parsed = JSON.parse(decodeURIComponent(hash.slice(1)));
        if (parsed && typeof parsed.keyword === "string") keyword = parsed.keyword;
      } catch (e) {
      }
    }
    const sort = (_b = SORTS.find((x) => x === params.get("sort"))) != null ? _b : defaultSort;
    const page = Math.max(1, parseInt((_c = params.get("page")) != null ? _c : "1", 10) || 1);
    return { keyword: keyword.trim(), location: ((_d = params.get("location")) != null ? _d : "").trim(), selected, sort, page };
  }
  function writeAddress(search, state, defaultSort) {
    var _a;
    const params = new URLSearchParams(search);
    for (const k of ["keyword", "location", "sort", "page", ...GROUP_IDS]) params.delete(k);
    if (state.keyword) params.set("keyword", state.keyword);
    if (state.location) params.set("location", state.location);
    for (const id of GROUP_IDS) for (const v of (_a = state.selected[id]) != null ? _a : []) params.append(id, v);
    if (state.sort !== defaultSort) params.set("sort", state.sort);
    if (state.page > 1) params.set("page", String(state.page));
    const out = params.toString();
    return out ? `?${out}` : "";
  }
  function activeFilterCount(state) {
    return GROUP_IDS.reduce((n, id) => {
      var _a, _b;
      return n + ((_b = (_a = state.selected[id]) == null ? void 0 : _a.length) != null ? _b : 0);
    }, 0);
  }

  // widgets/job-board/drawer.ts
  var FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
  var locks = 0;
  var savedOverflow = "";
  var stack = [];
  function lockScroll() {
    if (locks === 0) {
      savedOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
    }
    locks += 1;
  }
  function unlockScroll() {
    if (locks === 0) return;
    locks -= 1;
    if (locks === 0) document.body.style.overflow = savedOverflow;
  }
  function inertOutside(side, keep) {
    const changed = [];
    for (let node = side; node && node !== document.body; node = node.parentElement) {
      const parent = node.parentElement;
      if (!parent) break;
      for (const sib of [...parent.children]) {
        if (sib === node || sib === keep || sib.hasAttribute("inert") || sib.tagName === "SCRIPT") continue;
        sib.setAttribute("inert", "");
        changed.push(sib);
      }
    }
    return changed;
  }
  function createDrawer(side, opener, backdrop, onGone) {
    let open = false;
    let inerted = [];
    let watcher = null;
    const token = {};
    const gone = () => {
      if (side.isConnected) return false;
      api.close(false);
      onGone == null ? void 0 : onGone();
      return true;
    };
    const focusables = () => [...side.querySelectorAll(FOCUSABLE)].filter((el) => !el.closest("[hidden]"));
    const onKey = (e) => {
      if (!open || gone()) return;
      if (e.key === "Escape") {
        if (e.defaultPrevented || stack[stack.length - 1] !== token) return;
        e.preventDefault();
        api.close(true);
        return;
      }
      if (e.key !== "Tab") return;
      const list = focusables();
      if (!list.length) return;
      const first = list[0];
      const last = list[list.length - 1];
      const active = document.activeElement;
      if (e.shiftKey && (active === first || !side.contains(active))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (active === last || !side.contains(active))) {
        e.preventDefault();
        first.focus();
      }
    };
    const api = {
      open() {
        var _a;
        if (open) return;
        open = true;
        side.classList.add("is-open");
        side.setAttribute("role", "dialog");
        side.setAttribute("aria-modal", "true");
        backdrop.hidden = false;
        opener.setAttribute("aria-expanded", "true");
        lockScroll();
        inerted = inertOutside(side, backdrop);
        stack.push(token);
        document.addEventListener("keydown", onKey, true);
        if (typeof MutationObserver === "function") {
          watcher = new MutationObserver(() => void gone());
          watcher.observe(document.body, { childList: true, subtree: true });
        }
        const target = (_a = side.querySelector(".shm-jb-close")) != null ? _a : focusables()[0];
        target == null ? void 0 : target.focus();
      },
      close(returnFocus) {
        if (!open) return;
        open = false;
        side.classList.remove("is-open");
        side.removeAttribute("role");
        side.removeAttribute("aria-modal");
        backdrop.hidden = true;
        opener.setAttribute("aria-expanded", "false");
        for (const el of inerted) el.removeAttribute("inert");
        inerted = [];
        unlockScroll();
        const at = stack.indexOf(token);
        if (at >= 0) stack.splice(at, 1);
        watcher == null ? void 0 : watcher.disconnect();
        watcher = null;
        document.removeEventListener("keydown", onKey, true);
        if (returnFocus && opener.isConnected) opener.focus();
      },
      isOpen: () => open,
      destroy() {
        api.close(false);
      }
    };
    return api;
  }

  // widgets/job-board/render.ts
  var ARROW = '<svg aria-hidden="true" focusable="false" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 12L12 4M6 4h6v6"></path></svg>';
  var SEARCH = '<svg aria-hidden="true" focusable="false" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="8.5" cy="8.5" r="6"></circle><path d="M13 13l5 5"></path></svg>';
  var CLOSE = '<svg aria-hidden="true" focusable="false" width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M3 3l12 12M15 3L3 15"></path></svg>';
  var FILTER = '<svg aria-hidden="true" focusable="false" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 4h12M4.5 8h7M7 12h2"></path></svg>';
  function shellHtml(id, s, state) {
    const search = s.showSearch ? `<form class="shm-jb-search" role="search"${s.searchOverlap ? ` style="margin-top:-${s.searchOverlap}px"` : ""}>` + (s.searchPrompt ? `<p class="shm-jb-prompt">${esc(s.searchPrompt)}</p>` : "") + `<div class="shm-jb-fields"><input class="shm-jb-input" type="search" name="keyword" autocomplete="off" placeholder="${esc(s.keywordPlaceholder)}" aria-label="${esc(s.keywordPlaceholder)}" value="${esc(state.keyword)}">` + (s.showLocationSearch ? `<input class="shm-jb-input" type="search" name="location" autocomplete="off" placeholder="${esc(s.locationPlaceholder)}" aria-label="${esc(s.locationPlaceholder)}" value="${esc(state.location)}">` : "") + `<button class="shm-jb-search-btn" type="submit" aria-label="${esc(s.searchButtonLabel)}">${SEARCH}</button></div></form>` : "";
    const side = s.showFilters ? `<button type="button" class="shm-jb-btn shm-jb-btn-primary shm-jb-open" aria-expanded="false" aria-controls="${id}-side">${FILTER}<span class="shm-jb-open-text">${esc(s.filtersButtonText)}</span><span class="shm-jb-open-count"></span></button><div class="shm-jb-backdrop" hidden></div><aside class="shm-jb-side" id="${id}-side" aria-labelledby="${id}-side-title"><div class="shm-jb-side-head"><h2 class="shm-jb-side-title" id="${id}-side-title">${esc(s.filtersTitle)}</h2><button type="button" class="shm-jb-close" aria-label="${esc(s.closeText)}">${CLOSE}</button></div><div class="shm-jb-facets"></div><div class="shm-jb-side-foot"><button type="button" class="shm-jb-btn shm-jb-btn-secondary shm-jb-clear">${esc(s.clearText)}</button><button type="button" class="shm-jb-btn shm-jb-btn-primary shm-jb-apply"></button></div></aside>` : "";
    const sort = s.showSort ? `<label class="shm-jb-sort"><span class="shm-jb-sort-label">${esc(s.sortLabel)}</span><select class="shm-jb-sort-select" name="sort">` + SORTS.map((k) => `<option value="${k}"${k === state.sort ? " selected" : ""}>${esc(s.sortNames[k])}</option>`).join("") + "</select></label>" : "";
    return search + `<div class="shm-jb-layout${s.showFilters ? "" : " is-wide"}">` + side + `<div class="shm-jb-results"><div class="shm-jb-head"><p class="shm-jb-count" role="status" aria-live="polite" tabindex="-1"></p>${sort}</div><div class="shm-jb-note" hidden></div><ul class="shm-jb-grid" role="list" aria-busy="true"></ul><div class="shm-jb-empty" hidden></div><nav class="shm-jb-pager" aria-label="${esc(s.pagerLabel)}" hidden></nav></div></div>`;
  }
  function facetsHtml(id, facets, s, view) {
    return facets.map((f) => {
      const isOpen = view.open.has(f.id);
      const isExpanded = view.expanded.has(f.id);
      const listId = `${id}-g-${f.id}`;
      const shown = isExpanded ? f.options : f.options.filter((o, i) => i < s.optionsShown || o.checked);
      const more = f.options.length > s.optionsShown ? `<button type="button" class="shm-jb-btn shm-jb-btn-secondary shm-jb-more" data-group="${f.id}" aria-expanded="${isExpanded}">${esc(isExpanded ? s.showLessText : s.showMoreText)}</button>` : "";
      const options = shown.map((o) => {
        const disabled = o.count === 0 && !o.checked;
        return `<li class="shm-jb-option${disabled ? " is-empty" : ""}"><label class="shm-jb-option-label"><input class="shm-jb-check" type="checkbox" data-group="${f.id}" value="${esc(o.value)}"${o.checked ? " checked" : ""}${disabled ? " disabled" : ""}><span class="shm-jb-option-name">${esc(o.value)}</span><span class="shm-jb-option-count" aria-hidden="true">${o.count}</span><span class="shm-jb-sr"> (${esc(countText(o.count, s))})</span></label></li>`;
      }).join("");
      return `<div class="shm-jb-group${isOpen ? " is-open" : ""}" data-group="${f.id}"><h3 class="shm-jb-group-head"><button type="button" class="shm-jb-toggle" aria-expanded="${isOpen}" aria-controls="${listId}"><span class="shm-jb-group-title">${esc(f.label)}</span><span class="shm-jb-sign" aria-hidden="true"></span></button></h3><div class="shm-jb-group-body" id="${listId}"${isOpen ? "" : " hidden"}><ul class="shm-jb-options" role="list" aria-label="${esc(f.label)}">${options}</ul>${more}</div></div>`;
    }).join("");
  }
  function cardHtml(c, s) {
    const tag = s.headingTag;
    const meta = [
      c.pay && `<span class="shm-jb-card-pay">${esc(c.pay)}</span>`,
      c.where && `<span class="shm-jb-card-where">${esc(c.where)}</span>`,
      c.workType && `<span class="shm-jb-card-type">${esc(c.workType)}</span>`,
      c.workModel && `<span class="shm-jb-card-model">${esc(c.workModel)}</span>`
    ].filter(Boolean).join("");
    return `<li class="shm-jb-item"><a class="shm-jb-card" href="${esc(c.href)}">` + (c.label ? `<span class="shm-jb-card-label">${esc(c.label)}</span>` : "") + `<${tag} class="shm-jb-card-title">${esc(c.title)}</${tag}>` + (meta ? `<span class="shm-jb-card-meta">${meta}</span>` : "") + `<span class="shm-jb-card-arrow" aria-hidden="true">${ARROW}</span></a></li>`;
  }
  function pagerHtml(current, total, shown, all, s) {
    if (s.paging === "loadmore") {
      return shown < all ? `<button type="button" class="shm-jb-btn shm-jb-btn-primary shm-jb-loadmore">${esc(s.loadMoreText)}</button>` : "";
    }
    if (total <= 1) return "";
    const nums = pageList(current, total).map(
      (n) => n === "\u2026" ? '<span class="shm-jb-gap" aria-hidden="true">\u2026</span>' : `<button type="button" class="shm-jb-page${n === current ? " is-current" : ""}" data-page="${n}" aria-label="${esc(fill(s.pageAriaText, n))}"${n === current ? ' aria-current="page"' : ""}>${n}</button>`
    ).join("");
    return `<button type="button" class="shm-jb-btn shm-jb-btn-secondary shm-jb-prev" data-page="${current - 1}"${current <= 1 ? " disabled" : ""}>${esc(s.prevText)}</button><span class="shm-jb-pages">${nums}</span><button type="button" class="shm-jb-btn shm-jb-btn-secondary shm-jb-next" data-page="${current + 1}"${current >= total ? " disabled" : ""}>${esc(s.nextText)}</button>`;
  }
  function errorHtml(s) {
    return `<p class="shm-jb-empty-title shm-jb-error" role="alert">${esc(s.loadErrorText)}</p><button type="button" class="shm-jb-btn shm-jb-btn-secondary shm-jb-retry">${esc(s.retryText)}</button>`;
  }
  function emptyHtml(s, hasJobs, hasFilters) {
    if (!hasJobs) return `<p class="shm-jb-empty-title">${esc(s.noJobsText)}</p>`;
    return `<p class="shm-jb-empty-title">${esc(s.emptyTitle)}</p><p class="shm-jb-empty-text">${esc(s.emptyText)}</p>` + (hasFilters ? `<button type="button" class="shm-jb-btn shm-jb-btn-secondary shm-jb-clear">${esc(s.clearText)}</button>` : "");
  }
  var countText = (n, s) => fill(n === 1 ? s.countOne : s.countMany, n);

  // widgets/job-board/index.ts
  var NAME = "job-board";
  var runs = /* @__PURE__ */ new WeakMap();
  var teardowns = /* @__PURE__ */ new WeakMap();
  var reads = /* @__PURE__ */ new WeakMap();
  var uid = 0;
  function release(element) {
    var _a;
    (_a = teardowns.get(element)) == null ? void 0 : _a();
    teardowns.delete(element);
  }
  var shownGroups = (s) => s.showFilters ? s.groups.map((g) => g.id) : [];
  function freshState(s, inEditor) {
    if (s.syncAddress && !inEditor) return readAddress(window.location.search, window.location.hash, s.defaultSort, shownGroups(s));
    return { keyword: "", location: "", selected: {}, sort: s.defaultSort, page: 1 };
  }
  function openGroups(s) {
    if (s.groupsOpen === "none") return /* @__PURE__ */ new Set();
    const ids = s.groups.map((g) => g.id);
    return new Set(s.groupsOpen === "first" ? ids.slice(0, 1) : ids);
  }
  function sourceNote(source, count, s) {
    if (source === "collection" && !count) return `Connected to the "${s.jobsCollection}" collection: it has no live jobs, so the board shows the no-jobs message.`;
    if (source === "collection") return `Connected to the "${s.jobsCollection}" collection: ${count} live jobs.`;
    const why = s.jobsCollection ? ` (the "${s.jobsCollection}" collection could not be read on this page)` : "";
    return `Showing ${count} live jobs from the site job feed${why}.`;
  }
  var q = (root, sel) => root.querySelector(sel);
  function mountBoard(stage, { jobs, source, retry }, s, inEditor, id) {
    var _a;
    let state = freshState(s, inEditor);
    const view = { open: openGroups(s), expanded: /* @__PURE__ */ new Set() };
    stage.innerHTML = shellHtml(id, s, state);
    const grid = q(stage, ".shm-jb-grid");
    const count = q(stage, ".shm-jb-count");
    const empty = q(stage, ".shm-jb-empty");
    const pager = q(stage, ".shm-jb-pager");
    const results = q(stage, ".shm-jb-results");
    const facetsBox = q(stage, ".shm-jb-facets");
    const side = q(stage, ".shm-jb-side");
    const opener = q(stage, ".shm-jb-open");
    const backdrop = q(stage, ".shm-jb-backdrop");
    const apply = q(stage, ".shm-jb-apply");
    const note = q(stage, ".shm-jb-note");
    const drawer = side && opener && backdrop ? createDrawer(side, opener, backdrop, () => teardown()) : null;
    if (inEditor) {
      note.hidden = false;
      note.textContent = sourceNote(source, jobs.length, s);
    }
    let facets = [];
    const renderFacets = () => {
      if (!facetsBox) return;
      facetsBox.innerHTML = facetsHtml(id, facets, s, view);
    };
    const render = () => {
      const result = searchBoard(jobs, state, s.groups);
      facets = result.facets;
      const matched = sortJobs(result.matched, state.sort);
      const pages = pageCount(matched.length, s.pageSize);
      state = { ...state, page: Math.min(state.page, pages) };
      const shown = visibleJobs(matched, state, s);
      grid.innerHTML = shown.map((j) => cardHtml(toCard(j, s), s)).join("");
      grid.setAttribute("aria-busy", "false");
      grid.hidden = shown.length === 0;
      count.textContent = countText(matched.length, s);
      const filtered = activeFilterCount(state) > 0 || !!state.keyword || !!state.location;
      empty.hidden = shown.length > 0;
      empty.innerHTML = shown.length ? "" : retry ? errorHtml(s) : emptyHtml(s, jobs.length > 0, filtered);
      const pagerMarkup = pagerHtml(state.page, pages, shown.length, matched.length, s);
      pager.innerHTML = pagerMarkup;
      pager.hidden = !pagerMarkup;
      if (apply) apply.textContent = fill(s.applyText, matched.length);
      const n = activeFilterCount(state);
      const badge = opener && q(opener, ".shm-jb-open-count");
      if (badge) badge.textContent = n ? `(${n})` : "";
      renderFacets();
    };
    const commit = (mode) => {
      render();
      if (!s.syncAddress || inEditor) return;
      const { pathname, search } = window.location;
      const url = `${pathname}${writeAddress(search, state, s.defaultSort)}`;
      if (url === `${pathname}${search}`) return;
      if (mode === "push") window.history.pushState({ shmJobBoard: true }, "", url);
      else window.history.replaceState(window.history.state, "", url);
    };
    const syncInputs = () => {
      const kw = q(stage, "[name=keyword]");
      const loc = q(stage, "[name=location]");
      const sort = q(stage, "[name=sort]");
      if (kw) kw.value = state.keyword;
      if (loc) loc.value = state.location;
      if (sort) sort.value = state.sort;
    };
    const toResults = () => {
      var _a2;
      if (results.getBoundingClientRect().top >= 0) return;
      const reduce = typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      (_a2 = results.scrollIntoView) == null ? void 0 : _a2.call(results, { block: "start", behavior: reduce ? "auto" : "smooth" });
    };
    const focusIn = (sel, match) => {
      var _a2;
      const list = [...stage.querySelectorAll(sel)];
      (_a2 = match ? list.find(match) : list[0]) == null ? void 0 : _a2.focus();
    };
    const onSubmit = (e) => {
      e.preventDefault();
      const form = e.target;
      const val = (name) => {
        var _a2, _b;
        return ((_b = (_a2 = form.querySelector(`[name=${name}]`)) == null ? void 0 : _a2.value) != null ? _b : "").trim();
      };
      state = { ...state, keyword: val("keyword"), location: val("location"), page: 1 };
      commit("push");
    };
    const onChange = (e) => {
      var _a2, _b;
      const el = e.target;
      if (el.matches(".shm-jb-check")) {
        const box = el;
        const group = box.dataset.group;
        const now = (_a2 = state.selected[group]) != null ? _a2 : [];
        const next = box.checked ? [...now, box.value] : now.filter((v) => fold(v) !== fold(box.value));
        state = { ...state, selected: { ...state.selected, [group]: next }, page: 1 };
        commit("replace");
        focusIn(`.shm-jb-check[data-group="${group}"]`, (c) => c.value === box.value);
      } else if (el.matches("[name=sort]")) {
        const value = el.value;
        state = { ...state, sort: (_b = SORTS.find((x) => x === value)) != null ? _b : s.defaultSort, page: 1 };
        commit("replace");
      }
    };
    const onClick = (e) => {
      var _a2, _b, _c, _d;
      const el = e.target.closest("button, .shm-jb-backdrop");
      if (!el || !stage.contains(el)) return;
      if (el.matches(".shm-jb-toggle")) {
        const group = el.closest(".shm-jb-group").dataset.group;
        if (view.open.has(group)) view.open.delete(group);
        else view.open.add(group);
        renderFacets();
        focusIn(`.shm-jb-group[data-group="${group}"] .shm-jb-toggle`);
      } else if (el.matches(".shm-jb-more")) {
        const group = el.dataset.group;
        if (view.expanded.has(group)) view.expanded.delete(group);
        else view.expanded.add(group);
        renderFacets();
        focusIn(`.shm-jb-more[data-group="${group}"]`);
      } else if (el.matches(".shm-jb-retry")) {
        retry == null ? void 0 : retry();
      } else if (el.matches(".shm-jb-clear")) {
        const fromEmpty = !!el.closest(".shm-jb-empty");
        state = { ...state, keyword: "", location: "", selected: {}, page: 1 };
        syncInputs();
        commit("push");
        if (fromEmpty) ((_a2 = q(stage, "[name=keyword]")) != null ? _a2 : count).focus();
      } else if (el.matches(".shm-jb-page, .shm-jb-prev, .shm-jb-next")) {
        const page = parseInt((_b = el.dataset.page) != null ? _b : "", 10);
        if (!page) return;
        state = { ...state, page };
        commit("push");
        toResults();
        focusIn(".shm-jb-page.is-current");
      } else if (el.matches(".shm-jb-loadmore")) {
        const before = grid.children.length;
        state = { ...state, page: state.page + 1 };
        commit("replace");
        (_d = (_c = grid.children[before]) == null ? void 0 : _c.querySelector("a")) == null ? void 0 : _d.focus();
      } else if (el.matches(".shm-jb-open")) {
        drawer == null ? void 0 : drawer.open();
      } else if (el.matches(".shm-jb-close, .shm-jb-apply, .shm-jb-backdrop")) {
        drawer == null ? void 0 : drawer.close(true);
        if (el.matches(".shm-jb-apply")) toResults();
      }
    };
    const onPop = () => {
      if (!stage.isConnected) {
        teardown();
        return;
      }
      state = freshState(s, inEditor);
      syncInputs();
      commit("replace");
    };
    const wide = typeof window.matchMedia === "function" ? window.matchMedia("(min-width: 1024px)") : null;
    const onWide = () => {
      if (wide == null ? void 0 : wide.matches) drawer == null ? void 0 : drawer.close(false);
    };
    stage.addEventListener("submit", onSubmit);
    stage.addEventListener("change", onChange);
    stage.addEventListener("click", onClick);
    if (s.syncAddress && !inEditor) window.addEventListener("popstate", onPop);
    (_a = wide == null ? void 0 : wide.addEventListener) == null ? void 0 : _a.call(wide, "change", onWide);
    render();
    function teardown() {
      var _a2;
      drawer == null ? void 0 : drawer.destroy();
      stage.removeEventListener("submit", onSubmit);
      stage.removeEventListener("change", onChange);
      stage.removeEventListener("click", onClick);
      window.removeEventListener("popstate", onPop);
      (_a2 = wide == null ? void 0 : wide.removeEventListener) == null ? void 0 : _a2.call(wide, "change", onWide);
    }
    return teardown;
  }
  function ensureRoot(element) {
    let root = element.querySelector(".shm-jb");
    if (!root) {
      root = document.createElement("div");
      root.className = "shm-jb";
      element.appendChild(root);
    }
    let stage = root.querySelector(".shm-jb-stage");
    if (!stage) {
      stage = document.createElement("div");
      stage.className = "shm-jb-stage";
      root.appendChild(stage);
    }
    return { root, stage };
  }
  async function jobBoard(ctx) {
    var _a, _b, _c, _d;
    const element = ctx == null ? void 0 : ctx.element;
    if (!element || typeof element.querySelector !== "function") return;
    const data = (_a = ctx.data) != null ? _a : {};
    const inEditor = !!data.inEditor;
    const s = readSettings((_b = data.config) != null ? _b : {});
    const { root, stage } = ensureRoot(element);
    const run = ((_c = runs.get(element)) != null ? _c : 0) + 1;
    runs.set(element, run);
    const id = `shm-jb-${uid += 1}`;
    const earlier = reads.get(element);
    if (earlier) earlier.aborted = true;
    const read = { aborted: false };
    reads.set(element, read);
    try {
      const { jobs, source } = await loadJobsFrom(s.jobsCollection, ctx.shazamme, data, inEditor, void 0, read);
      if (runs.get(element) !== run) return;
      release(element);
      teardowns.set(element, mountBoard(stage, { jobs, source }, s, inEditor, id));
    } catch (err) {
      if (runs.get(element) !== run) return;
      console.error(`[${NAME}] could not load jobs`, {
        collection: s.jobsCollection || "(none, job feed only)",
        siteId: (_d = data.siteId) != null ? _d : null,
        inEditor,
        hasSdk: !!ctx.shazamme,
        page: typeof window !== "undefined" ? window.location.pathname : ""
      }, err);
      release(element);
      teardowns.set(element, mountBoard(stage, { jobs: [], source: "feed", retry: () => void jobBoard(ctx) }, s, inEditor, id));
      if (inEditor) {
        const note = stage.querySelector(".shm-jb-note");
        if (note) note.textContent = `Job Board could not read any jobs: ${err instanceof Error ? err.message : String(err)}`;
      }
    } finally {
      if (runs.get(element) === run) root.classList.add("is-ready");
    }
  }
  return __toCommonJS(index_exports);
})();
(function(){
  var reg = (typeof window !== 'undefined' && window.__shazWidgetExport) || {};
  var controller = reg.default || reg;
  if (typeof window !== 'undefined') {
    window.ShazammeWidget = window.ShazammeWidget || {};
    window.ShazammeWidget["job-board"] = controller;
    window.__shazWidgetExport = void 0;
  }
})();

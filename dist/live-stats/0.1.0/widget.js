/* shazamme-widgets — shazamme-widgets v0.1.0
 * Build 485927dc13da. Registers window.ShazammeWidget["<name>"].
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

  // widgets/live-stats/index.ts
  var index_exports = {};
  __export(index_exports, {
    countsFromJobs: () => countsFromJobs,
    default: () => liveStats,
    normaliseTiles: () => normaliseTiles,
    numberFor: () => numberFor
  });

  // core/site-jobs.ts
  var SDK_READY_TIMEOUT_MS = 1200;
  var CONSULTANTS_COLLECTION = "Consultants";
  var CONSULTANTS_ACTION = "Get Consultants";
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
  async function loadVisibleConsultantCount(shazamme, data) {
    const sdk = getSdk(shazamme);
    if (!sdk) throw new Error("The Shazamme SDK did not load.");
    await ensureSdkReady(sdk, data);
    const raw = await sdk.fetch({ name: CONSULTANTS_COLLECTION, action: CONSULTANTS_ACTION, useCache: true });
    const list = Array.isArray(raw) ? raw : raw == null ? void 0 : raw.values;
    if (!Array.isArray(list)) return 0;
    return list.filter((i) => {
      var _a;
      const f = (_a = i == null ? void 0 : i.data) != null ? _a : i;
      return !!f && f.isVisible !== false;
    }).length;
  }
  function distinct(jobs, field) {
    const seen = /* @__PURE__ */ new Set();
    for (const j of jobs) {
      const v = text(j.fields[field]);
      if (v) seen.add(v);
    }
    return [...seen];
  }

  // widgets/live-stats/index.ts
  var SOURCES = ["jobs", "industries", "countries", "consultants", "custom"];
  var STYLES = ["dark", "accent"];
  var MAX_TILES = 12;
  var TILE_FIELDS = ["source", "value", "suffix", "label", "text", "size", "style", "linkText", "linkUrl"];
  var EDITOR_NOTE = "Live Stats: add at least one tile in the Content editor. A live number only appears once the site has jobs (or consultants) to count.";
  var runs = /* @__PURE__ */ new WeakMap();
  var numberFormat = new Intl.NumberFormat("en");
  function listFromSetting(v) {
    if (Array.isArray(v)) return v;
    if (typeof v === "string" && v.trim().startsWith("[")) {
      try {
        const parsed = JSON.parse(v);
        return Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        return [];
      }
    }
    return [];
  }
  function tilesFromDom(root) {
    return [...root.querySelectorAll(".shm-ls-src")].map((src) => {
      var _a, _b;
      const item = {};
      for (const f of TILE_FIELDS) item[f] = (_b = (_a = src.querySelector(`[data-f="${f}"]`)) == null ? void 0 : _a.textContent) != null ? _b : "";
      return item;
    });
  }
  function normaliseTiles(list) {
    const tiles = [];
    for (const item of list) {
      if (tiles.length >= MAX_TILES) break;
      const raw = item && typeof item === "object" ? item : {};
      const tile = {
        source: pick(raw.source, SOURCES, "custom"),
        value: text(raw.value),
        suffix: text(raw.suffix),
        label: text(raw.label),
        text: text(raw.text),
        wide: clampInt(raw.size, 1, 1, 2) === 2,
        style: pick(raw.style, STYLES, "dark"),
        linkText: text(raw.linkText),
        linkUrl: safeUrl(raw.linkUrl)
      };
      if (tile.source !== "custom" || tile.value || tile.label || tile.text) tiles.push(tile);
    }
    return tiles;
  }
  function countsFromJobs(jobs) {
    return {
      jobs: jobs.length,
      industries: distinct(jobs, "category").length,
      countries: distinct(jobs, "country").length
    };
  }
  function numberFor(tile, counts) {
    if (tile.source === "custom") return tile.value;
    const n = counts[tile.source];
    return n && n > 0 ? numberFormat.format(n) : null;
  }
  function tileHtml(tile, number) {
    const eyebrow = tile.style === "dark" && tile.wide && !!tile.label;
    const label = tile.label ? `<div class="shm-ls-label">${esc(tile.label)}</div>` : "";
    const suffix = tile.suffix ? `<span class="shm-ls-suffix">${esc(tile.suffix)}</span>` : "";
    const value = number || suffix ? `<div class="shm-ls-number">${esc(number)}${suffix}</div>` : "";
    const line = tile.text ? `<p class="shm-ls-text">${esc(tile.text)}</p>` : "";
    const link = tile.linkText && tile.linkUrl ? `<a class="shm-ls-link shm-btn" href="${esc(tile.linkUrl)}">${esc(tile.linkText)}</a>` : "";
    const main = `<div class="shm-ls-main">${value}${eyebrow ? "" : label}${line}</div>`;
    const classes = ["shm-ls-tile", tile.style === "accent" ? "is-accent" : "is-dark", tile.wide ? "is-wide" : ""].filter(Boolean).join(" ");
    return `<li class="${classes}">${eyebrow ? label : ""}${main}${link}</li>`;
  }
  async function liveCounts(ctx, tiles, inEditor) {
    const counts = { jobs: null, industries: null, countries: null, consultants: null };
    const needsJobs = tiles.some((t) => t.source === "jobs" || t.source === "industries" || t.source === "countries");
    const needsConsultants = tiles.some((t) => t.source === "consultants");
    const [jobs, consultants] = await Promise.all([
      needsJobs ? loadSiteJobs(ctx.shazamme, ctx.data, inEditor).catch((e) => {
        console.error("[live-stats] jobs", e);
        return null;
      }) : null,
      needsConsultants ? loadVisibleConsultantCount(ctx.shazamme, ctx.data).catch((e) => {
        console.error("[live-stats] consultants", e);
        return null;
      }) : null
    ]);
    return { ...counts, ...jobs ? countsFromJobs(jobs) : {}, consultants };
  }
  async function liveStats(ctx) {
    var _a, _b;
    const { element, data } = ctx;
    const root = element.querySelector(".shm-ls");
    const grid = root == null ? void 0 : root.querySelector(".shm-ls-grid");
    if (!root || !grid) return;
    const inEditor = !!(data == null ? void 0 : data.inEditor);
    const run = ((_a = runs.get(element)) != null ? _a : 0) + 1;
    runs.set(element, run);
    const config = (_b = data == null ? void 0 : data.config) != null ? _b : {};
    let tiles = normaliseTiles(listFromSetting(config.tiles));
    if (!tiles.length) tiles = normaliseTiles(tilesFromDom(root));
    const counts = await liveCounts(ctx, tiles, inEditor);
    if (runs.get(element) !== run) return;
    const html = tiles.map((t) => ({ t, n: numberFor(t, counts) })).filter((x) => x.n !== null).map((x) => tileHtml(x.t, x.n)).join("");
    grid.innerHTML = html || (inEditor ? `<li class="shm-ls-empty">${esc(EDITOR_NOTE)}</li>` : "");
    root.classList.toggle("is-empty", !html);
    root.classList.add("is-ready");
  }
  return __toCommonJS(index_exports);
})();
(function(){
  var reg = (typeof window !== 'undefined' && window.__shazWidgetExport) || {};
  var controller = reg.default || reg;
  if (typeof window !== 'undefined') {
    window.ShazammeWidget = window.ShazammeWidget || {};
    window.ShazammeWidget["live-stats"] = controller;
    window.__shazWidgetExport = void 0;
  }
})();

/* shazamme-widgets — shazamme-widgets v0.1.0
 * Build e8c97f05a478. Registers window.ShazammeWidget["<name>"].
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

  // widgets/keyword-ticker/index.ts
  var index_exports = {};
  __export(index_exports, {
    default: () => keywordTicker,
    professionsFrom: () => professionsFrom,
    readSettings: () => readSettings
  });

  // core/site-jobs.ts
  var SDK_READY_TIMEOUT_MS = 1200;
  function text(v) {
    if (typeof v === "string") return v.trim();
    if (typeof v === "number" && Number.isFinite(v)) return String(v);
    return "";
  }
  function esc(v) {
    return String(v != null ? v : "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
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

  // widgets/keyword-ticker/index.ts
  var SOURCES = ["words", "professions"];
  var DIRECTIONS = ["rtl", "ltr"];
  var DEFAULT_SPEED_SECONDS = 40;
  var DEFAULT_MAX_WORDS = 12;
  var MAX_WORDS_CAP = 60;
  var MAX_REPEATS = 8;
  var EDITOR_NOTE_WORDS = "Keyword Ticker: add some words (one per line) in the Content editor.";
  var EDITOR_NOTE_PROFESSIONS = "Keyword Ticker: this site has no live jobs yet, so there are no professions to show. Switch the source to typed words or add jobs.";
  var runs = /* @__PURE__ */ new WeakMap();
  function readSettings(config) {
    const words = text(config.words).split(/\r?\n/).map((w) => w.trim()).filter(Boolean);
    return {
      source: pick(config.source, SOURCES, "words"),
      words,
      maxWords: clampInt(config.maxWords, DEFAULT_MAX_WORDS, 1, MAX_WORDS_CAP),
      speed: clampInt(config.speed, DEFAULT_SPEED_SECONDS, 5, 300),
      direction: pick(config.direction, DIRECTIONS, "rtl"),
      pauseOnHover: flag(config.pauseOnHover, true),
      showSeparator: flag(config.showSeparator, true)
    };
  }
  function professionsFrom(jobs, limit) {
    var _a;
    const counts = /* @__PURE__ */ new Map();
    for (const j of jobs) {
      const name = text(j.fields.category);
      if (name) counts.set(name, ((_a = counts.get(name)) != null ? _a : 0) + 1);
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, limit).map(([name]) => name);
  }
  function groupHtml(words, separator) {
    const items = words.map((w) => `<span class="shm-kt-item"><span class="shm-kt-word">${esc(w)}</span>${separator ? '<span class="shm-kt-dot"></span>' : ""}</span>`).join("");
    return `<span class="shm-kt-group">${items}</span>`;
  }
  function staticHtml(words, separator) {
    const items = words.map((w) => `<li class="shm-kt-static-item"><span class="shm-kt-word">${esc(w)}</span>${separator ? '<span class="shm-kt-dot" aria-hidden="true"></span>' : ""}</li>`).join("");
    return `<ul class="shm-kt-static">${items}</ul>`;
  }
  function fillTrack(root, words, separator) {
    const track = root.querySelector(".shm-kt-track");
    const viewport = root.querySelector(".shm-kt-viewport");
    if (!track || !viewport) return;
    const copyWidth = () => {
      var _a, _b;
      return (_b = (_a = track.querySelector(".shm-kt-group")) == null ? void 0 : _a.offsetWidth) != null ? _b : 0;
    };
    let repeats = 1;
    do {
      const one = Array.from({ length: repeats }, () => words).flat();
      track.innerHTML = groupHtml(one, separator) + groupHtml(one, separator);
      repeats += 1;
    } while (copyWidth() > 0 && copyWidth() < viewport.offsetWidth && repeats <= MAX_REPEATS);
  }
  function render(root, words, s, stillCurrent) {
    var _a;
    root.classList.remove("is-empty");
    root.classList.toggle("is-rtl", s.direction === "rtl");
    root.classList.toggle("is-ltr", s.direction === "ltr");
    root.classList.toggle("is-pausable", s.pauseOnHover);
    root.style.setProperty("--shm-kt-duration", `${s.speed}s`);
    root.innerHTML = `<div class="shm-kt-viewport" aria-hidden="true"><div class="shm-kt-track"></div></div>${staticHtml(words, s.showSeparator)}`;
    fillTrack(root, words, s.showSeparator);
    root.classList.add("is-ready");
    void ((_a = document.fonts) == null ? void 0 : _a.ready.then(() => {
      if (root.isConnected && root.classList.contains("is-ready") && !root.classList.contains("is-empty") && stillCurrent()) fillTrack(root, words, s.showSeparator);
    }));
  }
  function showNote(root, inEditor, note) {
    root.classList.add("is-empty", "is-ready");
    root.innerHTML = inEditor ? `<p class="shm-kt-empty">${esc(note)}</p>` : "";
  }
  async function keywordTicker(ctx) {
    var _a, _b;
    const { element, data } = ctx;
    const root = element.querySelector(".shm-kt");
    if (!root) return;
    const inEditor = !!(data == null ? void 0 : data.inEditor);
    const s = readSettings((_a = data == null ? void 0 : data.config) != null ? _a : {});
    const run = ((_b = runs.get(element)) != null ? _b : 0) + 1;
    runs.set(element, run);
    if (s.source === "words") {
      if (!s.words.length) return showNote(root, inEditor, EDITOR_NOTE_WORDS);
      return render(root, s.words, s, () => runs.get(element) === run);
    }
    try {
      const jobs = await loadSiteJobs(ctx.shazamme, data, inEditor);
      if (runs.get(element) !== run) return;
      const words = professionsFrom(jobs, s.maxWords);
      if (!words.length) return showNote(root, inEditor, EDITOR_NOTE_PROFESSIONS);
      render(root, words, s, () => runs.get(element) === run);
    } catch (err) {
      if (runs.get(element) !== run) return;
      console.error("[keyword-ticker]", err);
      showNote(root, inEditor, EDITOR_NOTE_PROFESSIONS);
    }
  }
  return __toCommonJS(index_exports);
})();
(function(){
  var reg = (typeof window !== 'undefined' && window.__shazWidgetExport) || {};
  var controller = reg.default || reg;
  if (typeof window !== 'undefined') {
    window.ShazammeWidget = window.ShazammeWidget || {};
    window.ShazammeWidget["keyword-ticker"] = controller;
    window.__shazWidgetExport = void 0;
  }
})();

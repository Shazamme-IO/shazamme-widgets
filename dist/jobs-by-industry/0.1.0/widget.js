/* shazamme-widgets — shazamme-widgets v0.1.0
 * Build d18cadaceb14. Registers window.ShazammeWidget["<name>"].
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
      for (let key2 of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key2) && key2 !== except)
          __defProp(to, key2, { get: () => from[key2], enumerable: !(desc = __getOwnPropDesc(from, key2)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // widgets/jobs-by-industry/index.ts
  var index_exports = {};
  __export(index_exports, {
    buildIndustries: () => buildIndustries,
    default: () => jobsByIndustry,
    payFor: () => payFor,
    readSettings: () => readSettings,
    whereFor: () => whereFor
  });

  // core/salary.ts
  var SYMBOLS = { AUD: "$", USD: "$", NZD: "$", CAD: "$", SGD: "$", HKD: "$", GBP: "\xA3", EUR: "\u20AC", INR: "\u20B9", JPY: "\xA5", ZAR: "R" };
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
  function symbolFor(f) {
    const code = (str(f.currencyCode) || str(f.salaryCurrency) || str(f.currency)).toUpperCase();
    if (SYMBOLS[code]) return SYMBOLS[code];
    const given = str(f.currencySymbol);
    if (given && !/^[A-Za-z]{3}$/.test(given)) return given;
    if (/^[A-Z]{3}$/.test(code)) return `${code} `;
    return "";
  }
  function money(n, symbol) {
    const cents = Math.round(n * 100) % 100 !== 0;
    const digits = cents ? 2 : 0;
    return `${symbol}${n.toLocaleString("en-AU", { minimumFractionDigits: digits, maximumFractionDigits: digits })}`;
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
  function payLine(row) {
    if (!row || typeof row !== "object" || isHidden(row)) return "";
    const wording = str(row.salaryText);
    const range = salaryRange(row);
    if (!range) return wording && !SUFFIX_RE.test(wording) ? wording : "";
    if (!wording) {
      const unit = UNIT[str(row.salaryType).toLowerCase()];
      return unit ? `${range} ${unit}` : range;
    }
    const { from, to } = ends(row);
    if (figuresIn(wording).some((n) => n === from || n === to)) return wording;
    return `${range} ${wording}`;
  }

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
  function listOf(v) {
    if (!Array.isArray(v)) return [];
    return v.filter((i) => !!i && typeof i === "object");
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
    const key2 = String((_a = site == null ? void 0 : site.siteID) != null ? _a : "");
    if (!key2) throw new Error("The site id could not be read.");
    const win = window;
    const cache = win.__shmSiteJobs = (_b = win.__shmSiteJobs) != null ? _b : /* @__PURE__ */ new Map();
    const hit = cache.get(key2);
    if (hit && !inEditor) return hit;
    const desc = { name: "Jobs", action: "Get Jobs", useCache: !inEditor, path: `/job-results/${key2}`, isExternal: true };
    const pending = Promise.resolve(sdk.fetch(desc)).then(toRows);
    if (!inEditor) {
      cache.set(key2, pending);
      pending.catch(() => cache.delete(key2));
    }
    return pending;
  }

  // widgets/jobs-by-industry/index.ts
  var LOCATION_FORMATS = ["city-state", "city-country", "city-state-country"];
  var HEADING_TAGS = ["h2", "h3", "h4", "h5", "p"];
  var DEFAULT_DETAILS_PAGE = "/job-details";
  var DEFAULT_SEE_ALL_URL = "/job-results";
  var DEFAULT_SEE_ALL_TEXT = "See all {count} roles";
  var DEFAULT_COUNT_ONE = "{n} live role";
  var DEFAULT_COUNT_MANY = "{n} live roles";
  var MAX_PROFESSIONS_CAP = 30;
  var MAX_JOBS_CAP = 12;
  var EDITOR_NOTE = "Jobs by Industry: this site has no live jobs yet, so there are no industries to show.";
  var ARROW_SVG = '<svg aria-hidden="true" focusable="false" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 12L12 4M6 4h6v6"></path></svg>';
  var runs = /* @__PURE__ */ new WeakMap();
  var teardowns = /* @__PURE__ */ new WeakMap();
  function release(element) {
    var _a;
    (_a = teardowns.get(element)) == null ? void 0 : _a();
    teardowns.delete(element);
  }
  var uid = 0;
  function safeDecode(seg) {
    try {
      return decodeURIComponent(seg);
    } catch (e) {
      return seg;
    }
  }
  var key = (name) => name.trim().toLowerCase();
  var fill = (template, token, value) => template.split(token).join(String(value));
  var INDUSTRY_FIELDS = ["name", "blurb", "image"];
  function industriesFromDom(root) {
    return [...root.querySelectorAll(".shm-jbi-src")].map((src) => {
      var _a, _b;
      const item = {};
      for (const f of INDUSTRY_FIELDS) item[f] = (_b = (_a = src.querySelector(`[data-f="${f}"]`)) == null ? void 0 : _a.textContent) != null ? _b : "";
      return item;
    });
  }
  function readSettings(config, root) {
    const profiles = /* @__PURE__ */ new Map();
    const configured = listOf(config.industries);
    for (const item of configured.length || !root ? configured : industriesFromDom(root)) {
      const name = text(item.name);
      if (name) profiles.set(key(name), { blurb: text(item.blurb), image: safeUrl(item.image) });
    }
    const label = (v, fallback) => text(v) || fallback;
    return {
      maxProfessions: clampInt(config.maxProfessions, 6, 1, MAX_PROFESSIONS_CAP),
      maxJobs: clampInt(config.maxJobs, 4, 1, MAX_JOBS_CAP),
      detailsPage: (safeUrl(config.detailsPage) || DEFAULT_DETAILS_PAGE).replace(/\/+$/, ""),
      showSeeAll: flag(config.showSeeAll, true),
      seeAllText: label(config.seeAllText, DEFAULT_SEE_ALL_TEXT),
      seeAllUrl: safeUrl(config.seeAllUrl) || DEFAULT_SEE_ALL_URL,
      countOne: label(config.countOne, DEFAULT_COUNT_ONE),
      countMany: label(config.countMany, DEFAULT_COUNT_MANY),
      locationFormat: pick(config.locationFormat, LOCATION_FORMATS, "city-state"),
      showSalary: flag(config.showSalary, true),
      ariaLabel: label(config.ariaLabel, "Industries"),
      headingTag: pick(config.headingTag, HEADING_TAGS, "h3"),
      defaultImage: safeUrl(config.defaultImage),
      profiles
    };
  }
  var payFor = (f) => payLine(f);
  function whereFor(f, format) {
    const parts = [text(f.city)];
    if (format !== "city-country") parts.push(text(f.state));
    if (format !== "city-state") parts.push(text(f.country));
    return parts.filter(Boolean).join(", ");
  }
  function newestFirst(a, b) {
    const when = (j) => Date.parse(text(j.fields.addedOnUTC) || text(j.fields.changedOnUTC) || "") || 0;
    return when(b) - when(a);
  }
  function buildIndustries(jobs, s) {
    const groups = /* @__PURE__ */ new Map();
    for (const j of jobs) {
      const name = text(j.fields.category);
      if (!name || !j.pageItemUrl) continue;
      const list = groups.get(name);
      if (list) list.push(j);
      else groups.set(name, [j]);
    }
    return [...groups.entries()].sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0])).slice(0, s.maxProfessions).map(([name, list]) => {
      var _a;
      const profile = s.profiles.get(key(name));
      const cards = [...list].sort(newestFirst).slice(0, s.maxJobs).map((j) => ({
        title: text(j.fields.jobName),
        where: whereFor(j.fields, s.locationFormat),
        workType: text(j.fields.workType),
        workModel: text(j.fields.workModel),
        pay: s.showSalary ? payFor(j.fields) : "",
        href: `${s.detailsPage}/${j.pageItemUrl.split("/").map((seg) => encodeURIComponent(safeDecode(seg))).join("/")}`
      }));
      return { name, count: list.length, blurb: (_a = profile == null ? void 0 : profile.blurb) != null ? _a : "", image: (profile == null ? void 0 : profile.image) || s.defaultImage, cards };
    });
  }
  function cardHtml(c) {
    const chips = [c.workType && `<span class="shm-jbi-tag is-type">${esc(c.workType)}</span>`, c.workModel && `<span class="shm-jbi-tag is-model">${esc(c.workModel)}</span>`].filter(Boolean).join("");
    return `<a class="shm-jbi-card" href="${esc(c.href)}"><span class="shm-jbi-card-title">${esc(c.title)}</span>` + (c.where ? `<span class="shm-jbi-card-where">${esc(c.where)}</span>` : "") + (chips ? `<span class="shm-jbi-tags">${chips}</span>` : "") + (c.pay ? `<span class="shm-jbi-card-pay">${esc(c.pay)}</span>` : "") + "</a>";
  }
  function panelHtml(i, s) {
    const tag = s.headingTag;
    return (i.image ? `<img class="shm-jbi-bg" src="${esc(i.image)}" alt="" loading="lazy" decoding="async">` : "") + `<div class="shm-jbi-panel-body"><${tag} class="shm-jbi-title">${esc(i.name)}</${tag}>` + (i.blurb ? `<p class="shm-jbi-blurb">${esc(i.blurb)}</p>` : "") + `<div class="shm-jbi-cards">${i.cards.map(cardHtml).join("")}</div></div>`;
  }
  function countLabel(n, s) {
    return fill(n === 1 ? s.countOne : s.countMany, "{n}", n);
  }
  function tabHtml(i, index, id, s) {
    return `<button type="button" role="tab" class="shm-jbi-tab" id="${id}-tab-${index}" aria-selected="false" aria-controls="${id}-panel" tabindex="-1"><span class="shm-jbi-tab-text"><span class="shm-jbi-tab-name">${esc(i.name)}</span><span class="shm-jbi-tab-count">${esc(countLabel(i.count, s))}</span></span>${ARROW_SVG}</button>`;
  }
  function mountBoard(stage, industries, total, s) {
    const id = `shm-jbi-${uid += 1}`;
    const seeAll = s.showSeeAll ? `<div class="shm-jbi-top"><a class="shm-jbi-all shm-btn" href="${esc(s.seeAllUrl)}">${esc(fill(s.seeAllText, "{count}", total))}</a></div>` : "";
    stage.innerHTML = seeAll + `<div class="shm-jbi-board"><div class="shm-jbi-tabs" role="tablist" aria-label="${esc(s.ariaLabel)}">${industries.map((i, n) => tabHtml(i, n, id, s)).join("")}</div><div class="shm-jbi-panel" role="tabpanel" id="${id}-panel"></div></div>`;
    const tabs = [...stage.querySelectorAll(".shm-jbi-tab")];
    const panel = stage.querySelector(".shm-jbi-panel");
    const select = (index, focus) => {
      tabs.forEach((tab, n) => {
        const on = n === index;
        tab.setAttribute("aria-selected", on ? "true" : "false");
        tab.tabIndex = on ? 0 : -1;
        tab.classList.toggle("is-active", on);
      });
      panel.setAttribute("aria-labelledby", tabs[index].id);
      panel.innerHTML = panelHtml(industries[index], s);
      if (focus) {
        tabs[index].focus();
        if (typeof tabs[index].scrollIntoView === "function") tabs[index].scrollIntoView({ block: "nearest", inline: "nearest" });
      }
    };
    const onClick = (e) => {
      const tab = e.target.closest(".shm-jbi-tab");
      if (tab && tabs.includes(tab)) select(tabs.indexOf(tab), false);
    };
    const onKey = (e) => {
      const current = tabs.indexOf(e.target.closest(".shm-jbi-tab"));
      if (current < 0) return;
      const last = tabs.length - 1;
      const moves = {
        ArrowDown: current === last ? 0 : current + 1,
        ArrowRight: current === last ? 0 : current + 1,
        ArrowUp: current === 0 ? last : current - 1,
        ArrowLeft: current === 0 ? last : current - 1,
        Home: 0,
        End: last
      };
      if (!(e.key in moves)) return;
      e.preventDefault();
      select(moves[e.key], true);
    };
    const list = stage.querySelector(".shm-jbi-tabs");
    list.addEventListener("click", onClick);
    list.addEventListener("keydown", onKey);
    select(0, false);
    return () => {
      list.removeEventListener("click", onClick);
      list.removeEventListener("keydown", onKey);
    };
  }
  function showNote(element, root, stage, inEditor, note) {
    release(element);
    root.classList.add("is-empty", "is-ready");
    stage.innerHTML = inEditor ? `<p class="shm-jbi-empty">${esc(note)}</p>` : "";
  }
  async function jobsByIndustry(ctx) {
    var _a, _b;
    const { element, data } = ctx;
    const root = element.querySelector(".shm-jbi");
    const stage = root == null ? void 0 : root.querySelector(".shm-jbi-stage");
    if (!root || !stage) return;
    const inEditor = !!(data == null ? void 0 : data.inEditor);
    const run = ((_a = runs.get(element)) != null ? _a : 0) + 1;
    runs.set(element, run);
    const s = readSettings((_b = data == null ? void 0 : data.config) != null ? _b : {}, root);
    try {
      const jobs = await loadSiteJobs(ctx.shazamme, data, inEditor);
      if (runs.get(element) !== run) return;
      const industries = buildIndustries(jobs, s);
      if (!industries.length) return showNote(element, root, stage, inEditor, EDITOR_NOTE);
      root.classList.remove("is-empty");
      release(element);
      teardowns.set(element, mountBoard(stage, industries, jobs.length, s));
      root.classList.add("is-ready");
    } catch (err) {
      if (runs.get(element) !== run) return;
      console.error("[jobs-by-industry]", err);
      showNote(element, root, stage, inEditor, EDITOR_NOTE);
    }
  }
  return __toCommonJS(index_exports);
})();
(function(){
  var reg = (typeof window !== 'undefined' && window.__shazWidgetExport) || {};
  var controller = reg.default || reg;
  if (typeof window !== 'undefined') {
    window.ShazammeWidget = window.ShazammeWidget || {};
    window.ShazammeWidget["jobs-by-industry"] = controller;
    window.__shazWidgetExport = void 0;
  }
})();

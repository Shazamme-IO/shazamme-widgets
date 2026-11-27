/* shazamme-widgets — shazamme-widgets v0.1.0
 * Build b7c815329ef9. Registers window.ShazammeWidget["<name>"].
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

  // widgets/job-hero-chips/index.ts
  var index_exports = {};
  __export(index_exports, {
    default: () => jobHeroChips
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
    return SUFFIX_RE.test(wording) ? `${range} ${wording}` : `${range}, ${wording}`;
  }

  // widgets/_job-page/job.ts
  var JOBS_COLLECTION = "Jobs";
  var SAMPLE_JOB = {
    jobName: "Financial Controller",
    category: "Accounting & Finance",
    subCategory: "Financial Controller",
    workType: "Permanent",
    workModel: "Hybrid",
    city: "Sydney",
    state: "NSW",
    country: "Australia",
    salaryType: "Annual",
    salaryFrom: "150000",
    salaryTo: "170000",
    salaryText: "$150,000 \u2013 $170,000 + super",
    currencyCode: "AUD",
    referenceNumber: "236"
  };
  function text(v) {
    if (typeof v === "string") return v.trim();
    if (typeof v === "number" && Number.isFinite(v)) return String(v);
    return "";
  }
  function toBool(v, fallback) {
    if (v === true || v === "true") return true;
    if (v === false || v === "false") return false;
    return fallback;
  }
  function toChoice(v, allowed, fallback) {
    const s = text(v);
    return allowed.includes(s) ? s : fallback;
  }
  function esc(v) {
    return text(v).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  }
  function salaryLine(job) {
    return payLine(job);
  }
  function locationLine(job) {
    return [text(job.city), text(job.state), text(job.country)].filter(Boolean).join(", ");
  }
  var profession = (job) => text(job.profession) || text(job.category);
  var role = (job) => text(job.role) || text(job.subCategory);
  function rowData(entry) {
    if (!entry || typeof entry !== "object") return null;
    const inner = entry.data;
    return inner && typeof inner === "object" ? inner : entry;
  }
  function lastSegment(url) {
    const path = url.split(/[?#]/)[0].replace(/\/+$/, "");
    const seg = path.slice(path.lastIndexOf("/") + 1);
    try {
      return decodeURIComponent(seg).toLowerCase();
    } catch (e) {
      return seg.toLowerCase();
    }
  }
  function pickJob(entries, jobId, pageUrl) {
    if (!Array.isArray(entries)) return null;
    const wantId = jobId.toLowerCase();
    const slug = lastSegment(pageUrl);
    let bySlug = null;
    for (const entry of entries) {
      const row = rowData(entry);
      if (!row) continue;
      if (wantId && text(row.jobID).toLowerCase() === wantId) return row;
      if (!bySlug && slug) {
        const own = lastSegment(text(entry.page_item_url) || text(row.jobURL) || text(row.jobURLAddress));
        if (own && own === slug) bySlug = row;
      }
    }
    return bySlug;
  }
  function loadJobRows(sdk, inEditor) {
    if (typeof sdk.fetch !== "function") return Promise.reject(new Error("The Shazamme SDK did not load."));
    const win = window;
    if (!inEditor && win.__shmJobRows) return win.__shmJobRows;
    const p = Promise.resolve(sdk.fetch({ name: JOBS_COLLECTION, useCache: true }));
    if (!inEditor) {
      win.__shmJobRows = p;
      p.catch(() => {
        win.__shmJobRows = void 0;
      });
    }
    return p;
  }
  async function loadJob(l) {
    var _a;
    const sdk = l.sdk;
    if (!sdk) {
      if (l.inEditor) return { job: { ...SAMPLE_JOB }, isSample: true };
      return null;
    }
    await Promise.resolve((_a = sdk.ready) == null ? void 0 : _a.call(sdk, l.siteId, l.page));
    let found = null;
    try {
      found = pickJob(await loadJobRows(sdk, l.inEditor), text(l.config.jobID), l.pageUrl);
    } catch (e) {
      if (!l.inEditor) throw e;
    }
    if (found) return { job: found, isSample: false };
    return l.inEditor ? { job: { ...SAMPLE_JOB }, isSample: true } : null;
  }

  // widgets/job-hero-chips/chips.ts
  var CHIP_KINDS = ["location", "workType", "workModel", "salary", "profession", "role"];
  var SLOT_KEYS = ["chip1", "chip2", "chip3", "chip4"];
  var SLOT_DEFAULTS = {
    chip1: "location",
    chip2: "workType",
    chip3: "workModel",
    chip4: "salary"
  };
  var READERS = {
    location: locationLine,
    workType: (j) => text(j.workType),
    workModel: (j) => text(j.workModel),
    salary: salaryLine,
    profession,
    role
  };
  function readChipSettings(config) {
    const allowed = [...CHIP_KINDS, "none"];
    return {
      slots: SLOT_KEYS.map((k) => {
        const choice = toChoice(config[k], allowed, SLOT_DEFAULTS[k]);
        return choice === "none" ? null : choice;
      }),
      highlightSalary: toBool(config.highlightSalary, true),
      locationIcon: toBool(config.showLocationIcon, true)
    };
  }
  function buildChips(job, config) {
    const s = readChipSettings(config);
    const seen = /* @__PURE__ */ new Set();
    const chips = [];
    for (const kind of s.slots) {
      if (!kind || seen.has(kind)) continue;
      seen.add(kind);
      const value = READERS[kind](job);
      if (!value) continue;
      chips.push({ kind, value, highlight: kind === "salary" && s.highlightSalary, icon: kind === "location" && s.locationIcon });
    }
    return chips;
  }

  // widgets/job-hero-chips/index.ts
  var WIDGET_NAME = "job-hero-chips";
  var SAMPLE_NOTE = "Sample job, shown in the editor only. The live job page shows the real job.";
  var PIN_ICON = '<svg class="shm-jc-icon" aria-hidden="true" focusable="false" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M8 14s5-4.5 5-8A5 5 0 003 6c0 3.5 5 8 5 8z"></path><circle cx="8" cy="6" r="1.8"></circle></svg>';
  var runs = /* @__PURE__ */ new WeakMap();
  function ensureShell(element) {
    let root = element.querySelector(".shm-jc");
    if (!root) {
      root = document.createElement("div");
      root.className = "shm-jc";
      element.appendChild(root);
    }
    let list = root.querySelector(".shm-jc-list");
    if (!list) {
      list = document.createElement("ul");
      list.className = "shm-jc-list";
      root.appendChild(list);
    }
    return { root, list };
  }
  function chipHtml(c) {
    const classes = ["shm-jc-chip", `shm-jc-chip-${c.kind}`, c.highlight ? "is-highlight" : ""].filter(Boolean).join(" ");
    return `<li class="${classes}">${c.icon ? PIN_ICON : ""}<span class="shm-jc-text">${esc(c.value)}</span></li>`;
  }
  function setNote(root, message) {
    var _a;
    (_a = root.querySelector(".shm-jc-note")) == null ? void 0 : _a.remove();
    if (!message) return;
    const note = document.createElement("p");
    note.className = "shm-jc-note";
    note.textContent = message;
    root.appendChild(note);
  }
  async function jobHeroChips(ctx) {
    var _a, _b, _c;
    const element = ctx == null ? void 0 : ctx.element;
    if (!element || typeof element.querySelector !== "function") return;
    const data = (_a = ctx.data) != null ? _a : {};
    const config = data.config && typeof data.config === "object" ? data.config : {};
    const inEditor = Boolean(data.inEditor);
    const { root, list } = ensureShell(element);
    const run = ((_b = runs.get(element)) != null ? _b : 0) + 1;
    runs.set(element, run);
    root.classList.remove("is-ready", "is-empty");
    root.hidden = false;
    list.innerHTML = "";
    setNote(root, "");
    try {
      const sdk = (_c = ctx.shazamme) != null ? _c : window.shazamme;
      const loaded = await loadJob({
        sdk,
        config,
        siteId: text(data.siteId),
        page: data.page,
        inEditor,
        pageUrl: window.location.href
      });
      if (runs.get(element) !== run) return;
      const chips = loaded ? buildChips(loaded.job, config) : [];
      if (chips.length === 0) {
        root.classList.add("is-empty");
        root.hidden = !inEditor;
        if (inEditor) setNote(root, "Job Hero Chips has no job to show here. Bind the jobID input to the job on a job details page.");
        return;
      }
      list.innerHTML = chips.map(chipHtml).join("");
      root.classList.add("is-ready");
      if (loaded == null ? void 0 : loaded.isSample) setNote(root, SAMPLE_NOTE);
    } catch (e) {
      console.error(`[${WIDGET_NAME}]`, e);
      if (runs.get(element) !== run) return;
      root.classList.add("is-empty");
      root.hidden = !inEditor;
      if (inEditor) setNote(root, "The job could not be loaded.");
    }
  }
  return __toCommonJS(index_exports);
})();
(function(){
  var reg = (typeof window !== 'undefined' && window.__shazWidgetExport) || {};
  var controller = reg.default || reg;
  if (typeof window !== 'undefined') {
    window.ShazammeWidget = window.ShazammeWidget || {};
    window.ShazammeWidget["job-hero-chips"] = controller;
    window.__shazWidgetExport = void 0;
  }
})();

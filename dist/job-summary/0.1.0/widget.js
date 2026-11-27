/* shazamme-widgets — shazamme-widgets v0.1.0
 * Build 0b8a84eaea4a. Registers window.ShazammeWidget["<name>"].
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

  // widgets/job-summary/index.ts
  var index_exports = {};
  __export(index_exports, {
    default: () => jobSummary
  });

  // widgets/_job-page/job.ts
  var JOBS_COLLECTION = "Jobs";
  var SYMBOLS = {
    AUD: "$",
    USD: "$",
    NZD: "$",
    CAD: "$",
    SGD: "$",
    HKD: "$",
    GBP: "\xA3",
    EUR: "\u20AC",
    INR: "\u20B9",
    JPY: "\xA5",
    ZAR: "R"
  };
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
  function esc(v) {
    return text(v).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  }
  function amount(v) {
    const n = parseFloat(text(v).replace(/[^0-9.-]/g, ""));
    return Number.isFinite(n) && n > 0 ? n : 0;
  }
  function currencyCode(job) {
    const code = text(job.currencyCode) || text(job.salaryCurrency) || text(job.currency);
    return /^[A-Za-z]{3}$/.test(code) ? code.toUpperCase() : "";
  }
  function money(n, code) {
    var _a;
    const symbol = (_a = SYMBOLS[code]) != null ? _a : code ? `${code} ` : "";
    return `${symbol}${Math.round(n).toLocaleString("en-AU")}`;
  }
  function salaryRange(job) {
    const from = amount(job.salaryFrom) || amount(job.realSalaryFrom);
    const to = amount(job.salaryTo) || amount(job.realSalaryTo);
    const code = currencyCode(job);
    if (from && to && from !== to) return `${money(from, code)} \u2013 ${money(to, code)}`;
    const one = from || to;
    return one ? money(one, code) : "";
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

  // widgets/job-summary/rows.ts
  var ROW_DEFS = [
    { key: "profession", label: "Profession", value: profession },
    { key: "role", label: "Role", value: role },
    { key: "workType", label: "Work type", value: (j) => text(j.workType) },
    { key: "workModel", label: "Work model", value: (j) => text(j.workModel) },
    { key: "location", label: "Location", value: locationLine },
    { key: "salaryType", label: "Salary type", value: (j) => text(j.salaryType) },
    { key: "salary", label: "Salary", value: salaryRange },
    { key: "package", label: "Package", value: (j) => text(j.salaryText) },
    { key: "currency", label: "Currency", value: currencyCode },
    { key: "reference", label: "Reference", value: (j) => text(j.referenceNumber) }
  ];
  var cap = (k) => k.charAt(0).toUpperCase() + k.slice(1);
  var showKey = (k) => `show${cap(k)}`;
  var labelKey = (k) => `label${cap(k)}`;
  function buildRows(job, config) {
    const rows = [];
    for (const def of ROW_DEFS) {
      if (!toBool(config[showKey(def.key)], true)) continue;
      const value = def.value(job);
      if (!value) continue;
      rows.push({ key: def.key, label: text(config[labelKey(def.key)]) || def.label, value });
    }
    const salary = rows.find((r) => r.key === "salary");
    return rows.filter((r) => !(r.key === "package" && salary && salary.value === r.value));
  }

  // widgets/job-summary/index.ts
  var WIDGET_NAME = "job-summary";
  var SAMPLE_NOTE = "Sample job, shown in the editor only. The live job page shows the real job.";
  var runs = /* @__PURE__ */ new WeakMap();
  function ensureShell(element) {
    let root = element.querySelector(".shm-js");
    if (!root) {
      root = document.createElement("div");
      root.className = "shm-js";
      element.appendChild(root);
    }
    let list = root.querySelector(".shm-js-list");
    if (!list) {
      list = document.createElement("dl");
      list.className = "shm-js-list";
      root.appendChild(list);
    }
    return { root, list };
  }
  function setNote(root, message) {
    var _a;
    (_a = root.querySelector(".shm-js-note")) == null ? void 0 : _a.remove();
    if (!message) return;
    const note = document.createElement("p");
    note.className = "shm-js-note";
    note.textContent = message;
    root.appendChild(note);
  }
  async function jobSummary(ctx) {
    var _a, _b, _c, _d;
    const element = ctx == null ? void 0 : ctx.element;
    if (!element || typeof element.querySelector !== "function") return;
    const data = (_a = ctx.data) != null ? _a : {};
    const config = data.config && typeof data.config === "object" ? data.config : {};
    const inEditor = Boolean(data.inEditor);
    const { root, list } = ensureShell(element);
    const heading = root.querySelector(".shm-js-heading");
    if (heading) heading.hidden = !((_b = heading.textContent) != null ? _b : "").trim();
    const run = ((_c = runs.get(element)) != null ? _c : 0) + 1;
    runs.set(element, run);
    root.classList.remove("is-ready", "is-empty");
    root.hidden = false;
    list.innerHTML = "";
    setNote(root, "");
    try {
      const sdk = (_d = ctx.shazamme) != null ? _d : window.shazamme;
      const loaded = await loadJob({
        sdk,
        config,
        siteId: text(data.siteId),
        page: data.page,
        inEditor,
        pageUrl: window.location.href
      });
      if (runs.get(element) !== run) return;
      const rows = loaded ? buildRows(loaded.job, config) : [];
      if (rows.length === 0) {
        root.classList.add("is-empty");
        root.hidden = !inEditor;
        if (inEditor) setNote(root, "Job Summary has no job to show here. Bind the jobID input to the job on a job details page.");
        return;
      }
      list.innerHTML = rows.map((r) => `<dt class="shm-js-label">${esc(r.label)}</dt><dd class="shm-js-value" data-row="${esc(r.key)}">${esc(r.value)}</dd>`).join("");
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
    window.ShazammeWidget["job-summary"] = controller;
    window.__shazWidgetExport = void 0;
  }
})();

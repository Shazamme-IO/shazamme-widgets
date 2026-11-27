/* shazamme-widgets — shazamme-widgets v0.1.0
 * Build 220723891715. Registers window.ShazammeWidget["<name>"].
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

  // widgets/consultant-card/index.ts
  var index_exports = {};
  __export(index_exports, {
    default: () => consultantCard
  });

  // widgets/consultant-card/settings.ts
  var LIMITS = {
    columns: { min: 1, max: 6 },
    maxConsultants: { min: 0, max: 100 }
  };
  var MODES = ["team", "job"];
  var SORTS = ["default", "name"];
  var SHOWS = ["auto", "show", "hide"];
  function toText(v, fallback = "") {
    if (typeof v === "string") return v.trim();
    if (typeof v === "number" && Number.isFinite(v)) return String(v);
    return fallback;
  }
  function toBool(v, fallback) {
    if (v === true || v === "true") return true;
    if (v === false || v === "false") return false;
    return fallback;
  }
  function toInt(v, fallback, min, max) {
    const n = typeof v === "number" ? v : parseInt(String(v != null ? v : ""), 10);
    if (!Number.isFinite(n)) return fallback;
    return Math.max(min, Math.min(max, Math.round(n)));
  }
  function toChoice(v, allowed, fallback) {
    const s = toText(v).toLowerCase();
    return allowed.includes(s) ? s : fallback;
  }
  function resolveShow(v, autoValue) {
    const choice = toChoice(v, SHOWS, "auto");
    return choice === "auto" ? autoValue : choice === "show";
  }
  function readSettings(config) {
    const c = config && typeof config === "object" ? config : {};
    const mode = toChoice(c.mode, MODES, "team");
    const isTeam = mode === "team";
    return {
      siteId: toText(c.siteId),
      mode,
      jobId: toText(c.jobID),
      classification: toText(c.classification).toLowerCase(),
      maxConsultants: toInt(c.maxConsultants, 0, LIMITS.maxConsultants.min, LIMITS.maxConsultants.max),
      sortBy: toChoice(c.sortBy, SORTS, "default"),
      columnsDesktop: toInt(c.columnsDesktop, 4, LIMITS.columns.min, LIMITS.columns.max),
      columnsTablet: toInt(c.columnsTablet, 2, LIMITS.columns.min, LIMITS.columns.max),
      columnsMobile: toInt(c.columnsMobile, 1, LIMITS.columns.min, LIMITS.columns.max),
      eyebrow: toText(c.eyebrow, "Your consultant"),
      ariaLabel: toText(c.ariaLabel, "Our consultants") || "Our consultants",
      showRole: toBool(c.showRole, true),
      showLiveRoles: resolveShow(c.showLiveRoles, isTeam),
      showZeroRoles: toBool(c.showZeroRoles, false),
      liveRolesOne: toText(c.liveRolesOne, "{n} live role") || "{n} live role",
      liveRolesMany: toText(c.liveRolesMany, "{n} live roles") || "{n} live roles",
      showEmail: resolveShow(c.showEmail, !isTeam),
      showPhone: resolveShow(c.showPhone, !isTeam),
      linkProfile: toBool(c.linkProfile, true),
      noConsultantMessage: toText(c.noConsultantMessage)
    };
  }

  // widgets/consultant-card/data.ts
  var EMAIL_PATTERN = /^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]+$/;
  function safeUrl(v) {
    const s = typeof v === "string" ? v.trim() : "";
    if (!s || /[\\\u0000-\u001f\u007f]/.test(s)) return "";
    if (/^https?:\/\//i.test(s)) return s;
    if (/^\/(?!\/)/.test(s)) return s;
    return "";
  }
  function plainText(v) {
    var _a;
    const html = typeof v === "string" ? v : "";
    if (!html) return "";
    if (!/[<&]/.test(html)) return html.trim();
    const doc = new DOMParser().parseFromString(html, "text/html");
    doc.querySelectorAll("script, style").forEach((el) => el.remove());
    return ((_a = doc.body.textContent) != null ? _a : "").trim();
  }
  function pathOf(v) {
    const url = safeUrl(v);
    if (!url) return "";
    try {
      return (url.startsWith("/") ? url : new URL(url).pathname).replace(/\/+$/, "").toLowerCase();
    } catch (e) {
      return "";
    }
  }
  function cleanEmail(v) {
    const s = toText(v);
    return EMAIL_PATTERN.test(s) ? s : "";
  }
  var MIN_PHONE_DIGITS = 6;
  function telHref(phone) {
    const digits = phone.replace(/\D/g, "");
    if (digits.length < MIN_PHONE_DIGITS) return "";
    return `tel:${phone.trim().startsWith("+") ? "+" : ""}${digits}`;
  }
  function initials(name) {
    var _a, _b, _c;
    const words = name.trim().split(/\s+/).filter(Boolean);
    const first = (_b = Array.from((_a = words[0]) != null ? _a : "")[0]) != null ? _b : "";
    const last = words.length > 1 ? (_c = Array.from(words[words.length - 1])[0]) != null ? _c : "" : "";
    return (first + last).toUpperCase() || "?";
  }
  function rowData(entry) {
    if (!entry || typeof entry !== "object") return null;
    const e = entry;
    const inner = e.data;
    return inner && typeof inner === "object" ? inner : e;
  }
  function toConsultant(row, index) {
    var _a;
    if (row.isVisible === false || row.isVisible === "false") return null;
    const name = [plainText(row.firstName), plainText(row.lastName)].filter(Boolean).join(" ");
    if (!name) return null;
    const sort = typeof row.sortOrder === "number" ? row.sortOrder : parseInt(String((_a = row.sortOrder) != null ? _a : ""), 10);
    return {
      id: toText(row.consultantID, `row-${index}`).toLowerCase() || `row-${index}`,
      name,
      role: plainText(row.positionTitle),
      email: cleanEmail(row.eMail),
      phone: plainText(row.phone) || plainText(row.mobile),
      path: pathOf(row.consultantURL),
      classification: toText(row.classification).toLowerCase(),
      sortOrder: Number.isFinite(sort) ? sort : Number.MAX_SAFE_INTEGER
    };
  }
  function normaliseConsultants(entries) {
    if (!Array.isArray(entries)) return [];
    const out = [];
    entries.forEach((entry, index) => {
      const row = rowData(entry);
      const c = row ? toConsultant(row, index) : null;
      if (c) out.push(c);
    });
    return out;
  }
  function selectConsultants(all, s) {
    const filtered = s.classification ? all.filter((c) => c.classification === s.classification) : all.slice();
    const sorted = s.sortBy === "name" ? filtered.sort((a, b) => a.name.localeCompare(b.name)) : filtered.sort((a, b) => a.sortOrder - b.sortOrder);
    return s.maxConsultants > 0 ? sorted.slice(0, s.maxConsultants) : sorted;
  }
  function isLive(row) {
    return !(row.activeStatus === false || row.activeStatus === "false");
  }
  function countLiveRoles(jobEntries, consultants) {
    var _a;
    const counts = /* @__PURE__ */ new Map();
    const rows = Array.isArray(jobEntries) ? jobEntries : [];
    const byEmail = /* @__PURE__ */ new Map();
    const byPath = /* @__PURE__ */ new Map();
    for (const c of consultants) {
      if (c.email) byEmail.set(c.email.toLowerCase(), c);
      if (c.path) byPath.set(c.path, c);
    }
    let known = false;
    for (const entry of rows) {
      const row = rowData(entry);
      if (!row || !isLive(row)) continue;
      const email = cleanEmail(row.contactEmail).toLowerCase();
      const path = pathOf(row.consultantURL);
      if (email || path) known = true;
      const owner = email && byEmail.get(email) || path && byPath.get(path) || null;
      if (owner) counts.set(owner.id, ((_a = counts.get(owner.id)) != null ? _a : 0) + 1);
    }
    return { known, counts };
  }
  function findJob(entries, jobId) {
    if (!Array.isArray(entries) || !jobId) return null;
    const want = jobId.toLowerCase();
    for (const entry of entries) {
      const row = rowData(entry);
      if (row && toText(row.jobID).toLowerCase() === want) return row;
    }
    return null;
  }
  function consultantForJob(job, consultants) {
    const email = cleanEmail(job.contactEmail);
    const path = pathOf(job.consultantURL);
    const match = email && consultants.find((c) => c.email.toLowerCase() === email.toLowerCase()) || path && consultants.find((c) => c.path === path) || null;
    if (match) return match;
    const name = plainText(job.contactName);
    if (!name) return null;
    return { id: "job-contact", name, role: "", email, phone: plainText(job.contactPhone), path, classification: "", sortOrder: 0 };
  }
  function loadRows(sdk, collection, siteId, inEditor) {
    var _a;
    if (typeof sdk.fetch !== "function") return Promise.reject(new Error("The Shazamme SDK did not load."));
    const win = window;
    const cache = win.__shmCcFetch = (_a = win.__shmCcFetch) != null ? _a : {};
    const key = `${siteId}::${collection}`;
    const hit = cache[key];
    if (!inEditor && hit) return hit;
    const p = Promise.resolve(sdk.fetch({ name: collection }));
    if (!inEditor) {
      cache[key] = p;
      p.catch(() => {
        delete cache[key];
      });
    }
    return p;
  }
  async function consultantFromApi(sdk, jobId) {
    var _a, _b;
    if (typeof sdk.site !== "function" || typeof sdk.submit !== "function") return null;
    const site = await sdk.site();
    const res = await sdk.submit({ action: "Get Consultant By Job", jobID: jobId, siteID: site == null ? void 0 : site.siteID });
    const items = (_a = res == null ? void 0 : res.response) == null ? void 0 : _a.items;
    return (_b = normaliseConsultants(items)[0]) != null ? _b : null;
  }

  // widgets/consultant-card/render.ts
  function esc(v) {
    return String(v != null ? v : "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  function liveRolesText(n, s) {
    return (n === 1 ? s.liveRolesOne : s.liveRolesMany).replace(/\{n\}/g, String(n));
  }
  function nameHtml(c, s) {
    return s.linkProfile && c.path ? `<a class="shm-cc-name" href="${esc(c.path)}">${esc(c.name)}</a>` : `<span class="shm-cc-name">${esc(c.name)}</span>`;
  }
  function contactHtml(c, s) {
    const phone = s.showPhone && c.phone ? telHref(c.phone) : "";
    const parts = [
      phone ? `<a class="shm-cc-phone" href="${esc(phone)}">${esc(c.phone)}</a>` : "",
      s.showEmail && c.email ? `<a class="shm-cc-email" href="mailto:${esc(c.email)}">${esc(c.email)}</a>` : ""
    ].filter(Boolean);
    return parts.length ? `<span class="shm-cc-contact">${parts.join("")}</span>` : "";
  }
  function liveHtml(c, s, counts) {
    var _a;
    if (!s.showLiveRoles || counts === null) return "";
    const n = (_a = counts.get(c.id)) != null ? _a : 0;
    if (n === 0 && !s.showZeroRoles) return "";
    return `<span class="shm-cc-live">${esc(liveRolesText(n, s))}</span>`;
  }
  function cardHtml(c, s, counts) {
    const role = s.showRole && c.role ? `<span class="shm-cc-role">${esc(c.role)}</span>` : "";
    return `<article class="shm-cc-card"><span class="shm-cc-badge" aria-hidden="true">${esc(initials(c.name))}</span><span class="shm-cc-id">${nameHtml(c, s)}${role}</span>${contactHtml(c, s)}${liveHtml(c, s, counts)}</article>`;
  }
  function teamHtml(items, s, counts) {
    const cards = items.map((c) => `<li class="shm-cc-item">${cardHtml(c, s, counts)}</li>`).join("");
    return `<ul class="shm-cc-grid" role="list" aria-label="${esc(s.ariaLabel)}">${cards}</ul>`;
  }
  function jobHtml(c, s, counts) {
    const eyebrow = s.eyebrow ? `<span class="shm-cc-eyebrow">${esc(s.eyebrow)}</span>` : "";
    return `<section class="shm-cc-job" aria-label="${esc(s.eyebrow || s.ariaLabel)}">${eyebrow}${cardHtml(c, s, counts)}</section>`;
  }

  // widgets/consultant-card/index.ts
  var WIDGET_NAME = "consultant-card";
  var CONSULTANTS = "Consultants";
  var JOBS = "Jobs";
  var GENERIC_ERROR = "The consultants could not be loaded.";
  function ensureShell(element) {
    let root = element.querySelector(".shm-cc");
    if (!root) {
      root = document.createElement("div");
      root.className = "shm-cc";
      element.appendChild(root);
    }
    let stage = root.querySelector(".shm-cc-stage");
    if (!stage) {
      stage = document.createElement("div");
      stage.className = "shm-cc-stage";
      root.appendChild(stage);
    }
    return { root, stage };
  }
  function applyShell(root, s) {
    Array.from(root.classList).filter((c) => c.startsWith("is-mode-")).forEach((c) => root.classList.remove(c));
    root.classList.add(`is-mode-${s.mode}`);
    root.classList.remove("is-ready", "is-empty");
    root.hidden = false;
    root.style.setProperty("--shm-cc-cols-d", String(s.columnsDesktop));
    root.style.setProperty("--shm-cc-cols-t", String(s.columnsTablet));
    root.style.setProperty("--shm-cc-cols-m", String(s.columnsMobile));
  }
  function showNote(root, stage, inEditor, message, liveMessage = "") {
    if (inEditor) stage.innerHTML = `<div class="shm-cc-editor-note" role="note">Consultant Card: ${esc(message)}</div>`;
    else stage.innerHTML = liveMessage ? `<p class="shm-cc-empty">${esc(liveMessage)}</p>` : "";
    root.classList.add("is-ready");
    if (!inEditor && !liveMessage) {
      root.classList.add("is-empty");
      root.hidden = true;
    }
  }
  async function liveCounts(sdk, s, siteId, inEditor, all) {
    if (!s.showLiveRoles) return null;
    try {
      const jobs = await loadRows(sdk, JOBS, siteId, inEditor);
      const result = countLiveRoles(jobs, all);
      return result.known ? result.counts : null;
    } catch (err) {
      console.error("[consultant-card] live roles unavailable", err);
      return null;
    }
  }
  async function renderTeam(sdk, s, siteId, inEditor) {
    const all = normaliseConsultants(await loadRows(sdk, CONSULTANTS, siteId, inEditor));
    const items = selectConsultants(all, s);
    if (items.length === 0) {
      return { note: all.length === 0 ? "the Consultants collection has no visible rows." : `no consultants match the Classification "${s.classification}".` };
    }
    const counts = await liveCounts(sdk, s, siteId, inEditor, all);
    return { html: teamHtml(items, s, counts) };
  }
  async function ownerOfJob(sdk, s, siteId, inEditor) {
    const [jobRows, consultantRows] = await Promise.all([
      loadRows(sdk, JOBS, siteId, inEditor),
      loadRows(sdk, CONSULTANTS, siteId, inEditor).catch(() => [])
    ]);
    const all = normaliseConsultants(consultantRows);
    const job = findJob(jobRows, s.jobId);
    if (job) return { consultant: consultantForJob(job, all), all };
    return { consultant: await consultantFromApi(sdk, s.jobId).catch(() => null), all };
  }
  async function renderJob(sdk, s, siteId, inEditor) {
    if (!s.jobId) {
      return { note: "connect the Job ID field to the page's job, so the card knows which job it is on.", live: s.noConsultantMessage };
    }
    const { consultant, all } = await ownerOfJob(sdk, s, siteId, inEditor);
    if (!consultant) return { note: `no consultant is assigned to job ${s.jobId}.`, live: s.noConsultantMessage };
    const counts = await liveCounts(sdk, s, siteId, inEditor, all.some((c) => c.id === consultant.id) ? all : [...all, consultant]);
    return { html: jobHtml(consultant, s, counts) };
  }
  var runs = /* @__PURE__ */ new WeakMap();
  async function consultantCard(ctx) {
    var _a, _b, _c, _d, _e, _f, _g;
    const element = ctx == null ? void 0 : ctx.element;
    if (!element || typeof element.querySelector !== "function") return;
    (_a = element.__shmCcDestroy) == null ? void 0 : _a.call(element);
    const data = (_b = ctx.data) != null ? _b : {};
    const inEditor = Boolean(data.inEditor);
    const s = readSettings(data.config);
    const { root, stage } = ensureShell(element);
    applyShell(root, s);
    stage.innerHTML = "";
    element.__shmCcDestroy = () => {
      stage.innerHTML = "";
    };
    const run = ((_c = runs.get(element)) != null ? _c : 0) + 1;
    runs.set(element, run);
    const current = () => runs.get(element) === run;
    try {
      const sdk = (_d = ctx.shazamme) != null ? _d : window.shazamme;
      if (!sdk) throw new Error("The Shazamme SDK did not load.");
      const siteId = s.siteId || String((_e = data.siteId) != null ? _e : "");
      await Promise.resolve((_f = sdk.ready) == null ? void 0 : _f.call(sdk, siteId, data.page));
      (_g = sdk.register) == null ? void 0 : _g.call(sdk, WIDGET_NAME, data);
      if (!current()) return;
      const outcome = s.mode === "job" ? await renderJob(sdk, s, siteId, inEditor) : await renderTeam(sdk, s, siteId, inEditor);
      if (!current()) return;
      if ("html" in outcome) {
        stage.innerHTML = outcome.html;
        root.classList.add("is-ready");
      } else {
        showNote(root, stage, inEditor, outcome.note, outcome.live);
      }
    } catch (err) {
      if (!current()) return;
      console.error("[consultant-card]", err);
      showNote(root, stage, inEditor, err instanceof Error && err.message ? err.message : GENERIC_ERROR);
    }
  }
  return __toCommonJS(index_exports);
})();
(function(){
  var reg = (typeof window !== 'undefined' && window.__shazWidgetExport) || {};
  var controller = reg.default || reg;
  if (typeof window !== 'undefined') {
    window.ShazammeWidget = window.ShazammeWidget || {};
    window.ShazammeWidget["consultant-card"] = controller;
    window.__shazWidgetExport = void 0;
  }
})();

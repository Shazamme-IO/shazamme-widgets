/* shazamme-widgets — shazamme-widgets v0.1.0
 * Build 1fe5c76ab437. Registers window.ShazammeWidget["<name>"].
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

  // widgets/job-search-hero/index.ts
  var index_exports = {};
  __export(index_exports, {
    default: () => jobSearchHero
  });

  // widgets/_job-page/job.ts
  var JOBS_COLLECTION = "Jobs";
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

  // widgets/job-search-hero/settings.ts
  var DEFAULTS = {
    resultsPage: "job-results",
    ariaLabel: "Search jobs",
    showLocation: true,
    showWorkType: true,
    keywordLabel: "Keyword",
    keywordPlaceholder: "Job title, skill or company",
    locationLabel: "Location",
    locationPlaceholder: "Sydney, London\u2026",
    workTypeLabel: "Work type",
    workTypeAllLabel: "All types",
    buttonText: "Search {count} roles",
    buttonTextOne: "Search 1 role",
    buttonTextNoCount: "Search roles"
  };
  var SETTING_KEYS = Object.keys(DEFAULTS);
  function readSettings(config) {
    const c = config && typeof config === "object" ? config : {};
    const t = (k) => text(c[k]) || String(DEFAULTS[k]);
    return {
      resultsPage: t("resultsPage"),
      ariaLabel: t("ariaLabel"),
      showLocation: toBool(c.showLocation, DEFAULTS.showLocation),
      showWorkType: toBool(c.showWorkType, DEFAULTS.showWorkType),
      keywordLabel: t("keywordLabel"),
      keywordPlaceholder: t("keywordPlaceholder"),
      locationLabel: t("locationLabel"),
      locationPlaceholder: t("locationPlaceholder"),
      workTypeLabel: t("workTypeLabel"),
      workTypeAllLabel: t("workTypeAllLabel"),
      buttonText: t("buttonText"),
      buttonTextOne: t("buttonTextOne"),
      buttonTextNoCount: t("buttonTextNoCount")
    };
  }
  function buildResultsUrl(page, params) {
    const query = Object.entries(params).filter(([, v]) => v.trim() !== "").map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v.trim())}`).join("&");
    const raw = page.trim();
    const hashAt = raw.indexOf("#");
    const base = hashAt === -1 ? raw : raw.slice(0, hashAt);
    const frag = hashAt === -1 ? "" : raw.slice(hashAt);
    const isAbsolute = /^https?:\/\//i.test(base);
    if (!isAbsolute && /^[a-z][a-z0-9+.-]*:/i.test(base)) return buildResultsUrl(DEFAULTS.resultsPage, params);
    const path = isAbsolute ? base : `/${base.replace(/^[/\\]+/, "")}`;
    const sep = path.includes("?") ? "&" : "?";
    return `${path}${query ? sep + query : ""}${frag}`;
  }
  function countLabel(s, count) {
    if (count === 1) return s.buttonTextOne;
    if (count > 1) return s.buttonText.replace(/\{count\}/g, count.toLocaleString("en-AU"));
    return s.buttonTextNoCount;
  }

  // widgets/job-search-hero/index.ts
  var WIDGET_NAME = "job-search-hero";
  var URL_PARAMS = ["keyword", "location", "workType"];
  var runs = /* @__PURE__ */ new WeakMap();
  var FORM_HTML = `
  <label class="shm-jh-field shm-jh-field-keyword"><span class="shm-jh-label"></span><input class="shm-jh-input" type="text" name="keyword" autocomplete="off"></label>
  <label class="shm-jh-field shm-jh-field-location"><span class="shm-jh-label"></span><input class="shm-jh-input" type="text" name="location" autocomplete="off"></label>
  <label class="shm-jh-field shm-jh-field-worktype"><span class="shm-jh-label"></span><select class="shm-jh-input" name="workType"><option value=""></option></select></label>
  <button class="shm-jh-button" type="submit"><span class="shm-jh-button-text"></span></button>`;
  function ensureForm(element) {
    let form = element.querySelector("form.shm-jh");
    if (!form) {
      form = document.createElement("form");
      form.className = "shm-jh";
      form.noValidate = true;
      element.appendChild(form);
    }
    if (!form.querySelector(".shm-jh-button")) form.innerHTML = FORM_HTML;
    return form;
  }
  var q = (form, sel) => form.querySelector(sel);
  function applyText(form, s) {
    form.setAttribute("role", "search");
    form.setAttribute("aria-label", s.ariaLabel);
    q(form, ".shm-jh-field-keyword .shm-jh-label").textContent = s.keywordLabel;
    q(form, "[name=keyword]").placeholder = s.keywordPlaceholder;
    q(form, ".shm-jh-field-location .shm-jh-label").textContent = s.locationLabel;
    q(form, "[name=location]").placeholder = s.locationPlaceholder;
    q(form, ".shm-jh-field-worktype .shm-jh-label").textContent = s.workTypeLabel;
    q(form, ".shm-jh-field-location").hidden = !s.showLocation;
  }
  function distinctWorkTypes(rows) {
    var _a;
    if (!Array.isArray(rows)) return [];
    const seen = /* @__PURE__ */ new Map();
    for (const entry of rows) {
      const row = entry && typeof entry === "object" ? (_a = entry.data) != null ? _a : entry : null;
      const label = text(row && typeof row === "object" ? row.workType : "");
      if (label && !seen.has(label.toLowerCase())) seen.set(label.toLowerCase(), label);
    }
    return Array.from(seen.values()).sort((a, b) => a.localeCompare(b, "en-AU"));
  }
  function fillWorkTypes(form, s, labels) {
    const select = q(form, "[name=workType]");
    const chosen = select.value;
    select.innerHTML = "";
    select.add(new Option(s.workTypeAllLabel, ""));
    labels.forEach((l) => select.add(new Option(l, l)));
    select.value = labels.includes(chosen) ? chosen : "";
    q(form, ".shm-jh-field-worktype").hidden = !s.showWorkType || labels.length === 0;
  }
  function prefillFromAddress(form) {
    const params = new URLSearchParams(window.location.search);
    for (const name of URL_PARAMS) {
      const value = params.get(name);
      const field = form.querySelector(`[name=${name}]`);
      if (value && field && !field.value) field.value = value;
    }
  }
  async function jobSearchHero(ctx) {
    var _a, _b, _c, _d, _e, _f;
    const element = ctx == null ? void 0 : ctx.element;
    if (!element || typeof element.querySelector !== "function") return;
    (_a = element.__shmJhOff) == null ? void 0 : _a.call(element);
    element.__shmJhOff = void 0;
    const data = (_b = ctx.data) != null ? _b : {};
    const inEditor = Boolean(data.inEditor);
    const s = readSettings(data.config);
    const form = ensureForm(element);
    applyText(form, s);
    const last = (_c = element.__shmJhLast) != null ? _c : { count: 0, labels: [] };
    q(form, ".shm-jh-button-text").textContent = countLabel(s, last.count);
    fillWorkTypes(form, s, last.labels);
    prefillFromAddress(form);
    const onSubmit = (e) => {
      e.preventDefault();
      if (inEditor) return;
      const field = (name) => {
        var _a2;
        return text((_a2 = form.querySelector(`[name=${name}]`)) == null ? void 0 : _a2.value);
      };
      window.location.assign(buildResultsUrl(s.resultsPage, { keyword: field("keyword"), location: s.showLocation ? field("location") : "", workType: field("workType") }));
    };
    form.addEventListener("submit", onSubmit);
    element.__shmJhOff = () => form.removeEventListener("submit", onSubmit);
    const run = ((_d = runs.get(element)) != null ? _d : 0) + 1;
    runs.set(element, run);
    try {
      const sdk = (_e = ctx.shazamme) != null ? _e : window.shazamme;
      if (!sdk) return;
      await Promise.resolve((_f = sdk.ready) == null ? void 0 : _f.call(sdk, text(data.siteId), data.page));
      const rows = await loadJobRows(sdk, inEditor);
      if (runs.get(element) !== run) return;
      const count = Array.isArray(rows) ? rows.length : 0;
      const labels = distinctWorkTypes(rows);
      element.__shmJhLast = { count, labels };
      q(form, ".shm-jh-button-text").textContent = countLabel(s, count);
      fillWorkTypes(form, s, labels);
      prefillFromAddress(form);
    } catch (e) {
      console.error(`[${WIDGET_NAME}]`, e);
    }
  }
  return __toCommonJS(index_exports);
})();
(function(){
  var reg = (typeof window !== 'undefined' && window.__shazWidgetExport) || {};
  var controller = reg.default || reg;
  if (typeof window !== 'undefined') {
    window.ShazammeWidget = window.ShazammeWidget || {};
    window.ShazammeWidget["job-search-hero"] = controller;
    window.__shazWidgetExport = void 0;
  }
})();

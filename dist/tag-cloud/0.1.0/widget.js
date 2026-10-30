/* shazamme-widgets — shazamme-widgets v0.1.0
 * Build 6b3e91f23dd9. Registers window.ShazammeWidget["<name>"].
 */

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

  // dist/.gen/tag-cloud.index.js
  var tag_cloud_index_exports = {};
  __export(tag_cloud_index_exports, {
    default: () => legacyController
  });

  // core/script-loader.ts
  var CANONICAL_SDK_URL = "https://sdk.shazamme.io/js/shazamme-1.0.3.min.js";
  var SDK_URL_RE = /shazamme(-1\.0\.\d+(-test)?)?\.min\.js/;
  function injectScript(src) {
    return new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = src;
      s.onload = () => resolve();
      s.onerror = () => reject(new Error(`Failed to load ${src}`));
      (document.head || document.documentElement).appendChild(s);
    });
  }
  function loadSdk() {
    if (window.__shazSDKPromise) return window.__shazSDKPromise;
    const p = window.shazamme ? Promise.resolve() : injectScript(CANONICAL_SDK_URL);
    window.__shazSDKPromise = p;
    return p;
  }
  function loadOther(src) {
    const cache = window.__shazScriptCache = window.__shazScriptCache || {};
    const existing = cache[src];
    if (existing) return existing;
    const p = injectScript(src).catch((err) => {
      delete cache[src];
      throw err;
    });
    cache[src] = p;
    return p;
  }
  function installScriptLoader() {
    if (typeof window === "undefined" || window.__shazLoadScript) return;
    window.__shazLoadScript = (src) => SDK_URL_RE.test(src) ? loadSdk() : loadOther(src);
  }
  function ensureScriptLoader() {
    installScriptLoader();
  }

  // dist/.gen/tag-cloud.index.js
  function legacyController(ctx) {
    ensureScriptLoader();
    var data = ctx.data, element = ctx.element, $ = ctx.$ || window.jQuery || window.$, shazamme = ctx.shazamme || window.shazamme;
    var cfg = data && data.config || {};
    var root = element.querySelector(".shm-tc");
    if (!root) {
      return;
    }
    var DEFAULT_PATTERN = "/job-results?search={tag}";
    var HEADING_TAGS = ["h2", "h3", "h4", "h5", "p"];
    var MAX_COLUMNS = 8;
    function toBool(v, fallback) {
      if (v === true || v === "true") {
        return true;
      }
      if (v === false || v === "false") {
        return false;
      }
      return fallback;
    }
    function toInt(v, fallback, min, max) {
      var n = parseInt(v, 10);
      if (isNaN(n)) {
        return fallback;
      }
      return Math.max(min, Math.min(max, n));
    }
    function esc(s) {
      return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
    }
    var linkOn = toBool(cfg.linkEnabled, true);
    var pattern = String(cfg.linkPattern || "").trim() || DEFAULT_PATTERN;
    if (!/^(\/(?![\/\\])|https?:\/\/)/i.test(pattern)) {
      pattern = DEFAULT_PATTERN;
    }
    var headingTag = String(cfg.headingTag || "h3").toLowerCase();
    if (HEADING_TAGS.indexOf(headingTag) === -1) {
      headingTag = "h3";
    }
    var colsDesktop = toInt(cfg.columnsDesktop, 0, 0, MAX_COLUMNS);
    var colsMobile = toInt(cfg.columnsMobile, 0, 0, MAX_COLUMNS);
    function hrefFor(tag2) {
      var enc = encodeURIComponent(tag2);
      return pattern.indexOf("{tag}") > -1 ? pattern.split("{tag}").join(enc) : pattern + enc;
    }
    var total = root.querySelectorAll(".shm-tc-pill").length;
    var groups = root.querySelectorAll(".shm-tc-group");
    for (var g = 0; g < groups.length; g++) {
      var raw = groups[g].querySelector(".shm-tc-raw");
      var list = groups[g].querySelector(".shm-tc-list");
      if (!raw || !list) {
        continue;
      }
      var lines = raw.textContent.split(/\r?\n/);
      var out = [];
      for (var i = 0; i < lines.length; i++) {
        var tag = lines[i].trim();
        if (!tag) {
          continue;
        }
        out.push(linkOn ? '<a class="shm-tc-pill" href="' + esc(hrefFor(tag)) + '">' + esc(tag) + "</a>" : '<span class="shm-tc-pill">' + esc(tag) + "</span>");
      }
      total += out.length;
      if (out.length) {
        list.innerHTML = out.join("");
      } else {
        groups[g].parentNode.removeChild(groups[g]);
      }
    }
    if (headingTag !== "h3") {
      var heads = root.querySelectorAll(".shm-tc-heading");
      for (var h = 0; h < heads.length; h++) {
        var swap = document.createElement(headingTag);
        swap.className = heads[h].className;
        swap.textContent = heads[h].textContent;
        heads[h].parentNode.replaceChild(swap, heads[h]);
      }
    }
    root.classList.toggle("is-cols-d", colsDesktop > 0);
    root.classList.toggle("is-cols-m", colsMobile > 0);
    root.style.setProperty("--shm-tc-cols-d", String(colsDesktop || 1));
    root.style.setProperty("--shm-tc-cols-m", String(colsMobile || 1));
    root.classList.add("is-ready");
    if (!total && data && data.inEditor) {
      root.innerHTML = '<p class="shm-tc-empty">Tag Cloud: add at least one group with tags (one tag per line) in the Content editor.</p>';
    }
  }
  return __toCommonJS(tag_cloud_index_exports);
})();
(function(){
  var reg = (typeof window !== 'undefined' && window.__shazWidgetExport) || {};
  var controller = reg.default || reg;
  if (typeof window !== 'undefined') {
    window.ShazammeWidget = window.ShazammeWidget || {};
    window.ShazammeWidget["tag-cloud"] = controller;
    window.__shazWidgetExport = void 0;
  }
})();

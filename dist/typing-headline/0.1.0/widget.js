/* shazamme-widgets — shazamme-widgets v0.1.0
 * Build 46c5db363075. Registers window.ShazammeWidget["<name>"].
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

  // dist/.gen/typing-headline.index.js
  var typing_headline_index_exports = {};
  __export(typing_headline_index_exports, {
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

  // dist/.gen/typing-headline.index.js
  function legacyController(ctx) {
    ensureScriptLoader();
    var data = ctx.data, element = ctx.element, $ = ctx.$ || window.jQuery || window.$, shazamme = ctx.shazamme || window.shazamme;
    var cfg = data && data.config || {};
    var root = element.querySelector(".shm-ty");
    if (!root) {
      return;
    }
    var previousStop = root.__shmTyStop || element.__shmTyStop;
    if (typeof previousStop === "function") {
      previousStop();
    }
    var HEADING_TAGS = ["h1", "h2", "h3", "h4"];
    var RESIZE_DEBOUNCE_MS = 150;
    var PAUSE_POLL_MS = 150;
    var BETWEEN_WORDS_MS = 250;
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
    function shortHash(text) {
      var h = 5381;
      for (var i = 0; i < text.length; i++) {
        h = (h << 5) + h + text.charCodeAt(i) | 0;
      }
      return String(h);
    }
    function splitGraphemes(text) {
      if (window.Intl && Intl.Segmenter) {
        var out = [];
        var iterator = new Intl.Segmenter(void 0, { granularity: "grapheme" }).segment(text)[Symbol.iterator]();
        var step = iterator.next();
        while (!step.done) {
          out.push(step.value.segment);
          step = iterator.next();
        }
        return out;
      }
      return Array.from(text);
    }
    var wordEl = root.querySelector(".shm-ty-word");
    var heading = root.querySelector(".shm-ty-heading");
    var leadEl = root.querySelector(".shm-ty-lead");
    if (!wordEl || !heading || !leadEl) {
      return;
    }
    var words = [];
    var stored = root.getAttribute("data-shm-words");
    var rawText = wordEl.textContent;
    var isProcessed = wordEl.getAttribute("data-shm-typed") === "1" && !/[\r\n]/.test(rawText);
    var isFreshList = !isProcessed && stored && root.getAttribute("data-shm-hash") !== shortHash(rawText);
    if (stored && !isFreshList && (isProcessed || root.getAttribute("data-shm-hash") === shortHash(rawText))) {
      try {
        words = JSON.parse(stored);
      } catch (e) {
        words = [];
      }
    }
    if (!Array.isArray(words) || !words.length) {
      words = rawText.split(/\r?\n/).map(function(w) {
        return w.trim();
      }).filter(Boolean);
      if (words.length) {
        root.setAttribute("data-shm-words", JSON.stringify(words));
        root.setAttribute("data-shm-hash", shortHash(rawText));
      }
    }
    wordEl.setAttribute("data-shm-typed", "1");
    if (!words.length) {
      if (data && data.inEditor) {
        wordEl.textContent = "[add words in the Content editor, one per line]";
        wordEl.classList.add("shm-ty-empty");
      }
      root.classList.add("is-ready");
      return;
    }
    var chars = words.map(splitGraphemes);
    var loop = toBool(cfg.loop, true);
    var typeSpeed = toInt(cfg.typeSpeed, 50, 10, 1e3);
    var deleteSpeed = toInt(cfg.deleteSpeed, 25, 0, 1e3);
    var pauseMs = toInt(cfg.pauseMs, 1500, 200, 2e4);
    var motionQuery = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;
    var wantCursor = toBool(cfg.showCursor, true);
    var outlined = toBool(cfg.outlined, false);
    var reserveSpace = toBool(cfg.reserveSpace, true);
    var showPauseButton = toBool(cfg.showPauseButton, true);
    var tag = String(cfg.headingTag || "h2").toLowerCase();
    if (HEADING_TAGS.indexOf(tag) === -1) {
      tag = "h2";
    }
    var fsDesktop = toInt(cfg.fontSizeDesktop, 0, 0, 400);
    var fsMobile = toInt(cfg.fontSizeMobile, 0, 0, 400);
    if (fsDesktop) {
      root.style.setProperty("--shm-ty-fs-d", fsDesktop + "px");
    }
    if (fsMobile) {
      root.style.setProperty("--shm-ty-fs-m", fsMobile + "px");
    }
    var cursorColor = String(cfg.cursorColor || "").trim();
    if (cursorColor && window.CSS && CSS.supports && CSS.supports("color", cursorColor)) {
      root.style.setProperty("--shm-ty-cursor", cursorColor);
    }
    root.classList.toggle("is-outlined", outlined);
    if (heading.tagName.toLowerCase() !== tag) {
      var swap = document.createElement(tag);
      swap.className = heading.className;
      while (heading.firstChild) {
        swap.appendChild(heading.firstChild);
      }
      heading.parentNode.replaceChild(swap, heading);
      heading = swap;
    }
    var lead = leadEl.textContent.replace(/\s+/g, " ").trim();
    heading.setAttribute("aria-label", (lead + " " + words[0]).trim());
    var index = 0;
    var pos = chars[0].length;
    var timer = null;
    var resizeTimer = null;
    var stopped = false;
    var hoverPaused = false;
    var focusPaused = false;
    var userPaused = false;
    var lastWidth = -1;
    var lastFontSize = "";
    var pauseButton = null;
    var resizeObserver = null;
    var breakpointQuery = window.matchMedia ? window.matchMedia("(min-width: 768px)") : null;
    function alive() {
      return !stopped && root.isConnected !== false;
    }
    function show(text) {
      wordEl.textContent = text || "\u200B";
    }
    function later(fn, ms) {
      timer = setTimeout(function() {
        tick(fn);
      }, ms);
    }
    function tick(fn) {
      if (!alive()) {
        return;
      }
      if (hoverPaused || focusPaused || userPaused) {
        timer = setTimeout(function() {
          tick(fn);
        }, PAUSE_POLL_MS);
        return;
      }
      fn();
    }
    function startDeleting() {
      if (deleteSpeed === 0) {
        pos = 0;
        show("");
        later(nextWord, BETWEEN_WORDS_MS);
        return;
      }
      if (pos > 0) {
        pos -= 1;
        show(chars[index].slice(0, pos).join(""));
        later(startDeleting, deleteSpeed);
        return;
      }
      later(nextWord, BETWEEN_WORDS_MS);
    }
    function nextWord() {
      index = (index + 1) % words.length;
      pos = 0;
      typeWord();
    }
    function typeWord() {
      if (pos < chars[index].length) {
        pos += 1;
        show(chars[index].slice(0, pos).join(""));
        later(typeWord, typeSpeed);
        return;
      }
      if (!loop && index === words.length - 1) {
        return;
      }
      later(startDeleting, pauseMs);
    }
    function reserveHeight() {
      var width = heading.getBoundingClientRect().width;
      if (!width) {
        return;
      }
      lastFontSize = window.getComputedStyle(heading).fontSize;
      heading.style.minHeight = "";
      var probe = heading.cloneNode(true);
      probe.removeAttribute("aria-label");
      probe.style.cssText += ";position:absolute;left:0;top:0;visibility:hidden;pointer-events:none;margin:0;width:" + width + "px";
      var probeWord = probe.querySelector(".shm-ty-word");
      root.appendChild(probe);
      var tallest = 0;
      for (var i = 0; i < words.length; i++) {
        probeWord.textContent = words[i];
        tallest = Math.max(tallest, probe.getBoundingClientRect().height);
      }
      root.removeChild(probe);
      heading.style.minHeight = Math.ceil(tallest) + "px";
    }
    function onResize() {
      if (!alive()) {
        teardown();
        return;
      }
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function() {
        if (!alive()) {
          teardown();
          return;
        }
        var width = root.getBoundingClientRect().width;
        var fontSize = window.getComputedStyle(heading).fontSize;
        if (width === lastWidth && fontSize === lastFontSize) {
          return;
        }
        lastWidth = width;
        reserveHeight();
      }, RESIZE_DEBOUNCE_MS);
    }
    function onPointerEnter(ev) {
      if (ev.pointerType !== "touch") {
        hoverPaused = true;
      }
    }
    function onPointerLeave() {
      hoverPaused = false;
    }
    function onFocusIn(ev) {
      if (ev.target !== pauseButton) {
        focusPaused = true;
      }
    }
    function onFocusOut(ev) {
      if (!root.contains(ev.relatedTarget)) {
        focusPaused = false;
      }
    }
    function setUserPaused(value) {
      userPaused = value;
      if (!pauseButton) {
        return;
      }
      pauseButton.setAttribute("aria-pressed", value ? "true" : "false");
    }
    function onPauseClick() {
      setUserPaused(!userPaused);
    }
    function buildPauseButton() {
      var old = root.querySelector(".shm-ty-pause");
      if (old) {
        old.parentNode.removeChild(old);
      }
      pauseButton = null;
      if (!showPauseButton) {
        return;
      }
      pauseButton = document.createElement("button");
      pauseButton.type = "button";
      pauseButton.className = "shm-ty-pause";
      pauseButton.textContent = "Pause animation";
      root.appendChild(pauseButton);
      pauseButton.addEventListener("click", onPauseClick);
      setUserPaused(false);
    }
    function applyMotion() {
      clearTimeout(timer);
      var reduce = !!(motionQuery && motionQuery.matches);
      root.classList.toggle("has-cursor", wantCursor && !reduce);
      index = 0;
      pos = chars[0].length;
      show(words[0]);
      var animated = !reduce && words.length > 1;
      if (pauseButton) {
        pauseButton.hidden = !animated;
      }
      if (animated) {
        later(startDeleting, pauseMs);
      }
    }
    function onMotionChange() {
      if (alive()) {
        applyMotion();
      }
    }
    function teardown() {
      stopped = true;
      clearTimeout(timer);
      clearTimeout(resizeTimer);
      if (resizeObserver) {
        resizeObserver.disconnect();
        resizeObserver = null;
      }
      if (breakpointQuery) {
        if (breakpointQuery.removeEventListener) {
          breakpointQuery.removeEventListener("change", onResize);
        } else if (breakpointQuery.removeListener) {
          breakpointQuery.removeListener(onResize);
        }
      }
      window.removeEventListener("resize", onResize);
      root.removeEventListener("pointerenter", onPointerEnter);
      root.removeEventListener("pointerleave", onPointerLeave);
      root.removeEventListener("pointercancel", onPointerLeave);
      root.removeEventListener("focusin", onFocusIn);
      root.removeEventListener("focusout", onFocusOut);
      if (pauseButton) {
        pauseButton.removeEventListener("click", onPauseClick);
      }
      if (motionQuery) {
        if (motionQuery.removeEventListener) {
          motionQuery.removeEventListener("change", onMotionChange);
        } else if (motionQuery.removeListener) {
          motionQuery.removeListener(onMotionChange);
        }
      }
    }
    root.classList.add("is-ready");
    root.__shmTyStop = teardown;
    element.__shmTyStop = teardown;
    buildPauseButton();
    root.addEventListener("pointerenter", onPointerEnter);
    root.addEventListener("pointerleave", onPointerLeave);
    root.addEventListener("pointercancel", onPointerLeave);
    root.addEventListener("focusin", onFocusIn);
    root.addEventListener("focusout", onFocusOut);
    if (motionQuery) {
      if (motionQuery.addEventListener) {
        motionQuery.addEventListener("change", onMotionChange);
      } else if (motionQuery.addListener) {
        motionQuery.addListener(onMotionChange);
      }
    }
    if (reserveSpace && words.length > 1) {
      lastWidth = root.getBoundingClientRect().width;
      reserveHeight();
      if (window.ResizeObserver) {
        resizeObserver = new ResizeObserver(onResize);
        resizeObserver.observe(root);
        resizeObserver.observe(heading);
      } else {
        window.addEventListener("resize", onResize);
      }
      if (breakpointQuery) {
        if (breakpointQuery.addEventListener) {
          breakpointQuery.addEventListener("change", onResize);
        } else if (breakpointQuery.addListener) {
          breakpointQuery.addListener(onResize);
        }
      }
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(function() {
          if (alive()) {
            reserveHeight();
          }
        });
      }
    }
    applyMotion();
  }
  return __toCommonJS(typing_headline_index_exports);
})();
(function(){
  var reg = (typeof window !== 'undefined' && window.__shazWidgetExport) || {};
  var controller = reg.default || reg;
  if (typeof window !== 'undefined') {
    window.ShazammeWidget = window.ShazammeWidget || {};
    window.ShazammeWidget["typing-headline"] = controller;
    window.__shazWidgetExport = void 0;
  }
})();

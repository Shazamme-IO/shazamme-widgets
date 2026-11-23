/* shazamme-widgets — shazamme-widgets v0.1.0
 * Build 1d1b67faae1a. Registers window.ShazammeWidget["<name>"].
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

  // widgets/flip-cards/index.ts
  var index_exports = {};
  __export(index_exports, {
    default: () => flipCards
  });

  // widgets/flip-cards/interactions.ts
  var CARD = ".shm-fc-card";
  var SCROLL_KEYS = /* @__PURE__ */ new Map([["ArrowDown", 40], ["ArrowUp", -40], ["PageDown", 200], ["PageUp", -200]]);
  var cardOf = (node) => node instanceof Element ? node.closest(CARD) : null;
  var linkOf = (card) => card.querySelector(".shm-fc-link");
  var isFlipped = (card) => card.classList.contains("is-flipped");
  function setFlipped(grid, card, flipped) {
    var _a, _b;
    if (isFlipped(card) === flipped) return;
    if (flipped) closeAll(grid, card);
    card.classList.toggle("is-flipped", flipped);
    (_a = card.querySelector(".shm-fc-front")) == null ? void 0 : _a.setAttribute("aria-hidden", String(flipped));
    (_b = card.querySelector(".shm-fc-back")) == null ? void 0 : _b.setAttribute("aria-hidden", String(!flipped));
  }
  function closeAll(grid, except) {
    grid.querySelectorAll(`${CARD}.is-flipped`).forEach((c) => {
      if (c !== except) setFlipped(grid, c, false);
    });
  }
  function wireFlip(root, grid, hoverFlip) {
    const doc = root.ownerDocument;
    const bound = [];
    const on = (target, type, fn) => {
      target.addEventListener(type, fn);
      bound.push([target, type, fn]);
    };
    const teardown = () => {
      bound.splice(0).forEach(([target, type, fn]) => target.removeEventListener(type, fn));
    };
    let pointerType = "mouse";
    let pointerFocus = false;
    let lastInput = "pointer";
    on(root, "pointerdown", (e) => {
      pointerType = e.pointerType || "mouse";
      pointerFocus = true;
      lastInput = "pointer";
    });
    on(root, "keydown", (e) => {
      var _a;
      pointerFocus = false;
      lastInput = "key";
      const card = cardOf(e.target);
      if (!card) return;
      if (e.key === "Escape" || e.key === "Esc") {
        setFlipped(grid, card, false);
        if (e.target !== card) card.focus();
        return;
      }
      if (e.target !== card) return;
      if (e.key === "Enter") {
        const link = linkOf(card);
        if (isFlipped(card) && link) link.click();
        else setFlipped(grid, card, true);
        e.preventDefault();
      } else if (e.key === " " || e.key === "Spacebar") {
        setFlipped(grid, card, !isFlipped(card));
        e.preventDefault();
      } else if (isFlipped(card) && SCROLL_KEYS.has(e.key)) {
        const body = card.querySelector(".shm-fc-back-body");
        if (body && body.scrollHeight > body.clientHeight) {
          body.scrollTop += (_a = SCROLL_KEYS.get(e.key)) != null ? _a : 0;
          e.preventDefault();
        }
      }
    });
    on(root, "focusin", (e) => {
      const card = cardOf(e.target);
      if (card && e.target === card && !pointerFocus) setFlipped(grid, card, true);
    });
    on(root, "focusout", (e) => {
      const card = cardOf(e.target);
      const next = e.relatedTarget;
      if (card && !(next instanceof Node && card.contains(next))) setFlipped(grid, card, false);
    });
    on(root, "pointerover", (e) => {
      const card = cardOf(e.target);
      if (card && hoverFlip && e.pointerType === "mouse") setFlipped(grid, card, true);
    });
    on(root, "pointerout", (e) => {
      const card = cardOf(e.target);
      const next = e.relatedTarget;
      if (!card || !hoverFlip || e.pointerType !== "mouse" || next instanceof Node && card.contains(next)) return;
      if (lastInput === "key" && card.contains(doc.activeElement)) return;
      setFlipped(grid, card, false);
    });
    on(root, "click", (e) => {
      pointerFocus = false;
      const card = cardOf(e.target);
      if (!card) return;
      const link = linkOf(card);
      const flipped = isFlipped(card);
      const onLink = e.target instanceof Element && !!e.target.closest(".shm-fc-link");
      if (flipped && link) {
        if (!onLink) link.click();
        return;
      }
      if (onLink) e.preventDefault();
      const clickType = "pointerType" in e && e.pointerType || (e.detail === 0 ? "synthetic" : pointerType);
      if (flipped && clickType === "mouse" && hoverFlip) return;
      setFlipped(grid, card, !flipped);
    });
    on(doc, "pointerdown", (e) => {
      if (!root.isConnected) return teardown();
      if (!(e.target instanceof Node) || !root.contains(e.target)) closeAll(grid, null);
    });
    return teardown;
  }
  function watchReducedMotion(root, fadeSetting) {
    var _a, _b;
    const query = (_b = (_a = root.ownerDocument.defaultView) == null ? void 0 : _a.matchMedia) == null ? void 0 : _b.call(_a, "(prefers-reduced-motion: reduce)");
    if (!query) return () => void 0;
    const apply = () => root.classList.toggle("is-fade", fadeSetting || query.matches);
    apply();
    if (query.addEventListener) query.addEventListener("change", apply);
    else query.addListener(apply);
    return () => {
      if (query.removeEventListener) query.removeEventListener("change", apply);
      else query.removeListener(apply);
    };
  }

  // widgets/flip-cards/render.ts
  var ESCAPES = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
  var esc = (s) => s.replace(/[&<>"']/g, (c) => ESCAPES[c]);
  function cardHtml(c, index, s) {
    const name = c.title || c.backHeading || `Card ${index + 1}`;
    const target = s.newTab && !/^(mailto|tel):/i.test(c.link) ? ' target="_blank" rel="noopener noreferrer"' : "";
    const tag = s.headingTag;
    let front = "";
    if (c.image) front += `<img class="shm-fc-img" src="${esc(c.image)}" alt="${esc(c.alt)}" loading="lazy" decoding="async">`;
    front += '<div class="shm-fc-overlay"></div>';
    if (c.title || c.frontLine) {
      front += '<div class="shm-fc-caption">';
      if (c.title) front += `<${tag} class="shm-fc-title">${esc(c.title)}</${tag}>`;
      if (c.frontLine) front += `<p class="shm-fc-line">${esc(c.frontLine)}</p>`;
      front += "</div>";
    }
    if (s.flipStyle === "none") {
      if (c.link) front += `<a class="shm-fc-link" href="${esc(c.link)}" aria-label="${esc(name)}"${target}></a>`;
      return `<div class="shm-fc-card"><div class="shm-fc-inner"><div class="shm-fc-face shm-fc-front">${front}</div></div></div>`;
    }
    let back = '<div class="shm-fc-back-body"><div class="shm-fc-back-content">';
    if (c.backHeading) back += `<${tag} class="shm-fc-back-heading">${esc(c.backHeading)}</${tag}>`;
    if (c.backText) back += `<p class="shm-fc-back-text">${esc(c.backText)}</p>`;
    if (c.link && c.buttonText) {
      back += `<a class="shm-fc-link shm-fc-button" href="${esc(c.link)}"${target} tabindex="-1">${esc(c.buttonText)}</a>`;
    } else if (c.link) {
      back += `<a class="shm-fc-link" href="${esc(c.link)}" aria-label="${esc(name)}"${target} tabindex="-1"></a>`;
    }
    back += "</div></div>";
    return `<div class="shm-fc-card" tabindex="0" role="group" aria-roledescription="flip card" aria-label="${esc(name)}"><div class="shm-fc-inner"><div class="shm-fc-face shm-fc-front" aria-hidden="false">${front}</div><div class="shm-fc-face shm-fc-back" aria-hidden="true">${back}</div></div></div>`;
  }
  var cardsHtml = (s) => s.cards.map((c, i) => cardHtml(c, i, s)).join("");

  // widgets/flip-cards/settings.ts
  var FLIP_STYLES = ["flip", "fade", "none"];
  var HEIGHT_MODES = ["fixed", "min", "aspect"];
  var HEADING_TAGS = ["h2", "h3", "h4", "h5", "p", "div"];
  var ASPECTS = ["1:1", "4:3", "3:2", "16:9", "5:4", "4:5", "3:4", "2:3", "9:16"];
  var CARD_FIELDS = ["image", "alt", "title", "frontLine", "backHeading", "backText", "link", "buttonText"];
  var MAX_COLUMNS = 6;
  var MAX_CARDS = 60;
  var BREAKPOINTS = [
    { key: "d", name: "Desktop", columns: 3, gap: 24, mode: "aspect", height: 380 },
    { key: "t", name: "Tablet", columns: 2, gap: 20, mode: "aspect", height: 340 },
    { key: "m", name: "Mobile", columns: 1, gap: 16, mode: "min", height: 320 }
  ];
  function toBool(v, fallback) {
    if (v === true || v === "true") return true;
    if (v === false || v === "false") return false;
    return fallback;
  }
  function toInt(v, fallback, min, max) {
    const n = parseInt(String(v), 10);
    return Number.isNaN(n) ? fallback : Math.max(min, Math.min(max, n));
  }
  function choice(v, allowed, fallback) {
    const s = String(v != null ? v : "").trim().toLowerCase();
    return allowed.includes(s) ? s : fallback;
  }
  function text(v) {
    if (v == null) return "";
    if (typeof v === "object") {
      const o = v;
      return text(o.url || o.src || o.href || o.link || "");
    }
    return String(v).trim();
  }
  function safeUrl(v) {
    const s = text(v);
    if (!s || /[\u0000-\u001f\u007f]/.test(s)) return "";
    if (/^[/\\]{2}/.test(s) || s.startsWith("\\")) return "";
    if (/^[a-z][a-z0-9+.-]*:/i.test(s)) return /^(https?|mailto|tel):/i.test(s) ? s : "";
    return s;
  }
  function listFrom(v) {
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
  function normaliseCards(list) {
    const out = [];
    for (const item of list) {
      if (out.length >= MAX_CARDS) break;
      const raw = item != null ? item : {};
      const card = {
        image: safeUrl(raw.image),
        alt: text(raw.alt),
        title: text(raw.title),
        frontLine: text(raw.frontLine),
        backHeading: text(raw.backHeading),
        backText: text(raw.backText),
        link: safeUrl(raw.link),
        buttonText: text(raw.buttonText)
      };
      if (card.image || card.title || card.frontLine || card.backHeading || card.backText) out.push(card);
    }
    return out;
  }
  function cardsFromDom(root) {
    return [...root.querySelectorAll(".shm-fc-src")].map((src) => {
      var _a, _b;
      const item = {};
      for (const f of CARD_FIELDS) item[f] = (_b = (_a = src.querySelector(`[data-f="${f}"]`)) == null ? void 0 : _a.textContent) != null ? _b : "";
      return item;
    });
  }
  function readSettings(config, root) {
    let cards = normaliseCards(listFrom(config.cards));
    if (!cards.length) cards = normaliseCards(cardsFromDom(root));
    const corner = (key) => toInt(config[key], 16, 0, 400);
    return {
      cards,
      flipStyle: choice(config.flipStyle, FLIP_STYLES, "flip"),
      vertical: choice(config.flipDirection, ["horizontal", "vertical"], "horizontal") === "vertical",
      hoverFlip: toBool(config.flipOnHover, true),
      newTab: toBool(config.openInNewTab, false),
      headingTag: choice(config.headingTag, HEADING_TAGS, "h3"),
      fillColumn: toBool(config.fillColumn, false),
      stretchLastRow: toBool(config.stretchLastRow, false),
      speedMs: toInt(config.flipSpeed, 600, 0, 3e3),
      radius: [corner("radiusTopLeft"), corner("radiusTopRight"), corner("radiusBottomRight"), corner("radiusBottomLeft")],
      breakpoints: BREAKPOINTS.map((bp) => ({
        key: bp.key,
        columns: toInt(config[`columns${bp.name}`], bp.columns, 1, MAX_COLUMNS),
        gap: toInt(config[`gap${bp.name}`], bp.gap, 0, 120),
        mode: choice(config[`heightMode${bp.name}`], HEIGHT_MODES, bp.mode),
        height: toInt(config[`height${bp.name}`], bp.height, 80, 1600),
        aspect: choice(config[`aspect${bp.name}`], ASPECTS, "4:5")
      }))
    };
  }

  // widgets/flip-cards/index.ts
  var EMPTY_MESSAGE = '<p class="shm-fc-empty">Flip Cards: add at least one card (photo, title and back text) in the Content editor.</p>';
  var teardowns = /* @__PURE__ */ new WeakMap();
  function applyLayout(root, s) {
    for (const bp of s.breakpoints) {
      let height = "auto";
      let minHeight = "0px";
      let ratio = "auto";
      if (bp.mode === "fixed") {
        if (s.fillColumn) minHeight = `${bp.height}px`;
        else height = `${bp.height}px`;
      } else if (bp.mode === "min") {
        minHeight = `${bp.height}px`;
      } else {
        ratio = bp.aspect.replace(":", " / ");
      }
      root.style.setProperty(`--shm-fc-cols-${bp.key}`, String(bp.columns));
      root.style.setProperty(`--shm-fc-gap-${bp.key}`, `${bp.gap}px`);
      root.style.setProperty(`--shm-fc-h-${bp.key}`, height);
      root.style.setProperty(`--shm-fc-minh-${bp.key}`, minHeight);
      root.style.setProperty(`--shm-fc-ar-${bp.key}`, ratio);
    }
    root.style.setProperty("--shm-fc-radius", s.radius.map((r) => `${r}px`).join(" "));
    root.style.setProperty("--shm-fc-speed", `${s.speedMs}ms`);
    root.classList.toggle("is-vertical", s.vertical);
    root.classList.toggle("is-noflip", s.flipStyle === "none");
    root.classList.toggle("is-fill", s.fillColumn);
    root.classList.toggle("is-stretch", s.stretchLastRow);
  }
  function flipCards({ element, data }) {
    var _a, _b;
    (_a = teardowns.get(element)) == null ? void 0 : _a();
    teardowns.delete(element);
    const root = element.querySelector(".shm-flip-cards");
    const grid = root == null ? void 0 : root.querySelector(".shm-fc-grid");
    if (!root || !grid) return;
    const settings = readSettings((_b = data == null ? void 0 : data.config) != null ? _b : {}, root);
    applyLayout(root, settings);
    root.classList.toggle("is-fade", settings.flipStyle === "fade");
    if (!settings.cards.length) {
      grid.innerHTML = (data == null ? void 0 : data.inEditor) ? EMPTY_MESSAGE : "";
    } else {
      grid.innerHTML = cardsHtml(settings);
      const stops = [watchReducedMotion(root, settings.flipStyle === "fade")];
      if (settings.flipStyle !== "none") stops.push(wireFlip(root, grid, settings.hoverFlip));
      teardowns.set(element, () => stops.forEach((stop) => stop()));
    }
    root.classList.add("is-ready");
  }
  return __toCommonJS(index_exports);
})();
(function(){
  var reg = (typeof window !== 'undefined' && window.__shazWidgetExport) || {};
  var controller = reg.default || reg;
  if (typeof window !== 'undefined') {
    window.ShazammeWidget = window.ShazammeWidget || {};
    window.ShazammeWidget["flip-cards"] = controller;
    window.__shazWidgetExport = void 0;
  }
})();

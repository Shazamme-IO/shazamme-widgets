/* shazamme-widgets — shazamme-widgets v0.1.0
 * Build 736b147b7b1e. Registers window.ShazammeWidget["<name>"].
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

  // widgets/testimonials-2026/index.ts
  var index_exports = {};
  __export(index_exports, {
    default: () => testimonials2026
  });

  // widgets/testimonials-2026/settings.ts
  var LIMITS = {
    columns: { min: 1, max: 4 },
    maxTestimonials: { min: 0, max: 200 },
    pageSize: { min: 0, max: 100 },
    quoteLines: { min: 0, max: 30 },
    autoplaySeconds: { min: 2, max: 60 }
  };
  var LAYOUTS = ["slider", "grid", "list", "featured"];
  var SORTS = ["newest", "oldest", "random", "manual"];
  var READ_MORE = ["expand", "dialog", "off"];
  var PAGINATIONS = ["dots", "avatars", "none"];
  var DATE_FORMATS = ["long", "month-year", "year"];
  var BUSINESS_TYPES = ["Organization", "LocalBusiness", "EmploymentAgency"];
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
  function splitTags(v) {
    if (typeof v !== "string") return [];
    const seen = /* @__PURE__ */ new Set();
    for (const part of v.split(/[,;|]/)) {
      const t = part.trim().toLowerCase();
      if (t) seen.add(t);
    }
    return Array.from(seen);
  }
  function readSettings(config) {
    const c = config && typeof config === "object" ? config : {};
    const businessType = toText(c.schemaBusinessType);
    const pagination = toChoice(c.pagination, PAGINATIONS, "dots");
    const arrows = toBool(c.arrows, true) || pagination === "none";
    return {
      siteId: toText(c.siteId),
      tags: splitTags(c.tags),
      consultantId: toText(c.consultantID).toLowerCase(),
      sortOrder: toChoice(c.sortOrder, SORTS, "newest"),
      maxTestimonials: toInt(c.maxTestimonials, 0, LIMITS.maxTestimonials.min, LIMITS.maxTestimonials.max),
      layout: toChoice(c.testimonialLayout, LAYOUTS, "slider"),
      columnsDesktop: toInt(c.columnsDesktop, 3, LIMITS.columns.min, LIMITS.columns.max),
      columnsTablet: toInt(c.columnsTablet, 2, LIMITS.columns.min, LIMITS.columns.max),
      columnsMobile: toInt(c.columnsMobile, 1, LIMITS.columns.min, LIMITS.columns.max),
      heading: toText(c.heading),
      intro: toText(c.intro),
      headingLevel: toInt(c.headingLevel, 2, 1, 6),
      ariaLabel: toText(c.ariaLabel, "Client testimonials") || "Client testimonials",
      pageSize: toInt(c.pageSize, 6, LIMITS.pageSize.min, LIMITS.pageSize.max),
      showTagFilter: toBool(c.showTagFilter, false),
      allTagsLabel: toText(c.allTagsLabel, "All") || "All",
      loadMoreText: toText(c.loadMoreText, "Show more") || "Show more",
      showPhoto: toBool(c.showPhoto, true),
      showQuoteMark: toBool(c.showQuoteMark, true),
      showRating: toBool(c.showRating, true),
      showPosition: toBool(c.showPosition, true),
      showCompany: toBool(c.showCompany, true),
      showDate: toBool(c.showDate, false),
      dateFormat: toChoice(c.dateFormat, DATE_FORMATS, "month-year"),
      showConsultant: toBool(c.showConsultant, false),
      linkConsultant: toBool(c.linkConsultant, true),
      consultantLabel: toText(c.consultantLabel, "Consultant"),
      quoteLines: toInt(c.quoteLines, 6, LIMITS.quoteLines.min, LIMITS.quoteLines.max),
      readMore: toChoice(c.readMore, READ_MORE, "dialog"),
      readMoreText: toText(c.readMoreText, "Read more") || "Read more",
      readLessText: toText(c.readLessText, "Read less") || "Read less",
      autoplay: toBool(c.autoplay, false),
      autoplaySeconds: toInt(c.autoplaySeconds, 6, LIMITS.autoplaySeconds.min, LIMITS.autoplaySeconds.max),
      loop: toBool(c.loop, true),
      arrows,
      pagination,
      schemaEnabled: toBool(c.schemaEnabled, false),
      schemaBusinessName: toText(c.schemaBusinessName),
      schemaBusinessType: BUSINESS_TYPES.includes(businessType) ? businessType : "Organization"
    };
  }

  // widgets/testimonials-2026/data.ts
  var MAX_RATING = 5;
  var RATING_KEYS = ["rating", "testimonialRating", "starRating", "stars"];
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
    const spaced = html.replace(/<\s*br\s*\/?>/gi, "\n").replace(/<\/\s*(p|div|li|h[1-6])\s*>/gi, "\n\n");
    const doc = new DOMParser().parseFromString(spaced, "text/html");
    doc.querySelectorAll("script, style").forEach((el) => el.remove());
    return ((_a = doc.body.textContent) != null ? _a : "").replace(/\n{3,}/g, "\n\n").trim();
  }
  function parseRating(row) {
    for (const key of RATING_KEYS) {
      const raw = row[key];
      if (raw === null || raw === void 0 || raw === "") continue;
      const n = typeof raw === "number" ? raw : parseFloat(String(raw));
      if (Number.isFinite(n) && n > 0 && n <= MAX_RATING) return Math.round(n * 10) / 10;
    }
    return null;
  }
  function parseDate(v) {
    if (typeof v !== "string" && typeof v !== "number") return null;
    const ms = typeof v === "number" ? v : Date.parse(v);
    return Number.isFinite(ms) ? ms : null;
  }
  function rowData(entry) {
    if (!entry || typeof entry !== "object") return null;
    const e = entry;
    const inner = e.data;
    return inner && typeof inner === "object" ? inner : e;
  }
  function normalise(entries) {
    if (!Array.isArray(entries)) return [];
    const out = [];
    entries.forEach((entry, index) => {
      const row = rowData(entry);
      if (!row) return;
      const quote = plainText(row.content) || plainText(row.metaDescription);
      if (!quote) return;
      const labels = toText(row.tags).split(/[,;|]/).map((t) => t.trim()).filter(Boolean);
      out.push({
        id: toText(row.testimonialID, `row-${index}`) || `row-${index}`,
        quote,
        name: plainText(row.who) || plainText(row.testimonialName) || "Anonymous",
        position: plainText(row.position),
        company: plainText(row.company),
        photo: safeUrl(row.photoURL),
        dateMs: parseDate(row.testimonialDate),
        tags: labels.map((t) => t.toLowerCase()),
        tagLabels: labels,
        consultantId: toText(row.consultantID).toLowerCase(),
        rating: parseRating(row),
        order: index
      });
    });
    return out;
  }
  function normaliseConsultants(entries) {
    const map = /* @__PURE__ */ new Map();
    if (!Array.isArray(entries)) return map;
    for (const entry of entries) {
      const row = rowData(entry);
      if (!row) continue;
      const id = toText(row.consultantID).toLowerCase();
      if (!id) continue;
      const name = [plainText(row.firstName), plainText(row.lastName)].filter(Boolean).join(" ");
      let path = "";
      const url = safeUrl(row.consultantURL);
      if (url) {
        try {
          path = url.startsWith("/") ? url : new URL(url).pathname;
        } catch (e) {
          path = "";
        }
      }
      map.set(id, { id, name, photo: safeUrl(row.photoURL), path });
    }
    return map;
  }
  function filterTestimonials(items, s) {
    return items.filter((t) => {
      if (s.consultantId && t.consultantId !== s.consultantId) return false;
      if (s.tags.length === 0) return true;
      return t.tags.some((tag) => s.tags.includes(tag));
    });
  }
  function shuffled(items, random) {
    const a = items.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  function sortTestimonials(items, order, random = Math.random) {
    if (order === "random") return shuffled(items, random);
    if (order === "manual") return items.slice().sort((a, b) => a.order - b.order);
    const dir = order === "oldest" ? 1 : -1;
    return items.slice().sort((a, b) => {
      if (a.dateMs === null && b.dateMs === null) return a.order - b.order;
      if (a.dateMs === null) return 1;
      if (b.dateMs === null) return -1;
      return a.dateMs === b.dateMs ? a.order - b.order : (a.dateMs - b.dateMs) * dir;
    });
  }
  function limitTestimonials(items, max) {
    return max > 0 ? items.slice(0, max) : items;
  }
  function selectTestimonials(entries, s, random) {
    const filtered = filterTestimonials(normalise(entries), s);
    return limitTestimonials(sortTestimonials(filtered, s.sortOrder, random), s.maxTestimonials);
  }
  function distinctTags(items) {
    const seen = /* @__PURE__ */ new Map();
    for (const t of items) t.tags.forEach((key, i) => {
      if (!seen.has(key)) seen.set(key, t.tagLabels[i]);
    });
    return Array.from(seen, ([key, label]) => ({ key, label }));
  }
  function loadRows(sdk, collection, siteId, inEditor) {
    var _a;
    if (typeof sdk.fetch !== "function") return Promise.reject(new Error("The Shazamme SDK did not load."));
    const win = window;
    const cache = win.__shmTmFetch = (_a = win.__shmTmFetch) != null ? _a : {};
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

  // widgets/testimonials-2026/carousel.ts
  var RESIZE_DEBOUNCE_MS = 120;
  var SCROLL_SETTLE_PX = 2;
  var SCROLL_GIVE_UP_MS = 900;
  var PAUSE_LABEL = "Pause testimonials";
  var PLAY_LABEL = "Play testimonials";
  function prefersReducedMotion() {
    return typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }
  function isKeyboardFocus(target) {
    if (!(target instanceof Element)) return true;
    try {
      return target.matches(":focus-visible");
    } catch (e) {
      return true;
    }
  }
  function mountCarousel(opts) {
    const { root, loop, reducedMotion } = opts;
    const track = root.querySelector(".shm-tm-track");
    const slides = Array.from(root.querySelectorAll(".shm-tm-slide"));
    const prev = root.querySelector(".shm-tm-prev");
    const next = root.querySelector(".shm-tm-next");
    const pauseBtn = root.querySelector(".shm-tm-pause");
    const dots = Array.from(root.querySelectorAll(".shm-tm-dot"));
    const controls = root.querySelector(".shm-tm-controls");
    const ac = new AbortController();
    const { signal } = ac;
    const total = slides.length;
    const autoplayMs = reducedMotion ? 0 : opts.autoplayMs;
    if (!track || total === 0) return { goTo: () => void 0, reveal: () => void 0, hold: () => void 0, destroy: () => void 0 };
    const scroller = track;
    let current = 0;
    let perView = 1;
    let userPaused = false;
    let hoverPaused = false;
    let focusPaused = false;
    let offscreen = false;
    let touching = false;
    let held = false;
    let timer;
    let raf = 0;
    let resizeTimer;
    let settleTimer;
    let scrollTarget = null;
    let lastWidth = scroller.clientWidth;
    let destroyed = false;
    const maxIndex = () => Math.max(0, total - perView);
    const pageCount = () => Math.max(1, Math.ceil(total / perView));
    const pageOf = (i) => i >= maxIndex() ? pageCount() - 1 : Math.floor(i / perView);
    const leftOf = (i) => slides[i].offsetLeft - slides[0].offsetLeft;
    function measure() {
      const w = slides[0].offsetWidth;
      perView = w > 0 && scroller.clientWidth > 0 ? Math.max(1, Math.min(total, Math.round(scroller.clientWidth / w))) : 1;
    }
    function setDisabled(btn, off) {
      if (!btn) return;
      btn.setAttribute("aria-disabled", off ? "true" : "false");
      btn.classList.toggle("is-disabled", off);
    }
    function dotLabel(dot, page) {
      if (perView === 1) {
        const name = dot.getAttribute("data-name");
        return name ? `Show testimonial ${page + 1}: ${name}` : `Show testimonial ${page + 1}`;
      }
      const from = page * perView + 1;
      const to = Math.min(total, (page + 1) * perView);
      return `Show testimonials ${from} to ${to}`;
    }
    function paint() {
      const visibleTo = current + perView - 1;
      slides.forEach((slide, i) => {
        const visible = i >= current && i <= visibleTo;
        slide.toggleAttribute("inert", !visible);
        slide.setAttribute("aria-hidden", visible ? "false" : "true");
        slide.classList.toggle("is-active", visible);
      });
      const page = pageOf(current);
      dots.forEach((dot, i) => {
        dot.hidden = i >= pageCount();
        dot.setAttribute("aria-label", dotLabel(dot, i));
        if (i === page) dot.setAttribute("aria-current", "true");
        else dot.removeAttribute("aria-current");
      });
      root.classList.toggle("is-multi", perView > 1);
      setDisabled(prev, !loop && current <= 0);
      setDisabled(next, !loop && current >= maxIndex());
      const scrollable = total > perView;
      if (controls) controls.hidden = !scrollable;
      if (scrollable) scroller.setAttribute("tabindex", "0");
      else scroller.removeAttribute("tabindex");
    }
    function scrollToIndex(i, behavior) {
      const left = leftOf(i);
      scrollTarget = left;
      if (settleTimer) clearTimeout(settleTimer);
      settleTimer = setTimeout(() => {
        scrollTarget = null;
        if (!raf) raf = requestAnimationFrame(syncFromScroll);
      }, SCROLL_GIVE_UP_MS);
      if (typeof scroller.scrollTo === "function") scroller.scrollTo({ left, behavior });
      else scroller.scrollLeft = left;
    }
    function goTo(index, behavior = reducedMotion ? "auto" : "smooth") {
      current = Math.max(0, Math.min(maxIndex(), index));
      scrollToIndex(current, behavior);
      paint();
      restartTimer();
    }
    function step(dir) {
      if (dir === 1) goTo(current >= maxIndex() ? loop ? 0 : current : current + 1);
      else goTo(current <= 0 ? loop ? maxIndex() : 0 : current - 1);
    }
    function syncFromScroll() {
      raf = 0;
      const w = slides[0].offsetWidth;
      if (w <= 0) return;
      if (scrollTarget !== null) {
        if (Math.abs(scroller.scrollLeft - scrollTarget) > SCROLL_SETTLE_PX) return;
        scrollTarget = null;
      }
      const index = Math.max(0, Math.min(maxIndex(), Math.round(scroller.scrollLeft / w)));
      if (index !== current) {
        current = index;
        paint();
        restartTimer();
      }
    }
    function userTookOver() {
      scrollTarget = null;
    }
    function reveal(index) {
      const i = Math.max(0, Math.min(total - 1, index));
      if (i < current || i > current + perView - 1) goTo(i, "auto");
    }
    function canAutoplay() {
      return autoplayMs > 0 && !userPaused && !hoverPaused && !focusPaused && !held && !touching && !offscreen && !document.hidden && total > perView;
    }
    function setLive(running) {
      scroller.setAttribute("aria-live", running ? "off" : "polite");
    }
    function restartTimer() {
      if (timer) clearTimeout(timer);
      timer = void 0;
      const running = canAutoplay();
      setLive(running);
      if (!running) return;
      timer = setTimeout(() => {
        if (!root.isConnected) return destroy();
        if (!loop && current >= maxIndex()) return;
        step(1);
      }, autoplayMs);
    }
    function destroy() {
      if (destroyed) return;
      destroyed = true;
      ac.abort();
      if (timer) clearTimeout(timer);
      if (resizeTimer) clearTimeout(resizeTimer);
      if (settleTimer) clearTimeout(settleTimer);
      if (raf) cancelAnimationFrame(raf);
      io == null ? void 0 : io.disconnect();
      ro == null ? void 0 : ro.disconnect();
    }
    scroller.addEventListener("scroll", () => {
      if (!raf) raf = requestAnimationFrame(syncFromScroll);
    }, { passive: true, signal });
    scroller.addEventListener("wheel", userTookOver, { passive: true, signal });
    scroller.addEventListener("touchstart", () => {
      userTookOver();
      touching = true;
      restartTimer();
    }, { passive: true, signal });
    const touchDone = () => {
      touching = false;
      restartTimer();
    };
    scroller.addEventListener("touchend", touchDone, { passive: true, signal });
    scroller.addEventListener("touchcancel", touchDone, { passive: true, signal });
    prev == null ? void 0 : prev.addEventListener("click", () => {
      if (prev.getAttribute("aria-disabled") !== "true") step(-1);
    }, { signal });
    next == null ? void 0 : next.addEventListener("click", () => {
      if (next.getAttribute("aria-disabled") !== "true") step(1);
    }, { signal });
    dots.forEach((dot, i) => dot.addEventListener("click", () => goTo(Math.min(i * perView, maxIndex())), { signal }));
    scroller.addEventListener("keydown", (e) => {
      if (e.target !== scroller) return;
      if (e.key === "ArrowRight") {
        e.preventDefault();
        step(1);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        step(-1);
      } else if (e.key === "Home") {
        e.preventDefault();
        goTo(0);
      } else if (e.key === "End") {
        e.preventDefault();
        goTo(maxIndex());
      }
    }, { signal });
    const isTouch = (e) => e.pointerType === "touch";
    root.addEventListener("pointerenter", (e) => {
      if (isTouch(e)) return;
      hoverPaused = true;
      restartTimer();
    }, { signal });
    root.addEventListener("pointerleave", (e) => {
      if (isTouch(e)) return;
      hoverPaused = false;
      restartTimer();
    }, { signal });
    root.addEventListener("focusin", (e) => {
      if (!isKeyboardFocus(e.target)) return;
      focusPaused = true;
      restartTimer();
    }, { signal });
    root.addEventListener("focusout", (e) => {
      if (e.relatedTarget instanceof Node && root.contains(e.relatedTarget)) return;
      focusPaused = false;
      restartTimer();
    }, { signal });
    document.addEventListener("visibilitychange", () => root.isConnected ? restartTimer() : destroy(), { signal });
    pauseBtn == null ? void 0 : pauseBtn.addEventListener("click", () => {
      userPaused = !userPaused;
      pauseBtn.setAttribute("aria-label", userPaused ? PLAY_LABEL : PAUSE_LABEL);
      pauseBtn.classList.toggle("is-paused", userPaused);
      restartTimer();
    }, { signal });
    let io;
    if (autoplayMs > 0 && typeof IntersectionObserver === "function") {
      io = new IntersectionObserver((entries) => {
        offscreen = !entries[entries.length - 1].isIntersecting;
        restartTimer();
      });
      io.observe(root);
    }
    let ro;
    if (typeof ResizeObserver === "function") {
      ro = new ResizeObserver(() => {
        if (resizeTimer) clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
          if (scroller.clientWidth === lastWidth) return;
          lastWidth = scroller.clientWidth;
          measure();
          current = Math.min(current, maxIndex());
          scrollToIndex(current, "auto");
          paint();
        }, RESIZE_DEBOUNCE_MS);
      });
      ro.observe(scroller);
    }
    measure();
    paint();
    restartTimer();
    return {
      goTo: (i) => goTo(i),
      reveal,
      hold(on) {
        held = on;
        restartTimer();
      },
      destroy
    };
  }

  // widgets/testimonials-2026/dialog.ts
  var FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"]), input, select, textarea';
  function isUsable(el) {
    return Boolean(el && el.isConnected && !el.closest("[hidden], [inert]"));
  }
  var lock = null;
  function lockPage(host) {
    const body = document.body;
    if (lock) {
      lock.open += 1;
      return;
    }
    const behind = Array.from(body.children).filter((el) => el instanceof HTMLElement && el !== host && !el.hasAttribute("inert"));
    lock = { behind, overflow: body.style.overflow, padding: body.style.paddingRight, open: 1 };
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;
    behind.forEach((el) => el.setAttribute("inert", ""));
    body.style.overflow = "hidden";
    if (scrollbar > 0) body.style.paddingRight = `${scrollbar}px`;
  }
  function unlockPage() {
    if (!lock) return;
    lock.open -= 1;
    if (lock.open > 0) return;
    lock.behind.forEach((el) => el.removeAttribute("inert"));
    document.body.style.overflow = lock.overflow;
    document.body.style.paddingRight = lock.padding;
    lock = null;
  }
  function openDialog(html, { trigger, fallback, beforeFocus, onClosed }) {
    var _a;
    const host = document.createElement("div");
    host.className = "shm-tm-dialog";
    host.innerHTML = html;
    document.body.appendChild(host);
    lockPage(host);
    const panel = host.querySelector(".shm-tm-dialog-panel");
    const closeBtn = host.querySelector(".shm-tm-dialog-close");
    let closed = false;
    const focusables = () => Array.from(host.querySelectorAll(FOCUSABLE)).filter((el) => !el.hasAttribute("hidden"));
    function close(restoreFocus = true) {
      if (closed) return;
      closed = true;
      document.removeEventListener("keydown", onKey, true);
      host.remove();
      unlockPage();
      if (restoreFocus) beforeFocus == null ? void 0 : beforeFocus();
      const target = restoreFocus ? isUsable(trigger) ? trigger : isUsable(fallback) ? fallback : null : null;
      if (target) {
        if (!target.matches("button, a[href], [tabindex]")) target.setAttribute("tabindex", "-1");
        target.focus();
      }
      onClosed == null ? void 0 : onClosed();
    }
    function onKey(e) {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        close();
        return;
      }
      if (e.key !== "Tab") return;
      const items = focusables();
      if (items.length === 0) {
        e.preventDefault();
        panel == null ? void 0 : panel.focus();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      const outside = !host.contains(active) || active === panel;
      if (e.shiftKey && (active === first || outside)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (active === last || outside)) {
        e.preventDefault();
        first.focus();
      }
    }
    host.addEventListener("click", (e) => {
      const target = e.target;
      if (target.closest(".shm-tm-dialog-close") || target.hasAttribute("data-close")) close();
    });
    document.addEventListener("keydown", onKey, true);
    panel == null ? void 0 : panel.setAttribute("tabindex", "-1");
    (_a = closeBtn != null ? closeBtn : panel) == null ? void 0 : _a.focus();
    return { close };
  }

  // widgets/testimonials-2026/render.ts
  function esc(v) {
    return String(v != null ? v : "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  function initials(name) {
    var _a, _b, _c;
    const words = name.trim().split(/\s+/).filter(Boolean);
    const first = (_b = Array.from((_a = words[0]) != null ? _a : "")[0]) != null ? _b : "";
    const last = words.length > 1 ? (_c = Array.from(words[words.length - 1])[0]) != null ? _c : "" : "";
    return (first + last).toUpperCase() || "?";
  }
  var STAR_ROW = "\u2605\u2605\u2605\u2605\u2605";
  var CHEVRON_LEFT = '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var CHEVRON_RIGHT = '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var PAUSE_ICON = '<svg class="shm-tm-ico-pause" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false"><path d="M8 5v14M16 5v14" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>';
  var PLAY_ICON = '<svg class="shm-tm-ico-play" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false"><path d="M8 5l11 7-11 7z" fill="currentColor"/></svg>';
  var QUOTE_MARK = "\u201C";
  var pad2 = (n) => String(n).padStart(2, "0");
  function isoDay(ms) {
    const d = new Date(ms);
    return Number.isNaN(d.getTime()) ? "" : `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
  }
  function formatDate(ms, fmt, locale) {
    const d = new Date(ms);
    const iso = isoDay(ms);
    const opts = fmt === "long" ? { day: "numeric", month: "long", year: "numeric" } : fmt === "year" ? { year: "numeric" } : { month: "long", year: "numeric" };
    try {
      return { text: new Intl.DateTimeFormat(locale || "en-AU", opts).format(d), iso };
    } catch (e) {
      return { text: String(d.getFullYear()), iso };
    }
  }
  function starsHtml(rating) {
    const pct = Math.round(rating / 5 * 100);
    return `<span class="shm-tm-stars" role="img" aria-label="Rated ${esc(rating)} out of 5"><span class="shm-tm-stars-off" aria-hidden="true">${STAR_ROW}</span><span class="shm-tm-stars-on" aria-hidden="true" style="width:${pct}%">${STAR_ROW}</span></span>`;
  }
  function photoHtml(t, s, extra = "") {
    if (!s.showPhoto) return "";
    const cls = extra ? `shm-tm-photo ${extra}` : "shm-tm-photo";
    if (t.photo) {
      return `<span class="${cls}"><img src="${esc(t.photo)}" alt="" width="64" height="64" loading="lazy" decoding="async"></span>`;
    }
    return `<span class="${cls} shm-tm-initials" aria-hidden="true">${esc(initials(t.name))}</span>`;
  }
  function moreLabelHtml(text, name) {
    return `${esc(text)}<span class="shm-tm-sr"> from ${esc(name)}</span>`;
  }
  function consultantHtml(t, ctx) {
    if (!ctx.settings.showConsultant) return "";
    const c = ctx.consultants.get(t.consultantId);
    if (!c || !c.name) return "";
    const label = ctx.settings.consultantLabel ? `${esc(ctx.settings.consultantLabel)}: ` : "";
    const path = safeUrl(c.path);
    const name = ctx.settings.linkConsultant && path ? `<a class="shm-tm-consultant-link" href="${esc(path)}">${esc(c.name)}</a>` : esc(c.name);
    return `<span class="shm-tm-consultant">${label}${name}</span>`;
  }
  function personHtml(t, ctx) {
    const s = ctx.settings;
    const role = s.showPosition && t.position ? `<span class="shm-tm-role">${esc(t.position)}</span>` : "";
    const company = s.showCompany && t.company ? `<span class="shm-tm-company">${esc(t.company)}</span>` : "";
    let date = "";
    if (s.showDate && t.dateMs !== null) {
      const f = formatDate(t.dateMs, s.dateFormat, ctx.locale);
      date = `<time class="shm-tm-date"${f.iso ? ` datetime="${esc(f.iso)}"` : ""}>${esc(f.text)}</time>`;
    }
    return `<figcaption class="shm-tm-person">${photoHtml(t, s)}<span class="shm-tm-meta"><span class="shm-tm-name">${esc(t.name)}</span>${role}${company}${date}${consultantHtml(t, ctx)}</span></figcaption>`;
  }
  function cardHtml(t, index, ctx) {
    const s = ctx.settings;
    const textId = `${ctx.uid}-q${index}`;
    const mark = s.showQuoteMark ? `<span class="shm-tm-mark" aria-hidden="true">${QUOTE_MARK}</span>` : "";
    const stars = s.showRating && t.rating !== null ? starsHtml(t.rating) : "";
    const popup = s.readMore === "dialog" ? ' aria-haspopup="dialog"' : "";
    const more = s.readMore === "off" ? "" : `<button type="button" class="shm-tm-more"${popup} hidden>${moreLabelHtml(s.readMoreText, t.name)}</button>`;
    return `<figure class="shm-tm-card" data-index="${index}"><div class="shm-tm-body">${mark}${stars}<blockquote class="shm-tm-quote"><p class="shm-tm-text" id="${esc(textId)}">${esc(t.quote)}</p></blockquote>${more}</div>${personHtml(t, ctx)}</figure>`;
  }
  function tagFilterHtml(tags, s) {
    if (!s.showTagFilter || tags.length < 2) return "";
    const chip = (key, label, on) => `<button type="button" class="shm-tm-chip" data-tag="${esc(key)}" aria-pressed="${on ? "true" : "false"}">${esc(label)}</button>`;
    return `<div class="shm-tm-filter" role="group" aria-label="Filter testimonials">${chip("", s.allTagsLabel, true)}${tags.map((t) => chip(t.key, t.label, false)).join("")}</div>`;
  }
  function listHtml(items, ctx) {
    const cards = items.map((t, i) => `<li class="shm-tm-item" data-index="${i}">${cardHtml(t, i, ctx)}</li>`).join("");
    return `<ul class="shm-tm-grid" role="list">${cards}</ul>`;
  }
  function statusHtml() {
    return '<div class="shm-tm-sr shm-tm-status" role="status" aria-live="polite"></div>';
  }
  function loadMoreHtml(s) {
    return `<div class="shm-tm-more-wrap"><button type="button" class="shm-tm-loadmore" hidden>${esc(s.loadMoreText)}</button></div>`;
  }
  function carouselHtml(items, ctx) {
    const s = ctx.settings;
    const total = items.length;
    const slides = items.map(
      (t, i) => `<div class="shm-tm-slide" role="group" aria-roledescription="slide" aria-label="${i + 1} of ${total}" data-index="${i}">${cardHtml(t, i, ctx)}</div>`
    ).join("");
    const avatars = s.pagination === "avatars";
    const dots = s.pagination === "none" ? "" : `<div class="shm-tm-dots" role="group" aria-label="Choose testimonial">${items.map((t, i) => dotHtml(t, i, s, avatars)).join("")}</div>`;
    const prev = s.arrows ? `<button type="button" class="shm-tm-btn shm-tm-prev" aria-label="Previous testimonial">${CHEVRON_LEFT}</button>` : "";
    const next = s.arrows ? `<button type="button" class="shm-tm-btn shm-tm-next" aria-label="Next testimonial">${CHEVRON_RIGHT}</button>` : "";
    const pause = s.autoplay ? `<button type="button" class="shm-tm-btn shm-tm-pause" aria-label="Pause testimonials">${PAUSE_ICON}${PLAY_ICON}</button>` : "";
    return `<div class="shm-tm-carousel${avatars ? " has-avatars" : ""}" role="region" aria-roledescription="carousel" aria-label="${esc(s.ariaLabel)}"><div class="shm-tm-track" role="group" aria-label="Testimonial slides, use the arrow keys" tabindex="0" aria-live="off">${slides}</div><div class="shm-tm-controls">${prev}${dots}${next}${pause}</div></div>`;
  }
  function dotHtml(t, i, s, avatar) {
    const label = `Show testimonial ${i + 1}`;
    const inner = avatar ? photoHtml(t, { ...s, showPhoto: true }, "shm-tm-dot-photo") : "";
    return `<button type="button" class="shm-tm-dot${avatar ? " is-avatar" : ""}" data-page="${i}" data-name="${esc(t.name)}" aria-label="${esc(label)}">${inner}</button>`;
  }
  function dialogHtml(t, ctx, titleId, closeLabel) {
    const stars = ctx.settings.showRating && t.rating !== null ? starsHtml(t.rating) : "";
    return `<div class="shm-tm-dialog-backdrop" data-close></div><div class="shm-tm-dialog-panel" role="dialog" aria-modal="true" aria-labelledby="${esc(titleId)}" aria-describedby="${esc(titleId)}-q"><button type="button" class="shm-tm-dialog-close" aria-label="${esc(closeLabel)}">\xD7</button><span class="shm-tm-sr" id="${esc(titleId)}">Testimonial from ${esc(t.name)}</span><figure class="shm-tm-dialog-card">${stars}<blockquote class="shm-tm-dialog-quote"><p id="${esc(titleId)}-q">${esc(t.quote)}</p></blockquote>${personHtml(t, ctx)}</figure></div>`;
  }
  var SCHEMA_BEST = 5;
  function schemaJsonLd(items, s) {
    if (!s.schemaEnabled || !s.schemaBusinessName) return null;
    const rated = items.filter((t) => t.rating !== null);
    if (rated.length === 0) return null;
    const sum = rated.reduce((acc, t) => {
      var _a;
      return acc + ((_a = t.rating) != null ? _a : 0);
    }, 0);
    const graph = {
      "@context": "https://schema.org",
      "@type": s.schemaBusinessType,
      name: s.schemaBusinessName,
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: Math.round(sum / rated.length * 10) / 10,
        reviewCount: rated.length,
        bestRating: SCHEMA_BEST,
        worstRating: 1
      },
      review: rated.map((t) => ({
        "@type": "Review",
        author: { "@type": "Person", name: t.name },
        reviewBody: t.quote,
        ...t.dateMs !== null && isoDay(t.dateMs) ? { datePublished: isoDay(t.dateMs) } : {},
        reviewRating: { "@type": "Rating", ratingValue: t.rating, bestRating: SCHEMA_BEST, worstRating: 1 }
      }))
    };
    return JSON.stringify(graph).replace(/</g, "\\u003c").replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
  }

  // widgets/testimonials-2026/index.ts
  var COLLECTION = "Testimonials";
  var CONSULTANTS = "Consultants";
  var WIDGET_NAME = "testimonials-2026";
  var FALLBACK_CHARS_PER_LINE = 90;
  var GENERIC_ERROR = "The testimonials could not be loaded.";
  function nextUid() {
    var _a;
    const w = window;
    w.__shmTmCount = ((_a = w.__shmTmCount) != null ? _a : 0) + 1;
    return `shm-tm-${w.__shmTmCount}`;
  }
  function ensureShell(element) {
    let root = element.querySelector(".shm-tm");
    if (!root) {
      root = document.createElement("div");
      root.className = "shm-tm";
      element.appendChild(root);
    }
    let stage = root.querySelector(".shm-tm-stage");
    if (!stage) {
      stage = document.createElement("div");
      stage.className = "shm-tm-stage";
      root.appendChild(stage);
    }
    return { root, stage };
  }
  function applyShell(root, s) {
    var _a, _b;
    Array.from(root.classList).filter((c) => c.startsWith("is-layout-")).forEach((c) => root.classList.remove(c));
    root.classList.add(`is-layout-${s.layout}`);
    root.classList.remove("is-ready", "is-empty");
    root.hidden = false;
    root.style.setProperty("--shm-tm-cols-d", String(s.columnsDesktop));
    root.style.setProperty("--shm-tm-cols-t", String(s.columnsTablet));
    root.style.setProperty("--shm-tm-cols-m", String(s.columnsMobile));
    root.style.setProperty("--shm-tm-lines", s.quoteLines > 0 && s.readMore !== "off" ? String(s.quoteLines) : "none");
    const heading = root.querySelector(".shm-tm-heading");
    if (heading) {
      const wanted = `h${s.headingLevel}`;
      let h = heading;
      if (heading.tagName.toLowerCase() !== wanted) {
        h = document.createElement(wanted);
        h.className = heading.className;
        h.textContent = heading.textContent;
        heading.replaceWith(h);
      }
      h.hidden = !((_a = h.textContent) != null ? _a : "").trim();
    }
    const intro = root.querySelector(".shm-tm-intro");
    if (intro) intro.hidden = !((_b = intro.textContent) != null ? _b : "").trim();
  }
  function showEditorNote(root, stage, inEditor, message) {
    stage.innerHTML = inEditor ? `<div class="shm-tm-editor-note" role="note">Testimonials 2026: ${esc(message)}</div>` : "";
    root.classList.add("is-ready");
    if (!inEditor) {
      root.classList.add("is-empty");
      root.hidden = true;
    }
  }
  function emptyMessage(s, total) {
    if (total === 0) return "the Testimonials collection has no rows yet. Add testimonials in the Shazamme console.";
    const parts = [];
    if (s.tags.length) parts.push(`Tags "${s.tags.join(", ")}"`);
    if (s.consultantId) parts.push("the Consultant ID filter");
    return `no testimonials match ${parts.join(" and ") || "the current settings"}. Clear the filter to show all ${total}.`;
  }
  function measureOverflow(card, chars, lines) {
    if (lines <= 0) return false;
    const text = card.querySelector(".shm-tm-text");
    if (!text) return false;
    if (text.clientHeight > 0) return text.scrollHeight > text.clientHeight + 1;
    return chars > lines * FALLBACK_CHARS_PER_LINE;
  }
  var Instance = class {
    constructor(root, stage, s, items, consultants) {
      this.root = root;
      this.stage = stage;
      this.s = s;
      this.items = items;
      this.consultants = consultants;
      this.ac = new AbortController();
      this.visible = 0;
      this.activeTag = "";
      this.destroyed = false;
    }
    render() {
      var _a;
      const { root, stage, s, items } = this;
      const ctx = {
        settings: s,
        consultants: this.consultants,
        uid: nextUid(),
        locale: document.documentElement.lang || void 0
      };
      const carousel = s.layout === "slider" || s.layout === "featured";
      const filter = carousel ? "" : tagFilterHtml(distinctTags(items), s);
      const body = carousel ? carouselHtml(items, ctx) : `${filter}<div class="shm-tm-list" role="region" aria-label="${esc(s.ariaLabel)}">${listHtml(items, ctx)}${s.pageSize > 0 ? loadMoreHtml(s) : ""}${statusHtml()}</div>`;
      const ld = schemaJsonLd(items, s);
      stage.innerHTML = body + (ld ? `<script type="application/ld+json">${ld}<\/script>` : "");
      root.classList.add("is-ready");
      this.wire(ctx);
      if (carousel) {
        const el = stage.querySelector(".shm-tm-carousel");
        if (el) this.carousel = mountCarousel({ root: el, loop: s.loop, autoplayMs: s.autoplay ? s.autoplaySeconds * 1e3 : 0, reducedMotion: prefersReducedMotion() });
      } else {
        this.visible = s.pageSize > 0 ? s.pageSize : items.length;
        this.applyVisibility();
      }
      this.refreshReadMore();
      const fonts = document.fonts;
      void ((_a = fonts == null ? void 0 : fonts.ready) == null ? void 0 : _a.then(() => {
        if (!this.destroyed) this.refreshReadMore();
      }));
      if (typeof ResizeObserver === "function") {
        let last = stage.clientWidth;
        this.resizeObs = new ResizeObserver(() => {
          if (stage.clientWidth === last) return;
          last = stage.clientWidth;
          this.refreshReadMore();
        });
        this.resizeObs.observe(stage);
      }
    }
    wire(ctx) {
      const { stage } = this;
      const { signal } = this.ac;
      stage.addEventListener("click", (e) => {
        const target = e.target;
        const more = target.closest(".shm-tm-more");
        if (more) return this.onReadMore(more, ctx);
        const chip = target.closest(".shm-tm-chip");
        if (chip) return this.onChip(chip);
        if (target.closest(".shm-tm-loadmore")) this.showMore();
      }, { signal });
      stage.addEventListener("error", (e) => {
        var _a, _b, _c, _d, _e;
        const img = e.target;
        if (!(img instanceof HTMLImageElement)) return;
        const photo = img.parentElement;
        if (!photo) return;
        const name = (_e = (_d = (_b = (_a = img.closest(".shm-tm-card")) == null ? void 0 : _a.querySelector(".shm-tm-name")) == null ? void 0 : _b.textContent) != null ? _d : (_c = img.closest(".shm-tm-dot")) == null ? void 0 : _c.getAttribute("data-name")) != null ? _e : "";
        photo.classList.add("shm-tm-initials");
        photo.setAttribute("aria-hidden", "true");
        photo.textContent = initials(name);
      }, { capture: true, signal });
    }
    onReadMore(btn, ctx) {
      var _a, _b;
      const card = btn.closest(".shm-tm-card");
      if (!card) return;
      const item = this.items[Number(card.getAttribute("data-index"))];
      if (!item) return;
      if (this.s.readMore === "expand") {
        const open = card.classList.toggle("is-expanded");
        btn.innerHTML = moreLabelHtml(open ? this.s.readLessText : this.s.readMoreText, item.name);
        return;
      }
      (_a = this.dialog) == null ? void 0 : _a.close();
      const titleId = `${ctx.uid}-dialog`;
      (_b = this.carousel) == null ? void 0 : _b.hold(true);
      this.dialog = openDialog(dialogHtml(item, ctx, titleId, "Close testimonial"), {
        trigger: btn,
        fallback: this.stage,
        beforeFocus: () => {
          var _a2;
          return (_a2 = this.carousel) == null ? void 0 : _a2.reveal(this.items.indexOf(item));
        },
        onClosed: () => {
          var _a2;
          this.dialog = void 0;
          (_a2 = this.carousel) == null ? void 0 : _a2.hold(false);
        }
      });
    }
    onChip(chip) {
      var _a;
      this.activeTag = (_a = chip.getAttribute("data-tag")) != null ? _a : "";
      this.stage.querySelectorAll(".shm-tm-chip").forEach((c) => c.setAttribute("aria-pressed", c === chip ? "true" : "false"));
      this.visible = this.s.pageSize > 0 ? this.s.pageSize : this.items.length;
      this.applyVisibility(true);
    }
    showMore() {
      var _a;
      const before = this.shownRows().length;
      this.visible += this.s.pageSize;
      this.applyVisibility(true);
      const fresh = (_a = this.shownRows()[before]) == null ? void 0 : _a.querySelector(".shm-tm-card");
      if (!fresh) return;
      fresh.setAttribute("tabindex", "-1");
      fresh.focus();
    }
    shownRows() {
      return Array.from(this.stage.querySelectorAll(".shm-tm-item")).filter((row) => !row.hidden);
    }
    applyVisibility(announce = false) {
      const rows = Array.from(this.stage.querySelectorAll(".shm-tm-item"));
      let matched = 0;
      rows.forEach((row) => {
        var _a;
        const item = this.items[Number(row.getAttribute("data-index"))];
        const matches = !this.activeTag || ((_a = item == null ? void 0 : item.tags.includes(this.activeTag)) != null ? _a : false);
        const show = matches && matched < this.visible;
        if (matches) matched++;
        row.hidden = !show;
      });
      const btn = this.stage.querySelector(".shm-tm-loadmore");
      if (btn) btn.hidden = matched <= this.visible;
      const status = this.stage.querySelector(".shm-tm-status");
      if (status && announce) status.textContent = `Showing ${Math.min(matched, this.visible)} of ${matched} testimonials`;
      this.refreshReadMore();
    }
    refreshReadMore() {
      if (this.s.readMore === "off") return;
      this.stage.querySelectorAll(".shm-tm-card").forEach((card) => {
        var _a;
        const btn = card.querySelector(".shm-tm-more");
        if (!btn) return;
        if (card.classList.contains("is-expanded")) {
          btn.hidden = false;
          return;
        }
        const item = this.items[Number(card.getAttribute("data-index"))];
        btn.hidden = !measureOverflow(card, (_a = item == null ? void 0 : item.quote.length) != null ? _a : 0, this.s.quoteLines || 1);
      });
    }
    destroy() {
      var _a, _b, _c;
      this.destroyed = true;
      this.ac.abort();
      (_a = this.carousel) == null ? void 0 : _a.destroy();
      (_b = this.resizeObs) == null ? void 0 : _b.disconnect();
      (_c = this.dialog) == null ? void 0 : _c.close(false);
      this.stage.innerHTML = "";
    }
  };
  var runs = /* @__PURE__ */ new WeakMap();
  async function testimonials2026(ctx) {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    const element = ctx == null ? void 0 : ctx.element;
    if (!element || typeof element.querySelector !== "function") return;
    (_a = element.__shmTmDestroy) == null ? void 0 : _a.call(element);
    element.__shmTmDestroy = void 0;
    const data = (_b = ctx.data) != null ? _b : {};
    const inEditor = Boolean(data.inEditor);
    const parsed = readSettings(data.config);
    const s = prefersReducedMotion() ? { ...parsed, autoplay: false } : parsed;
    const { root, stage } = ensureShell(element);
    applyShell(root, s);
    stage.innerHTML = "";
    const run = ((_c = runs.get(element)) != null ? _c : 0) + 1;
    runs.set(element, run);
    const current = () => runs.get(element) === run;
    try {
      const sdk = (_d = ctx.shazamme) != null ? _d : window.shazamme;
      if (!sdk) throw new Error("The Shazamme SDK did not load.");
      const siteId = s.siteId || String((_e = data.siteId) != null ? _e : "");
      await Promise.resolve((_f = sdk.ready) == null ? void 0 : _f.call(sdk, siteId, data.page));
      (_g = sdk.register) == null ? void 0 : _g.call(sdk, WIDGET_NAME, data);
      const wantsConsultants = s.showConsultant;
      const [rows, consultantRows] = await Promise.all([
        loadRows(sdk, COLLECTION, siteId, inEditor),
        wantsConsultants ? loadRows(sdk, CONSULTANTS, siteId, inEditor).catch(() => []) : Promise.resolve([])
      ]);
      if (!current()) return;
      const items = selectTestimonials(rows, s);
      if (items.length === 0) {
        const total = Array.isArray(rows) ? rows.length : 0;
        showEditorNote(root, stage, inEditor, emptyMessage(s, total));
        return;
      }
      const instance = new Instance(root, stage, s, items, normaliseConsultants(consultantRows));
      element.__shmTmDestroy = () => instance.destroy();
      instance.render();
    } catch (err) {
      if (!current()) return;
      console.error("[testimonials-2026]", err);
      (_h = element.__shmTmDestroy) == null ? void 0 : _h.call(element);
      element.__shmTmDestroy = void 0;
      showEditorNote(root, stage, inEditor, err instanceof Error && err.message ? err.message : GENERIC_ERROR);
    }
  }
  return __toCommonJS(index_exports);
})();
(function(){
  var reg = (typeof window !== 'undefined' && window.__shazWidgetExport) || {};
  var controller = reg.default || reg;
  if (typeof window !== 'undefined') {
    window.ShazammeWidget = window.ShazammeWidget || {};
    window.ShazammeWidget["testimonials-2026"] = controller;
    window.__shazWidgetExport = void 0;
  }
})();
